import {expect,it,vi,afterEach} from 'vitest';
import {config,tokenAddress,databaseOptions,BASE_USDC,BASE_SEPOLIA_USDC} from '@dapptober/config';
import {chain,publicClient} from '@dapptober/chain';
import {assess} from '../scripts/readiness.mjs';
import {readFileSync,readdirSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {deploymentNetworkAllowed,checkDeploymentNetwork} from '../scripts/deployment-network.mjs';
afterEach(()=>vi.restoreAllMocks());
it('all built examples use Base Sepolia and a private Supabase database URI field',()=>{
 const folders=readdirSync('apps/agents').filter(x=>/^day-\d+-/.test(x));expect(folders).toHaveLength(26);
 for(const folder of folders){const env=parseEnv(readFileSync(`apps/agents/${folder}/.env.example`,'utf8'));expect(config(env).CHAIN_ID).toBe(84532);expect(env).toHaveProperty('SUPABASE_DATABASE_URL');if(folder.startsWith('day-06'))expect(env.COW_CHAIN_ID).toBe('84532');}
});
it('uses Base network metadata and rejects Ethereum Sepolia configuration',()=>{
 expect(chain(config({CHAIN_ID:'8453'})).id).toBe(8453);expect(chain(config({CHAIN_ID:'84532'})).id).toBe(84532);expect(()=>config({CHAIN_ID:'11155111'})).toThrow();
 for(let day=1;day<=26;day++)expect(assess(day,{CHAIN_ID:'11155111'}).some(x=>x.startsWith('CHAIN_ID:'))).toBe(true);
});
it('rejects copied testnet USDC in a real Base deployment and preserves explicit local fixtures',()=>{
 expect(tokenAddress(config({AGENT_MODE:'real',CHAIN_ID:'8453'}))).toBe(BASE_USDC);expect(tokenAddress(config({AGENT_MODE:'real',CHAIN_ID:'84532'}))).toBe(BASE_SEPOLIA_USDC);
 expect(()=>tokenAddress(config({AGENT_MODE:'real',CHAIN_ID:'8453',USDC_ADDRESS:BASE_SEPOLIA_USDC}))).toThrow('must match');
 expect(tokenAddress(config({CHAIN_ID:'31337',USDC_ADDRESS:'0x'+'11'.repeat(20)}))).toBe('0x'+'11'.repeat(20));
});
it('requires TLS for a remote Supabase URL even if its query contains localhost and disables prepared statements',()=>{
 expect(databaseOptions('postgresql://db.supabase.invalid:5432/postgres?application_name=localhost')).toEqual({max:5,prepare:false,ssl:'require'});
 expect(databaseOptions('postgresql://127.0.0.1:5432/postgres').ssl).toBe(false);
});
it('rejects RPC chain mismatch before accepting a block number',async()=>{
 const fetchMock=vi.spyOn(globalThis,'fetch').mockImplementation(async(_url,options)=>{const body=JSON.parse(String(options?.body));return new Response(JSON.stringify({jsonrpc:'2.0',id:body.id,result:body.method==='eth_chainId'?'0x1':'0x123'}),{headers:{'Content-Type':'application/json'}});});
 await expect(publicClient(config({CHAIN_ID:'84532',RPC_URL:'https://fixture.invalid'})).getBlockNumber()).rejects.toThrow('RPC network does not match');
 expect(fetchMock.mock.calls.every(([,options])=>JSON.parse(String(options?.body)).method==='eth_chainId')).toBe(true);
});
it('allows correct Base RPC reads',async()=>{
 vi.spyOn(globalThis,'fetch').mockImplementation(async(_url,options)=>{const body=JSON.parse(String(options?.body));return new Response(JSON.stringify({jsonrpc:'2.0',id:body.id,result:body.method==='eth_chainId'?'0x14a34':'0x123'}),{headers:{'Content-Type':'application/json'}});});
 expect(await publicClient(config({CHAIN_ID:'84532',RPC_URL:'https://fixture.invalid'})).getBlockNumber()).toBe(291n);
});
it('blocks contract deployment to another public chain before broadcast',async()=>{
 expect(deploymentNetworkAllowed(31337,'http://127.0.0.1:8545')).toBe(true);expect(deploymentNetworkAllowed(31337,'https://remote.example')).toBe(false);
 vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify({result:'0xaa36a7'})));
 await expect(checkDeploymentNetwork('https://fixture.invalid')).rejects.toThrow('Deployment restricted');
});

it('each independent Vercel deployment builds its own day',()=>{for(const folder of readdirSync('apps/agents').filter(x=>/^day-\d+-/.test(x))){const day=folder.match(/^day-(\d+)-/)![1],deployment=JSON.parse(readFileSync(`apps/agents/${folder}/vercel.json`,'utf8'));expect(deployment.buildCommand).toBe(`cd ../../.. && pnpm run build ${day}`);}});
