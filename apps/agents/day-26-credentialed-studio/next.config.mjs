import path from 'node:path';
export default {output:'standalone',outputFileTracingRoot:path.resolve('../../..'),serverExternalPackages:['@contentauth/c2pa-node','sharp'],transpilePackages:['@dapptober/studio','@dapptober/agent-core','@dapptober/config','@dapptober/chain','@dapptober/receipts','@dapptober/types','@dapptober/ui'],experimental:{cpus:2}};
