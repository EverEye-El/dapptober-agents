# Canonical prompt → acceptance criteria

| Day | Functional criteria | Evidence required |
| --- | --- | --- |
| 01 | Connect owner; create thirdweb smart account; scoped session grant with token/recipient allowlists, expiry, daily cap; typed chat tools; readable preview; Jev approve/fit/confidence; small/large model routing; human signature on low confidence; revoke; balances and receipts | Workflow/policy tests; smart-account adapter typecheck; cap/expiry/revoke/cosign contract tests; app build |
| 02 | Useful premium dataset; unpaid 402; exact USDC x402 verification+settlement; agent auto-signs and retries; pricing, revenue and toll log; Jev tier/eligibility/abuse before challenge | HTTP protocol tests; rejection/replay/budget tests; official SDK adapter typecheck; app build |
| 03 | Registry metadata name/endpoint/capabilities/owner; signed job-linked feedback; validator attestations; searchable directory; trust tier and authenticity Jev gate; machine-readable query | Signature/replay/self-feedback tests; registry contract tests; app build |
| 04 | USDC escrow create→list→claim→work→submit→approve→pay; real MCP list/claim/submit; dispute/refund/timeout; leaderboard; capability matching and risk gate every tool call | MCP client/server integration; lifecycle tests; escrow authorization/payment/dispute/timeout contract tests; app build |
| 05 | Flight plan max allocation/min liquidity/risk/transaction cap; contract policy; live ERC4626 rate sampling; proposed/executed actions and reasoning; disengage/withdraw all; Jev pre-screen/routing | Policy/rebalance/paused tests; treasury contract cap/liquidity/risk/pause/withdraw tests; app build |
| 06 | NL explicit max spend/min receive/deadline; preview/simulation before confirmation/signature; EIP712; CoW order submission and status; solver competition; filled/expired/cancelled history; Jev validation before sign | Parsing/limits/signature/solver/failure tests; official CoW schema tests; app build |

Suggested vendors are substituted only where justified in RESEARCH.md. Local transactions/signatures/payments/attestations carry `mode: demo` and simulation IDs, never fabricated chain hashes.

## Day 07 extension

See [Day 7 research](DAY-07-RESEARCH.md), [application and worker deployment](../apps/agents/day-07-glass-box-mind/README.md) and [Day 7 audit](DAY-07-AUDIT.md). Shared `packages/inference` provides signed model/input/output receipts, strict Intel DCAP and workload/model appraisal, opt-in sharing and owner-wallet onchain commitments. The independent verifier page checks ECDSA locally; hardware appraisal requires current Intel collateral and independently approved measurements. Demo keys and historical fixtures never confer hardware trust. Jev receives verification facts and cannot override failed cryptography. No other daily app server is required.

## Day 08 extension

[Research and acceptance](DAY-08-RESEARCH.md), [independent setup/deployment](../apps/agents/day-08-swarm-senate/README.md), and [final audit](DAY-08-AUDIT.md). Shared governance capabilities provide member-signed value mandates, two-round debate, Jev review/model routing, public transcript persistence, provisional delegate votes and onchain human overrides. OpenZeppelin GovernorCountingOverridable with VotesExtended prevents duplicate snapshot weight; a contract-enforced final window blocks agent votes while humans retain authority. Symbolic policy resolutions cannot transfer funds. No Snapshot, ElizaOS or other daily app server is required at runtime.

## Day 09 acceptance

See [Day 09 README](../apps/agents/day-09-forecast-colosseum/README.md) and [audit](DAY-09-AUDIT.md). Deploy `ForecastColosseum` with verified six-decimal USDC, the official UMA OOv3 oracle, `ASSERT_TRUTH2` and at least a two-hour live liveness. Verify whitelist/identifier/minimum bond/dispute support; configure private owner/operator, PostgreSQL, HTTPS, Jev/AI and narrowly funded agent wallet. Register caps before trading. Verify both lanes, oversize rejection, cutoff, bonded assertion, real oracle dispute and settlement, calibrated rankings, duplicate-claim rejection and USDC balances on the public chain. Testnets and the local oracle double do not establish production DVM evidence. Payouts remain available when trading is paused; stakes are locked until settlement, unasserted stale refunds are permissionless after 30 days, pending disputes cannot be bypassed. Independent contract review and ongoing oracle monitoring remain release tasks.

## Day 10 acceptance

- A fresh private human proof verifies once; canonical duplicate proofs from another session/wallet fail. Wrong RP-context nonce/action/signal/environment/issuer, expired/replayed challenges and provider outages fail closed.
- Passkeys attach only to verified humans. Correct RP/origin/challenge/signature/user verification returns the same human and claim history; incorrect or replayed authentication fails.
- ERC-8004 signatures open only the labeled agent API; registry authority changes remove access. Guests and agents cannot read human messages, register human passkeys or claim rewards. Body-supplied lane/action cannot override `/api/agents`.
- Jev moderates/scores/routes from minimal facts; it cannot override proof/lane checks. Actual AI/provider behavior requires live credentials.
- A fixed funded reward pays its bound wallet once. Replay, recipient/signer/domain changes, expired voucher and paused/unfunded contract are rejected; failed unfunded transfer does not burn claim uniqueness. Confirmed receipts match the exact claim event.
- Independent production build, full HTTP workflow, copper desktop/mobile UI and standalone public asset inclusion pass. Live release additionally requires production World ID, actual authenticator/registry/database/Jev/AI and public-chain claim evidence.
