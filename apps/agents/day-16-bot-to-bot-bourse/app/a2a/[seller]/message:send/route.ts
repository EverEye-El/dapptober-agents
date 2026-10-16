import {sellerRoute} from '@dapptober/bourse';
export const runtime='nodejs';export const maxDuration=60;
export async function POST(r:Request,ctx:{params:Promise<{seller:string}>}){return sellerRoute(r,(await ctx.params).seller);}
