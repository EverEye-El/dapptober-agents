# Day 15 — Aurel, The Real-World Concierge

A copper art-deco private banking desk: source-backed dossiers, objective issuer wallet permission, Jev eligibility and model routing, human-confirmed allocation instructions and observed portfolio states. The canonical prompt is Day 15 in `prompts/dapp-prompts.ts`; the original supplied graphic `27-day-15.png` inspires the marble, velvet, serif typography and concierge portrait.

## Architecture and authority

`packages/rwa` promotes reusable issuer-catalog validation, Centrifuge AsyncVault reads, eligibility/model gates, bounded previews, exact human wallet transactions, receipt verification and portfolio refresh. This independent Next.js app runs on 3015 and needs no other daily app server. The server uses Supabase with the shared day/operator partition and transactional state locking. This is a private single-investor/operator desk: `OWNER_ADDRESS` binds every instruction and portfolio. Changing that wallet requires a new isolated workspace.

No server private key, delegated operator authority or autonomous allocation exists. The only spending signatures come from the investor's wallet. The app returns exact, bounded token approvals followed by `requestDeposit(assets, owner, owner)`. It does not deploy a wrapper/custody contract. Pending assets are distinct from shares. After actual issuer fulfillment, `mint(maxMint(owner), owner, owner)` claims shares. Redemptions use an exact share approval and `requestRedeem(shares, owner, owner)`; `withdraw(maxWithdraw(owner), owner, owner)` claims settled USDC later. This targets **Centrifuge AsyncVault**, not every ERC-4626/7540 implementation; request ID 0 and separate share tokens follow that protocol's interface. Cancellation and specialized liquidity facilities remain direct issuer/protocol workflows, with their current documentation linked in the dossier.

Approval/reset and vault calls are separate wallet confirmations. Never approve a blanket `setOperator` delegate. Exiting after approval can leave allowance; revoke it in your wallet. The app's per-preview cap/expiry are interface guards, not a new contract spending policy. The investor controls their own wallet and can interact with issuer contracts directly. Async subscription conversion is unpriced: `convertToShares` is an estimate, not an onchain minimum-share guarantee. Never use synchronous `previewDeposit` against this async vault.

## Eligibility, citations and oracles

Reviewed catalog facts bind each paragraph to an issuer/protocol source. Country/professional/risk declarations are preliminary; real vault `isPermissioned(owner)` is independently read and enforced by the issuer contract. Jev receives the resulting flags and runs **before** AI explanations and allocation previews. Missing declarations, wrong jurisdictions and failed wallet permission block; an approved but low-confidence assessment requires an additional explicit human review. Human confirmation never overrides a hard denial. No identity documents, accreditation certificates or KYC uploads are collected. A model is not a compliance officer; current issuer onboarding and independent review remain required.

Vercel AI SDK structured output generates explanatory paragraphs constrained to known source IDs; links come from the reviewed catalog rather than generated URLs. Unsupported IDs/malformed output fail. Sources are operator-reviewed configuration and are **not automatically scraped or continually refreshed**. `reviewUntil` expires stale dossiers. Correct citation structure does not guarantee a model's prose is factually entailed; live claim-level QA remains a release task. Quick FAQ and compliance-heavy questions use Jev's small/large route.

Real allocations check Chainlink USDC/USD proxy description, decimals, positive complete rounds, freshness, future timestamps and a 0.95–1.05 band. Mainnet also checks Base sequencer uptime with a one-hour recovery grace period. USDC/USD values funding currency; it does **not** claim to be the fund's NAV oracle. Fund valuation comes from `pricePerShare`, `priceLastUpdated` and `convertToAssets`; stale NAV blocks subscriptions. Read the exact feed heartbeat and issuer valuation cadence before setting age limits.

Portfolio positions come from share-token balances, pending requests, claimable shares/assets and current NAV. Yield projections are simple arithmetic from the explicitly dated indicative catalog rate, not realized income or guaranteed return. Underlying bill duration is not the maturity of an open-ended fund token. No fabricated price/yield history is shown.

## Local run and checks

```sh
pnpm install --frozen-lockfile
pnpm readiness 15 --init
pnpm --filter @dapptober/day-15 dev
pnpm --filter @dapptober/day-15 test
pnpm run test:contracts
pnpm run test:rwa-chain
pnpm --filter @dapptober/day-15 build
```

Open http://localhost:3015. Sandbox has three **fictional** treasury/credit/property products and simulated rates. Set declarations, check eligibility, ask the cited concierge and review a subscription. Check the explicit-confirmation box to record the simulated request. **Simulate issuer fulfillment** advances the demo one day; then explicitly claim shares, request redemption, fulfill and claim USDC. There are no real signatures, issuer permissions, external AI calls or payments in demo.

## Real configuration / deployment

Copy the fully annotated `.env.example` to private `.env.local`. Supply **Supabase Session pooler URI**, unique **OPERATOR_TOKEN**, **OWNER_ADDRESS**, **RPC_URL**, **TypeSafe JEV_API_KEY**, **OPENAI_API_KEY** and allowed models, plus a verified **CHAINLINK_USDC_USD_FEED_ADDRESS** and feed-specific age. There is no thirdweb key, Tenderly key or agent signing key for this day.

Configure **RWA_CATALOG_JSON** with reviewed AsyncVault/share addresses and actual product terms. `config/catalog.base.example.json` contains officially documented Base JTRSY addresses, but deliberately has no allowed countries and an expired review window: complete issuer review before enabling it. Its minimum and country policy must be verified with the issuer; increase the app allocation cap only intentionally. It is a **Base mainnet** example and cannot be copied to Base Sepolia. No public test issuer vault or test USDC oracle address is guessed. Obtain issuer-approved Base Sepolia test vault/share membership and a verified feed; if unavailable, resolve that dependency explicitly. Test fixtures are not issuer/Chainlink production deployments.

Testing is **Base Sepolia 84532** with native Circle USDC. Production is **Base 8453**, separate database/credentials and reviewed product catalog, mainnet Circle USDC and Chainlink/sequencer addresses. `pnpm readiness 15 --online` performs read-only configuration/RPC checks; provider and issuer acceptance are separate.

Deploy independently using the root Dockerfile with `APP=day-15-real-world-concierge`, or an app-root Next.js hosting project. After rehearsal set the exact final HTTPS `PUBLIC_ORIGIN`, private environment secrets and sufficient request duration. Preflight rechecks current eligibility/position and RPC-simulates the exact next owner transaction before each wallet submission. A five-minute preview can expire during signing; use a fresh preview. Broadcast hashes are saved for resume and receipts check the exact sender, target, calldata, zero native value, timestamp and successful mining. Public transaction hashes cached in the browser are scoped to quote ID; no credentials are stored there.

## Evidence and remaining work

Actual funded local-chain tests use explicit `ConciergeVaultFixture`, `ConciergeShare` and `ConciergeFeedFixture` contracts. They prove the adapter/request/confirmation/claim/receipt flow, **not Centrifuge's issuer operations or a Chainlink DON**. Jev responses are explicit HTTP fixtures. Real Base JTRSY read-only asset/share/NAV checks succeeded; no mainnet financial transaction was sent. Real Jev/OpenAI, issuer KYC/permissions and fulfillment, Chainlink testnet feed, Supabase durability, browser wallet signatures and hosted production acceptance remain in the ordered [completion tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md).

Local demo files are single-process only. Real state is day/operator scoped, not a public multi-tenant investor platform. Up to 12 configured products, 256 quotes and 64 answer threads are retained before explicit archive rotation/export is required; build a reviewed retention/export workflow before sustained production use. If a provider or issuer becomes unavailable, instructions fail closed; use the issuer's independently verified direct recovery/cancellation path. Contracts and tests are not an independent financial/security audit.
