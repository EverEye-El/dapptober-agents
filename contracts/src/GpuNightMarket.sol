// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
/// Provider specs are declarations. Output hashes prove delivery integrity, not model correctness.
contract GpuNightMarket is ReentrancyGuard {
 using SafeERC20 for IERC20;
 struct Stall {string model;uint32 vram;uint32 slots;uint32 active;uint256 price;bool online;uint256 completed;uint256 failed;}
 struct Job {address buyer;address provider;uint256 amount;uint256 deadline;bytes32 inputHash;bytes32 modelHash;bytes32 outputHash;bytes32 requestId;uint8 status;}
 struct AgentRule {uint256 perJob;uint256 daily;uint256 expires;bool paused;}
 address public immutable owner;IERC20 public immutable usdc;bool public paused;
 uint256 public count;address[] public providers;mapping(address=>bool) public listed;mapping(address=>Stall) public stalls;mapping(uint256=>Job) public jobs;
 mapping(address=>bool) public agentAccount;mapping(address=>AgentRule) public agentRules;mapping(address=>bool) public approvedProviders;mapping(address=>mapping(uint256=>uint256)) public spent;mapping(address=>mapping(bytes32=>bool)) public requests;
 event Listed(address indexed provider,string model,uint256 price,uint32 slots);
 event Booked(uint256 indexed id,address indexed buyer,address indexed provider,uint256 amount,bytes32 inputHash);
 event Delivered(uint256 indexed id,bytes32 outputHash);event Refunded(uint256 indexed id);
 modifier onlyOwner(){require(msg.sender==owner,"owner only");_;}
 constructor(address admin,address token){require(admin!=address(0)&&token!=address(0),"zero address");owner=admin;usdc=IERC20(token);}
 function setPaused(bool value) external onlyOwner {paused=value;}
 function allowProvider(address provider,bool value) external onlyOwner {approvedProviders[provider]=value;}
 function setAgent(address agent,uint256 perJob,uint256 daily,uint256 expires,bool stopped) external onlyOwner {require(agent!=address(0)&&perJob>0&&daily>=perJob,"invalid caps");agentAccount[agent]=true;agentRules[agent]=AgentRule(perJob,daily,expires,stopped);}
 function list(string calldata model,uint32 vram,uint32 slots,uint256 price,bool online) external {
  require(bytes(model).length>0&&bytes(model).length<=100&&vram>0&&slots>0&&slots<=64&&price>0,"invalid listing");Stall storage p=stalls[msg.sender];require(slots>=p.active,"capacity in use");
  if(!listed[msg.sender]){require(providers.length<100,"market scan limit");listed[msg.sender]=true;providers.push(msg.sender);}p.model=model;p.vram=vram;p.slots=slots;p.price=price;p.online=online;emit Listed(msg.sender,model,price,slots);
 }
 function providerCount() external view returns(uint256){return providers.length;}
 function book(address provider,uint256 minutesReserved,bytes32 inputHash,uint256 maxPrice,bytes32 requestId) external nonReentrant returns(uint256 id){
  require(!paused,"market paused");require(count<1000,"market job limit");Stall storage p=stalls[provider];require(listed[provider]&&p.online&&p.active<p.slots,"provider unavailable");require(provider!=msg.sender,"self dealing");require(minutesReserved>0&&minutesReserved<=60&&inputHash!=0&&requestId!=0,"invalid job");require(!requests[msg.sender][requestId],"request replay");
  uint256 amount=p.price*minutesReserved;require(amount<=maxPrice,"price moved");if(agentAccount[msg.sender]){AgentRule memory r=agentRules[msg.sender];require(!r.paused&&block.timestamp<r.expires,"agent stopped");require(approvedProviders[provider],"provider not approved");require(amount<=r.perJob&&spent[msg.sender][block.timestamp/1 days]+amount<=r.daily,"agent budget");spent[msg.sender][block.timestamp/1 days]+=amount;}
  requests[msg.sender][requestId]=true;p.active++;id=++count;jobs[id]=Job(msg.sender,provider,amount,block.timestamp+minutesReserved*60+300,inputHash,keccak256(bytes(p.model)),0,requestId,0);usdc.safeTransferFrom(msg.sender,address(this),amount);emit Booked(id,msg.sender,provider,amount,inputHash);
 }
 function deliver(uint256 id,bytes32 outputHash) external nonReentrant {Job storage j=jobs[id];require(j.buyer!=address(0)&&j.status==0&&msg.sender==j.provider&&block.timestamp<=j.deadline&&outputHash!=0,"not deliverable");j.status=1;j.outputHash=outputHash;stalls[j.provider].active--;stalls[j.provider].completed++;usdc.safeTransfer(j.provider,j.amount);emit Delivered(id,outputHash);}
 function refund(uint256 id) external nonReentrant {Job storage j=jobs[id];require(j.buyer!=address(0)&&j.status==0&&block.timestamp>j.deadline,"not refundable");j.status=2;stalls[j.provider].active--;stalls[j.provider].failed++;usdc.safeTransfer(j.buyer,j.amount);emit Refunded(id);}
}
