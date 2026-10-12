// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
/// Base registry, not Story Protocol/PIL. Registered content remains an author's assertion.
contract ProvenancePress is ERC721,ReentrancyGuard {
 using SafeERC20 for IERC20;
 struct Work {address creator;string title;string uri;bytes32 contentHash;uint8 terms;uint256 price;uint256 parent;uint8 depth;uint256 earned;}
 struct License {uint256 work;address buyer;uint8 purpose;uint256 amount;uint256 time;}
 struct Rule {uint256 perPurchase;uint256 daily;uint256 expires;bool paused;}
 address public immutable owner;IERC20 public immutable usdc;uint256 public count;uint256 public licenseCount;bool public paused;
 mapping(uint256=>Work) public works;mapping(uint256=>License) public licenses;mapping(bytes32=>bool) public registeredHashes;mapping(address=>mapping(uint256=>bool)) public remixRights;
 mapping(address=>uint256) public credit;mapping(address=>uint256) public claimed;mapping(address=>bool) public agentAccount;mapping(address=>Rule) public rules;mapping(uint256=>bool) public agentAllowed;mapping(address=>mapping(uint256=>uint256)) public spent;
 event Registered(uint256 indexed id,address indexed creator,uint256 indexed parent,bytes32 contentHash);event Licensed(uint256 indexed id,uint256 indexed work,address indexed buyer,uint8 purpose,uint256 amount);event Royalty(uint256 indexed work,address indexed creator,uint256 amount);event Claimed(address indexed creator,uint256 amount);
 modifier onlyOwner(){require(msg.sender==owner,"owner only");_;}
 constructor(address admin,address token) ERC721("Provenance Press Certificate","PRESS") {require(admin!=address(0)&&token!=address(0),"zero address");owner=admin;usdc=IERC20(token);}
 function templateHash(uint8 terms) public pure returns(bytes32){require(terms<3,"unapproved terms");return keccak256(bytes(terms==0?"Human free; AI training and inference paid; remixes permitted; 20% parent waterfall":terms==1?"Human free; AI inference paid; no training; no derivatives":"Human free; no AI training or inference; no derivatives"));}
 function setPaused(bool value) external onlyOwner {paused=value;}
 function setAgent(address agent,uint256 perPurchase,uint256 daily,uint256 expires,bool stopped) external onlyOwner {require(agent!=address(0)&&perPurchase>0&&daily>=perPurchase,"invalid caps");agentAccount[agent]=true;rules[agent]=Rule(perPurchase,daily,expires,stopped);}
 function allowWork(uint256 id,bool value) external onlyOwner {require(works[id].creator!=address(0),"unknown work");agentAllowed[id]=value;}
 function register(string calldata title,string calldata uri,bytes32 contentHash,uint8 terms,uint256 price,uint256 parent) external nonReentrant returns(uint256 id){require(!paused,"press paused");require(count<500&&bytes(title).length>0&&bytes(title).length<=100&&bytes(uri).length>0&&bytes(uri).length<=200&&contentHash!=0&&!registeredHashes[contentHash],"invalid work");templateHash(terms);require(price>0,"positive AI fee");uint8 depth=0;if(parent!=0){Work storage p=works[parent];require(p.creator!=address(0)&&p.terms==0&&remixRights[msg.sender][parent],"remix permission");require(terms==p.terms&&price>=p.price,"inherited terms");depth=p.depth+1;require(depth<=8,"ancestry limit");}registeredHashes[contentHash]=true;id=++count;works[id]=Work(msg.sender,title,uri,contentHash,terms,price,parent,depth,0);_mint(msg.sender,id);emit Registered(id,msg.sender,parent,contentHash);}
 function tokenURI(uint256 id) public view override returns(string memory){_requireOwned(id);return works[id].uri;}
 function _update(address to,uint256 id,address auth) internal override returns(address){require(_ownerOf(id)==address(0),"certificate immutable");return super._update(to,id,auth);}
 function buy(uint256 id,uint8 purpose,uint256 maxPrice) external nonReentrant returns(uint256 licenseId){require(!paused,"press paused");Work storage w=works[id];require(w.creator!=address(0)&&purpose<=3,"invalid license");require(purpose==0||w.terms==0||(w.terms==1&&purpose==2),"purpose forbidden");uint256 amount=purpose==0?0:w.price;require(amount<=maxPrice,"fee exceeds preview");if(agentAccount[msg.sender]){require(purpose!=0,"agent human-use forbidden");Rule memory r=rules[msg.sender];require(!r.paused&&block.timestamp<r.expires&&agentAllowed[id],"agent stopped or work not approved");require(amount<=r.perPurchase&&spent[msg.sender][block.timestamp/1 days]+amount<=r.daily,"agent budget");spent[msg.sender][block.timestamp/1 days]+=amount;}
 licenseId=++licenseCount;require(licenseId<=2000,"license ledger limit");licenses[licenseId]=License(id,msg.sender,purpose,amount,block.timestamp);if(purpose==3)remixRights[msg.sender][id]=true;if(amount>0){usdc.safeTransferFrom(msg.sender,address(this),amount);uint256 current=id;uint256 remaining=amount;while(current!=0){Work storage node=works[current];uint256 upstream=node.parent==0?0:remaining*2000/10000;uint256 share=remaining-upstream;credit[node.creator]+=share;node.earned+=share;emit Royalty(current,node.creator,share);remaining=upstream;current=node.parent;}}emit Licensed(licenseId,id,msg.sender,purpose,amount);}
 function claim() external nonReentrant {uint256 amount=credit[msg.sender];require(amount>0,"no royalties");credit[msg.sender]=0;claimed[msg.sender]+=amount;usdc.safeTransfer(msg.sender,amount);emit Claimed(msg.sender,amount);}
}
