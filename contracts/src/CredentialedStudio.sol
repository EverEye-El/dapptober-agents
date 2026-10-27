// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {EIP712} from '@openzeppelin/contracts/utils/cryptography/EIP712.sol';
import {ECDSA} from '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
/// @notice A free, signature-gated credential drop. The verifier attests evidence, not truth or copyright.
contract CredentialedStudio is ERC721,EIP712,Ownable {
 struct Permit {address recipient;bytes32 contentHash;bytes32 manifestHash;bytes32 modelHash;bytes32 parentHash;string uri;uint256 deadline;}
 struct Provenance {bytes32 contentHash;bytes32 manifestHash;bytes32 modelHash;bytes32 parentHash;}
 bytes32 public constant VERSION=keccak256('CREDENTIALED_STUDIO_V1');
 bytes32 public constant TYPEHASH=keccak256('Permit(address recipient,bytes32 contentHash,bytes32 manifestHash,bytes32 modelHash,bytes32 parentHash,string uri,uint256 deadline)');
 address public verifier;bool public paused;uint256 public totalSupply;
 mapping(bytes32=>uint256) public tokenForHash;mapping(uint256=>Provenance) public provenance;mapping(uint256=>string) private uris;
 event TakeMinted(uint256 indexed tokenId,address indexed recipient,bytes32 indexed contentHash,bytes32 manifestHash,bytes32 modelHash,bytes32 parentHash,string uri);
 constructor(address admin,address signer)ERC721('Take One / Credentialed Studio','TAKE')EIP712('Credentialed Studio','1')Ownable(admin){require(block.chainid==84532||block.chainid==8453||block.chainid==31337,'network');require(signer!=address(0),'signer');verifier=signer;}
 function configure(address signer,bool stop)external onlyOwner{require(signer!=address(0),'signer');verifier=signer;paused=stop;}
 function mint(Permit calldata p,bytes calldata signature)external returns(uint256 id){require(!paused,'paused');require(msg.sender==p.recipient&&p.recipient!=address(0),'recipient');require(p.deadline>=block.timestamp&&p.deadline<=block.timestamp+1 hours,'deadline');require(p.contentHash!=bytes32(0)&&p.manifestHash!=bytes32(0)&&p.modelHash!=bytes32(0),'hash');require(bytes(p.uri).length>7&&bytes(p.uri).length<=200,'uri');require(tokenForHash[p.contentHash]==0,'duplicate');require(ECDSA.recover(_hashTypedDataV4(keccak256(abi.encode(TYPEHASH,p.recipient,p.contentHash,p.manifestHash,p.modelHash,p.parentHash,keccak256(bytes(p.uri)),p.deadline))),signature)==verifier,'verifier');
 id=++totalSupply;tokenForHash[p.contentHash]=id;provenance[id]=Provenance(p.contentHash,p.manifestHash,p.modelHash,p.parentHash);uris[id]=p.uri;_safeMint(p.recipient,id);emit TakeMinted(id,p.recipient,p.contentHash,p.manifestHash,p.modelHash,p.parentHash,p.uri);}
 function tokenURI(uint256 id)public view override returns(string memory){_requireOwned(id);return uris[id];}
}
