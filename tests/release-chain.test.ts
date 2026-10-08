import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {createWalletClient,http,keccak256,toHex,type Abi,type Hex} from 'viem';
import {mnemonicToAccount} from 'viem/accounts';
import {foundry} from 'viem/chains';
import {config} from '@dapptober/config';
import {publicClient,execute,sessionAbi,escrowAbi,treasuryAbi,passportAbi} from '@dapptober/chain';
import {feedbackTyped,registration,refreshPassports} from '@dapptober/identity';
import {monitor} from '@dapptober/treasury';
import {initialState} from '@dapptober/agent-core/src/store';

const enabled=process.env.RELEASE_CHAIN_TEST==='1';
const rpc='http://127.0.0.1:18549';
const mnemonic='test test test test test test test test test test test junk';
const [owner,agent,client,validator]=[0,1,2,3].map(addressIndex=>mnemonicToAccount(mnemonic,{addressIndex}));
const c=config({AGENT_MODE:'real',CHAIN_ID:'31337',RPC_URL:rpc,OWNER_ADDRESS:owner.address,AGENT_PRIVATE_KEY:agent.getHdKey().privateKey?('0x'+Buffer.from(agent.getHdKey().privateKey!).toString('hex')):undefined});
const pub=publicClient(c);
const wallet=createWalletClient({account:owner,chain:foundry,transport:http(rpc)});
function artifact(file:string,name=file){const a=JSON.parse(readFileSync(new URL(`../contracts/out/${file}.sol/${name}.json`,import.meta.url),'utf8'));return {abi:a.abi as Abi,bytecode:('0x'+a.bytecode.object.replace(/^0x/,'')) as Hex};}
async function deploy(file:string,args:readonly unknown[]=[],name=file){const hash=await wallet.deployContract({...artifact(file,name),args});const r=await pub.waitForTransactionReceipt({hash});expect(r.status).toBe('success');return r.contractAddress!;}
async function send(address:Hex,abi:Abi,functionName:string,args:readonly unknown[]=[],account=owner){const w=createWalletClient({account,chain:foundry,transport:http(rpc)});const {request}=await pub.simulateContract({address,abi,functionName,args,account});const r=await pub.waitForTransactionReceipt({hash:await w.writeContract(request)});expect(r.status).toBe('success');return r;}
const mocks=enabled?artifact('Agents.t','MockUSDC').abi:[];

it.skipIf(!enabled)('Day 01 deploys SessionVault, signs a scoped transfer and rejects replay and revocation through the real chain adapter',async()=>{
 const token=await deploy('Agents.t',[],'MockUSDC'),vault=await deploy('SessionVault',[owner.address]);const cfg={...c,USDC_ADDRESS:token,SESSION_VAULT:vault};
 await send(token,mocks,'mint',[vault,20_000_000n]);await send(vault,sessionAbi,'allowToken',[token,true]);await send(vault,sessionAbi,'allowRecipient',[client.address,true]);const deadline=(await pub.getBlock()).timestamp+3600n;
 await send(vault,sessionAbi,'grant',[agent.address,10_000_000n,5_000_000n,5_000_000n,deadline]);
 const requestId=keccak256(toHex('release-transfer')),args=[token,client.address,1_000_000n,deadline,false,requestId] as const;
 const hash=await pub.readContract({address:vault,abi:artifact('SessionVault').abi,functionName:'digest',args}) as Hex;const signature=await agent.sign({hash});
 await execute(cfg,vault,sessionAbi,'transfer',[...args,signature,'0x']);expect(await pub.readContract({address:token,abi:mocks,functionName:'balanceOf',args:[client.address]})).toBe(1_000_000n);
 await expect(execute(cfg,vault,sessionAbi,'transfer',[...args,signature,'0x'])).rejects.toThrow();
 await send(vault,sessionAbi,'revoke');await expect(execute(cfg,vault,sessionAbi,'transfer',[...args,signature,'0x'])).rejects.toThrow();
},30000);

it.skipIf(!enabled)('Day 03 deploys passport, signs independent job feedback, attests and reconciles directory from chain',async()=>{
 const registry=await deploy('AgentPassport'),cfg={...c,PASSPORT_REGISTRY:registry};const card={name:'Release fixture',endpoint:'https://fixture.example',capabilities:['summarize'],owner:owner.address,wallet:agent.address};
 await send(registry,passportAbi,'register',[registration(card).uri]);const job='release-job',jobHash=keccak256(toHex(job));await send(registry,passportAbi,'recordJob',[1n,jobHash,client.address]);
 const deadline=Number((await pub.getBlock()).timestamp)+3600,uri='data:text/plain,fixture';const signature=await client.signTypedData(feedbackTyped(cfg,'1',job,92,uri,deadline));
 await execute(cfg,registry,passportAbi,'giveFeedback',[1n,jobHash,92,uri,BigInt(deadline),signature]);await expect(execute(cfg,registry,passportAbi,'giveFeedback',[1n,jobHash,92,uri,BigInt(deadline),signature])).rejects.toThrow();
 await send(registry,passportAbi,'attest',[1n,jobHash,95,keccak256(toHex('evidence'))],validator);const s=initialState(3,cfg);await refreshPassports(s,cfg);expect(s.passports[0].feedback[0].score).toBe(92);expect(s.passports[0].attestations[0].validator.toLowerCase()).toBe(validator.address.toLowerCase());
},30000);

it.skipIf(!enabled)('Day 04 deploys funded escrow and settles approval and disputed-refund paths',async()=>{
 const token=await deploy('Agents.t',[],'MockUSDC'),escrow=await deploy('QuestEscrow',[token]),cfg={...c,USDC_ADDRESS:token,QUEST_ESCROW:escrow};await send(token,mocks,'mint',[owner.address,20_000_000n]);await send(token,mocks,'approve',[escrow,20_000_000n]);const deadline=(await pub.getBlock()).timestamp+3600n;
 for(let i=1n;i<=2n;i++){await send(escrow,escrowAbi,'create',['Fixture',10_000_000n,deadline,validator.address]);await execute(cfg,escrow,escrowAbi,'claim',[i]);await execute(cfg,escrow,escrowAbi,'submit',[i,keccak256(toHex('work')),'data:text/plain,work']);}
 await send(escrow,escrowAbi,'approve',[1n]);await send(escrow,escrowAbi,'dispute',[2n]);await send(escrow,escrowAbi,'resolve',[2n,false],validator);
 expect(await pub.readContract({address:token,abi:mocks,functionName:'balanceOf',args:[agent.address]})).toBe(10_000_000n);expect(await pub.readContract({address:token,abi:mocks,functionName:'balanceOf',args:[escrow]})).toBe(0n);
},30000);

it.skipIf(!enabled)('Day 05 deploys treasury and two ERC4626 fixtures, monitors and performs bounded deposit/withdraw/pause/recovery',async()=>{
 const token=await deploy('Agents.t',[],'MockUSDC'),treasury=await deploy('FlightTreasury',[owner.address,token]);const vaults=[await deploy('Agents.t',[token],'MockVault'),await deploy('Agents.t',[token],'MockVault')];
 const cfg={...c,USDC_ADDRESS:token,FLIGHT_TREASURY:treasury,VAULT_CONFIG:JSON.stringify(vaults.map((address,i)=>({address,name:'Fixture '+i,kind:i?'savings':'lending',risk:1})))};await send(token,mocks,'mint',[treasury,1_000_000_000n]);for(const vault of vaults)await send(treasury,treasuryAbi,'setVault',[vault,5000,1,true]);await send(treasury,treasuryAbi,'setPlan',[agent.address,250_000_000n,2000n,1,500_000_000n,(await pub.getBlock()).timestamp+3600n]);
 await execute(cfg,treasury,treasuryAbi,'deposit',[vaults[0],250_000_000n,1n,keccak256(toHex('deposit'))]);const s=initialState(5,cfg);await monitor(s,cfg);expect(s.treasuryLiquid).toBe('750');expect(s.vaults[0].assets).toBe('250');expect(s.vaults.every(v=>v.apy===null)).toBe(true);
 await execute(cfg,treasury,treasuryAbi,'withdraw',[vaults[0],100_000_000n,2n**255n,keccak256(toHex('withdraw'))]);await send(treasury,treasuryAbi,'disengage');await expect(execute(cfg,treasury,treasuryAbi,'deposit',[vaults[1],1_000_000n,1n,keccak256(toHex('paused'))])).rejects.toThrow();await send(treasury,treasuryAbi,'withdrawAll');expect(await pub.readContract({address:token,abi:mocks,functionName:'balanceOf',args:[owner.address]})).toBe(1_000_000_000n);
},30000);
