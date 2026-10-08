// One bounded cycle per invocation; schedule externally after granting an onchain plan.
const origin = process.env.PUBLIC_ORIGIN;
if (!origin || !process.env.OPERATOR_TOKEN) throw new Error('PUBLIC_ORIGIN and OPERATOR_TOKEN required');
const day = Number(process.argv[2] ?? 5);
async function action(action, input = {}) {
 const response = await fetch(new URL('/api/agent', origin), {method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${process.env.OPERATOR_TOKEN}`},body:JSON.stringify({action,input}),signal:AbortSignal.timeout(120000)});
 const payload = await response.json();
 if (!response.ok || payload.error) throw new Error(payload.error ?? `HTTP ${response.status}`);
 return payload.result;
}
if (day === 5) {await action('treasury.monitor');const preview = await action('treasury.propose');console.log(JSON.stringify(await action('treasury.execute',{id:preview.id})));}
else if (day === 4) console.log(JSON.stringify(await action('bounty.work')));
else throw new Error('Worker supports Day 04 and Day 05');
