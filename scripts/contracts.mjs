import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const [command='test',...args]=process.argv.slice(2);
const result=spawnSync('forge',[command,'--root','contracts','--use',resolve('scripts/solc.mjs'),...args],{stdio:'inherit'});
process.exit(result.status??1);
