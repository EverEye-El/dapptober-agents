// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
/// @notice A public puzzle, not a secret oracle. AI has no payout or key authority.
contract HauntedContract is Ownable, ReentrancyGuard {
 using SafeERC20 for IERC20;
 IERC20 public immutable token; uint256 public immutable reward; uint256 public immutable bribe; uint256 public immutable ends;
 bytes32[3] public answers; uint256 public prizeBalance;uint256 public reserved;uint256 public bribes;bool public paused;
 struct Seal{bytes32 hash;uint256 blockNumber;}
 mapping(address=>Seal) public seals;mapping(address=>uint8) public keys;mapping(address=>bool) public claimed;mapping(address=>uint256) public credit;
 event Committed(address indexed player,bytes32 hash);event KeyEarned(address indexed player,uint8 room,uint8 move);event Paid(address indexed player,uint256 amount);
 constructor(address admin,address asset,bytes32[3] memory solutions,uint256 prize,uint256 toll,uint256 deadline) Ownable(admin){require(asset.code.length>0&&prize>0&&toll>0&&deadline>block.timestamp,'config');token=IERC20(asset);answers=solutions;reward=prize;bribe=toll;ends=deadline;}
 function fund(uint256 amount) external nonReentrant {uint256 beforeBalance=token.balanceOf(address(this));token.safeTransferFrom(msg.sender,address(this),amount);require(token.balanceOf(address(this))-beforeBalance==amount,'exact token');prizeBalance+=amount;}
 function setPaused(bool value)external onlyOwner{paused=value;}
 function commitment(address player,uint8 room,uint8 move,bytes32 proof,bytes32 salt) public view returns(bytes32){return keccak256(abi.encode(block.chainid,address(this),player,room,move,proof,salt));}
 function commit(bytes32 hash)external{require(!paused&&block.timestamp<ends,'closed');require(hash!=bytes32(0),'hash');Seal memory old=seals[msg.sender];require(old.hash==bytes32(0)||block.number>old.blockNumber+80,'active seal');seals[msg.sender]=Seal(hash,block.number);emit Committed(msg.sender,hash);}
 function reveal(uint8 room,uint8 move,bytes32 proof,bytes32 salt)external nonReentrant{require(!paused&&block.timestamp<ends,'closed');require(room<3&&move<3,'move');Seal memory seal=seals[msg.sender];require(seal.hash!=bytes32(0)&&block.number>seal.blockNumber&&block.number<=seal.blockNumber+80,'window');require(seal.hash==commitment(msg.sender,room,move,proof,salt),'binding');require((keys[msg.sender]&(uint8(1)<<room))==0,'duplicate');
 if(move==0)require(proof==answers[room],'answer');else if(move==1)require(room==1&&proof==bytes32(uint256(13)),'trick');else{require(room==2,'bribe room');uint256 balance=token.balanceOf(address(this));token.safeTransferFrom(msg.sender,address(this),bribe);require(token.balanceOf(address(this))-balance==bribe,'exact token');bribes+=bribe;}
 uint8 next=keys[msg.sender]|(uint8(1)<<room);if(next==7){require(prizeBalance>=reserved+reward,'empty chest');reserved+=reward;credit[msg.sender]=reward;}delete seals[msg.sender];keys[msg.sender]=next;emit KeyEarned(msg.sender,room,move);}
 // Claims stay available during pause and after season expiry. Reserved winnings never return to the house.
 function claim()external nonReentrant{uint256 amount=credit[msg.sender];require(amount>0&&!claimed[msg.sender],'locked');claimed[msg.sender]=true;credit[msg.sender]=0;reserved-=amount;prizeBalance-=amount;token.safeTransfer(msg.sender,amount);emit Paid(msg.sender,amount);}
 function withdrawBribes(address to)external onlyOwner nonReentrant{require(to!=address(0),'recipient');uint256 amount=bribes;bribes=0;token.safeTransfer(to,amount);}
 function recoverUnwon(address to)external onlyOwner nonReentrant{require(block.timestamp>=ends&&to!=address(0),'season');uint256 amount=prizeBalance-reserved;prizeBalance-=amount;token.safeTransfer(to,amount);}
}
