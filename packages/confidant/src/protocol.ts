import {parseAbi} from 'viem';
export const confidantAbi=parseAbi([
 'function version() pure returns(bytes32)',
 'function guardian() view returns(address)','function paused() view returns(bool)',
 'function initialized(address) view returns(bool)','function budgets(address) view returns(bytes32)',
 'function count() view returns(uint256)',
 'function lots(uint256) view returns(address creator,uint64 end,bool closed,bytes32 highest,bytes32 winner,uint32 bids)',
 'function submitted(uint256,address) view returns(bool)','function settled(uint256,address) view returns(bool)',
 'function reservations(uint256,address) view returns(bytes32)',
 'function initializeBudget(bytes32 amount,bytes proof)',
 'function open(uint64 end)','function bid(uint256 id,bytes32 amount,bytes proof)',
 'function close(uint256 id)','function settle(uint256 id)','function pause(bool value)',
 'event Opened(uint256 indexed id,address indexed creator,uint64 end)',
 'event Sealed(uint256 indexed id,address indexed bidder,bytes32 handle)',
 'event Closed(uint256 indexed id)','event Settled(uint256 indexed id,address indexed bidder)',
]);
export const intents=['sealed-bid','hidden-order','payroll'] as const;
export type Intent=typeof intents[number];
export function parseCredits(value:string):bigint{if(!/^\d{1,20}$/.test(value))throw new Error('Use whole allocation credits');const n=BigInt(value);if(n<=0n||n>18446744073709551615n)throw new Error('Credits must fit a positive uint64');return n;}
export function localIntent(text:string):Intent|undefined{const t=text.toLowerCase(),matches=[/\bbid\b|auction/.test(t),/limit|order/.test(t),/payroll|salary/.test(t)];if(matches.filter(Boolean).length!==1)return;return intents[matches.indexOf(true)];}
