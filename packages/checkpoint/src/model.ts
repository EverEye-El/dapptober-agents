import type {Receipt,Decision,Transaction} from '@dapptober/types';
export type Lane='guest'|'human'|'agent';
export type Person={id:string;wallet:string;verifiedAt:number;credentialExpires:number;passkeys:{id:string;publicKey:string;counter:number}[];claimed:boolean};
export type Challenge={kind:'world'|'agent'|'register'|'authenticate';nonce:string;expires:number;wallet?:string;agentId?:string;signal?:string};
export type Client={expires:number;lane:Lane;person?:string;agentId?:string;wallet?:string;challenge?:Challenge;rate:{start:number;count:number};receipts:Receipt[]};
export type CheckpointDB={version:1;paused:boolean;clients:Record<string,Client>;people:Record<string,Person>;messages:{id:string;author:string;badge:'human';text:string;time:string}[]};
export type CheckpointView={day:10;mode:'demo'|'real';chainId:number;lane:Lane;badge:string;person?:{id:string;wallet:string;passkeys:number;claimed:boolean};agentId?:string;paused:boolean;messages:CheckpointDB['messages'];counts:{humans:number;messages:number};receipts:Receipt[];config:{appId?:string;rpId?:string;action:string;registry?:string;rewards?:string};};
export type CheckpointResult={transaction?:Transaction;typedData?:Record<string,unknown>;decision?:Decision;[key:string]:unknown};
export const emptyDB=():CheckpointDB=>({version:1,paused:false,clients:{},people:{},messages:[]});
export function canonicalNullifier(value:string){if(!/^0x[0-9a-fA-F]{1,64}$/.test(value))throw new Error('Invalid personhood nullifier');const n=BigInt(value);if(n===0n)throw new Error('Zero nullifier rejected');return n.toString(10);}
