// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MockUSDC} from "./Agents.t.sol";
/// Test-only interface double, NOT a Centrifuge deployment or a real fund.
contract ConciergeShare is ERC20 {
 address public immutable vault;
 constructor() ERC20("Test-only RWA share","TEST") {vault=msg.sender;}
 function decimals() public pure override returns(uint8){return 6;}
 function mint(address user,uint256 amount) external {require(msg.sender==vault,"vault");_mint(user,amount);}
 function burn(uint256 amount) external {require(msg.sender==vault,"vault");_burn(msg.sender,amount);}
}
contract ConciergeVaultFixture {
 IERC20 public immutable asset;ConciergeShare public immutable share;address public immutable manager;uint256 public pricePerShare=1e6;uint64 public priceLastUpdated;
 mapping(address=>bool) public isPermissioned;mapping(address=>uint256) public deposits;mapping(address=>uint256) public redemptions;mapping(address=>uint256) public maxMint;mapping(address=>uint256) public maxWithdraw;
 constructor(address token){asset=IERC20(token);share=new ConciergeShare();manager=msg.sender;priceLastUpdated=uint64(block.timestamp);}
 function setPermission(address user,bool allowed) external {require(msg.sender==manager,"manager");isPermissioned[user]=allowed;}
 function convertToShares(uint256 n) public view returns(uint256){return n*1e6/pricePerShare;}
 function convertToAssets(uint256 n) public view returns(uint256){return n*pricePerShare/1e6;}
 function pendingDepositRequest(uint256,address user) external view returns(uint256){return deposits[user];}
 function pendingRedeemRequest(uint256,address user) external view returns(uint256){return redemptions[user];}
 function requestDeposit(uint256 n,address controller,address owner) external returns(uint256){require(msg.sender==owner&&controller==owner&&isPermissioned[owner]&&n>0,"permission");require(asset.transferFrom(owner,address(this),n),"transfer");deposits[owner]+=n;return 0;}
 function mint(uint256 n,address receiver,address controller) external returns(uint256){require(controller==msg.sender&&receiver==msg.sender&&isPermissioned[controller]&&n>0&&n<=maxMint[controller],"claim");maxMint[controller]-=n;share.mint(receiver,n);return convertToAssets(n);}
 function requestRedeem(uint256 n,address controller,address owner) external returns(uint256){require(msg.sender==owner&&controller==owner&&isPermissioned[owner]&&n>0,"permission");require(share.transferFrom(owner,address(this),n),"transfer");redemptions[owner]+=n;return 0;}
 function withdraw(uint256 n,address receiver,address controller) external returns(uint256){require(controller==msg.sender&&receiver==msg.sender&&isPermissioned[controller]&&n>0&&n<=maxWithdraw[controller],"claim");maxWithdraw[controller]-=n;require(asset.transfer(receiver,n),"transfer");return convertToShares(n);}
 function fulfill(address user) external {require(msg.sender==manager,"manager");priceLastUpdated=uint64(block.timestamp);maxMint[user]+=convertToShares(deposits[user]);deposits[user]=0;maxWithdraw[user]+=convertToAssets(redemptions[user]);share.burn(redemptions[user]);redemptions[user]=0;}
}
contract ConciergeFeedFixture {
 string public description="USDC / USD";uint8 public decimals=8;int256 public answer=1e8;uint256 public updatedAt;
 constructor(){updatedAt=block.timestamp;}
 function set(int256 value,uint256 updated) external {answer=value;updatedAt=updated;}
 function latestRoundData() external view returns(uint80,int256,uint256,uint256,uint80){return(1,answer,updatedAt,updatedAt,1);}
}
contract ConciergeFixtureTest {
 function testActualRequestSettleClaimRedeemWithdraw() public {MockUSDC token=new MockUSDC();ConciergeVaultFixture vault=new ConciergeVaultFixture(address(token));vault.setPermission(address(this),true);token.mint(address(this),100e6);token.approve(address(vault),100e6);vault.requestDeposit(100e6,address(this),address(this));require(vault.deposits(address(this))==100e6&&vault.share().balanceOf(address(this))==0,"pending distinct");vault.fulfill(address(this));vault.mint(100e6,address(this),address(this));vault.share().approve(address(vault),100e6);vault.requestRedeem(100e6,address(this),address(this));require(vault.maxWithdraw(address(this))==0,"not settled");vault.fulfill(address(this));vault.withdraw(100e6,address(this),address(this));require(token.balanceOf(address(this))==100e6,"returned");}
 function testIssuerPermissionCannotBeSelfGranted() public {MockUSDC token=new MockUSDC();ConciergeVaultFixture vault=new ConciergeVaultFixture(address(token));token.mint(address(this),100e6);token.approve(address(vault),100e6);(bool ok,)=address(vault).call(abi.encodeCall(vault.requestDeposit,(100e6,address(this),address(this))));require(!ok&&token.balanceOf(address(this))==100e6,"eligibility gate");}
}
