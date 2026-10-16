// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
interface IBourseRegistry {function getAgentWallet(uint256 id) external view returns(address);}
/// Fixed USDC escrow; agents can sign offers/deliveries, but only the buyer funds and approves payment.
contract BotBourse is EIP712, ReentrancyGuard {
 using SafeERC20 for IERC20;
 struct Offer {bytes32 id;address buyer;address seller;uint256 buyerId;uint256 sellerId;bytes32 taskHash;uint256 amount;uint256 deliverBy;uint256 expires;}
 struct Deal {address buyer;address seller;uint256 amount;uint256 deliverBy;uint256 deliveredAt;uint256 disputedAt;bytes32 taskHash;bytes32 outputHash;uint8 status;}
 IERC20 public immutable usdc;IBourseRegistry public immutable registry;address public immutable arbiter;uint256 public immutable maxDeal;uint256 public constant REVIEW=1 days;uint256 public constant ARBITRATION=7 days;
 bool public paused;mapping(bytes32=>Deal) public deals;
 bytes32 constant OFFER_TYPE=keccak256("Offer(bytes32 id,address buyer,address seller,uint256 buyerId,uint256 sellerId,bytes32 taskHash,uint256 amount,uint256 deliverBy,uint256 expires)");
 bytes32 constant DELIVERY_TYPE=keccak256("Delivery(bytes32 id,bytes32 outputHash)");
 event Funded(bytes32 indexed id,address indexed buyer,address indexed seller,uint256 amount);event Delivered(bytes32 indexed id,bytes32 outputHash);event Disputed(bytes32 indexed id);event Settled(bytes32 indexed id,uint256 sellerAmount,uint256 buyerAmount);
 constructor(address token,address identity,address resolver,uint256 cap) EIP712("BotBourse","1"){require(token!=address(0)&&identity!=address(0)&&resolver!=address(0)&&cap>0,"configuration");usdc=IERC20(token);registry=IBourseRegistry(identity);arbiter=resolver;maxDeal=cap;}
 function setPaused(bool p) external {require(msg.sender==arbiter,"arbiter only");paused=p;}
 function offerDigest(Offer calldata o) public view returns(bytes32){return _hashTypedDataV4(keccak256(abi.encode(OFFER_TYPE,o)));}
 function deliveryDigest(bytes32 id,bytes32 outputHash) public view returns(bytes32){return _hashTypedDataV4(keccak256(abi.encode(DELIVERY_TYPE,id,outputHash)));}
 function open(Offer calldata o,bytes calldata signature) external nonReentrant {require(!paused,"paused");require(msg.sender==o.buyer&&o.buyer!=o.seller&&o.seller!=address(0),"buyer only");require(o.id!=0&&deals[o.id].status==0&&o.taskHash!=0,"duplicate or invalid");require(o.amount>0&&o.amount<=maxDeal,"amount cap");require(block.timestamp<o.expires&&o.expires<=block.timestamp+1 hours&&o.deliverBy>block.timestamp&&o.deliverBy<=block.timestamp+7 days,"deadline");require(registry.getAgentWallet(o.buyerId)==o.buyer&&registry.getAgentWallet(o.sellerId)==o.seller,"registry wallet");require(SignatureChecker.isValidSignatureNow(o.seller,offerDigest(o),signature),"seller signature");deals[o.id]=Deal(o.buyer,o.seller,o.amount,o.deliverBy,0,0,o.taskHash,0,1);usdc.safeTransferFrom(o.buyer,address(this),o.amount);emit Funded(o.id,o.buyer,o.seller,o.amount);}
 function deliver(bytes32 id,bytes32 outputHash,bytes calldata signature) external {Deal storage d=deals[id];require(d.status==1&&block.timestamp<=d.deliverBy&&outputHash!=0,"not deliverable");require(SignatureChecker.isValidSignatureNow(d.seller,deliveryDigest(id,outputHash),signature),"seller signature");d.outputHash=outputHash;d.deliveredAt=block.timestamp;d.status=2;emit Delivered(id,outputHash);}
 function confirm(bytes32 id) external nonReentrant {Deal storage d=deals[id];require(d.status==2&&msg.sender==d.buyer,"buyer delivery review");_settle(id,10000);}
 function dispute(bytes32 id) external {Deal storage d=deals[id];require(d.status==2&&msg.sender==d.buyer&&block.timestamp<d.deliveredAt+REVIEW,"review window");d.status=3;d.disputedAt=block.timestamp;emit Disputed(id);}
 function refund(bytes32 id) external nonReentrant {Deal storage d=deals[id];require(d.status==1&&block.timestamp>d.deliverBy,"not refundable");_settle(id,0);}
 function release(bytes32 id) external nonReentrant {Deal storage d=deals[id];require(d.status==2&&block.timestamp>=d.deliveredAt+REVIEW,"review window");_settle(id,10000);}
 function resolve(bytes32 id,uint256 sellerBps) external nonReentrant {require(msg.sender==arbiter&&deals[id].status==3&&sellerBps<=10000,"arbiter dispute only");_settle(id,sellerBps);}
 function timeout(bytes32 id) external nonReentrant {Deal storage d=deals[id];require(d.status==3&&block.timestamp>=d.disputedAt+ARBITRATION,"arbitration window");_settle(id,5000);}
 function _settle(bytes32 id,uint256 bps) private {Deal storage d=deals[id];d.status=4;uint256 sellerAmount=d.amount*bps/10000;uint256 buyerAmount=d.amount-sellerAmount;if(sellerAmount>0)usdc.safeTransfer(d.seller,sellerAmount);if(buyerAmount>0)usdc.safeTransfer(d.buyer,buyerAmount);emit Settled(id,sellerAmount,buyerAmount);}
}
