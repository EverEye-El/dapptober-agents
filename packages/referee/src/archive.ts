import postgres from 'postgres';
import {decodeEventLog,keccak256,toHex} from 'viem';
import {config,databaseOptions,type Config} from '@dapptober/config';
import {authorize,json,errorResponse} from '@dapptober/agent-core/src/http';
import {refereeAbi} from './protocol';

const connections=new Map<string,ReturnType<typeof postgres>>();
export async function refereeArchivePage(c:Config,offset:number,kind:'tasks'|'reports'){
 if(!c.SUPABASE_DATABASE_URL||!c.REFEREE_CONTRACT||!c.REFEREE_CODE_HASH)throw new Error('Configure the private finalized archive first');
 let sql=connections.get(c.SUPABASE_DATABASE_URL);if(!sql){sql=postgres(c.SUPABASE_DATABASE_URL,databaseOptions(c.SUPABASE_DATABASE_URL));connections.set(c.SUPABASE_DATABASE_URL,sql);}
 const namespace=`${c.CHAIN_ID}:${c.REFEREE_CONTRACT.toLowerCase()}:${c.REFEREE_CODE_HASH.toLowerCase()}`;
 const topic=keccak256(toHex(kind==='tasks'?'TaskOpened(bytes32,uint256,uint8,int64[],int256)':'VerdictSigned(bytes32,bytes32,address,bool,bytes32,uint256,uint256,bytes)'));
 // The index worker owns migrations; a missing table is an explicit failure.
 const checkpoint=await sql`SELECT block,hash FROM dapptober_referee_index WHERE namespace=${namespace}`;
 if(!checkpoint.length)throw new Error('No finalized archive checkpoint; run the index worker');
 const rows=await sql`SELECT body FROM dapptober_referee_events WHERE namespace=${namespace} AND body->'topics'->>0=${topic} ORDER BY block,log_index LIMIT 100 OFFSET ${offset}`;
 return {kind,offset,nextOffset:rows.length===100?offset+100:null,checkpoint:checkpoint[0],records:rows.map(({body})=>({block:BigInt(body.blockNumber).toString(),transactionHash:body.transactionHash,...decodeEventLog({abi:refereeAbi,data:body.data,topics:body.topics})}))};
}
export async function refereeArchiveGet(request:Request){try{const c=config();authorize(request,c);if(c.AGENT_MODE!=='real')return json({records:[],nextOffset:null,simulation:true,message:'The archive is populated only by the real finalized-chain index worker.'});
 const url=new URL(request.url),offset=Number(url.searchParams.get('offset')??'0'),kind=url.searchParams.get('kind')??'tasks';if(!Number.isSafeInteger(offset)||offset<0||offset>10000000||!['tasks','reports'].includes(kind))throw new Error('Invalid archive page');
 return json(await refereeArchivePage(c,offset,kind as 'tasks'|'reports'));
 }catch{return errorResponse(new Error('Archive access unavailable; verify operator authentication, index configuration and checkpoint'));}}
