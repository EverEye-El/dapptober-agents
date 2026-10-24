# Day 23 — REDLINE / The Perp Pit Wall

An F1 race engineer for perpetual positions. Canonical prompt: `prompts/dapp-prompts.ts`, complete Day 23 entry. Copper/carbon pit wall, liquidation gauges, price telemetry, team radio and an order tape; inspired by preserved `2026SocialPosts/35-day-23.png`.

## Run independently

Use pnpm 10.2.0 from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm readiness 23 --init
pnpm dev 23
pnpm build 23
pnpm start 23
pnpm exec vitest run tests/day-23.test.ts tests/day-23-api.test.ts
```

Open http://localhost:3023. Its own `.env.local` is the configuration boundary. The root `.env.example` remains a pointer. Deploy with the per-app Vercel config or the root Dockerfile (`APP=day-23-perp-pit-wall`); no other daily app server is required.

## Agent architecture and tools

`packages/perps` exports deterministic risk calculations, bounded order plans, canonical Hyperliquid snapshot parsing, typed Jev risk escalation/routing and a private API built on the existing Supabase/receipt infrastructure. The client uses TradingView Lightweight Charts and the community `@nktkas/hyperliquid` SDK for native exchange signing. No arbitrary model-generated order is executed.

- `pit.refresh`: positions, metadata/mark/funding, orders and recent fills from Hyperliquid HTTP. Browser polls every ten seconds while visible. WebSocket allMids updates the chart, reconnects and pings; risk gauges use authoritative HTTP snapshots, not midpoint approximations.
- `pit.radio`: Jev typed band/priority escalation and small/large routing, then AI SDK/OpenAI-compatible trader explanation/debrief. Hard liquidation bands cannot be lowered by Jev. No evidence/no confidence blocks generated commentary, not numeric monitoring.
- `pit.prepare`: reduce-only 25% reduction (50% absolute ceiling) or full-position adverse-side stop, $250 default notional ceiling, $10 minimum, metadata-based size/price precision and a 30-second preview.
- `pit.submit`: explicit confirmation and matching pinned wallet; refetch and check position/price under the durable plan lifecycle. Browser wallet signs the exact SDK order with signed expiry and a unique client order ID. The venue enforces reduceOnly. The app has no server trading key, withdrawal tool, new-position order or leverage-increase action.
- `pit.reconcile`: query native venue orderStatus using client ID. Resting, filled and rejected/canceled remain distinct. Unknown/failed submissions lock another preview. Unknown ID may resolve as expired only after signed expiry plus a two-minute safety delay; no blind retry or duplicate order.
- `pit.pause`: stops new financial preparations/submissions; existing exchange orders remain live. Cancel/manage those in Hyperliquid, then reconcile their order IDs here.
- `pit.lap`: demo-only adverse scenario; can cross a simulated stop and create a clearly labeled simulated fill.
- `receipt.verify`: verifies the local audit chain. Venue order IDs are not EVM transaction hashes.

Private operator token protects all real-mode reads and writes; account address is pinned server-side. Token is held in UI memory, not localStorage. Same-origin mutations, 5 KB body bound, 30 requests/minute per durable workspace, 30 radio/debrief calls per UTC day, 100-order history limit. External model/snapshot calls run outside the database transaction; final plan checks run inside it. Reconciliation is bounded by the venue timeout and transaction lock. Every substantive action is receipted.

## Configuration and venue boundaries

Read every comment in `.env.example`. Real mode requires Supabase's Session pooler URI (`SUPABASE_DATABASE_URL`), a random `OPERATOR_TOKEN`, pinned `HYPERLIQUID_ACCOUNT_ADDRESS`, `JEV_API_KEY` and `OPENAI_API_KEY`. Public venue reads/signing need no Hyperliquid API secret. The main-account wallet must be available in the browser. EIP-1271/vault/subaccount/delegated-agent trading and HIP-3 markets are not implemented; only native canonical perp universe positions are supported.

The project's `CHAIN_ID=84532` testing / `8453` production preference remains intact. **Hyperliquid is a native external venue, not a Base deployment.** `HYPERLIQUID_NETWORK=testnet` selects its testnet; `mainnet` selects its production venue. No Base Sepolia market, bridge or smart-contract deployment is invented. Approving this venue exception (or implementing a separately reviewed Base-native venue adapter) remains a release decision in the completion tracker. Do not change the global Base choice to Ethereum Sepolia or HyperEVM.

Separate deployments and Supabase projects must be used for venue network/account changes; the stored workspace refuses mismatches. Real orders require an activated/funded account on the selected venue. No deposit, bridge, token acquisition or withdrawal is automated. No custom contract needs deployment.

## Modes, acceptance and limits

Demo uses synthetic positions/chart history, deterministic risk, simulated reductions/stops and simulated coaching. It never sends orders, calls paid models or fabricates venue IDs/hashes. Real HTTP/WS/SDK/model adapters are implemented; tests use provider doubles and generated signing accounts. Live funded venue/real wallet/paid provider/Supabase acceptance is outstanding.

Liquidation prices are venue estimates, especially with cross margin. Unknown prices remain unknown. Funding cost is current hourly-rate extrapolation, not settled funding or APY. Stops have a 1% limit collar and can fail/slip or be partially filled; no protection guarantee. Preview caps are application controls, not delegated onchain permissions. The user signs each order; no API wallet with unrestricted authority is created. Compromised browser/operator/host can still mislead a signer; use independent review and a small isolated account.

Export/archive state before 100 historical plans; use an ingress rate limit in front of the app. Monitor feed freshness/provider failures, database backups, pending client IDs, account/network pinning and venue rejection states. See `docs/DAY-23-AUDIT.md` and `docs/PROJECT-COMPLETION-TRACKER.md` for evidence and ordered launch steps.
