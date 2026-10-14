import {it,expect} from 'vitest';
import {fleetNodes} from '../packages/ui/src/sentinel-map-model';
import {sentinelInitial,sentinel,sentinelAction} from '@dapptober/sentinel';
import {config} from '@dapptober/config';
it('shows actual request status and budget; revocation wins over old executions',async()=>{
 const c=config({AGENT_MODE:'demo'}),s=sentinelInitial(c);await sentinelAction(s,c,'sentinel.seed');const p=sentinel(s),target=p.agents[0].targets[0];
 const request=await sentinelAction(s,c,'sentinel.request',{id:'0',target,amount:'6',purpose:'Pay approved provider'}) as {request:{id:string}};
 expect(fleetNodes(p,Date.now()/1000)[0].status).toBe('review');await sentinelAction(s,c,'sentinel.execute',{id:'0',request:request.request.id,ownerApprove:true});
 expect(fleetNodes(p,Date.now()/1000)[0]).toMatchObject({status:'executed',used:.24});await sentinelAction(s,c,'sentinel.kill');await sentinelAction(s,c,'sentinel.resume');
 expect(fleetNodes(p,Date.now()/1000).every(n=>n.status==='revoked'&&!n.active)).toBe(true);
});
it('expired and paused policies cannot look active in the projection',async()=>{
 const s=sentinelInitial(config({AGENT_MODE:'demo'}));await sentinelAction(s,config({AGENT_MODE:'demo'}),'sentinel.seed');const p=sentinel(s);p.agents[0].paused=true;p.agents[1].ends=1;
 const nodes=fleetNodes(p,Date.now()/1000);expect(nodes[0].status).toBe('revoked');expect(nodes[1].status).toBe('revoked');expect(nodes[2].status).toBe('idle');
});
