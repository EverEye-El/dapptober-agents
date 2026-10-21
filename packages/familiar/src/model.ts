import type {Transaction} from '@dapptober/types';
export type Kind='tip'|'split'|'mint'|'poll'|'chat';
export type Proposal={id:string;kind:Kind;creator:string;created:number;status:'draft'|'live'|'done';title:string;recipient?:string;amount?:string;people?:number;question?:string;choices?:string[];votes?:number[];paid?:number;payers?:string[];ends?:number;caption?:string;image?:string;uri?:string;route:{intent:Kind;model:'small'|'large';confidence:number;source:string};pending?:{wallet:string;tx:Transaction;method:string;amount?:string;choice?:number;time:number}[];hashes:string[];simulated:boolean};
export type ChatMessage={id:string;actor:string;name:string;text:string;time:string;bot:boolean;proposal?:string;reactions:Record<string,string[]>;fixture?:boolean};
export type Room={id:string;messages:ChatMessage[];proposals:Proposal[];xp:number;lastSync?:number;syncError?:string;rates:Record<string,{start:number;count:number}>};
export type NativeJob={id:string;platform:'telegram'|'discord'|'slack';room:string;channel:string;actor:string;text:string;application?:string;interaction?:string;status:'queued'|'processing'|'sent'|'review';reply?:string;error?:string};
export type FamiliarState={rooms:Room[];nonces:{id:string;expires:number}[];jobs:NativeJob[]};
