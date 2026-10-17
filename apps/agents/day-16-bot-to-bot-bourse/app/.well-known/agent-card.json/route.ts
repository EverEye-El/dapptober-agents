import {card,sellers} from '@dapptober/bourse';import {config} from '@dapptober/config';
export async function GET(){const c=config(),s=sellers(c).find(s=>s.local);return s?Response.json(card(c,s)):Response.json({error:'No local seller configured'},{status:404});}
