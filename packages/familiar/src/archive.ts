import {createHash} from 'node:crypto';
import postgres from 'postgres';
import {databaseOptions,type Config} from '@dapptober/config';
import type {NativeJob} from './model';

const connections=new Map<string,ReturnType<typeof postgres>>();
function database(c:Config){
 if(!c.SUPABASE_DATABASE_URL||!c.OPERATOR_TOKEN)throw new Error('Private durable queue required');
 let sql=connections.get(c.SUPABASE_DATABASE_URL);if(!sql){sql=postgres(c.SUPABASE_DATABASE_URL,databaseOptions(c.SUPABASE_DATABASE_URL));connections.set(c.SUPABASE_DATABASE_URL,sql);}return sql;
}
const namespace=(c:Config)=>`${c.CHAIN_ID}:`+createHash('sha256').update(c.OPERATOR_TOKEN??'').digest('hex');
async function archiveDatabase(c:Config){const sql=database(c);await sql`CREATE TABLE IF NOT EXISTS dapptober_familiar_jobs (namespace text NOT NULL,id text NOT NULL,archived_at timestamptz NOT NULL DEFAULT now(),body jsonb NOT NULL,PRIMARY KEY(namespace,id))`;await sql`ALTER TABLE dapptober_familiar_jobs ENABLE ROW LEVEL SECURITY`;return sql;}
export async function archivedJob(c:Config,id:string){const sql=await archiveDatabase(c);const rows=await sql`SELECT id FROM dapptober_familiar_jobs WHERE namespace=${namespace(c)} AND id=${id}`;return rows.length>0;}
export async function archiveJobs(c:Config,jobs:NativeJob[]){
 if(jobs.some(j=>!['sent','cancelled'].includes(j.status)))throw new Error('Only terminal jobs can be archived');
 const sql=await archiveDatabase(c);await sql.begin(async tx=>{for(const job of jobs){const body={...job,interaction:undefined,attempt:undefined};await tx`INSERT INTO dapptober_familiar_jobs(namespace,id,body) VALUES (${namespace(c)},${job.id},${tx.json(body)}) ON CONFLICT DO NOTHING`;}});
}
export async function archivedJobs(c:Config,offset:number){const sql=await archiveDatabase(c);const rows=await sql`SELECT body FROM dapptober_familiar_jobs WHERE namespace=${namespace(c)} ORDER BY archived_at,id LIMIT 100 OFFSET ${offset}`;return {jobs:rows.map(r=>r.body),nextOffset:offset+rows.length};}
