// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
interface ICoronerToken {function balanceOf(address) external view returns(uint256);function approve(address,uint256) external returns(bool);}
interface ICoronerRouter {function WETH() external view returns(address);function factory() external view returns(address);function swapExactETHForTokensSupportingFeeOnTransferTokens(uint256,address[] calldata,address,uint256) external payable;function swapExactTokensForETHSupportingFeeOnTransferTokens(uint256,uint256,address[] calldata,address,uint256) external;}
/// Diagnostic only. EVERY probe ends in a revert, undoing buys, approvals and sells even if broadcast.
contract CoronerProbe {
 address public immutable router;address public immutable wrapped;address public immutable factory;
 error ProbeResult(uint8 stage,uint256 bought,uint256 returnedWei,bytes32 failureHash);
 constructor(address approvedRouter){require(approvedRouter!=address(0),"router");router=approvedRouter;wrapped=ICoronerRouter(router).WETH();factory=ICoronerRouter(router).factory();require(wrapped!=address(0)&&factory!=address(0),"router metadata");}
 receive() external payable {require(msg.sender==router,"router only");}
 function probe(address token) external payable {require(msg.value>0&&msg.value<=.01 ether&&token!=address(0)&&token!=wrapped,"diagnostic limits");address[] memory path=new address[](2);path[0]=wrapped;path[1]=token;uint256 beforeTokens=_balance(token);uint256 beforeEth=address(this).balance-msg.value;
 try ICoronerRouter(router).swapExactETHForTokensSupportingFeeOnTransferTokens{value:msg.value}(0,path,address(this),block.timestamp){ }catch(bytes memory reason){revert ProbeResult(1,0,0,keccak256(reason));}
 uint256 bought=_balance(token)-beforeTokens;if(bought==0)revert ProbeResult(1,0,0,keccak256("no buy output"));
 (bool ok,bytes memory result)=token.call(abi.encodeCall(ICoronerToken.approve,(router,bought)));if(!ok||(result.length!=0&&(result.length!=32||!abi.decode(result,(bool)))))revert ProbeResult(2,bought,0,keccak256(result));path[0]=token;path[1]=wrapped;
 try ICoronerRouter(router).swapExactTokensForETHSupportingFeeOnTransferTokens(bought,0,path,address(this),block.timestamp){ }catch(bytes memory reason){revert ProbeResult(3,bought,0,keccak256(reason));}
 revert ProbeResult(4,bought,address(this).balance-beforeEth,bytes32(0));
 }
 function _balance(address token) private view returns(uint256 value){try ICoronerToken(token).balanceOf(address(this)) returns(uint256 amount){return amount;}catch(bytes memory reason){revert ProbeResult(0,0,0,keccak256(reason));}}
}
