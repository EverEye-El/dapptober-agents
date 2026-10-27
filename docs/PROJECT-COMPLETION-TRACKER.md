# Project completion tracker

**Updated October 27, 2026. All 26 apps are implemented locally; none is verified as fully live.**

Checked boxes mean the stated work was completed and verified **in the environment named**. A local test does not complete a live deployment task. Completed and outstanding parts of a task now have separate boxes.

## Completed across Days 01–26

- [x] Build all 26 independently runnable apps, with shared capabilities and separate configuration.
- [x] Verify all 26 independent production builds and all 26 local production HTTP/page/API/workflow/receipt checks.
- [x] Pass lint, type checking, **262 application tests** and **177 contract tests**; **23 opt-in application tests remain skipped** in the ordinary suite.
- [x] Retain **16 earlier Anvil acceptance cases** and pass **one Day 21 and one new Day 22 funded acceptance case**, using actual local blockchains. External services and protocol fixtures remain distinct from live provider evidence.
- [x] Verify the pnpm **10.2.0** frozen installation using the existing dependency store; retain `pnpm-lock.yaml` as the only dependency lockfile.
- [x] Generate missing unique local operator tokens for all 23 apps and Day 10/19 session secrets. Verify private file permissions and Git exclusion; preserve existing values.
- [x] Correct readiness checks for Days 05 and 15–23, including invalid addresses, runtime hashes, signer/session-secret formats, token/network mismatches and expired/missing catalog reviews.
- [x] Publish Day 21 as [PR #18](https://github.com/EverEye-El/dapptober-agents/pull/18), stacked on PR #17; implementation `7c333f5`. No main push, merge or public deployment was performed.
- [x] Publish the engineering pass in [draft PR #17](https://github.com/EverEye-El/dapptober-agents/pull/17), based on Day 20 PR #16. Implementation: `d8ebffd`; no merge or public deployment was performed.

Days 01–20 retain their October 20 engineering-pass evidence; Days 21–23 add their separately recorded local checks. Hosted CI/container execution for Days 01–21 is verified by the October 21 reruns linked below; Day 22 evidence is recorded separately. These results do not establish actual Supabase persistence, paid-model access or public-chain transactions. Day-specific evidence and exceptions appear below. The October 23 pass also reverified Day 20 funded Anvil acceptance with an intentionally skewed host clock after correcting chain-derived verdict expiry.

## What needs your involvement

Start with one app. You do not need every day-specific service at once. Supply secrets through private configuration, never in this document.

- [x] **Unblock GitHub Actions:** the repository is now public; October 21 reruns executed and passed. The earlier account restriction no longer blocks these workflows.
- [ ] **Create Supabase projects:** separate testing and production databases; provide their private database connection details securely. App passwords have already been generated locally.
- [ ] **Enable provider accounts:** TypeSafe/Jev and applicable OpenAI billing/model access, plus the extra services listed for the chosen day. Days 07/11 use their own inference workers; Day 12 uses Jev without OpenAI.
- [ ] **Provide wallets and a small test budget:** choose the owner/deployer and any separate agent/guardian wallets; fund only intended test gas/USDC. Approve wallet requests when needed.
- [ ] **Choose hosting and the final web address:** provide account access and approve the operating budget, including separate confidential/GPU hosting where required.
- [ ] **Approve the chosen app's rules and release:** spending limits, participants, public-data consent and required outside security/legal review. Specific decisions are listed by day.

## Shared steps still required for each live app

Use **Base Sepolia (84532)** for testing and **Base (8453)** for production, with Circle USDC where required. Keep wallets, databases, secrets and contract addresses separate. Local Anvil is only a test environment. Day 06 and Day 18 have explicit network blockers below. Day 23 uses a native Hyperliquid venue adapter; its external-network exception remains a release decision, and no Base venue is claimed.

Apply this checklist to each selected day; completing it for one app does not complete it for the others.

- [ ] Configure the chosen app's private environment, real database and RPC. Keep demo mode until its required providers/contracts are ready. Verify private database tables, access restrictions and an actual saved write/read.
- [ ] Complete that day's setup below: verify protocol addresses and contract source/runtime/constructor settings, deploy test contracts where needed, and configure narrow funding, permissions and real provider access.
- [ ] Run readiness checks and genuine provider/testnet rehearsals. Verify success, rejected actions, exact receipts/balances, restart recovery and wallet/network changes. Record unsupported paths explicitly.
- [ ] Obtain independent contract/security review and any legal/privacy review; resolve findings before meaningful funds are exposed.
- [ ] Deploy a private HTTPS app with enough request time, private secrets, trusted origins, operator authentication, public/private route boundaries and request/rate limits. Verify hosted database persistence and backup restore.
- [ ] Deploy/configure separate Base production contracts and services after test acceptance; repeat bounded funded acceptance with real providers on the hosted app.
- [ ] Configure and test monitoring for providers, gas/balances, expiring permissions and stuck work. Set up bounded scheduling where required, privacy/retention/export policies, backups and pause/revoke/rollback procedures before unattended operation.
- [ ] Pass hosted checks for the release commit; record origin, chain, addresses, transaction/provider evidence and review approval before opening public access or increasing permissions.

Exact configuration fields are in each app's existing README and `.env.example`. Shared instructions: [deployment](DEPLOYMENT.md), [environment fields](ENVIRONMENT-SETUP.md). Changing an operator token can change the saved workspace; reconcile history before rotation.

## Daily completion checklists

Each day's checked implementation box describes **tested local scope**, not full challenge/protocol compliance. The shared live checklist above also applies to every day.

### Day 01 — Wallet Genesis

- [x] Wallet/session workflow and contract-enforced caps, expiry, revocation and replay rejection; actual Anvil scoped EIP-712 transfer and rejection tests.
- [ ] Configure thirdweb and gas sponsorship; deploy/verify **SessionVault**, create the real smart account, fund the vault with USDC and provide gas/sponsorship.
- [ ] Owner signs an expiring, narrowly scoped session. Verify actual bundled transfers, owner co-signing, forbidden token/recipient/cap/expiry/replay rejection, revocation and recovery.

[Setup](../apps/agents/day-01-wallet-genesis/README.md) · [Evidence and limitations](FINAL-AUDIT.md)

### Day 02 — Pay-Per-Prompt

- [x] Implement and test the 402 → payment → retry workflow, budget/replay checks and private static facilitator Authorization headers. Payment/provider tests are simulated.
- [ ] Choose a supported x402 facilitator and recipient; fund a dedicated payer. If it requires automatically refreshed, path-bound authentication tokens, implement/test that provider-specific signing adapter. No custom contract is needed.
- [ ] Verify actual settlement, transaction hash, recipient balance and protected-resource delivery; reject unpaid/replayed proofs and exhausted budgets; test facilitator failure.

[Setup](../apps/agents/day-02-pay-per-prompt/README.md) · [Evidence and limitations](FINAL-AUDIT.md)

### Day 03 — Agent Passport

- [x] Registration, directory, signed feedback and validation; actual Anvil registration, independent signatures, attestation and directory reconciliation.
- [ ] Deploy **AgentPassport**, publish reachable metadata and prepare separate owner/client/validator wallets with gas. Decide whether to enable optional EAS and register its exact schema if used.
- [ ] Verify public-chain registration, independent job-linked feedback and validator results; reject self-feedback, unauthorized updates, invalid signatures and duplicates. Document metadata availability and trust policy.

[Setup](../apps/agents/day-03-agent-passport/README.md) · [Evidence and limitations](FINAL-AUDIT.md)

### Day 04 — MCP Mercenary

- [x] Actual MCP communication and local quest lifecycle; Anvil escrow funding, claim/submission, approval payout and disputed refund.
- [ ] Deploy **QuestEscrow**; configure creator, independent validator and a dedicated bounded agent; fund a small USDC bounty and gas. Connect an authenticated external MCP client.
- [ ] Verify discovery → claim → genuine Jev/model work → submission → human approval → payout, plus disputes, timeout recovery and duplicate-payout rejection. Schedule bounded workers only if chosen; the agent cannot approve its own payout.

[Setup](../apps/agents/day-04-mcp-mercenary/README.md) · [Evidence and limitations](FINAL-AUDIT.md)

### Day 05 — Stablecoin Autopilot

- [x] Allocation policy, monitoring, deposits/withdrawals, pause and owner recovery tested on Anvil with two fixture vaults. Fixture APY is not live yield.
- [ ] Verify at least two distinct existing USDC ERC4626 vaults, including lending and savings, on the chosen network; review asset/share conversion, liquidity, withdrawals and risk. Deploy **FlightTreasury** and obtain owner-approved vaults/limits.
- [ ] Fund a small treasury budget and agent gas; collect real share-price samples at least 60 seconds apart. Verify genuine policy review, deposits/rebalance/withdrawals, cap rejection and owner recovery, including illiquidity limits; choose manual or bounded scheduled operation.

[Setup](../apps/agents/day-05-stablecoin-autopilot/README.md) · [Evidence and limitations](FINAL-AUDIT.md)

### Day 06 — Intent Calligrapher

- [x] Intent parsing, constraints, signing payloads and simulated solver lifecycle; matching Base network configuration and explicit unsupported-testnet rejection.
- [ ] Resolve the live **Base Sepolia CoW solver** gap: no supported endpoint is established. Keep that test acceptance blocked; do not substitute another chain. Verify official Base tokens/relayer and quote liquidity; no custom contract is needed.
- [ ] Fund the browser wallet and approve only the verified relayer. Verify genuine quotes/providers, EIP-712 order submission, fill/balances and a separate cancellation; reject expired/invalid constraints and document unfilled-order/allowance recovery.

[Setup](../apps/agents/day-06-intent-calligrapher/README.md) · [Evidence and limitations](FINAL-AUDIT.md)

### Day 07 — Glass-Box Mind

- [x] Receipt signatures, tamper rejection, sharing/verifier workflow and historical Intel-signed quote tests. These are not fresh confidential inference evidence.
- [ ] Provision an actual Intel TDX dstack worker with private HTTPS access and Ollama/model inference inside it. Review/pin image and model digests, protect storage, and independently approve workload/model measurements, including mrtd and all four RTMRs.
- [ ] Verify fresh nonce-bound inference and hardware quotes, current Intel collateral/revocation/TCB/non-debug status and measurement/model binding; reject stale/replayed/tampered results. Monitor collateral/worker health and require renewed review after changes.
- [ ] Decide whether onchain publication is required. If enabled, deploy **InferenceAnchor**, fund gas and verify actual commitments/URIs; anchoring alone does not prove hardware trust or answer accuracy.

[Setup](../apps/agents/day-07-glass-box-mind/README.md) · [Evidence and limitations](DAY-07-AUDIT.md)

### Day 08 — Swarm Senate

- [x] Debate, delegation, voting, human override and policy adoption; actual Anvil governance lifecycle.
- [ ] Agree 3–32 founding members and voting/override windows. Configure durable profiles/transcripts, delegate seed and real reasoning; deploy/wire **SenateVoice + SwarmGovernor**, record start block and fund gas.
- [ ] Members sign profiles/delegate before snapshots. Verify debate, votes, quorum/majority, failed proposals, human override/adoption and no double counting; reject nonmembers/late/repeated actions. Choose manual or bounded worker operation; seed changes need renewed delegation.

[Setup](../apps/agents/day-08-swarm-senate/README.md) · [Evidence and limitations](DAY-08-AUDIT.md)

### Day 09 — Forecast Colosseum

- [x] Funded binary pools, caps and ranking/calibration; Anvil human/agent trades, cap rejection, dispute/reset/settlement and payout with an oracle double.
- [ ] Verify official UMA OOv3, approved ASSERT_TRUTH2, whitelisted six-decimal USDC and minimum bonds. **Base Sepolia does not establish production DVM dispute support.** Deploy **ForecastColosseum** with at least a two-hour live dispute window; fund trading and separate assertion/dispute bonds.
- [ ] Register caps and immutable market rules/resolution sources, including missing-data/INVALID handling. Verify real human/agent trades, bonded assertion/dispute and supported resolution, payouts/refunds, duplicate rejection and standings; drill pause, 30-day stale recovery and pending-dispute limits. Operate funded dispute monitoring.

[Setup](../apps/agents/day-09-forecast-colosseum/README.md) · [Evidence and limitations](DAY-09-AUDIT.md)

### Day 10 — Human Checkpoint

- [x] Local admission/uniqueness/race/expiry tests, genuine P-256 WebAuthn signature verification, registry-authority checks and Anvil signed reward payout/duplicate rejection. Personhood/registry providers are fixtures.
- [ ] Create the production World ID app/RP/action and private signing configuration; establish final HTTPS/passkey domain and private database. Verify an actual ERC-8004 IdentityRegistry and agent authority; use a separate managed reward signer.
- [ ] Deploy **HumanCheckpointRewards** with the fixed USDC, reward, verifier and RP/action campaign hash; fund only the reward budget and visitor gas. Verify real World ID/hardware passkeys, returning users, cross-session uniqueness, authority transfer, lane separation and genuine moderation without proof/chat leakage.
- [ ] Verify funded public-chain claims and expired/mismatched/duplicate rejection, both app and contract pause, and restore preserving uniqueness. Review privacy/retention and wallet-loss limits; never reset enrollment or change RP/action within an existing campaign.

[Setup](../apps/agents/day-10-human-checkpoint/README.md) · [Evidence and limitations](DAY-10-AUDIT.md)

### Day 11 — GPU Night Market

- [x] Listings, bounded reservations, telemetry, commitments/payout/refund and cached recovery; actual Anvil/HTTP/WebSocket workflow with Jev/Ollama doubles, not genuine GPU inference.
- [ ] Deploy **GpuNightMarket** and configure buyer/provider custody, caps and funds. Obtain an Akash GPU lease and durable storage; pin worker/Ollama/model images, prove GPU use, and provide private HTTPS worker/public WSS telemetry with Ollama internal.
- [ ] Register real model/VRAM/slots/prices and owner-approved stalls/endpoints. Verify genuine human/agent jobs, exact prices/commitments/payouts, cached output after restart, capacity/cap/replay rejection, expiry refund and pause recovery.
- [ ] Review delivery trust/retention and key handling; monitor lease expiry, capacity, output backups and signing gas. Add scaling before 100 providers/1,000 lifetime jobs. Multi-tenant operation and answer-correctness disputes need separate implementation if offered.

[Setup](../apps/agents/day-11-gpu-night-market/README.md) · [Evidence and limitations](DAY-11-AUDIT.md)

### Day 12 — Provenance Press

- [x] Custom Base registration/terms/consent, remix permissions, licenses, royalty splits/claims and certificate history; actual Anvil original/remix/purchase/claim. Provider uploads are doubled.
- [ ] Resolve **native Story/PIL versus the fixed Base networks** before claiming Story compliance: approve a network exception or implement a supported, reviewed bridge/currency design. Review actual license text, authorship/rights and public-IPFS consent.
- [ ] Configure Pinata/Jev/thirdweb and a separate buyer signer; deploy **ProvenancePress**, record deployment block and owner-approved works/caps. Verify real IPFS retrieval/hash, original/remix restrictions, funded human/agent licenses, recursive royalties, claims and paginated certificates/history.
- [ ] Establish pinning/indexing and retention before 500 works/2,000 licenses or dense event history. Public uploads may persist after cancellation; technical templates do not establish copyright proof or AI detection.

[Setup](../apps/agents/day-12-provenance-press/README.md) · [Evidence and limitations](DAY-12-AUDIT.md)

### Day 13 — Agent Launch Gantry

- [x] Atomic agent/token/curve deployment, vesting, holder distributions and paid-service commitments/replay cache; funded Anvil trades, service payment, holder claims and vesting. Inference/feed providers are doubles.
- [ ] Review token/revenue/legal terms, fixed supply, 20% creator allocation and 90-day cliff/365-day vest. Configure thirdweb and a gas-only buyer signer; deploy **AgentLaunchGantry + GantryBuyerVault** with Circle USDC and owner-approved listing/cap/24-hour grants.
- [ ] Verify real deployment/browser signatures, buys/sells/slippage, transfer-correct dividends, locked reserves/vesting and revoke/recovery. Run genuine paid inference, output commitment/cache/retry checks without double spending; no automatic service refund is promised.
- [ ] Publish/run the supplied Dune SQL on the mainnet factory, configure query ID/key and results fresher than 24 hours, and reconcile revenue/trades with RPC. Verify actual hosted service/feed privacy, persistence and reserve/model monitoring.

[Setup](../apps/agents/day-13-agent-launch-gantry/README.md) · [Evidence and limitations](DAY-13-AUDIT.md)

### Day 14 — Guardrail Sentinel

- [x] Agent compartments, budgets/allowlists/time windows, co-signing, replay/global revocation and MCP/Tenderly adapters; Anvil scoped payments, guardian shutdown/re-enrollment and removal/fund recovery. Recorded fleet visualization/removal follow-ups remain local evidence.
- [ ] Review/deploy **GuardrailSentinel** with separate owner/guardian/session custody; configure Tenderly and real Jev/OpenAI. Fund gas-only signers and limited onchain compartments, and owner-sign policies. Verify allowed recipients can safely receive/recover direct USDC.
- [ ] Verify genuine model/simulation results, low/high-risk approvals, signed mutations/replay rejection, global revoke, gas exhaustion, owner resume/recovery and retained counters. Revoke legacy authorities/migrate earlier funds; earlier apps are not automatically protected.
- [ ] Verify hosted fleet interaction, GPU fallback/reduced motion and scale, persistence and chosen monitoring. Removal requires the newer remove(id) contract; older non-upgradeable deployments need reviewed replacement/migration. Removed balances/history remain recoverable; 100 lifetime compartments require capacity planning.

[Setup](../apps/agents/day-14-guardrail-sentinel/README.md) · [Evidence and limitations](DAY-14-AUDIT.md)

### Day 15 — Aurel / Real-World Concierge

- [x] Issuer dossiers/eligibility checks, citations, subscription/claim/redemption adapters and NAV/feed checks; local-chain lifecycle uses protocol/provider doubles. Read-only Base JTRSY asset/share/NAV checks are genuine, not issuer acceptance.
- [ ] Complete issuer KYC/onboarding and wallet approval directly with the issuer; review country/minimum/fees/terms and dated source-backed catalog. Obtain an approved **Base Sepolia USDC AsyncVault/share pair** and verified Chainlink USDC feed; do not copy mainnet addresses into testing. No new production contract is needed.
- [ ] Fund a small investor test budget; verify exact approvals and actual issuer request → fulfillment → claim → redemption → USDC claim, receipt matching/restart recovery, permission rejection and cancellation/allowance recovery. Test stale NAV/feed, depeg, preview expiry and changing eligibility.
- [ ] Verify genuine Jev/AI citations against issuer documents, investor privacy and reviewed mainnet catalog/feed/sequencer settings. Self-declarations and structural citations do not establish eligibility or factual correctness.

[Setup](../apps/agents/day-15-real-world-concierge/README.md) · [Evidence and limitations](DAY-15-AUDIT.md)

### Day 16 — Brass / Bot-to-Bot Bourse

- [x] A2A 1.0 cards and negotiation, signed terms/delivery, caps and exact receipts; funded Anvil HTTP negotiation → escrow → delivery → payout with registry/provider doubles.
- [ ] Verify real ERC-8004 buyer/seller identities, approved seller cards/interfaces and private bearer tokens. Use separate buyer, EOA seller and arbiter custody; agree arbitration terms. Smart-wallet sellers require ERC1271 client implementation/tests before enrollment.
- [ ] Deploy **BotBourse** with verified token/registry/arbiter and intentional immutable cap; fund a bounded buyer. Verify genuine independent seller/model negotiation, six-round limits, human-confirmed funding, signed delivery/release, identity transfers and replay/changed/expired terms rejection.
- [ ] Rehearse missed-delivery refund, arbiter split, review-window release, seven-day fallback, pause/direct-contract recovery, pending-wallet recovery and allowance revocation. Establish timeout monitoring and archives before 128 orders/512 instructions/256 messages; no background keeper is shipped.

[Setup](../apps/agents/day-16-bot-to-bot-bourse/README.md) · [Evidence and limitations](DAY-16-AUDIT.md)

### Day 17 — Toe Tag / Memecoin Coroner

- [x] Pinned source/proxy/holder/LP/locker evidence and reverting sell probe; local buy/sell rollback and official EAS contract tests, plus genuine read-only Base Sepolia source/holder/EAS-registry collection. This is not a live sell verdict.
- [ ] Review/deploy **CoronerProbe** with a real V2 Router02-compatible token/WETH route, factory and liquidity; unsupported V3/Aerodrome/empty pools stay unknown. Configure archive RPC, Blockscout, Tenderly, Jev/OpenAI and Pinata; review locker instances/runtime/schedules if enrolled.
- [ ] Verify actual Tenderly traces at pinned blocks without balance/storage overrides and calibrate real provider/model findings. Register the exact revocable EAS schema, fund attester gas and choose report expiry; no server spending key, token approval or USDC budget is needed.
- [ ] With consent, retrieve/hash the published IPFS report and verify EAS attester/schema/recipient/UID/expiry/revocation; test reorgs, changed code, timeout/replaced receipts and restart recovery. Monitor/rescan if required and export before 128 cases; no rescan keeper exists. Public pinning can persist after rejected publication.

[Setup](../apps/agents/day-17-memecoin-coroner/README.md) · [Evidence and limitations](DAY-17-AUDIT.md)

### Day 18 — Hush / Encrypted Confidant

- [x] Encrypted allocation-credit auctions, owner access, conservation tests and browser simulation; genuine Base Sepolia synthetic input encryption/proof verification **without broadcast**.
- [x] Implement/test exact-instruction speed-up replacement handling, cancelled/changed-instruction rejection and final mined-hash recording. Actual wallet behavior remains unverified.
- [ ] Confirm **allocation credits versus funded assets**. Credits are not redeemable tokens; hidden-order/payroll and funded settlement adapters are absent. Base mainnet remains blocked until genuine CoFHE deployment/SDK/operations support is established; do not substitute networks.
- [ ] Review CoFHE/verifier/ACL trust and live SDK compatibility; deploy/pin **EncryptedConfidant** on Base Sepolia with private server RPC and browser-safe restricted HTTPS RPC. Fund gas-only guardian/auctioneer/bidder wallets; keep amounts/drafts out of server/provider storage.
- [ ] Verify multi-wallet encrypted bids/ties/conservation, owner-only ACP decryption, unauthorized denial, deadline/expiry/revocation, close/settle/pause and browser lock. Test live replacement/cancellation/drop/restart recovery, WASM/mobile wallets and outbound-payload privacy. Unknown hashes remain blocked for inspection; UI lock is not revocation of copied permissions.

[Setup](../apps/agents/day-18-encrypted-confidant/README.md) · [Evidence and limitations](DAY-18-AUDIT.md)

### Day 19 — Gremlin / Group-Chat Familiar

- [x] Wallet-authenticated chat actions/native adapters; funded Anvil tip, exact bill shares, NFT mint, poll and receipt checks. Jev/OpenAI are doubles; live chat installs/deliveries are not verified.
- [x] Implement/test authenticated interrupted-job review/retry/sent/cancel, stale-worker protection, reply preservation, terminal-job archival and replay tombstones with paginated private history.
- [ ] Deploy/pin **GroupChatFamiliar**, configure real Jev/OpenAI/Neynar or reviewed recipient mappings, and fund test wallets. Obtain room consent and install chosen Telegram/Discord/Slack bots; enroll exact channels and publish the signed Farcaster manifest.
- [ ] Verify real chat deliveries/replay authentication, mini-app/embed/native wallet, multi-wallet actions, recipient/amount consent, mint/poll results, guardian pause, receipt/queue ambiguity recovery and actual database/archive durability. Inspect uncertain delivery before retrying.
- [ ] Archive room proposals before raising the 100-proposal limit; terminal-job archival does not remove the active 500-job bound. Establish data removal/retention and queue alerts. Mainnet BuyWidget is optional; no Sepolia fiat route is claimed.

[Setup](../apps/agents/day-19-group-chat-familiar/README.md) · [Evidence and limitations](DAY-19-AUDIT.md)

### Day 20 — Overrule / Restaked Referee

- [x] Deterministic sum/max verification, signed verdicts and Base vault-share collateral; funded Anvil deposit → honest release → challenge/slash → redemption/withdrawal. Registry/Eigen services are fixtures.
- [x] Implement/test finalized-event archival, resumable atomic checkpoints, reduced RPC log ranges, changed-checkpoint rejection and paginated task/verdict history in the evidence room. Database/RPC acceptance remains open.
- [ ] Review a real USDC ERC4626 vault and collateral/liquidity/proxy risks; deploy/pin **RestakedReferee** with intended guardian and at least a one-hour review window. Configure dedicated operator custody, start block and bounded gas/collateral. Verify actual ERC-8004 registry/linkage/request and final response if enabled.
- [ ] Verify genuine multi-wallet operator verdicts/Jev commentary, honest fail/pass, wrong calls, challenge/delayed/unchallenged slashing, withdrawals, pause and restart recovery. Accept the archive against real Supabase/RPC; integrate active views before exceeding 200 tasks/500 reports. Persist/reconcile uncertain broadcasts and replaced/dropped transactions before unattended submission; configure monitoring/settlement scheduling.
- [ ] Resolve **native EigenLayer security**: actual source-chain AVS registration/allocated stake, transported tables and a separately reviewed slashing/adjudication relay remain absent. Verify the official destination verifier/runtime, AVS/operator set, current certificates, message binding, two-thirds stake and 24-hour freshness; otherwise describe the product as Base vault-share collateral with certificate inspection only.

[Setup](../apps/agents/day-20-restaked-referee/README.md) · [Evidence and limitations](DAY-20-AUDIT.md)

### Day 21 — Layover / Chainless Traveler

- [x] Implement the copper airport lounge, unified USDC view, typed pay/mint/swap itineraries, accessible split-flap departures, Jev-approved candidate/model selection, thirdweb/LI.FI adapters and browser-owned sponsored smart-account signing. Explicit demo outcomes never invent transaction hashes.
- [x] Test simulated pay/mint/swap and cancellation, route/model guards, unsupported-network rejection, provider partial/refund/pending states and signing-lock recovery. Run funded Anvil USDC pay and pass mint with exact calldata, recipient, receipt and allowance checks; ERC-4337/Jev/LLM infrastructure is explicitly doubled.
- [ ] Configure the private **Supabase Session pooler URI**, Jev/OpenAI keys/models, **thirdweb client ID/secret**, domain restrictions and funded gas-sponsorship policy. Add reviewed Base Sepolia RPC/bundler/EntryPoint/Circle USDC to `TRAVEL_SOURCES_JSON`; connect and fund the displayed **smart account**, not just its EOA. There is no server agent spending key.
- [ ] Deploy/pin **LayoverPass** on Base Sepolia with Circle USDC and intended treasury; verify actual sponsored one-USDC mint and direct USDC payment. Verify wallet account changes, paymaster refusal, exact operation lookup, destination receipts, real Supabase durability/restart and restoration.
- [ ] Review/provider-pin external transaction routers **and allowance spenders**, including proxy/facet upgrade risks; add LI.FI quota credentials as needed. Accept a genuinely executable test quote before enabling any bridge/DEX route. Base Sepolia stays the test network even when external markets are unavailable; do not silently substitute mainnet or Ethereum Sepolia.
- [ ] Verify actual external bridge/swap delivery, quote expiry, refunds/partial tokens, replacement/drop/ambiguous-wallet recovery and residual exact-allowance revocation. Inspect wallet/bundler history before unlocking an uncertain signing leg. Add production monitoring and export/archive before 200 flights; no unattended bridge retry or refund signer exists.
- [ ] Complete security review and HTTPS hosting, then use separate Base mainnet configuration/Supabase and an approved small budget. Optionally enable reviewed Ethereum/Arbitrum/Optimism funding smart accounts with their own USDC/RPC/bundler; destination remains Base. Verify each enabled route and paymaster on the actual public chains before release.

[Setup](../apps/agents/day-21-chainless-traveler/README.md) · [Evidence and limitations](DAY-21-AUDIT.md)

### Day 22 — Pitlane / Agent Arena

- [x] Build the training gym, five starter agents, versioned/frozen weighted strategies, sixty-bout practice benchmark, autonomous commit-reveal pilots, Phaser holographic replay/match tape/archive, seasonal ladder and pooled wager UI. Explicit practice stakes/crowds/randomness never pretend to be live.
- [x] Enforce USDC stakes and 90/5/5 **losing-pool** profit/trainer/house split onchain, with principal recovery, exact rounding, pull claims, zero-fee refunds and missed-reveal forfeits. Test real funded Anvil wagers, durable signed pilot outbox, VRF/Jev fixtures, scoring agreement and exact receipt/claim rejection.
- [ ] Configure actual **Supabase Session pooler URI**, Base Sepolia RPC, billed **OpenAI** coaching and **TypeSafe Jev** gates. Verify live wallet authentication/nonces, per-wallet instruction isolation, quotas, database locking/backups and encrypted reveal-preimage restoration. This version authenticates EOAs; EIP-1271 support is absent.
- [ ] Deploy/pin **AgentArena** with Circle USDC, intended house/guardian and reviewed **Chainlink VRF v2.5 coordinator/lane/subscription**. Fund that subscription with LINK, add its arena consumer, and verify genuine request/fulfillment/callback gas. Guardian-enroll fighters; fund dedicated matching pilot keys with bounded ETH gas and user wallets with intended test USDC/gas.
- [ ] Register/coach/publish fighters so the worker retains frozen preimages. Run `pnpm worker:arena` with private operator authentication; verify genuine autonomous commit → request → reveal → settlement and trainer/backer/house claims using independent wallets. Test trainer self-backing, pause-safe exits, missing reveals, oracle timeout/late callback, changed strategies and season rollover.
- [ ] Reconcile dropped/replaced/reverted worker outboxes and uncertain wallet submissions before retry; test real provider refusal, worker downtime, reorgs and restore recovery. Monitor pilot gas, LINK, pending phases and deadlines. Pilot budgets do not secure a stolen private key; commit-reveal/VRF do not prevent collusion or Sybil bets.
- [ ] Review public wagering eligibility/economics, custody, independent contract/security assessment, ingress limits and retention/privacy. Provide archive/indexer/new-season deployment before the 200-match stop; retain four-active-bout and daily scheduling/VRF bounds unless separately reviewed. Add HTTPS/hosting and hosted acceptance, then approve a separate small Base mainnet acceptance budget and verify live dependencies there.

[Setup](../apps/agents/day-22-agent-arena/README.md) · [Evidence and limitations](DAY-22-AUDIT.md)

### Day 23 — REDLINE / The Perp Pit Wall

- [x] Implement deterministic liquidation/funding risk, typed Jev escalation/routing, AI radio/debrief, native venue account/market adapters and WebSocket chart telemetry. Complete simulated reduction/stop crossing/receipt flow, generated SDK signing tests, authorization/confirmation/pause/expiry/pending recovery tests and read-only public Hyperliquid testnet metadata check. These are not funded venue acceptance.
- [ ] **Venue decision first:** approve the explicit native Hyperliquid testnet/mainnet exception to the Base Sepolia/Base preference, or build and independently verify a Base-native replacement adapter before enabling financial orders. No custom contract deployment is required for the implemented Hyperliquid version.
- [ ] Configure the private app with **Supabase Session pooler `SUPABASE_DATABASE_URL`**, generated **`OPERATOR_TOKEN`**, **`JEV_API_KEY`**, **`OPENAI_API_KEY`** and selected model names. Verify actual private persistence, restricted access, backup/restore and typed Jev confidence/routing with paid models; use a separate test project.
- [ ] Set **`HYPERLIQUID_NETWORK=testnet`**, pin the intended **master EOA** in **`HYPERLIQUID_ACCOUNT_ADDRESS`**, and review **`PIT_MAX_ORDER_USD`** (default $250). Activate/fund only that isolated test account through the venue's supported flow. Browser wallet signs each order; no private trading key, thirdweb key, Base RPC or bridge is needed by this app.
- [ ] Verify actual positions/mark/funding/liquidation/nullable estimates, native metadata indices, WS disconnect/reconnect/ping and stale HTTP behavior. Use small funded long/short positions to test stop registration/trigger/fill, partial IOC reduction, canceled/rejected orders, fees, funding and independent venue balances/history. Confirm native order IDs, not fabricated EVM hashes.
- [ ] Test fresh-preview confirmation, wrong wallet, changed position/mark, expired signature, duplicate click, wallet rejection, network failure, reload/restart and Supabase restoration. Uncertain submissions stay locked until native reconciliation; an unknown ID releases only after signed expiry plus a two-minute safety delay. Test pause blocking new actions while existing venue orders remain live; cancel those in the venue and reconcile.
- [ ] Independently review the signing payload, app caps, private access, exchange controls and risk statements. App preview caps are not autonomous onchain permissions. This version supports master EOA/native canonical perps only; HIP-3, vault/subaccount/delegated/multisig trading remain unsupported. No model may open a position, raise leverage, deposit, bridge or withdraw.
- [ ] Deploy the private HTTPS app with correct origin/token and ingress limits after the above rehearsal. Verify hosted Supabase/provider/wallet behavior, mobile layout and chart attribution. Export/archive before 100 plans, monitor feed age/pending client IDs/provider failures, and rehearse pause/backup/recovery.
- [ ] Approve a separately funded **Hyperliquid mainnet** account and separate database/origin only if the venue exception was accepted; repeat bounded live acceptance and review privacy/retention/risk obligations before public or meaningful-fund use. Global Base configuration remains unchanged.

[Setup](../apps/agents/day-23-perp-pit-wall/README.md) · [Evidence and limitations](DAY-23-AUDIT.md)

### Day 24 — Umbra Mutual / The Agent Mishap Mutual

- [x] Implement reputation-priced cover, finite-season fully reserved USDC capital, historical member ballots, private evidence commitments, typed Jev recommendations and exact payout accounting. Pass 17 new Solidity cases (including conservation fuzzing), 11 ordinary application cases, actual funded Anvil premium/claim/vote/payout/exit acceptance, independent production build and HTTP lifecycle. Providers/registry/database doubles and simulated causal-loss evidence remain separate from live acceptance.
- [ ] Review the economic/legal rules first: seven-day season, seven-day cover/one-hour wait, three-day filing grace and ballot, 30% quorum/strict majority, nontransferable shares, claimant exclusion and global capital lock. Approve trusted feedback reviewers, covered mistakes/exclusions, evidence retention and member adjudication responsibilities. New capital bears old claims without old voting rights; premium return is variable and can be negative.
- [ ] On **Base Sepolia 84532**, verify actual **ERC-8004 Identity/Reputation** deployments, their relationship, agent owners/wallets and trusted `quality` feedback. Day 03's custom registry is not an automatic substitute. Prepare independent member, claimant and guardian wallets with small gas/USDC budgets; register the agent and establish genuine trusted feedback.
- [ ] Deploy/verify **AgentMishapMutual** using Circle USDC, those registries, guardian and 1–16 reviewed trusted reviewers. Record source/constructor/runtime hash; set **MUTUAL_POOL**, **MUTUAL_CODE_HASH**, **MUTUAL_IDENTITY_REGISTRY**, **MUTUAL_REPUTATION_REGISTRY**, chain/RPC/USDC. Check the seven-day underwriting deadline before accepting deposits; do not fund an expired season.
- [ ] Configure **Supabase Session pooler SUPABASE_DATABASE_URL**, the generated private **OPERATOR_TOKEN**, and **JEV_API_KEY**. Verify actual save/read/restart/backup restore and private evidence access. Run genuine redacted, consented Jev sufficient/insufficient/deny reviews; test unavailable providers without fabricated recommendations. No OpenAI, thirdweb or server spending key is needed.
- [ ] With independent browser wallets, rehearse actual deposit/approval/quote/premium, waiting period, genuine causal incident/evidence, historical ballots, approved/denied/no-quorum settlement, duplicate incidents, pull payout and expired-cover release/withdrawal. Check exact balances, runtime pin, wallet/chain changes, allowance, transferred agent identity, pending/reverted receipt recovery and restart. Uncertain submissions must reconcile before another transaction; discard is an operator assertion, not cancellation.
- [ ] If using Snapshot discussions, configure **SNAPSHOT_SPACE**, create the actual Base Sepolia space/proposal with reviewed weight strategy and the exact printed evidence binding/policy block, then verify Hub imports and real member votes. The deployed contract ballot remains binding; imported Snapshot scores never authorize funds.
- [ ] Obtain independent contract/economic/security and applicable insurance/legal/privacy review. Resolve inherited dependency advisories. Test collusion/fabricated evidence, differently labeled duplicate losses, capital locks, depleted balances and guardian pause/recovery. Export/index before 200 policies; assign operators for permissionless expiry/settlement and plan a separate next season.
- [ ] Deploy the private **HTTPS** office with correct origin, secrets, ingress limits and durable Supabase. Verify hosted evidence permissions, wallets/providers, mobile behavior, restore and receipt reconciliation. This is operator-authenticated administration, not a public member login system.
- [ ] After test acceptance, deploy a separate **Base 8453** season with production Circle USDC/verified registries, separate database/wallets/runtime pin, real funded capital and narrowly bounded cover. Repeat paid-provider/wallet/payout acceptance; approve public release only after review. Monitor reserves, credits, capital, deadlines, outstanding ballots, Jev/database failures and backups; rehearse pause and end-of-season exit.

[Setup](../apps/agents/day-24-agent-mishap-mutual/README.md) · [Evidence and limitations](DAY-24-AUDIT.md)

### Day 25 — Vesper / The Memory Cathedral

- [x] Build user-held browser encryption, encrypted portable library/search, Pinata/IPFS adapters, owner-controlled Base pointers, expiring per-agent wrapped keys, actual MCP SDK tools and Jev checks. Verify actual generated-wallet Anvil pointer/grant/read/revoke/rotate, wrong-signature/replay rejection, local agent decryption, Jev-outage owner revocation and exact receipt reconciliation. Provider/storage/database doubles are not public-service evidence.
- [ ] **Key custody first:** create/import an owner RSA key and securely store its private backup in encrypted private storage. The download is unencrypted sensitive material; never add it to Git, app environment, IPFS or chat. Rehearse owner-key import, independent agent RSA custody and local decrypted export/import using synthetic memories before personal data. Lost keys cannot be reset by this app.
- [ ] Configure separate test **Supabase Session pooler SUPABASE_DATABASE_URL**, generated **OPERATOR_TOKEN**, owner EOA **OWNER_ADDRESS**, Base Sepolia **RPC_URL/CHAIN_ID=84532**, scoped public-file **PINATA_JWT** and **JEV_API_KEY**. Verify private saved ciphertext/capsules/receipts, no plaintext/private keys in logs/database, backups/restore and namespace recovery. No OpenAI/Lit/thirdweb key or server wallet signer is required.
- [ ] Deploy/verify **MemoryCathedral()** on **Base Sepolia**, pin **MEMORY_REGISTRY** and exact **MEMORY_REGISTRY_CODE_HASH**, and fund only the owner/deployer's small gas budget. No USDC/pool funding or agent gas balance is needed. Verify source/runtime/version and owner namespaces independently.
- [ ] Using synthetic data, verify actual Pinata v3 public-IPFS upload, independent gateway retrieval and onchain envelope commitment. Confirm provider billing/pinning/availability/size limits; rehearse mismatch/unavailable gateway and orphaned-upload recovery. Public IPFS can retain ciphertext after unpinning/revocation; approve retention/privacy terms before sensitive contents.
- [ ] Run genuine Jev allow/deny/low-confidence reviews on request/grant/read metadata, confirm >=90% gate and durable daily budget, and ensure purpose text contains no secrets. Verify every MCP memory call is checked, no automatic memory-to-model disclosure and direct owner revocation works on deny/outage. Calibrate policy with reviewed examples; a model gate is not cryptographic access control.
- [ ] Configure independent EOA/RSA agent clients using **scripts/memory-agent.env.example** and the runnable CLI. Verify real Streamable HTTP request → explicit owner grant → agent-local decrypt, nonce/deadline/tool/key/purpose/signature tampering, expiry/replay/revocation/archive, version rotation and old-key rejection for new ciphertext. Test a second compatible client and portable import after restart. EIP-1271/smart-account agent auth is not supported.
- [ ] Rehearse hardware/browser owner signatures, stale pointer/changed wallet/wrong network, failed/reverted/uncertain receipts, pending recovery and no duplicate retry. Back up before locking/reloading; test that new owner keys cannot open old memories. Revocation cannot erase already delivered keys or old plaintext; rotate and regrant only intended agents for future versions.
- [ ] Obtain independent cryptography/contract/privacy review. Approve public metadata exposure, key backup handling, agent retention obligations, decrypted-client output and archive restore semantics. Resolve inherited dependency advisories. Add production ingress/admission controls: valid unknown agents can consume request/model budgets. Export/migrate before 50 tomes/100 requests/1,000 signed calls; nonce eviction must never reenable replay. Review indexer, retention and workspace recovery before scale.
- [ ] After the above rehearsal, deploy the private **HTTPS** office with exact origin, private secrets, trusted build/browser assets and bounded ingress. Verify hosted Supabase/Pinata/Jev/MCP/wallet behavior and backup restore; the host serves the encryption code and is part of the trust boundary. Configure monitoring for pending receipts, provider failures, model/admission limits, pin retention and backups.
- [ ] Deploy a separate **Base 8453** registry/environment/database after acceptance. Migrate deliberately: restore matching current pointer exports or decrypt locally and inscribe a new version-1 tome on a new registry. Repeat bounded live owner/independent-agent acceptance, approve public release and document revoke/rotate/recover incident procedures. No production deployment or privacy clearance is implied by local tests.

[Setup](../apps/agents/day-25-memory-cathedral/README.md) · [Evidence and limitations](DAY-25-AUDIT.md)

### Day 26 — Take One / The Credentialed Studio

- [x] Build an independent film-backlot studio with actual C2PA-signed PNGs, OpenAI image adapter, preserved signed upstream ingredients, B&W/copper/crop edits with parent manifests, public file-drop verifier, Jev gates, explicit IPFS publication and exact EIP-712 credential-drop minting. Verify real generated-wallet/funded Anvil deployment, mint/replay rejection, exact receipts, independently enrolled local-root trust and thirdweb NFT reads. OpenAI/Jev/Pinata in that test are provider doubles, not production evidence.
- [ ] **Configure the test workspace first:** Supabase Session pooler **SUPABASE_DATABASE_URL**, private generated **OPERATOR_TOKEN**, creator EOA **OWNER_ADDRESS**, **CHAIN_ID=84532**, Base Sepolia **RPC_URL**. Verify actual private database persistence/row locking, backup/restore and private prompt/media retention. The studio is one private creator workspace; the verifier is public.
- [ ] Enable **OpenAI Images API billing/access**, set **OPENAI_API_KEY/OPENAI_IMAGE_MODEL**, and configure **JEV_API_KEY** for TypeSafe System One. Test one bounded real generation plus Jev allow/deny/uncertain/outage, generation cost limits and durable daily review budgets. No paid provider calls have been made by this build.
- [ ] Obtain a C2PA-compatible **ES256 leaf+issuer certificate chain** and matching **P-256 PKCS#8 private key**. Set one-line base64 **C2PA_SIGNING_CERT_PEM_BASE64/C2PA_SIGNING_KEY_PEM_BASE64**, independently reviewed **C2PA_TRUST_ANCHORS_PEM_BASE64**, and optional approved **C2PA_TIMESTAMP_URL**. Verify certificate profile, private key custody, expiry, revocation, timestamp policy and independent-reader behavior. Local practice certificates are not trusted public identities; adding a local root does not establish public trust-list enrollment.
- [ ] Configure scoped public-file **PINATA_JWT** and unified **THIRDWEB_SECRET_KEY**. Verify actual signed PNG and metadata IPFS upload plus independent gateway byte-for-byte read-back before permit issuance, external retrieval/retention and upload-failure recovery. Approve public content/credits and provider billing. No browser thirdweb client key or USDC funding is required.
- [ ] Deploy and verify **CredentialedStudio(admin, verifier)** on **Base Sepolia**. Pin **STUDIO_DROP_ADDRESS/STUDIO_DROP_CODE_HASH** to the actual verified runtime; set dedicated unfunded **STUDIO_MINT_SIGNER_PRIVATE_KEY** matching `verifier()`. Fund only creator/deployer test ETH. Review admin ownership, pause/verifier rotation, immutable URI and domain/recipient/hash/replay constraints. This is a custom gated ERC-721 using unified thirdweb reads, not an unmodified prebuilt NFT Drop.
- [ ] With synthetic content, run real image generation → embedded C2PA read-back → signed edit/ingredient timeline → Jev review → explicit public Pinata publication → creator-wallet mint → two-block exact receipt → file download/IPFS retrieval → independent public verifier and another C2PA reader. Test changed recipient/network/calldata, expired permits, duplicate claims, transaction uncertainty/restart and pending recovery. An intact signature is not proof of depicted truth, legal copyright or human identity.
- [ ] Obtain independent contract/signer/content/privacy review and resolve inherited dependency advisories. Define certificate trust/revocation operations, public IPFS retention, prohibited-content handling and budget/admission policy. Add platform IP/body/time limits before public verifier exposure; cookie-only rate limiting is not sufficient. Export before the 12-take / ~24 MB project bound, or implement reviewed object storage/indexing before scaling.
- [ ] After provider/testnet rehearsal, host the independent app over **HTTPS** with exact **PUBLIC_ORIGIN**, private secrets, enough request time/memory and correct native C2PA/Sharp binaries. Verify clean frozen installation, target-OS standalone/container operation, platform upload limits, Supabase restore, public/private route boundaries, mobile/browser wallet/file-download behavior and hosted CI. Vercel ingress limits may be below the app's 8 MB cap; Docker includes OpenSSL for practice certificates.
- [ ] Deploy a separate **Base 8453** drop/database/environment after test acceptance. Repeat bounded real generation/publication/mint/verification, record actual provider/chain evidence, approve public release and monitor provider spend, certificate expiry/revocation, trust bundle updates, IPFS availability, mint permits/receipts, ingress and backups. Rehearse contract pause/verifier rotation and recovery.

[Setup](../apps/agents/day-26-credentialed-studio/README.md) · [Evidence and limitations](DAY-26-AUDIT.md)

## Shared release blockers and evidence

- [x] **Day 26 local regression:** 26 independent production builds and 26 production HTTP workflows pass. Native C2PA generation/edit/verification, funded Anvil credential-drop mint and exact receipts pass. Desktop and 390px mobile browser checks pass; the copied standalone runtime outside the repository passes its full workflow. Frozen pnpm install passes; ordinary application tests: 262 passed / 23 opt-in skipped; Foundry: 177 passed. Paid providers, actual Supabase, public-chain minting and target-OS containers remain separate release evidence. Patched Sharp 0.35.5 avoids added image-processing advisories; inherited 6 high / 1 low findings remain.

- [x] **Day 25 local regression:** independent production build, all 25 production HTTP/workflow/receipt checks, browser encrypted library/search/grant/decrypt/revoke and signed funded Anvil acceptance pass. A unique private local operator token was generated; keys/secrets are excluded from Git. Published [PR #22](https://github.com/EverEye-El/dapptober-agents/pull/22), stacked on open PR #21. Hosted baseline `c757920` passed [all 28 jobs](https://github.com/EverEye-El/dapptober-agents/actions/runs/40217016241). The subsequent recovery/race fixes have local acceptance and need final hosted verification; baseline evidence does not certify later commits.

- [x] **Day 24 local regression:** all 24 independent production HTTP/page/API/workflow/receipt checks pass; new funded Anvil mutual acceptance passes. Browser and production evidence are recorded in the Day 24 audit. Published [Day 24 PR #21](https://github.com/EverEye-El/dapptober-agents/pull/21), stacked on open PR #20. Day 24 hosted verification is now complete: final `37fd625` passed [all 27 jobs](https://github.com/EverEye-El/dapptober-agents/actions/runs/40105743399), including 24 standalone app containers, two worker images and shared/local-chain checks. A unique local Day 24 operator token was generated with private file permissions and Git exclusion; existing values were preserved.

- [x] **Day 22 hosted verification:** [PR #19](https://github.com/EverEye-El/dapptober-agents/pull/19) final implementation `ee98fde` passed [all 25 CI jobs](https://github.com/EverEye-El/dapptober-agents/actions/runs/39815167719): shared/local-chain checks, 22 standalone app containers and two worker images. GitGuardian passes. No merge or production release is implied.
- [x] **Day 23 hosted verification:** [PR #20](https://github.com/EverEye-El/dapptober-agents/pull/20), implementation `431041d`, passed [all 26 CI jobs](https://github.com/EverEye-El/dapptober-agents/actions/runs/40046974363): shared/local-chain checks, 23 standalone app containers and two worker images. No merge or production acceptance is implied.

- [x] **Hosted CI and containers:** October 21 full reruns passed for [PR #16 — 23 jobs](https://github.com/EverEye-El/dapptober-agents/actions/runs/39486891036) at `4791f47`, [PR #17 — 23 jobs](https://github.com/EverEye-El/dapptober-agents/actions/runs/39533455898) at `1e51d81`, and [PR #18 — 24 jobs](https://github.com/EverEye-El/dapptober-agents/actions/runs/39646547429) at `5fe7815`. This includes the shared test/local-chain checks, each app's standalone container/workflow checks and both worker images. These successful reruns supersede the earlier zero-step billing failures for those commits. Documentation follow-ups do not change the identified implementation evidence; live deployment and provider acceptance remain separate.
- [x] **Security patch pass:** update workspace Next.js 16.4.0 to 16.4.3 and compatible vulnerable ranges of Zod 4, undici 6, ip-address 10, body-parser 2 and fast-uri 3; bind the dstack SDK to its declared Noble 1.x compatible peer. Full workspace regression/build evidence is recorded in Day 23's audit.
- [ ] **Remaining dependency advisories:** October 25 production audit still reports **six high and one low** findings involving **TOML 4**, **transitive Zod 3** and inherited **elliptic**; zero critical/moderate. Review upstream-compatible TOML/Zod major migrations and obtain independent assessment or an upstream-vetted elliptic fix before production. Earlier October 20 audit counts are historical, not current clearance. Secret/dependency scanning remains enabled.
- [ ] **Live acceptance:** no public deployment, funded public-chain acceptance, actual Supabase service, paid-model request or real chat delivery was established by the engineering pass. Testnet rehearsals, local fixtures and read-only public-chain evidence remain separate from production acceptance.

## Keeping this tracker current

Update the relevant checkbox in place when work is verified. Split mixed implementation/live tasks instead of leaving completed engineering inside an unchecked launch task. Keep one current entry per task; use existing audits and Git history for detailed historical runs. Add a section for each new day, preserve unresolved gaps, and update shared work when it affects earlier days.

For live evidence, record the day, date, commit, environment, hosted origin, chain/contract addresses and transaction/provider references beside the completed task or in its linked audit. Never store secrets here. A reviewed, tested local implementation is progress; it is not a production release.
