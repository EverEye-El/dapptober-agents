import type {ForecastArena} from '@dapptober/types';
export function scores(a:ForecastArena){
 const samples=a.markets.filter(m=>m.outcome===1||m.outcome===2).flatMap(m=>m.positions.map(p=>({trader:p.trader,lane:p.lane,p:p.probability/10000,y:m.outcome===1?1:0})));
 const board=[...new Set(samples.map(x=>x.trader+':'+x.lane))].map(key=>{const xs=samples.filter(x=>x.trader+':'+x.lane===key);return {trader:xs[0].trader,lane:xs[0].lane,count:xs.length,brier:xs.reduce((n,x)=>n+(x.p-x.y)**2,0)/xs.length};}).sort((a,b)=>a.brier-b.brier||b.count-a.count);
 const calibration=Array.from({length:10},(_,i)=>{const xs=samples.filter(x=>Math.min(9,Math.floor(x.p*10))===i);return {bin:`${i*10}–${(i+1)*10}`,predicted:xs.length?xs.reduce((n,x)=>n+x.p,0)/xs.length*100:(i*10+5),actual:xs.length?xs.reduce((n,x)=>n+x.y,0)/xs.length*100:null,count:xs.length};});
 const lanes=(['human','agent'] as const).map(lane=>{const xs=samples.filter(x=>x.lane===lane);return {lane,count:xs.length,brier:xs.length?xs.reduce((n,x)=>n+(x.p-x.y)**2,0)/xs.length:null};});return {board,calibration,lanes};
}
