// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20,IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
/// @notice Fixed, funded human rewards. The verifier is a trust boundary: it verifies World ID offchain.
contract HumanCheckpointRewards is Ownable,EIP712,ReentrancyGuard {
 using SafeERC20 for IERC20;
 IERC20 public immutable token;address public immutable verifier;bytes32 public immutable campaign;uint256 public immutable reward;bool public paused;
 mapping(bytes32=>bool) public claimed;
 bytes32 constant CLAIM_TYPEHASH=keccak256("Claim(bytes32 campaign,bytes32 person,address recipient,uint64 deadline)");
 event Claimed(bytes32 indexed person,address indexed recipient,uint256 amount);
 event PauseChanged(bool paused);
 constructor(address owner_,address token_,address verifier_,bytes32 campaign_,uint256 reward_) Ownable(owner_) EIP712("HumanCheckpointRewards","1") {require(verifier_!=address(0)&&campaign_!=bytes32(0)&&reward_>0,"configuration");require(IERC20Metadata(token_).decimals()==6,"six decimal token");token=IERC20(token_);verifier=verifier_;campaign=campaign_;reward=reward_;}
 function setPaused(bool value) external onlyOwner {paused=value;emit PauseChanged(value);}
 function claim(bytes32 person,address recipient,uint64 deadline,bytes calldata signature) external nonReentrant {
  require(!paused,"paused");require(person!=bytes32(0)&&recipient!=address(0)&&!claimed[person],"invalid or claimed");require(deadline>=block.timestamp&&deadline<=block.timestamp+10 minutes,"expiry");
  bytes32 digest=_hashTypedDataV4(keccak256(abi.encode(CLAIM_TYPEHASH,campaign,person,recipient,deadline)));
  require(ECDSA.recover(digest,signature)==verifier,"invalid verifier");claimed[person]=true;
  uint256 beforeBalance=token.balanceOf(recipient);token.safeTransfer(recipient,reward);require(token.balanceOf(recipient)==beforeBalance+reward,"exact reward");emit Claimed(person,recipient,reward);
 }
 // No administrative withdrawal and no variable-sized vouchers. Fund only the intended campaign budget.
}
