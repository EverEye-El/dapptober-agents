import {it,expect} from 'vitest';
import {dispatch} from '@dapptober/agent-core';
import {infer,verifyProof,proofId,getPublicCard} from '@dapptober/inference';
import {config} from '@dapptober/config';
import {demoConfig,state} from './helpers';
it('produces portable signed evidence, rejects tampering of every bound field, and never claims hardware',async()=>{
 const c=demoConfig(),s=state(7),card=await infer(s,c,'Explain trusted computation');expect(card.verification.status).toBe('integrity-only');expect(card.verification.hardware).toBe(false);expect(card.id).toBe(proofId(card.proof));
 for(const patch of [{model:'another-model'},{modelDigest:'0x'+'1'.repeat(64)},{input:'Changed input'},{output:'Changed answer'},{issuedAt:card.proof.issuedAt-1},{nonce:'0x'+'2'.repeat(64)},{mode:'tdx'},{signer:'0x'+'3'.repeat(40)},{signature:'0x'+'4'.repeat(130)},{quote:'0x1234'}])expect((await verifyProof({...card.proof,...patch},c)).valid).toBe(false);
 const r=await dispatch(s,c,'inference.verify',{proof:{...card.proof,output:'tampered'}});expect(r).toMatchObject({verification:{valid:false,hardware:false,status:'failed'}});expect(s.receipts.at(-1)?.status).toBe('rejected');
});
it('keeps answers private until explicit publication and supports cross-session reads',async()=>{
 const c=demoConfig(),s=state(7),card=await infer(s,c,'Private question '+crypto.randomUUID());expect(await getPublicCard(card.id,c)).toBeUndefined();const result=await dispatch(s,c,'inference.publish',{id:card.id});expect(result).toMatchObject({url:c.PUBLIC_ORIGIN+'/share/'+card.id});expect((await getPublicCard(card.id,c))?.proof).toEqual(card.proof);await expect(dispatch(s,c,'inference.anchor',{id:card.id})).rejects.toThrow('real mode');
});
it('fails closed without real TEE configuration and rejects fake hardware evidence',async()=>{
 const c=config({AGENT_MODE:'real'});await expect(infer(state(7),c,'Hello')).rejects.toThrow('TEE_WORKER');const card=await infer(state(7),demoConfig(),'Hello');expect((await verifyProof({...card.proof,mode:'tdx'},c)).valid).toBe(false);expect((await verifyProof({version:1},c)).status).toBe('failed');expect(()=>config({TEE_WORKER_URL:'http://untrusted.example'})).toThrow('HTTPS');
});
