import {readFileSync,existsSync} from 'node:fs';import {parseEnv} from 'node:util';
const file='apps/agents/day-28-per-second-waterfall/.env.local';
const env={...parseEnv(readFileSync('apps/agents/day-28-per-second-waterfall/.env.example','utf8')),...existsSync(file)?parseEnv(readFileSync(file,'utf8')):{},...process.env},gaps=[];
if(env.AGENT_MODE!=='demo')gaps.push('AGENT_MODE=demo required for the hosted demo target');
for(const key of ['OPERATOR_TOKEN','WATERFALL_SESSION_SECRET'])if((env[key]??'').length<32)gaps.push(key+': private stable random secret of at least 32 characters');
if(!env.SUPABASE_DATABASE_URL&&env.WATERFALL_STORAGE!=='local')gaps.push('SUPABASE_DATABASE_URL: private Supabase Session pooler URI required on serverless');
if(!env.SUPABASE_DATABASE_URL&&env.WATERFALL_STORAGE==='local')gaps.push('Persistent disk: WATERFALL_STORAGE=local is only valid on a single server with a mounted .data volume; verify disk persistence before launch');
if(!env.PUBLIC_ORIGIN?.startsWith('https://'))gaps.push('PUBLIC_ORIGIN: final HTTPS origin required for hosted cookie security');
console.log('Day 28 hosted-demo configuration — '+(gaps.length?'NEEDS SETUP':'FIELDS PRESENT; hosted acceptance still required'));for(const gap of gaps)console.log(' - '+gap);console.log('No deployment, paid request or database write performed. Confirm persistence, keeper access and visitor isolation on the actual host.');process.exitCode=gaps.length?1:0;
