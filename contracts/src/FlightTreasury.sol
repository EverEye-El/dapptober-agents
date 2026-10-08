// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
contract FlightTreasury is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    IERC20 public immutable usdc;
    address public agent;
    bool public paused = true;
    uint256 public maxMove;
    uint256 public minLiquidityBps;
    uint8 public maxRisk;
    uint256 public dailyCap;
    uint256 public expires;
    mapping(uint256 => uint256) public spent;
    mapping(bytes32 => bool) public executed;
    address[] public vaults;
    struct Rule { bool allowed; uint16 maxBps; uint8 risk; }
    mapping(address => Rule) public rules;
    event Plan(address indexed agent, uint256 maxMove, uint256 liquidity, uint8 risk);
    event Move(address indexed vault, uint256 assets, bool deposit, bytes32 reasoningHash);
    event Disengaged();
    constructor(address owner_, address token) Ownable(owner_) {usdc = IERC20(token);}
    function setPlan(address agent_, uint256 maxMove_, uint256 minBps, uint8 risk, uint256 daily, uint256 expiry) external onlyOwner { require(agent_ != address(0) && maxMove_ > 0 && minBps <= 10000 && daily >= maxMove_ && expiry > block.timestamp, "invalid plan"); agent = agent_; maxMove = maxMove_; minLiquidityBps = minBps; maxRisk = risk; dailyCap = daily; expires = expiry; paused = false; emit Plan(agent_, maxMove_, minBps, risk); }
    function setVault(address vault, uint16 maxBps, uint8 risk, bool allowed) external onlyOwner {require(maxBps <= 10000 && IERC4626(vault).asset() == address(usdc), "invalid vault"); if(rules[vault].maxBps == 0 && !rules[vault].allowed) {bool found; for(uint256 i; i<vaults.length;i++) if(vaults[i]==vault) found=true; if(!found) {require(vaults.length<16,"too many vaults");vaults.push(vault);} } rules[vault] = Rule(allowed,maxBps,risk); }
    function totalAssets() public view returns(uint256 total) {total=usdc.balanceOf(address(this)); for(uint256 i;i<vaults.length;i++) total+=IERC4626(vaults[i]).convertToAssets(IERC20(vaults[i]).balanceOf(address(this)));}
    function deposit(address vault, uint256 assets, uint256 minShares, bytes32 reason) external nonReentrant {require(msg.sender == agent && !paused && block.timestamp < expires,"inactive"); Rule memory r=rules[vault];require(r.allowed && r.risk <= maxRisk && assets>0 && assets<=maxMove,"policy");uint256 day=block.timestamp/1 days;require(spent[day]+assets<=dailyCap,"daily cap");uint256 total=totalAssets(); uint256 liquid=usdc.balanceOf(address(this));require(assets<=liquid && (liquid-assets)*10000>=total*minLiquidityBps,"liquidity");uint256 allocated=IERC4626(vault).convertToAssets(IERC20(vault).balanceOf(address(this)));require((allocated+assets)*10000<=total*r.maxBps,"allocation");require(!executed[reason], "request replay"); executed[reason]=true;spent[day]+=assets; usdc.forceApprove(vault, assets); uint256 shares=IERC4626(vault).deposit(assets,address(this)); require(shares>0 && shares>=minShares,"slippage");usdc.forceApprove(vault,0);emit Move(vault,assets,true,reason);}
    function withdraw(address vault, uint256 assets, uint256 maxShares, bytes32 reason) external nonReentrant {require(msg.sender==owner() || (msg.sender==agent && !paused && block.timestamp<expires && assets<=maxMove),"inactive");require(assets>0 && rules[vault].maxBps>0,"unknown vault");if(msg.sender==agent){uint256 day=block.timestamp/1 days;require(spent[day]+assets<=dailyCap,"daily cap");require(!executed[reason],"request replay");executed[reason]=true;spent[day]+=assets;}uint256 shares=IERC4626(vault).withdraw(assets,address(this),address(this));require(shares<=maxShares,"slippage");emit Move(vault,assets,false,reason);}
    function disengage() external onlyOwner {paused=true; agent=address(0);emit Disengaged();}
    function withdrawAll() external onlyOwner nonReentrant {paused=true;agent=address(0);for(uint256 i;i<vaults.length;i++){uint256 shares=IERC20(vaults[i]).balanceOf(address(this));if(shares>0) IERC4626(vaults[i]).redeem(shares,address(this),address(this));}usdc.safeTransfer(owner(),usdc.balanceOf(address(this)));emit Disengaged();}
    // Individual recovery remains available if one illiquid vault makes withdrawAll revert.
    function recoverLiquid() external onlyOwner nonReentrant {paused=true;agent=address(0);usdc.safeTransfer(owner(),usdc.balanceOf(address(this)));emit Disengaged();}
}
