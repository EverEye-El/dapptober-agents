# Day 11 final audit — October 11, 2026

Canonical requirements: complete GPU Night Market prompt in `prompts/dapp-prompts.ts`. Primary architecture and final-audit instructions: `MasterPrompt-DapptoberAgentsBuild.md`. New branch: `codex/day-11-gpu-night-market`. The live Dapptober challenge fetch failed; no unverified page requirements were substituted. [Research](DAY-11-RESEARCH.md) records official protocol references and the supplied graphic.

| Prompt requirement | Implementation | Verification / limit |
| --- | --- | --- |
| Capacity listings: model, VRAM, price/minute | Provider-wallet onchain listings, chain-refreshed pricing/slots, reviewed worker bindings and health observations | Contract listing/capacity tests; UI stalls. Specs are declarations, not hardware attestation. |
| Human and agent inference buying | Exact wallet approval/book previews; dedicated buyer API with owner-set contract caps, provider allowlist, Jev admission and fit-weighted ranking | Demo tests and funded Anvil human/agent cases; no real provider key or public chain claimed. |
| Escrow released on output hash | GpuNightMarket locks USDC, snapshots input/model/price, reserves slots; assigned provider-only delivery pays full reserved-minute charge | Actual Anvil escrow/payout, input/output commitments and contract tests; hash delivery is not answer correctness. |
| Expired or failed job handling | Permissionless timeout refund to original buyer; pause blocks new bookings while preserving delivery/refund | Time/authorization/duplicate/pause tests; real local-chain refund and USDC balance reconciliation. |
| Agent bidding API | Authenticated POST /api/bids, typed model/prompt/minutes/budget/VRAM input and hard constraints | Local HTTP workflow; real API shares the funded chain adapter; no unbounded agent wallet authority. |
| Uptime/reliability/Jev ranking | Observed health samples, onchain completed/failed totals, explicit unrated prior, Jev confidence gate and policy-fit multiplier | Deterministic evidence/risk/cap tests; public proof of reputation/Sybil resistance is not claimed. |
| Lantern-lit active stalls | Copper industrial market, hanging lanterns/racks, busy illumination, input/job ledger/receipts, supplied Day 11 art | Browser seeding → reservation → delivered output; narrow layout inspected in saved screenshot. |
| DePIN compute and WebSockets | Actual provider Node HTTP/Ollama transport, signed Base delivery, durable outputs, public WS status, GPU-worker Docker and Akash SDL | Actual worker HTTP + WS test with explicit local Ollama fixture. No funded Akash lease or actual GPU inference was performed. |
| Composable, independent app | Shared @dapptober/compute capability; own port 3011/configuration/API/Vercel/Docker boundary | Independent build and workspace regression checks. No daily-server runtime dependency. |

## Security/failure review

Owner/token/RPC checks reuse the Base network layer. Dedicated agents have per-job/gross daily caps, expiry, allowlisted providers and revocation; renewing a plan does not reset spending. Contract replay, price movement, capacity, self-dealing, zero/missing job, foreign delivery, deadline and duplicate terminal action constraints are tested. Hash delivery immediately pays the provider; no result-validation or quality-dispute guarantee is advertised.

Provider URLs/tokens are private reviewed config, cannot come from job input, reject credential/query URLs and redirects, and are not exposed in market state. Public WS only controls brightness/status telemetry. Provider rejects unauthorized, wrong-input, foreign-provider, expired and terminal jobs. It persists output before delivery, serializes chain sends, verifies cached integrity, and returns paid-job cache without rerunning inference. App can recover a paid output even after a missing response. API errors leave error receipts; they do not fabricate rollback of real chain transactions.

Limits: 100 providers/1,000 lifetime contract jobs, 16 configured endpoints, 8,000 prompt characters, 32,768 output characters, 512 generated tokens, 1–60 reserved minutes, five-minute delivery grace, 30 API actions/minute/operator. Implement scalable indexing and a larger contract design before reaching bounds. The product is a single-operator control room; multi-tenant public custody and semantic correctness arbitration remain separately scoped work.

## Verification evidence

Application tests: 87 pass, with eight local-chain cases skipped in that suite and run through their own harnesses. Solidity: 52 pass, including eight new compute tests and 256-run escrow conservation fuzzing. The real local compute test verifies provider HTTP authorization, wrong-input rejection, WebSocket messages, agent reservation/delivery/payout, cached retry/recovery, expiry/refund, human exact approval/book prompt retention and a second delivery. Jev and Ollama responses in the local-chain test are explicit doubles.

Earlier wallet/passport/MCP/treasury, senate, forecast and checkpoint Anvil integrations were rerun and passed. All eleven production builds pass. All eleven fresh production page/API/workflow/receipt checks pass. Hosted CI status must verify the pushed commit separately. Local Docker execution was unavailable; hosted CI includes the app and worker container builds. Browser evidence: [verified market screenshot](day-11-browser.png).

## Remaining production requirements

Actual Supabase/Jev access; Base Sepolia then Base market deployment/owner-token verification; dedicated buyer/provider funding and signer review; real Akash GPU lease and independently reviewed pinned images/model/hardware; private worker token, persistent output backups and TLS/WSS; provider listings/allowlists/caps/expiry; genuine paid GPU inference and funded delivery/refund/pause/cap/replay acceptance; contract/security review; output/privacy/retention policy; monitoring/lease-expiry procedures; scale/indexing and hosted CI/release sign-off. See the ordered [Day 11 completion checklist](PROJECT-COMPLETION-TRACKER.md).
