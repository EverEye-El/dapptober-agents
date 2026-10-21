import {it,expect} from 'vitest';
import {createPublicClient,createWalletClient,http,parseAbi,keccak256,type Address} from 'viem';
import {generatePrivateKey,privateKeyToAccount} from 'viem/accounts';
import {createCofheClient,createCofheConfig} from '@cofhe/sdk/node';
import {Encryptable} from '@cofhe/sdk';
import {chains} from '@cofhe/sdk/chains';
import {writeFileSync} from 'node:fs';
// Opt-in public infrastructure / synthetic seven-credit encryption only. No transaction is sent.
it.skipIf(process.env.CONFIDANT_LIVE_TEST!=='1')('reads Base Sepolia CoFHE deployment and verifies a genuine synthetic encrypted input without broadcast',async()=>{
 const rpc='https://sepolia.base.org',client=createPublicClient({transport:http(rpc)}),account=privateKeyToAccount(generatePrivateKey()),wallet=createWalletClient({account,transport:http(rpc)});
 expect(await client.getChainId()).toBe(84532);const address='0xC0F4e00E531a2B086492Ae3DCC1515038307196b' as Address,block=await client.getBlockNumber(),code=await client.getCode({address});expect(code).toBeTruthy();const taskManager=await client.readContract({address,abi:parseAbi(['function getTm(uint256) view returns(address)']),functionName:'getTm',args:[1n]});expect(await client.getCode({address:taskManager})).toBeTruthy();
 const fhe=createCofheClient(createCofheConfig({supportedChains:[chains.baseSepolia],fheKeyStorage:null}));await fhe.connect(client,wallet);
 try{const [handle,proof]=await fhe.encryptInputs([Encryptable.uint64(7n)]).setConsumingContract(address).execute();expect(handle).toMatch(/^0x[0-9a-fA-F]{64}$/);expect(proof.length).toBeGreaterThan(100);writeFileSync('/tmp/day18-live-encryption.json',JSON.stringify({chainId:84532,block:block.toString(),addressBook:address,codeHash:keccak256(code!),taskManager,syntheticFixtureCredits:7,handle,proofBytes:(proof.length-2)/2,consumer:'address book / unused synthetic proof, not an app deployment',broadcast:false},null,2));}finally{fhe.disconnect();}
},180000);
