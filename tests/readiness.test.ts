import {expect,it} from 'vitest';
// The release checker deliberately reports field names, never credential values.
import {assess} from '../scripts/readiness.mjs';
it('reports missing credentials without exposing secret contents',()=>{
  const secret='secret-not-long-enough';const gaps=assess(1,{AGENT_MODE:'demo',OPERATOR_TOKEN:secret});
  expect(gaps).toContain('AGENT_MODE: still simulated');expect(gaps).toContain('SESSION_VAULT: missing');expect(JSON.stringify(gaps)).not.toContain(secret);
});
it('rejects CoW chain mismatch and insecure release origins',()=>{
  const gaps=assess(6,{CHAIN_ID:'84532',COW_CHAIN_ID:'11155111',PUBLIC_ORIGIN:'http://localhost:3006'});
  expect(gaps.some((x:string)=>x.startsWith('COW_CHAIN_ID:'))).toBe(true);expect(gaps).toContain('PUBLIC_ORIGIN: HTTPS required for release');
});
it('rejects duplicated vaults and unenrolled TEE measurements',()=>{
  const address='0x'+'11'.repeat(20);
  expect(assess(5,{VAULT_CONFIG:JSON.stringify([{address,name:'a',kind:'lending',risk:1},{address,name:'b',kind:'savings',risk:0}])}).some((x:string)=>x.startsWith('VAULT_CONFIG:'))).toBe(true);
  expect(assess(7,{TEE_MEASUREMENTS:'{}'})).toContain('TEE_MEASUREMENTS: enroll all five independently verified measurements');
});
it('accepts complete syntactic configuration without claiming live acceptance',()=>{
  const address='0x'+'11'.repeat(20);
  expect(assess(3,{AGENT_MODE:'real',OWNER_ADDRESS:address,OPERATOR_TOKEN:'a'.repeat(32),DATABASE_URL:'postgresql://fixture:fixture@localhost/fixture',RPC_URL:'https://rpc.example',TYPESAFE_API_KEY:'fixture',AI_API_KEY:'fixture',CHAIN_ID:'84532',PUBLIC_ORIGIN:'https://passport.example',PASSPORT_REGISTRY:address})).toEqual([]);
});
it('requires the independent forecast deployment and UMA oracle configuration',()=>{const gaps=assess(9,{AGENT_MODE:'real',FORECAST_MARKET:'invalid'});expect(gaps).toContain('UMA_ORACLE: missing');expect(gaps).toContain('USDC_ADDRESS: missing');expect(gaps).toContain('FORECAST_MARKET: invalid address');});

it('requires production personhood, durable uniqueness, registered identity and funded reward configuration for Day 10',()=>{const gaps=assess(10,{AGENT_MODE:'real',CHECKPOINT_REGISTRY:'bad',CHECKPOINT_SESSION_SECRET:'short'});expect(gaps).toContain('WORLD_SIGNING_KEY: missing');expect(gaps).toContain('CHECKPOINT_REGISTRY: invalid address');expect(gaps).toContain('CHECKPOINT_SESSION_SECRET: requires at least 32 characters');});

it('reports unavailable CoW settlement without treating matching Base Sepolia settings as a chain mismatch',()=>{const gaps=assess(6,{CHAIN_ID:'84532',COW_CHAIN_ID:'84532'});expect(gaps.some(x=>x.startsWith('COW_CHAIN_ID:'))).toBe(false);expect(gaps.some(x=>x.startsWith('CoW settlement:'))).toBe(true);});
