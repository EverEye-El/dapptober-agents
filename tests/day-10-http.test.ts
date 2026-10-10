import {it,expect,vi,afterEach} from 'vitest';
import {randomUUID} from 'node:crypto';
import {checkpointGet,checkpointPost} from '@dapptober/checkpoint';
const origin='http://localhost:3010';
afterEach(()=>vi.unstubAllEnvs());
it('serializes concurrent enrollment across cookies; keeps human messages private and rejects cross-origin, oversize and forged cookies',async()=>{
 vi.stubEnv('AGENT_MODE','demo');vi.stubEnv('PUBLIC_ORIGIN',origin);vi.stubEnv('WORLD_ACTION','http-test-'+randomUUID());
 const cookie=async()=>{const response=await checkpointGet(new Request(origin+'/api/agent'));expect(response.status).toBe(200);expect((await response.clone().json()).receiptsValid).toBe(true);return response.headers.get('set-cookie')!.split(';')[0];};const first=await cookie(),second=await cookie();
 const post=(cookie:string,action:string,input:Record<string,unknown>={})=>checkpointPost(new Request(origin+'/api/agent',{method:'POST',headers:{cookie,origin,'Content-Type':'application/json'},body:JSON.stringify({action,input})}));
 await post(first,'human.begin',{wallet:'0x1111111111111111111111111111111111111111'});await post(second,'human.begin',{wallet:'0x3333333333333333333333333333333333333333'});
 const races=await Promise.all([post(first,'human.verify',{demoNullifier:'0x01'}),post(second,'human.verify',{demoNullifier:'0x0001'})]);expect(races.map(r=>r.status).sort()).toEqual([200,400]);
 const humanCookie=races[0].status===200?first:second,guestCookie=races[0].status===200?second:first;expect((await post(humanCookie,'human.chat',{message:'Private, human-only content'})).status).toBe(200);const outsider=await checkpointGet(new Request(origin+'/api/agent',{headers:{cookie:guestCookie}}));expect((await outsider.json()).state.messages).toHaveLength(0);
 const forged=await checkpointGet(new Request(origin+'/api/agent',{headers:{cookie:humanCookie.slice(0,-1)+(humanCookie.endsWith('f')?'e':'f')}}));expect((await forged.json()).state.lane).toBe('guest');
 const foreign=await checkpointPost(new Request(origin+'/api/agent',{method:'POST',headers:{origin:'https://evil.example'},body:'{}'}));expect(foreign.status).toBe(400);const oversized=await checkpointPost(new Request(origin+'/api/agent',{method:'POST',body:'a'.repeat(65537)}));expect(oversized.status).toBe(400);
});
it('rate limits repeated requests and refuses real-mode startup without durable configuration',async()=>{
 vi.stubEnv('AGENT_MODE','demo');vi.stubEnv('PUBLIC_ORIGIN',origin);vi.stubEnv('WORLD_ACTION','rate-test-'+randomUUID());const initial=await checkpointGet(new Request(origin+'/api/agent'));const cookie=initial.headers.get('set-cookie')!.split(';')[0];let status=200;for(let i=0;i<60;i++)status=(await checkpointGet(new Request(origin+'/api/agent',{headers:{cookie}}))).status;expect(status).toBe(400);
 vi.stubEnv('AGENT_MODE','real');vi.stubEnv('CHECKPOINT_SESSION_SECRET','');const response=await checkpointGet(new Request(origin+'/api/agent'));expect(response.status).toBe(400);expect((await response.json()).error).toContain('CHECKPOINT_SESSION_SECRET');
});
