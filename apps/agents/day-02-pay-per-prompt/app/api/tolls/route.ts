import {config} from '@dapptober/config';
import {withState} from '@dapptober/agent-core';
import {session,json,errorResponse} from '@dapptober/agent-core/src/http';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:Request){try{const c=config();const {state}=await withState(2,session(request,c),c,async()=>undefined);return json({mode:state.mode,revenue:state.revenue,tolls:state.tolls.slice(-100).map(({id,time,amount,mode,txHash})=>({id,time,amount,mode,txHash}))});}catch(err){return errorResponse(err);}}
