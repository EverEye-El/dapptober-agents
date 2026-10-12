# Day 12 — The Provenance Press

Canonical prompt: [complete Day 12](../../../prompts/dapp-prompts.ts). Architecture and audit: [master specification](../../../MasterPrompt-DapptoberAgentsBuild.md). Copper letterpress registration, approved usage templates, paid AI training/inference licenses, remix royalties, public certificates and Jev template selection.

## Important protocol boundary

The owner’s fixed networks are Base Sepolia (84532) for testing and Base (8453) for production. The official Story SDK 1.4.4 supports Story Aeneid (1315) and Story mainnet (1514), not Base. This app therefore uses the custom **ProvenancePress Base registry**, not Story Protocol/PIL. Native Story integration is an outstanding implementation/network compatibility requirement; it cannot be solved by adding a key. No hidden network fallback, Story IP ID, Story license or bridge is invented. [Research and compatibility evidence](../../../docs/DAY-12-RESEARCH.md).

## Run independently

```sh
pnpm install --frozen-lockfile
cp apps/agents/day-12-provenance-press/.env.example apps/agents/day-12-provenance-press/.env.local
pnpm run dev 12
pnpm --filter @dapptober/day-12 test
pnpm run build 12
pnpm --filter @dapptober/day-12 start
```

Open http://localhost:3012. In demo mode, choose/review a template, approve simulated publication, register, buy licenses, register a licensed remix and claim royalties. Demo writes labelled local records, makes no IPFS/provider/payment calls and produces no real transaction hashes.

## Architecture and tools

Independent Next.js app on 3012, own environment and Supabase namespace. Shared `@dapptober/provenance` compiles into its app with config, chain, auth, receipts and Jev; it never calls another daily server. Current unified thirdweb v5 verifies certificate NFT ownership on the configured RPC. Pinata v3 multipart public uploads provide real IPFS metadata storage when configured.

Tools: `press.choose`, `press.register`, `press.buy`, `press.agentBuy`, `press.claim`, `press.refresh`, `press.allow`, `press.authorize`, `press.pause`, `press.verifyNFT`, `receipt.verify`, `chain.receipt`. `POST /api/agent` accepts `{action,input}` with operator bearer authorization in real mode. `GET /api/certificate?id=...` and `/certificate?id=...` are public for registered records; they omit draft content and private configuration. The public page is printable and exposes immutable terms, author, hash, metadata URI, ancestry, accrued royalties and paginated credit history.

## Base contract and rights model

`ProvenancePress(owner,USDC)` mints immutable ERC721 registration certificates. Certificate ownership and royalty recipients cannot be transferred by NFT trading. Registered content is an author's assertion, not proof of copyright ownership. Three immutable approved templates:

1. Human free; AI training/inference paid; derivatives allowed with 20% parent waterfall.
2. Human free; paid inference only; no training or derivatives.
3. Human free; no AI or derivatives.

These are technical usage permissions, **not Story PIL or a substitute for a reviewed legal license**. Public IPFS is not a content paywall. Offchain use/purpose must be declared and governed by an appropriate legal/compliance policy; the system does not detect unregistered AI wallets. Registered dedicated agent accounts cannot acquire human-use licenses.

Each paid license uses the work's immutable fee. Originals receive 100%; derivatives credit 80% locally and route 20% upstream, recursively. Parent royalty calculation uses integer USDC units; remainder stays with the current creator, preserving every unit. Remix registration requires a purchased remix permission, inherited terms and a fee no lower than the parent; depth is bounded at eight. Royalties accrue as creator credits and are explicitly claimed to avoid blocked-recipient failures. Pausing blocks registration/purchase, but not claims.

## Annotated real environment and launch sequence

Every key is explained in `.env.example` and the private `.env.local`:

- `SUPABASE_DATABASE_URL`: private Supabase database URI; separate testing/production projects.
- `OPERATOR_TOKEN`: unique random 32+ character control-room secret.
- `OWNER_ADDRESS`: public owner wallet; `AGENT_PRIVATE_KEY`: separate narrowly funded license buyer.
- `JEV_API_KEY`: TypeSafe/Jev approved-template choice and purchase admission. No OpenAI key used.
- `PINATA_JWT`: public-file upload credential; publication requires explicit consent. An upload is already public even if subsequent wallet registration is cancelled; establish pinning/retention policy.
- `THIRDWEB_SECRET_KEY`: server project secret for NFT-owner verification.
- `PROVENANCE_PRESS`: actual deployed registry; `PRESS_START_BLOCK`: its deployment receipt block, for history bounds.
- `USDC_ADDRESS`: Circle token on the selected network; `PRESS_AGENT_LICENSE_CAP` and `PRESS_AGENT_DAILY_CAP`: per-license/gross daily USDC caps.

Deploy through the network-checked wrapper:

```sh
node scripts/contracts.mjs create src/ProvenancePress.sol:ProvenancePress --rpc-url "$RPC_URL" --account dapptober-deployer --broadcast --constructor-args "$OWNER_ADDRESS" "$USDC_ADDRESS"
```

Configure keys/addresses, fund owner/buyer with testing gas and buyer USDC, and set real mode. Owners register through inspected browser transactions; no creator wallet key is sent to the server. Owner separately authorizes the dedicated agent for 24 hours with the configured caps and approves individual works before agent purchases. Renewal never resets gross daily spend. Transfers and claims require their own wallet signatures. Pinata and Jev failures block the workflow explicitly.

## Tests, deployment and limits

`pnpm run test:contracts` compiles Solidity fixtures; `pnpm run test:press-chain` runs the actual local-chain original/remix/licensing/split/claim/thirdweb/history flow. Jev and Pinata are explicit provider doubles in that integration. App tests cover consent, template choice, rights restrictions, duplicates, inherited terms, pause, budgets and multipart upload shape.

Build the root Dockerfile with `--build-arg APP=day-12-provenance-press`, or use this app's Vercel project root with workspace file access. Set final HTTPS origin, private service credentials and durable Supabase. No other daily app is required.

Limits: 500 registered works, 2,000 lifetime licenses, eight parent levels, 24,000 text characters, 30 actions/minute/operator, ≤5,000 blocks per public credit-history window and 200 events/window (truncation is explicit). Add indexing/scalability before those bounds. This is a single-operator control room with permissionless underlying contract; public multi-tenant authorization and larger file/media ingestion need separately specified work.

Live Pinata persistence/retrieval, paid Jev, actual Supabase, Base deployments/funding, reviewed legal licensing/ownership processes, native Story compatibility, independent contract review, monitoring/backup/retention and hosted acceptance remain in the [ordered completion tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md). [Final audit](../../../docs/DAY-12-AUDIT.md) separates local evidence from live protocols.
