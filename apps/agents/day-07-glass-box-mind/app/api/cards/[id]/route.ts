import {getPublicCard} from '@dapptober/inference';
import {config} from '@dapptober/config';
export const dynamic='force-dynamic';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;if(!/^0x[0-9a-f]{64}$/.test(id))return Response.json({error:'Unknown card'},{status:404});const card=await getPublicCard(id,config());return card?Response.json(card,{headers:{'Cache-Control':'no-store'}}):Response.json({error:'Card is private or unavailable'},{status:404});}
