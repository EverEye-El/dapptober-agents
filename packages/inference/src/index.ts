import {withState} from '@dapptober/agent-core/src/store';
import {randomBytes} from 'node:crypto';
import {getCollateralAndVerify,type VerifiedReport} from '@phala/dcap-qvl';
import {privateKeyToAccount} from 'viem/accounts';
import {toHex,type Hex} from 'viem';
import {z} from 'zod';
import type {Config} from '@dapptober/config';
import type {GlassReceipt,InferenceCheck,InferenceCard,State} from '@dapptober/types';
import {judge} from '@dapptober/agent-core/src/ai';
import {assertDecision} from '@dapptober/guardrails';
import {receipt} from '@dapptober/receipts';
import {publicClient,transaction} from '@dapptober/chain';
import {parseAbi} from 'viem';
import {DEMO_KEY,payloadHash,proofId,proofSchema,verifySignature} from './protocol';
export {payloadHash,proofId,proofSchema,verifySignature} from './protocol';
const measurement=z.string().regex(/^[0-9a-f]{96}$/);
export const policySchema=z.object({mrtd:measurement,rtmr0:measurement,rtmr1:measurement,rtmr2:measurement,rtmr3:measurement}).strict();
export const anchorAbi=parseAbi(['function anchor(bytes32 commitment,string uri)','function anchors(bytes32) view returns(address publisher,uint64 postedAt,string uri)','event Anchored(bytes32 indexed commitment,address indexed publisher,string uri)']);
export function appraiseHardware(result:VerifiedReport,p:GlassReceipt,c:Config){
 if(result.status!=='UpToDate')throw new Error(`Unacceptable TCB status: ${result.status}`);
 const td=result.report.asTd10()??result.report.asTd15()?.base;if(!td)throw new Error('Intel TDX required');
 const policy=policySchema.parse(JSON.parse(c.TEE_MEASUREMENTS));
 const actual={mrtd:td.mrTd,rtmr0:td.rtMr0,rtmr1:td.rtMr1,rtmr2:td.rtMr2,rtmr3:td.rtMr3};
 for(const [name,bytes] of Object.entries(actual))if(Buffer.from(bytes).toString('hex')!==policy[name as keyof typeof policy])throw new Error(`Unapproved ${name} measurement`);
 if((td.tdAttributes[0]&1)!==0)throw new Error('Debug TDX is forbidden');
 const expected=Buffer.concat([Buffer.from(payloadHash(p).slice(2),'hex'),Buffer.alloc(32)]);
 if(!Buffer.from(td.reportData).equals(expected))throw new Error('Quote does not bind this receipt payload');
 if(p.model!==c.TEE_MODEL||p.modelDigest!==c.TEE_MODEL_DIGEST)throw new Error('Unapproved model or artifact digest');
 return {tcb:result.status,measurements:policy,advisories:result.advisory_ids};
}
export async function verifyProof(value:unknown,c:Config):Promise<InferenceCheck>{
 const checks:InferenceCheck['checks']=[];let hardware=false;
 try{
 const p=proofSchema.parse(value);checks.push({name:'Receipt schema',pass:true,detail:'Versioned, bounded fields'});
 const signature=await verifySignature(p);checks.push({name:'Model / input / output signature',pass:signature,detail:signature?'All signed fields match':'Signature does not match the receipt'});if(!signature)throw new Error('Signature verification failed');
 if(p.issuedAt>Math.floor(Date.now()/1000)+60)throw new Error('Receipt timestamp is in the future');
 if(p.mode==='demo'){
 if(p.signer.toLowerCase()!==privateKeyToAccount(DEMO_KEY).address.toLowerCase()||p.quote!=='0x')throw new Error('Invalid simulation signer or fake hardware evidence');
 checks.push({name:'Hardware attestation',pass:false,detail:'LOCAL SIMULATION — public demo signer; no Intel evidence'});
 return {valid:true,hardware:false,status:'integrity-only',checkedAt:new Date().toISOString(),checks};
 }
 if(!c.TEE_MODEL_DIGEST)throw new Error('TEE_MODEL_DIGEST trust policy required');
 if(p.quote==='0x')throw new Error('Hardware quote missing');
 const result=await getCollateralAndVerify(Buffer.from(p.quote.slice(2),'hex'));
 const policy=appraiseHardware(result,p,c);hardware=true;
 checks.push({name:'Intel DCAP chain and TCB',pass:true,detail:policy.tcb},{name:'Measured workload and model',pass:true,detail:'Pinned MRTD / all RTMRs and model artifact'},{name:'Quote payload binding',pass:true,detail:'Hardware report data equals receipt digest'});
 return {valid:true,hardware,status:'verified',checkedAt:new Date().toISOString(),checks};
 }catch(e){checks.push({name:'Verification failure',pass:false,detail:e instanceof Error?e.message:'Proof rejected'});return {valid:false,hardware:false,status:'failed',checkedAt:new Date().toISOString(),checks};}
}
async function appraisal(c:Config,check:InferenceCheck){
 // Give Jev only public verification facts, never the confidential prompt or answer.
 const d=await judge(c,{cryptographicValid:check.valid,hardwareVerified:check.hardware,status:check.status,checks:check.checks},'Appraise verify/fail attestation facts and confidence. Cryptographic failure cannot be overridden. Demo signature integrity is not hardware verification.');
 return d;
}
export async function infer(s:State,c:Config,input:string){
 if((s.inferences?.length??0)>=100)throw new Error('Inference history limit reached; export and rotate workspace');
 z.string().min(1).max(12000).parse(input);const nonce=toHex(randomBytes(32));let proof:GlassReceipt;
 if(c.AGENT_MODE==='demo'){
 const account=privateKeyToAccount(DEMO_KEY);const p={version:1 as const,mode:'demo' as const,nonce,model:'glass-box-local-simulator',modelDigest:payloadHash({version:1,mode:'demo',nonce:'0x'+'0'.repeat(64),model:'demo',modelDigest:'0x'+'0'.repeat(64),input:'deterministic-local-v1',output:'simulation',issuedAt:1,signer:account.address}),input,output:`LOCAL SIMULATION: A TEE isolates computation from its host. A signed receipt binds the model, prompt and answer. Changing any signed field invalidates the signature. Your question was: ${input}`,issuedAt:Math.floor(Date.now()/1000),signer:account.address};
 proof={...p,signature:await account.signMessage({message:{raw:payloadHash(p)}}),quote:'0x'};
 }else{
 if(!c.TEE_WORKER_URL||!c.TEE_WORKER_TOKEN||!c.TEE_MODEL_DIGEST)throw new Error('Real inference requires TEE_WORKER_URL, TEE_WORKER_TOKEN and pinned model/measurements');
 policySchema.parse(JSON.parse(c.TEE_MEASUREMENTS));
 const res=await fetch(new URL('/infer',c.TEE_WORKER_URL),{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${c.TEE_WORKER_TOKEN}`},body:JSON.stringify({input,nonce}),signal:AbortSignal.timeout(120000),redirect:'error'});
 if(!res.ok)throw new Error(`TEE inference unavailable (${res.status})`);const raw=await res.text();if(raw.length>100000)throw new Error('Worker receipt too large');proof=proofSchema.parse(JSON.parse(raw));
 if(proof.mode!=='tdx'||proof.nonce!==nonce||proof.input!==input||Math.abs(Math.floor(Date.now()/1000)-proof.issuedAt)>300)throw new Error('Worker response is simulated, replayed or mismatched');
 }
 const verification=await verifyProof(proof,c);if(!verification.valid||c.AGENT_MODE==='real'&&!verification.hardware)throw new Error(verification.checks.at(-1)?.detail??'Invalid proof');
 const decision=await appraisal(c,verification);assertDecision(decision);
 const card:InferenceCard={id:proofId(proof),proof,verification,decision};(s.inferences??=[]).push(card);if(s.inferences.length>100)throw new Error('Inference history limit reached; export and rotate workspace');
 receipt(s,'inference.produce',{inputHash:payloadHash(proof)},{id:card.id,model:proof.model,status:verification.status},decision);return card;
}
export async function inferenceAction(s:State,c:Config,action:string,input:Record<string,unknown>){
 if(action==='inference.ask')return infer(s,c,z.string().min(1).max(12000).parse(input.message));
 if(action==='inference.verify'){const verification=await verifyProof(input.proof,c);const decision=await appraisal(c,verification);receipt(s,action,{},verification,decision,verification.valid?'success':'rejected');return {verification,decision};}
 const id=z.string().min(1).parse(input.id),card=s.inferences?.find(p=>p.id===id);if(!card)throw new Error('Unknown inference receipt');
 if(action==='inference.publish'||action==='inference.anchor'){
 const verification=await verifyProof(card.proof,c);if(!verification.valid||c.AGENT_MODE==='real'&&!verification.hardware)throw new Error('Only currently verified receipts can be published');
 if(action==='inference.publish'){card.shared=true;if(c.AGENT_MODE==='demo')await withState(7,'public',c,async publicState=>{publicState.inferences??=[];if(!publicState.inferences.some(x=>x.id===id))publicState.inferences.push(structuredClone(card));});receipt(s,action,{id},{shared:true});return {url:`${c.PUBLIC_ORIGIN}/share/${id}`};}
 if(c.AGENT_MODE==='demo')throw new Error('Onchain posting requires real mode and a deployed INFERENCE_ANCHOR');
 if(!c.INFERENCE_ANCHOR)throw new Error('INFERENCE_ANCHOR required');
 if(!card.shared)throw new Error('Publish the answer card before posting its public URI');
 return {transaction:transaction(c,c.INFERENCE_ANCHOR as `0x${string}`,anchorAbi,'anchor',[id,`${c.PUBLIC_ORIGIN}/share/${id}`],'Post verified inference receipt commitment (not a DCAP verifier)')};
 }
 if(action==='inference.anchor.status'){
 if(!c.INFERENCE_ANCHOR)throw new Error('INFERENCE_ANCHOR required');const result=await publicClient(c).readContract({address:c.INFERENCE_ANCHOR as `0x${string}`,abi:anchorAbi,functionName:'anchors',args:[id as Hex]});return {publisher:result[0],postedAt:result[1].toString(),uri:result[2]};
 }
 throw new Error('Unknown inference capability');
}

export async function getPublicCard(id:string,c:Config){const {result}=await withState(7,'public',c,async s=>s.inferences?.find(x=>x.id===id&&x.shared));return result;}
