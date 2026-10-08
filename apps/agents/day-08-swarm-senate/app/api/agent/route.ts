import {apiGet,apiPost} from '@dapptober/agent-core';
export const runtime='nodejs';export const dynamic='force-dynamic';export const maxDuration=300;
export const GET=(r:Request)=>apiGet(8,r);
export const POST=(r:Request)=>apiPost(8,r);
