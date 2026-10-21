import {afterEach,expect,it,vi} from 'vitest';
import {config} from '@dapptober/config';
import {facilitatorClient} from '@dapptober/payments/src/facilitator';
afterEach(()=>vi.restoreAllMocks());
it('sends private static facilitator authentication to each SDK endpoint',async()=>{
 const fetcher=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify({kinds:[],extensions:[],signers:{}})));
 const client=facilitatorClient(config({FACILITATOR_URL:'https://facilitator.invalid',FACILITATOR_AUTH_HEADERS_JSON:JSON.stringify({Authorization:'Bearer local-fixture'})}));
 await client.getSupported();expect(fetcher).toHaveBeenCalled();expect(new Headers(fetcher.mock.calls[0][1]?.headers).get('authorization')).toBe('Bearer local-fixture');
 for(const path of ['verify','settle','supported'])expect(await client.createAuthHeaders(path)).toEqual({headers:{authorization:'Bearer local-fixture'}});
});
it('rejects insecure destinations, header injection and malformed private values without leaking them',()=>{
 for(const [url,headers] of [['http://facilitator.invalid','{"Authorization":"private-fixture"}'],['https://facilitator.invalid','{"Host":"private-fixture"}'],['https://facilitator.invalid','{"Authorization":"private-fixture\\r\\nInjected: yes"}'],['https://facilitator.invalid','["private-fixture"]']]){
  expect(()=>facilitatorClient(config({FACILITATOR_URL:url,FACILITATOR_AUTH_HEADERS_JSON:headers}))).toThrow('Invalid private facilitator authentication configuration');
 }
});
it('keeps public facilitator operation credential-free',async()=>{expect(await facilitatorClient(config({})).createAuthHeaders('verify')).toEqual({headers:{}});});
