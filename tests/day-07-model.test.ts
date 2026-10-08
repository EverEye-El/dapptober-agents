import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {it,expect} from 'vitest';
import {verifyModelFiles} from '@dapptober/inference/src/model';
it('hashes the actual pinned manifest and every model blob, rejecting substituted weights and path traversal',async()=>{
 const root=await mkdtemp(join(tmpdir(),'glass-model-'));try{
 const manifestDir=join(root,'models/manifests/registry.ollama.ai/library/test'),blobDir=join(root,'models/blobs');await mkdir(manifestDir,{recursive:true});await mkdir(blobDir,{recursive:true});
 const weights=Buffer.from('reviewed-model-weights'),hash=createHash('sha256').update(weights).digest('hex'),file=join(blobDir,'sha256-'+hash);await writeFile(file,weights);
 const raw=JSON.stringify({config:{digest:'sha256:'+hash,size:weights.length},layers:[{digest:'sha256:'+hash,size:weights.length}]}),digest='0x'+createHash('sha256').update(raw).digest('hex');await writeFile(join(manifestDir,'v1'),raw);
 expect(await verifyModelFiles(root,'test:v1',digest)).toBe(2);await expect(verifyModelFiles(root,'../test:v1',digest)).rejects.toThrow('explicit');await expect(verifyModelFiles(root,'test:v1','0x'+'0'.repeat(64))).rejects.toThrow('manifest');const altered=Buffer.from(weights);altered[0]^=1;await writeFile(file,altered);await expect(verifyModelFiles(root,'test:v1',digest)).rejects.toThrow('blob');
 }finally{await rm(root,{recursive:true,force:true});}
});
