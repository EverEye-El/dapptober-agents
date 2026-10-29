// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import '@openzeppelin/contracts/utils/cryptography/EIP712.sol';import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
/// @notice Signed fixed-price checkout; funds remain reserved until acceptance, timeout or arbiter resolution.
contract AfterhoursCheckout is EIP712,ReentrancyGuard {
 using SafeERC20 for IERC20;
 IERC20 public immutable token;address public immutable quoteSigner;address public immutable arbiter;
 bytes32 public constant QUOTE_TYPEHASH=keccak256('Quote(bytes32 id,bytes32 itemHash,address buyer,address seller,uint256 amount,uint256 expiry)');
 struct Quote{bytes32 id;bytes32 itemHash;address buyer;address seller;uint256 amount;uint256 expiry;}
 struct Order{address buyer;address seller;uint256 amount;uint256 releaseAt;uint8 status;bytes32 itemHash;bytes32 issue;}
 mapping(bytes32=>Order)public orders;uint256 public reserved;
 event Purchased(bytes32 indexed id,address indexed buyer,address indexed seller,uint256 amount,bytes32 itemHash);event Refunded(bytes32 indexed id,uint256 amount);event Released(bytes32 indexed id,uint256 amount);event Disputed(bytes32 indexed id,bytes32 issue);
 constructor(address asset,address signer,address judge)EIP712('AfterhoursCheckout','1'){require(asset.code.length>0&&signer!=address(0)&&judge!=address(0),'config');token=IERC20(asset);quoteSigner=signer;arbiter=judge;}
 function buy(Quote calldata q,bytes calldata signature)external nonReentrant{require(msg.sender==q.buyer&&q.seller!=address(0)&&q.seller!=q.buyer,'buyer');require(q.id!=bytes32(0)&&q.amount>0&&q.amount<=1000e6&&orders[q.id].status==0,'order');require(q.expiry>=block.timestamp&&q.expiry<=block.timestamp+15 minutes,'expiry');require(ECDSA.recover(_hashTypedDataV4(keccak256(abi.encode(QUOTE_TYPEHASH,q.id,q.itemHash,q.buyer,q.seller,q.amount,q.expiry))),signature)==quoteSigner,'quote');uint256 beforeBalance=token.balanceOf(address(this));token.safeTransferFrom(msg.sender,address(this),q.amount);require(token.balanceOf(address(this))-beforeBalance==q.amount,'exact token');orders[q.id]=Order(q.buyer,q.seller,q.amount,block.timestamp+2 days,1,q.itemHash,0);reserved+=q.amount;emit Purchased(q.id,q.buyer,q.seller,q.amount,q.itemHash);}
 function dispute(bytes32 id,bytes32 issue)external{Order storage o=orders[id];require(msg.sender==o.buyer&&o.status==1&&block.timestamp<o.releaseAt&&issue!=bytes32(0),'dispute');o.status=2;o.issue=issue;emit Disputed(id,issue);}
 function refund(bytes32 id)external nonReentrant{Order storage o=orders[id];require((msg.sender==o.seller||msg.sender==arbiter)&&(o.status==1||o.status==2),'refund');_pay(id,o,true);}
 function accept(bytes32 id)external nonReentrant{Order storage o=orders[id];require(msg.sender==o.buyer&&o.status==1,'accept');_pay(id,o,false);}
 function release(bytes32 id)external nonReentrant{Order storage o=orders[id];require(msg.sender==o.seller&&o.status==1&&block.timestamp>=o.releaseAt,'release');_pay(id,o,false);}
 function resolve(bytes32 id,bool refundBuyer)external nonReentrant{Order storage o=orders[id];require(msg.sender==arbiter&&o.status==2,'arbiter');_pay(id,o,refundBuyer);}
 function _pay(bytes32 id,Order storage o,bool refundBuyer)internal{o.status=refundBuyer?4:3;reserved-=o.amount;token.safeTransfer(refundBuyer?o.buyer:o.seller,o.amount);if(refundBuyer)emit Refunded(id,o.amount);else emit Released(id,o.amount);}
}
