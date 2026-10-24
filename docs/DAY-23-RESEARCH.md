# Day 23 research — October 23, 2026

Read the complete master specification, repository instructions and complete canonical Day 23 prompt before implementation. Inspected the live https://www.dapptober.xyz/dapp/23 page in Codex; its brief, features, optional Jev layer and stack agree with the supplied prompt. The supplied `35-day-23.png` was viewed and preserved; its carbon-fiber race engineer/telemetry room informs REDLINE.

| Source | Decision implemented |
| --- | --- |
| [Hyperliquid info](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/info-endpoint) | Read master-account clearinghouse state, canonical native perp metadata/context, frontend orders and recent fills. Nullable liquidation prices remain unknown |
| [Exchange](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/exchange-endpoint) | Reduce-only IOC reductions / trigger stop-loss orders, metadata asset indices, unique client order IDs and signed expiration. Do not claim an accepted/resting order is filled |
| [WebSocket subscriptions](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/websocket/subscriptions) | allMids stream for chart observations, ping/reconnect and explicit HTTP risk snapshots. Midpoint does not replace venue mark/liquidation fields |
| [Notation](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api/notation) | Signed size determines long/short; price × size is notional. Funding sign is adjusted for side |
| [SDK maintained source](https://github.com/nktkas/hyperliquid) | Community SDK 0.33.3; use actual installed types/source for wallet abstraction, HttpTransport testnet and order options `expiresAfter`. Generated local signing test captures serialized request without external broadcast |
| [Lightweight Charts 5.2](https://tradingview.github.io/lightweight-charts/docs) | Client-only createChart/addSeries, explicit TradingView creator attribution/link and responsive cleanup |
| Existing shared AI/config/store/receipt packages | AI SDK compatible provider abstraction, typed Jev source and Supabase transaction boundaries reused; daily server is independent |

A read-only request to the real Hyperliquid testnet `metaAndAssetCtxs` returned HTTP 200 and 212 matching asset/context records, with expected mark/funding fields. A real public testnet WebSocket allMids subscription also returned a snapshot of 3,453 symbols. This establishes public metadata/stream connectivity only; it is not funded order, wallet, private database or paid inference acceptance.

## Chain boundary

Hyperliquid's API trades on its native venue. Base Sepolia is not its testnet and no Base contract can manufacture native Hyperliquid positions. Keep the repository's Base Sepolia/Base configuration; expose `HYPERLIQUID_NETWORK` separately and label every real order accordingly. Owner acceptance of this external venue exception, or a separately researched Base-native replacement adapter, remains a release prerequisite. No Base funding/bridge path is implemented or claimed. No custom Solidity contract is needed for this version.

## Security dependency findings

Next.js 16.4.0 blocked the first build with a security advisory. Upgraded all workspace Next.js installations to 16.4.3. Patched vulnerable compatible ranges of Zod 4, undici 6, ip-address 10, body-parser 2 and fast-uri 3. The refreshed graph exposed the existing dstack SDK's declared Noble 1.x peer resolving to 2.x; supplied compatible 1.8.0 as an explicit root peer provider. Remaining audit findings involving thirdweb's TOML major-version migration, transitive Zod 3 and inherited elliptic require separate reviewed remediation; do not silence scanning or force incompatible major replacements.
