import {mkdir,readFile,writeFile,rename} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import postgres from 'postgres';
import type {Config} from '@dapptober/config';
import {emptyDB,type CheckpointDB} from './model';
const databases=new Map<string,ReturnType<typeof postgres>>();
const queues=new Map<string,Promise<unknown>>();
export function checkpointScope(c:Config){return `${c.WORLD_RP_ID??'demo-rp'}:${c.WORLD_ACTION}`;}
// Stable provider/action namespace preserves uniqueness across operator/session-key rotations.
export async function withCheckpoint<T>(c:Config,work:(db:CheckpointDB)=>Promise<T>):Promise<T>{
 const key=createHash('sha256').update(checkpointScope(c)).digest('hex');
 if(c.AGENT_MODE==='real'){
  if(!c.DATABASE_URL)throw new Error('Real mode requires DATABASE_URL');let sql=databases.get(c.DATABASE_URL);if(!sql){sql=postgres(c.DATABASE_URL,{max:5,prepare:false,ssl:['localhost','127.0.0.1'].includes(new URL(c.DATABASE_URL).hostname)?false:'require'});databases.set(c.DATABASE_URL,sql);}
  await sql`CREATE TABLE IF NOT EXISTS dapptober_checkpoint (id text PRIMARY KEY, body jsonb NOT NULL)`;
  await sql`ALTER TABLE dapptober_checkpoint ENABLE ROW LEVEL SECURITY`;
  return await sql.begin(async tx=>{await tx`INSERT INTO dapptober_checkpoint (id,body) VALUES (${key},${tx.json(emptyDB() as unknown as postgres.JSONValue)}) ON CONFLICT DO NOTHING`;const rows=await tx`SELECT body FROM dapptober_checkpoint WHERE id=${key} FOR UPDATE`;const db=rows[0].body as CheckpointDB;const result=await work(db);await tx`UPDATE dapptober_checkpoint SET body=${tx.json(db as unknown as postgres.JSONValue)} WHERE id=${key}`;return result;}) as T;
 }
 const task=(queues.get(key)??Promise.resolve()).catch(()=>{}).then(async()=>{const dir=join(process.cwd(),'.data');await mkdir(dir,{recursive:true});const file=join(dir,`checkpoint-${key}.json`);let db:CheckpointDB;try{db=JSON.parse(await readFile(file,'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;db=emptyDB();}const result=await work(db);const tmp=file+'.'+randomUUID()+'.tmp';await writeFile(tmp,JSON.stringify(db),{mode:0o600});await rename(tmp,file);return result;});queues.set(key,task);try{return await task;}finally{if(queues.get(key)===task)queues.delete(key);}
}
