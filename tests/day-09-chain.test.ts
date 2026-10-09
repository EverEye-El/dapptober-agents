import {it,expect,vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {createPublicClient,createWalletClient,http,stringToHex,type Address,type Hex} from 'viem';
import {foundry} from 'viem/chains';
import {privateKeyToAccount} from 'viem/accounts';
import {config} from '@dapptober/config';
import {initialState} from '@dapptober/agent-core/src/store';
import {forecastAction,refreshForecast,arena,scores,forecastAbi,oracleAbi} from '@dapptober/forecast';
import {verifyReceipts} from '@dapptober/receipts';
import type {Transaction} from '@dapptober/types';
// Provider double is explicit; contracts, wallets, balances, transactions and callbacks are real Anvil.
vi.mock('@dapptober/agent-core/src/ai',()=>({judge:async()=>({allow:true,confidence:.95,fit:.95,abuse:0,route:'small',source:'simulated',reason:'Local provider double'}),reasoner:()=>({structured:async()=>({yes:true,probability:7500,reason:'Local evidence fixture'})})}));
it.skipIf(process.env.FORECAST_CHAIN_TEST!=='1')('deploys real market, funds both lanes, enforces risk, disputes, reasserts, settles and pays USDC',async()=>{
 const owner=privateKeyToAccount('0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as Hex),agentKey='0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d' as Hex,agent=privateKeyToAccount(agentKey);
 const url='http://127.0.0.1:18550',pub=createPublicClient({chain:foundry,transport:http(url),pollingInterval:50,cacheTime:0}),wallet=createWalletClient({account:owner,chain:foundry,transport:http(url)});
 const artifact=(file:string,name:string)=>JSON.parse(readFileSync(`contracts/out/${file}/${name}.json`,'utf8'));
 const mined=async(hash:Hex)=>{expect((await pub.waitForTransactionReceipt({hash})).status).toBe('success');return hash;};
 async function deploy(file:string,name:string,args:unknown[]=[]){const a=artifact(file,name),hash=await wallet.deployContract({abi:a.abi,bytecode:a.bytecode.object as Hex,args,nonce:await pub.getTransactionCount({address:owner.address,blockTag:'pending'})});return (await pub.waitForTransactionReceipt({hash})).contractAddress!;}
 async function send(t:Transaction){return mined(await wallet.sendTransaction({to:t.to,data:t.data,nonce:await pub.getTransactionCount({address:owner.address,blockTag:'pending'})}));}
 const token=await deploy('Agents.t.sol','MockUSDC'),oracle=await deploy('ForecastColosseum.t.sol','MockForecastOracle',[token]),market=await deploy('ForecastColosseum.sol','ForecastColosseum',[owner.address,token,oracle,120n,stringToHex('ASSERT_TRUTH2',{size:32})]);
 const tokenAbi=artifact('Agents.t.sol','MockUSDC').abi,oracleMock=artifact('ForecastColosseum.t.sol','MockForecastOracle').abi;
 async function write(address:Address,abi:typeof tokenAbi,functionName:string,args:unknown[]=[]){const {request}=await pub.simulateContract({address,abi,functionName,args,account:owner,nonce:await pub.getTransactionCount({address:owner.address,blockTag:'pending'})});return mined(await wallet.writeContract(request));}
 await write(token,tokenAbi,'mint',[owner.address,100000000n]);await write(token,tokenAbi,'mint',[agent.address,100000000n]);
 const c=config({AGENT_MODE:'real',CHAIN_ID:'31337',RPC_URL:url,OWNER_ADDRESS:owner.address,AGENT_PRIVATE_KEY:agentKey,USDC_ADDRESS:token,UMA_ORACLE:oracle,FORECAST_MARKET:market});const s=initialState(9,c);
 const action=async(name:string,input:Record<string,unknown>)=>forecastAction(s,c,name,input) as Promise<{transaction?:Transaction;transactions?:Transaction[]}>;
 const risk=await action('forecast.risk',{trader:agent.address,perTrade:'5',perMarket:'10',daily:'15'});await send(risk.transaction!);
 const close=Number((await pub.getBlock()).timestamp)+600;const created=await action('forecast.create',{question:'Will the fixture exceed 10?',rules:'YES if signed fixture exceeds 10 at cutoff; NO otherwise; INVALID if unavailable.',close});await send(created.transaction!);
 const human=await action('forecast.trade',{id:'1',trader:owner.address,amount:'6',yes:false,probability:2000});for(const t of human.transactions!)await send(t);
 await forecastAction(s,c,'forecast.agent',{id:'1',amount:'4',evidence:'Fixture source: observation exceeds 10'});await refreshForecast(s,c);expect(arena(s).markets[0].positions).toHaveLength(2);await expect(forecastAction(s,c,'forecast.agent',{id:'1',amount:'6',evidence:'Source'})).rejects.toThrow('risk');
 // Bypass the application: onchain constraints still reject oversize stakes.
 const agentWallet=createWalletClient({account:agent,chain:foundry,transport:http(url)});await expect(pub.simulateContract({account:agentWallet.account,address:market,abi:forecastAbi,functionName:'trade',args:[1n,true,6000000n,7000]})).rejects.toThrow('agent risk');
 async function jump(time:number){await pub.request({method:'evm_setNextBlockTimestamp',params:[time]} as never);await pub.request({method:'evm_mine',params:[]} as never);}
 await jump(close+1);const assertion=await action('forecast.assert',{id:'1',outcome:1,evidence:'Fixture observation confirms YES'});for(const t of assertion.transactions!)await send(t);await refreshForecast(s,c);const id=arena(s).markets[0].assertionId!;
 const dispute=await action('forecast.dispute',{id:'1'});for(const t of dispute.transactions!)await send(t);await jump(Number((await pub.getBlock()).timestamp)+121);await refreshForecast(s,c);expect(arena(s).markets[0].disputed).toBe(true);await expect(pub.simulateContract({account:owner,address:market,abi:forecastAbi,functionName:'settle',args:[1n]})).rejects.toThrow();
 await write(oracle,oracleMock,'arbitrate',[id,false]);await refreshForecast(s,c);expect(arena(s).markets[0].assertionId).toBeUndefined();const next=await action('forecast.assert',{id:'1',outcome:1,evidence:'Corrected fixture observation confirms YES'});for(const t of next.transactions!)await send(t);await jump(Number((await pub.getBlock()).timestamp)+121);const settle=await action('forecast.settle',{id:'1'});await send(settle.transaction!);await refreshForecast(s,c);expect(scores(arena(s)).board[0]).toMatchObject({lane:'agent',brier:.0625});
 await forecastAction(s,c,'forecast.claim',{id:'1',trader:agent.address});await refreshForecast(s,c);expect(arena(s).markets[0].positions.find(p=>p.trader===agent.address)?.claimed).toBe(true);expect(await pub.readContract({address:token,abi:tokenAbi,functionName:'balanceOf',args:[agent.address]})).toBe(106000000n);expect(s.receipts.some(r=>r.txHash&&r.mode==='real')).toBe(true);expect(verifyReceipts(s.receipts)).toBe(true);
 expect(oracleAbi.length).toBe(2);
},90000);
