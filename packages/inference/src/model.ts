import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {readFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
/** Independently check the manifest and actual model bytes, not only Ollama's metadata. */
export async function verifyModelFiles(root:string,model:string,expected:string){
 if(!/^[a-z0-9][a-z0-9._-]*:[a-z0-9][a-z0-9._-]*$/.test(model))throw new Error('Use an explicit registry.ollama.ai/library model:tag');
 if(!/^0x[0-9a-f]{64}$/.test(expected))throw new Error('Invalid model artifact digest');
 const [name,tag]=model.split(':');const path=join(root,'models/manifests/registry.ollama.ai/library',name,tag);
 if((await stat(path)).size>1000000)throw new Error('Model manifest too large');const raw=await readFile(path);
 if('0x'+createHash('sha256').update(raw).digest('hex')!==expected)throw new Error('Model manifest digest mismatch');
 const manifest=JSON.parse(raw.toString('utf8'));const descriptors=[manifest.config,...manifest.layers];if(descriptors.length>128)throw new Error('Too many model layers');
 for(const descriptor of descriptors){
  if(!/^sha256:[0-9a-f]{64}$/.test(descriptor?.digest))throw new Error('Invalid model blob descriptor');
  const file=join(root,'models/blobs',descriptor.digest.replace(':','-'));const info=await stat(file);
  if(!info.isFile()||info.size!==descriptor.size)throw new Error('Model blob size mismatch');
  const hash=createHash('sha256');for await(const chunk of createReadStream(file))hash.update(chunk);
  if('sha256:'+hash.digest('hex')!==descriptor.digest)throw new Error('Model blob digest mismatch');
 }
 return descriptors.length;
}
