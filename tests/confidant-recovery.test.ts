import {expect,it} from 'vitest';
import {sameConfidentialInstruction} from '@dapptober/confidant/src/recovery';
it('accepts an exact replacement instruction and rejects cancellation or changed ciphertext/nonce/recipient/value',()=>{const tx={from:'0xAb',to:'0xCd',input:'0xAbCd',value:0n,nonce:7};expect(sameConfidentialInstruction(tx,{...tx,from:'0xab',to:'0xcd',input:'0xabcd'})).toBe(true);for(const change of [{to:tx.from},{input:'0x'},{nonce:8},{value:1n},{from:'0xef'}])expect(sameConfidentialInstruction(tx,{...tx,...change})).toBe(false);});
