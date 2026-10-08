import {apiGet,apiPost} from '@dapptober/agent-core';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=180;
export const GET=(request:Request)=>apiGet(7,request);
export const POST=(request:Request)=>apiPost(7,request);
