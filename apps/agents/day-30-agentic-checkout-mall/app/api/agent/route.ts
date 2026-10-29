import {mallHandler} from '@dapptober/mall';export const runtime='nodejs';export const maxDuration=60;export const GET=(r:Request)=>mallHandler(r);export const POST=(r:Request)=>mallHandler(r,true);
