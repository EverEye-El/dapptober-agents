import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const root=fileURLToPath(new URL('../',import.meta.url));
const next=createRequire(import.meta.url).resolve('next/dist/bin/next');
const children=[];const ready=new Set();const base=3100;
const stop=()=>{for(const child of children)child.kill('SIGTERM');};
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stop();process.exitCode=1;});
try{
  const apps=readdirSync(resolve(root,'apps/agents')).filter(dir=>/^day-\d{2}-/.test(dir)).sort();
  for(const dir of apps){
    const day=Number(dir.match(/^day-(\d+)-/)[1]),port=base+day;
    const child=spawn(process.execPath,[next,'start','--port',String(port),'--hostname','127.0.0.1'],{cwd:resolve(root,'apps/agents',dir),env:{...process.env,AGENT_MODE:'demo',PUBLIC_ORIGIN:`http://localhost:${port}`},stdio:['ignore','pipe','pipe']});
    children.push(child);child.stderr.on('data',chunk=>process.stderr.write(`[${dir}] ${chunk}`));let output='';child.stdout.on('data',chunk=>{output=(output+chunk).slice(-2000);if(output.includes('Ready in'))ready.add(child);});
    child.on('error',()=>{process.exitCode=1;});
  }
  for(let attempt=0;attempt<60;attempt++){
    if(children.some(child=>child.exitCode!==null||child.signalCode!==null))throw new Error('A production server exited before the audit; ensure ports 3101–3114 are free');
    const states=await Promise.all(apps.map(async dir=>{try{return (await fetch(`http://127.0.0.1:${base+Number(dir.match(/^day-(\d+)-/)[1])}`,{signal:AbortSignal.timeout(1000)})).status===200;}catch{return false;}}));
    if(ready.size===children.length&&states.every(Boolean))break;
    if(attempt===59)throw new Error('Production servers did not become ready');
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  const smoke=spawn(process.execPath,[resolve(root,'scripts/smoke.mjs')],{cwd:root,env:{...process.env,SMOKE_PORT_BASE:String(base)},stdio:'inherit'});
  process.exitCode=await new Promise((resolve,reject)=>{smoke.on('error',reject);smoke.on('exit',code=>resolve(code??1));});
}catch(err){console.error(err.message);process.exitCode=1;}finally{stop();}
