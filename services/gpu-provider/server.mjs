import {createServer} from 'node:http';
import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {join} from 'node:path';
import {timingSafeEqual} from 'node:crypto';
import {WebSocketServer} from 'ws';
import {createPublicClient,createWalletClient,http} from 'viem';
import {privateKeyToAccount} from 'viem/accounts';
import {base,baseSepolia,foundry} from 'viem/chains';
import {computeAbi,inputHash,outputHash} from '../../packages/compute/src/protocol.mjs';
export async function createGpuWorker(env=process.env){
 const chainId=Number(env.CHAIN_ID??84532);const chain=[base,baseSepolia,foundry].find(c=>c.id===chainId);if(!chain)throw new Error('Unsupported worker chain');
 const key=env.GPU_PROVIDER_PRIVATE_KEY,token=env.GPU_WORKER_BEARER_TOKEN,market=env.GPU_MARKET,model=env.OLLAMA_MODEL??'qwen3:0.6b',ollama=env.OLLAMA_BASE_URL??'http://127.0.0.1:11434',slots=Number(env.GPU_WORKER_SLOTS??1);
 if(!/^0x[0-9a-fA-F]{64}$/.test(key??'')||!/^0x[0-9a-fA-F]{40}$/.test(market??'')||!token||token.length<32||!env.RPC_URL||!Number.isInteger(slots)||slots<1||slots>64)throw new Error('Configure provider key, market, RPC, slots and 32+ character worker bearer token');
 if(chainId===31337&&!['localhost','127.0.0.1','[::1]'].includes(new URL(env.RPC_URL).hostname))throw new Error('Anvil must be local');
 const account=privateKeyToAccount(key),client=createPublicClient({chain,transport:http(env.RPC_URL)}),wallet=createWalletClient({account,chain,transport:http(env.RPC_URL)});if(await client.getChainId()!==chainId)throw new Error('Worker RPC chain mismatch');
 const storage=env.GPU_OUTPUT_DIRECTORY??'./.outputs';await mkdir(storage,{recursive:true,mode:0o700});let deliveryQueue=Promise.resolve();const active=new Set();const started=Date.now();let ready=false;let healthAt=0;
 const health=async()=>{if(Date.now()-healthAt>5000){ready=false;healthAt=Date.now();try{const r=await fetch(ollama+'/api/tags',{signal:AbortSignal.timeout(2000),redirect:'error'});const d=await r.json();ready=r.ok&&d.models?.some(m=>m.name===model);}catch{/* No invented readiness */}}return {ready,provider:account.address,model,active:active.size,slots,uptimeSeconds:Math.floor((Date.now()-started)/1000),hardware:'operator-declared; no hardware attestation'};};
 const server=createServer(async(req,res)=>{const send=(status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
 try{if(req.method==='GET'&&req.url==='/health')return send(200,await health());if(req.method!=='POST'||req.url!=='/jobs')return send(404,{error:'Unknown provider route'});
 const actual=req.headers.authorization?.replace(/^Bearer /,'')??'';if(Buffer.byteLength(actual)!==Buffer.byteLength(token)||!timingSafeEqual(Buffer.from(actual),Buffer.from(token)))return send(401,{error:'Provider authentication required'});
 let body='';for await(const part of req){body+=part;if(body.length>20000)return send(413,{error:'Job request too large'});}const p=JSON.parse(body);if(!/^[1-9][0-9]*$/.test(String(p.id))||typeof p.prompt!=='string'||p.prompt.length<1||p.prompt.length>8000||p.model!==model)throw new Error('Invalid job request');
 const j=await client.readContract({address:market,abi:computeAbi,functionName:'jobs',args:[BigInt(p.id)]});if(j[1].toLowerCase()!==account.address.toLowerCase()||j[4]!==inputHash(model,p.prompt)||j[5]!==outputHash(model))throw new Error('Job commitment/provider mismatch');
 const file=join(storage,`${chainId}-${market.toLowerCase()}-${p.id}.json`);let cached;try{cached=JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 if(cached&&(cached.inputHash!==j[4]||outputHash(cached.output)!==cached.outputHash))throw new Error('Cached output integrity failure');
 if(Number(j[8])===1){if(!cached||cached.outputHash!==j[6])throw new Error('Paid job output unavailable; restore provider output storage');return send(200,{output:cached.output,outputHash:cached.outputHash});}
 if(Number(j[8])!==0||Number((await client.getBlock()).timestamp)>Number(j[3]))throw new Error('Job expired or terminal');if(active.has(p.id)||active.size>=slots)return send(409,{error:'Provider capacity busy'});active.add(p.id);
 try{if(!cached){const remaining=Number(j[3])-Number((await client.getBlock()).timestamp);const r=await fetch(ollama+'/api/generate',{method:'POST',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,prompt:p.prompt,stream:false,options:{num_predict:512}}),signal:AbortSignal.timeout(Math.max(1,Math.min(90000,remaining*1000)))});if(!r.ok)throw new Error('Inference unavailable');const result=await r.json();if(result.done!==true||typeof result.response!=='string'||result.response.length===0||result.response.length>32768||result.model!==model)throw new Error('Invalid inference output');cached={inputHash:j[4],output:result.response,outputHash:outputHash(result.response)};const temp=file+'.tmp';await writeFile(temp,JSON.stringify(cached),{mode:0o600});await rename(temp,file);}
 const delivery=deliveryQueue.catch(()=>{}).then(async()=>{const {request}=await client.simulateContract({account,address:market,abi:computeAbi,functionName:'deliver',args:[BigInt(p.id),cached.outputHash]});const hash=await wallet.writeContract(request);const mined=await client.waitForTransactionReceipt({hash});if(mined.status!=='success')throw new Error('Delivery reverted');});deliveryQueue=delivery;await delivery;send(200,{output:cached.output,outputHash:cached.outputHash});
 }finally{active.delete(p.id);}
 }catch{send(400,{error:'Provider job failed. Check onchain status; retry cached output or refund an expired pending job.'});}});
 const wss=new WebSocketServer({noServer:true,maxPayload:1024});server.on('upgrade',(req,socket,head)=>{if(req.url!=='/status'){socket.destroy();return;}wss.handleUpgrade(req,socket,head,ws=>{wss.emit('connection',ws,req);});});const timer=setInterval(()=>{void health().then(state=>{for(const ws of wss.clients)if(ws.readyState===1)ws.send(JSON.stringify(state));});},2000);timer.unref();server.on('close',()=>{clearInterval(timer);for(const ws of wss.clients)ws.terminate();wss.close();});return {server,health,account};
}
if(process.argv[1]?.endsWith('/server.mjs')){const {server}=await createGpuWorker();server.listen(Number(process.env.PORT??8080),'0.0.0.0',()=>console.log('GPU provider ready; key and endpoint credentials withheld'));for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>server.close(()=>process.exit(0)));}
