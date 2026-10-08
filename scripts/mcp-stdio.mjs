import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {z} from 'zod';
const origin=process.env.PUBLIC_ORIGIN ?? 'http://localhost:3004';
const server=new McpServer({name:'dapptober-guild-proxy',version:'1.0.0'});
async function call(action,input={}) {
 const response=await fetch(new URL('/api/agent',origin),{method:'POST',headers:{'content-type':'application/json',...(process.env.OPERATOR_TOKEN?{authorization:`Bearer ${process.env.OPERATOR_TOKEN}`}:{})},body:JSON.stringify({action,input}),signal:AbortSignal.timeout(120000)});
 const value=await response.json();
 return {content:[{type:'text',text:JSON.stringify(value.result ?? value.error)}],isError:!response.ok};
}
server.registerTool('bounty.discover',{inputSchema:{}},()=>call('bounty.discover'));
server.registerTool('bounty.claim',{inputSchema:{id:z.string()}},({id})=>call('bounty.claim',{id}));
server.registerTool('bounty.submit',{inputSchema:{id:z.string(),result:z.string().min(10).max(24000)}},input=>call('bounty.submit',input));
await server.connect(new StdioServerTransport());
