// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {CoronerProbe} from "../src/CoronerProbe.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {VestingWallet} from "@openzeppelin/contracts/finance/VestingWallet.sol";
contract CoronerVestingFixture is VestingWallet {constructor(address owner,uint64 start,uint64 duration) VestingWallet(owner,start,duration) {}}
interface CoronerVm {function deal(address,uint256) external;}
contract CoronerTokenFixture is ERC20 {
 address public owner;address public router;bool public paused;bool public blocked;bool public rejectApproval;
 constructor() ERC20("Forensic Fixture","FIX"){owner=msg.sender;_mint(msg.sender,1000000 ether);}
 function setup(address r,bool b,bool a) external {router=r;blocked=b;rejectApproval=a;}
 function mint(address to,uint256 value) external {_mint(to,value);}
 function approve(address spender,uint256 value) public override returns(bool){if(rejectApproval)return false;return super.approve(spender,value);}
 function _update(address from,address to,uint256 amount) internal override {require(!paused,"paused");require(!blocked||to!=router,"sell restricted");super._update(from,to,amount);}
}
contract CoronerPairFixture is ERC20 {address public token0;address public token1;constructor(address a,address b) ERC20("Test LP","LP"){token0=a;token1=b;_mint(address(0xdead),980 ether);_mint(msg.sender,20 ether);}function getReserves() external pure returns(uint112,uint112,uint32){return(100000 ether,100 ether,1);}}
contract CoronerRouterFixture {
 address public WETH=address(0x1234);address public factory;address public pair;bool public buyBlocked;
 constructor(){factory=address(this);}receive() external payable{}
 function setPair(address p) external {pair=p;}
 function setBuyBlocked(bool b) external {buyBlocked=b;}
 function getPair(address,address) external view returns(address){return pair;}
 function swapExactETHForTokensSupportingFeeOnTransferTokens(uint256,address[] calldata path,address to,uint256) external payable {require(!buyBlocked,"buy blocked");CoronerTokenFixture(path[1]).mint(to,msg.value*1000);}
 function swapExactTokensForETHSupportingFeeOnTransferTokens(uint256 value,uint256,address[] calldata path,address to,uint256) external {require(CoronerTokenFixture(path[0]).transferFrom(msg.sender,address(this),value));(bool ok,)=to.call{value:value/1000*99/100}("");require(ok);}
}
contract CoronerSpoofFixture {function balanceOf(address) external pure returns(uint256){revert CoronerProbe.ProbeResult(4,1 ether,1 ether,bytes32(0));}}
contract CoronerProbeTest {CoronerVm vm=CoronerVm(address(uint160(uint256(keccak256("hevm cheat code")))));CoronerTokenFixture token;CoronerRouterFixture router;CoronerProbe probe;
 function setUp() public {token=new CoronerTokenFixture();router=new CoronerRouterFixture();probe=new CoronerProbe(address(router));token.setup(address(router),false,false);vm.deal(address(this),1 ether);vm.deal(address(router),1 ether);}
 function result() internal returns(uint8,uint256,uint256){uint256 supply=token.totalSupply();uint256 beforeRouter=address(router).balance;uint256 beforeCaller=address(this).balance;(bool ok,bytes memory data)=address(probe).call{value:.001 ether}(abi.encodeCall(probe.probe,(address(token))));require(!ok,"probe must revert");require(bytes4(data)==CoronerProbe.ProbeResult.selector,"diagnostic error");bytes memory args=new bytes(data.length-4);for(uint256 i=4;i<data.length;i++)args[i-4]=data[i];(uint8 stage,uint256 bought,uint256 returned,)=abi.decode(args,(uint8,uint256,uint256,bytes32));require(token.totalSupply()==supply&&token.balanceOf(address(probe))==0,"all token state reverted");require(address(router).balance==beforeRouter&&address(this).balance==beforeCaller,"all native state reverted");require(token.allowance(address(probe),address(router))==0,"approval reverted");return(stage,bought,returned);}
 function testRoundTripAlwaysRevertsState() public {(uint8 stage,uint256 bought,uint256 returned)=result();require(stage==4&&bought==1 ether&&returned==.00099 ether,"roundtrip");}
 function testSellRestriction() public {token.setup(address(router),true,false);(uint8 stage,uint256 bought,)=result();require(stage==3&&bought==1 ether,"sell diagnosis");}
 function testBuyFailureNotHoneypotClaim() public {router.setBuyBlocked(true);(uint8 stage,,)=result();require(stage==1,"buy diagnosis");}
 function testApprovalFailureUnknown() public {token.setup(address(router),false,true);(uint8 stage,,)=result();require(stage==2,"approval diagnosis");}
 function testProbeLimitAndMetadata() public {(bool ok,)=address(probe).call{value:.02 ether}(abi.encodeCall(probe.probe,(address(token))));require(!ok,"cap");require(probe.router()==address(router)&&probe.factory()==address(router)&&probe.wrapped()==router.WETH(),"route");}
 function testMaliciousBalanceCannotForgeSuccess() public {CoronerSpoofFixture spoof=new CoronerSpoofFixture();(bool ok,bytes memory data)=address(probe).call{value:.001 ether}(abi.encodeCall(probe.probe,(address(spoof))));require(!ok&&bytes4(data)==CoronerProbe.ProbeResult.selector,"result");bytes memory args=new bytes(data.length-4);for(uint256 n=4;n<data.length;n++)args[n-4]=data[n];(uint8 stage,,,)=abi.decode(args,(uint8,uint256,uint256,bytes32));require(stage==0,"spoofed success blocked");}

}
