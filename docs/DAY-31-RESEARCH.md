# Day 31 research — October 29, 2026

Read the master specification and the **complete** supplied Ultimate Agent Architect prompt, plus the live [challenge](https://www.dapptober.xyz/dapp/31). The supplied file remains canonical. Inspected both source graphics `43-day-31-A.png` and `43-day-31-B.png`: copper drafting workshop, robot blueprint, skyline and final assembly. FOUNDRY uses a cropped source workshop, authored graph and native Three.js robot; the original collection is untouched.

Primary implementation references reviewed before the decisions:

- [ERC-8004 draft](https://eips.ethereum.org/EIPS/eip-8004) and [official contracts/deployments](https://github.com/erc-8004/erc-8004-contracts). Use the actual published Base Sepolia/Base IdentityRegistry addresses, not Day 03's custom inspired registry. Owner is the new guarded vault; the human controls that vault. Local registry fixtures are identified explicitly.
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk): actual tool schemas, SDK Client/Server harness and stateless Streamable HTTP. No dependence on an earlier daily server.
- [thirdweb smart wallets](https://portal.thirdweb.com/typescript/v5/smartWallet): existing v5 wallet capability provisions a per-agent counterfactual ERC-4337 executor. Calling connect does not prove deployment or a successful user operation. Actual identity/earnings custody is a separately deployed, owner-controlled vault.
- [x402 introduction](https://docs.x402.org/introduction), [MCP payments](https://docs.x402.org/guides/mcp-server-with-x402), installed official exact EVM client/server/facilitator types and Next middleware: free discovery; price only tools/call, exact selected-chain Circle USDC to vault, no settlement on HTTP tool errors. No manual transfer is labeled x402.
- [LangChain TypeSafe](https://github.com/langchain-ai/langchainjs/tree/main/libs/providers/langchain-typesafe) and installed 0.0.1 declarations/source: `TypeSafeClassifier` actually invokes typed compatibility, gate, model route and preset recommendations. Fail closed for rejection, low confidence, malformed types or missing consent/provider. The human's saved preset remains authoritative.
- [Three.js](https://threejs.org/docs/): use existing workspace 0.186.1, dispose geometry/material/render resources, resize canvas, support reduced motion and a usable non-WebGL blueprint.

Provider privacy is explicit: deployment opt-in approves TypeSafe receiving skill IDs/risk categories/preset/tool/input length; raw text remains outside Jev. Live summarization needs a separate caller acknowledgement before OpenAI receives text. Keys never enter the public graph/card. The factory/vault enforces hard financial authority independent of AI recommendations; public tools expose no financial write.

“Deploy agent” means publishing an actual guarded service and profile inside the independently hosted workshop. It does not claim an unimplemented external cloud deployment. Exported manifest, immutable blueprint hash, factory registration and MCP discovery support future composition with the platform's capabilities.
