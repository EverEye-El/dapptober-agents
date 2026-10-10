import {expect,it,vi} from 'vitest';
import {config} from '@dapptober/config';
const fixture=vi.hoisted(()=>({connections:[] as {url:string;options:unknown;queries:string[]}[]}));
vi.mock('postgres',()=>({default:(url:string,options:unknown)=>{
 const queries:string[]=[],rows=new Map<string,unknown>();fixture.connections.push({url,options,queries});
 const sql=Object.assign(async(strings:TemplateStringsArray,...values:unknown[])=>{
  const text=strings.join('?');queries.push(text);const id=String(values[0]);
  if(text.startsWith('INSERT')&&!rows.has(id))rows.set(id,values[1]);
  if(text.startsWith('SELECT'))return [{body:structuredClone(rows.get(id))}];
  if(text.startsWith('UPDATE'))rows.set(String(values[1]),structuredClone(values[0]));
  return [];
 },{json:(value:unknown)=>value,begin:async(work:(sql:unknown)=>Promise<unknown>)=>work(sql)});return sql;
}}));
import {withState} from '@dapptober/agent-core/src/store';
import {withCheckpoint} from '@dapptober/checkpoint/src/store';
it('keeps different Supabase projects isolated and enables RLS before shared state access',async()=>{
 const settings={AGENT_MODE:'real',OPERATOR_TOKEN:'s'.repeat(32)};
 const first=config({...settings,DATABASE_URL:'postgresql://postgres:fixture@first.supabase.co/postgres'}),second=config({...settings,DATABASE_URL:'postgresql://postgres:fixture@second.supabase.co/postgres'});
 await withState(1,'operator',first,async s=>{s.balance='7';});
 expect((await withState(1,'operator',second,async s=>s.balance)).result).toBe('0');
 expect((await withState(1,'operator',first,async s=>s.balance)).result).toBe('7');
 for(const connection of fixture.connections.slice(0,2)){
  expect(connection.options).toEqual({max:5,prepare:false,ssl:'require'});
  expect(connection.queries.indexOf('ALTER TABLE dapptober_state ENABLE ROW LEVEL SECURITY')).toBeLessThan(connection.queries.findIndex(q=>q.startsWith('INSERT')));
 }
});
it('applies the same Supabase TLS/pooling policy to checkpoint uniqueness storage',async()=>{
 const c=config({AGENT_MODE:'real',DATABASE_URL:'postgresql://postgres:fixture@checkpoint.supabase.co/postgres'});
 await withCheckpoint(c,async db=>Object.keys(db.people).length);
 const connection=fixture.connections.find(x=>x.url===c.DATABASE_URL)!;
 expect(connection.options).toEqual({max:5,prepare:false,ssl:'require'});
 expect(connection.queries).toContain('ALTER TABLE dapptober_checkpoint ENABLE ROW LEVEL SECURITY');
});

it('refuses to relabel testnet receipts and balances as Base production state',async()=>{
 const settings={AGENT_MODE:'real',OPERATOR_TOKEN:'t'.repeat(32),DATABASE_URL:'postgresql://postgres:fixture@network.supabase.co/postgres'};
 const test=config({...settings,CHAIN_ID:'84532'}),production=config({...settings,CHAIN_ID:'8453'});
 await withState(2,'operator',test,async s=>{s.balance='12';});
 await expect(withState(2,'operator',production,async s=>s.balance)).rejects.toThrow('Stored workspace belongs to another chain');
 expect((await withState(2,'operator',test,async s=>s.balance)).result).toBe('12');
});
