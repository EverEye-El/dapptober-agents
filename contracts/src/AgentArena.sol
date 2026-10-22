// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
/// @dev Chainlink VRF v2.5 subscription request ABI. No coordinator migration or owner-selected randomness.
interface IArenaVRF {
 struct Request {bytes32 keyHash;uint256 subId;uint16 requestConfirmations;uint32 callbackGasLimit;uint32 numWords;bytes extraArgs;}
 function requestRandomWords(Request calldata request) external returns(uint256);
}
/// @notice Three-round, simultaneous sigil combat with frozen lineups and pari-mutuel USDC settlement.
contract AgentArena is ReentrancyGuard {
 using SafeERC20 for IERC20;
 IERC20 public immutable usdc;address public immutable house;address public immutable guardian;IArenaVRF public immutable coordinator;bytes32 public immutable keyHash;uint256 public immutable subscription;
 uint256 public constant BET_CAP=100e6;uint256 public constant POOL_CAP=10000e6;uint256 public constant WINDOW=300;uint256 public constant ORACLE_TIMEOUT=1 days;
 bytes32 public constant RULES=keccak256('PITLANE_V1_3_ROUNDS_90_5_5_LOSING_POOL');
 bool public paused;uint256 public activeCount;uint256 public agentCount;uint256 public matchCount;uint256 public liability;
 struct Agent {address trainer;address pilot;bytes32 name;bytes32 strategy;uint32 version;}
 struct Stats {uint32 wins;uint32 losses;uint32 draws;uint32 points;}
 struct Match {uint256[2] agents;address[2] pilots;address[2] trainers;bytes32[2] strategies;uint64 close;uint64 commitEnd;uint64 revealEnd;uint64 requestedAt;uint32 season;uint8 status;uint8 winner;bool[2] revealed;bytes32[2] commitments;uint8[3][2] moves;uint256[2] pools;uint256 requestId;uint256 entropy;}
 // status: 0 missing, 1 open/committing, 2 awaiting VRF, 3 revealing, 4 final, 5 refund. winner: 0/1 side, 2 draw/void.
 mapping(uint256=>bool) public eligible;mapping(uint256=>uint256) public activeMatch;mapping(uint256=>uint256) public scheduledPerDay;mapping(uint256=>uint256) public oracleRequestsPerDay;mapping(uint256=>Agent) public agents;mapping(uint32=>mapping(uint256=>Stats)) public ladder;mapping(uint256=>Match) private matches_;mapping(uint256=>uint256) private requests;
 mapping(uint256=>mapping(address=>uint256[2])) public stakes;mapping(uint256=>address[]) private bettors;mapping(address=>uint256) public credit;
 event AgentRegistered(uint256 indexed id,address indexed trainer,address pilot,bytes32 name,bytes32 strategy);
 event StrategyUpdated(uint256 indexed id,bytes32 strategy,uint32 version);
 event Scheduled(uint256 indexed id,uint256 a,uint256 b,uint64 close,uint32 season);
 event Staked(uint256 indexed id,address indexed bettor,uint8 side,uint256 amount);
 event Committed(uint256 indexed id,uint8 side,bytes32 commitment);
 event RandomnessRequested(uint256 indexed id,uint256 requestId);
 event ArenaSeed(uint256 indexed id,uint256 entropy);
 event Revealed(uint256 indexed id,uint8 side,uint8[3] moves,bytes32 salt);
 event Settled(uint256 indexed id,uint8 winner,bool refund,uint256 backerProfit,uint256 trainerFee,uint256 houseFee);
 event Claimed(address indexed account,uint256 amount);
 constructor(address token,address treasury,address guard,address vrf,bytes32 lane,uint256 sub){require(token.code.length>0&&vrf.code.length>0&&treasury!=address(0)&&guard!=address(0),'config');if(block.chainid==8453)require(token==0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913,'USDC');else if(block.chainid==84532)require(token==0x036CbD53842c5426634e7929541eC2318f3dCF7e,'USDC');else require(block.chainid==31337,'Base only');usdc=IERC20(token);house=treasury;guardian=guard;coordinator=IArenaVRF(vrf);keyHash=lane;subscription=sub;}
 function setPaused(bool value) external{require(msg.sender==guardian,'guardian');paused=value;}
 function register(address pilot,bytes32 name,bytes32 strategy) external returns(uint256 id){require(!paused&&pilot!=address(0)&&name!=0&&strategy!=0,'registration');require(agentCount<256,'capacity');id=++agentCount;agents[id]=Agent(msg.sender,pilot,name,strategy,1);emit AgentRegistered(id,msg.sender,pilot,name,strategy);}
 function enroll(uint256 id,bool value) external{require(msg.sender==guardian&&agents[id].trainer!=address(0),'guardian');eligible[id]=value;}
 function train(uint256 id,bytes32 strategy) external{Agent storage a=agents[id];require(!paused&&a.trainer==msg.sender&&strategy!=0,'trainer');a.strategy=strategy;a.version++;emit StrategyUpdated(id,strategy,a.version);}
 function schedule(uint256 a,uint256 b,uint64 close) external returns(uint256 id){require(!paused&&a!=b&&eligible[a]&&eligible[b]&&activeMatch[a]==0&&activeMatch[b]==0,'lineup');require(activeCount<4,'active cap');activeCount++;require(matchCount<200&&scheduledPerDay[block.timestamp/1 days]<24,'schedule cap');scheduledPerDay[block.timestamp/1 days]++;require(close>=block.timestamp+60&&close<=block.timestamp+7 days,'schedule');id=++matchCount;Match storage m=matches_[id];m.agents=[a,b];activeMatch[a]=id;activeMatch[b]=id;m.pilots=[agents[a].pilot,agents[b].pilot];m.trainers=[agents[a].trainer,agents[b].trainer];m.strategies=[agents[a].strategy,agents[b].strategy];m.close=close;m.commitEnd=close+uint64(WINDOW);m.season=uint32(block.timestamp/30 days);m.status=1;m.winner=2;emit Scheduled(id,a,b,close,m.season);}
 function matchInfo(uint256 id) external view returns(Match memory){require(matches_[id].status!=0,'match');return matches_[id];}
 function stake(uint256 id,uint8 side,uint256 amount) external nonReentrant{Match storage m=matches_[id];require(!paused&&m.status==1&&block.timestamp<m.close&&side<2,'closed');require(msg.sender!=m.pilots[0]&&msg.sender!=m.pilots[1],'pilot cannot stake');uint256[2] storage s=stakes[id][msg.sender];require(amount>0&&s[0]+s[1]+amount<=BET_CAP&&m.pools[0]+m.pools[1]+amount<=POOL_CAP,'cap');if(s[0]+s[1]==0){require(bettors[id].length<100,'bettors');bettors[id].push(msg.sender);}uint256 beforeBalance=usdc.balanceOf(address(this));usdc.safeTransferFrom(msg.sender,address(this),amount);require(usdc.balanceOf(address(this))==beforeBalance+amount,'token');s[side]+=amount;m.pools[side]+=amount;liability+=amount;emit Staked(id,msg.sender,side,amount);}
 function commitment(uint256 id,uint8 side,uint8[3] memory moves,bytes32 salt) public view returns(bytes32){Match storage m=matches_[id];return keccak256(abi.encode(RULES,block.chainid,address(this),id,side,m.agents[side],m.strategies[side],moves,salt));}
 function commit(uint256 id,uint8 side,bytes32 digest) external{Match storage m=matches_[id];require(m.status==1&&block.timestamp>=m.close&&block.timestamp<m.commitEnd&&side<2,'commit phase');require(msg.sender==m.pilots[side]&&digest!=0&&m.commitments[side]==0,'pilot');m.commitments[side]=digest;emit Committed(id,side,digest);}
 function requestArena(uint256 id) external nonReentrant{Match storage m=matches_[id];require(oracleRequestsPerDay[block.timestamp/1 days]<24,'oracle budget');oracleRequestsPerDay[block.timestamp/1 days]++;require(m.status==1&&m.commitments[0]!=0&&m.commitments[1]!=0&&block.timestamp<m.commitEnd+WINDOW,'commitments');m.status=2;m.requestedAt=uint64(block.timestamp);uint256 requestId=coordinator.requestRandomWords(IArenaVRF.Request(keyHash,subscription,3,150000,1,abi.encodeWithSelector(bytes4(keccak256('VRF ExtraArgsV1')),false)));require(requestId!=0&&requests[requestId]==0,'request');m.requestId=requestId;requests[requestId]=id;emit RandomnessRequested(id,requestId);}
 function rawFulfillRandomWords(uint256 requestId,uint256[] calldata words) external{require(msg.sender==address(coordinator),'coordinator');uint256 id=requests[requestId];if(id==0||words.length==0)return;Match storage m=matches_[id];if(m.status!=2||block.timestamp>=m.requestedAt+ORACLE_TIMEOUT)return;m.entropy=words[0];m.revealEnd=uint64(block.timestamp+WINDOW);m.status=3;emit ArenaSeed(id,words[0]);}
 function reveal(uint256 id,uint8 side,uint8[3] calldata moves,bytes32 salt) external{Match storage m=matches_[id];require(m.status==3&&block.timestamp<m.revealEnd&&side<2,'reveal phase');require(msg.sender==m.pilots[side]&&!m.revealed[side]&&moves[0]<3&&moves[1]<3&&moves[2]<3&&commitment(id,side,moves,salt)==m.commitments[side],'reveal');m.revealed[side]=true;m.moves[side]=moves;emit Revealed(id,side,moves,salt);}
 function scores(uint256 id) public view returns(uint8[2] memory score){Match storage m=matches_[id];require(m.revealed[0]&&m.revealed[1],'hidden');for(uint256 r;r<3;r++){uint8 a=m.moves[0][r];uint8 b=m.moves[1][r];if(a==b){score[0]++;score[1]++;}else if((a+1)%3==b)score[1]+=2;else score[0]+=2;uint8 sigil=uint8(uint256(keccak256(abi.encode(m.entropy,r)))%3);if(a==sigil)score[0]++;if(b==sigil)score[1]++;}}
 function settle(uint256 id) external nonReentrant{Match storage m=matches_[id];require(m.status>0&&m.status<4,'terminal');uint8 winner=2;if(m.status==1){require(block.timestamp>=m.commitEnd+WINDOW,'wait');}else if(m.status==2){require(block.timestamp>=m.requestedAt+ORACLE_TIMEOUT,'VRF pending');}else{require(m.revealed[0]&&m.revealed[1]||block.timestamp>=m.revealEnd,'revealing');if(m.revealed[0]&&m.revealed[1]){uint8[2] memory score=scores(id);if(score[0]!=score[1])winner=score[0]>score[1]?0:1;}else if(m.revealed[0]!=m.revealed[1])winner=m.revealed[0]?0:1;}
 activeCount--;activeMatch[m.agents[0]]=0;activeMatch[m.agents[1]]=0;m.winner=winner;bool refund=winner==2||m.pools[winner]==0;m.status=refund?5:4;uint256 profit;uint256 trainerFee;uint256 houseFee;if(!refund){uint256 lost=m.pools[1-winner];trainerFee=lost*5/100;houseFee=lost*5/100;profit=lost-trainerFee-houseFee;credit[m.trainers[winner]]+=trainerFee;credit[house]+=houseFee;}
 uint256 paid;address lastWinner;for(uint256 i;i<bettors[id].length;i++){address bettor=bettors[id][i];uint256[2] storage s=stakes[id][bettor];uint256 value=refund?s[0]+s[1]:s[winner]+s[winner]*profit/m.pools[winner];credit[bettor]+=value;paid+=value;if(!refund&&s[winner]>0)lastWinner=bettor;}
 // All rounding dust belongs to a winning bettor, never the house or an administrator.
 if(!refund)credit[lastWinner]+=m.pools[0]+m.pools[1]-trainerFee-houseFee-paid;
 if(winner<2){ladder[m.season][m.agents[winner]].wins++;ladder[m.season][m.agents[winner]].points+=3;ladder[m.season][m.agents[1-winner]].losses++;}else if(m.status==5&&m.revealed[0]&&m.revealed[1]){for(uint256 i;i<2;i++){ladder[m.season][m.agents[i]].draws++;ladder[m.season][m.agents[i]].points++;}}
 emit Settled(id,winner,refund,profit,trainerFee,houseFee);}
 function claim() external nonReentrant{uint256 value=credit[msg.sender];require(value>0,'no credit');credit[msg.sender]=0;liability-=value;usdc.safeTransfer(msg.sender,value);emit Claimed(msg.sender,value);}
}
