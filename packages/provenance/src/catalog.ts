import {keccak256,toHex} from 'viem';
export const templates=[
 {id:0,key:'remix_ai',label:'Human free / AI paid / Remix share',text:'Human free; AI training and inference paid; remixes permitted; 20% parent waterfall'},
 {id:1,key:'inference_only',label:'Inference only / No derivatives',text:'Human free; AI inference paid; no training; no derivatives'},
 {id:2,key:'human_only',label:'Human only / No AI / No derivatives',text:'Human free; no AI training or inference; no derivatives'}
] as const;
export const termsHash=(id:number)=>{const template=templates.find(t=>t.id===id);if(!template)throw new Error('Unapproved template');return keccak256(toHex(template.text));};
export type {PressWork,PressState,PressLicense} from '@dapptober/types';
