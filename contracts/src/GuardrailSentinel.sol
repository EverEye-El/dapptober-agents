// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
/// Non-upgradeable USDC smart-account policy custody with isolated agent balances.
contract GuardrailSentinel is EIP712,ReentrancyGuard {
 using SafeERC20 for IERC20;
 struct Policy {address session;uint256 perTx;uint256 daily;uint256 threshold;uint256 starts;uint256 ends;uint256 epoch;uint256 version;bool paused;}
 struct Permit {uint256 id;address target;uint256 amount;uint256 nonce;uint256 deadline;uint256 epoch;uint256 version;bool needsHuman;bytes32 requestId;}
 bytes32 public constant TYPEHASH=keccak256("Permit(uint256 id,address target,uint256 amount,uint256 nonce,uint256 deadline,uint256 epoch,uint256 version,bool needsHuman,bytes32 requestId)");
 address public immutable owner;address public immutable guardian;IERC20 public immutable usdc;
 uint256 public count;uint256 public epoch=1;bool public stopped;
 mapping(uint256=>address[]) private targetLists;
 function getTargets(uint256 id) external view returns(address[] memory){return targetLists[id];}
 mapping(uint256=>Policy) public policies;mapping(uint256=>uint256) public balances;mapping(uint256=>uint256) public nonces;mapping(uint256=>mapping(uint256=>uint256)) public spent;mapping(uint256=>mapping(address=>uint256)) public allowedVersion;mapping(bytes32=>bool) public executed;
 event PolicySet(uint256 indexed id,address indexed session,uint256 version,uint256 epoch);
 event Paid(uint256 indexed id,address indexed target,uint256 amount,bytes32 indexed requestId,uint256 nonce);
 event Shutdown(uint256 epoch,address indexed triggeredBy);event Resumed(uint256 epoch);event Funded(uint256 indexed id,uint256 amount);
 modifier onlyOwner(){require(msg.sender==owner,"owner only");_;}
 constructor(address admin,address oracle,address token) EIP712("GuardrailSentinel","1"){require(admin!=address(0)&&oracle!=address(0)&&admin!=oracle&&token!=address(0),"invalid authority");owner=admin;guardian=oracle;usdc=IERC20(token);}
 function setPolicy(uint256 id,address key,uint256 cap,uint256 dayCap,uint256 threshold,uint256 start,uint256 end,address[] calldata targets,bool paused) external onlyOwner {require(!stopped&&id<=count&&(id<count||count<100)&&key!=address(0)&&key!=owner&&key!=guardian&&cap>0&&dayCap>=cap&&threshold<=cap&&end>start&&end>block.timestamp&&end<=block.timestamp+30 days&&targets.length>0&&targets.length<=32,"invalid policy");if(id==count)count++;targetLists[id]=targets;uint256 version=policies[id].version+1;policies[id]=Policy(key,cap,dayCap,threshold,start,end,epoch,version,paused);for(uint256 i=0;i<targets.length;i++){require(targets[i].code.length>0&&targets[i]!=address(this)&&targets[i]!=address(usdc),"contract target required");allowedVersion[id][targets[i]]=version;}emit PolicySet(id,key,version,epoch);}
 function remove(uint256 id) external onlyOwner {require(id<count,"unknown agent");Policy storage rule=policies[id];rule.session=address(0);rule.paused=true;rule.version++;emit PolicySet(id,address(0),rule.version,epoch);}
 function fund(uint256 id,uint256 amount) external nonReentrant {require(id<count&&amount>0,"invalid funding");usdc.safeTransferFrom(msg.sender,address(this),amount);balances[id]+=amount;emit Funded(id,amount);}
 function recover(uint256 id,uint256 amount) external onlyOwner nonReentrant {require(amount>0&&amount<=balances[id],"balance");balances[id]-=amount;usdc.safeTransfer(owner,amount);}
 function kill() external {require(msg.sender==owner||msg.sender==guardian,"shutdown authority");stopped=true;epoch++;emit Shutdown(epoch,msg.sender);}
 function resume() external onlyOwner {require(stopped,"not stopped");stopped=false;emit Resumed(epoch);}
 function digest(Permit calldata p) public view returns(bytes32){return _hashTypedDataV4(keccak256(abi.encode(TYPEHASH,p.id,p.target,p.amount,p.nonce,p.deadline,p.epoch,p.version,p.needsHuman,p.requestId)));}
 function pay(Permit calldata p,bytes calldata guardianSignature,bytes calldata humanSignature) external nonReentrant {Policy memory rule=policies[p.id];require(!stopped&&!rule.paused&&rule.epoch==epoch&&p.epoch==epoch&&p.version==rule.version&&msg.sender==rule.session,"session revoked");require(block.timestamp>=rule.starts&&block.timestamp<rule.ends&&block.timestamp<=p.deadline,"time window");require(p.nonce==nonces[p.id]&&p.requestId!=0&&!executed[p.requestId],"replay");require(allowedVersion[p.id][p.target]==rule.version&&p.amount>0&&p.amount<=rule.perTx,"target or cap");uint256 day=block.timestamp/1 days;require(spent[p.id][day]+p.amount<=rule.daily&&p.amount<=balances[p.id],"daily or balance");bytes32 d=digest(p);require(SignatureChecker.isValidSignatureNow(guardian,d,guardianSignature),"guardian signature");if(p.needsHuman||p.amount>rule.threshold)require(SignatureChecker.isValidSignatureNow(owner,d,humanSignature),"human cosign");executed[p.requestId]=true;nonces[p.id]++;spent[p.id][day]+=p.amount;balances[p.id]-=p.amount;usdc.safeTransfer(p.target,p.amount);emit Paid(p.id,p.target,p.amount,p.requestId,p.nonce);}
}
