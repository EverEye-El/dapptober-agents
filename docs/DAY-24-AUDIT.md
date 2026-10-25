# Day 24 final audit — Umbra Mutual

October 24, 2026. Canonical complete Day 24 prompt → implementation → tests → working production build. Primary research: [Day 24 research](DAY-24-RESEARCH.md). This records tested scope, not production clearance.

| Challenge requirement | Implementation | Verified evidence / limit |
| --- | --- | --- |
| Victorian insurance office | Copper/sepia serif ledger, umbrella seal, policy register and claims files; preserved Day 24 graphic | Browser and production page; no prior app server dependency |
| Reputation-priced cover | Verified ERC-8004 Identity/Reputation, trusted quality feedback and paid-history pricing, frozen agent wallet/beneficiary | Unit and Solidity pricing/owner-transfer tests; actual Anvil registry fixtures, not live registry acceptance |
| Capital staking/yield | Nontransferable historical shares, premiums net of paid losses, fully reserved finite-season cover, safe pull exits/credits | Funded Anvil deposits, premium, claim payout, NAV/withdrawal; conservation fuzzing. No fixed APY/external strategy |
| Logs and traces | Canonical JSON hash, private preimage, actual canonical incident receipt/sender/time checks | Actual local incident transaction and private evidence import tests. Causal loss/self-authored traces remain member assertions |
| Jev approve/deny and sufficiency | Typed confidence/sufficiency recommendation before UI ballot preview; explicit evidence-sharing consent | Typed provider doubles, unavailable provider fails closed. Paid Jev access remains outstanding; no model veto over direct contract ballots |
| Member vote/approved payouts | Previous-block capital, claimant exclusion, 30% quorum, strict majority, three-day ballot, reserved beneficiary credits | Real generated-wallet local ballots, settlement and 25 USDC payout; duplicate receipts rejected |
| Snapshot | Real optional Hub proposal verification with exact configured space/network/policy block/evidence binding | Adapter and rejection tests. Discussion only; hosted proposal/strategy/publishing/signatures not verified |
| Independent deployable app | Own package/config/API, shared mutual capability, Vercel/Docker paths | Production build plus production HTTP/workflow/receipt test on port 3124 |

## Local verification

- Lint and TypeScript pass. Ordinary workspace suite: **242 passed, 21 opt-in skipped**.
- Foundry workspace: **162 passed**, including **17 new mutual cases** and 256-run mutual conservation fuzzing.
- Day 24 generated-wallet, funded **actual Anvil** lifecycle passes: deployed contract/runtime/registry checks, deposits, premium, canonical incident, private evidence, Jev assessment, guardian pause, historical ballot, three-day settlement, exact payout receipt, duplicate receipt rejection and risk-capital exit. The operator's final balance is 2021.4 fixture USDC; 25 was an actual local token payout. Jev, registries and persistence are fixtures; the zero-value incident transaction is provenance evidence, not a demonstrated real loss.
- All **24 production HTTP/page/API/workflow/receipt checks** pass against independent production servers. Day 24 practice flow buys cover, advances waiting period, files evidence, reviews, switches to member, votes, settles and collects the practice credit.
- Browser practice lifecycle passes through policy, waiting period, filing, consented assessment, member vote, settlement and payout. At 390px width the page has no horizontal overflow; the policy register scrolls within its container. Preview: `day-24-preview.jpg`.
- Frozen pnpm 10.2.0 offline install passes using the existing dependency store.
- Production dependency audit retains **six high and one low** findings (inherited TOML 4, transitive Zod 3, elliptic); no new external package was added for this capability. Do not interpret a working build as dependency/security clearance.

## Guardrails and remaining audit findings

Full-limit reserves and excluded beneficiary credits protect accounting; minimum outputs, premium caps, exact allowances and exact receipt reconciliation constrain execution. Approvals are a distinct prerequisite, never simulated before allowance exists. Capital lock, finite season, same-block protection, claimant exclusion, tie/no-quorum denial, duplicate-payout identity and pause-safe exits have contract tests. Only approved incidents consume the duplicate identifier, allowing denied mistakes to be reconsidered under another policy but preventing repeated approved identifiers.

Remaining risks: members/reviewers can collude; fabricated logs or differently labeled duplicate losses require human adjudication. New capital bears old losses without historical voting rights. Global reserve lock lasts until permissionless expiration/settlement. Browser preview expiry cannot cancel a signed wallet transaction; manual discard is an operator assertion, and uncertain submissions must reconcile. There is no public member authentication layer, scalable chain indexer, automatic renewal/migration or settlement keeper. Snapshot is advisory, not binding governance execution. Real Supabase, Jev, hardware wallet, public registry, Snapshot proposal and funded Base Sepolia acceptance are not yet verified. Independent contract/economic/legal/privacy review and a separate Base production deployment remain required.

Ordered remaining tasks: [completion tracker](PROJECT-COMPLETION-TRACKER.md). Never mark local fixtures as live service evidence.

## Publication

Implementation `558dea8` is published in [PR #21](https://github.com/EverEye-El/dapptober-agents/pull/21), stacked on open Day 23 PR #20. Hosted final implementation `37fd625` passed [all 27 jobs](https://github.com/EverEye-El/dapptober-agents/actions/runs/40105743399): shared/local-chain checks, 24 independent app containers and two worker images. This does not establish live provider or public-chain acceptance. Local acceptance above was verified before publication.
