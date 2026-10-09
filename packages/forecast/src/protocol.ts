import {parseAbi} from 'viem';
export const forecastAbi=parseAbi([
 'function assertionBond(bytes32) view returns(uint256)','function assertionDeadline(bytes32) view returns(uint256)',
 'function count() view returns(uint256)','function paused() view returns(bool)','function owner() view returns(address)','function usdc() view returns(address)','function oracle() view returns(address)','function identifier() view returns(bytes32)','function liveness() view returns(uint64)',
 'function markets(uint256) view returns(string question,string rules,uint64 close,uint256 yesPool,uint256 noPool,bytes32 assertionId,uint8 proposed,uint8 outcome,bool disputed)',
 'function positions(uint256,address) view returns(uint256 yes,uint256 no,uint16 probability,bool agent,bool claimed)',
 'function participants(uint256) view returns(address[])','function risks(address) view returns(bool registered,bool paused,uint256 perTrade,uint256 perMarket,uint256 daily)','function spent(address,uint256) view returns(uint256)',
 'function create(string,string,uint64) returns(uint256)','function trade(uint256,bool,uint256,uint16)','function setRisk(address,uint256,uint256,uint256,bool)','function setPaused(bool)',
 'function assertOutcome(uint256,uint8,string) returns(bytes32)','function settle(uint256)','function claim(uint256)','function voidStale(uint256)',
 'event Traded(uint256 indexed id,address indexed trader,bool yes,uint256 amount,uint16 probability,bool agent)'
]);
export const oracleAbi=parseAbi(['function getMinimumBond(address) view returns(uint256)','function disputeAssertion(bytes32,address)']);
