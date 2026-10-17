import {sellerRoute} from '@dapptober/bourse';
export async function GET(r:Request,ctx:{params:Promise<{seller:string;id:string}>}){const p=await ctx.params;return sellerRoute(r,p.seller,p.id);}
