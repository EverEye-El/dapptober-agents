import {config,json,errorResponse} from '@dapptober/agent-core/src/http';
import {session} from '@dapptober/agent-core/src/http';
import {withState} from '@dapptober/agent-core/src/store';
import {refreshPassports,registration,trustSummary} from '@dapptober/identity';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const c=config();const id=session(request,c);const q=new URL(request.url).searchParams.get('q')?.toLowerCase()??'';const {result}=await withState(3,id,c,async s=>{if(c.AGENT_MODE==='real')await refreshPassports(s,c);return s.passports.filter(p=>(p.name+' '+p.capabilities.join(' ')).toLowerCase().includes(q)).map(p=>({id:p.id,mode:c.AGENT_MODE,...registration(p).card,trust:trustSummary(p)}));});return json(result,id);}catch(err){return errorResponse(err);}}
