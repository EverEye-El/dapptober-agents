// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ERC721} from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import {IERC20} from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import {SafeERC20} from '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
/// @notice User-called fixed-price souvenir, no agent spending or withdrawal authority.
contract LayoverPass is ERC721, ReentrancyGuard {
 using SafeERC20 for IERC20;
 IERC20 public immutable usdc; address public immutable treasury; uint256 public constant price=1e6; uint256 public minted;
 constructor(address token,address recipient) ERC721('Layover Frequent Degen','LVR') {require(token.code.length>0&&recipient!=address(0),'configuration');if(block.chainid==8453)require(token==0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913,'USDC');else if(block.chainid==84532)require(token==0x036CbD53842c5426634e7929541eC2318f3dCF7e,'USDC');else require(block.chainid==31337,'Base only');usdc=IERC20(token);treasury=recipient;}
 function mint() external nonReentrant returns(uint256 id){uint256 beforeBalance=usdc.balanceOf(treasury);usdc.safeTransferFrom(msg.sender,treasury,price);require(usdc.balanceOf(treasury)==beforeBalance+price,'payment');id=++minted;_safeMint(msg.sender,id);}
 function tokenURI(uint256 id) public view override returns(string memory){_requireOwned(id);return 'data:application/json,{"name":"Layover Frequent Degen","description":"One USDC. One boarding pass. No yield, rewards or travel entitlement."}';}
}
