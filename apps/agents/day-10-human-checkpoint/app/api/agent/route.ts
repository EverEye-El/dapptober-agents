import {checkpointGet,checkpointPost} from '@dapptober/checkpoint';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const GET=checkpointGet;
export function POST(request:Request){return checkpointPost(request);}
