import type {Envelope,PublicKey} from './crypto';import type {State} from '@dapptober/types';
export interface Tome {id:string;envelope:Envelope;digest:string;cid?:string;anchored:boolean;archived:boolean;updated:number}
export interface AccessRequest {id:string;agent:string;publicKey:PublicKey;purpose:string;time:number;review?:{allow:boolean;confidence:number;source:string;reason:string}}
export interface Capsule {id:string;agent:string;version:number;expires:number;wrappedKey:string;publicKey:PublicKey;active:boolean}
export interface MemoryState {tomes:Tome[];requests:AccessRequest[];capsules:Capsule[];nonces:string[];modelCalls:{day:string;count:number};pending?:{wallet:string;to:string;data:string;createdBlock:string;expires:number;method:string;id:string;agent?:string};}
export type Store=State&{memory?:MemoryState};export const initial=():MemoryState=>({tomes:[],requests:[],capsules:[],nonces:[],modelCalls:{day:'',count:0}});
