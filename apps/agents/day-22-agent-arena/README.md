# Pitlane — Day 22 / The Agent Arena

Train an agent, back a fighter, and watch autonomous pilots battle through a three-round onchain minigame. Copper holographic colosseum, a Phaser replay, training gym, pooled USDC stakes and a seasonal ladder. This app runs independently on **3022** and compiles the shared `@dapptober/arena` capability into its own deployment.

## Run

Use Node 22.12+ and **pnpm 10.2.0** at the repository root:

```sh
pnpm install --frozen-lockfile
pnpm dev 22
```

Open http://localhost:3022 in Codex. Demo requires no keys. Five starter agents and two scheduled bouts appear. Synthetic crowd stakes make practice payouts meaningful. Back a side while its betting window is open, then **Run autonomous arena**. The visible tab polls the simulation. **Skip to next phase** advances only the demonstration clock. Pilots commit, reveal, score and settle without human move selection. Select rounds or an archived match to replay; claim any resulting practice credit.

Train a fighter in the gym: edit its instruction and strike/guard/feint weights totaling 100, then **Train & spar**. The sixty-bout benchmark is a repeatable practice evaluation, not a claim of learning or future profits. A scheduled match keeps its original strategy. Finish active bookings before **Book next fight**. Submit additional named fighters without executing user-supplied code.

Build `pnpm build 22`; serve `pnpm start 22`. Vercel settings are included, and the root Dockerfile accepts `APP=day-22-agent-arena`.

## Rules and payouts

Strike beats feint, guard beats strike, feint beats guard. Each of three rounds awards two points for a win or one each for a tie. A VRF-derived sigil gives one bonus point if a fighter selected that move. Highest total wins. Commitments bind all moves/salt to chain, contract, rules, match, side, fighter and the frozen strategy. Neither the user nor the animation chooses a winning agent.

Winning backers recover their stake and split **90% of the losing pool**; the trainer and house receive **5% each of the losing pool**. Returns shown in the slip are estimates at the current backing distribution, not fixed odds or win probabilities. Draws, oracle/commit timeout, no reveals or no winning backers refund all stakes with no house/trainer fee. A missing reveal forfeits to the revealing side after the reveal deadline. All funds become pull credits; claiming twice is prohibited. There is no administrator withdrawal of escrow.

Trainers may back their own agents before cutoff. Pilot wallets cannot wager. Policy honesty, independent custody and non-collusion are not proved by commit-reveal or Chainlink; do not market the game as preventing trainer/Sybil manipulation.

## Production setup, in order

1. Copy this app's detailed `.env.example` to its `.env.local` if absent. Preserve the unique generated private operator token. Keep **Base Sepolia 84532** for tests, and use separate keys/database/addresses for **Base 8453** production.
2. Supply the **Supabase Session pooler PostgreSQL URI**, dedicated Base RPC, billed **OpenAI project key/models**, and **TypeSafe Jev key**. Runtime creates a namespaced state table with RLS using the private server connection. Validate actual persistence, row locking, backups and restoration. Losing a reveal preimage can forfeit a match; encrypted operator backups are essential.
3. Create a **Chainlink VRF v2.5 subscription on Base Sepolia**, fund it with LINK, and obtain the official coordinator and lane hash from the linked documentation. There is no Chainlink API key. Constructor inputs: Circle USDC, house treasury, pause/enrollment guardian, VRF coordinator, lane hash, subscription ID. Deploy `contracts/src/AgentArena.sol` using the repository network-checked deployment wrapper and your own deployer; add the arena as a subscription consumer. Pin its independently verified runtime in `ARENA_CODE_HASH`. Verify coordinator code, request ABI and callback gas/configuration against the actual network.
4. Set real mode and connect an **EOA wallet**. Public read views require no operator token; private drafts, salts, signed worker bytes and unsigned wallet instructions are redacted. Use **Sync wallet** after a reload to authenticate and recover your own pending instruction. Each trainer/wager operation signs a short-lived, exact-action message containing origin/chain/input/nonce; the financial transaction separately requires wallet approval. Contract wallets/EIP-1271 authentication are not implemented. Register trainer-owned fighters with distinct gas-only pilot addresses. The guardian must **Enroll fighter** in the gym before it can enter matches. Guardian pause stops new registration/training/stakes/scheduling; reveals, settlement, refunds and claims remain available.
5. Add `ARENA_PILOT_KEYS_JSON`, keyed by fighter ID, matching those registered pilots. Fund pilot **ETH gas only**, and fund spectator/trainer EOA wallets with intended test USDC and gas. Pilots cannot stake or claim a backer's credit. Budget both native worker gas and LINK subscription charges. The app's per-pilot daily gas cap reserves worst-case cost before broadcast; this is an operational bound, not protection against a stolen EOA key. Keep pilot balances small and custody independent where practical.
6. Register/coach via this app so the worker has the frozen strategy preimages. A verified publish transaction stores them. Restore historical policies and private salts from backups after a restart; an imported onchain strategy hash alone is insufficient. Training quotas are five calls/wallet/day and 50/deployment/day. External coaching runs outside the shared database lock so it cannot hold up active matches. A missing preimage, gate refusal or local gas issue flags that pilot while other eligible pilots continue; an unresolved signed outbox remains a shared recovery boundary. AI calls fail closed if unavailable/uncertain; no synthetic live response is substituted.
7. Book approved fighters and launch the private worker: `pnpm worker:arena`. It authenticates with the operator token and automatically enables pilots. Each worker transaction is signed and durably journaled in one request, then broadcast in the next. Repeating the same raw transaction/hash does not choose a new move or nonce. Receipts require three confirmations. RPC/broadcast ambiguity remains pending for inspection; no automatic fee replacement or fresh randomness request occurs.
8. Verify the complete **funded Base Sepolia** lifecycle with independent trainer/spectator/pilot wallets: training publish, enrollment, scheduling, exact USDC allowance/stake, real VRF request/fulfillment, autonomous commitments/reveals, all score cases, ladder/replay, winner/trainer/house claims and refunds. Inspect a deliberate Jev refusal, stopped worker, reveal loss, dropped/replaced transaction, reorg, wallet rejection/reload, oracle delay and database restore. **Settle or refund after contract deadline** provides a permissionless wallet exit when the worker is unavailable.
9. Review game economics, collusion/custody, eligibility and public wagering release requirements with appropriate independent reviewers. Add ingress/IP limits, observability, privacy/retention rules, encrypted backups, RPC/indexer capacity and subscription/gas alerts. Then configure HTTPS/domain restrictions and perform hosted acceptance. Only afterward approve a small, separate Base mainnet acceptance budget and verify every live dependency again.

## Recovery and authority

Public user instructions are isolated per authenticated wallet. Preparing a financial instruction locks it until its existing hash is registered and the exact successful call is checked, or the user explicitly verifies no submission occurred. Recover a returned-but-unregistered hash from wallet history. Never assume a wallet timeout means no transaction was sent.

The private worker's signed outbox, strategy preimages and salts are **never returned in public views**. Only a prepared/broadcast hash summary is visible. A dropped/replaced or reverted worker transaction needs operator reconciliation of nonce, hash, contract phase and gas accounting before editing the outbox; no unsafe clear-and-retry endpoint is supplied. Pausing the worker while games are active can cause forfeits. Guardian pause does not arbitrarily void an active market.

House fees are fixed. New agents require guardian enrollment; match and VRF budgets cap at 24/day, four active bouts and one booking/fighter. Maximum 100 backers/match, 100 USDC total stake/wallet/match and 10,000 USDC/pool. At **200 matches**, use a reviewed archive/indexer plus a new season deployment; this version stops scheduling rather than silently losing old matches. Live snapshots can reorganize and are not economic finality. Public pages expose submitted prompts/weights and onchain game data; do not put secrets in coaching instructions.

## Verification

- `pnpm test`: weights, prompt gates, frozen strategies, autonomous simulation, caps, deterministic scoring, exact split/rounding, refunds, domain commitments and wallet authentication.
- `pnpm test:contracts`: Foundry tests and 256-run payout conservation fuzzing.
- `pnpm test:arena-chain`: actual funded Anvil stake/commit/reveal/settle/claim with generated wallets and durable signed pilot outbox. **VRF and Jev are explicitly fixtures**, not genuine Chainlink/AI acceptance.
- `pnpm readiness 22`: configuration report; it never deploys, funds or certifies a live service.

The small Solidity engine replaces the suggested MUD/Dojo stack to stay native to Base without another world service. [Research](../../../docs/DAY-22-RESEARCH.md) · [Audit](../../../docs/DAY-22-AUDIT.md) · [Completion tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md)
