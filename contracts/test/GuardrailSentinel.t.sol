// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {GuardrailSentinel} from "../src/GuardrailSentinel.sol";
import {MockUSDC,Vm} from "./Agents.t.sol";
contract SentinelTarget {}
contract SentinelTest {
 Vm vm=Vm(address(uint160(uint256(keccak256("hevm cheat code")))));MockUSDC token;GuardrailSentinel sentinel;address owner;address guardian;address session=address(0x7777);SentinelTarget target;
 function setUp() public {owner=vm.addr(11);guardian=vm.addr(22);token=new MockUSDC();target=new SentinelTarget();sentinel=new GuardrailSentinel(owner,guardian,address(token));token.mint(address(this),100e6);token.approve(address(sentinel),type(uint256).max);grant(0);sentinel.fund(0,20e6);}
 function grant(uint256 id) internal {address[] memory targets=new address[](1);targets[0]=address(target);vm.prank(owner);sentinel.setPolicy(id,session,10e6,15e6,5e6,block.timestamp,block.timestamp+1 days,targets,false);}
 function permit(uint256 amount,bool human) internal view returns(GuardrailSentinel.Permit memory p){(,,,,,,,uint256 v,)=sentinel.policies(0);p=GuardrailSentinel.Permit(0,address(target),amount,sentinel.nonces(0),block.timestamp+300,sentinel.epoch(),v,human,keccak256(abi.encode(amount,sentinel.nonces(0))));}
 function signature(uint256 key,bytes32 d) internal returns(bytes memory){(uint8 v,bytes32 r,bytes32 s)=vm.sign(key,d);return abi.encodePacked(r,s,v);}
 function pay(GuardrailSentinel.Permit memory p,bool cosign) internal {pay(p,cosign,"");}
 function pay(GuardrailSentinel.Permit memory p,bool cosign,string memory error) internal {bytes32 d=sentinel.digest(p);bytes memory g=signature(22,d);bytes memory h=cosign?signature(11,d):bytes("");vm.prank(session);if(bytes(error).length>0)vm.expectRevert(bytes(error));sentinel.pay(p,g,h);}
 function testCapsAndDailyCounterSurvivesRegrant() public {pay(permit(5e6,false),false);pay(permit(10e6,false),true);grant(0);pay(permit(1,false),false,"daily or balance");require(token.balanceOf(address(target))==15e6,"payout");}
 function testThresholdAndLowConfidenceRequireBoundCosign() public {GuardrailSentinel.Permit memory p=permit(6e6,false);pay(p,false,"human cosign");pay(p,true);p=permit(1e6,true);pay(p,false,"human cosign");pay(p,true);}
 function testGlobalKillAndResumeDoNotReviveOldSessions() public {grant(1);GuardrailSentinel.Permit memory p=permit(1e6,false);vm.prank(guardian);sentinel.kill();pay(p,false,"session revoked");vm.prank(owner);sentinel.resume();pay(p,false,"session revoked");grant(0);pay(p,false,"session revoked");pay(permit(1e6,false),false);}
 function testReplayAndMutationFail() public {GuardrailSentinel.Permit memory p=permit(1e6,false);bytes memory g=signature(22,sentinel.digest(p));p.amount=2e6;vm.prank(session);vm.expectRevert(bytes("guardian signature"));sentinel.pay(p,g,"");p.amount=1e6;pay(p,false);pay(p,false,"replay");}
 function testUnauthorizedPolicyAndShutdown() public {vm.prank(session);vm.expectRevert(bytes("shutdown authority"));sentinel.kill();vm.prank(session);vm.expectRevert(bytes("owner only"));sentinel.recover(0,1);}
 function testWindowAndIsolation() public {grant(1);vm.warp(block.timestamp+1 days);pay(permit(1e6,false),false,"time window");require(sentinel.balances(1)==0&&sentinel.balances(0)==20e6,"isolation");}
 function testFuzzSpendConservation(uint64 raw) public {uint256 amount=uint256(raw)%10e6+1;pay(permit(amount,false),amount>5e6);require(token.balanceOf(address(target))==amount&&sentinel.balances(0)==20e6-amount,"conservation");}
 function testGuardianSignatureBoundToBaseNetwork() public {vm.chainId(84532);GuardrailSentinel.Permit memory p=permit(1e6,false);bytes memory g=signature(22,sentinel.digest(p));vm.chainId(8453);vm.prank(session);vm.expectRevert(bytes("guardian signature"));sentinel.pay(p,g,"");vm.chainId(84532);vm.prank(session);sentinel.pay(p,g,"");require(sentinel.nonces(0)==1,"nonce");}
 function testTargetAndPerTxCannotBeOverriddenByHuman() public {GuardrailSentinel.Permit memory p=permit(11e6,true);pay(p,true,"target or cap");p=permit(1e6,true);p.target=address(new SentinelTarget());pay(p,true,"target or cap");}

}
