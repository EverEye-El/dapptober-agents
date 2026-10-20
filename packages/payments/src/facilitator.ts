import {HTTPFacilitatorClient} from '@x402/core/server';
import type {Config} from '@dapptober/config';

// Private static credentials only. Providers requiring short-lived signed JWTs
// need their own signing adapter; a pasted expired token is not refreshed here.
export function facilitatorClient(c:Config){
 let headers:Record<string,string>;
 try{
  const value:unknown=JSON.parse(c.FACILITATOR_AUTH_HEADERS_JSON);
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length>1)throw new Error();
  headers={};
  for(const [name,token] of Object.entries(value)){
   if(!/^authorization$/i.test(name)||typeof token!=='string'||!token.length||token.length>8192||/[^\x20-\x7e]/.test(token))throw new Error();
   headers[name.toLowerCase()]=token;
  }
  const url=new URL(c.FACILITATOR_URL);
  if(Object.keys(headers).length&&(url.protocol!=='https:'||url.username||url.password))throw new Error();
 }catch{throw new Error('Invalid private facilitator authentication configuration');}
 return new HTTPFacilitatorClient({url:c.FACILITATOR_URL,createAuthHeaders:async()=>({verify:{...headers},settle:{...headers},supported:{...headers}})});
}
