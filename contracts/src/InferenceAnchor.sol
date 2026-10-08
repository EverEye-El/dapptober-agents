// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
/// @notice Immutable publication commitments. This contract does not verify DCAP or inference correctness.
contract InferenceAnchor {
 struct Entry {address publisher;uint64 postedAt;string uri;}
 mapping(bytes32=>Entry) public anchors;
 event Anchored(bytes32 indexed commitment,address indexed publisher,string uri);
 function anchor(bytes32 commitment,string calldata uri) external {
  require(commitment!=bytes32(0),"empty commitment");
  require(bytes(uri).length>0&&bytes(uri).length<=512,"invalid URI");
  require(anchors[commitment].publisher==address(0),"already anchored");
  anchors[commitment]=Entry(msg.sender,uint64(block.timestamp),uri);
  emit Anchored(commitment,msg.sender,uri);
 }
}
