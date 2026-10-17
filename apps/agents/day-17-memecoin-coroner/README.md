# Day 17 — Toe Tag / The Memecoin Coroner

A copper-lit forensic bureau: put a token contract on the slab, inspect the evidence, request a typed risk verdict, then explicitly publish a hash-bound report through EAS. The report is a **bounded snapshot**, never a safety certificate, fraud finding or future-exit guarantee.

## Canonical prompt

Complete Day 17 in `prompts/dapp-prompts.ts`: examine owner/mint/blacklist/pause controls, liquidity locks, concentration and sell simulations; plain-language severity report; EAS publication; Jev classification/severity/publication gate with human escalation; LLM narration separated from authority. The live Day 17 page was read and matches these features. Primary build architecture remains `MasterPrompt-DapptoberAgentsBuild.md`.

## Run / test / build

From repository root:

```sh
pnpm install --frozen-lockfile
pnpm run dev 17
pnpm --filter @dapptober/day-17 test
pnpm run test:contracts
pnpm run test:coroner-chain
pnpm run build 17
pnpm readiness 17
```

Open localhost:3017 in Codex. Ignored `.env.local` is initialized from annotated `.env.example`; demo works without credentials. Three explicit fixtures cover restricted exit, limited flags and incomplete evidence. No simulated explorer data, block hash, UID, model output or sell result is represented as live.

## Evidence architecture / agent tools

Independent Next.js app, port3017, standalone output and own Vercel build target17. Shared `@dapptober/coroner` capability depends on existing config, locked state, RPC, receipts and AI reasoner; no other daily server required. Tools:

- `coroner.scan`: pinned RPC evidence plus Blockscout and optional Tenderly probe.
- `coroner.analyze`: typed Jev pattern/severity, deterministic minimum severity, evidence-linked AI SDK narrative. Narrative cannot change risk or grant publishing authority.
- `coroner.review`: records explicit human acknowledgment/note for low-confidence or incomplete evidence.
- `coroner.prepare`: public-publication consent, fresh snapshot/code checks, exact canonical report hash, public Pinata upload and EAS owner-wallet instruction.
- `coroner.preflight`, `coroner.submitted`, `coroner.receipt`: RPC simulation, pending-hash recovery and exact mined receipt/event verification.
- `coroner.export`: report document plus reproducible hash; `receipt.verify` checks journal integrity. `coroner.publishDemo` never sends a transaction.

`GET /api/case?id=UUID` exposes only sealed/published cases. Real records report current EAS revocation/expiration status or explicitly unknown if RPC is unavailable. Demo cases remain scoped to the browser session. Public IPFS/EAS evidence is also independently inspectable.

### What the examiner actually checks

- Pinned block/hash, token code hash, supply/decimals/name/symbol; EIP-1967 implementation address/code hash where present. Custom, beacon and minimal proxies are not exhaustively resolved.
- Blockscout verified primary source/ABI heuristics for mint/rebase, allow/blocklists, pause/freeze, mutable fees/limits and upgrade functions. Keywords are signals, not proofs of exploitability. AccessControl roles, assembly/internal paths and complete multi-file symbolic analysis are not claimed. Missing/malformed source is unknown, never absence of risk.
- Pinned `owner()` and `paused()` if present. Zero owner does not remove roles/proxy authority; absent getters do not establish unrestricted transfers.
- Up to 20 Blockscout-ranked holder candidates with balances re-read at the snapshot block. Burn addresses and the validated V2 pair are excluded from the concentration-control summary; pool/custody/vesting identities otherwise remain unknown. Indexer ranking can lag; this is not a full historical holder census.
- Configured router's V2 token/WETH pair, token0/token1, nonzero reserves, LP supply and burn-address balances. Optional **operator-reviewed OpenZeppelin VestingWallet lockers** require runtime code-hash pins; actual LP balance, unvested amount (excluding releasable balance), end time and beneficiary are read at the snapshot. Other lockers and V3/concentrated positions stay unknown. An interface alone is not lock proof. VestingWallet beneficiary ownership may transfer; schedule code must be independently reviewed before enrollment.
- A buy→exact approval→sell diagnostic, at the same block, using one probe identity/amount/route. Results distinguish buy failure, approval/observation failure, sell reversion and completed round-trip. Loss includes AMM fees/price impact, not a certified transfer-tax measurement. Passing one probe cannot rule out address-specific rules, delayed restrictions, route differences or later liquidity changes.

### Sell probe / no trade authority

Deploy `contracts/src/CoronerProbe.sol` with an approved V2 Router02-compatible router. It records immutable router/factory/WETH and **always reverts** with diagnostic data, undoing every balance, approval and trade even if accidentally broadcast. The app only calls it via Tenderly (local integration uses actual `eth_call`); it never presents a swap transaction to the browser wallet. It caps input at0.01ETH. Native test balance is overridden in Tenderly; token balances/storage are not fabricated. A gasless simulation can therefore detect a sell restriction without funding the probe or overriding token state.

Token balance reads are caught so a hostile token cannot bubble a forged success diagnostic through an observation call. Buy/sell external failures are similarly wrapped into the correct stage. Six Foundry tests cover rollback, restriction, approval failure, buy failure, limits and forged-error rejection.

If no compatible V2 pool, router/probe or provider exists on Base Sepolia, sellability stays unknown and publication requires human review. Do not change the user's selected network or present test fixtures as public liquidity.

## Real provider configuration

Use the detailed `.env.example`; keep all credentials in this app's private `.env.local` or hosting secret manager. Root env remains a pointer.

1. **Base Sepolia (84532)** archive-capable RPC → `RPC_URL`; production uses separate **Base8453** RPC/state. Pin Circle/token addresses to the selected network; Day17 itself neither spends USDC nor needs a USDC setting.
2. **Supabase Session pooler PostgreSQL URI** → `SUPABASE_DATABASE_URL`, not anon/service_role API key. Shared daily project is supported through day/operator namespaces; testing and mainnet must remain separate. Unique32+ character `OPERATOR_TOKEN` controls the private lab.
3. **Blockscout** Base Sepolia `https://base-sepolia.blockscout.com`, production `https://base.blockscout.com` → `BLOCKSCOUT_API_URL`. Optional plan key → `BLOCKSCOUT_API_KEY`. Only trusted administrator-configured HTTPS endpoints, no user-selected hosts or redirects. Token addresses are validated before path construction.
4. **Tenderly** dashboard Access Token → `TENDERLY_ACCESS_KEY`; account slug → `TENDERLY_ACCOUNT_SLUG`; project slug → `TENDERLY_PROJECT_SLUG`. Configure exact deployed `CORONER_PROBE`, reviewed `CORONER_ROUTER`, bounded `CORONER_PROBE_ETH`. Provider must expose raw top-level probe revert bytes in the full trace. Unsupported/missing output is unknown, not passed.
5. Optional `CORONER_LOCKERS_JSON=[{"address":"reviewed locker","codeHash":"exact runtime keccak256"}]` supports up to8 independently audited VestingWallet schedules. Empty list makes no external time-lock claim. Do not enroll a contract solely because it implements matching getters.
6. **TypeSafe Jev dashboard API key** → `JEV_API_KEY`; three-level concerns and unknowns are supplied as evidence, with choice severity and raw probabilities/confidence. Deterministic severity floor prevents a model from downgrading observed concerns. The0.85 review threshold is an app policy, not measured certainty; validate calibration with representative live cases.
7. **OpenAI project API key**, billing/model access → `OPENAI_API_KEY` and optional compatible endpoint/model IDs. AI SDK writes only structured summary/sections citing known finding IDs. Citations are structurally validated, not independently semantically proven; review text before publishing.
8. **Pinata JWT** with public file upload permission → `PINATA_JWT`. Upload starts only after explicit consent. A successful pin is already public even if the wallet later rejects EAS publication; public content may persist. The review note is part of the public hashed document.
9. Browser-controlled public attester address → `OWNER_ADDRESS`; fund **gas only**. No server spending/private key, thirdweb, swaps or token allowances.
10. Official EAS/SchemaRegistry predeploys on Base Sepolia and Base: `EAS_ADDRESS=0x4200000000000000000000000000000000000021`, `CORONER_SCHEMA_REGISTRY=0x4200000000000000000000000000000000000020`. Verify bytecode/interface/network before use. Register the exact schema below and enter its UID as `CORONER_SCHEMA`.

## EAS schema and publication

Register with **resolver zero**, **revocable true**, exact schema string:

```text
address token,uint256 chainId,uint256 blockNumber,bytes32 reportHash,uint8 severity,uint8 confidence,string uri
```

Use official EAS Scan's schema builder on Base Sepolia first, then separately on Base. Earlier-day EAS schemas have different layouts and cannot be substituted. No new EAS contract or custom attestation registry is required. The local test deploys the official pinned EAS artifacts, not an EAS-shaped fixture.

The report is canonical JSON hashed with keccak256; mode, token/chain/block/code hashes, evidence, holder/LP/simulation results, verdict, narrative and human review are bound. EAS recipient is the token, attester is your wallet, value0, referenceUID0, expiration `created + CORONER_MAX_REPORT_AGE` (default1h). Severity0–3 and confidence0–100 are recorded. Snapshot age/reorg/code/implementation are rechecked before wallet submission, but no guarantee is made about changing balances/permissions after the snapshot. Exact EAS calldata and Attested event are checked on receipt; no fake UID is minted locally.

For correction, revoke through the official EAS Scan attester wallet or EAS `revoke({schema,data:{uid,value:0}})` and create a new report. The app does not erase or rewrite published evidence. Public case JSON re-reads revocation/expiration; independently verify EAS when relying on a record. EAS revocation was exercised in the official local integration test.

## Deploy and recover

After local/provider rehearsal, review and deploy CoronerProbe to Base Sepolia with an encrypted Foundry keystore (not an inline private key):

```sh
node scripts/contracts.mjs create src/CoronerProbe.sol:CoronerProbe --rpc-url "$RPC_URL" --account coroner-deployer --constructor-args "$CORONER_ROUTER" --broadcast
```

Verify source/bytecode/immutable route before configuration. Probe has no administrator and no custody role. Then set provider keys, schema and gas-funded attester; rehearse actual public testnet findings/pinning/EAS publication/revocation. Mainnet gets separate reviewed probe, provider endpoints, schema and Supabase/attester setup. HTTPS hosting follows this rehearsal: app root is this folder; Vercel builds17 independently, with120-second handler support. Root Dockerfile supports `APP=day-17-memecoin-coroner`.

Publication instructions and pending hashes survive server state/reload; public transaction hashes are also cached in browser storage. Resume existing hashes before sending again. Reverted/replaced/dropped wallet transactions may require direct chain reconciliation; do not blindly resend. Operator-token rotation changes the durable namespace: archive and recover deliberately.128-report archive cap requires export/retention planning. Public-case endpoint/paid providers need host ingress controls, model quotas and monitoring; no scheduled rescanning/revocation keeper is included.

## Evidence and limits

Unit tests cover severity floor, missing data, consent/review, immutability/hash, provider failure and Tenderly pinned-block/native-only override. Actual local tests run buy/sell diagnostics with full rollback, LP burn/vesting evidence and official EAS registration/attestation/receipt/revocation. Token/router/explorer/model/Pinata fixtures in that test remain explicit doubles; no live market/provider certification follows from them. Read-only live Base Sepolia USDC evidence and EAS registry link were verified without signing. See daily audit and ordered completion tracker for exact results, hosted CI status and remaining live work.
