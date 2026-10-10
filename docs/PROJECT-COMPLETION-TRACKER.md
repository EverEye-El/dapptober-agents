# Project completion tracker

This living document tracks every built Dapptober agent from local implementation through verified live operation. Update it after each daily build and whenever remaining work is completed or new gaps are discovered. It is the ongoing completion checklist for the projects.

## Maintenance rules

- Add a row for each newly built day, preserving earlier days.
- Record what was actually tested and distinguish simulations, local-chain integration and live production evidence.
- Keep remaining implementation, deployment, configuration, funding, verification and release work explicit, including blockers.
- Remove a remaining task only after completing it; record the result in the tested column and link its audit or evidence.
- Update the status date and shared release work on every revision. A working UI or successful demo alone does not establish live completion.

## Current status

Status as of October 10, 2026: all ten apps work in local demo mode, but none is verified end to end as a live production service. Interfaces, workflows, shared logic and builds were tested. The localhost apps currently simulate financial actions and AI responses.

Real protocol integrations are implemented, but deployment, credentials, funding and live verification remain.

| Day | What’s working/tested | What remains for live use |
| --- | --- | --- |
| **01 — Wallet Genesis** | Wallet/session workflow; contract restrictions, caps, expiry, revocation and replay protection; **actual Anvil deployment, scoped EIP712 transfer, replay rejection and revoke rejection through the chain adapter** | Deploy **SessionVault**; configure thirdweb; create the smart account; fund USDC and gas or sponsorship; verify an actual authorized transfer and revocation |
| **02 — Pay-Per-Prompt** | HTTP 402 challenge → simulated payment → retry; budget and replay checks | **No custom contract deployment.** Configure a supported x402 facilitator and recipient; fund paying wallet with USDC/gas; verify actual settlement |
| **03 — Agent Passport** | Registration, directory, signed feedback and validation logic; registry contract tests; **actual Anvil registration, independent signed feedback, validator attestation and directory reconciliation** | Deploy **AgentPassport**; use separate owner/client/validator wallets; verify live registration and feedback. Optional EAS requires its address and registered schema |
| **04 — MCP Mercenary** | Actual MCP client/server communication; local quest lifecycle; escrow contract tests; **actual Anvil escrow funding, claim/submission, approval payout and disputed refund through the chain adapter** | Deploy **QuestEscrow**; fund a USDC bounty and agent gas; verify claim, submission, approval, payout and dispute handling; schedule worker if desired |
| **05 — Stablecoin Autopilot** | Allocation policies, local monitoring/rebalancing, pause and withdrawal logic; treasury contract tests; **actual Anvil treasury/two fixture vaults, monitoring, deposit/withdrawal, pause and recovery** | Deploy **FlightTreasury**; configure at least two compatible, existing USDC ERC4626 vaults; fund treasury/agent; collect rate samples; verify small deposits, withdrawals and recovery; schedule worker |
| **06 — Intent Calligrapher** | Intent parsing, constraints, signing payloads and simulated solver workflow | **No custom contract deployment.** Use existing CoW contracts; configure supported chain/tokens; fund wallet, approve relayer and verify a real order, fill and cancellation |
| **07 — Glass-Box Mind** | Receipt signatures, tamper rejection, sharing and verification; historical Intel-signed quote tests | Deploy confidential worker/model inside an **Intel TDX CVM**; approve/pin workload measurements and model digest; verify fresh hardware-backed inference. **InferenceAnchor** deployment is needed only for onchain publication |
| **08 — Swarm Senate** | Debate/override workflow; contract tests; **actual local Anvil deployment, delegation, votes, override and adoption** | Deploy **SenateVoice + SwarmGovernor** on the chosen public chain; enroll members, sign profiles, delegate and fund agent gas; configure live reasoning; verify public-chain lifecycle; schedule worker if desired |
| **09 — Forecast Colosseum** | Funded binary pools, agent API and hard risk limits, Brier/calibration ranking, confidence review; eight contract tests with collateral fuzzing; **actual Anvil human/agent trades, direct cap rejection, oracle-double dispute/reset/settlement and USDC payout**; independent production HTTP workflow and browser QA | Deploy **ForecastColosseum** with verified UMA OOv3, whitelisted six-decimal USDC and approved **ASSERT_TRUTH2**; set ≥2 hour live dispute window; fund human/agent USDC/gas and separate oracle bonds; register caps; configure real Jev/AI, HTTPS/PostgreSQL; verify public-chain assertion/dispute/settlement and standings; operate oracle monitoring and obtain contract review. Local oracle/provider doubles are not production DVM/AI evidence |
| **10 — Human Checkpoint** | Private proof adapter with explicit provider doubles; cross-session uniqueness/race/expiry and lane exclusion; real P-256 WebAuthn verification; registered agent signature/transfer checks; five reward contract tests including 256-run claim fuzzing; **actual Anvil deployment, signed funded USDC payout, exact claim receipt and duplicate rejection**; copper noir UI based on supplied Day 10 graphic | Create production World ID app/RP/action and private signing key; configure actual ERC-8004 registry on selected chain, HTTPS/passkey RP, PostgreSQL/Supabase, stable cookie secret and Jev/AI; deploy **HumanCheckpointRewards** with RP/action campaign hash, fixed USDC and dedicated verifier; fund reward pool and visitor gas; verify real World proof, hardware passkey, duplicate enrollment, registry transfer and funded public-chain claim; configure ingress limits, storage/retention/privacy policy, monitoring/backups/key handling and independent security review. Provider/personhood/registry fixtures are not production evidence |

For every live app, remaining setup includes HTTPS hosting, PostgreSQL, private environment configuration, operator authentication and its required AI/Jev credentials. Day 10 has isolated visitor sessions; its operator token authorizes administration only. Each then needs a live acceptance run: passing demo tests does not establish that providers, wallets and public-chain transactions work together.

Release work also remains: verify hosted CI for subsequent changes, address the remaining low elliptic dependency advisory and review the custom contracts before putting meaningful funds into them. Keep subsequent daily work committed and pushed. The contracts have automated tests, not an independent security audit.

Day 07 has the most infrastructure left. Days 01, 03, 04, 05, 08, 09 and 10 have actual local-chain acceptance evidence; production protocol acceptance remains separate.

## Production launch checklists — Days 01–10

These are remaining production tasks, not completed deployment evidence. Complete the shared checklist for **each** app, then its daily checklist. The owner supplies accounts, secrets, signatures, funding and release approval; engineering completes configuration, deployment and verification. Store secrets privately, never in this tracker. Testnet rehearsals should be recorded separately from production acceptance.

### Shared setup and release — repeat for each day

- [ ] Choose the production chain, HTTPS domain, hosting project and responsible operator; verify the selected protocols support that chain using current official deployment documentation.
- [ ] Provision durable PostgreSQL with private server access, appropriate TLS/pooling, schema permissions, backups and a tested restore. Days 01–09 use `dapptober_state`; Day 10 additionally uses its checkpoint store.
- [ ] Populate the app's `.env.example` fields in ignored private configuration or hosting secrets. Set `AGENT_MODE=real`, `PUBLIC_ORIGIN`, matching RPC/chain, owner and a unique 32+ character operator token. Keep signing keys out of browser bundles and logs.
- [ ] Configure real Jev credentials and the required model provider/models; Day 07 uses the model inside its confidential worker. Verify successful calls and that provider failures deny protected actions.
- [ ] Establish scoped key custody, a minimally funded agent budget where applicable, and recovery procedures. For Days 01–09, reconcile stored/chain history before operator-token rotation, which changes the workspace namespace.
- [ ] Review custom contracts and authentication/provider boundaries independently before meaningful funding. Recheck dependency advisories, resolve the inherited low elliptic advisory when a reviewed fix is available, or document an explicit release risk decision.
- [ ] Run configuration checks with `pnpm readiness DD --init --online` and inspect missing fields. These checks do not deploy, spend, validate provider accounts or certify readiness.
- [ ] Verify required CI checks for the release commit and build the selected app independently with `pnpm run build DD`; deploy its standalone container or separate hosting project with sufficient request duration.
- [ ] Confirm HTTPS, operator authentication, public/private route boundaries, durable state across restarts, receipt export and error handling on the deployed origin. Configure ingress rate limits and request-size limits.
- [ ] Complete the daily funded/provider acceptance below with small controlled amounts. Reconcile actual transaction events, token balances and provider receipts; verify rejection and recovery paths.
- [ ] Set monitoring and alerts for RPC/provider failures, balances, expiring permissions and stuck workflows; configure worker scheduling where needed, incident pause/revocation and a documented rollback.
- [ ] Record the release commit, date, deployed origin, chain, contract addresses, transaction hashes, redacted provider evidence and reviewer sign-off here or in a linked daily audit. Publish applicable privacy/retention terms and approve public release only after acceptance passes.

### Day 01 — Wallet Genesis

Setup: [app README](../apps/agents/day-01-wallet-genesis/README.md).

- [ ] Configure thirdweb credentials, the owner wallet, dedicated agent signer and supported account-abstraction chain/RPC; confirm bundler and gas sponsorship or gas funding.
- [ ] Deploy `SessionVault` for the intended owner, verify its owner/bytecode and set `SESSION_VAULT`.
- [ ] Birth the actual thirdweb smart account and record its address. Fund **SessionVault** with the selected USDC; fund or sponsor the smart account's transaction gas.
- [ ] Owner grants a scoped session with explicit token/recipient allowlists, per-transfer and daily caps, approval threshold and expiry.
- [ ] Execute a small real transfer through the smart account/bundler and reconcile recipient balance and receipt; verify a transfer requiring owner co-signature.
- [ ] Verify forbidden recipient/token, cap breach, expiry and replay rejection; revoke the session and confirm previously authorized execution fails.
- [ ] Record thirdweb/bundler production evidence separately from the existing local SessionVault tests; document safe session renewal and owner recovery.

### Day 02 — Pay-Per-Prompt

Setup: [app README](../apps/agents/day-02-pay-per-prompt/README.md). No custom contract deployment.

- [ ] Select an x402 facilitator supporting the exact production network/token; configure its required authentication, `FACILITATOR_URL`, `PAY_TO`, price and daily payer budget.
- [ ] Fund a dedicated paying signer with the supported USDC and any required native gas; verify the recipient address independently.
- [ ] Request the resource without payment and verify the 402 challenge's price, recipient, token and network.
- [ ] Perform a real agent payment and retry; verify facilitator settlement, transaction hash, recipient balance change and release of the paid resource.
- [ ] Test invalid/replayed payment proofs, exhausted budget and facilitator outage; confirm unpaid requests cannot obtain the protected resource.
- [ ] Monitor settlement failures, payer balance and facilitator credentials; record actual settlement evidence rather than simulated payment receipts.

### Day 03 — Agent Passport

Setup: [app README](../apps/agents/day-03-agent-passport/README.md).

- [ ] Deploy `AgentPassport`, verify the deployment and set `PASSPORT_REGISTRY`; this custom passport is distinct from Day 10's actual ERC-8004 registry.
- [ ] Prepare separate owner, job-client and validator browser wallets on the same chain, each with native gas; publish reachable registration metadata.
- [ ] Register the passport and verify its owner/metadata in the live directory; record a completed job.
- [ ] Obtain independent client signed feedback and validator attestation; reconcile signatures, chain events and the directory's trust summary.
- [ ] Verify self-feedback, unauthorized job updates, invalid signatures and duplicate feedback are rejected.
- [ ] Decide whether to enable optional EAS. If enabled, verify its official chain deployment, register the exact `bytes32 job,bytes32 evidence,uint8 score` schema, configure address/schema and verify a real attestation. If omitted, record that scope decision.
- [ ] Document metadata availability and trusted-client/validator policy; preserve provenance without treating a reputation score as guaranteed truth.

### Day 04 — MCP Mercenary

Setup: [app README](../apps/agents/day-04-mcp-mercenary/README.md).

- [ ] Deploy `QuestEscrow` with the correct USDC, verify configuration and set `QUEST_ESCROW`.
- [ ] Prepare a funded creator wallet, independent validator and dedicated agent with native gas; set the agent's budget and accepted quest constraints.
- [ ] Connect an actual external MCP client to authenticated `/api/mcp` or the supplied stdio bridge; verify discovery and authorization on the production origin.
- [ ] Creator approves USDC and funds a small bounty with clear brief, validator and deadline.
- [ ] Complete live discovery → agent claim → real Jev/model work → submission → human approval → payout; reconcile escrow events and recipient USDC balance.
- [ ] Run a separate dispute/refund case and verify timeout recovery and duplicate-payout rejection.
- [ ] If unattended execution is required, schedule bounded Day 04 worker runs with private credentials and deadline/gas alerts; verify it cannot approve its own payout. Otherwise document manual operation.

### Day 05 — Stablecoin Autopilot

Setup: [app README](../apps/agents/day-05-stablecoin-autopilot/README.md).

- [ ] Identify at least two distinct existing USDC ERC4626 vaults, one lending and one savings; verify official addresses, underlying asset, share conversion, liquidity and withdrawal behavior on the selected chain.
- [ ] Review protocol/vault risks and configure `VAULT_CONFIG` with approved names, kinds and risk ratings; fixture vaults and test APY are not production yield evidence.
- [ ] Deploy owner-controlled `FlightTreasury` with correct USDC; verify owner/token, set `FLIGHT_TREASURY`, fund its small USDC budget and fund agent gas.
- [ ] Owner allowlists approved vaults and grants an expiring flight plan with daily movement, allocation, liquidity and risk limits.
- [ ] Collect real dated share-price samples at least 60 seconds apart; verify rate calculations and live Jev/model policy review.
- [ ] Perform small deposits, withdrawals and a permitted rebalance; reconcile shares/assets and confirm cap, non-allowlisted-vault and policy violations are rejected.
- [ ] Disengage the agent and verify owner withdrawal/liquid recovery; document recovery limits for illiquid vaults.
- [ ] Schedule bounded monitoring/rebalance runs, or explicitly choose manual operation; alert on liquidity changes, failed withdrawals, permission expiry and gas depletion.

### Day 06 — Intent Calligrapher

Setup: [app README](../apps/agents/day-06-intent-calligrapher/README.md). No custom contract deployment.

- [ ] Configure an implemented CoW-supported chain (Base or Ethereum Sepolia), matching `COW_CHAIN_ID`/RPC and official USDC/WETH/relayer addresses; verify actual quote availability and liquidity. Base Sepolia is not supported by this adapter.
- [ ] Fund the browser owner wallet with supported tokens and gas; approve only the verified CoW vault relayer with an appropriate allowance.
- [ ] Generate an intent using real providers and inspect amount, minimum output, recipient and deadline against the actual quote before signing.
- [ ] Sign and submit a real EIP-712 order; record its UID and verify a solver fill, settlement transaction and resulting wallet balances.
- [ ] Submit and cancel a separate real order; verify cancellation status and that it cannot subsequently fill.
- [ ] Verify expired/invalid intents and breached amount/recipient/deadline constraints fail; document unfilled-order monitoring and allowance revocation.

### Day 07 — Glass-Box Mind

Setup: [app and worker README](../apps/agents/day-07-glass-box-mind/README.md). Confidential infrastructure is required; onchain anchoring is optional.

- [ ] Provision an actual Intel TDX dstack confidential VM and its hosting budget; review and publish immutable worker/container images and deployment configuration.
- [ ] Run Ollama/model inference entirely inside the CVM; configure dstack quote/key socket access and private authenticated HTTPS worker ingress.
- [ ] Independently approve the exact model manifest/weights and digest; pin `TEE_MODEL`/`TEE_MODEL_DIGEST`, protect model storage and verify integrity before/after inference.
- [ ] Independently derive and approve `mrtd` and all four RTMR measurements for the reviewed workload; configure `TEE_MEASUREMENTS`, worker URL/token and Jev credentials.
- [ ] Obtain a fresh nonce-bound inference receipt and hardware quote; verify signature/report-data binding, current Intel collateral, revocation/TCB status, non-debug policy and approved measurements/model.
- [ ] Test tampering, stale/replayed receipts and model/workload mismatches; verify the independent sharing/verifier flow rejects them. Historical quote fixtures do not satisfy this item.
- [ ] Decide whether to publish commitments onchain. If enabled, deploy/configure `InferenceAnchor` on the supported chain, fund owner gas and verify the actual commitment/URI; anchoring alone does not prove hardware trust or answer accuracy.
- [ ] Monitor quote/collateral and worker availability; require renewed review and measurement approval after workload/model changes.

### Day 08 — Swarm Senate

Setup: [app README](../apps/agents/day-08-swarm-senate/README.md).

- [ ] Agree the fixed founding membership (3–32 addresses) and voting/override windows; account for the app's smaller profile/proposal bounds before enrolling.
- [ ] Deploy `SenateVoice` and `SwarmGovernor`; verify membership, token/governor wiring and windows, and configure addresses plus `SENATE_START_BLOCK`.
- [ ] Configure a dedicated delegate seed, durable profile/transcript storage and live Jev/model reasoning; use hosting that supports debate request duration.
- [ ] Each member signs a current values profile and delegates before the proposal snapshot; fund member and derived delegate wallets with native gas.
- [ ] Create a live proposal, run debate and cast provisional agent votes; verify snapshot weights and the resulting public-chain tally.
- [ ] Exercise human override before/after an agent vote and confirm no double counting; verify nonmembers, late agent votes and repeated overrides are rejected.
- [ ] Verify quorum/majority outcomes and explicit human adoption of an approved policy; record failed-proposal behavior too.
- [ ] Schedule bounded senate worker runs if desired; monitor voting deadlines and delegate gas. Document that seed changes require new delegation and existing snapshot votes require human override.

### Day 09 — Forecast Colosseum

Setup: [app README](../apps/agents/day-09-forecast-colosseum/README.md).

- [ ] Verify the official UMA OOv3 deployment, production dispute/DVM support, approved `ASSERT_TRUTH2`, whitelisted six-decimal USDC and current minimum bond on the chosen chain.
- [ ] Deploy `ForecastColosseum` with intended owner/token/oracle/identifier and at least a two-hour live dispute window; verify immutables and configure addresses.
- [ ] Fund human/agent trading wallets with USDC/gas and reserve **separate assertion/dispute bond budgets**; configure actual Jev/model credentials.
- [ ] Register agent per-trade, cumulative market and daily caps before trading; verify direct contract enforcement and owner trading-pause controls.
- [ ] Publish precise immutable market rules, cutoff/time zone, authoritative resolution sources and missing-data/INVALID handling; perform both human and agent trades with real evidence.
- [ ] Verify cap/confidence/cutoff rejection; make an actual bonded assertion, exercise a real oracle dispute and wait for supported oracle resolution/settlement.
- [ ] Claim actual USDC winnings/refunds and reconcile events/balances; verify duplicate claims, INVALID/no-winner outcomes and ranking/calibration updates.
- [ ] Verify/document trading pause versus available claims, 30-day unasserted stale recovery and pending-dispute restrictions; no local oracle double counts as DVM acceptance.
- [ ] Operate oracle/dispute monitoring with funded bond budgets and incident response; obtain independent contract review before increasing stakes.

### Day 10 — Human Checkpoint

Setup: [app README](../apps/agents/day-10-human-checkpoint/README.md).

- [ ] Create the production World ID app/RP and fixed action; configure private `WORLD_APP_ID`, `WORLD_RP_ID`, `WORLD_SIGNING_KEY` and `WORLD_ACTION` with the actual production proof flow.
- [ ] Establish a stable HTTPS/passkey origin, private PostgreSQL/Supabase and 32+ character `CHECKPOINT_SESSION_SECRET`; verify checkpoint schema/RLS, persistence and backups. Keep the operator token separate from visitor identity.
- [ ] Verify an actual ERC-8004 IdentityRegistry on the selected chain, configure `CHECKPOINT_REGISTRY` and register the agent wallet; do not substitute Day 03's custom passport.
- [ ] Provision a dedicated managed voucher signer. Deploy `HumanCheckpointRewards` with intended owner, six-decimal USDC, verifier, fixed reward and `keccak256(UTF8(WORLD_RP_ID + ':' + WORLD_ACTION))`; verify configuration matches its immutables.
- [ ] Fund only the intended USDC reward budget and ensure visitors can pay claim gas. Document that the offchain verifier is trusted to authorize rewards and protect that signing key accordingly.
- [ ] Verify real World ID enrollment and a real browser/hardware passkey return; prove the same human cannot reenroll in another session/wallet, and returning/renewed credentials preserve history and claim status.
- [ ] Verify current registered-agent signatures and authority transfers; reject transferred/unset authority and ensure guest/agent lanes cannot access human-only chat or rewards.
- [ ] Exercise real Jev/model moderation/routing and provider failure behavior; inspect receipts/model inputs for private proof or human-chat leakage.
- [ ] Claim a real funded reward and reconcile exact `Claimed` event, recipient and USDC balance; verify duplicate, expired and mismatched vouchers fail.
- [ ] Test both operator application pause and owner contract pause; application pause alone does not invalidate already-issued vouchers.
- [ ] Publish privacy/retention/provider disclosures, configure edge quotas/monitoring and verify restore preserves uniqueness. Never reset enrollment data or change RP/action within an existing campaign; document wallet-loss limitations and obtain independent security review.

### Production evidence log

For each checked acceptance item, add a dated entry with day, release commit, environment (simulation/local chain/testnet/production), result and an audit link or public transaction/provider reference. Record failed checks and follow-up tasks too. No production checklist item has been marked complete in this documentation update.

## Shared tooling — pnpm migration

The workspace now uses pinned pnpm 10.2.0 and `pnpm-lock.yaml`. Fresh frozen installation, an isolated production-only worker installation, lint/typecheck, 40 application tests, 28 contract tests, the real Anvil integration, all eight production builds and all eight production HTTP workflows pass. Direct external dependency versions are preserved; scripts, CI, Docker, existing Vercel configurations and active setup docs use pnpm. See [migration audit](PNPM-MIGRATION.md).

Hosted migration GitHub CI was verified passing on October 8 (push and PR runs linked in [live setup checklist](LIVE-SETUP-CHECKLIST.md)). Migration PR #1 is merged. Remaining: resolve the documented upstream dependency advisories/peer warnings. Live deployment requirements for Days 01–08 above are unchanged. Package-manager migration does not establish live protocol validation.

## Supporting documentation

- [Deployment instructions](DEPLOYMENT.md)
- [pnpm migration audit](PNPM-MIGRATION.md)
- [Days 01–06 audit](FINAL-AUDIT.md)
- [Day 07 audit](DAY-07-AUDIT.md)
- [Day 08 audit](DAY-08-AUDIT.md)
- [Day 09 audit](DAY-09-AUDIT.md)
- [Day 10 audit](DAY-10-AUDIT.md)

## Completion pass — October 8, 2026

Completed repository work:

- Added secret-safe `pnpm readiness` checks for all eight apps, non-overwriting private environment initialization, and optional read-only RPC chain/bytecode checks. All eight private `.env.local` files were initialized in demo mode and checked; live credentials, contracts and funding remain unavailable.
- Added independent Vercel configs for Days 07/08 and expanded container context exclusions. Added reproducible container builds/startup/API checks for every app and the confidential worker.
- Added four actual Anvil integrations for Days 01, 03, 04 and 05; Day 08's existing integration also passes. Added a fresh production HTTP audit that starts owned servers on 3101–3108 and stops them afterward, leaving the normal browser servers available.
- Fixed the URI-decoder advisory with upstream version 0.5.0 and a version-pinned CommonJS export compatibility patch. Added explicit root Solana Kit 5.5.1 to satisfy x402 SVM's current peer requirement while retaining the legacy wallet-scoped Kit. Direct and nested wallet import regression tests pass.

Final local validation: lint/typecheck, **46 application tests**, **28 contract tests**, all **eight production builds**, all **five Anvil integrations**, and all **eight fresh production HTTP workflows** pass. A fresh frozen installation in an isolated workspace passes. Production dependency audit: **0 critical, 0 high, 0 moderate, 1 low** advisory family. The remaining elliptic advisory has no patched release and remains an explicit upstream/security-review gap. Other peer warnings remain documented.

Hosted container evidence: [PR run 37858718305](https://github.com/EverEye-El/dapptober-agents/actions/runs/37858718305), implementation commit `ce60ccf67bc3564e1788934e653a9889adb328e7`: **all eight app image builds, standalone startup checks and demo API/receipt checks passed**; the confidential worker image also built successfully. CI exposed and helped fix the Kit mismatch and a startup-probe race. Container packaging is verified for that commit; this does not deploy HTTPS services or establish TDX runtime evidence.

Evidence boundaries: Day 01 tests SessionVault and the chain adapter, **not** thirdweb account abstraction/bundling. Day 03 does not contact EAS. Day 04's Anvil test covers escrow, not a funded full MCP/AI worker. Day 05 uses mock ERC4626 vaults and establishes neither live yield nor production-vault safety. Days 02/06 still require external settlement; Day 07 still requires fresh hardware evidence. These are local/CI results, not live production certification.

Owner inputs and per-day acceptance steps are in [LIVE-SETUP-CHECKLIST.md](LIVE-SETUP-CHECKLIST.md). No public-chain contracts were deployed, wallets funded, or paid infrastructure provisioned. No app is live-complete. Contract security review and provider/account access remain required. [PR #2](https://github.com/EverEye-El/dapptober-agents/pull/2) contains this work and is stacked on migration PR #1; review/merge remains a release step.

CI now runs each day's complete HTTP workflow against its actual standalone container, in parallel. Shared lint/typecheck/application/contract tests and all five Anvil integrations remain separate checks. This replaces duplicate sequential host builds in CI, not any build or workflow coverage; all final hosted workflow results pass. Local `pnpm run check` and `pnpm run test:production` remain available unchanged.

Hosted full workflow evidence: [run 37860191053](https://github.com/EverEye-El/dapptober-agents/actions/runs/37860191053), commit `10be663`: all eight actual standalone containers passed their complete daily HTTP workflows, including receipt verification; the worker image built successfully. The shared check exposed the 30-second escrow test timeout (and a resulting nonce collision in the next test). The harness now uses fast uncached local receipt polling, explicit pending nonces for owner fixture transactions, and a 90-second case allowance. A deliberately slow two-second-block escrow run passed in **33.6 seconds**, reproducing why the old limit was too short; all four normal-speed cases and the existing senate integration also pass. The final shared hosted check passed with this correction.

Final hosted audit: [run 37860650867](https://github.com/EverEye-El/dapptober-agents/actions/runs/37860650867), implementation commit `7e8579961350de2319cbe11aaa88767f8b60b2ac`, **passed all jobs**: frozen install, lint/typecheck, 46 application tests, 28 contract tests, five actual Anvil integrations, complete HTTP/receipt workflows for all eight independent standalone containers, and the confidential worker image build. New documentation-only revisions may trigger another automatic run; this evidence identifies the tested implementation commit. Live deployment and the owner inputs above remain uncompleted.

## Day 09 completion update — October 9, 2026

Day 09 adds the shared `forecast` capability and independent port 3009 app. Frozen install, lint/typecheck, 57 application tests, 36 contract tests, all six separate real local-chain acceptance cases, nine production builds and nine complete HTTP workflows pass. Browser trading and settlement update pools, leaderboard and calibration. No public deployment or live oracle/provider evidence is claimed. [Day 09 audit](DAY-09-AUDIT.md) records exact boundaries.

Day 06: fixed the Friday deadline parser and added a regression test; live CoW requirements are unchanged. Shared CI/container matrix and production/readiness scripts now include Day 09. Production dependency audit remains zero critical/high/moderate and one low inherited elliptic advisory.

Repository release: PR #1 merged into main; PR #2 merged into the pnpm branch. The new Day 09 branch incorporates both merged branches and will deliver the readiness work to main through its PR. Hosted CI for the final implementation passed; [PR #3](https://github.com/EverEye-El/dapptober-agents/pull/3) was subsequently merged on October 10; public setup/funding/verification and independent security review remain open.

Final oracle hardening: dispute approvals use the original posted assertion bond, verified after a local minimum-bond change. Assertion deadlines are recorded onchain and expired dispute requests are rejected. Confirmed transaction receipts survive a later failed workflow step; application state still rolls back. A shared regression test covers that distinction, so earlier days retain mined approval evidence too.

Hosted regression hardening: reproduced Day 08 delegation running out of gas at a timestamp boundary (95,883 gas consumed against a 95,883 estimate). The fixture now uses uncached reads, a conservative gas margin and deliberately mines across that boundary. The deterministic reproduction fails without the margin and passes with it; contract voting semantics are unchanged.

Final hosted acceptance: [run 37982145028](https://github.com/EverEye-El/dapptober-agents/actions/runs/37982145028), implementation commit `8768a460c651a16d297303968ae3d4eb0dd29120`, **passed every job**: frozen install, lint/typecheck, 57 application tests, 36 Solidity tests, all six real Anvil integrations, all nine independently built standalone containers with complete HTTP/receipt workflows, and the confidential worker image. This verifies packaging and tested integrations, not public deployment or live UMA/AI evidence. Documentation-only follow-up commits may trigger additional runs; the tested implementation is identified above.


## Day 10 completion update — October 10, 2026

Added the independent Day 10 app and shared `checkpoint` capability package. Personhood admission, returning passkeys, real registered agent authority, human-only chat, Jev risk/routing, exact signed reward transactions, sanitized receipts and durable uniqueness are implemented. The supplied Day 10 graphic is included in its own public assets; source graphics remain preserved. API identity is server-derived and operator-secret rotation does not reset human claims. Reward campaigns are pinned to the RP/action, and token/verifier configuration must match the contract.

The shared runner, readiness checker, HTTP workflow, standalone Docker public-asset copying and CI matrix now include ten apps. Earlier apps retain their own APIs and deployment requirements; Day 10 does not weaken operator authentication for Days 01–09. Regression verification and final evidence are recorded in [Day 10 audit](DAY-10-AUDIT.md). No real World ID credential, hosted database, paid AI/Jev call or public-chain deployment/funding was used. Remaining Day 10 configuration and release work is listed above; real production acceptance remains open.

Hosted Day 10 acceptance: [run 38069383828](https://github.com/EverEye-El/dapptober-agents/actions/runs/38069383828), implementation `34fe754359947e83f22f1e65dc321c7c902fdb5b`, **passed every job**: 70 application tests, 41 contract tests, seven real local-chain cases, all ten actual standalone containers and full HTTP/receipt workflows, and the worker image. [PR #4](https://github.com/EverEye-El/dapptober-agents/pull/4) was retargeted to main and merged on October 10. Local main was synchronized before adding these production checklists. Documentation-only later runs do not change the identified tested implementation. World ID/hardware/database/paid-provider/public-chain production evidence remains open as listed in the Day 10 row.
