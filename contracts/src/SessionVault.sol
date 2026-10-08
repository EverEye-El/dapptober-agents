// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

/// An ERC20 policy custody extension. Only scoped transfer is exposed to the agent.
/// Owner may be a thirdweb ERC4337 account. Signatures support EOA and ERC1271 owners.
contract SessionVault is Ownable, EIP712, ReentrancyGuard {
    using SafeERC20 for IERC20;
    address public agent;
    uint256 public expires;
    uint256 public dailyCap;
    uint256 public approvalThreshold;
    uint256 public maxTransaction;
    mapping(bytes32 => bool) public executed;
    uint256 public nonce;
    uint256 public epoch;
    bool public paused = true;
    mapping(address => bool) public tokens;
    mapping(address => bool) public recipients;
    mapping(uint256 => mapping(address => uint256)) public spent;
    bytes32 public constant TRANSFER_TYPEHASH = keccak256("Transfer(address token,address recipient,uint256 amount,uint256 nonce,uint256 deadline,uint256 epoch,bool requiresApproval,bytes32 requestId)");
    event SessionGranted(address indexed agent, uint256 cap, uint256 expiry, uint256 epoch);
    event SessionRevoked(uint256 epoch);
    event Transferred(address indexed token, address indexed recipient, uint256 amount, uint256 nonce);
    constructor(address owner_) Ownable(owner_) EIP712("DapptoberSession", "1") {}
    function grant(address agent_, uint256 cap, uint256 maxTx, uint256 threshold, uint256 expiry) external onlyOwner {
        require(agent_ != address(0) && cap > 0 && maxTx > 0 && maxTx <= cap && expiry > block.timestamp, "invalid session");
        agent = agent_; dailyCap = cap; maxTransaction = maxTx; approvalThreshold = threshold; expires = expiry; paused = false; ++epoch;
        emit SessionGranted(agent_, cap, expiry, epoch);
    }
    function allowToken(address token, bool allow) external onlyOwner { tokens[token] = allow; }
    function allowRecipient(address recipient, bool allow) external onlyOwner { require(recipient != address(0), "zero recipient"); recipients[recipient] = allow; }
    function revoke() external onlyOwner { paused = true; ++epoch; emit SessionRevoked(epoch); }
    function digest(address token, address recipient, uint256 amount, uint256 deadline, bool requiresApproval, bytes32 requestId) public view returns(bytes32) {
        return _hashTypedDataV4(keccak256(abi.encode(TRANSFER_TYPEHASH, token, recipient, amount, nonce, deadline, epoch, requiresApproval, requestId)));
    }
    function transfer(address token, address recipient, uint256 amount, uint256 deadline, bool requiresApproval, bytes32 requestId, bytes calldata agentSignature, bytes calldata ownerSignature) external nonReentrant {
        require(!paused && block.timestamp < expires && block.timestamp <= deadline, "inactive session");
        require(tokens[token] && recipients[recipient] && amount > 0, "not allowed");
        uint256 day = block.timestamp / 1 days;
        require(spent[day][token] + amount <= dailyCap, "daily cap");
        require(amount <= maxTransaction, "maximum transaction");
        require(!executed[requestId], "request replay");
        bytes32 d = digest(token, recipient, amount, deadline, requiresApproval, requestId);
        require(SignatureChecker.isValidSignatureNow(agent, d, agentSignature), "agent signature");
        if (requiresApproval || amount > approvalThreshold) require(SignatureChecker.isValidSignatureNow(owner(), d, ownerSignature), "owner cosign");
        executed[requestId] = true; spent[day][token] += amount; ++nonce;
        IERC20(token).safeTransfer(recipient, amount);
        emit Transferred(token, recipient, amount, nonce - 1);
    }
    function recover(address token, uint256 amount) external onlyOwner nonReentrant { IERC20(token).safeTransfer(owner(), amount); }
}
