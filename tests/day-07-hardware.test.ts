import {readFileSync} from 'node:fs';
import {it,expect} from 'vitest';
import {verify} from '@phala/dcap-qvl';
import {appraiseHardware,infer,payloadHash} from '@dapptober/inference';
import {config} from '@dapptober/config';
import {demoConfig,state} from './helpers';
const quote=readFileSync(new URL('./fixtures/tdx_quote',import.meta.url));
const collateral=JSON.parse(readFileSync(new URL('./fixtures/tdx_quote_collateral.json',import.meta.url),'utf8'));
const historicalTime=1751000000; // Inside this official fixture's June–July 2025 collateral validity window.
it('verifies a real Intel-signed upstream TDX quote and rejects modified bytes and expired collateral',()=>{
 expect(verify(quote,collateral,historicalTime).status).toBe('UpToDate');const bad=Buffer.from(quote);bad[100]^=1;expect(()=>verify(bad,collateral,historicalTime)).toThrow();expect(()=>verify(quote,collateral,Date.now()/1000)).toThrow();
});
it('requires exact pinned workload, every RTMR, model, payload, non-debug attributes and current TCB',async()=>{
 const signed=verify(quote,collateral,historicalTime),td=signed.report.asTd10()!;
 const card=await infer(state(7),demoConfig(),'Hardware policy exercise');const proof={...card.proof,mode:'tdx' as const};
 const policy=Object.fromEntries(Object.entries({mrtd:td.mrTd,rtmr0:td.rtMr0,rtmr1:td.rtMr1,rtmr2:td.rtMr2,rtmr3:td.rtMr3}).map(([k,v])=>[k,Buffer.from(v).toString('hex')]));
 const c=config({TEE_MODEL:proof.model,TEE_MODEL_DIGEST:proof.modelDigest,TEE_MEASUREMENTS:JSON.stringify(policy)});
 // Synthetic report-data mutation exercises policy only; it is never treated as a signed hardware quote.
 const result=verify(quote,collateral,historicalTime),bound=result.report.asTd10()!;bound.tdAttributes=new Uint8Array(8);bound.reportData=Buffer.concat([Buffer.from(payloadHash(proof).slice(2),'hex'),Buffer.alloc(32)]);
 expect(appraiseHardware(result,proof,c).tcb).toBe('UpToDate');expect(()=>appraiseHardware(signed,proof,c)).toThrow('bind');
 for(const name of Object.keys(policy))expect(()=>appraiseHardware(result,proof,{...c,TEE_MEASUREMENTS:JSON.stringify({...policy,[name]:'f'.repeat(96)})})).toThrow('measurement');
 expect(()=>appraiseHardware(result,proof,{...c,TEE_MODEL:'wrong-model'})).toThrow('model');expect(()=>appraiseHardware(result,{...proof,output:'altered'},c)).toThrow('bind');expect(()=>appraiseHardware({...result,status:'OutOfDate'},proof,c)).toThrow('TCB');
 bound.tdAttributes[0]=1;expect(()=>appraiseHardware(result,proof,c)).toThrow('Debug');
});
