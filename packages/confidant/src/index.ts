import {z} from 'zod';
import {config,requireReal,type Config} from '@dapptober/config';
import {initialState,withState} from '@dapptober/agent-core/src/store';
import {authorize,session,json,errorResponse} from '@dapptober/agent-core/src/http';
import {reasoner} from '@dapptober/agent-core/src/ai';
import {receipt,verifyReceipts} from '@dapptober/receipts';
import type {State,Decision} from '@dapptober/types';
import {createPublicClient,http,decodeFunctionData,keccak256,type Address,type Hex} from 'viem';
import {baseSepolia} from 'viem/chains';
import {confidantAbi,intents,type Intent} from './protocol';
export * from './protocol';
export type ConfidantState={routes:{intent:Intent;choice:Intent;confidence:number;source:string;allowed:boolean;guide:string}[];transactions:{hash:string;method:string;sender:string;block:string}[]};
export const confidant=(s:State)=>s.confidant??={routes:[],transactions:[]};
export const confidantInitial=(c:Config)=>initialState(18,c);
export async function routeIntent(c:Config,intent:Intent){
 let choice:Intent=intent,confidence=.99,source='SIMULATED Jev';
 if(c.AGENT_MODE==='real'){
 requireReal(c,['JEV_API_KEY']);
 const response=await fetch('https://api.typesafe.ai/v1/systemone',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+c.JEV_API_KEY},body:JSON.stringify({model:'jev-latest',state:JSON.stringify({intent}),questions:{route:{type:'choice',instructions:'Route this public operation category. No amounts, identities or strategy text are provided. Do not invent them.',criteria:{'sealed-bid':'An encrypted auction bid','hidden-order':'A confidential limit order',payroll:'A private payroll request'}}}}),signal:AbortSignal.timeout(15000),redirect:'error'});
 if(!response.ok)throw new Error('Jev routing unavailable');const text=await response.text();if(text.length>20000)throw new Error('Oversize routing response');
 const result=z.object({answers:z.object({route:z.object({choice:z.enum(intents),confidence:z.number().min(0).max(1)})})}).parse(JSON.parse(text)).answers.route;
 choice=result.choice;confidence=result.confidence;source='Jev / amount-free category only';
 }
 const allowed=choice===intent&&confidence>=.85&&intent==='sealed-bid';
 return {intent,choice,confidence,source,allowed,guide:allowed?'Encrypt your allocation and bid locally. The contract reserves only an affordable amount, compares encrypted bids, and grants the auctioneer access to the result only after the deadline. Credits are not cash.':'This request needs review or an unsupported execution adapter. This release executes sealed-bid allocation auctions only; no order or payroll is sent.'};
}
export async function confidantAction(s:State,c:Config,action:string,input:Record<string,unknown>={}){
 const p=confidant(s);
 if(action==='receipt.verify')return {valid:verifyReceipts(s.receipts)};
 if(action==='confidant.route'){
 const {intent}=z.object({intent:z.enum(intents)}).strict().parse(input);
 const result=await routeIntent(c,intent);p.routes.push(result);p.routes=p.routes.slice(-100);
 receipt(s,action,{intent},{choice:result.choice,confidence:result.confidence,allowed:result.allowed,source:result.source});return result;
 }
 if(action==='confidant.explain'){
 z.object({}).strict().parse(input);const route=p.routes.at(-1);if(!route)throw new Error('Route a public category first');
 const decision:Decision={allow:true,confidence:route.confidence,fit:1,abuse:0,route:'small',source:c.AGENT_MODE==='demo'?'simulated':'jev',reason:'Explain public protocol only; no tools or confidential values'};
 const guide=c.AGENT_MODE==='demo'?'[SIMULATED AI] '+route.guide:await reasoner(c).structured(z.object({text:z.string().min(10).max(1600)}),'Explain this public protocol. Never invent balances or suggest token settlement. Only public intent category: '+route.intent+'. Confidential allocation credits are self-declared, not funded tokens. A sealed bid reserves encrypted affordable credits; after closing, losers recover credits and the winner consumes them. Amounts and private text are never sent to you.',decision).then(r=>r.text);
 receipt(s,action,{}, {category:route.intent,guide});return {guide};
 }
 if(action==='confidant.record'){
 const {hash}=z.object({hash:z.string().regex(/^0x[0-9a-fA-F]{64}$/)}).strict().parse(input);
 if(c.AGENT_MODE!=='real')throw new Error('Simulation has no chain transaction hashes');if(p.transactions.some(t=>t.hash.toLowerCase()===hash.toLowerCase()))throw new Error('Already recorded');
 requireReal(c,['RPC_URL','CONFIDANT_CONTRACT']);if(c.CHAIN_ID!==84532)throw new Error('CoFHE Base mainnet is not enabled in this release');
 const client=createPublicClient({chain:baseSepolia,transport:http(c.RPC_URL)});if(await client.getChainId()!==84532)throw new Error('RPC network mismatch');
 const tx=await client.getTransaction({hash:hash as Hex}),mined=await client.getTransactionReceipt({hash:hash as Hex});
 if(tx.to?.toLowerCase()!==c.CONFIDANT_CONTRACT!.toLowerCase()||tx.value!==0n||mined.status!=='success')throw new Error('Unrelated or failed confidential transaction');
 const code=await client.getCode({address:c.CONFIDANT_CONTRACT as Address});if(!code||keccak256(code)!==c.CONFIDANT_CODE_HASH)throw new Error('Deployment code hash mismatch');
 const {functionName}=decodeFunctionData({abi:confidantAbi,data:tx.input});if(!['initializeBudget','open','bid','close','settle','pause'].includes(functionName))throw new Error('Unsupported operation');
 const result={hash,method:functionName,sender:tx.from,block:mined.blockNumber.toString()};p.transactions.push(result);p.transactions=p.transactions.slice(-128);receipt(s,action,{},result,null,'success',hash);return result;
 }
 throw new Error('Unknown confidential action');
}
function publicState(s:State){return {day:18,mode:s.mode,chainId:s.chainId,confidant:confidant(s),receipts:s.receipts};}
function options(c:Config){return {contract:c.CONFIDANT_CONTRACT,codeHash:c.CONFIDANT_CODE_HASH,rpc:c.CONFIDANT_PUBLIC_RPC_URL,chainId:c.CHAIN_ID};}
function failure(){return errorResponse(new Error('Private service unavailable. Check app configuration; no confidential value was accepted.'));}
export async function confidantGet(request:Request){try{const c=config();authorize(request,c);requireReal(c,['OPERATOR_TOKEN','SUPABASE_DATABASE_URL']);const sid=session(request,c),d=await withState(18,sid,c,async s=>{confidant(s);return {};});return json({state:publicState(d.state),options:options(c),receiptsValid:verifyReceipts(d.state.receipts)},sid);}catch{return failure();}}
export async function confidantPost(request:Request){try{const c=config();authorize(request,c);requireReal(c,['OPERATOR_TOKEN','SUPABASE_DATABASE_URL']);const raw=await request.text();if(raw.length>1024)throw new Error('Metadata body too large');const body=z.object({action:z.enum(['confidant.route','confidant.explain','confidant.record','receipt.verify']),input:z.record(z.string(),z.unknown()).default({})}).strict().parse(JSON.parse(raw)),sid=session(request,c);const d=await withState(18,sid,c,async s=>{if(Date.now()-s.rate.start>60000)s.rate={start:Date.now(),count:0};if(++s.rate.count>20)return {error:'Rate limit'};try{return await confidantAction(s,c,body.action,body.input);}catch{return {error:'Request rejected. Only public categories or confirmed transaction hashes are accepted; private values must stay in your browser.'};}});return json({state:publicState(d.state),result:d.result,options:options(c)},sid,'error' in d.result?400:200);}catch{return failure();}}
