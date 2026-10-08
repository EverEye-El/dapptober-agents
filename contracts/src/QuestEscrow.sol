// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
contract QuestEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;
    enum Status {Open, Claimed, Submitted, Disputed, Paid, Refunded}
    struct Quest { address creator; address worker; address validator; uint256 reward; uint256 deadline; uint256 reviewEnd; Status status; bytes32 workHash; string brief; string resultURI; }
    IERC20 public immutable usdc;
    uint256 public count;
    mapping(uint256 => Quest) public quests;
    uint256 public constant REVIEW_PERIOD = 2 days;
    event Created(uint256 indexed id, address indexed creator, uint256 reward);
    event Changed(uint256 indexed id, Status status, address worker, bytes32 workHash);
    constructor(address token) {require(token != address(0), "zero token"); usdc = IERC20(token);}
    function create(string calldata brief, uint256 reward, uint256 deadline, address validator) external nonReentrant returns(uint256 id) {
        require(reward > 0 && deadline > block.timestamp && bytes(brief).length > 0, "invalid quest");
        id = ++count; quests[id] = Quest(msg.sender, address(0), validator, reward, deadline, 0, Status.Open, bytes32(0), brief, "");
        usdc.safeTransferFrom(msg.sender, address(this), reward); emit Created(id, msg.sender, reward);
    }
    function claim(uint256 id) external { Quest storage q = quests[id]; require(q.creator != address(0) && q.status == Status.Open && block.timestamp < q.deadline && msg.sender != q.creator, "not claimable"); q.worker = msg.sender; q.status = Status.Claimed; emit Changed(id,q.status,q.worker,q.workHash); }
    function submit(uint256 id, bytes32 workHash, string calldata uri) external { Quest storage q = quests[id]; require(q.status == Status.Claimed && msg.sender == q.worker && block.timestamp <= q.deadline && workHash != 0 && bytes(uri).length > 0, "not submittable"); q.workHash = workHash; q.resultURI = uri; q.status = Status.Submitted; q.reviewEnd = block.timestamp + REVIEW_PERIOD; emit Changed(id,q.status,q.worker,q.workHash); }
    function approve(uint256 id) external nonReentrant { Quest storage q = quests[id]; require(q.status == Status.Submitted && (msg.sender == q.creator || msg.sender == q.validator), "not approver"); _pay(id,q); }
    function dispute(uint256 id) external { Quest storage q = quests[id]; require(q.status == Status.Submitted && msg.sender == q.creator && block.timestamp <= q.reviewEnd, "not disputable"); q.status = Status.Disputed; q.reviewEnd = block.timestamp + REVIEW_PERIOD; emit Changed(id,q.status,q.worker,q.workHash); }
    function resolve(uint256 id, bool accept) external nonReentrant { Quest storage q = quests[id]; require(q.status == Status.Disputed && q.validator != address(0) && msg.sender == q.validator, "not validator"); if(accept) _pay(id,q); else _refund(id,q); }
    function timeout(uint256 id) external nonReentrant { Quest storage q = quests[id]; require(q.creator != address(0), "unknown quest"); if(q.status == Status.Submitted) { require(block.timestamp > q.reviewEnd, "review pending"); _pay(id,q); } else if(q.status == Status.Open || q.status == Status.Claimed) { require(block.timestamp > q.deadline, "deadline pending"); _refund(id,q); } else { require(q.status == Status.Disputed && block.timestamp > q.reviewEnd, "not expired"); _refund(id,q); } }
    function _pay(uint256 id, Quest storage q) private {q.status = Status.Paid; usdc.safeTransfer(q.worker,q.reward); emit Changed(id,q.status,q.worker,q.workHash);}
    function _refund(uint256 id, Quest storage q) private {q.status = Status.Refunded; usdc.safeTransfer(q.creator,q.reward); emit Changed(id,q.status,q.worker,q.workHash);}
}
