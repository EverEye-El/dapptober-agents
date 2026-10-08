import {verifyProof} from '@dapptober/inference';
import {config} from '@dapptober/config';
const running=new Set<string>();
export async function POST(request:Request){
 const ip=request.headers.get('x-forwarded-for')??'local';if(running.has(ip)||running.size>=8)return Response.json({error:'Verifier busy; retry shortly'},{status:429});
 running.add(ip);try{if(Number(request.headers.get('content-length'))>100000)throw new Error('Receipt too large');const text=await request.text();if(text.length>100000)throw new Error('Receipt too large');return Response.json(await verifyProof(JSON.parse(text),config()),{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Invalid or oversized JSON receipt'},{status:400});}finally{running.delete(ip);}
}
