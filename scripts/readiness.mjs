import {existsSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const common=['OWNER_ADDRESS','OPERATOR_TOKEN','SUPABASE_DATABASE_URL','RPC_URL','JEV_API_KEY','OPENAI_API_KEY'];
const required={
  12:['OWNER_ADDRESS','OPERATOR_TOKEN','SUPABASE_DATABASE_URL','RPC_URL','JEV_API_KEY','AGENT_PRIVATE_KEY','PROVENANCE_PRESS','PRESS_START_BLOCK','PINATA_JWT','THIRDWEB_SECRET_KEY','USDC_ADDRESS'],
  11:['OWNER_ADDRESS','OPERATOR_TOKEN','SUPABASE_DATABASE_URL','RPC_URL','JEV_API_KEY','AGENT_PRIVATE_KEY','GPU_MARKET','PROVENANCE_PRESS','USDC_ADDRESS'],
  1:[...common,'AGENT_PRIVATE_KEY','THIRDWEB_SECRET_KEY','SESSION_VAULT'],
  2:[...common,'AGENT_PRIVATE_KEY','PAY_TO'],
  3:[...common,'PASSPORT_REGISTRY'],
  4:[...common,'AGENT_PRIVATE_KEY','QUEST_ESCROW'],
  5:[...common,'AGENT_PRIVATE_KEY','FLIGHT_TREASURY'],
  6:[...common,'COW_USDC','COW_WETH'],
  7:['OWNER_ADDRESS','OPERATOR_TOKEN','SUPABASE_DATABASE_URL','JEV_API_KEY','TEE_WORKER_URL','TEE_WORKER_TOKEN','TEE_MODEL_DIGEST'],
  8:[...common,'AGENT_PRIVATE_KEY','SENATE_TOKEN','SENATE_GOVERNOR','SENATE_START_BLOCK'],
  9:[...common,'AGENT_PRIVATE_KEY','FORECAST_MARKET','UMA_ORACLE','USDC_ADDRESS'],
  10:[...common,'AGENT_PRIVATE_KEY','WORLD_APP_ID','WORLD_RP_ID','WORLD_SIGNING_KEY','WORLD_ACTION','CHECKPOINT_SESSION_SECRET','CHECKPOINT_REGISTRY','CHECKPOINT_REWARDS','USDC_ADDRESS'],
};
export function assess(day,env){
  const gaps=[];
  if(env.AGENT_MODE!=='real')gaps.push('AGENT_MODE: still simulated');
  for(const key of required[day])if(!env[key]?.trim())gaps.push(`${key}: missing`);
  for(const key of ['OPERATOR_TOKEN','TEE_WORKER_TOKEN','CHECKPOINT_SESSION_SECRET'])if(env[key]&&env[key].length<32)gaps.push(`${key}: requires at least 32 characters`);
  for(const [key,value] of Object.entries(env)){
    if(value&&(/_ADDRESS$/.test(key)||['SESSION_VAULT','PASSPORT_REGISTRY','QUEST_ESCROW','FLIGHT_TREASURY','COW_USDC','COW_WETH','SENATE_TOKEN','SENATE_GOVERNOR','FORECAST_MARKET','UMA_ORACLE','CHECKPOINT_REWARDS','CHECKPOINT_REGISTRY','INFERENCE_ANCHOR','GPU_MARKET','PROVENANCE_PRESS','PAY_TO'].includes(key))&&!/^0x[0-9a-fA-F]{40}$/.test(value))gaps.push(`${key}: invalid address`);
  }
  if(env.AGENT_PRIVATE_KEY&&!/^0x[0-9a-fA-F]{64}$/.test(env.AGENT_PRIVATE_KEY))gaps.push('AGENT_PRIVATE_KEY: invalid key format');
  for(const key of ['PUBLIC_ORIGIN','TEE_WORKER_URL'])if(env[key]){try{if(new URL(env[key]).protocol!=='https:')gaps.push(`${key}: HTTPS required for release`);}catch{gaps.push(`${key}: invalid URL`);}}
  for(const key of ['RPC_URL','OPENAI_BASE_URL','FACILITATOR_URL'])if(env[key]){try{if(!['http:','https:'].includes(new URL(env[key]).protocol))gaps.push(`${key}: HTTP(S) URL required`);}catch{gaps.push(`${key}: invalid URL`);}}
  if(!env.PUBLIC_ORIGIN)gaps.push('PUBLIC_ORIGIN: missing');
  if(env.SUPABASE_DATABASE_URL&&!/^postgres(ql)?:\/\//.test(env.SUPABASE_DATABASE_URL))gaps.push('SUPABASE_DATABASE_URL: PostgreSQL URL required');
  if(!['8453','84532'].includes(env.CHAIN_ID))gaps.push('CHAIN_ID: use Base Sepolia (84532) for testing or Base (8453) for production');
  const usdc=env.CHAIN_ID==='8453'?'0x833589fcd6edb6e08f4c7c32d4f71b54bda02913':'0x036cbd53842c5426634e7929541ec2318f3dcf7e';
  if([1,2,4,5,9,10,11,12].includes(day)&&env.USDC_ADDRESS&&env.USDC_ADDRESS.toLowerCase()!==usdc)gaps.push('USDC_ADDRESS: wrong Circle USDC for this Base network');
  if(day===6&&env.COW_USDC&&env.COW_USDC.toLowerCase()!==usdc)gaps.push('COW_USDC: wrong Circle USDC for this Base network');
  if(day===6&&(!['8453','84532'].includes(env.COW_CHAIN_ID)||env.CHAIN_ID!==env.COW_CHAIN_ID))gaps.push('COW_CHAIN_ID: must match CHAIN_ID');
  if(day===6&&env.COW_CHAIN_ID==='84532')gaps.push('CoW settlement: no supported Base Sepolia solver endpoint; testing configuration is valid but live settlement is unavailable');
  if(env.SENATE_START_BLOCK&&!/^\d+$/.test(env.SENATE_START_BLOCK))gaps.push('SENATE_START_BLOCK: invalid block');
  if(day===5){try{const vaults=JSON.parse(env.VAULT_CONFIG??'[]');if(!Array.isArray(vaults)||vaults.length<2||vaults.length>16||!['lending','savings'].every(kind=>vaults.some(v=>v.kind===kind))||vaults.some(v=>!/^0x[0-9a-fA-F]{40}$/.test(v.address)||!Number.isInteger(v.risk)||v.risk<0||v.risk>3||!v.name)||new Set(vaults.map(v=>v.address.toLowerCase())).size!==vaults.length)gaps.push('VAULT_CONFIG: requires distinct valid lending and savings vaults (2–16)');}catch{gaps.push('VAULT_CONFIG: invalid JSON');}}
  if(day===7){if(!/^0x[0-9a-f]{64}$/.test(env.TEE_MODEL_DIGEST??''))gaps.push('TEE_MODEL_DIGEST: pin exact manifest digest');try{const m=JSON.parse(env.TEE_MEASUREMENTS??'{}');if(!['mrtd','rtmr0','rtmr1','rtmr2','rtmr3'].every(k=>/^[0-9a-f]{96}$/.test(m[k])))gaps.push('TEE_MEASUREMENTS: enroll all five independently verified measurements');}catch{gaps.push('TEE_MEASUREMENTS: invalid JSON');}}
  if(day===12)gaps.push('Story Protocol: not deployed on Base networks; native integration needs an approved network exception or supported bridge');
  if(day===11){try{const providers=JSON.parse(env.GPU_PROVIDERS??'[]');if(!Array.isArray(providers)||!providers.length||providers.length>16||providers.some(p=>!/^0x[0-9a-fA-F]{40}$/.test(p.address)||!p.name||new URL(p.url).protocol!=='https:'||typeof p.token!=='string'||p.token.length<32))gaps.push('GPU_PROVIDERS: configure verified provider wallets, HTTPS workers and private tokens');}catch{gaps.push('GPU_PROVIDERS: invalid JSON or endpoints');}}
  if(day===10){if(env.WORLD_SIGNING_KEY&&!/^0x[0-9a-fA-F]{64}$/.test(env.WORLD_SIGNING_KEY))gaps.push('WORLD_SIGNING_KEY: invalid key format');for(const key of ['WORLD_APP_ID','WORLD_RP_ID'])if(env[key]&&!new RegExp(key==='WORLD_APP_ID'?'^app_[a-zA-Z0-9]+$':'^rp_[a-zA-Z0-9]+$').test(env[key]))gaps.push(`${key}: invalid identifier`);}
  return gaps;
}

async function main(){
  const flags=process.argv.slice(2),selection=flags.find(x=>/^\d{1,2}$/.test(x));
  if(flags.some(x=>!['--init','--online'].includes(x)&&x!==selection)||selection&&(Number(selection)<1||Number(selection)>12))throw new Error('Usage: pnpm readiness [01–12] [--init] [--online]');
  const root=fileURLToPath(new URL('../',import.meta.url));let failed=false;
  for(const dir of readdirSync(resolve(root,'apps/agents')).sort()){
    const day=Number(dir.match(/^day-(\d+)-/)?.[1]);if(!required[day]||selection&&day!==Number(selection))continue;
    const folder=resolve(root,'apps/agents',dir),file=resolve(folder,'.env.local');
    if(flags.includes('--init')&&!existsSync(file)){writeFileSync(file,readFileSync(resolve(folder,'.env.example')),{mode:0o600,flag:'wx'});console.log(`Day ${String(day).padStart(2,'0')}: created private .env.local in demo mode`);}
    const env={...parseEnv(readFileSync(resolve(folder,'.env.example'),'utf8')),...existsSync(file)?parseEnv(readFileSync(file,'utf8')):{}};
    // Explicit process environment can supply secrets from a deployment secret manager.
    for(const key of new Set([...Object.keys(env),...required[day]]))if(process.env[key]!==undefined)env[key]=process.env[key];
    const gaps=assess(day,env);
    if(flags.includes('--online')&&env.RPC_URL){
      try{
        const rpc=async(method,params)=>{const r=await fetch(env.RPC_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(10000)});const data=await r.json();if(!r.ok||data.error||data.result===undefined)throw new Error('RPC rejected request');return data.result;};
        if(Number(BigInt(await rpc('eth_chainId',[])))!==Number(env.CHAIN_ID))gaps.push('RPC_URL: wrong chain');
        for(const key of ['SESSION_VAULT','PASSPORT_REGISTRY','QUEST_ESCROW','FLIGHT_TREASURY','SENATE_TOKEN','SENATE_GOVERNOR','FORECAST_MARKET','UMA_ORACLE','CHECKPOINT_REWARDS','CHECKPOINT_REGISTRY','INFERENCE_ANCHOR','GPU_MARKET','PROVENANCE_PRESS','USDC_ADDRESS','COW_USDC','COW_WETH'])if(/^0x[0-9a-fA-F]{40}$/.test(env[key]??'')&&await rpc('eth_getCode',[env[key],'latest'])==='0x')gaps.push(`${key}: no deployed bytecode`);
      }catch{gaps.push('RPC_URL: read-only connectivity check failed (details withheld to protect secrets)');}
    }
    console.log(`Day ${String(day).padStart(2,'0')}: ${gaps.length?'BLOCKED':'CONFIGURED — live acceptance still required'}`);for(const gap of gaps)console.log(`  - ${gap}`);failed ||= gaps.length>0;
  }
  console.log('This check does not deploy, spend, call paid AI services, or certify live operation.');process.exitCode=failed?1:0;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{console.error('Readiness check failed. Check file access and environment syntax; secret values are withheld.');process.exitCode=1;});
