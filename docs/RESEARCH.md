# Research record — 2026-10-06

Canonical specifications read completely: `MasterPrompt-DapptoberAgentsBuild.md` and `prompts/dapp-prompts.ts` (actual filename; the request used a dot). All 31 prompts read for future composition; only 01–06 implemented.

Live pages inspected before implementation: https://dapptober.xyz and https://www.dapptober.xyz/dapp/1 through /dapp/6. Direct public HTML reads succeeded; the web reader failed on this host. Browser inspection showed brown-black background, amber monospace type, thin copper borders, ASCII headings, numbered terminal readouts. Individual briefs and features match the supplied file. **Discrepancy:** live pages describe Jev as optional on Days 02–06; canonical prompts include Jev features. We retain all canonical Jev requirements. The supplied file's stack is a suggested stack, not a requirement to use every named vendor.

Official implementation references:
- thirdweb unified v5 permissions: https://portal.thirdweb.com/typescript/v5/account-abstraction/permissions — session keys restrict target, native value, expiry, not daily ERC20 spending. USDC limits therefore need a policy contract.
- x402 v2 seller: https://docs.x402.org/getting-started/quickstart-for-sellers and buyer: https://docs.x402.org/getting-started/quickstart-for-buyers — use official packages, exact EVM, CAIP-2 chain IDs, payment headers, facilitator verification/settlement, retry wrapper. Testnet facilitator is https://x402.org/facilitator.
- Jev: https://docs.typesafe.ai/introduction/quickstart — POST /v1/systemone, state/model/questions; choice confidence and probabilities; score; noul. Fail closed on errors. Deterministic local classifier explicitly simulated.
- ERC-8004: https://eips.ethereum.org/EIPS/eip-8004 — still draft; identity via ERC721 registration URI, reputation via job-linked feedback; avoid claiming complete standard compatibility for custom extension.
- EAS: https://docs.attest.org/docs/developer-tools/eas-sdk — onchain attest tuple with schema, recipient, refUID, encoded data.
- MCP: https://modelcontextprotocol.io/docs/develop/build-server — actual SDK tools and transports, stdout reserved for stdio protocol. Stateless Streamable HTTP plus stdio entrypoint.
- ERC4626: https://docs.openzeppelin.com/contracts/5.x/erc4626 — value shares with convertToAssets, preview deposit/redeem, avoid zero-share deposits, enforce min shares and liquidity.
- CoW: https://docs.cow.fi/cow-protocol/reference/core/intents and https://github.com/cowprotocol/cow-sdk — buy orders with maximum sell and minimum buy, validTo, EIP712 signatures; Base mainnet or Ethereum Sepolia (not Base Sepolia). Official orderbook quote/order API and auction settlement. Local solver competition separately labelled.
- Vercel AI SDK: https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data — typed structured output, schema validation after generation, provider abstraction.

Decisions: six standalone Next.js apps, npm workspaces, shared source packages compiled into each deployment; Base Sepolia default except CoW Sepolia. Operator authentication for server-funded actions, wallet signatures for owner controls. Durable PostgreSQL for real mode, local file store only for one-process demo. No secrets or funded operations needed to develop/test. No live transaction, paid model, or attestation is claimed verified without credentials.

## Day 07 extension

See [Day 7 research](DAY-07-RESEARCH.md), [application and worker deployment](../apps/agents/day-07-glass-box-mind/README.md) and [Day 7 audit](DAY-07-AUDIT.md). Shared `packages/inference` provides signed model/input/output receipts, strict Intel DCAP and workload/model appraisal, opt-in sharing and owner-wallet onchain commitments. The independent verifier page checks ECDSA locally; hardware appraisal requires current Intel collateral and independently approved measurements. Demo keys and historical fixtures never confer hardware trust. Jev receives verification facts and cannot override failed cryptography. No other daily app server is required.

## Day 08 extension

[Research and acceptance](DAY-08-RESEARCH.md), [independent setup/deployment](../apps/agents/day-08-swarm-senate/README.md), and [final audit](DAY-08-AUDIT.md). Shared governance capabilities provide member-signed value mandates, two-round debate, Jev review/model routing, public transcript persistence, provisional delegate votes and onchain human overrides. OpenZeppelin GovernorCountingOverridable with VotesExtended prevents duplicate snapshot weight; a contract-enforced final window blocks agent votes while humans retain authority. Symbolic policy resolutions cannot transfer funds. No Snapshot, ElizaOS or other daily app server is required at runtime.
