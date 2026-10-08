import {publicSenate} from '@dapptober/governance';
import {config} from '@dapptober/config';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await publicSenate(config()),{headers:{'Cache-Control':'no-store'}});}catch(e){return Response.json({error:e instanceof Error?e.message:'Senate unavailable'},{status:503});}}
