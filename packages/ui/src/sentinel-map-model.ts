import type {SentinelState} from '@dapptober/types';
export type FleetNode = {id:string;name:string;active:boolean;status:'idle'|'ready'|'review'|'blocked'|'executed'|'revoked';requestId?:string;used:number;eventTime?:number};
// Authority always takes precedence over request animation. A receipt never revives a key.
export function fleetNodes(p:SentinelState,now:number):FleetNode[]{return p.agents.map(a=>{
 const active=!p.stopped&&!a.paused&&a.epoch===p.epoch&&now>=a.starts&&now<a.ends;
 const latest=p.requests.filter(r=>r.agent===a.id).at(-1);
 const status=!active?'revoked':latest?.status==='pending'?'review':latest?.status==='cancelled'?'idle':latest?.status??'idle';
 return {id:a.id,name:a.name,active,status,requestId:latest?.id,used:Math.max(0,Math.min(1,Number(a.spent)/Number(a.daily)||0)),eventTime:latest?.time};
 });}
