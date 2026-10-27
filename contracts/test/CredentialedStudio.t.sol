// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import 'forge-std/Test.sol';import '../src/CredentialedStudio.sol';
contract CredentialedStudioTest is Test {
 CredentialedStudio drop;uint256 key=111;address creator=address(0x1234);bytes32 domain;
 function setUp()public{vm.chainId(31337);drop=new CredentialedStudio(address(this),vm.addr(key));domain=keccak256(abi.encode(keccak256('EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'),keccak256('Credentialed Studio'),keccak256('1'),block.chainid,address(drop)));}
 function permit()internal view returns(CredentialedStudio.Permit memory){return CredentialedStudio.Permit(creator,keccak256('file'),keccak256('manifest'),keccak256('model'),bytes32(0),'ipfs://metadata',block.timestamp+900);}
 function sig(CredentialedStudio.Permit memory p,uint256 k)internal view returns(bytes memory){bytes32 h=keccak256(abi.encode(drop.TYPEHASH(),p.recipient,p.contentHash,p.manifestHash,p.modelHash,p.parentHash,keccak256(bytes(p.uri)),p.deadline));(uint8 v,bytes32 r,bytes32 s)=vm.sign(k,keccak256(abi.encodePacked('\x19\x01',domain,h)));return abi.encodePacked(r,s,v);}
 function testMintAndReplay()public{CredentialedStudio.Permit memory p=permit();bytes memory signature=sig(p,key);vm.prank(creator);drop.mint(p,signature);assertEq(drop.ownerOf(1),creator);assertEq(drop.tokenURI(1),p.uri);assertEq(drop.tokenForHash(p.contentHash),1);vm.prank(creator);vm.expectRevert('duplicate');drop.mint(p,signature);}
 function testRecipientAndTampering()public{CredentialedStudio.Permit memory p=permit();bytes memory signature=sig(p,key);vm.expectRevert('recipient');drop.mint(p,signature);p.manifestHash=keccak256('tamper');vm.prank(creator);vm.expectRevert('verifier');drop.mint(p,signature);}
 function testExpiredAndWrongSigner()public{CredentialedStudio.Permit memory p=permit();bytes memory signature=sig(p,222);vm.prank(creator);vm.expectRevert('verifier');drop.mint(p,signature);signature=sig(p,key);vm.warp(p.deadline+1);vm.prank(creator);vm.expectRevert('deadline');drop.mint(p,signature);}
 function testPauseAndAuthority()public{drop.configure(vm.addr(key),true);CredentialedStudio.Permit memory p=permit();bytes memory signature=sig(p,key);vm.prank(creator);vm.expectRevert('paused');drop.mint(p,signature);vm.prank(creator);vm.expectRevert();drop.configure(creator,false);}
 function testRotationInvalidatesOldPermit()public{CredentialedStudio.Permit memory p=permit();bytes memory signature=sig(p,key);drop.configure(vm.addr(222),false);vm.prank(creator);vm.expectRevert('verifier');drop.mint(p,signature);}
 function testWrongChainDomain()public{CredentialedStudio.Permit memory p=permit();bytes memory signature=sig(p,key);vm.chainId(84532);vm.prank(creator);vm.expectRevert('verifier');drop.mint(p,signature);}
 function testFuzzBindsFile(bytes32 hash)public{vm.assume(hash!=bytes32(0)&&hash!=keccak256('file'));CredentialedStudio.Permit memory p=permit();bytes memory signature=sig(p,key);p.contentHash=hash;vm.prank(creator);vm.expectRevert('verifier');drop.mint(p,signature);}
}
