// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
interface ISpillwaySuperToken is IERC20 {function realtimeBalanceOfNow(address)external view returns(int256,uint256,uint256,uint256);}
interface ISpillwayForwarder {function setFlowrate(address,address,int96)external returns(bool);function getFlowrate(address,address,address)external view returns(int96);function getBufferAmountByFlowrate(address,int96)external view returns(uint256);}
/// @notice One pre-approved recipient/rate per finite-budget Superfluid sender. No arbitrary agent spending.
contract SpillwayChannel is ReentrancyGuard {
 using SafeERC20 for IERC20;
 address public immutable owner;address public immutable agent;address public immutable receiver;address public immutable token;ISpillwayForwarder public immutable forwarder;
 int96 public immutable rate;uint256 public immutable maxSeconds;uint256 public immutable maxBudget;uint256 public immutable reserveFloor;
 uint256 public totalFunded;uint256 public totalWithdrawn;uint256 public deadline;bytes32 public activeJob;bool public agentEnabled=true;mapping(bytes32=>bool)public usedJobs;
 event Started(bytes32 indexed job,uint256 deadline);event Stopped(bytes32 indexed job,uint256 timestamp);event Funded(address indexed sender,uint256 amount);
 modifier onlyOwner(){require(msg.sender==owner,'owner');_;}
 constructor(address user,address pilot,address payee,address asset,address fwd,int96 flowRate,uint256 secondsCap,uint256 budget,uint256 floor){require(user!=address(0)&&payee!=address(0)&&payee!=address(this)&&asset.code.length>0&&fwd.code.length>0,'config');require(flowRate>0&&flowRate<=1e18&&secondsCap>0&&secondsCap<=7 days&&budget>0&&budget<=1_000_000e18&&floor<budget,'limits');owner=user;agent=pilot;receiver=payee;token=asset;forwarder=ISpillwayForwarder(fwd);rate=flowRate;maxSeconds=secondsCap;maxBudget=budget;reserveFloor=floor;}
 function fund(uint256 amount)external nonReentrant{require(amount>0&&totalFunded+amount<=maxBudget,'budget');uint256 beforeBalance=IERC20(token).balanceOf(address(this));IERC20(token).safeTransferFrom(msg.sender,address(this),amount);require(IERC20(token).balanceOf(address(this))-beforeBalance==amount,'exact token');totalFunded+=amount;emit Funded(msg.sender,amount);}
 function start(bytes32 job,uint256 secondsToRun,uint256 validUntil)external nonReentrant{require(msg.sender==owner||(msg.sender==agent&&agentEnabled),'authority');require(job!=bytes32(0)&&!usedJobs[job]&&deadline==0,'job');require(block.timestamp<=validUntil&&validUntil<=block.timestamp+2 minutes,'stale');require(secondsToRun>0&&secondsToRun<=maxSeconds,'duration');require(forwarder.getFlowrate(token,address(this),receiver)==0,'external flow');uint256 buffer=forwarder.getBufferAmountByFlowrate(token,rate);require(IERC20(token).balanceOf(address(this))>=buffer+uint256(uint96(rate))*secondsToRun+reserveFloor,'runway');usedJobs[job]=true;activeJob=job;deadline=block.timestamp+secondsToRun;require(forwarder.setFlowrate(token,receiver,rate),'flow');emit Started(job,deadline);}
 function pause()external nonReentrant{require(msg.sender==owner||msg.sender==agent||msg.sender==receiver,'authority');_stop();}
 function expire()external nonReentrant{require(deadline!=0&&block.timestamp>=deadline,'not expired');_stop();}
 function safetyStop()external nonReentrant{(int256 available,,,) = ISpillwaySuperToken(token).realtimeBalanceOfNow(address(this));require(available<=int256(reserveFloor)||!agentEnabled,'safe');_stop();}
 function setAgentEnabled(bool value)external onlyOwner nonReentrant{agentEnabled=value;if(!value)_stop();}
 function withdraw(uint256 amount)external onlyOwner nonReentrant{require(deadline==0&&forwarder.getFlowrate(token,address(this),receiver)==0,'pause first');totalWithdrawn+=amount;IERC20(token).safeTransfer(owner,amount);}
 function _stop()internal{bytes32 job=activeJob;deadline=0;activeJob=bytes32(0);if(forwarder.getFlowrate(token,address(this),receiver)!=0)require(forwarder.setFlowrate(token,receiver,0),'flow');emit Stopped(job,block.timestamp);}
}
contract SpillwayFactory {
 address public immutable token;address public immutable forwarder;mapping(address=>bool)public isChannel;mapping(address=>address[])private owned;
 event ChannelCreated(address indexed owner,address indexed channel,address indexed receiver,int96 rate);
 constructor(address asset,address fwd){require(asset.code.length>0&&fwd.code.length>0,'config');token=asset;forwarder=fwd;}
 function create(address receiver,address agent,int96 rate,uint256 maxSeconds,uint256 maxBudget,uint256 reserve)external returns(address channel){require(owned[msg.sender].length<32,'capacity');channel=address(new SpillwayChannel(msg.sender,agent,receiver,token,forwarder,rate,maxSeconds,maxBudget,reserve));isChannel[channel]=true;owned[msg.sender].push(channel);emit ChannelCreated(msg.sender,channel,receiver,rate);}
 function channelsOf(address user)external view returns(address[] memory){return owned[user];}
}
