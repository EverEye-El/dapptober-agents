import {spawn} from 'node:child_process';
import {readdirSync} from 'node:fs';
const [command,day]=process.argv.slice(2);
if(!['dev','start','build'].includes(command))throw new Error('Expected dev, start or build');
const dirs=readdirSync('apps/agents').filter(x=>!day||x.startsWith(`day-${day.padStart(2,'0')}-`));
if(!dirs.length)throw new Error('Unknown day');
const children=[];
for(const dir of dirs){
 const child=spawn('npm',['run',command,'--workspace',`apps/agents/${dir}`],{stdio:'inherit'});children.push(child);
 child.on('error',err=>{console.error(err.message);process.exitCode=1;});
 if(command==='build')await new Promise(resolve=>child.on('exit',code=>{if(code)process.exit(code);resolve();}));
 else child.on('exit',code=>{if(code){process.exitCode=code;for(const sibling of children)if(sibling!==child)sibling.kill('SIGTERM');}});
}
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{for(const child of children)child.kill(signal);});
