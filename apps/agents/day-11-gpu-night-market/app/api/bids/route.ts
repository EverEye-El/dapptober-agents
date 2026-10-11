import {computePost} from '@dapptober/compute';
export const maxDuration=120;export const runtime='nodejs';export const dynamic='force-dynamic';
export function POST(request:Request){return computePost(request,true);}
