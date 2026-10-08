#!/usr/bin/env node
// Foundry-compatible standard JSON driver using the pinned npm solc compiler.
import solc from 'solc';
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
let input='';
if(process.argv.includes('--version')){process.stdout.write('solc, the solidity compiler commandline interface\nVersion: '+solc.version()+'\n');}
else {for await(const chunk of process.stdin) input+=chunk;process.stdout.write(solc.compile(input,{import:(name)=>{try{const path=resolve(process.cwd(),name);if(!path.startsWith(root+"/"))return {error:"Import outside repository"};return {contents:readFileSync(path,"utf8")};}catch(e){return {error:String(e)};}}}));}
