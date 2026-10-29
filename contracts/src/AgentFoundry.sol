// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
interface IFoundryIdentity{function register(string calldata uri)external returns(uint256);function ownerOf(uint256)external view returns(address);}
/// @notice An agent's identity and earnings wallet. The human owns custody; executor authority is bounded.
contract FoundryVault is IERC721Receiver,ReentrancyGuard{
 using SafeERC20 for IERC20;address public immutable owner;address public immutable executor;IERC20 public immutable token;IFoundryIdentity public immutable registry;bytes32 public immutable blueprintHash;uint256 public immutable dailyCap;uint256 public immutable maxPayment;uint256 public identityId;bool public paused;uint256 public spentDay;uint256 public spent;mapping(address=>bool)public allowed;mapping(bytes32=>bool)public requests;
 modifier onlyOwner(){require(msg.sender==owner,'owner');_;}
 constructor(address human,address pilot,address usdc,address identity,bytes32 specHash,uint256 cap,uint256 max,address[] memory recipients,string memory uri){require(human!=address(0)&&pilot!=address(0)&&usdc.code.length>0&&identity.code.length>0,'config');require(cap<=100e6&&max<=cap&&recipients.length<=10&&bytes(uri).length>0&&bytes(uri).length<=12000,'limits');owner=human;executor=pilot;token=IERC20(usdc);registry=IFoundryIdentity(identity);blueprintHash=specHash;dailyCap=cap;maxPayment=max;for(uint256 i;i<recipients.length;i++){require(recipients[i]!=address(0),'recipient');allowed[recipients[i]]=true;}identityId=registry.register(uri);require(registry.ownerOf(identityId)==address(this),'identity');}
 function onERC721Received(address,address,uint256,bytes calldata)external pure returns(bytes4){return IERC721Receiver.onERC721Received.selector;}
 function setPaused(bool value)external onlyOwner{paused=value;}
 function setRecipient(address recipient,bool value)external onlyOwner{require(recipient!=address(0),'recipient');allowed[recipient]=value;}
 function pay(bytes32 id,address recipient,uint256 amount)external nonReentrant{require(msg.sender==executor&&!paused,'executor');require(id!=bytes32(0)&&!requests[id]&&allowed[recipient]&&amount>0&&amount<=maxPayment,'policy');uint256 day=block.timestamp/1 days;if(day!=spentDay){spentDay=day;spent=0;}require(spent+amount<=dailyCap,'daily cap');requests[id]=true;spent+=amount;token.safeTransfer(recipient,amount);}
 function withdraw(uint256 amount)external onlyOwner nonReentrant{token.safeTransfer(owner,amount);}
}
contract AgentFoundry {
 address public immutable token;address public immutable registry;mapping(address=>bool)public isVault;mapping(address=>address[])private owned;
 event AgentCreated(address indexed owner,address indexed vault,uint256 indexed identityId,address executor,bytes32 blueprintHash);
 constructor(address usdc,address identity){require(usdc.code.length>0&&identity.code.length>0,'config');token=usdc;registry=identity;}
 function create(address executor,bytes32 blueprintHash,uint256 dailyCap,uint256 maxPayment,address[] calldata recipients,string calldata uri)external returns(address vault){require(owned[msg.sender].length<20,'capacity');vault=address(new FoundryVault(msg.sender,executor,token,registry,blueprintHash,dailyCap,maxPayment,recipients,uri));owned[msg.sender].push(vault);isVault[vault]=true;emit AgentCreated(msg.sender,vault,FoundryVault(vault).identityId(),executor,blueprintHash);}
 function vaultsOf(address human)external view returns(address[] memory){return owned[human];}
}
