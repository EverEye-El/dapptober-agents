import {handleMcp,type GuildTools} from '@dapptober/mcp';
import {guildTools} from '@dapptober/mcp/src/guild';
import {withState} from '@dapptober/agent-core/src/store';
import {session,authorize,config,errorResponse} from '@dapptober/agent-core/src/http';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function POST(request:Request){try{const c=config();authorize(request,c);const id=session(request,c);const tools:GuildTools={list:async()=>(await withState(4,id,c,async s=>guildTools(s,c).list())).result,claim:async quest=>(await withState(4,id,c,async s=>guildTools(s,c).claim(quest))).result,submit:async(quest,result)=>(await withState(4,id,c,async s=>guildTools(s,c).submit(quest,result))).result};return await handleMcp(request,tools,new URL(c.PUBLIC_ORIGIN).origin);}catch(err){return errorResponse(err);}}
export const GET=()=>new Response(null,{status:405});
export const DELETE=GET;
