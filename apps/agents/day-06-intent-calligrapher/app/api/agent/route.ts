import {apiGet,apiPost} from "@dapptober/agent-core";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const GET=(request:Request)=>apiGet(6,request);
export const POST=(request:Request)=>apiPost(6,request);
