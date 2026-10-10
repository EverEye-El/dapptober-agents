import {apiGet,apiPost} from '@dapptober/agent-core';
export const runtime='nodejs';
export async function GET(request:Request){return apiGet(9,request);}
export async function POST(request:Request){return apiPost(9,request);}
