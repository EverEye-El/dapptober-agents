import {apiPost} from '@dapptober/agent-core';
export const runtime='nodejs';
// Same operator authentication, storage lock, body limit and receipts as the console.
// This endpoint accepts only the registered server signer lane; callers cannot choose a signer.
export async function POST(request:Request){
 const raw=await request.text();if(raw.length>65536)return Response.json({error:'Request too large'},{status:413});
 try{const input=JSON.parse(raw);return apiPost(9,new Request(request.url,{method:'POST',headers:request.headers,body:JSON.stringify({action:'forecast.agent',input})}));}catch{return Response.json({error:'Invalid JSON'},{status:400});}
}
