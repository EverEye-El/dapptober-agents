import {spawn} from 'node:child_process';
const port='18564';
const node=spawn('anvil',['--host','127.0.0.1','--port',port,'--silent'],{stdio:['ignore','ignore','pipe']});let stopped=false;node.on('exit',()=>{stopped=true;});node.on('error',()=>{stopped=true;});let error='';node.stderr.on('data',chunk=>{error+=chunk;});
try{
 let ready=false;for(let i=0;i<30;i++){await new Promise(r=>setTimeout(r,100));if(stopped)throw new Error('Anvil failed to start: '+error);try{const r=await fetch(`http://127.0.0.1:${port}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]})});if((await r.json()).result==='0x7a69'){ready=true;break;}}catch{/* Wait for this owned process */}}
 if(!ready||stopped)throw new Error(`Owned Anvil node unavailable; ensure port ${port} is free`);
 const test=spawn('pnpm',['exec','vitest','run','tests/day-20-chain.test.ts'],{stdio:'inherit',env:{...process.env,REFEREE_CHAIN_TEST:'1'}});process.exitCode=await new Promise(resolve=>test.on('exit',code=>resolve(code??1)));
}finally{node.kill('SIGTERM');}
