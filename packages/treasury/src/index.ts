import {formatUnits,parseUnits,keccak256,toHex,type Address} from 'viem';
import {z} from 'zod';
import type {Config} from '@dapptober/config';
import type {State,Vault} from '@dapptober/types';
import {read,treasuryAbi,vaultAbi,balance,execute,publicClient} from '@dapptober/chain';
import {units,checkFlight,assertDecision} from '@dapptober/guardrails';
import {judge,reasoner} from '@dapptober/agent-core/src/ai';
import {receipt} from '@dapptober/receipts';
const configs=z.array(z.object({address:z.string().regex(/^0x[0-9a-fA-F]{40}$/),name:z.string(),kind:z.enum(['lending','savings']),risk:z.number().int().min(0).max(3)})).max(16);
export async function monitor(s:State,c:Config){if(c.AGENT_MODE==='demo'){for(const v of s.vaults)v.sample={time:new Date().toISOString(),assetsPerShare:'1'};return s.vaults;}if(!c.FLIGHT_TREASURY)throw new Error('FLIGHT_TREASURY required');const t=c.FLIGHT_TREASURY as Address;const client=publicClient(c);const configured=configs.parse(JSON.parse(c.VAULT_CONFIG));if(configured.length<2)throw new Error('Configure at least two ERC4626 vaults for yield monitoring');const [paused,maxMove,min,maxRisk,daily]=await Promise.all(['paused','maxMove','minLiquidityBps','maxRisk','dailyCap'].map(fn=>read(c,t,treasuryAbi,fn)));s.plan={...s.plan,paused:paused as boolean,maxMove:formatUnits(maxMove as bigint,6),minLiquidityBps:Number(min),maxRisk:Number(maxRisk),dailyCap:formatUnits(daily as bigint,6)};s.treasuryLiquid=await balance(c,t);const updated:Vault[]=[];for(const v of configured){const addr=v.address as Address;const [decimals,shares,rule]=await Promise.all([read(c,addr,vaultAbi,'decimals'),read(c,addr,vaultAbi,'balanceOf',[t]),read(c,t,treasuryAbi,'rules',[addr])]);const [assets,rate]=await Promise.all([read(c,addr,vaultAbi,'convertToAssets',[shares]),read(c,addr,vaultAbi,'convertToAssets',[parseUnits('1',Number(decimals))])]);const old=s.vaults.find(x=>x.id===v.address);const now=Date.now(),elapsed=old?.sample?now-new Date(old.sample.time).getTime():0;const current=Number(formatUnits(rate as bigint,6));let apy:number|null=null;if(old?.sample&&elapsed>=60000){const past=Number(old.sample.assetsPerShare);apy=past>0?((current/past)**(31536000000/elapsed)-1)*100:null;if(apy!==null&&(!Number.isFinite(apy)||apy>100||apy< -100))apy=null;}const r=rule as readonly [boolean,number,number];updated.push({id:v.address,name:v.name,kind:v.kind,assets:formatUnits(assets as bigint,6),apy,risk:r[2],maxAllocationBps:r[0]?Number(r[1]):0,sample:elapsed<60000&&old?.sample?old.sample:{time:new Date(now).toISOString(),assetsPerShare:current.toString()}});}s.vaults=updated;const block=await client.getBlockNumber();receipt(s,'treasury.monitor',{}, {block:block.toString(),vaults:updated});return updated;}
export async function proposeRebalance(s:State,c:Config){
 await monitor(s,c);if(s.plan.paused)throw new Error('Autopilot disengaged');
 const viable=s.vaults.filter(v=>v.risk<=s.plan.maxRisk&&v.apy!==null&&v.apy>0&&(v.maxAllocationBps??10000)>0).sort((a,b)=>b.apy!-a.apy!);
 if(!viable.length)throw new Error('No eligible yield observations yet; sample again after 60 seconds');
 const best=viable[0],total=units(s.treasuryLiquid)+s.vaults.reduce((n,x)=>n+units(x.assets),0n),floor=total*BigInt(s.plan.minLiquidityBps)/10000n;
 const capacity=total*BigInt(Math.min(s.plan.maxAllocationBps,best.maxAllocationBps??10000))/10000n-units(best.assets);
 const excess=units(s.treasuryLiquid)-floor;
 const source=s.vaults.filter(v=>units(v.assets)>0n&&v.id!==best.id&&(v.risk>s.plan.maxRisk||(v.apy!==null&&v.apy<best.apy!))).sort((a,b)=>(a.apy??0)-(b.apy??0))[0];
 let v=best,tool='treasury.deposit',amount=[units(s.plan.maxMove),capacity,excess].reduce((a,b)=>a<b?a:b);
 if(source&&(excess<0n||capacity>0n&&amount<=0n||source.risk>s.plan.maxRisk)){v=source;tool='treasury.withdraw';const needed=excess<0n?-excess:capacity;amount=[units(s.plan.maxMove),units(source.assets),needed].reduce((a,b)=>a<b?a:b);}
 if(amount<=0n||amount*10000n<total*BigInt(s.plan.thresholdBps))throw new Error('Within threshold: no rebalance required');
 const formatted=formatUnits(amount,6);if(tool==='treasury.deposit')checkFlight(s.plan,v,formatted,s.treasuryLiquid,s.vaults);
 const d=await judge(c,{plan:s.plan,vault:v,tool,amount:formatted},'Pre-screen rebalance yes/no inside the contract-enforced flight plan');assertDecision(d);
 const context={vault:v,tool,amount:formatted,plan:s.plan};
 const reason=c.AGENT_MODE==='demo'?`${tool==='treasury.deposit'?'Allocate to':'Release from'} ${v.name}: ${formatted} simulated USDC, preserving the ${s.plan.minLiquidityBps/100}% reserve and risk tier ${s.plan.maxRisk}. Withdrawals return to liquid reserves before a subsequent deposit cycle.`:await reasoner(c).text(`Explain this bounded move without inventing yield or guarantees: ${JSON.stringify(context)}`,d);
 s.preview={id:crypto.randomUUID(),tool,amount:formatted,recipient:v.id,token:'USDC',reason,decision:d,requiresApproval:false,expires:new Date(Date.now()+300000).toISOString()};receipt(s,'treasury.propose',{},s.preview,d);return s.preview;
}
export async function executeRebalance(s:State,c:Config,id:string){
 const p=s.preview;if(!p||p.id!==id||!['treasury.deposit','treasury.withdraw'].includes(p.tool)||Date.parse(p.expires)<=Date.now())throw new Error('Missing or expired rebalance preview');
 await monitor(s,c);const v=s.vaults.find(x=>x.id===p.recipient);if(!v)throw new Error('Unknown vault');
 if(p.tool==='treasury.deposit')checkFlight(s.plan,v,p.amount,s.treasuryLiquid,s.vaults);else if(s.plan.paused||units(p.amount)>units(s.plan.maxMove)||units(p.amount)>units(v.assets))throw new Error('Withdrawal outside flight plan');
 const day=new Date().toISOString().slice(0,10);const spent=s.receipts.filter(r=>['treasury.deposit','treasury.withdraw'].includes(r.action)&&r.status==='success'&&r.time.startsWith(day)).reduce((n,r)=>n+units((r.input as {amount:string}).amount),0n);
 if(spent+units(p.amount)>units(s.plan.dailyCap))throw new Error('Treasury daily cap exceeded');
 const d=await judge(c,{plan:s.plan,preview:p},'Approve rebalance only within the flight plan');assertDecision(d);let txHash:string|undefined;
 if(c.AGENT_MODE==='real'){
 const deposit=p.tool==='treasury.deposit',preview=await read(c,v.id as Address,vaultAbi,deposit?'previewDeposit':'previewWithdraw',[units(p.amount)]) as bigint;
 if(preview<=0n)throw new Error('Vault returns zero shares');
 txHash=await execute(c,c.FLIGHT_TREASURY as Address,treasuryAbi,deposit?'deposit':'withdraw',[v.id,units(p.amount),deposit?preview*995n/1000n:(preview*1005n+999n)/1000n,keccak256(toHex(p.id+':'+p.reason))]);await monitor(s,c);
 }else{const deposit=p.tool==='treasury.deposit';s.treasuryLiquid=formatUnits(units(s.treasuryLiquid)+(deposit?-units(p.amount):units(p.amount)),6);v.assets=formatUnits(units(v.assets)+(deposit?units(p.amount):-units(p.amount)),6);}
 s.preview=undefined;receipt(s,p.tool,{amount:p.amount,vault:v.id},{reason:p.reason,simulated:c.AGENT_MODE==='demo'},d,'success',txHash);return {amount:p.amount,vault:v.name,txHash};
}
