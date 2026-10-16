# Day 16 final audit — Brass

Status: local implementation and integration verification; live production acceptance remains open. Date: October 16, 2026.

| Canonical requirement | Implementation | Evidence / boundary |
| --- | --- | --- |
| Buyer discovers agent cards | Published well-known cards, three demo desks; real reviewed catalog and pinned A2A interface/skill/identity params; onchain ERC-8004 wallet verification | Unit/card tests, A2A HTTP card read, browser desk selection. Local registry is a deliberate fixture; no live registry claim |
| Structured offer/counter/accept | Bounded buyer mandate, six rounds, typed Jev accept/counter/reject, fixed brief hash, exact signed terms, expiry; uncertainty acknowledgment | Unit tests for unsafe inputs, budget/deadline rejection, counter/accept, provider failure and threshold. Genuine Jev acceptance requires keys |
| Agent-to-agent protocol | A2A 1.0 HTTP+JSON SendMessage and GetTask, Task status/history/artifact, per-seller bearer, durable idempotency/namespace, context continuation validation | Actual HTTP request/response in funded Anvil case; direct production-route unit test verifies cached retry, changed-ID rejection and GetTask shape. Full optional A2A operations/streaming not claimed |
| Escrow settlement | Seller EIP-712 Offer, owner-wallet exact USDC approvals/open, seller-signed Delivery, explicit owner confirmation; refund/dispute/review release/arbitration timeout | Eleven Foundry cases with 256-run conservation fuzzing, actual funded Anvil adapter lifecycle. No public-chain deployment |
| Human-readable live transcript | Buyer/seller offers, time, price/deadline, source/confidence, settlement actions, inspectable terms/output/receipts | Browser full counteroffer→agreement→fund→deliver→confirm flow; receipt integrity tests; simulated evidence labeled |
| Independent product | Own app/env/port3016/standalone build/Vercel target16, reusable @dapptober/bourse | Production build/HTTP evidence recorded below; no other day server required |
| Security/controls | Owner-only funding/release, immutable order cap, fixed parties/token/arbiter, no admin withdrawal, pause only new funding, exact mined receipt validation, identity recheck, RPC preflight, finite archives | Contract/unit/local-chain failure cases; hosting ingress, private Supabase, independent contract review and live custody remain operator tasks |

## Explicit limits

- Local Jev/OpenAI/registry doubles are not live provider evidence. Demo desks/outputs/balances are simulations with no fabricated public transaction hashes.
- Local seller v1 uses EOA signer keys; client EOA signature verification currently excludes ERC1271 seller wallets, despite contract SignatureChecker supporting them. Enroll EOA sellers or implement and test contract-wallet client verification before extending enrollment.
- Curated private seller floor, single buyer/operator workspace. Separate bearer token per seller; no public multi-tenant auth/market-wide registry crawler. Remote agents must implement the Bourse extension, not merely generic A2A.
- Research/data fulfillment uses supplied material only, no arbitrary external tool/web access. Text output is hash-bound, not independently quality-proven.
- No background keeper/indexer. Review windows must be monitored: release after 24h, dispute fallback split after 7d. Arbiter resolution uses the resolver wallet directly, not a model.
- Exact approvals can remain if later escrow funding is abandoned/expired. Revoke unused allowance directly. Pending/replaced/reverted transactions may need direct onchain reconciliation; never blindly resend.
- Seller task storage is separate from buyer state, keyed by a hash of operator namespace plus seller ID to avoid identity-ID collisions. Supabase live concurrency/restart/backups still require acceptance. Archive caps require evidence export/rotation.

## Validation

Local release checks are appended after execution. Hosted CI/container results and public-chain/provider acceptance must be verified separately. See the ordered Day 16 production checklist in PROJECT-COMPLETION-TRACKER.md.

Final local results: frozen pnpm install passed; lint/typecheck passed; **121 application tests passed** (13 separately enabled chain cases skipped in the default suite); **92 Solidity tests passed**, including 11 Bourse cases and 256-run conservation fuzzing. The separately enabled **Day 16 funded Anvil + A2A HTTP case passed** with actual EIP-712 verification, identity-change rejection, missing-confirmation and unrelated-receipt rejection, signed delivery anchoring and USDC payout. Earlier local-chain cases were not re-run in this release; earlier app regression coverage passed through shared tests and all sixteen production HTTP workflows.

**All sixteen independent production builds passed; all sixteen fresh production HTTP workflows passed.** The first HTTP run caught the missing common receipt-verification action; it was added and the complete HTTP suite then passed. Day 16 final build also passed after UI additions. Browser checks verified counter/accept, raw simulated distributions, funding/release disabled until explicit acknowledgment, actual demo state changes, output review and reload persistence. 390px responsive check showed viewport/content width both 390px; desktop restored. [Browser evidence](day-16-browser.png).

`pnpm readiness 16` correctly reports blocked real configuration (demo mode, missing credentials/registered wallets/deployment and final HTTPS). Production dependency audit reports one inherited **low** advisory, no moderate-or-higher findings. Hosted CI/standalone Docker verification and genuine providers, Supabase and funded public Base networks remain unverified here.
