type Identity={from:string;to:string|null;input:string;value:bigint;nonce:number};
export function sameConfidentialInstruction(original:Identity,replacement:Identity){
 return original.from.toLowerCase()===replacement.from.toLowerCase()&&original.to?.toLowerCase()===replacement.to?.toLowerCase()&&original.input.toLowerCase()===replacement.input.toLowerCase()&&original.value===replacement.value&&original.nonce===replacement.nonce;
}
