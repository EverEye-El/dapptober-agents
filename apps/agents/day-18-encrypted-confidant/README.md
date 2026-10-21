# Day 18 — Hush / The Encrypted Confidant

A velvet-and-copper private bidding room. Canonical prompt: `prompts/dapp-prompts.ts`, Day18. It asks for encrypted balances/amounts, a private sealed-bid or hidden-order flow, owner-only viewing, public/private split, and amount-free Jev routing. The live page matches, but describes Jev as optional; this implementation includes it.

## What is implemented

`packages/confidant` supplies reusable category routing, public protocol narration, metadata-only APIs/receipts, client FHE wallet operations, ABI and bounded credit parsing. The independent Next app runs on3018. No earlier daily server is required.

`EncryptedConfidant.sol` stores **encrypted allocation-credit balances**, reservations, highest bid and winner. Credits are a one-time, self-declared whole-number allocation per wallet, **not funded USDC, transferable money, asset custody or an enforceable claim**. The sealed-bid allocation auction is complete; hidden order/payroll requests are categorized and explicitly declined for execution. Adding financial backing is a separate protocol and review project, not an environment toggle.

1. Draft an intention locally. A local classifier projects it to `sealed-bid`, `hidden-order` or `payroll`. Raw text never leaves the browser.
2. Jev receives only that public enum. Low confidence, mismatch or unsupported route blocks the app execution button. A separate Vercel AI SDK narrator sees the public protocol category only.
3. Connect a Base Sepolia wallet and inspect the reviewed deployment. Initialize a one-time private allocation with an official CoFHE encrypted input and consuming-contract-bound verifier proof.
4. Create a public-deadline lot, or read an existing lot ID. Encrypt a private bid. Your wallet signs the ciphertext-only call.
5. The contract uses `FHE.lte`, `FHE.select`, subtraction and encrypted comparison. An unaffordable amount becomes zero without a secret-dependent public revert. One bid per wallet/lot; first arrival wins ties; zero bids cannot elect a winner.
6. Anybody can close after the deadline; only then does the auction creator get ACL access to the winning amount/address. There is no public-decryption or plaintext-amount function.
7. Each bidder can settle once. Losers recover encrypted reserved credits; winner consumes their winning allocation. Balances remain private to their owner. This is allocation accounting, not token payout.
8. An owner may sign a contract-scoped15-minute ACP to view authorized values locally. Contract permission determines access; possession of a handle, service token or RPC read does not. The creator cannot decrypt other budgets or arbitrary bids. Timing, wallets, deadline, participation and operation category are public.

The guardian may pause new budgets/lots/bids. Closing and settlement remain usable while paused. Every chain action requires a browser-wallet signature. Jev/AI have no keys or transaction tools; users can call the public contract directly, so the AI gate is advisory UX, while contract rules remain authoritative.

## Simulation versus real mode

Demo uses genuine randomized AES-256-GCM envelopes in one tab, with padded fixed-size payloads and a nonextractable in-memory key. It demonstrates the split view; **it is not FHE, hardware attestation or network ACL evidence**. It has one local bidder and explicit time advancement. The public panel never displays demo plaintext. Closing the curtain/reloading loses the demo session and encrypted ledger; only amount-free service receipts persist. No fabricated transaction hash or wallet signature is generated.

Real uses `@cofhe/sdk`1.0.0, contracts1.0.1 and Base Sepolia84532. The official SDK ships no Base mainnet8453 configuration; production is blocked until verified support and review exist. The app never switches to Ethereum Sepolia, invents endpoints, or treats local mocks as FHE.

The official compatibility page still lists SDK0.8.0/contracts1.0.0 while npm publishes1.0.0/1.0.1. APIs were checked against installed source and the complete real synthetic encryption/proof-verification flow was exercised. Unused SDK optional Hardhat adapters are removed from production resolution with scoped overrides. SDK viem is aligned to the workspace2.57.3 via a package-scoped override to avoid duplicate type versions. This is not a blanket dependency upgrade.

## Environment

Copy this app's annotated `.env.example` into ignored `.env.local`; the root env remains a pointer. `AGENT_MODE=demo` needs no secrets. In real mode:

- **Supabase** Session pooler URI: `SUPABASE_DATABASE_URL`. Stores only public routes and confirmed transaction metadata, never bids/drafts/balances/ACP keys. Use separate projects for testing and production.
- `OPERATOR_TOKEN`: unique32+character lab bearer secret. It authorizes amount-free service calls, not decryption or spending.
- `RPC_URL`: private Base Sepolia RPC used for exact receipt inspection. `CONFIDANT_PUBLIC_RPC_URL`: browser-visible HTTPS RPC; use a public/domain-restricted credential here.
- `CONFIDANT_CONTRACT`: deployed contract address. `CONFIDANT_CODE_HASH`: keccak256 of independently verified runtime bytecode. Browser verifies chain, code and `version()` before acting; server verifies code before recording a receipt.
- **TypeSafe Jev** key `JEV_API_KEY`; **OpenAI** project key `OPENAI_API_KEY`, model names and optional compatible base URL. Neither receives private inputs. There is no CoFHE API secret or server spending key.
- Optional `OWNER_ADDRESS` is public lab context only. Each actual wallet is its own allocation/decryption owner; the deployer is the immutable pause guardian.
- `PUBLIC_ORIGIN`: local origin while developing, final HTTPS origin when hosted.

CoFHE defaults use official Base Sepolia verifier/coprocessor/decryption endpoints. Key/CRS caching is in memory (`fheKeyStorage:null`), avoiding the SDK's default external storage iframe. SDK ACPs are cached locally; this session's permission is removed on lock, but copied ACPs are not cryptographically revoked by a UI lock. Use a trusted browser, short expiry and official ACP revocation for incident response. XSS/extensions/device compromise can expose decrypted values.

## Run and test

```sh
pnpm install --frozen-lockfile
pnpm run dev 18
pnpm run build 18
pnpm --filter @dapptober/day-18 run start
pnpm --filter @dapptober/day-18 run test
pnpm run test:contracts
# Explicit public-service test: synthetic7-credit encryption, ephemeral unfunded wallet, NO broadcast.
CONFIDANT_LIVE_TEST=1 pnpm exec vitest run tests/day-18-live.test.ts
```

Contract tests use official CoFHE Foundry mocks, real verifier-signature/ACL logic and256-run credit-conservation fuzzing. **Mocks expose plaintext internally and do not establish cryptographic privacy.** The test deployment sequence follows official `CofheTest`, with qualified artifact paths to resolve this monorepo's duplicate external artifact names. `forge-std` is pinned to the plugin's official revision. No mock contract is a deployment dependency.

## Deploy independently

After independent review, deploy `contracts/src/EncryptedConfidant.sol:EncryptedConfidant` with the intended guardian's Base Sepolia wallet. Constructor has no arguments and uses the official CoFHE address book. Use the repository deployment-network guard (`node scripts/contracts.mjs create ... --rpc-url ... --broadcast`) and secure wallet/keystore signing; do not paste keys into committed files or shell history. Fund guardian/bidder wallets with **Base Sepolia ETH for gas only**. Register no EAS schema; deploy no USDC escrow.

Verify source/runtime, `guardian()`, `version()`, CoFHE address book/TaskManager/ACL and provider release compatibility; set address/code hash. Run multiple-wallet live acceptance with over-budget, zero, tie, duplicate, early/late, pause/recovery and unauthorized-decryption cases. Confirm no plaintext amounts in calldata/logs/model requests/host logs or Supabase. Test owner ACP expiry/revocation and wallet changes.

Vercel root is this app with the included config; build uses only Day18. Standalone container uses the existing root Dockerfile with `APP=day-18-encrypted-confidant`. The handler allows120seconds. Only after testnet acceptance, configure the final HTTPS origin and private provider settings, then execute hosted browser/WASM/wallet acceptance. Base mainnet remains a genuine external dependency; no mainnet release is implied.

## Remaining limits and recovery

Private inputs are whole `uint64` credits. Wallets/lot IDs/timing/gas/participation are public. No generic confidential ERC20, order book, payroll adapter, autonomous spender, cash payout, background agent or anonymous identity is claimed. Chain balances can be re-read and decrypted with the wallet after restart; public lots are selected by ID, with the latest public count read on connection. Pending transaction hashes are stored locally per wallet/deployment and can resume receipt confirmation. Replaced/dropped transaction reconciliation and mobile wallet/WASM operation still require live acceptance.

The curtain auto-locks after two minutes or tab hiding; it clears visible/local private inputs and removes this session's SDK ACP. It does not revoke previous delegated credentials, erase blockchain data or provide secure memory zeroization. Be aware that hiding the tab also ends the in-memory demo. Public receipt retention is bounded to100 routes/128 transaction summaries; hash-chain receipt export/retention and host budgets need operational policy.

See `docs/DAY-18-RESEARCH.md`, `docs/DAY-18-AUDIT.md` and the ordered Day18 section in `docs/PROJECT-COMPLETION-TRACKER.md`.
