# SPILLWAY — Day 28 / The Per-Second Waterfall

Creator sessions, DAO contributor pay and job-bound agent compute through Superfluid. An independent Next.js app on port **3028**, with copper refinery/waterfall motion inspired by `2026SocialPosts/40-day-28.png`.

## Run the saved demo

From the repository root:

```sh
pnpm install --frozen-lockfile
cp apps/agents/day-28-per-second-waterfall/.env.example apps/agents/day-28-per-second-waterfall/.env.local
pnpm dev 28
```

Preserve an existing `.env.local` rather than overwriting it. Local private operator/session values have already been generated in this checkout. On a fresh checkout generate **different random 32+ character** values for `OPERATOR_TOKEN` and `WATERFALL_SESSION_SECRET` using a password manager or `openssl rand -hex 32`. The complete app-specific example explains every field. No OpenAI or thirdweb key is used by Day 28.

Open `http://localhost:3028`. Three seeded channels demonstrate creator, contributor and compute uses. Start/pause, top up/withdraw, add/remove practice channels, advance time, change top-up allowance, export receipts and open the keeper desk. The creator room includes a labelled ambient visual; save an HTTPS video URL to watch your own hosted content. Pausing a video requests a stop. Video URLs load directly in the browser; do not put credentials in them. Media availability/codec support is the publisher’s responsibility.

Every visitor gets an isolated HttpOnly-cookie workspace. The keeper desk uses `OPERATOR_TOKEN` to open the deployment’s shared workspace. Refresh/restart preserves edits. Operator login intentionally switches to a different shared workspace, rather than copying visitor data. Rotating the token invalidates keeper cookies. Changing mode/chain/workspace ID changes the namespace. Demo money/Jev decisions are explicitly simulated; compute worker outputs are real bounded SHA-256 work, not AI inference.

`pnpm worker:waterfall` runs the keeper against the **shared operator workspace**. Log into that desk before queuing a job you want this worker to process. Visitor demo jobs can also be completed manually; they do not enter the operator queue.

## Host an editable demo first

1. Create a **Supabase** test project. Copy **Connect → Session pooler → PostgreSQL URI** into private `SUPABASE_DATABASE_URL`. This is not the Supabase anon/service-role API key. Use a private database role with access to the workspace table; the store creates `dapptober_workspaces`, enables RLS and uses transactional row locks. Never expose that URI through a `NEXT_PUBLIC_` field. Actual Supabase permission/backup acceptance remains an operator task.
2. Set `AGENT_MODE=demo`, `WATERFALL_POLICY=simulated`, `WATERFALL_STORAGE=supabase`, unique stable secrets and `WATERFALL_WORKSPACE_ID`. No RPC, wallet, Jev, deployment or token funding is needed for the demo.
3. Deploy this app directory with its Vercel configuration, or the root Dockerfile with `APP=day-28-per-second-waterfall`. Set `PUBLIC_ORIGIN` to its exact HTTPS origin. Build from root with `pnpm build 28`.
4. Create a channel, fund it with demo money, refresh, redeploy/restart and verify persistence; verify a second visitor is isolated and authenticated keeper edits survive. Confirm the table is inaccessible through public Supabase client roles, then test backup/restore and ingress limits.
5. Run `SMOKE_PORT_BASE=<port-minus-28> node scripts/smoke.mjs 28` against the hosted demo only when the origin/port matches your environment, or perform the same acceptance manually over HTTPS. The supplied smoke runner targets localhost; do not claim it tested an arbitrary remote origin.

For a persistent-disk host only, `WATERFALL_STORAGE=local` explicitly permits `.data/waterfall/`; mount and back it up, and run a single app process. The file store’s mutex does not coordinate multiple processes. Vercel/serverless must use Supabase. Both demo and real use the same durable abstraction. Earlier days are not silently migrated.

## Enable real streaming: Base Sepolia → Base

1. Use **Base Sepolia 84532** first, then independently repeat with **Base 8453**. Provide owner wallet address and chain-matched RPC. Fund owner gas and a small Circle USDC budget; never put its private key in app configuration.
2. Verify official Superfluid metadata and deployed bytecode. The adapter hardcodes the official host and CFAv1Forwarder for the selected Base network. Circle USDC is pinned by shared config. A predeployed test `fUSDCx` wrapping fake USDC is **not** interchangeable with Circle USDC.
3. Select an independently verified USDCx wrapper of that exact Circle USDC, or create one using the official permissionless SuperToken factory. `pnpm deploy:waterfall -- --prepare-wrapper` prints unsigned wallet calldata; it never broadcasts. Review metadata/source/upgradeability and send with your wallet, then read `SuperTokenCreated` from its receipt. This creates a wrapper, not free USDC.
4. Set `SUPERFLUID_USDCX`. Compile contracts (`pnpm test:contracts`), then `pnpm deploy:waterfall -- --prepare-factory` prints the SpillwayFactory creation payload. Deploy with a reviewed wallet/Foundry process. Set `WATERFALL_FACTORY`, then run `pnpm deploy:waterfall` to inspect protocol bindings and runtime hashes. Independently compare addresses/hashes/source and copy all three hash fields; a self-computed hash is not an audit.
5. Generate a dedicated **gas-only agent EOA**, set `WATERFALL_AGENT_ADDRESS` and private `WATERFALL_AGENT_PRIVATE_KEY`, and fund only its gas. Channels enroll this address at creation. The agent cannot withdraw funds, change rate/receiver/budget or top up from an owner wallet. A zero agent creates a manual-only channel; the automatic worker cannot operate it.
6. Configure billed **TypeSafe Jev** key and `WATERFALL_POLICY=live`, Supabase, stable secrets and exact origin. `pnpm readiness 28` reports missing live settings. It does not establish protocol acceptance. Set `AGENT_MODE=real` only when ready; live access requires keeper login.
7. Connect the configured owner wallet. Approve an exact **6-decimal USDC** amount to the wrapper; wrap with **18-decimal SuperToken upgrade**. Create a channel with immutable rate, receiver, maximum lease, reserve and lifetime funding cap. Approve an exact **18-decimal USDCx** amount to that channel, then fund it. No unlimited approvals are generated. Amount UI accepts up to six fractional nominal digits; rate/stream accounting uses 18 decimals.
8. Cover the actual protocol buffer **plus lease cost plus reserve** before starting. The real forwarder is queried for the buffer; do not assume a constant four hours in production. Wallet starts expire after 90 seconds; stale transactions revert and can be reconciled. Confirm exact sender/to/calldata/value, successful receipt and two additional blocks. A matching reverted receipt clears the saved lock and records failure.
9. Run one supervised `pnpm worker:waterfall` process every five seconds. Contributor/creator starts use owner-reviewed instructions. Compute jobs are queued after a typed policy approval; the gas-only agent starts their channel, performs bounded local SHA-256 work, records completion and submits the stop. The worker persists signed bytes/hash before broadcasting and retries those exact bytes after an uncertain response. It reconciles two confirmation blocks. Policy outages/exhausted start quotas never gate stops or pending transaction recovery. Monitor and back up the pending intent store; do not drop a pending signed transaction merely because a request timed out.
10. Rehearse heartbeat stop, job completion/failure, reserve stop, overdue lease expiry, owner/receiver pause, agent revocation, model deny/outage, transaction reverts, worker crash/restart, gas depletion, Supabase loss and reorgs with small Base Sepolia funds. Independently review the contracts before meaningful funds. Then deploy a separate HTTPS production app/Supabase environment and separate Base contracts; repeat funded acceptance and enable monitoring before release.

**Superfluid does not stop at a timestamp by itself.** Deadline, job completion, stale heartbeat and global pause require an included stop transaction. Worker downtime, RPC failure, chain congestion, missing gas or an unconfirmed earlier transaction can delay stopping and cause extra charges/liquidation. The whole channel balance is exposed to that protocol risk; a lease/reserve is not a guaranteed hard per-job payout cap. Receiver and owner can pause directly; anyone can expire an overdue lease or call `safetyStop` at the reserve threshold. An owner can revoke a channel’s agent authority and stop it in one transaction. Withdrawals require a stopped flow. Permanent channels can be emptied but not deleted.

The normal owner wallet can bypass the offchain Jev gate by calling its contract directly. Jev does not replace contract authority. The 200/day durable policy budget bounds new start requests; the approved job decision is reused for its exact fixed channel/lease, and the contract rechecks funds, duration, replay and signing expiry. Never use another automated process with the same agent nonce stream. Importing channels after losing app metadata labels them contributor channels; creator/job metadata requires database restoration.

## Verify

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm test:contracts
pnpm test:waterfall-chain
node scripts/waterfall-chain-test.mjs --fork
pnpm build 28
node scripts/smoke.mjs 28
```

The ordinary Anvil test uses deliberately named protocol doubles. `--fork` uses genuine official Base Sepolia factory/host/SuperToken/CFA forwarder bytecode with a **disposable local six-decimal underlying**, not public Circle tokens or public transactions. It also exercises persisted agent signing, broadcast/confirmation recovery and job stops through the real-mode HTTP handler. Neither establishes public-chain funding, genuine Jev responses, Supabase service or a released hosted app. See [research](../../../../docs/DAY-28-RESEARCH.md), [audit](../../../../docs/DAY-28-AUDIT.md) and the [completion tracker](../../../../docs/PROJECT-COMPLETION-TRACKER.md).
