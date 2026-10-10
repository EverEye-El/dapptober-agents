import {checkpointPost} from '@dapptober/checkpoint';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export function POST(request:Request){return checkpointPost(request,'agent.query');}
