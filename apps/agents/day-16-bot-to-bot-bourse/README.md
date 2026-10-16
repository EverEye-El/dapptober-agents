# Day 16 — Brass / The Bot-to-Bot Bourse

A robot exchange floor for **service orders**, with agent discovery, bounded negotiations, live decision transcripts and USDC escrow. Copper/brass order tape and the supplied Day 16 trading-floor graphic give this room its own identity. This is not a securities exchange.

## Canonical prompt and acceptance

`prompts/dapp-prompts.ts`, complete Day 16: buyer discovers published agent cards; buyer/seller negotiate price and deadline using A2A; payment locks in Solidity escrow; delivery confirmation settles; humans inspect live transcripts; Jev chooses accept/counter/reject with calibrated probabilities. Live site matches the core brief but describes Jev as optional; this build preserves the canonical Jev requirement.

## Run and test

From repository root:

```sh
pnpm install --frozen-lockfile
cp apps/agents/day-16-bot-to-bot-bourse/.env.example apps/agents/day-16-bot-to-bot-bourse/.env.local
pnpm run dev 16
pnpm --filter @dapptober/day-16 test
pnpm run test:contracts
pnpm run test:bourse-chain
pnpm run build 16
pnpm readiness 16
```

Open localhost:3016 in Codex. The ignored `.env.local` is already initialized in this checkout. Demo needs no credentials. It starts with 100 illustrative USDC and three simulated desks: Babel translation, Lens research, Abacus data. A 6-USDC mandate starts at 1.5, Babel counters at 4, buyer accepts, human confirms funding, requests delivery, reviews the simulated artifact and confirms release. No transaction hashes or live model calls are fabricated. Advance simulation enables refund/review/dispute timeout tests.

## Architecture / tools

- Independent Next.js app; no Day 01–15 runtime required.
- Shared `@dapptober/bourse`: catalog/discovery, strict terms, current A2A 1.0 HTTP+JSON messages and Task artifacts, Jev negotiation, local/remote seller transport, wallet instructions, exact receipts, chain reconciliation.
- Shared state/config/chain/receipts/AI infrastructure. Supabase locks buyer and seller namespaces independently in real mode; local per-browser files in demo.
- `bourse.discover`, `bourse.start`, `bourse.step`, `bourse.deliver`, `bourse.prepare`, `bourse.preflight`, `bourse.submitted`, `bourse.receipt`, `bourse.refresh`; `bourse.advance` is demo-only.
- A2A operations and exact wire schema: [Bourse extension](../../../../docs/BOURSE-A2A.md). Published cards at `/.well-known/agent-card.json` (first local seller) and `/agents/{id}/.well-known/agent-card.json`; private `POST /a2a/{id}/message:send`, `GET /a2a/{id}/tasks/{taskId}`. Streaming/push are false. Seller token-scoped private tasks; not open public multi-tenancy.
- Buyer has deterministic budget/deadline guards. Seller Jev evaluates three outcomes and returns its raw probabilities/confidence. Missing real providers fail closed. Confidence <0.85 adds explicit human review, never bypasses amount/deadline limits. Confidence is not an empirically measured correctness guarantee; calibrate with representative tasks before deployment.
- Text fulfillment uses existing AI SDK reasoner and configured OpenAI-compatible model after a safety gate. No tools, arbitrary browsing, code execution or external datasets are granted. Research/data jobs analyze **supplied content** and state unavailable information.

## Real environment — exact providers

All variables are annotated in `.env.example`; root env stays a pointer. Testing is **Base Sepolia 84532**; production is **Base 8453** with separate state/config.

1. Supabase **Session pooler PostgreSQL URI** → `SUPABASE_DATABASE_URL`. Not a Supabase anon/service_role API key. Existing shared project is supported through distinct day/operator namespaces; testing and production should use separate projects. Back up before rotating the operator token because it identifies the durable workspace.
2. Browser wallet public address → `OWNER_ADDRESS`. Its actual ERC-8004 `agentWallet` registration ID → `BOURSE_BUYER_ID`. No buyer private key, thirdweb or Tenderly credentials required.
3. Verified official ERC-8004 Identity Registry → `BOURSE_REGISTRY`. Do not use the older custom Day 03 AgentPassport ABI as a replacement; this adapter calls `getAgentWallet(uint256)` and verifies both buyer/seller. Register/link wallets through the official registry's supported EIP-712/ERC-1271 flow. No production registry address is guessed.
4. Deploy `contracts/src/BotBourse.sol` with Circle USDC, registry, immutable arbiter and immutable maximum per order (25 USDC = 25000000 atomic units). Configure `BOURSE_ESCROW`, dedicated `RPC_URL`, matching Circle `USDC_ADDRESS`, intentional `BOURSE_MAX_USDC`.
5. Private operator access token, at least 32 random characters → `OPERATOR_TOKEN`. Enter it in the private floor screen; it stays in memory. Exact `PUBLIC_ORIGIN` must match browser origin.
6. **TypeSafe Jev** dashboard API key → `JEV_API_KEY`; actual typed endpoint `https://api.typesafe.ai/v1/systemone`, model `jev-latest`. Genuine hosted response acceptance still needs a key/live run.
7. **OpenAI project API key** with billing/model access → `OPENAI_API_KEY`, plus `OPENAI_BASE_URL` and model IDs. Only local real sellers need this deployment's model key. External services manage their own provider/model setup.
8. Reviewed seller JSON → `BOURSE_SELLERS_JSON`; keys for **local** real seller wallets → `BOURSE_SELLER_KEYS_JSON`. These are gasless EIP-712 signing keys, separate from buyer custody. Protect them: a stolen seller key can sign fraudulent delivery hashes. Every real seller must have an actual ERC-8004 wallet registration.

Catalog shape (placeholder values below are descriptive, not valid credentials):

```text
[{ id, name, skill: translation|research|data, description,
   wallet: public EVM address, agentId: decimal identity token ID,
   floor: positive USDC string, ask: positive USDC string,
   minutes: minimum delivery minutes,
   local: true, token: private random seller bearer token }]
BOURSE_SELLER_KEYS_JSON={sellerId: matching private signing key}
```

For an external seller use `local:false`, exact reviewed HTTPS `cardUrl`, A2A interface `endpoint` (without `/message:send`) and private bearer token if required. External cards must publish the Bourse extension/skill/identity and support its signed terms/delivery format. The adapter rejects redirects, unknown configured endpoints and oversized responses. This is administrator-controlled configuration; review host ownership/DNS and enforce outbound network rules at hosting.

Real mode catalog starts **empty**, never auto-enrolls simulated desks. A single deployment can host several local seller actors while still working as an independent app; external seller processes are supported. Separate tokens/signing keys define each actor. No assertion that independently owned counterparties were verified from local doubles.

## Deploy contracts and app

Complete the ordered tracker first. Use a Foundry encrypted keystore for deployment; no private key literals in commands/history. With `RPC_URL`, `USDC_ADDRESS`, `BOURSE_REGISTRY`, and your selected arbiter address set privately:

```sh
node scripts/contracts.mjs create src/BotBourse.sol:BotBourse --rpc-url "$RPC_URL" --account bourse-deployer --constructor-args "$USDC_ADDRESS" "$BOURSE_REGISTRY" "$BOURSE_ARBITER" 25000000 --broadcast
```

`BOURSE_ARBITER` is a deployment-shell variable, not an app credential. Use a separately controlled resolver wallet with a documented dispute process, not the seller key. Verify source/bytecode/constructor and `usdc`, `registry`, `arbiter`, `maxDeal` onchain. This non-upgradeable contract has no admin withdrawal. Arbiter may pause **new** funding without trapping existing deals. Contract fixture registry is test-only and must never be deployed as production identity infrastructure.

Vercel root: this app folder; its `vercel.json` installs from workspace root and builds **16**. Private deployment env, 60-second handlers, final HTTPS origin. Alternatively root Dockerfile `APP=day-16-bot-to-bot-bourse` builds standalone. Do not change earlier day build targets. Required outbound access: Supabase, own/approved A2A sellers, configured RPC, TypeSafe, OpenAI-compatible provider. Local HTTP is supported only for development; release over HTTPS.

## Settlement / controls / recovery

- Human reviews and explicitly confirms **each** financial instruction in the browser. Wallet sends exact USDC approvals and EIP-712 seller-signed escrow `open`. No server buyer signer or open-ended autonomous spending authority.
- Contract binds order/brief hash, amount, original parties, ERC-8004 IDs, domain/chain and expiry. One order cannot be funded twice. Fixed-token immutable order cap, deadlines and signature validation remain effective even when bypassing the app.
- Delivery is seller-signed and hash-verified, anchored via owner wallet `deliver`. Hash proves integrity/authorization, not quality or truth. Buyer reviews full artifact before `confirm` releases payment.
- Missing delivery after deadline → full refund to buyer. Delivered → 24h buyer dispute window; after it, anyone can release to original seller. Dispute → immutable arbiter chooses seller basis points; after 7 days unresolved, anyone can trigger **50/50** split. Both counterparties must accept this dispute model before funding. Review deadline is a real financial obligation: monitor it.
- Direct `confirm`, `dispute`, `refund`, `release`, `resolve(id,sellerBps)`, `timeout` remain available through contract tooling even if hosting/database is unavailable. Arbiter resolution is an external resolver-wallet contract action, not model authority.
- RPC preflight of exact next transaction; exact mined sender/to/calldata/value/status/time matching; transaction replay rejection. Pending hashes persist server-side and as public hashes in browser storage. Resume before resending. If a failed/replaced transaction cannot be recovered automatically, inspect the chain/allowance directly and reconcile; do not blindly start another funding action.
- Offer expiry can leave a previous exact approval unused. Revoke it in the wallet if abandoning the order. Use a fresh order after expiry; no app mutation can cancel a transaction already broadcast. Stored instructions/receipts remain as evidence.
- Finite archives: 128 buyer orders, 512 wallet instructions, 256 seller message records per namespace. Export/rotate and retain evidence before capacity. Operator-token rotation creates a new namespace; archive recovery needed. This build does not implement a background keeper/indexer or public seller marketplace.

## Tests / limitations

Day 16 unit tests cover full simulation, hard budget/deadline, uncertainty, unsafe requests, missed deadlines, disputes, catalog/key redaction and actual Jev request shape. Eleven Foundry tests include 256-run conservation fuzzing, invalid/altered/replayed signatures, registry changes, expiry, cap, refund, pause, release, arbitration and timeout. The funded Anvil test exchanges genuine HTTP A2A messages, verifies real EIP-712 signatures and exact wallet receipts and transfers minted test USDC to a separate seller. Registry, Jev and OpenAI in that test are explicitly **doubles**, not live protocol/provider certification.

No Base Sepolia/Mainnet deployment, real Supabase durability, independent seller interoperability, genuine Jev/model run, public-chain funds or hosted production acceptance is claimed without configuration and funded verification. See the completion tracker and daily audit for current evidence and remaining steps.
