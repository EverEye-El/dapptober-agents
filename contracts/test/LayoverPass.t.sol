// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Test} from 'forge-std/Test.sol';import {LayoverPass} from '../src/LayoverPass.sol';import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
contract TravelUSDC is ERC20 {constructor() ERC20('Fixture USDC','USDC'){}function mint(address a,uint256 n) external{_mint(a,n);}function decimals() public pure override returns(uint8){return 6;}}
contract LayoverPassTest is Test {TravelUSDC token;LayoverPass pass;address user=address(0xB0B);address treasury=address(0xCAFE);function setUp() public{vm.chainId(31337);token=new TravelUSDC();pass=new LayoverPass(address(token),treasury);token.mint(user,100e6);}
 function testPaidMint() public{vm.startPrank(user);token.approve(address(pass),1e6);pass.mint();assertEq(pass.ownerOf(1),user);assertEq(token.balanceOf(treasury),1e6);assertEq(token.allowance(user,address(pass)),0);vm.stopPrank();}
 function testNoAllowanceNoMint() public{vm.prank(user);vm.expectRevert();pass.mint();assertEq(pass.minted(),0);}
 function testWrongChain() public{vm.chainId(1);vm.expectRevert(bytes('Base only'));new LayoverPass(address(token),treasury);}
 function testBaseRejectsWrongToken() public{vm.chainId(84532);vm.expectRevert(bytes('USDC'));new LayoverPass(address(token),treasury);}
 function testFuzzNoFreeMint(uint96 amount) public{vm.assume(amount<1e6);vm.startPrank(user);token.approve(address(pass),amount);vm.expectRevert();pass.mint();assertEq(pass.minted(),0);vm.stopPrank();}
}
