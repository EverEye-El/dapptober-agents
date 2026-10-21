// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;
import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {ERC721URIStorage} from '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
contract GroupChatFamiliar is ERC721URIStorage,ReentrancyGuard {
 using SafeERC20 for IERC20;
 IERC20 public immutable usdc;address public immutable guardian;bool public paused;
 uint256 public constant MAX_PAYMENT=100e6;uint256 public constant DAILY_CAP=500e6;
 uint256 public minted;mapping(bytes32=>uint256) public xp;
 mapping(address=>mapping(uint256=>uint256)) public spent;
 mapping(address=>mapping(bytes32=>bool)) public used;
 struct Bill{bytes32 room;address recipient;uint64 total;uint8 people;uint8 paid;}
 mapping(bytes32=>Bill) public bills;mapping(bytes32=>mapping(address=>bool)) public paid;
 struct Poll{bytes32 room;address creator;uint64 end;string question;string[] choices;uint256[] votes;}
 mapping(bytes32=>Poll) private polls;mapping(bytes32=>mapping(address=>bool)) public voted;
 event Tipped(bytes32 indexed room,bytes32 indexed nonce,address indexed sender,address recipient,uint256 amount);
 event BillOpened(bytes32 indexed id,bytes32 indexed room,address recipient,uint64 total,uint8 people);
 event BillPaid(bytes32 indexed id,address indexed payer,uint256 amount);
 event MemeMinted(bytes32 indexed room,bytes32 indexed nonce,address indexed owner,uint256 tokenId);
 event PollOpened(bytes32 indexed id,bytes32 indexed room,address creator);
 event Voted(bytes32 indexed id,address indexed voter,uint8 choice);
 constructor(address token) ERC721('Gremlin Group Memes','GREMLIN') {require(token!=address(0),'token');if(block.chainid==84532)require(token==0x036CbD53842c5426634e7929541eC2318f3dCF7e,'Base Sepolia USDC');else if(block.chainid==8453)require(token==0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913,'Base USDC');else require(block.chainid==31337,'Base only');usdc=IERC20(token);guardian=msg.sender;}
 function version() external pure returns(bytes32){return keccak256('GREMLIN_SOCIAL_V1');}
 function pause(bool value) external {require(msg.sender==guardian,'guardian');paused=value;}
 function spend(uint256 amount) private {require(!paused&&amount>0&&amount<=MAX_PAYMENT,'payment bound');uint256 day=block.timestamp/1 days;require(spent[msg.sender][day]+amount<=DAILY_CAP,'daily cap');spent[msg.sender][day]+=amount;}
 function consume(bytes32 nonce) private {require(nonce!=0&&!used[msg.sender][nonce],'replay');used[msg.sender][nonce]=true;}
 function tip(bytes32 room,bytes32 nonce,address recipient,uint256 amount) external nonReentrant {require(recipient!=address(0),'recipient');consume(nonce);spend(amount);usdc.safeTransferFrom(msg.sender,recipient,amount);xp[room]+=20;emit Tipped(room,nonce,msg.sender,recipient,amount);}
 function createBill(bytes32 room,bytes32 id,address recipient,uint64 total,uint8 people) external {require(!paused&&id!=0&&bills[id].recipient==address(0)&&recipient!=address(0),'bill');require(people>=2&&people<=10&&total>=people&&total<=MAX_PAYMENT*people,'bill bounds');bills[id]=Bill(room,recipient,total,people,0);emit BillOpened(id,room,recipient,total,people);}
 function share(bytes32 id) public view returns(uint256){Bill storage b=bills[id];require(b.recipient!=address(0)&&b.paid<b.people,'bill closed');return b.total/b.people+(b.paid<b.total%b.people?1:0);}
 function payBill(bytes32 id) external nonReentrant {Bill storage b=bills[id];require(!paid[id][msg.sender],'already paid');uint256 amount=share(id);spend(amount);b.paid++;paid[id][msg.sender]=true;usdc.safeTransferFrom(msg.sender,b.recipient,amount);xp[b.room]+=20;emit BillPaid(id,msg.sender,amount);}
 function mintMeme(bytes32 room,bytes32 nonce,string calldata uri) external nonReentrant {require(!paused&&bytes(uri).length>32&&bytes(uri).length<=24000,'metadata');consume(nonce);uint256 id=++minted;_mint(msg.sender,id);_setTokenURI(id,uri);xp[room]+=30;emit MemeMinted(room,nonce,msg.sender,id);}
 function createPoll(bytes32 room,bytes32 id,string calldata question,string[] calldata choices,uint64 end) external {require(!paused&&id!=0&&polls[id].creator==address(0),'poll');require(bytes(question).length>0&&bytes(question).length<=180&&choices.length>=2&&choices.length<=5,'poll bounds');require(end>=block.timestamp+60&&end<=block.timestamp+7 days,'deadline');Poll storage p=polls[id];p.room=room;p.creator=msg.sender;p.end=end;p.question=question;for(uint256 i;i<choices.length;i++){require(bytes(choices[i]).length>0&&bytes(choices[i]).length<=60,'choice');for(uint256 j;j<i;j++)require(keccak256(bytes(choices[i]))!=keccak256(bytes(choices[j])),'duplicate choice');p.choices.push(choices[i]);p.votes.push(0);}xp[room]+=10;emit PollOpened(id,room,msg.sender);}
 function vote(bytes32 id,uint8 choice) external {Poll storage p=polls[id];require(!paused&&p.creator!=address(0)&&block.timestamp<p.end&&choice<p.choices.length&&!voted[id][msg.sender],'vote');voted[id][msg.sender]=true;p.votes[choice]++;xp[p.room]+=5;emit Voted(id,msg.sender,choice);}
 function getPoll(bytes32 id) external view returns(bytes32,address,uint64,string memory,string[] memory,uint256[] memory){Poll storage p=polls[id];return(p.room,p.creator,p.end,p.question,p.choices,p.votes);}
}
