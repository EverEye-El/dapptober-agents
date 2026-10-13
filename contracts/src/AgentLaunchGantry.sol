// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;
import {ERC20Base} from "@thirdweb-dev/contracts/base/ERC20Base.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
/// Fixed-supply thirdweb token + perpetual curve + transfer-corrected revenue treasury.
contract LaunchAgent is ERC20Base, ReentrancyGuard {
 using SafeERC20 for IERC20;
 uint256 public constant SUPPLY=1_000_000e18;
 uint256 public constant CREATOR_ALLOCATION=200_000e18;
 uint256 public constant VIRTUAL_USDC=1000e6;
 uint256 private constant MAG=1e24;
 address public immutable creator;
 IERC20 public immutable usdc;
 uint256 public immutable launchedAt;
 uint256 public immutable serviceFee;
 string public agentPrompt;
 string public description;
 uint256 public curveTokens=800_000e18;
 uint256 public reserve;
 uint256 public creatorReleased;
 uint256 public revenue;
 uint256 public distributed;
 uint256 public revenueIndex;
 mapping(address=>int256) private correction;
 mapping(address=>uint256) public withdrawn;
 mapping(bytes32=>bytes32) public paidRequest;
 mapping(bytes32=>address) public paidBy;
 event Trade(address indexed trader,bool buy,uint256 usdcAmount,uint256 tokenAmount,uint256 reserveAfter);
 event Revenue(address indexed payer,uint256 amount,bytes32 indexed jobId,bytes32 requestHash);
 event Claimed(address indexed holder,uint256 amount);
 event Vested(address indexed creator,uint256 amount);
 constructor(address who,address money,string memory name_,string memory symbol_,string memory desc,string memory prompt,uint256 fee) ERC20Base(address(0),name_,symbol_) {
  require(who!=address(0)&&money!=address(0)&&bytes(prompt).length>0&&bytes(prompt).length<=1000&&bytes(desc).length<=280&&fee>0&&fee<=100e6,"invalid launch");creator=who;usdc=IERC20(money);description=desc;agentPrompt=prompt;serviceFee=fee;launchedAt=block.timestamp;_mint(address(this),SUPPLY);
 }
 function _canMint() internal pure override returns(bool){return false;}
 function _canBurn() internal pure override returns(bool){return false;}
 function _canSetOwner() internal pure override returns(bool){return false;}
 function _canSetContractURI() internal pure override returns(bool){return false;}
 function burn(uint256) external pure override {revert("fixed supply");}
 function quoteBuy(uint256 amount) public view returns(uint256){return amount*curveTokens/(VIRTUAL_USDC+reserve+amount);}
 function quoteSell(uint256 amount) public view returns(uint256){return amount*(VIRTUAL_USDC+reserve)/(curveTokens+amount);}
 function buy(uint256 amount,uint256 minTokens,uint256 deadline) external nonReentrant {require(block.timestamp<=deadline&&amount>0&&amount<=100_000e6,"invalid trade");uint256 out=quoteBuy(amount);require(out>=minTokens&&out>0&&out<curveTokens,"slippage");usdc.safeTransferFrom(msg.sender,address(this),amount);reserve+=amount;curveTokens-=out;_transfer(address(this),msg.sender,out);emit Trade(msg.sender,true,amount,out,reserve);}
 function sell(uint256 amount,uint256 minUSDC,uint256 deadline) external nonReentrant {require(block.timestamp<=deadline&&amount>0&&amount<=SUPPLY,"invalid trade");uint256 out=quoteSell(amount);require(out>0&&out>=minUSDC&&out<=reserve,"slippage or reserve");_transfer(msg.sender,address(this),amount);curveTokens+=amount;reserve-=out;usdc.safeTransfer(msg.sender,out);emit Trade(msg.sender,false,out,amount,reserve);}
 function vested() public view returns(uint256){if(block.timestamp<launchedAt+90 days)return 0;uint256 elapsed=block.timestamp-launchedAt;return elapsed>=365 days?CREATOR_ALLOCATION:CREATOR_ALLOCATION*elapsed/365 days;}
 function releaseCreator() external nonReentrant {require(msg.sender==creator,"creator only");uint256 amount=vested()-creatorReleased;require(amount>0,"still vested");creatorReleased+=amount;_transfer(address(this),creator,amount);emit Vested(creator,amount);}
 function claimable(address holder) public view returns(uint256){if(holder==address(this))return 0;return uint256(int256(revenueIndex*balanceOf(holder))+correction[holder])/MAG-withdrawn[holder];}
 function _beforeTokenTransfer(address from,address to,uint256 amount) internal override {int256 delta=int256(revenueIndex*amount);if(from!=address(0)&&from!=address(this))correction[from]+=delta;if(to!=address(0)&&to!=address(this))correction[to]-=delta;}
 function _revenue(uint256 amount,bytes32 jobId,bytes32 requestHash) internal {uint256 eligible=SUPPLY-balanceOf(address(this));require(eligible>0&&amount>0&&amount<=100_000e6&&revenue+amount<=1e18,"invalid revenue");usdc.safeTransferFrom(msg.sender,address(this),amount);revenue+=amount;revenueIndex+=amount*MAG/eligible;emit Revenue(msg.sender,amount,jobId,requestHash);}
 function tip(uint256 amount) external nonReentrant {_revenue(amount,0,0);}
 function payService(bytes32 jobId,bytes32 requestHash) external nonReentrant {require(jobId!=0&&requestHash!=0&&paidBy[jobId]==address(0),"duplicate or invalid job");paidBy[jobId]=msg.sender;paidRequest[jobId]=requestHash;_revenue(serviceFee,jobId,requestHash);}
 function claim() external nonReentrant {uint256 amount=claimable(msg.sender);require(amount>0,"no revenue");withdrawn[msg.sender]+=amount;distributed+=amount;usdc.safeTransfer(msg.sender,amount);emit Claimed(msg.sender,amount);}
}
contract AgentLaunchGantry {
 address public immutable usdc;
 address[] public agents;
 event Launched(uint256 indexed id,address indexed agent,address indexed creator,string name,string symbol);
 constructor(address money){require(money!=address(0),"zero USDC");usdc=money;}
 function count() external view returns(uint256){return agents.length;}
 function launch(string calldata name,string calldata symbol,string calldata description,string calldata prompt,uint256 fee) external returns(address agent){require(agents.length<200&&bytes(name).length>0&&bytes(name).length<=40&&bytes(symbol).length>0&&bytes(symbol).length<=10,"invalid listing");agent=address(new LaunchAgent(msg.sender,usdc,name,symbol,description,prompt,fee));agents.push(agent);emit Launched(agents.length-1,agent,msg.sender,name,symbol);}
}
/// Agent signer has gas only; USDC authority lives in owner-configured onchain vault.
contract GantryBuyerVault is ReentrancyGuard {
 using SafeERC20 for IERC20;
 address public immutable owner;address public immutable agent;IERC20 public immutable usdc;AgentLaunchGantry public immutable factory;
 uint256 public perBuy;uint256 public daily;uint256 public expires;bool public paused=true;uint256 public epoch;
 mapping(uint256=>uint256) public allowedEpoch;mapping(uint256=>uint256) public spent;
 constructor(address admin,address signer,address money,address gantry){require(admin!=address(0)&&signer!=address(0)&&money!=address(0)&&gantry!=address(0)&&AgentLaunchGantry(gantry).usdc()==money,"invalid vault");owner=admin;agent=signer;usdc=IERC20(money);factory=AgentLaunchGantry(gantry);}
 modifier onlyOwner(){require(msg.sender==owner,"owner only");_;}
 function grant(uint256[] calldata ids,uint256 cap,uint256 dayCap,uint256 until) external onlyOwner {require(ids.length>0&&ids.length<=200&&cap>0&&cap<=100_000e6&&dayCap>=cap&&until>block.timestamp&&until<=block.timestamp+1 days,"invalid grant");perBuy=cap;daily=dayCap;expires=until;paused=false;epoch++;for(uint256 i=0;i<ids.length;i++){require(ids[i]<factory.count(),"unknown agent");allowedEpoch[ids[i]]=epoch;}}
 function revoke() external onlyOwner {paused=true;epoch++;}
 function buy(uint256 id,uint256 amount,uint256 minTokens,uint256 deadline) external nonReentrant {require(msg.sender==agent&&!paused&&block.timestamp<expires&&allowedEpoch[id]==epoch,"vault authority");uint256 day=block.timestamp/1 days;require(amount>0&&amount<=perBuy&&spent[day]+amount<=daily,"vault budget");spent[day]+=amount;address target=factory.agents(id);usdc.forceApprove(target,amount);LaunchAgent(target).buy(amount,minTokens,deadline);}
 function claimRevenue(uint256 id) external onlyOwner nonReentrant {LaunchAgent(factory.agents(id)).claim();}
 function recover(address token,uint256 amount) external onlyOwner nonReentrant {IERC20(token).safeTransfer(owner,amount);}
}
