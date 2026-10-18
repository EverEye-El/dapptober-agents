// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;
import {FHE,euint64,eaddress,ebool,externalEuint64} from "@fhenixprotocol/cofhe-contracts/FHE.sol";
/// @notice Confidential allocation-credit auction. Credits are self-declared, NOT cash or a token claim.
/// @dev Inputs are verified client ciphertexts; no plaintext amount, public decrypt or financial custody API.
contract EncryptedConfidant {
    address public immutable guardian;
    bool public paused;
    uint256 public count;
    mapping(address=>bool) public initialized;
    mapping(address=>euint64) public budgets;
    struct Lot {address creator; uint64 end; bool closed; euint64 highest; eaddress winner; uint32 bids;}
    mapping(uint256=>Lot) public lots;
    mapping(uint256=>mapping(address=>bool)) public submitted;
    mapping(uint256=>mapping(address=>bool)) public settled;
    mapping(uint256=>mapping(address=>euint64)) public reservations;
    event Opened(uint256 indexed id,address indexed creator,uint64 end);
    event Sealed(uint256 indexed id,address indexed bidder,bytes32 handle);
    event Closed(uint256 indexed id);
    event Settled(uint256 indexed id,address indexed bidder);
    event BudgetInitialized(address indexed owner,bytes32 handle);
    event Paused(bool paused);
    constructor(){guardian=msg.sender;}
    function version() external pure returns(bytes32){return keccak256("HUSH_ALLOCATION_V1");}
    function pause(bool value) external {require(msg.sender==guardian,"guardian only");paused=value;emit Paused(value);}
    function initializeBudget(externalEuint64 amount,bytes calldata proof) external {
        require(!paused&&!initialized[msg.sender],"paused or initialized");
        euint64 balance=FHE.asEuint64(amount,proof);
        budgets[msg.sender]=balance;initialized[msg.sender]=true;
        FHE.allowThis(balance);FHE.allowSender(balance);
        emit BudgetInitialized(msg.sender,euint64.unwrap(balance));
    }
    function open(uint64 end) external returns(uint256 id){
        require(!paused&&end>block.timestamp&&end<=block.timestamp+30 days,"invalid deadline or paused");
        id=++count;Lot storage l=lots[id];l.creator=msg.sender;l.end=end;
        l.highest=FHE.asEuint64(0);l.winner=FHE.asEaddress(address(0));
        FHE.allowThis(l.highest);FHE.allowThis(l.winner);emit Opened(id,msg.sender,end);
    }
    function bid(uint256 id,externalEuint64 amount,bytes calldata proof) external {
        Lot storage l=lots[id];require(!paused&&l.creator!=address(0)&&!l.closed&&block.timestamp<l.end,"not open");
        require(initialized[msg.sender]&&!submitted[id][msg.sender],"initialize or duplicate bid");
        euint64 proposed=FHE.asEuint64(amount,proof);
        // Insufficient allocation becomes encrypted zero, with identical public control flow.
        euint64 accepted=FHE.select(FHE.lte(proposed,budgets[msg.sender]),proposed,FHE.asEuint64(0));
        budgets[msg.sender]=FHE.sub(budgets[msg.sender],accepted);
        reservations[id][msg.sender]=accepted;submitted[id][msg.sender]=true;l.bids++;
        ebool higher=FHE.gt(accepted,l.highest);
        l.highest=FHE.select(higher,accepted,l.highest);
        l.winner=FHE.select(higher,FHE.asEaddress(msg.sender),l.winner);
        FHE.allowThis(budgets[msg.sender]);FHE.allowSender(budgets[msg.sender]);
        FHE.allowThis(accepted);FHE.allowSender(accepted);
        FHE.allowThis(l.highest);FHE.allowThis(l.winner);
        emit Sealed(id,msg.sender,euint64.unwrap(accepted));
    }
    function close(uint256 id) external {
        Lot storage l=lots[id];require(l.creator!=address(0)&&!l.closed&&block.timestamp>=l.end,"not closable");
        l.closed=true;FHE.allow(l.highest,l.creator);FHE.allow(l.winner,l.creator);emit Closed(id);
    }
    function settle(uint256 id) external {
        Lot storage l=lots[id];require(l.closed&&submitted[id][msg.sender]&&!settled[id][msg.sender],"not settleable");
        settled[id][msg.sender]=true;
        ebool won=FHE.eq(l.winner,FHE.asEaddress(msg.sender));
        euint64 refund=FHE.select(won,FHE.asEuint64(0),reservations[id][msg.sender]);
        budgets[msg.sender]=FHE.add(budgets[msg.sender],refund);
        FHE.allowThis(budgets[msg.sender]);FHE.allowSender(budgets[msg.sender]);emit Settled(id,msg.sender);
    }
}
