// Local compatible agent. Signing/encryption keys never enter the deployed app.
import {readFile,writeFile} from 'node:fs/promises';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StreamableHTTPClientTransport} from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {privateKeyToAccount} from 'viem/accounts';
import {generateKey,publicPart,digest,open} from '@dapptober/memory/src/crypto';
const [command,file]=process.argv.slice(2);
if(command==='keygen'){
 if(!file)throw new Error('Supply a NEW private key backup path');const keys=await generateKey();await writeFile(file,JSON.stringify({format:'cathedral-agent-key-v1',privateKey:keys.privateKey},null,2),{mode:0o600,flag:'wx'});console.log('Agent key saved privately; public fingerprint '+digest(keys.publicKey));
}else{
 if(!['request','read'].includes(command)||!file)throw new Error('Use keygen|request|read and a local private RSA key file');
 const key=JSON.parse(await readFile(file,'utf8')).privateKey,publicKey=publicPart(key),env=process.env;
 for(const name of ['MEMORY_AGENT_PRIVATE_KEY','MEMORY_OWNER','MEMORY_ID','MEMORY_REGISTRY','MEMORY_MCP_URL','MEMORY_PURPOSE','CHAIN_ID'])if(!env[name])throw new Error('Missing local client '+name);
 const url=new URL(env.MEMORY_MCP_URL);if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))throw new Error('Use HTTPS outside localhost');const chainId=Number(env.CHAIN_ID);if(![84532,8453,31337].includes(chainId))throw new Error('Unsupported chain');
 const account=privateKeyToAccount(env.MEMORY_AGENT_PRIVATE_KEY),tool='memory.'+command,deadline=Math.floor(Date.now()/1000)+120,nonce=digest(crypto.randomUUID());
 const types={MemoryCall:[{name:'owner',type:'address'},{name:'id',type:'bytes32'},{name:'tool',type:'string'},{name:'purposeHash',type:'bytes32'},{name:'publicKeyHash',type:'bytes32'},{name:'nonce',type:'bytes32'},{name:'deadline',type:'uint256'}]};
 const signature=await account.signTypedData({domain:{name:'Memory Cathedral',version:'1',chainId,verifyingContract:env.MEMORY_REGISTRY},types,primaryType:'MemoryCall',message:{owner:env.MEMORY_OWNER,id:env.MEMORY_ID,tool,purposeHash:digest(env.MEMORY_PURPOSE),publicKeyHash:digest(publicKey),nonce,deadline:BigInt(deadline)}});
 const client=new Client({name:'vesper-compatible-agent',version:'1.0.0'});await client.connect(new StreamableHTTPClientTransport(url));
 try{const result=await client.callTool({name:tool,arguments:{owner:env.MEMORY_OWNER,id:env.MEMORY_ID,agent:account.address,publicKey,purpose:env.MEMORY_PURPOSE,nonce,deadline,signature}});if(result.isError)throw new Error(result.content[0].text);const packet=JSON.parse(result.content[0].text);if(packet.blocked)throw new Error(packet.review?.reason??packet.reason);console.log(JSON.stringify(command==='read'?await open(packet.envelope,key,packet.wrappedKey):packet,null,2));}finally{await client.close();}
}
