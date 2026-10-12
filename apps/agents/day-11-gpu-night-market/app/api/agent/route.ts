import {computeGet,computePost} from '@dapptober/compute';
export const maxDuration=120;export const runtime='nodejs';export const dynamic='force-dynamic';
export const GET=computeGet;export function POST(request:Request){return computePost(request);}
