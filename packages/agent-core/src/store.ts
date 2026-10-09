import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {join} from 'node:path';
import postgres from 'postgres';
import {randomUUID,createHash} from 'node:crypto';
import type {Config} from '@dapptober/config';
import type {State} from '@dapptober/types';
export const DEMO_OWNER='0x1111111111111111111111111111111111111111';
export const DEMO_AGENT='0x2222222222222222222222222222222222222222';
export const DEMO_RECIPIENT='0x3333333333333333333333333333333333333333';
export function initialState(day:number,c:Config):State{return {version:1,day,chainId:day===6?c.COW_CHAIN_ID:c.CHAIN_ID,mode:c.AGENT_MODE,owner:c.OWNER_ADDRESS??DEMO_OWNER,agent:c.AGENT_MODE==='demo'?DEMO_AGENT:'',born:false,balance:c.AGENT_MODE==='demo'?'100':'0',policy:{dailyCap:'25',maxTransaction:'10',approvalThreshold:'5',expires:new Date(Date.now()+86400000).toISOString(),tokens:['USDC'],recipients:[DEMO_RECIPIENT],paused:true},receipts:[],chat:[],revenue:'0',tolls:[],passports:[],quests:[],plan:{maxAllocationBps:5000,minLiquidityBps:2000,maxRisk:1,maxMove:'250',dailyCap:'1000',thresholdBps:100,paused:true},vaults:c.AGENT_MODE==='demo'?[{id:'lending',name:'Harbor lending',kind:'lending',assets:'0',apy:4.8,risk:1},{id:'savings',name:'Reserve savings',kind:'savings',assets:'0',apy:3.6,risk:0}]:[],treasuryLiquid:c.AGENT_MODE==='demo'?'1000':'0',intents:[],rate:{start:Date.now(),count:0}};}
const queues=new Map<string,Promise<unknown>>();
let database:ReturnType<typeof postgres>|undefined;
let ready:Promise<unknown>|undefined;
export async function withState<T>(day:number,id:string,c:Config,work:(state:State)=>Promise<T>):Promise<{state:State;result:T}>{
 const namespace=c.AGENT_MODE==='real'?createHash('sha256').update(c.OPERATOR_TOKEN??'').digest('hex'):id;const key=`${c.AGENT_MODE}:${day}:${namespace}`;
 if(c.AGENT_MODE==='real'){
  if(!c.DATABASE_URL)throw new Error('Real mode requires DATABASE_URL for durable state');database??=postgres(c.DATABASE_URL,{max:5,ssl:c.DATABASE_URL.includes('localhost')?false:'require'});const sql=database;
  ready??=sql`CREATE TABLE IF NOT EXISTS dapptober_state (id text PRIMARY KEY, body jsonb NOT NULL)`;await ready;
  return await sql.begin(async tx=>{await tx`INSERT INTO dapptober_state (id,body) VALUES (${key},${tx.json(initialState(day,c) as unknown as postgres.JSONValue)}) ON CONFLICT DO NOTHING`;const rows=await tx`SELECT body FROM dapptober_state WHERE id=${key} FOR UPDATE`;const state=rows[0].body as State;state.chainId=day===6?c.COW_CHAIN_ID:c.CHAIN_ID;const result=await work(state);await tx`UPDATE dapptober_state SET body=${tx.json(state as unknown as postgres.JSONValue)} WHERE id=${key}`;return {state,result};}) as {state:State;result:T};
 }
 const previous=queues.get(key)??Promise.resolve();
 const task=previous.catch(()=>{}).then(async()=>{const dir=join(process.cwd(),'.data');await mkdir(dir,{recursive:true});const file=join(dir,`${day}-${id}.json`);let state:State;try{state=JSON.parse(await readFile(file,'utf8')) as State;}catch(err){if((err as NodeJS.ErrnoException).code!=='ENOENT')throw err;state=initialState(day,c);}state.chainId=day===6?c.COW_CHAIN_ID:c.CHAIN_ID;const result=await work(state);const temp=file+'.'+randomUUID()+'.tmp';await writeFile(temp,JSON.stringify(state),{mode:0o600});await rename(temp,file);return {state,result};});queues.set(key,task);try{return await task;}finally{if(queues.get(key)===task)queues.delete(key);}
}

// Confirmed chain effects cannot be undone by rolling back application state.
export function restoreAfterFailure(state:State,before:State){const emitted=state.receipts.slice(before.receipts.length);const confirmed=emitted.some(r=>r.mode==='real'&&r.status==='success'&&r.txHash);Object.assign(state,before);if(confirmed)state.receipts.push(...emitted);}
