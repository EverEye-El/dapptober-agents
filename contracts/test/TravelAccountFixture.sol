// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {IERC721Receiver} from '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';
/// @dev Local receipt-verification fixture. NOT a bundler, paymaster, EntryPoint implementation or production smart account.
contract TravelAccountFixture is IERC721Receiver {
 address public immutable entryPoint;
 constructor(address ep){entryPoint=ep;}
 function execute(address target,uint256 value,bytes calldata data) external{require(msg.sender==entryPoint);(bool ok,bytes memory result)=target.call{value:value}(data);if(!ok)assembly{revert(add(result,32),mload(result))}}
 function onERC721Received(address,address,uint256,bytes calldata) external pure returns(bytes4){return IERC721Receiver.onERC721Received.selector;}
}
contract TravelEntryPointFixture {
 event UserOperationEvent(bytes32 indexed userOpHash,address indexed sender,address indexed paymaster,uint256 nonce,bool success,uint256 actualGasCost,uint256 actualGasUsed);
 function handle(address sender,bytes calldata callData,bytes32 id) external{(bool ok,bytes memory result)=sender.call(callData);if(!ok)assembly{revert(add(result,32),mload(result))}emit UserOperationEvent(id,sender,address(0xCAFE),0,true,0,0);}
}
