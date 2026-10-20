import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {keccak256} from 'viem';
import postgres from 'postgres';

// One bounded page. Only finalized blocks enter the archive; a changed
// checkpoint fails closed so an operator can preserve and rebuild the archive.
export async function indexPage({rpc,store,address,startBlock=0n,span=500n}){
  if(span<1n||span>2000n)throw new Error('Index span must be 1–2000 blocks');
  const checkpoint=await store.checkpoint();
  if(checkpoint){const block=await rpc('eth_getBlockByNumber',['0x'+BigInt(checkpoint.block).toString(16),false]);if(!block||block.hash!==checkpoint.hash)throw new Error('Finalized index checkpoint changed; preserve archive and rebuild before resuming');}
  const finalized=await rpc('eth_getBlockByNumber',['finalized',false]);
  if(!finalized?.number||!finalized.hash)throw new Error('RPC must expose finalized blocks');
  const from=checkpoint?BigInt(checkpoint.block)+1n:startBlock,head=BigInt(finalized.number);
  if(from>head)return {caughtUp:true,events:0};
  let to=from+span-1n;if(to>head)to=head;
  let logs;
  for(;;){try{logs=await rpc('eth_getLogs',[{address,fromBlock:'0x'+from.toString(16),toBlock:'0x'+to.toString(16)}]);break;}catch{if(to===from)throw new Error('RPC cannot return even one block of contract events');to=from+(to-from)/2n;}}
  if(!Array.isArray(logs))throw new Error('Malformed event response');
  const block=await rpc('eth_getBlockByNumber',['0x'+to.toString(16),false]);if(!block?.hash)throw new Error('Missing checkpoint block');
  const hashes=new Map();
  for(const log of logs){
    if(log.removed||log.address?.toLowerCase()!==address.toLowerCase()||!/^0x[0-9a-f]{64}$/i.test(log.transactionHash??'')||!/^0x[0-9a-f]{64}$/i.test(log.blockHash??'')||!/^0x[0-9a-f]+$/i.test(log.logIndex??'')||!/^0x[0-9a-f]+$/i.test(log.blockNumber??''))throw new Error('Invalid finalized event');
    const height=BigInt(log.blockNumber);if(height<from||height>to)throw new Error('Event outside requested range');
    if(!hashes.has(log.blockNumber))hashes.set(log.blockNumber,(await rpc('eth_getBlockByNumber',[log.blockNumber,false]))?.hash);
    if(hashes.get(log.blockNumber)!==log.blockHash)throw new Error('Event block changed during indexing');
  }
  const checked=await rpc('eth_getBlockByNumber',['0x'+to.toString(16),false]);if(checked?.hash!==block.hash)throw new Error('Checkpoint changed during indexing');
  await store.commit(logs,{block:to.toString(),hash:block.hash});
  return {caughtUp:to===head,events:logs.length,through:to.toString()};
}

async function main(){
  const e=process.env,chain=Number(e.CHAIN_ID),address=e.REFEREE_CONTRACT;
  if(![8453,84532].includes(chain)||!/^0x[0-9a-f]{40}$/i.test(address??'')||!/^0x[0-9a-f]{64}$/i.test(e.REFEREE_CODE_HASH??'')||!/^\d+$/.test(e.REFEREE_START_BLOCK??''))throw new Error('Configure chain, referee address, runtime pin and deployment block');
  const url=new URL(e.SUPABASE_DATABASE_URL);if(!['postgres:','postgresql:'].includes(url.protocol)||['localhost','127.0.0.1'].includes(url.hostname))throw new Error('Use the private TLS Supabase connection');
  const rpc=async(method,params)=>{const response=await fetch(e.RPC_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),redirect:'error',signal:AbortSignal.timeout(15000)});const body=await response.json();if(!response.ok||body.error||body.result===undefined)throw new Error('RPC request rejected');return body.result;};
  if(Number(BigInt(await rpc('eth_chainId',[])))!==chain||keccak256(await rpc('eth_getCode',[address,'latest']))!==e.REFEREE_CODE_HASH)throw new Error('Chain or runtime pin mismatch');
  const sql=postgres(e.SUPABASE_DATABASE_URL,{prepare:false,ssl:'require',max:1}),namespace=`${chain}:${address.toLowerCase()}:${e.REFEREE_CODE_HASH.toLowerCase()}`;
  try{
    await sql`CREATE TABLE IF NOT EXISTS dapptober_referee_index (namespace text PRIMARY KEY, block numeric NOT NULL, hash text NOT NULL)`;
    await sql`CREATE TABLE IF NOT EXISTS dapptober_referee_events (namespace text NOT NULL, block numeric NOT NULL, log_index numeric NOT NULL, body jsonb NOT NULL, PRIMARY KEY(namespace,block,log_index))`;
    await sql`ALTER TABLE dapptober_referee_index ENABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE dapptober_referee_events ENABLE ROW LEVEL SECURITY`;
    const flags=process.argv.slice(2);
    if(flags[0]==='--list'){
      if(flags.length>2||!/^\d+$/.test(flags[1]??'0'))throw new Error('Use --list [offset]');
      const rows=await sql`SELECT body FROM dapptober_referee_events WHERE namespace=${namespace} ORDER BY block,log_index LIMIT 100 OFFSET ${flags[1]??'0'}`;
      console.log(JSON.stringify({events:rows.map(r=>r.body),nextOffset:Number(flags[1]??'0')+rows.length}));return;
    }
    if(flags.length)throw new Error('Use no arguments to index or --list [offset] to export');
    for(let i=0;i<20;i++){
      const result=await sql.begin(async tx=>{
        await tx`SELECT pg_advisory_xact_lock(hashtext(${namespace}))`;
        const store={checkpoint:async()=>{const rows=await tx`SELECT block,hash FROM dapptober_referee_index WHERE namespace=${namespace}`;return rows[0];},commit:async(logs,checkpoint)=>{
          for(const log of logs)await tx`INSERT INTO dapptober_referee_events(namespace,block,log_index,body) VALUES (${namespace},${BigInt(log.blockNumber).toString()},${BigInt(log.logIndex).toString()},${tx.json(log)}) ON CONFLICT DO NOTHING`;
          await tx`INSERT INTO dapptober_referee_index(namespace,block,hash) VALUES (${namespace},${checkpoint.block},${checkpoint.hash}) ON CONFLICT(namespace) DO UPDATE SET block=EXCLUDED.block,hash=EXCLUDED.hash`;
        }};
        return indexPage({rpc,store,address,startBlock:BigInt(e.REFEREE_START_BLOCK)});
      });
      console.log(JSON.stringify(result));if(result.caughtUp)break;
    }
  }finally{await sql.end();}
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error('Referee indexing failed; inspect configuration, finalized RPC support and archive checkpoint. Private connection details withheld.');process.exitCode=1;});
