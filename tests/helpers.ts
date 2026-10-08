import {config} from '@dapptober/config';
import {initialState} from '@dapptober/agent-core';
export const demoConfig=()=>config({AGENT_MODE:'demo',PUBLIC_ORIGIN:'http://localhost:3002'});
export const state=(day:number)=>initialState(day,demoConfig());
export const recipient='0x3333333333333333333333333333333333333333';
export const reviewer='0x4444444444444444444444444444444444444444';
export const expiry=()=>new Date(Date.now()+86400000).toISOString();
