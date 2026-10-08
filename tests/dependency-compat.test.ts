import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {expect,it} from 'vitest';

it('keeps legacy wallet query parsing callable after the URI decoder security update',()=>{
  const require=createRequire(import.meta.url);
  const walletRequire=createRequire(require.resolve('thirdweb'));
  const query=walletRequire('query-string');
  expect(query.parse('name=hello%20world&unicode=%E2%82%AC')).toEqual({name:'hello world',unicode:'€'});
  expect(()=>query.parse('bad='+'%FF'.repeat(10000))).not.toThrow();
});
it('loads the real x402 Solana client dependency with its required Kit exports',async()=>{
  const client=await import('@x402/svm/exact/client');
  expect(client.ExactSvmScheme).toBeDefined();
  const require=createRequire(import.meta.url);
  const walletRequire=createRequire(require.resolve('thirdweb'));
  const accountRequire=createRequire(walletRequire.resolve('@base-org/account'));
  const cdpRequire=createRequire(accountRequire.resolve('@coinbase/cdp-sdk'));
  const nested=await import(pathToFileURL(cdpRequire.resolve('@x402/svm/exact/client')).href);
  expect(nested.ExactSvmScheme).toBeDefined();
});
