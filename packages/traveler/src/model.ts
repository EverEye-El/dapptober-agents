import {z} from 'zod';
export const address=z.string().regex(/^0x[0-9a-fA-F]{40}$/);export const hash=z.string().regex(/^0x[0-9a-fA-F]{64}$/);export const hex=z.string().regex(/^0x(?:[0-9a-fA-F]{2})*$/);
export const same=(a:string,b:string)=>a.toLowerCase()===b.toLowerCase();
export interface Source {chainId:number;name:string;rpc:string;usdc:string;bundler:string;entryPoint:string}
export interface Tx {chainId:number;to:string;data:string;value:string;label:string;hash?:string;status?:'ready'|'signing'|'broadcast'|'confirmed'}
export interface Intent {kind:'pay'|'mint'|'swap';amount:string;recipient:string;minimum:string;message:string}
export interface Route {id:string;provider:'direct'|'thirdweb'|'lifi';source:number;sender:string;receiver:string;token:string;input:string;output:string;minimum:string;fee:string;eta:number;expires:number;txs:Tx[];tool?:string;note:string}
export interface Flight {id:string;intent:Intent;route:Route;status:'quoted'|'boarding'|'in-flight'|'connection'|'arrived'|'review'|'cancelled';created:number;explanation:string;model:string;arrivalHash?:string;mintId?:string;problem?:string}
export interface TravelerState {accounts:Record<string,string>;balances:{chainId:number;name:string;amount?:string;error?:string}[];flights:Flight[];balanceAt?:number;selected?:string;demoCash:string;clock:number}
export const passAbi=[{type:'function',name:'mint',stateMutability:'nonpayable',inputs:[],outputs:[{type:'uint256'}]},{type:'function',name:'usdc',stateMutability:'view',inputs:[],outputs:[{type:'address'}]},{type:'function',name:'price',stateMutability:'view',inputs:[],outputs:[{type:'uint256'}]}] as const;
export const executeAbi=[{type:'function',name:'execute',stateMutability:'nonpayable',inputs:[{type:'address'},{type:'uint256'},{type:'bytes'}],outputs:[]}] as const;
export function parseIntent(message:string):Intent{
 const text=z.string().trim().min(1).max(500).parse(message);let m=text.match(/^pay (\d+(?:\.\d{1,6})?) USDC to (0x[0-9a-fA-F]{40})$/i);
 if(m){if(Number(m[1])<=0||Number(m[1])>100)throw new Error('Payments must be above zero and at most 100 USDC');return {kind:'pay',amount:m[1],recipient:m[2],minimum:m[1],message:text};}
 if(/^mint (?:a |the )?(?:layover |airport )?pass$/i.test(text))return {kind:'mint',amount:'1',minimum:'1',recipient:'',message:text};
 m=text.match(/^swap (\d+(?:\.\d{1,6})?) USDC for at least (\d+(?:\.\d{1,18})?) WETH$/i);if(m){if(Number(m[1])<=0||Number(m[1])>100||Number(m[2])<=0)throw new Error('Swap cap is 100 USDC and minimum output must be positive');return {kind:'swap',amount:m[1],minimum:m[2],recipient:'',message:text};}
 throw new Error('Try “pay 5 USDC to 0x…”, “mint a pass”, or “swap 5 USDC for at least 0.001 WETH”. No chain selection needed.');
}
export function ready(f:Flight,index:number,now:number,recordingBroadcast=false){if(!['boarding','connection'].includes(f.status)||!recordingBroadcast&&f.route.expires<now&&!(f.intent.kind==='mint'&&f.status==='connection'))throw new Error('Flight is not ready or quote expired; prepare a fresh itinerary');if(index!==f.route.txs.findIndex(t=>t.status!=='confirmed'))throw new Error('Confirm previous leg first');const tx=f.route.txs[index];if(!tx||tx.status==='broadcast'||tx.status==='signing'&&!recordingBroadcast)throw new Error('Wallet submission is pending or already recorded; recover its receipt, never resend blindly');return tx;}
