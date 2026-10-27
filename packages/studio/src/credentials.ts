import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash,generateKeyPairSync} from 'node:crypto';
import {Builder,Reader,Context,LocalSigner} from '@contentauth/c2pa-node';
export const sha256=(data:Uint8Array|string)=>'0x'+createHash('sha256').update(data).digest('hex');
export interface Credit {creator:string;model:string;operation:string;editor?:string;promptHash:string;parentHash?:string;created:string;mode:'demo'|'real'}
let demo:Promise<{cert:Buffer;key:Buffer}>|undefined;
// Self-signed, ephemeral practice credentials. Never represent this as a public trust-list identity.
export async function practiceCertificate(){
 if(!demo)demo=(async()=>{const dir=await mkdtemp(join(tmpdir(),'studio-c2pa-'));try{
  const keys=generateKeyPairSync('ec',{namedCurve:'prime256v1'}),rootKeys=generateKeyPairSync('ec',{namedCurve:'prime256v1'});
  await writeFile(join(dir,'key.pem'),keys.privateKey.export({type:'pkcs8',format:'pem'}),{mode:0o600});
  await writeFile(join(dir,'root-key.pem'),rootKeys.privateKey.export({type:'pkcs8',format:'pem'}),{mode:0o600});
  await writeFile(join(dir,'root.cnf'),'[req]\ndistinguished_name=dn\nx509_extensions=ext\nprompt=no\n[dn]\nCN=Take One Practice Root\nO=Dapptober Development Only\n[ext]\nbasicConstraints=critical,CA:TRUE\nkeyUsage=critical,keyCertSign,cRLSign\nsubjectKeyIdentifier=hash\n');
  await writeFile(join(dir,'leaf.ext'),'basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature\nextendedKeyUsage=emailProtection\nsubjectKeyIdentifier=hash\nauthorityKeyIdentifier=keyid,issuer\n');
  const run=promisify(execFile);
  await run('openssl',['req','-sha256','-x509','-new','-key',join(dir,'root-key.pem'),'-out',join(dir,'root.pem'),'-days','2','-config',join(dir,'root.cnf')]);
  await run('openssl',['req','-sha256','-new','-key',join(dir,'key.pem'),'-subj','/CN=Take One Local Practice Signer/O=Dapptober Development Only','-out',join(dir,'leaf.csr')]);
  await run('openssl',['x509','-sha256','-req','-in',join(dir,'leaf.csr'),'-CA',join(dir,'root.pem'),'-CAkey',join(dir,'root-key.pem'),'-CAcreateserial','-out',join(dir,'cert.pem'),'-days','2','-extfile',join(dir,'leaf.ext')]);
  return {cert:Buffer.concat([await readFile(join(dir,'cert.pem')),await readFile(join(dir,'root.pem'))]),key:await readFile(join(dir,'key.pem'))};
 }finally{await rm(dir,{recursive:true,force:true});}})();
 return demo;
}
export function verificationContext(){return new Context({verify:{verifyTrust:true,remoteManifestFetch:false,ocspFetch:false},trust:{...(process.env.C2PA_TRUST_ANCHORS_PEM_BASE64?{trustAnchors:Buffer.from(process.env.C2PA_TRUST_ANCHORS_PEM_BASE64,'base64').toString('utf8')}:{})}});}
export async function stamp(bytes:Buffer,credit:Credit,parent?:Buffer){
 const pair=credit.mode==='demo'?await practiceCertificate():{cert:Buffer.from(process.env.C2PA_SIGNING_CERT_PEM_BASE64??'','base64'),key:Buffer.from(process.env.C2PA_SIGNING_KEY_PEM_BASE64??'','base64')};
 if(!pair.cert.length||!pair.key.length)throw new Error('Configure C2PA signing certificate chain and private key');
 const builder=await Builder.withJsonAsync({title:'Take One / '+credit.operation,format:'image/png',claim_generator_info:[{name:'Take One Credentialed Studio',version:'1.0.0'}]},new Context({verify:{verifyAfterSign:true,verifyTrust:false,remoteManifestFetch:false,ocspFetch:false}}));
 if(!parent){const upstream=await Reader.fromAsset({buffer:bytes,mimeType:'image/png'},verificationContext());if(upstream)await builder.addIngredient(JSON.stringify({title:'Original image API output',relationship:'componentOf'}),{buffer:bytes,mimeType:'image/png'});}
 if(parent){await builder.addIngredient(JSON.stringify({title:'Previous signed take',relationship:'parentOf'}),{buffer:parent,mimeType:'image/png'});builder.setIntent('edit');}else builder.setIntent({create:credit.mode==='demo'?'http://cv.iptc.org/newscodes/digitalsourcetype/softwareImage':'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia'});
 builder.addAssertion('org.dapptober.studio',credit);
 builder.addAssertion('c2pa.actions',{actions:[{action:parent?'c2pa.edited':'c2pa.created',digitalSourceType:parent?'http://cv.iptc.org/newscodes/digitalsourcetype/humanEdits':credit.mode==='demo'?'http://cv.iptc.org/newscodes/digitalsourcetype/softwareImage':'http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia',softwareAgent:{name:parent?credit.editor??'Take One / Sharp':credit.model},parameters:{description:credit.operation}}]});
 const output={buffer:null as Buffer|null};builder.sign(LocalSigner.newSigner(pair.cert,pair.key,'es256',credit.mode==='real'?process.env.C2PA_TIMESTAMP_URL:undefined),{buffer:bytes,mimeType:'image/png'},output);
 if(!output.buffer)throw new Error('C2PA output missing');return output.buffer;
}
export async function inspect(bytes:Buffer,mimeType:string){
 const hash=sha256(bytes);
 if(!['image/png','image/jpeg','image/webp','video/mp4'].includes(mimeType))return {hash,present:false,intact:false,trusted:false,status:'Unsupported format',manifests:[]};
 const reader=await Reader.fromAsset({buffer:bytes,mimeType},verificationContext());
 if(!reader)return {hash,present:false,intact:false,trusted:false,status:'No embedded Content Credentials',manifests:[]};
 const store=reader.json(),active=reader.getActive();
 const failures=store.validation_results?.activeManifest?.failure??[];
 const intact=!!active&&['Valid','Trusted'].includes(store.validation_state??'')&&failures.every(f=>f.code==='signingCredential.untrusted');
 const manifests=Object.entries(store.manifests??{}).map(([label,m])=>({label,title:m.title,signature:m.signature_info,assertions:m.assertions,ingredients:m.ingredients}));
 return {hash,present:true,intact,trusted:store.validation_state==='Trusted',status:store.validation_state??'Unknown',active:store.active_manifest,failures,manifests};
}
