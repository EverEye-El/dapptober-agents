// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import 'forge-std/Test.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '../src/Spillway.sol';
contract WaterfallUSDC is ERC20 {constructor()ERC20('Fixture USDC','USDC'){}function decimals()public pure override returns(uint8){return 6;}function mint(address to,uint256 amount)external{_mint(to,amount);}}
/// @dev Deliberate protocol double, not Superfluid bytecode or production evidence.
contract WaterfallSuperToken is IERC20 {
 string public constant name='Fixture USDCx';string public constant symbol='USDCx';uint8 public constant decimals=18;
 address public immutable getUnderlyingToken;address public immutable getHost;address public forwarder;
 uint256 public totalSupply;mapping(address=>mapping(address=>uint256))public allowance;
 mapping(address=>int256)private principal;mapping(address=>int256)public net;mapping(address=>uint256)public last;mapping(address=>uint256)public deposits;
 constructor(address usdc,address host){getUnderlyingToken=usdc;getHost=host;}
 function setForwarder(address f)external{require(forwarder==address(0));forwarder=f;}
 function value(address a)public view returns(int256){return principal[a]+net[a]*int256(block.timestamp-last[a]);}
 function settle(address a)internal{principal[a]=value(a);last[a]=block.timestamp;}
 function balanceOf(address a)public view returns(uint256){int256 v=value(a)-int256(deposits[a]);return v>0?uint256(v):0;}
 function realtimeBalanceOfNow(address a)external view returns(int256,uint256,uint256,uint256){return(value(a)-int256(deposits[a]),deposits[a],0,block.timestamp);}
 function approve(address spender,uint256 amount)external returns(bool){allowance[msg.sender][spender]=amount;emit Approval(msg.sender,spender,amount);return true;}
 function transfer(address to,uint256 amount)external returns(bool){move(msg.sender,to,amount);return true;}
 function transferFrom(address from,address to,uint256 amount)external returns(bool){require(allowance[from][msg.sender]>=amount,'allowance');allowance[from][msg.sender]-=amount;move(from,to,amount);return true;}
 function move(address from,address to,uint256 amount)internal{require(balanceOf(from)>=amount,'balance');settle(from);settle(to);principal[from]-=int256(amount);principal[to]+=int256(amount);emit Transfer(from,to,amount);}
 function mint(address a,uint256 amount)external{settle(a);principal[a]+=int256(amount);totalSupply+=amount;}
 function upgrade(uint256 amount)external{require(amount%1e12==0,'precision');require(IERC20(getUnderlyingToken).transferFrom(msg.sender,address(this),amount/1e12));settle(msg.sender);principal[msg.sender]+=int256(amount);totalSupply+=amount;}
 function downgrade(uint256 amount)external{require(amount%1e12==0&&balanceOf(msg.sender)>=amount);settle(msg.sender);principal[msg.sender]-=int256(amount);totalSupply-=amount;require(IERC20(getUnderlyingToken).transfer(msg.sender,amount/1e12));}
 function change(address from,address to,int96 oldRate,int96 newRate)external{require(msg.sender==forwarder);settle(from);settle(to);net[from]+=int256(oldRate)-int256(newRate);net[to]+=int256(newRate)-int256(oldRate);deposits[from]=uint256(uint96(newRate))*4 hours;require(value(from)>=int256(deposits[from]),'buffer');}
}
contract WaterfallForwarder {
 mapping(bytes32=>int96)private flows;
 function getFlowrate(address token,address from,address to)external view returns(int96){return flows[keccak256(abi.encode(token,from,to))];}
 function getBufferAmountByFlowrate(address,int96 rate)external pure returns(uint256){return uint256(uint96(rate))*4 hours;}
 function setFlowrate(address token,address to,int96 rate)external returns(bool){bytes32 key=keccak256(abi.encode(token,msg.sender,to));int96 old=flows[key];WaterfallSuperToken(token).change(msg.sender,to,old,rate);flows[key]=rate;return true;}
}
contract SpillwayTest is Test {
 WaterfallSuperToken token;WaterfallForwarder f;SpillwayFactory factory;SpillwayChannel channel;address owner=address(0xA11CE);address agent=address(0xB0B);address receiver=address(0xCAFE);int96 constant RATE=1e15;
 function setUp()public{WaterfallUSDC usdc=new WaterfallUSDC();token=new WaterfallSuperToken(address(usdc),address(0x123));f=new WaterfallForwarder();token.setForwarder(address(f));factory=new SpillwayFactory(address(token),address(f));vm.prank(owner);channel=SpillwayChannel(factory.create(receiver,agent,RATE,3600,1000e18,2e18));token.mint(owner,1000e18);vm.startPrank(owner);token.approve(address(channel),1000e18);channel.fund(100e18);vm.stopPrank();}
 function start()internal{vm.prank(agent);channel.start(bytes32(uint256(1)),60,block.timestamp+90);}
 function testAgentStartsFixedFlowAndReceiverAccrues()public{start();vm.warp(block.timestamp+20);assertEq(token.balanceOf(receiver),20*uint256(uint96(RATE)));vm.prank(receiver);channel.pause();uint256 earned=token.balanceOf(receiver);vm.warp(block.timestamp+200);assertEq(token.balanceOf(receiver),earned);assertEq(channel.deadline(),0);}
 function testStrangerCannotStartPauseWithdrawOrRevoke()public{vm.startPrank(address(99));vm.expectRevert(bytes('authority'));channel.start(bytes32(uint256(1)),60,block.timestamp+90);vm.expectRevert(bytes('authority'));channel.pause();vm.expectRevert(bytes('owner'));channel.withdraw(1);vm.expectRevert(bytes('owner'));channel.setAgentEnabled(false);vm.stopPrank();}
 function testDurationAndBufferRequired()public{vm.startPrank(owner);vm.expectRevert(bytes('duration'));channel.start(bytes32(uint256(1)),3601,block.timestamp+90);channel.withdraw(95e18);vm.expectRevert(bytes('runway'));channel.start(bytes32(uint256(1)),60,block.timestamp+90);vm.stopPrank();}
 function testExpiredLeaseRequiresTransactionAndAnyoneCanStop()public{start();vm.warp(block.timestamp+61);assertGt(token.balanceOf(receiver),60*uint256(uint96(RATE)));vm.prank(address(99));channel.expire();assertEq(channel.deadline(),0);assertEq(f.getFlowrate(address(token),address(channel),receiver),0);}
 function testStaleStartCannotBeginLater()public{vm.prank(agent);vm.expectRevert(bytes('stale'));channel.start(bytes32(uint256(99)),60,block.timestamp-1);}
 function testEarlyExpiryCannotStop()public{start();vm.expectRevert(bytes('not expired'));channel.expire();}
 function testReplayIsRejectedAfterStop()public{start();vm.prank(owner);channel.pause();vm.prank(agent);vm.expectRevert(bytes('job'));channel.start(bytes32(uint256(1)),60,block.timestamp+90);}
 function testRevocationImmediatelyStopsAndRejectsAgent()public{start();vm.prank(owner);channel.setAgentEnabled(false);assertEq(channel.deadline(),0);vm.prank(agent);vm.expectRevert(bytes('authority'));channel.start(bytes32(uint256(2)),60,block.timestamp+90);vm.prank(owner);channel.start(bytes32(uint256(2)),60,block.timestamp+90);}
 function testBudgetLifetimeIncludesWithdrawnFunds()public{vm.startPrank(owner);channel.withdraw(50e18);channel.fund(900e18);vm.expectRevert(bytes('budget'));channel.fund(1);vm.stopPrank();}
 function testCannotWithdrawActiveFlow()public{start();vm.prank(owner);vm.expectRevert(bytes('pause first'));channel.withdraw(1);}
 function testSafetyStopReserve()public{start();vm.expectRevert(bytes('safe'));channel.safetyStop();vm.warp(block.timestamp+84000);channel.safetyStop();assertEq(channel.deadline(),0);}
 function testFuzzConservationAfterPause(uint32 elapsed)public{elapsed=uint32(bound(elapsed,1,3600));start();vm.warp(block.timestamp+elapsed);vm.prank(agent);channel.pause();assertEq(token.balanceOf(owner)+token.balanceOf(receiver)+token.balanceOf(address(channel)),1000e18);uint256 remaining=token.balanceOf(address(channel));vm.prank(owner);channel.withdraw(remaining);assertEq(token.balanceOf(owner)+token.balanceOf(receiver),1000e18);}
 function testFactoryTracksOwnerAndCapsChannels()public{assertTrue(factory.isChannel(address(channel)));assertEq(factory.channelsOf(owner).length,1);vm.startPrank(owner);for(uint256 i=1;i<32;i++)factory.create(receiver,agent,RATE,60,100e18,1e18);vm.expectRevert(bytes('capacity'));factory.create(receiver,agent,RATE,60,100e18,1e18);vm.stopPrank();}
}
