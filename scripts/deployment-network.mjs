// Public deployments are Base only. Local Anvil remains available for integration tests.
export function deploymentNetworkAllowed(chainId,rpcURL){
  return [8453,84532].includes(chainId)||(chainId===31337&&['localhost','127.0.0.1','[::1]'].includes(new URL(rpcURL).hostname));
}
export async function checkDeploymentNetwork(rpcURL){
  if(!rpcURL)throw new Error('Deployment requires --rpc-url or RPC_URL');
  let chainId;
  try{const response=await fetch(rpcURL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]}),signal:AbortSignal.timeout(10000)});const data=await response.json();if(!response.ok||data.error)throw new Error();chainId=Number(BigInt(data.result));}catch{throw new Error('Cannot verify deployment RPC network; endpoint details withheld');}
  if(!deploymentNetworkAllowed(chainId,rpcURL))throw new Error('Deployment restricted to Base Sepolia (84532), Base (8453), or localhost Anvil (31337)');
  return chainId;
}
