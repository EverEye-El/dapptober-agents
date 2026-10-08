import {createServer} from 'node:http';
import {timingSafeEqual} from 'node:crypto';
import {DstackClient} from '@phala/dstack-sdk';
import {privateKeyToAccount} from 'viem/accounts';
import {toHex} from 'viem';
import {verifyModelFiles} from '../../packages/inference/src/model.ts';
import {payloadHash} from '../../packages/inference/src/protocol.ts';
const token=process.env.TEE_WORKER_TOKEN,model=process.env.TEE_MODEL??'qwen3:0.6b',digest=process.env.TEE_MODEL_DIGEST;
if(!token||token.length<32||!/^0x[0-9a-f]{64}$/.test(digest??''))throw new Error('Set a strong TEE_WORKER_TOKEN and pinned TEE_MODEL_DIGEST');
if(process.env.DSTACK_SIMULATOR_ENDPOINT)throw new Error('Simulator is forbidden in this hardware worker');
const dstack=new DstackClient();
const key=await dstack.getKey('glass-box-receipts/v1','receipt-signing','secp256k1');
const account=privateKeyToAccount(toHex(key.key));
async function assertModel(){await verifyModelFiles('/models',model,digest);const r=await fetch('http://127.0.0.1:11434/api/tags',{signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error('Ollama unavailable');const data=await r.json();const m=data.models.find(x=>x.name===model);if(!m||'0x'+m.digest.replace(/^sha256:/,'')!==digest)throw new Error('Model artifact digest mismatch');}
await assertModel();let busy=false;
const server=createServer(async(req,res)=>{
 res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
 const supplied=Buffer.from(req.headers.authorization??''),expected=Buffer.from('Bearer '+token);
 if(supplied.length!==expected.length||!timingSafeEqual(supplied,expected)){res.writeHead(401).end(JSON.stringify({error:'Unauthorized'}));return;}
 if(req.method!=='POST'||req.url!=='/infer'){res.writeHead(404).end('{}');return;}
 if(busy){res.writeHead(429).end(JSON.stringify({error:'Worker busy'}));return;}busy=true;
 try{
 let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>20000)throw new Error('Request too large');}
 const {input,nonce}=JSON.parse(raw);if(typeof input!=='string'||!input.trim()||input.length>12000||!/^0x[0-9a-f]{64}$/.test(nonce))throw new Error('Invalid input or nonce');
 await assertModel();const r=await fetch('http://127.0.0.1:11434/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,messages:[{role:'user',content:input}],stream:false,options:{temperature:0,num_predict:1024}}),signal:AbortSignal.timeout(90000)});
 if(!r.ok)throw new Error('Inference failed');const result=await r.json();if(!result.done||result.model!==model||typeof result.message?.content!=='string'||!result.message.content||result.message.content.length>24000)throw new Error('Incomplete or oversized inference');await assertModel();
 const p={version:1,mode:'tdx',nonce,model,modelDigest:digest,input,output:result.message.content,issuedAt:Math.floor(Date.now()/1000),signer:account.address};
 const signature=await account.signMessage({message:{raw:payloadHash(p)}});const quote=await dstack.getQuote(Buffer.concat([Buffer.from(payloadHash(p).slice(2),'hex'),Buffer.alloc(32)]));
 res.end(JSON.stringify({...p,signature,quote:quote.quote.startsWith('0x')?quote.quote:'0x'+quote.quote}));
 }catch(e){res.writeHead(503).end(JSON.stringify({error:e.message}));}finally{busy=false;}
});server.requestTimeout=125000;server.headersTimeout=10000;server.listen(8080,'0.0.0.0',()=>console.log('Glass-box TDX worker listening on 8080'));
