// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import 'forge-std/Test.sol';import '../src/MemoryCathedral.sol';
contract MemoryCathedralTest is Test {
 MemoryCathedral m;address owner=address(10);address agent=address(11);bytes32 id=keccak256('tome');bytes32 content=keccak256('ciphertext');
 function setUp()public{m=new MemoryCathedral();vm.prank(owner);m.write(id,0,content,'bafy-encrypted-memory-cid');}
 function grant()internal{vm.prank(owner);m.grant(id,agent,1,uint64(block.timestamp+1 days),keccak256('capsule'),keccak256('public key'));}
 function testOwnerPointerAndGrant()public{grant();assertTrue(m.allowed(owner,id,agent));(uint64 version,bytes32 d,,)=m.tomes(owner,id);assertEq(version,1);assertEq(d,content);}
 function testStrangerCannotChangeOwnerPointerOrGrant()public{vm.prank(agent);vm.expectRevert('version');m.grant(id,address(12),1,uint64(block.timestamp+1 days),content,content);vm.prank(agent);m.write(id,0,keccak256('other'),'bafy-attacker-own-namespace');(,bytes32 d,,)=m.tomes(owner,id);assertEq(d,content);}
 function testRevocationAndExpiry()public{grant();vm.prank(owner);m.revoke(id,agent);assertFalse(m.allowed(owner,id,agent));grant();vm.warp(block.timestamp+1 days);assertFalse(m.allowed(owner,id,agent));}
 function testRotationInvalidatesEveryOldGrant()public{grant();vm.prank(owner);m.write(id,1,keccak256('new key ciphertext'),'bafy-next-encrypted-memory');assertFalse(m.allowed(owner,id,agent));vm.prank(owner);vm.expectRevert('version');m.grant(id,agent,1,uint64(block.timestamp+1 days),content,content);}
 function testStalePointerCannotOverwrite()public{vm.prank(owner);vm.expectRevert('stale version');m.write(id,0,content,'bafy-stale-pointer');}
 function testArchiveBlocksAndRestoreIsExplicit()public{grant();vm.prank(owner);m.archive(id,true);assertFalse(m.allowed(owner,id,agent));vm.prank(owner);vm.expectRevert('archived');m.write(id,1,content,'bafy-archived-pointer');vm.prank(owner);m.archive(id,false);assertTrue(m.allowed(owner,id,agent));}
 function testInvalidGrantAndPointer()public{vm.startPrank(owner);vm.expectRevert('agent/key');m.grant(id,owner,1,uint64(block.timestamp+1 days),content,content);vm.expectRevert('expiry');m.grant(id,agent,1,uint64(block.timestamp+31 days),content,content);vm.expectRevert('pointer');m.write(bytes32(0),0,content,'bafy-valid-cid');vm.stopPrank();}
 function testFuzzVersionAndOwnership(bytes32 next)public{vm.assume(next!=bytes32(0));grant();vm.prank(owner);m.write(id,1,next,'bafy-encrypted-second-version');assertFalse(m.allowed(owner,id,agent));(uint64 v,bytes32 d,,)=m.tomes(owner,id);assertEq(v,2);assertEq(d,next);}
}
