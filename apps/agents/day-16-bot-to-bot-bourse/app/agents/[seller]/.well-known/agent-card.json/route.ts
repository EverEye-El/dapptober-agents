import {card,sellers} from '@dapptober/bourse';
import {config} from '@dapptober/config';
export async function GET(_:Request,ctx:{params:Promise<{seller:string}>}){const c=config(),id=(await ctx.params).seller,s=sellers(c).find(s=>s.id===id&&s.local);return s?Response.json(card(c,s)):Response.json({error:'Not found'},{status:404});}
