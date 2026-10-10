import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {checkDeploymentNetwork} from './deployment-network.mjs';
const [command='test',...args]=process.argv.slice(2);
if(command==='create'){const index=args.indexOf('--rpc-url');const rpc=index>=0?args[index+1]:args.find(v=>v.startsWith('--rpc-url='))?.slice(10)??process.env.RPC_URL;try{const chainId=await checkDeploymentNetwork(rpc);console.log(`Verified deployment chain: ${chainId}`);}catch(error){console.error(error.message);process.exit(1);}}
const result=spawnSync('forge',[command,'--root','contracts','--use',resolve('scripts/solc.mjs'),...args],{stdio:'inherit'});
process.exit(result.status??1);
