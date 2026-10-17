import type {Decision,Transaction} from '@dapptober/types';
export interface Seller {id:string;name:string;skill:'translation'|'research'|'data';description:string;wallet:string;agentId:string;floor:string;ask:string;minutes:number;cardUrl?:string;endpoint?:string;token?:string;local?:boolean}
export interface Terms {id:`0x${string}`;buyer:`0x${string}`;seller:`0x${string}`;buyerId:string;sellerId:string;taskHash:`0x${string}`;amount:string;deliverBy:number;expires:number}
export interface Verdict {choice:'accept'|'counter'|'reject';confidence:number;probabilities?:{accept:number;counter:number;reject:number};source:string}
export interface Line {id:string;at:number;actor:string;kind:string;text:string;price?:string;minutes?:number;verdict?:Verdict}
export interface Negotiation {id:string;sellerId:string;brief:string;taskHash:`0x${string}`;budget:string;minutes:number;price:string;round:number;status:'negotiating'|'agreed'|'rejected'|'funded'|'delivered'|'disputed'|'settled';lines:Line[];needsReview:boolean;terms?:Terms;signature?:`0x${string}`;output?:string;outputHash?:`0x${string}`;deliverySignature?:`0x${string}`;chainStatus?:number;deliverBy?:number;deliveredAt?:number;disputedAt?:number}
export interface Instruction {id:string;dealId:string;kind:string;created:number;transactions:Transaction[];hashes:string[];submittedHash?:string;status:'ready'|'complete'}
export interface BourseState {deals:Negotiation[];instructions:Instruction[];cash:string;earned:string;clock:number}
export interface SellerTask {id:string;contextId:string;status:{state:string};history:unknown[];artifacts?:unknown[];metadata:Record<string,unknown>}
export interface BourseResponse {state:import('@dapptober/types').State;sellers:Seller[];receiptsValid?:boolean;result?:Record<string,unknown>;error?:string}
export type Gate=Decision;
