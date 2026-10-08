import {createRequire} from 'node:module';
import {expect,it} from 'vitest';

it('keeps legacy wallet query parsing callable after the URI decoder security update',()=>{
  const require=createRequire(import.meta.url);
  const walletRequire=createRequire(require.resolve('thirdweb'));
  const query=walletRequire('query-string');
  expect(query.parse('name=hello%20world&unicode=%E2%82%AC')).toEqual({name:'hello world',unicode:'€'});
  expect(()=>query.parse('bad='+'%FF'.repeat(10000))).not.toThrow();
});
