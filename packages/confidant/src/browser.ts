// Browser capability: private values never cross the app API boundary.
import {createPublicClient,createWalletClient,http,custom,keccak256,toHex,type Address,type Hex,type EIP1193Provider} from 'viem';
import {baseSepolia} from 'viem/chains';
import {sameConfidentialInstruction} from './recovery';
import {confidantAbi,parseCredits} from './protocol';
export type PublicOptions={chainId:number;rpc?:string;contract?:string;codeHash?:string};
export async function connectConfidant(provider:EIP1193Provider,options:PublicOptions){
 if(options.chainId!==84532)throw new Error('This CoFHE release supports Base Sepolia; Base production remains blocked.');
 if(!options.rpc||!options.contract||!options.codeHash)throw new Error('Configure the reviewed deployment, code hash and public browser RPC first.');
 const endpoint=new URL(options.rpc);if(endpoint.protocol!=='https:')throw new Error('Public browser RPC must use HTTPS');
 const wallet=createWalletClient({chain:baseSepolia,transport:custom(provider)});
 const [account]=await wallet.requestAddresses();if(await wallet.getChainId()!==84532)await wallet.switchChain({id:84532});
 const client=createPublicClient({chain:baseSepolia,transport:http(options.rpc)}),address=options.contract as Address;
 const assertWallet=async()=>{const [current]=await wallet.getAddresses();if(current?.toLowerCase()!==account.toLowerCase()||await wallet.getChainId()!==84532)throw new Error('Wallet changed; lock and reconnect.');};
 const verify=async()=>{await assertWallet();if(await client.getChainId()!==84532)throw new Error('Browser RPC network mismatch');const code=await client.getCode({address});if(!code||keccak256(code)!==options.codeHash)throw new Error('Unapproved deployment bytecode');if(await client.readContract({address,abi:confidantAbi,functionName:'version'})!==keccak256(toHex('HUSH_ALLOCATION_V1')))throw new Error('Wrong deployment version');};
 await verify();
 const [{createCofheClient,createCofheConfig},{chains},{Encryptable,FheTypes}]=await Promise.all([import('@cofhe/sdk/web'),import('@cofhe/sdk/chains'),import('@cofhe/sdk')]);
 const fhe=createCofheClient(createCofheConfig({supportedChains:[chains.baseSepolia],fheKeyStorage:null,tfheThreads:false,acp:{defaultContractScopes:{84532:[address]}}}));
 // Generic RPC client avoids Base-specific transaction extensions in the SDK PublicClient type.
 await fhe.connect(createPublicClient({transport:http(options.rpc)}),wallet);let acpHash:string|undefined,locked=false;
 const active=async()=>{if(locked)throw new Error('Session locked');await verify();};
 return {account,
  async read(id:bigint){await active();const count=await client.readContract({address,abi:confidantAbi,functionName:'count'}),initialized=await client.readContract({address,abi:confidantAbi,functionName:'initialized',args:[account]}),budget=await client.readContract({address,abi:confidantAbi,functionName:'budgets',args:[account]}),paused=await client.readContract({address,abi:confidantAbi,functionName:'paused'}),guardian=await client.readContract({address,abi:confidantAbi,functionName:'guardian'});const lot=id>0n&&id<=count?await client.readContract({address,abi:confidantAbi,functionName:'lots',args:[id]}):undefined;const reservation=lot?await client.readContract({address,abi:confidantAbi,functionName:'reservations',args:[id,account]}):undefined;await active();return {count:count.toString(),initialized,budget,paused,guardian,lot:lot?{creator:lot[0],end:Number(lot[1]),closed:lot[2],highest:lot[3],winner:lot[4],bids:lot[5]}:undefined,reservation};},
  async send(kind:'initializeBudget'|'bid'|'open'|'close'|'settle'|'pause',value:string,id:bigint){await active();let hash:Hex;
   if(kind==='initializeBudget'||kind==='bid'){const amount=parseCredits(value);const [handle,proof]=await fhe.encryptInputs([Encryptable.uint64(amount)]).setConsumingContract(address).execute();await active();if(kind==='initializeBudget')hash=await wallet.writeContract({account,address,abi:confidantAbi,functionName:'initializeBudget',args:[handle,proof]});else hash=await wallet.writeContract({account,address,abi:confidantAbi,functionName:'bid',args:[id,handle,proof]});}
   else if(kind==='open'){const end=BigInt(value);hash=await wallet.writeContract({account,address,abi:confidantAbi,functionName:'open',args:[end]});}
   else if(kind==='pause')hash=await wallet.writeContract({account,address,abi:confidantAbi,functionName:'pause',args:[value==='true']});
   else hash=await wallet.writeContract({account,address,abi:confidantAbi,functionName:kind,args:[id]});
   return hash;
  },
  async confirm(hash:Hex,onReplacement?:(hash:Hex)=>void){await active();const tx=await client.getTransaction({hash});if(tx.to?.toLowerCase()!==address.toLowerCase()||tx.from.toLowerCase()!==account.toLowerCase())throw new Error('Unrelated transaction');let changed=false;const mined=await client.waitForTransactionReceipt({hash,timeout:45000,onReplaced:replacement=>{if(!sameConfidentialInstruction(tx,replacement.transaction)){changed=true;return;}onReplacement?.(replacement.transaction.hash);}});await active();const confirmed=await client.getTransaction({hash:mined.transactionHash});changed ||= !sameConfidentialInstruction(tx,confirmed);return {...mined,changed};},
  async reveal(handle:Hex,type:'amount'|'address'='amount'){await active();if(!acpHash){const acp=await fhe.acp.createSelf({issuer:account,name:'Hush / fifteen-minute owner view',contracts:[address],expiration:Math.floor(Date.now()/1000)+900});acpHash=acp.hash;}const result=await fhe.decryptForView(handle,type==='address'?FheTypes.Uint160:FheTypes.Uint64).execute();await active();return result.toString();},
  async lock(){locked=true;if(acpHash)await fhe.acp.removeACP(acpHash,84532,account);fhe.disconnect();},
 };
}
export type ConnectedConfidant=Awaited<ReturnType<typeof connectConfidant>>;
export type ChainSnapshot=Awaited<ReturnType<ConnectedConfidant['read']>>;
export type Envelope={iv:string;ciphertext:string;aad:string};
const bytes=(s:string)=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),b64=(v:Uint8Array)=>btoa(String.fromCharCode(...v));
export async function demoCipher(){
 const key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']),aad=crypto.randomUUID();
 return {async seal(value:string):Promise<Envelope>{const padded=new TextEncoder().encode(value.padEnd(128,' '));if(padded.length!==128)throw new Error('Simulation value too large');const iv=crypto.getRandomValues(new Uint8Array(12)),ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:new TextEncoder().encode(aad)},key,padded);return {iv:b64(iv),ciphertext:b64(new Uint8Array(ciphertext)),aad};},async open(e:Envelope){if(e.aad!==aad)throw new Error('Different local owner session');const raw=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(e.iv),additionalData:new TextEncoder().encode(aad)},key,bytes(e.ciphertext));return new TextDecoder().decode(raw).trim();}};
}
