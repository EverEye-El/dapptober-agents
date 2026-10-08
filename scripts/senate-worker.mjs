// One bounded governance cycle. Schedule only after members fund and delegate their agent wallets.
const origin=process.env.PUBLIC_ORIGIN,token=process.env.OPERATOR_TOKEN;
if(!origin||!origin.startsWith('https://')||!token||token.length<32)throw new Error('HTTPS PUBLIC_ORIGIN and OPERATOR_TOKEN required');
async function call(action,input={}){const r=await fetch(new URL('/api/agent',origin),{method:action?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:action?JSON.stringify({action,input}):undefined,signal:AbortSignal.timeout(action==='senate.debate'?900000:120000)});const body=await r.json();if(!r.ok)throw new Error(body.error??'Senate unavailable');return body;}
let body=await call();if(body.state.mode!=='real')throw new Error('This scheduler is for configured real deployments');if(body.state.senate?.paused)throw new Error('Senate paused');
let steps=0;
for(const proposal of body.state.senate?.proposals??[]){if(++steps>16)break;const now=Math.floor(Date.now()/1000);if(proposal.status!=='active'||now>proposal.agentDeadline||now<=proposal.snapshot)continue;
 if(!proposal.transcript.length){body=await call('senate.debate',{id:proposal.id});}
 const current=body.state.senate.proposals.find(p=>p.id===proposal.id)??proposal;
 for(const stance of current.stances){if(current.ballots.some(b=>b.member===stance.member)||!stance.decision.allow)continue;const profile=body.state.senate.profiles.find(m=>m.member===stance.member);if(!profile||profile.paused||Math.floor(Date.now()/1000)>current.agentDeadline)continue;body=await call('senate.cast',{id:proposal.id,member:stance.member});}
}
console.log('Bounded senate debate/vote cycle complete. Human overrides and resolution execution remain wallet actions.');
