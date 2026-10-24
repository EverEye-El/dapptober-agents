# Day 24 — Umbra Mutual / The Agent Mishap Mutual

A copper Victorian underwriting office for costly agent mistakes. The complete canonical Day 24 prompt drives reputation-priced cover, pooled capital, committed incident evidence, Jev assessments and member-approved payouts. The preserved `2026SocialPosts/36-day-24.png` supplies the ledger/wax-seal inspiration.

## Run independently

Use pnpm 10.2.0 from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm readiness 24 --init
pnpm dev 24
pnpm build 24
pnpm start 24
pnpm exec vitest run tests/day-24.test.ts tests/day-24-api.test.ts
pnpm test:mutual-chain
```

Open http://localhost:3024. Private configuration belongs in this app's `.env.local`; read the comments in `.env.example`. Deploy its Vercel configuration or root Dockerfile with `APP=day-24-agent-mishap-mutual`. No other daily server is needed.

## Shared capability and workflow

`packages/mutual` exports deterministic practice accounting, typed Jev review, evidence commitments, verified contract reads/unsigned transaction preparations and a Snapshot discussion adapter. Supabase persistence, authorization and hash-linked receipts reuse the existing platform. No server spending key or OpenAI/thirdweb credential is required.

1. Members deposit USDC for nontransferable risk-bearing shares. Premiums increase share value; approved losses reduce it. There is no external yield farm or guaranteed APY.
2. Registered ERC-8004 owners request cover for an agent with a registered wallet. Trusted `quality` feedback (at least three entries) sets the base rate; sparse feedback receives 10%. Positive scores cap at 100, reducing the base to 2%; previous paid claims add up to eight 1% surcharges, with a 10% total ceiling.
3. Seven-day policies cost an upfront premium and reserve their entire limit. The first hour is a waiting period. Agent wallet and beneficiary freeze at purchase; NFT transfers cannot redirect cover.
4. The claimant commits logs, trace, loss explanation and incident transaction. Live RPC checks establish canonical mined transaction, frozen agent sender, three confirmations and covered timestamp. Logs/traces and claimed loss remain assertions for members to assess; the app does not independently prove causal loss or fetch a debug trace.
5. Jev receives only explicitly consented evidence and actual RPC facts, returning typed approve/deny, confidence and sufficiency. The UI requires a review before preparing a vote. Jev is advisory; direct onchain ballots have no model veto.
6. Members vote using capital at the policy's previous-block snapshot. Claimant capital is excluded. A three-day ballot needs 30% eligible quorum and a strict yes majority; ties/no quorum deny. Permissionless settlement creates an exact beneficiary credit; the beneficiary signs its pull payout.

## Contract and economic boundaries

Deploy `AgentMishapMutual(token, identityRegistry, reputationRegistry, guardian, trustedReviewers)` on Base Sepolia 84532 first, Base 8453 separately after acceptance. Both networks enforce Circle USDC. Verify the actual ERC-8004 registries and that Reputation points to Identity; choose 1–16 unique trusted reviewers with reviewed `quality` scoring. Day 03's custom AgentPassport is not automatically an ERC-8004 registry substitute. Pin the exact deployed runtime hash including immutable values in `MUTUAL_CODE_HASH`.

The guardian can pause new deposits/underwriting; it cannot drain funds, decide claims or block voting/settlement/exits/payouts. Capital withdrawals lock globally while any policy reserve remains. New deposits bear existing losses without obtaining historical votes. Underwriting and deposits close seven days after deployment. Cover lasts seven days, filing grace three days, voting three days; expire unused policies and settle every filed case to release capital. Maximum 200 policies/one claim each. This finite season prevents perpetual new cover from trapping exits; it requires a separately reviewed next-season migration, not automatic renewal.

Approved beneficiary credits are excluded from capital NAV. Virtual assets/shares and minimum-output protections constrain rounding; exact USDC allowances and premium limits constrain purchases. Same-block capital changes cannot precede underwriting. Only an approved incident consumes the duplicate-payout identifier; parallel claims can be filed, but only the first qualifying settlement pays. No governance system proves that differently labeled incidents represent different underlying losses. Whale collusion, malicious reviewers, fabricated logs and governance fraud remain underwriting risks requiring independent review and operating rules.

## Real configuration and signatures

Set `AGENT_MODE=real`, `SUPABASE_DATABASE_URL` (Supabase Connect → Session pooler), `OPERATOR_TOKEN`, Base RPC/chain/Circle USDC, pool/runtime hash, registry addresses and `JEV_API_KEY`. Set the exact hosted origin at deployment. Optional `SNAPSHOT_SPACE` enables real Hub proposal verification; it needs no Snapshot signing secret.

This is a **private operator office**, not a public member authentication service. The operator token protects all live reads/writes/evidence. Individual members still sign their own browser wallets. Token is held in UI memory. Shared state has bounded request/model rates; provider review runs outside the final database transaction. Preparation, chain refresh/reconciliation and Snapshot verification can hold that lock during bounded network requests. Add ingress limits and measure production load. Verify actual Supabase persistence and restore before hosting. Onchain policy/evidence hashes and evidence URI are public; private JSON requires office authorization. Redact secrets and personal data before committing or sharing with Jev.

Live actions simulate then prepare exact unsigned contract calls. If allowance is missing, the app returns a separate exact USDC approval; prepare again after it mines. Financial previews require explicit confirmation. One unresolved submission blocks the next preview. Reconcile exact sender/recipient/calldata/value, post-preview block, three confirmations and duplicate hash; reverted receipts are recorded too. The 120-second preview is an application freshness limit, not a contract transaction deadline. After uncertain submission, reconcile the hash instead of retrying. Discard requires the operator's explicit assertion that nothing was sent; it is not cryptographic proof and cannot cancel a pending wallet transaction.

## Snapshot

Binding voting is the contract's frozen-capital ballot. Snapshot is an optional **discussion mirror**, never payout authority. Create a proposal manually in the configured space with the policy's snapshot block and the exact binding printed in the claims office:

```text
umbra:CHAIN_ID:lowercase_pool:claim_id:evidence_hash
```

The adapter checks Hub space, Base network, block and evidence binding, then exposes the actual proposal/link. Review the space's voting strategy and eligible weights separately; advisory scores are not counted by the contract. Base Sepolia uses the testnet Hub, Base the production Hub. Snapshot publishing/signing and automatic strategy deployment are not implemented or claimed.

## Evidence and release

Practice role switching, balances, time travel and reviews are explicitly synthetic. Local Anvil acceptance deploys actual contracts and funded generated wallets, executes premium/stake/ballot/credit/payout/exit transactions and exact receipt reconciliation. Registry, database and Jev fixtures remain doubles; the incident transaction tests provenance, not real causal financial loss. Public-chain wallet/provider/Supabase/Snapshot acceptance remains outstanding.

Tests and criterion mapping: `docs/DAY-24-AUDIT.md`. Ordered deployment/funding/security/hosting work: `docs/PROJECT-COMPLETION-TRACKER.md`. Review terms/exclusions, evidence retention, regulated insurance obligations and independent contract security before meaningful funds or public release. Export/index history before the 200-policy capacity; the bounded full-chain reader is not a production indexer. No unattended keeper is supplied; operators/members must settle/expire cases.
