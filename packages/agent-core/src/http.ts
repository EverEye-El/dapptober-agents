import {randomUUID,timingSafeEqual} from 'node:crypto';
import {config,type Config} from '@dapptober/config';
export function session(request:Request,c:Config){if(c.AGENT_MODE==='real')return 'operator';const found=request.headers.get('cookie')?.match(/(?:^|;\s*)dapp-session=([a-f0-9-]{36})(?:;|$)/)?.[1];return found??randomUUID();}
export function authenticated(request:Request,c:Config){if(c.AGENT_MODE==='demo')return true;const actual=request.headers.get('authorization')?.replace(/^Bearer /,'')??'';const expected=c.OPERATOR_TOKEN??'';return expected.length>=32 && Buffer.byteLength(actual)===Buffer.byteLength(expected)&&timingSafeEqual(Buffer.from(actual),Buffer.from(expected));}
export function authorize(request:Request,c:Config){if(!authenticated(request,c))throw new Error('Operator authentication required');const origin=request.headers.get('origin');if(origin&&origin!==new URL(c.PUBLIC_ORIGIN).origin)throw new Error('Untrusted request origin');}
export function json(value:unknown,id?:string,status=200){return new Response(JSON.stringify(value,(_,v)=>typeof v==='bigint'?v.toString():v),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...(id?{'Set-Cookie':`dapp-session=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000${process.env.NODE_ENV==='production'?'; Secure':''}`}:{})}});}
export function errorResponse(err:unknown,id?:string){const message=err instanceof Error?err.message:'Operation failed';return json({error:message},id,/authentication/.test(message)?401:400);}
export {config};
