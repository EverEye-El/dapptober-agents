// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
interface IForecastOracle {
 function getMinimumBond(address currency) external view returns(uint256);
 function assertTruth(bytes calldata claim,address asserter,address callbackRecipient,address escalationManager,uint64 liveness,address currency,uint256 bond,bytes32 identifier,bytes32 domainId) external returns(bytes32);
 function settleAssertion(bytes32 assertionId) external;
}
/// @notice Small, fully collateralized binary pari-mutuel markets. Stakes are locked until settlement.
/// @dev Odds are pool ratios, not guaranteed execution prices. No fees, leverage or owner withdrawal.
contract ForecastColosseum is Ownable, ReentrancyGuard {
 using SafeERC20 for IERC20;
 IERC20 public immutable usdc; IForecastOracle public immutable oracle;
 bytes32 public immutable identifier; uint64 public immutable liveness;
 bool public paused; uint256 public count;
 struct Market {string question; string rules; uint64 close; uint256 yesPool; uint256 noPool; bytes32 assertionId; uint8 proposed; uint8 outcome; bool disputed;}
 struct Position {uint256 yes;uint256 no;uint16 probability;bool agent;bool claimed;}
 struct Risk {bool registered;bool paused;uint256 perTrade;uint256 perMarket;uint256 daily;}
 mapping(uint256=>Market) public markets;
 mapping(uint256=>mapping(address=>Position)) public positions;
 mapping(uint256=>address[]) private traders;
 mapping(address=>Risk) public risks;
 mapping(address=>mapping(uint256=>uint256)) public spent;
 mapping(bytes32=>uint256) public assertionMarket;
 event Created(uint256 indexed id,string question,string rules,uint64 close);
 event Traded(uint256 indexed id,address indexed trader,bool yes,uint256 amount,uint16 probability,bool agent);
 event Asserted(uint256 indexed id,bytes32 indexed assertionId,uint8 outcome);
 event Resolved(uint256 indexed id,uint8 outcome);
 event Claimed(uint256 indexed id,address indexed trader,uint256 amount);
 constructor(address owner_,address token_,address oracle_,uint64 liveness_,bytes32 identifier_) Ownable(owner_) {
  require(token_.code.length>0&&oracle_.code.length>0,"contracts required");
  require(IERC20Metadata(token_).decimals()==6,"six decimal USDC required");
  require(liveness_>=60&&liveness_<=7 days&&identifier_!=bytes32(0),"oracle configuration");
  usdc=IERC20(token_);oracle=IForecastOracle(oracle_);liveness=liveness_;identifier=identifier_;
 }
 function setPaused(bool value) external onlyOwner {paused=value;}
 // Registration is permanent so paused/revoked agents cannot evade caps via the human lane.
 function setRisk(address trader,uint256 perTrade,uint256 perMarket,uint256 daily,bool stop) external onlyOwner {
  require(trader!=address(0)&&perTrade>0&&perTrade<=perMarket&&perTrade<=daily,"risk limits");
  risks[trader]=Risk(true,stop,perTrade,perMarket,daily);
 }
 function create(string calldata question,string calldata rules,uint64 close) external onlyOwner returns(uint256 id){
  require(!paused&&count<100,"paused or market limit");
  require(bytes(question).length>0&&bytes(question).length<=240&&bytes(rules).length>0&&bytes(rules).length<=2000&&close>block.timestamp&&close<=block.timestamp+90 days,"market parameters");
  id=++count;Market storage m=markets[id];m.question=question;m.rules=rules;m.close=close;emit Created(id,question,rules,close);
 }
 function participants(uint256 id) external view returns(address[] memory){return traders[id];}
 function trade(uint256 id,bool yes,uint256 amount,uint16 probability) external nonReentrant {
  Market storage m=markets[id];require(!paused&&m.close>block.timestamp&&m.outcome==0,"market closed");
  require(amount>0&&probability<=10000,"trade parameters");Risk memory r=risks[msg.sender];Position storage p=positions[id][msg.sender];
  if(r.registered){require(!r.paused&&amount<=r.perTrade&&p.yes+p.no+amount<=r.perMarket&&spent[msg.sender][block.timestamp/1 days]+amount<=r.daily,"agent risk limit");spent[msg.sender][block.timestamp/1 days]+=amount;}
  if(p.yes+p.no==0){require(traders[id].length<256,"participant limit");traders[id].push(msg.sender);p.agent=r.registered;}
  // A human position cannot be relabelled midway through its forecasting sample.
  require(p.agent==r.registered,"lane changed");
  uint256 beforeBalance=usdc.balanceOf(address(this));usdc.safeTransferFrom(msg.sender,address(this),amount);require(usdc.balanceOf(address(this))==beforeBalance+amount,"unsupported token fee");
  if(yes){p.yes+=amount;m.yesPool+=amount;}else{p.no+=amount;m.noPool+=amount;}p.probability=probability;emit Traded(id,msg.sender,yes,amount,probability,r.registered);
 }
 function assertOutcome(uint256 id,uint8 outcome,string calldata evidence) external nonReentrant returns(bytes32 assertionId){
  Market storage m=markets[id];require(m.close>0&&block.timestamp>=m.close&&m.outcome==0&&m.assertionId==bytes32(0),"not assertable");
  require(outcome>=1&&outcome<=3&&bytes(evidence).length>0&&bytes(evidence).length<=4000,"assertion parameters");
  uint256 bond=oracle.getMinimumBond(address(usdc));usdc.safeTransferFrom(msg.sender,address(this),bond);usdc.forceApprove(address(oracle),bond);
  bytes memory claimBytes=abi.encodePacked("Forecast Colosseum market ",StringsLike.uintString(id)," at ",StringsLike.addressString(address(this))," on chain ",StringsLike.uintString(block.chainid),". Question: ",m.question,". Trading cutoff UNIX seconds: ",StringsLike.uintString(m.close),". Binding resolution rules: ",m.rules,". Outcome: ",outcome==1?"YES":outcome==2?"NO":"INVALID", ". Evidence: ",evidence);
  assertionId=oracle.assertTruth(claimBytes,msg.sender,address(this),address(0),liveness,address(usdc),bond,identifier,bytes32(0));
  require(assertionId!=bytes32(0)&&assertionMarket[assertionId]==0,"invalid assertion");m.assertionId=assertionId;m.proposed=outcome;m.disputed=false;assertionMarket[assertionId]=id;emit Asserted(id,assertionId,outcome);
 }
 function assertionDisputedCallback(bytes32 assertionId) external {require(msg.sender==address(oracle),"oracle only");uint256 id=assertionMarket[assertionId];require(id>0&&markets[id].assertionId==assertionId,"unknown assertion");markets[id].disputed=true;}
 function assertionResolvedCallback(bytes32 assertionId,bool truth) external {
  require(msg.sender==address(oracle),"oracle only");uint256 id=assertionMarket[assertionId];Market storage m=markets[id];require(id>0&&m.assertionId==assertionId&&m.outcome==0,"unknown assertion");
  if(truth){m.outcome=m.proposed;emit Resolved(id,m.outcome);}else{m.assertionId=bytes32(0);m.proposed=0;m.disputed=false;}delete assertionMarket[assertionId];
 }
 function settle(uint256 id) external {require(markets[id].assertionId!=bytes32(0)&&markets[id].outcome==0,"no pending assertion");oracle.settleAssertion(markets[id].assertionId);}
 // Permissionless refund if nobody asserts a result for 30 days. Pending UMA disputes cannot be bypassed.
 function voidStale(uint256 id) external {Market storage m=markets[id];require(m.close>0&&block.timestamp>=m.close+30 days&&m.assertionId==bytes32(0)&&m.outcome==0,"not stale");m.outcome=3;emit Resolved(id,3);}
 function payout(uint256 id,address trader) public view returns(uint256){Market storage m=markets[id];Position storage p=positions[id][trader];if(m.outcome==0||p.claimed)return 0;uint256 winning=m.outcome==1?m.yesPool:m.noPool;if(m.outcome==3||winning==0)return p.yes+p.no;return Math.mulDiv(m.outcome==1?p.yes:p.no,m.yesPool+m.noPool,winning);}
 function claim(uint256 id) external nonReentrant {require(markets[id].outcome>0,"unresolved");Position storage p=positions[id][msg.sender];require(!p.claimed&&p.yes+p.no>0,"no unclaimed position");uint256 amount=payout(id,msg.sender);p.claimed=true;usdc.safeTransfer(msg.sender,amount);emit Claimed(id,msg.sender,amount);}
}
// OpenZeppelin formatting helpers keep claim bytes human-readable for UMA voters.
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
library StringsLike {function uintString(uint256 n) internal pure returns(string memory){return Strings.toString(n);}function addressString(address a) internal pure returns(string memory){return Strings.toHexString(a);}}
