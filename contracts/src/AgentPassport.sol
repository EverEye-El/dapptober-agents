// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {SignatureChecker} from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
/// ERC8004-inspired identity plus replay-safe job-linked feedback. Not the full draft registries.
contract AgentPassport is ERC721URIStorage, EIP712 {
    uint256 public count;
    struct Feedback {uint256 agentId; bytes32 job; address client; uint8 score; string uri;}
    struct Validation {address validator; uint8 score; bytes32 evidence;}
    Feedback[] public feedback;
    mapping(bytes32 => bool) public usedFeedback;
    mapping(uint256 => mapping(bytes32 => address)) public jobClient;
    mapping(uint256 => mapping(bytes32 => Validation)) public validations;
    bytes32 public constant FEEDBACK_TYPEHASH=keccak256("Feedback(uint256 agentId,bytes32 job,uint8 score,bytes32 contentHash,uint256 deadline)");
    event Registered(uint256 indexed agentId, string agentURI, address indexed owner);
    event FeedbackAdded(uint256 indexed agentId, bytes32 indexed job, address indexed client, uint8 score, string uri);
    event Validated(uint256 indexed agentId, bytes32 indexed job, address indexed validator, uint8 score, bytes32 evidence);
    constructor() ERC721("Dapptober Passport","DAPP") EIP712("DapptoberFeedback","1") {}
    function register(string calldata uri) external returns(uint256 id){require(bytes(uri).length>0,"empty URI");id=++count;_mint(msg.sender,id);_setTokenURI(id,uri);emit Registered(id,uri,msg.sender);}
    function setAgentURI(uint256 id,string calldata uri) external {require(ownerOf(id)==msg.sender,"not owner");_setTokenURI(id,uri);}
    function recordJob(uint256 id,bytes32 job,address client) external {require(ownerOf(id)==msg.sender && client!=address(0) && client!=msg.sender && jobClient[id][job]==address(0),"invalid job");jobClient[id][job]=client;}
    function feedbackDigest(uint256 id,bytes32 job,uint8 score,string calldata uri,uint256 deadline) public view returns(bytes32){return _hashTypedDataV4(keccak256(abi.encode(FEEDBACK_TYPEHASH,id,job,score,keccak256(bytes(uri)),deadline)));}
    function giveFeedback(uint256 id,bytes32 job,uint8 score,string calldata uri,uint256 deadline,bytes calldata signature) external {address client=jobClient[id][job];require(client!=address(0) && client!=ownerOf(id) && score<=100 && block.timestamp<=deadline,"invalid feedback");bytes32 replay=keccak256(abi.encode(id,job,client));require(!usedFeedback[replay],"duplicate");require(SignatureChecker.isValidSignatureNow(client,feedbackDigest(id,job,score,uri,deadline),signature),"bad signature");usedFeedback[replay]=true;feedback.push(Feedback(id,job,client,score,uri));emit FeedbackAdded(id,job,client,score,uri);}
    function attest(uint256 id,bytes32 job,uint8 score,bytes32 evidence) external {require(jobClient[id][job]!=address(0) && msg.sender!=ownerOf(id) && score<=100 && evidence!=0,"invalid validation");validations[id][keccak256(abi.encode(job,msg.sender))]=Validation(msg.sender,score,evidence);emit Validated(id,job,msg.sender,score,evidence);}
}
