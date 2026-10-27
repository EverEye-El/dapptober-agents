// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
/// @notice Owner-controlled ciphertext pointers. No plaintext or decryption key belongs onchain.
contract MemoryCathedral {
 bytes32 public constant VERSION=keccak256('MEMORY_CATHEDRAL_V1');
 struct Tome {uint64 version;bytes32 digest;string cid;bool archived;}
 struct Grant {uint64 version;uint64 expires;bytes32 capsuleHash;bytes32 publicKeyHash;}
 mapping(address=>mapping(bytes32=>Tome)) public tomes;
 mapping(address=>mapping(bytes32=>mapping(address=>Grant))) public grants;
 event Written(address indexed owner,bytes32 indexed id,uint64 version,bytes32 digest,string cid);
 event Access(address indexed owner,bytes32 indexed id,address indexed agent,uint64 version,uint64 expires,bytes32 capsuleHash,bytes32 publicKeyHash);
 event Archived(address indexed owner,bytes32 indexed id,bool archived);
 constructor(){require(block.chainid==84532||block.chainid==8453||block.chainid==31337,'network');}
 function write(bytes32 id,uint64 expectedVersion,bytes32 digest,string calldata cid)external{Tome storage t=tomes[msg.sender][id];require(id!=bytes32(0)&&digest!=bytes32(0)&&bytes(cid).length>=10&&bytes(cid).length<=100,'pointer');require(t.version==expectedVersion,'stale version');require(!t.archived,'archived');t.version++;t.digest=digest;t.cid=cid;emit Written(msg.sender,id,t.version,digest,cid);}
 function grant(bytes32 id,address agent,uint64 expectedVersion,uint64 expires,bytes32 capsuleHash,bytes32 publicKeyHash)external{Tome storage t=tomes[msg.sender][id];require(t.version>0&&!t.archived&&t.version==expectedVersion,'version');require(agent!=address(0)&&agent!=msg.sender&&capsuleHash!=bytes32(0)&&publicKeyHash!=bytes32(0),'agent/key');require(expires>block.timestamp&&expires<=block.timestamp+30 days,'expiry');grants[msg.sender][id][agent]=Grant(t.version,expires,capsuleHash,publicKeyHash);emit Access(msg.sender,id,agent,t.version,expires,capsuleHash,publicKeyHash);}
 function revoke(bytes32 id,address agent)external{require(tomes[msg.sender][id].version>0,'missing');delete grants[msg.sender][id][agent];emit Access(msg.sender,id,agent,0,0,bytes32(0),bytes32(0));}
 function archive(bytes32 id,bool value)external{require(tomes[msg.sender][id].version>0,'missing');tomes[msg.sender][id].archived=value;emit Archived(msg.sender,id,value);}
 function allowed(address owner,bytes32 id,address agent)external view returns(bool){Tome storage t=tomes[owner][id];Grant storage g=grants[owner][id][agent];return !t.archived&&t.version>0&&g.version==t.version&&g.expires>block.timestamp&&g.capsuleHash!=bytes32(0);}
}
