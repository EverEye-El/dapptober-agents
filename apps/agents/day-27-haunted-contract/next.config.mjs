import path from 'node:path';
export default {output:'standalone',outputFileTracingRoot:path.resolve('../../..'),transpilePackages:['@dapptober/haunted','@dapptober/agent-core','@dapptober/config','@dapptober/receipts','@dapptober/types'],experimental:{cpus:2}};
