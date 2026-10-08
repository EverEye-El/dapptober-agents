// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {InferenceAnchor} from '../src/InferenceAnchor.sol';
interface AnchorVm {function expectRevert(bytes calldata) external;function prank(address) external;}
contract InferenceAnchorTest {
 AnchorVm constant vm=AnchorVm(address(uint160(uint256(keccak256('hevm cheat code')))));
 function testImmutableCommitmentAndPublisher() public {InferenceAnchor a=new InferenceAnchor();bytes32 id=keccak256('receipt');a.anchor(id,'https://example.test/share/receipt');(address publisher,uint64 postedAt,string memory uri)=a.anchors(id);require(publisher==address(this)&&postedAt==block.timestamp&&keccak256(bytes(uri))==keccak256('https://example.test/share/receipt'),'incorrect commitment');vm.prank(address(7));vm.expectRevert(bytes('already anchored'));a.anchor(id,'different');}
 function testRejectEmptyCommitmentAndInvalidUri() public {InferenceAnchor a=new InferenceAnchor();vm.expectRevert(bytes('empty commitment'));a.anchor(0,'https://example.test');vm.expectRevert(bytes('invalid URI'));a.anchor(keccak256('receipt'),'');vm.expectRevert(bytes('invalid URI'));a.anchor(keccak256('receipt'),string(new bytes(513)));}
}
