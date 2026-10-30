# NERVEFORGE / Day 31 — The Ultimate Agent Architect

A copper blueprint workshop with a draggable saved MCP graph, native Three.js sentinel twin, guarded identity vaults, discoverable agent profiles and metered MCP services. Each app is independently deployable; it imports shared capabilities without calling other daily servers.

## Run the editable demo

Use Node 22 and pnpm 10.2.0. At the repository root:

```sh
pnpm install --frozen-lockfile
cp apps/agents/day-31-ultimate-agent-architect/.env.example apps/agents/day-31-ultimate-agent-architect/.env.local
pnpm dev 31
```

Open http://localhost:3031. Generate separate stable random values for `OPERATOR_TOKEN` and `EXPERIENCE_SESSION_SECRET` (32+ characters). Local development works without paid keys. Select skills, arrange modules, name the agent, choose a wallet preset and price; **save** before assessment/testing. Assess → provision practice wallet → register practice identity → publish. The public profile and MCP endpoint actually work in demo mode. Real digest/arithmetic/receipt verification are executed; Jev/model output, identity/wallet provisioning and money are explicitly simulated. A demo registration never invents an ERC-8004 token ID or onchain receipt.

Visitor drafts are cookie-isolated and saved. Operator login selects a shared workspace. Published records are public in this app's directory; raw prompts and keys are not published. The profile refreshes saved usage every ten seconds. Fork a registered blueprint to change immutable skill/preset/price/recipient configuration. Pause service immediately blocks new MCP calls; pausing an actual wallet requires its own owner transaction.

## Actual tools and public API

`hash.digest`, `math.calculate`, `text.brief`, `wallet.balance`, `identity.card`, `receipt.verify`. Every `tools/call` passes catalog checks, hard input rejection and the TypeSafe policy/router. The workbench test connects an actual MCP SDK Client and Server through their in-memory transport. Public HTTP uses the SDK stateless Streamable HTTP transport, not REST aliases.

- `GET /api/agents`: discover published registration cards.
- `GET /api/agents/:id`: ERC-8004-compatible card, policy and recorded usage.
- `GET /agents/:id`: callable public profile.
- `POST /api/agents/:id/mcp`: JSON-RPC initialize/tools/list/tools/call. Send `Accept: application/json, text/event-stream` and `MCP-Protocol-Version: 2025-03-26`.
- Demo calls require explicit `X-Dapptober-Practice: true`; otherwise tools/call returns 402 explaining the practice fee. This is a simulation acknowledgement, **not x402 payment evidence**. Discovery is free.
- Real calls use official x402 exact EVM USDC authentication, verification and settlement to the registered vault. Tool errors use HTTP 422 and do not settle. On successful facilitator settlement, the saved revenue counter records the actual amount and transaction, deduplicated. A signed payment authorization can outlive a browser request: reconcile facilitator/chain results after network failure before retrying. Response buffering/settlement does not make provider execution and database writes a distributed atomic transaction.

No anonymous MCP tool transfers funds, runs arbitrary code, fetches arbitrary URLs or accepts secrets as configuration. Calculator numbers are bounded; text input is limited to 4,000 characters. Public agents permit at most 20 calls/minute and 100 provider decisions/day; host-wide ingress and cost limits are still required.

## Live configuration, in order

1. Select **Base Sepolia 84532** for testing. Production is **Base 8453**, using a separate database/namespace, owner and secrets. Supply a real Supabase **Session pooler PostgreSQL URI** in `SUPABASE_DATABASE_URL`, select `EXPERIENCE_STORAGE=supabase`, and verify RLS/save/read/restart/backup. Local mode requires a single process and persistent mounted `.data`; serverless disk is not persistent.
2. Enable billed TypeSafe Jev, OpenAI models and thirdweb smart accounts/gas sponsorship. Set their detailed private keys from `.env.example`. Approve `ARCHITECT_PROVIDER_CONSENT=true` deliberately: TypeSafe receives skill/policy/tool metadata and input byte count, never raw tool text. `text.brief` sends supplied text to OpenAI **only with caller `allowExternalProcessing=true`**. Thirdweb receives derived executor account data. Demo sends none of these provider requests.
3. Back up a fresh private `ARCHITECT_WALLET_SEED` (32-byte `0x` hex). It derives a distinct executor signer for each workspace/agent using HMAC. It is not the owner's wallet key. The thirdweb ERC-4337 executor is counterfactual until its first user operation; no deployment is claimed merely by calculating its address. Current tools need no autonomous fund transfer or scheduled worker.
4. Build/review contracts with `pnpm test:contracts`. `pnpm deploy:architect` prints **unsigned** creation data for `AgentFoundry(CircleUSDC, officialIdentityRegistry)`; it does not broadcast. Deploy from the human wallet after review. Configure actual `ARCHITECT_FACTORY` / `_CODE_HASH` and registry runtime hash. Inspect registry proxy implementation/upgrades too; a proxy runtime pin does not pin its implementation.
5. Official identity registry: Base Sepolia `0x8004A818BFB912233c491871b3d84c89A494BD9e`; Base `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`. Code selects these addresses; local fixtures alone use `ARCHITECT_REGISTRY`. Factory token/registry, vault owner/executor/identity/config hash and preset caps are verified before live publication/calls. ERC-8004 remains a draft standard.
6. Save → assess → provision → register. The human signs one exact factory call creating a vault and registering its identity. Reconcile its exact sender/destination/calldata/zero native value/success and two additional blocks. The vault owns the identity; the human controls the vault. USDC earnings go to the vault. Review separate exact fund/withdraw/pause transactions; the app never reads the human private key. Default recipient allowlist is empty. Observe permits no executor spending; Research caps at $1/payment and $5/day; Operator at $5/payment and $25/day. Requests cannot replay. Only the human may pause/change approved recipients/withdraw. No arbitrary call/delegate authority exists.
7. Verify an HTTPS facilitator supports `exact` on the selected network; configure private Authorization headers if required. The default public facilitator is not a promise of mainnet service. Profile payment checks exact network/Circle asset/vault/amount/time bound before wallet signing. Run `pnpm readiness 31 --online`, actual paid-provider/Base Sepolia integration, wrong-payment/policy/outage/restart acceptance, and independent security/dependency review before live hosting.
8. Deploy this app's Vercel directory (its included `vercel.json`) or root Dockerfile with `APP=day-31-ultimate-agent-architect`. Set final exact HTTPS `PUBLIC_ORIGIN`, stable private secrets, Supabase, host request time/size/rate limits and monitoring. Publishing then deploys a new agent **inside this running app**, with a public endpoint/profile. Export is a portable manifest; it does not provision a separate Vercel/cloud project. Rehearse hosted persistence and live acceptance before release. Keep browser wallet approvals supervised.

## Verification

```sh
pnpm exec vitest run tests/day-31.test.ts
pnpm test:contracts
pnpm test:architect-chain
pnpm build 31
pnpm run test:production
```

Local chain acceptance deploys the real custom factory/vault, uses an explicitly labeled local ERC-8004 registry double and test USDC, registers/funds/pays/pauses/withdraws, and verifies exact owner receipts. A second acceptance test uses the **official x402 client/facilitator SDK** to sign/verify/settle an actual EIP-3009 test-token authorization on Anvil and reject replay. This is not genuine Circle, thirdweb bundler, paid Jev/OpenAI, public registry or public-chain acceptance. See [audit](../../../docs/DAY-31-AUDIT.md) and [completion tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md).
