# Day 28 audit — SPILLWAY

October 28, 2026. Branch: `codex/day-28-per-second-waterfall`, based on Day 27 `6b972e5`. Day 27’s PR remains the parent; no main push or merge is authorized/performed. Original prompt → requirements → implementation → test → build was reviewed, with demo, protocol-double, genuine fork and public release evidence kept separate.

| Original requirement | Implementation | Verification / scope |
| --- | --- | --- |
| Fans pay creator while watching | Creator lease, visible-room heartbeat, ambient sample or publisher-provided HTTPS video; pause/leave requests stop | Integer-second/heartbeat/leave tests; browser start/pause; actual media hosting/codecs remain publisher responsibility |
| DAO salaries / contributors | Fixed receiver/rate channels with bounded requested leases | Demo browser and engine; Solidity authorization, replay, funding/withdraw, expiry |
| Agent pays compute only for job lifetime | Shared operator queue; gas-only agent; bounded SHA-256 worker; completion requests stop | HTTP keeper durable signing/broadcast/reconcile/job-stop acceptance on Anvil double and genuine Superfluid fork; no AI inference claim |
| Create/pause/top-up and live balances | Separate exact approvals/wrap/fund/start/stop/withdraw wallet instructions; sender/receiver index; estimated ticker | Browser custom-channel creation/funding/job/reload; exact USDC6/USDCx18 conversion and receipt test; limits reject invalid inputs |
| Superfluid / USDC / Base | Official Base Sepolia/Base host/forwarder; exact underlying/decimals check; three runtime pins; custom constrained sender channels | Genuine official factory-created SuperToken and official CFA forwarder on local Base Sepolia fork, with disposable local six-decimal underlying. No public Circle-USDC transfer or production deployment |
| Jev policy / balance and allowance | Typed continue/pause >=90%, hard prechecks, durable 200-start/day quota, outage fails closed; zero top-up allowance cannot debit wallet | Provider-double allow/outage + engine allowance/reserve tests; real paid Jev acceptance remains open |
| Liquid / calm / flowing light | Cropped supplied Day 28 art, copper manifold using Framer Motion, state-driven dashed current and ticking panels | Desktop UI walkthrough and reduced-motion branch; viewport evidence recorded below |
| Independently deployable / editable demo | Next standalone/Vercel, new shared persistence package, private visitor spaces and authenticated shared operator workspace | Atomic-file concurrency and restart/reload tests; production acceptance recorded below; actual Supabase/host remains unverified |

## Test evidence

- pnpm 10.2.0 frozen install passes. Lint and type checking pass. **290 ordinary application tests pass; 25 opt-in tests are skipped** in the ordinary suite. Separate local-chain acceptance is run explicitly, rather than counted as an ordinary pass.
- **199 Solidity tests pass**, including 13 new channel cases and 256-run conservation fuzzing. Automated tests are not an independent security audit.
- All **28 independent production builds** and **28 production page/API/workflow/receipt checks** pass. Day 28 is rebuilt separately after its final refinements.
- A **57MB copied standalone runtime outside the repository** passes the complete Day 28 HTTP workflow without a repository runtime dependency. Docker is unavailable locally; hosted Linux container verification remains separate until CI runs.
- The actual bounded compute worker produces a SHA-256 result, ends its practice payment, persists state and verifies receipts in the shared operator workspace.
- Desktop browser controls/reload pass with no reported browser warnings/errors. A **390×844 viewport** reports document width **390px**, with no horizontal overflow. Saved desktop/mobile screenshots accompany this audit.
- Hosted-demo readiness correctly reports missing persistent-host acceptance and final HTTPS origin on this local setup. It does not report the app as already released.
- Production dependency audit reports **6 high / 1 low**, zero critical/moderate, inherited TOML/transitive Zod3/elliptic findings. Framer Motion adds no finding in that audit; scanning remains enabled.
- Local-chain protocol double test passed. Exact wallet receipts reject unrelated hashes; six-decimal underlying wraps into eighteen-decimal SuperToken; enrolled gas-only agent streams, receiver accrues, owner stops and withdraws. Hash mismatch is rejected.
- Genuine **Base Sepolia fork** test passed using the official SuperTokenFactory, host and CFAv1Forwarder. It deploys a disposable local USDC fixture, creates a genuine SuperToken, wraps/funds/streams/stops/withdraws, then exercises queued jobs and persisted signed agent instructions through the real-mode HTTP handler. No public-chain funds are used. Jev responses in this test are explicit provider doubles.
- Browser created `Browser / copper compute`, topped it up, started a job, completed/stopped it and verified the custom channel/balance survived reload. Creator start/pause passed. These actions moved only practice balances.

## Security and financial audit

Channel owner controls funding/withdrawal. Fixed receiver/rate/maximum lease/lifetime funding ceiling/reserve are immutable. Dedicated agent can start only within these rules and stop; it cannot transfer to arbitrary addresses, withdraw or pull owner-wallet funds. Jobs cannot be replayed. Starts have a 90-second signing window, checked onchain. Caller authorization, actual buffer and balance are rechecked by contracts. Receiver can pause; expiry/reserve safety stops are permissionless. Owner revocation stops its channel immediately. Owner can intentionally call its own contract directly without the offchain Jev gate.

**No hard timestamp payment cap is claimed.** Superfluid flows continue until deletion. A delayed stop can spend beyond the intended lease and trigger protocol liquidation. The lifetime funding cap bounds total principal put into a channel, not exact per-job compensation. Real `funds consumed` includes any losses/fees/liquidation; it is not an exact audited receiver credit. Only demo receiver credits are exact local bookkeeping. Tickers estimate between chain snapshots.

One fork stress attempt observed a reverted stop receipt; subsequent fresh rehearsals pass, and signed keeper transactions now include explicit gas headroom. Reverted intents are reconciled as failures and eligible stops are retried by the next worker tick. Real-chain failure monitoring remains mandatory. Chain deadlines/heartbeat comparisons use chain time, and the final fork rehearsal includes a host clock skewed by one day.

The keeper commits signed bytes/hash before broadcast, retries identical bytes and waits two extra blocks. Stops/recovery bypass paid model quotas and do not wait on an unrelated unsubmitted owner-wallet instruction. One keeper/nonce stream is required; permanently stuck or externally replaced transactions require operator investigation. Two confirmations reduce but do not eliminate reorg risk. Losing DB metadata can lose job/creator classification, even though onchain channels can be re-imported. Backups remain necessary.

Per-deployment HMAC HttpOnly cookies isolate visitors and keeper roles. Mode/chain/workspace namespace separation prevents accidental cross-use. Same-origin POST, bounded bodies/stream/job counts, per-workspace action limits and durable policy quotas are enforced. Anonymous public hosting still needs infrastructure ingress limits. Supabase table RLS is enabled; access must be verified with actual roles. Local atomic-file mutex is single-process only. Session secret and real mode operator login are mandatory on hosted deployments. Export never exposes private agent key or raw signed transaction; the client sees its hash/status only.

## Remaining release work

No hosted public demo, genuine Supabase project, paid Jev access, public Superfluid/CircleUSDC deployment/funding, production keeper supervision, hardware wallet acceptance, independent contract audit or end-to-end Base mainnet run is established. Follow the ordered demo/live sections in [the tracker](PROJECT-COMPLETION-TRACKER.md). Demo release does not require all live-funds dependencies.
