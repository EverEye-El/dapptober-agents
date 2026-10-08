import {apiGet,apiPost} from "@dapptober/agent-core";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const GET=(request:Request)=>apiGet(4,request);
export const POST=(request:Request)=>apiPost(4,request);
