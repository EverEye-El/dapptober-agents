import {after} from 'next/server';
import {nativeAdmin,drainNative} from '@dapptober/familiar/src/platforms';
export const runtime='nodejs';
export const maxDuration=120;
export const GET=nativeAdmin;
export async function POST(request:Request){const response=await nativeAdmin(request);if(response.ok)after(()=>drainNative());return response;}
