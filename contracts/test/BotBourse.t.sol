// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {BotBourse} from "../src/BotBourse.sol";
import {MockUSDC} from "./Agents.t.sol";
interface BourseVm {function addr(uint256) external returns(address);function prank(address) external;function warp(uint256) external;function sign(uint256,bytes32) external returns(uint8,bytes32,bytes32);function expectRevert(bytes calldata) external;}
contract BourseRegistryFixture {mapping(uint256=>address) public wallets;function set(uint256 id,address wallet) external {wallets[id]=wallet;}function getAgentWallet(uint256 id) external view returns(address){return wallets[id];}}
contract BotBourseTest {
 BourseVm vm=BourseVm(address(uint160(uint256(keccak256("hevm cheat code")))));MockUSDC token;BourseRegistryFixture registry;BotBourse escrow;address buyer;address seller;BotBourse.Offer offer;
 function setUp() public {vm.warp(100000);buyer=vm.addr(901);seller=vm.addr(902);token=new MockUSDC();registry=new BourseRegistryFixture();registry.set(1,buyer);registry.set(2,seller);escrow=new BotBourse(address(token),address(registry),address(this),25e6);token.mint(buyer,100e6);vm.prank(buyer);token.approve(address(escrow),100e6);offer=BotBourse.Offer(keccak256("order"),buyer,seller,1,2,keccak256("brief"),4e6,block.timestamp+3600,block.timestamp+300);}
 function sig(bytes32 digest,uint256 key) internal returns(bytes memory){(uint8 v,bytes32 r,bytes32 s)=vm.sign(key,digest);return abi.encodePacked(r,s,v);}
 function fund() internal {bytes memory signature=sig(escrow.offerDigest(offer),902);vm.prank(buyer);escrow.open(offer,signature);}
 function deliver() internal {bytes32 h=keccak256("output");escrow.deliver(offer.id,h,sig(escrow.deliveryDigest(offer.id,h),902));}
 function testFundDeliveryConfirm() public {fund();deliver();vm.prank(buyer);escrow.confirm(offer.id);require(token.balanceOf(seller)==4e6&&token.balanceOf(buyer)==96e6&&token.balanceOf(address(escrow))==0,"conservation");vm.prank(buyer);vm.expectRevert(bytes("buyer delivery review"));escrow.confirm(offer.id);}
 function testChangedRegistryAndBadSignature() public {registry.set(2,buyer);vm.prank(buyer);vm.expectRevert(bytes("registry wallet"));escrow.open(offer,hex"00");registry.set(2,seller);vm.prank(buyer);vm.expectRevert(bytes("seller signature"));escrow.open(offer,hex"00");}
 function testNoUnauthorizedOrAlteredTerms() public {bytes memory signature=sig(escrow.offerDigest(offer),902);offer.amount=5e6;vm.prank(buyer);vm.expectRevert(bytes("seller signature"));escrow.open(offer,signature);vm.expectRevert(bytes("buyer only"));escrow.open(offer,signature);}
 function testExpiryAndCapAndReplay() public {offer.amount=26e6;vm.prank(buyer);vm.expectRevert(bytes("amount cap"));escrow.open(offer,hex"00");offer.amount=4e6;fund();vm.prank(buyer);vm.expectRevert(bytes("duplicate or invalid"));escrow.open(offer,hex"00");}
 function testExpiredOffer() public {vm.warp(offer.expires+1);vm.prank(buyer);vm.expectRevert(bytes("deadline"));escrow.open(offer,hex"00");}
 function testRefundAndLateDelivery() public {fund();vm.warp(offer.deliverBy+1);bytes32 h=keccak256("late");bytes memory signature=sig(escrow.deliveryDigest(offer.id,h),902);vm.expectRevert(bytes("not deliverable"));escrow.deliver(offer.id,h,signature);escrow.refund(offer.id);require(token.balanceOf(buyer)==100e6,"refund");}
 function testDisputeSplitAndTimeout() public {fund();deliver();vm.prank(buyer);escrow.dispute(offer.id);vm.expectRevert(bytes("review window"));escrow.release(offer.id);vm.warp(block.timestamp+7 days);escrow.timeout(offer.id);require(token.balanceOf(seller)==2e6&&token.balanceOf(buyer)==98e6,"fallback split");}
 function testArbiterAndRelease() public {fund();deliver();vm.prank(buyer);escrow.dispute(offer.id);vm.prank(seller);vm.expectRevert(bytes("arbiter dispute only"));escrow.resolve(offer.id,10000);escrow.resolve(offer.id,2500);require(token.balanceOf(seller)==1e6&&token.balanceOf(buyer)==99e6,"arbiter split");}
 function testPauseDoesNotTrapFunds() public {fund();escrow.setPaused(true);vm.warp(offer.deliverBy+1);escrow.refund(offer.id);require(token.balanceOf(buyer)==100e6,"pause refund");}
 function testSellerReleaseAfterReview() public {fund();deliver();vm.warp(block.timestamp+1 days);escrow.release(offer.id);require(token.balanceOf(seller)==4e6,"release");}
 function testFuzzConservation(uint96 value,uint16 split) public {offer.amount=uint256(value)%25e6+1;fund();deliver();vm.prank(buyer);escrow.dispute(offer.id);escrow.resolve(offer.id,uint256(split)%10001);require(token.balanceOf(buyer)+token.balanceOf(seller)==100e6&&token.balanceOf(address(escrow))==0,"conservation");}
}
