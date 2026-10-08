import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {it,expect,vi} from 'vitest';
import {config} from '@dapptober/config';
import {infer} from '@dapptober/inference';
import {demoConfig,state} from './helpers';
it('refuses worker startup without configuration or when a hardware simulator is configured',()=>{
 for(const env of [{TEE_WORKER_TOKEN:'',TEE_MODEL_DIGEST:''},{TEE_WORKER_TOKEN:'x'.repeat(32),TEE_MODEL_DIGEST:'0x'+'1'.repeat(64),DSTACK_SIMULATOR_ENDPOINT:'http://localhost:8090'}]){
 try{execFileSync(process.execPath,['--experimental-strip-types',fileURLToPath(new URL('../services/glass-box-tee/server.mjs',import.meta.url))],{env:{...process.env,...env},stdio:'pipe',timeout:10000});throw new Error('Worker unexpectedly started');}catch(e){expect(String(e)).toMatch(/strong TEE_WORKER_TOKEN|Simulator is forbidden/);}
 }
});
it('rejects replayed, mismatched or simulated worker responses before any publication',async()=>{
 const original=await infer(state(7),demoConfig(),'Hello');const c=config({AGENT_MODE:'real',TEE_WORKER_URL:'https://worker.example',TEE_WORKER_TOKEN:'x'.repeat(32),TEE_MODEL_DIGEST:original.proof.modelDigest,TEE_MEASUREMENTS:JSON.stringify(Object.fromEntries(['mrtd','rtmr0','rtmr1','rtmr2','rtmr3'].map(k=>[k,'0'.repeat(96)])))});
 for(const patch of [{mode:'demo'}, {mode:'tdx',input:'different'}, {mode:'tdx',issuedAt:1}, {mode:'tdx',nonce:'0x'+'0'.repeat(64)}]){
 vi.stubGlobal('fetch',async(_url:unknown,options:{body:string})=>{const request=JSON.parse(options.body);return Response.json({...original.proof,nonce:request.nonce,...patch});});
 try{const s=state(7);await expect(infer(s,c,'Hello')).rejects.toThrow('replayed or mismatched');expect(s.inferences).toBeUndefined();}finally{vi.unstubAllGlobals();}
 }
});
