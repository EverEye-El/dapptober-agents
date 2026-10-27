// The upstream installer resolves pkg-dir from cwd; run it from the actual package directory.
import {createRequire} from 'node:module';import {dirname,resolve} from 'node:path';import {realpathSync} from 'node:fs';import {spawnSync} from 'node:child_process';
const require=createRequire(new URL('../packages/studio/package.json',import.meta.url)),root=resolve(dirname(realpathSync(require.resolve('@contentauth/c2pa-node'))),'..'),binary=resolve(root,'dist/index.node');
let loaded=false;try{require(binary);loaded=true;}catch{}
if(!loaded){const out=spawnSync(process.execPath,['scripts/postinstall.cjs'],{cwd:root,stdio:'inherit'});if(out.status!==0)process.exit(out.status??1);require(binary);}
