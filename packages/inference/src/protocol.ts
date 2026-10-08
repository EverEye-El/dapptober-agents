import {z} from 'zod';
import {encodeAbiParameters,keccak256,toHex,verifyMessage,type Address,type Hex} from 'viem';
import type {GlassReceipt} from '@dapptober/types';
export const DEMO_KEY=('0x'+'07'.repeat(32)) as Hex; // PUBLIC, ONLY for visibly labelled local simulation.
export const proofSchema=z.object({version:z.literal(1),mode:z.enum(['demo','tdx']),nonce:z.string().regex(/^0x[0-9a-f]{64}$/),model:z.string().min(1).max(100),modelDigest:z.string().regex(/^0x[0-9a-f]{64}$/),input:z.string().min(1).max(12000),output:z.string().min(1).max(24000),issuedAt:z.number().int().positive(),signer:z.string().regex(/^0x[0-9a-fA-F]{40}$/),signature:z.string().regex(/^0x[0-9a-fA-F]{130}$/),quote:z.string().regex(/^0x(?:[0-9a-fA-F]{2})*$/).max(65538)}).strict();
export type UnsignedGlassReceipt=Omit<GlassReceipt,'signature'|'quote'>;
export function payloadHash(p:UnsignedGlassReceipt):Hex {
 return keccak256(encodeAbiParameters([{type:'bytes32'},{type:'uint8'},{type:'bytes32'},{type:'bytes32'},{type:'bytes32'},{type:'bytes32'},{type:'bytes32'},{type:'uint64'},{type:'address'}],[keccak256(toHex('DapptoberGlassBoxReceipt/v1')),p.mode==='tdx'?1:0,p.nonce as Hex,keccak256(toHex(p.model)),p.modelDigest as Hex,keccak256(toHex(p.input)),keccak256(toHex(p.output)),BigInt(p.issuedAt),p.signer as Address]));
}
export function proofId(proof:GlassReceipt){return keccak256(encodeAbiParameters([{type:'bytes32'},{type:'bytes32'},{type:'bytes32'}],[payloadHash(proof),keccak256(proof.signature as Hex),keccak256(proof.quote as Hex)]));}
export async function verifySignature(p:GlassReceipt){return verifyMessage({address:p.signer as Address,message:{raw:payloadHash(p)},signature:p.signature as Hex});}
