# Project completion tracker

This living document tracks every built Dapptober agent from local implementation through verified live operation. Update it after each daily build and whenever remaining work is completed or new gaps are discovered. It is the ongoing completion checklist for the projects.

## Maintenance rules

- Add a row for each newly built day, preserving earlier days.
- Record what was actually tested and distinguish simulations, local-chain integration and live production evidence.
- Keep remaining implementation, deployment, configuration, funding, verification and release work explicit, including blockers.
- Remove a remaining task only after completing it; record the result in the tested column and link its audit or evidence.
- Update the status date and shared release work on every revision. A working UI or successful demo alone does not establish live completion.

## Current status

Status as of October 18, 2026: eighteen daily apps have local implementations. No app is certified here as an end-to-end live production service. Latest release evidence and remaining provider/public-chain requirements are recorded below; simulated financial actions and AI responses remain explicitly labeled.

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
| **09 — Forecast Colosseum** | Funded binary pools, agent API and hard risk limits, Brier/calibration ranking, confidence review; eight contract tests with collateral fuzzing; **actual Anvil human/agent trades, direct cap rejection, oracle-double dispute/reset/settlement and USDC payout**; independent production HTTP workflow and browser QA | Deploy **ForecastColosseum** with verified UMA OOv3, whitelisted six-decimal USDC and approved **ASSERT_TRUTH2**; set ≥2 hour live dispute window; fund human/agent USDC/gas and separate oracle bonds; register caps; configure real Jev/AI, HTTPS/Supabase; verify public-chain assertion/dispute/settlement and standings; operate oracle monitoring and obtain contract review. Local oracle/provider doubles are not production DVM/AI evidence |
| **10 — Human Checkpoint** | Private proof adapter with explicit provider doubles; cross-session uniqueness/race/expiry and lane exclusion; real P-256 WebAuthn verification; registered agent signature/transfer checks; five reward contract tests including 256-run claim fuzzing; **actual Anvil deployment, signed funded USDC payout, exact claim receipt and duplicate rejection**; copper noir UI based on supplied Day 10 graphic | Create production World ID app/RP/action and private signing key; configure actual ERC-8004 registry on selected chain, HTTPS/passkey RP, PostgreSQL/Supabase, stable cookie secret and Jev/AI; deploy **HumanCheckpointRewards** with RP/action campaign hash, fixed USDC and dedicated verifier; fund reward pool and visitor gas; verify real World proof, hardware passkey, duplicate enrollment, registry transfer and funded public-chain claim; configure ingress limits, storage/retention/privacy policy, monitoring/backups/key handling and independent security review. Provider/personhood/registry fixtures are not production evidence |
| **11 — GPU Night Market** | Provider listings, Jev-gated and fit-weighted ranking, bounded agent/human reservations, replay/capacity/cap/expiry protection; eight contract tests including 256-run conservation fuzzing; **actual Anvil escrow, HTTP provider worker with explicit Jev/Ollama fixtures, WebSocket telemetry, funded agent/human payouts, cached output recovery and expiry refund**; copper lantern UI and browser workflow | Deploy **GpuNightMarket** on Base Sepolia then Base; configure Supabase/Jev, owner/buyer wallets and caps; obtain and fund an actual Akash GPU lease, pin Ollama/worker images/model/hardware, configure provider wallet/token/HTTPS/WSS and persistent outputs, register specs/pricing and approve stalls; fund Base USDC/gas; verify genuine GPU inference, output commitment/payout/refund, provider availability and hosted persistence; contract review, retention, monitoring and release. Local inference/provider doubles are not GPU/Akash/production evidence |
| **12 — Provenance Press** | Custom Base immutable registration/approved terms, explicit publication consent, Pinata multipart adapter, Jev template choice, human/agent licenses, inherited remix permissions, recursive USDC royalty credits/claims, thirdweb ownership verification and public certificates/history; **actual Anvil original/remix/purchase/split/claim and certificate event verification**; letterpress browser registration/buy/claim | **Native Story/PIL integration remains unimplemented because the approved networks are Base.** Resolve network/bridge/currency architecture before claiming Story compliance; review actual legal terms and rights provenance; configure Pinata/Jev/thirdweb/Supabase, deploy **ProvenancePress** on Base Sepolia then Base, fund buyer/deployer gas and USDC, authorize caps/works, verify public IPFS retrieval and real payments, HTTPS hosting, contract/security review, monitoring/retention/backups/indexing and release |
| **13 — Agent Launch Gantry** | Atomic thirdweb-based fixed-supply agent/token/curve deployment; creator vesting, locked admin reserves, transfer-corrected holder distributions; paid text-service commitments/replay cache, Jev risk/LLM narration, bounded agent buyer, public feed and Dune adapter; **actual funded Anvil deployment/trades/service fee/holder claims/vesting** | Deploy **AgentLaunchGantry** on Base Sepolia then Base with Circle USDC; configure Supabase/Jev/OpenAI/thirdweb and gas-only signer and owner-controlled onchain buyer vault caps/allowlist; verify actual inference and browser signatures, transfers/dividends/vesting/sells; execute and schedule supplied Base Dune SQL/query; contract/legal review, HTTPS standalone hosting, recovery/retention/monitoring/backups and public release. Provider doubles and simulated feed are not live production evidence |
| **14 — Guardrail Sentinel** | Onchain per-agent USDC compartments, session budgets/contract allowlists/time windows; guardian-bound human escalation, replay protection and global epoch revocation; Jev LangChain classifier/tool gates/model routing, SDK MCP, Tenderly adapter and copper security room; **actual Anvil payments, owner signatures, critical guardian shutdown and re-enrollment** | Deploy/review **GuardrailSentinel** on Base Sepolia then Base; configure Supabase/Jev/OpenAI/Tenderly and separate owner/guardian/session custody; fund gas-only signers and limited compartments, verify actual recipient compatibility, model/simulation/provider acceptance, signed approvals/revoke/recovery drills, previous-wallet migration/legacy revocation, HTTPS hosting, monitoring/backups/ingress and release |
| **15 — Aurel / Real-World Concierge** | Cited issuer dossiers, Jev eligibility before AI explanation, uncertainty review, human-confirmed ERC-7540 USDC subscription/settlement/claim/redemption, Chainlink validation, NAV holdings/yield/maturity views; **funded local-chain adapter lifecycle with explicit protocol/provider doubles**, and **actual read-only Base JTRSY asset/share/NAV checks** | Complete issuer onboarding and reviewed country/minimum/terms catalog; obtain Base Sepolia issuer vault/share membership and verified Chainlink USDC feed; configure Supabase/Jev/OpenAI/investor wallet; fund test wallet, verify actual issuer fulfillment, AI citations and wallet recovery; reviewed Base catalog and provider acceptance, HTTPS, monitoring/backups/privacy/retention and release. No new production contract is required by the app; fixture contracts are not issuer deployments |
| **16 — Brass / Bot-to-Bot Bourse** | Published A2A 1.0 cards, typed offer/counter/accept, Jev confidence review, buyer mandate, EIP-712 seller terms/delivery, immutable capped USDC escrow, exact wallet receipts and live deal tape; **funded Anvil HTTP negotiation→escrow→delivery→payout**, eleven contract cases with conservation fuzzing | Deploy/review **BotBourse** on Base Sepolia then Base; verify official ERC-8004 buyer/seller registrations, separate arbiter/EOA seller custody, Supabase/Jev/OpenAI and reviewed A2A catalog/tokens; fund test buyer, verify live independent sellers/model output, signatures/recovery/disputes/timeouts, HTTPS, monitoring/backups and release. Local registry/provider doubles are not live acceptance |
| **17 — Toe Tag / Memecoin Coroner** | Pinned contract/proxy/owner/ABI evidence, holder candidates with RPC balances, V2 LP burn and runtime-reviewed vesting locks, always-reverting sell probe, Jev severity/review and AI report, canonical public evidence/EAS instructions; **actual local buy/sell rollback and official EAS registration/attestation/revocation**, plus **read-only Base Sepolia token/source/20-holder/EAS-registry evidence** | Review/deploy **CoronerProbe** on Base Sepolia then Base with a compatible V2 router; configure actual Blockscout/Tenderly/Jev/OpenAI/Supabase/Pinata, enroll independently reviewed lockers, register exact EAS schema and fund attester gas; verify real provider diagnostics/calibration, published IPFS hash/EAS validity/revocation, recovery, HTTPS, monitoring/retention and release. Local token/router/provider fixtures are not a live honeypot verdict |
| **18 — Hush / Encrypted Confidant** | Encrypted allocation-credit auction with owner ACLs, reservation/refund/consumption, deadline/pause/tie rules; official CoFHE local contract tests and conservation fuzzing; browser AES split-view simulation; amount-free Jev/AI boundaries; **genuine Base Sepolia CoFHE synthetic input encryption and verifier proof, no broadcast** | Review/deploy **EncryptedConfidant**; configure browser/private RPCs, runtime hash, Supabase/Jev/OpenAI; fund wallets with gas; verify multi-wallet public-chain bidding, ACL decryption/ACP lifecycle and recovery. Allocation credits are not funded tokens. Hidden order/payroll adapters are absent. **Base mainnet remains blocked by CoFHE SDK/network availability**, with no network substitution |

For every live app, remaining setup includes HTTPS hosting, Supabase, private environment configuration, operator authentication and its required AI/Jev credentials. Day 10 has isolated visitor sessions; its operator token authorizes administration only. Each then needs a live acceptance run: passing demo tests does not establish that providers, wallets and public-chain transactions work together.

Remaining dependency/configuration gaps: Day 02 needs facilitator authentication support if required by the production provider; Day 06 cannot currently perform live CoW settlement on the requested Base Sepolia test network. Day 05 vault addresses and Day 09/10 external registry/oracle deployments must be verified for Base Sepolia and Base before configuration can be considered complete.

Release work also remains: verify hosted CI for subsequent changes, address the remaining low elliptic dependency advisory and review the custom contracts before putting meaningful funds into them. Keep subsequent daily work committed and pushed. The contracts have automated tests, not an independent security audit.

Days 07 and 11 require separately provisioned compute infrastructure. Days 01, 03, 04, 05, 08, 09, 10, 11, 12 and 13 have actual local-chain acceptance evidence; production protocol acceptance remains separate.

## Production launch checklists — Days 01–17

These are remaining tasks **from the current build/tested repository to production**, in execution order. Work on one day at a time: shared phases 1–2 → that day's preparation → shared phase 3 rehearsal → shared phase 4 deployment → that day's acceptance → shared phase 5 release. Do not finish every shared step before starting the daily checklist. Check an item only after its stated environment has been verified; testnet rehearsals are separate from production acceptance.

The owner supplies accounts, secrets, signatures, funding and release approval; engineering completes configuration, deployment and verification. Store secrets privately, never in this tracker. All fifteen days follow this sequence. Day 07's confidential worker must exist before hardware rehearsal; Day 10 needs a stable HTTPS origin before real World ID/passkey acceptance. Public release still comes last.

### Fixed services and networks for this project

**Testing: Base Sepolia (`CHAIN_ID=84532`). Production: Base (`CHAIN_ID=8453`).** These are the owner's chosen networks; selecting a chain is no longer a task. Use ETH for transaction gas and Circle USDC for USDC workflows. Maintain separate test and production wallets, Supabase projects, provider configuration and contract addresses.

**Known compatibility work:** Day 06's configuration supports Base Sepolia testing and Base production. Its adapter rejects live Base Sepolia settlement because official CoW APIs provide no Base Sepolia solver endpoint. Keep Base Sepolia as the requested test target and record live CoW testing there as blocked until a supported integration path is established. Do not change chain IDs to pretend settlement works. Day 05 still needs actual compatible vaults on the requested networks; Day 09 needs an official UMA oracle/currency/identifier configuration; Day 10 needs an actual ERC-8004 registry. Those addresses are not supplied or verified deployments yet. Day 07's TDX worker runs in Phala/dstack infrastructure; its optional anchor uses Base Sepolia for testing and Base for production.

### Shared phase 1 — Obtain the specific accounts we use

- [ ] **Supabase:** create a `dapptober-testing` project for Base Sepolia testing. Save its database password privately and copy the database connection URI from **Connect → Session pooler** into each app's `SUPABASE_DATABASE_URL`. Both storage drivers now disable prepared statements; direct, session-pooler and transaction-pooler connections are supported. Use a private table-owner URI over TLS, and verify it against the actual Supabase project. The app does not consume Supabase anon/service-role API keys or Supabase Auth.
- [ ] **Base RPC:** obtain a Base Sepolia RPC URL and put it in `RPC_URL` with `CHAIN_ID=84532`. Record a separate Base mainnet RPC for the later production deployment (`CHAIN_ID=8453`); no particular commercial RPC vendor is built into the code.
- [ ] **TypeSafe / Jev:** obtain an API key with access to the current `jev-latest` request flow at `https://api.typesafe.ai/v1/systemone`; set `JEV_API_KEY` in all ten apps and verify a real screening request.
- [ ] **OpenAI:** obtain a server API key and enabled billing/model access. For Days 01–06, 08–10, 13 and 14, set `OPENAI_API_KEY`, `OPENAI_BASE_URL=https://api.openai.com/v1`, `OPENAI_SMALL_MODEL=gpt-4.1-mini` and `OPENAI_LARGE_MODEL=gpt-4.1`, matching current defaults. Verify both configured models respond. Days 07 and 11 use Ollama workers; Day 12 uses Jev template selection. These days do not need this OpenAI key.
- [ ] **Browser/deployment wallets:** prepare the owner's wallet address (`OWNER_ADDRESS`) and an encrypted Foundry deployment account for the custom contracts listed below. Prepare dedicated agent signers only for the days listed; fund testing wallets with Base Sepolia ETH and test USDC, not production money.
- [ ] **Day-specific accounts:** obtain thirdweb for Day 01, an x402 facilitator for Day 02, Phala/dstack Intel TDX hosting for Day 07 and World Developer Portal credentials for Day 10, using the exact fields below. Days 03/04/05/06/08/09 have no additional invented provider API keys.
- [ ] **Before real money:** arrange review of `SessionVault`, `AgentPassport`, `QuestEscrow`, `FlightTreasury`, `InferenceAnchor` if enabled, `SenateVoice`, `SwarmGovernor`, `ForecastColosseum` and `HumanCheckpointRewards`, plus their authentication paths. Resolve or explicitly review the remaining elliptic advisory before production release.

### Exact day-specific dependencies and configuration

All rows also require the shared Supabase/Base/Jev configuration above; OpenAI applies except Days 07, 11 and 12. Deployed addresses must be copied from verified deployment receipts, not guessed.

| Day | Service or contract used by this build | What to obtain or configure |
| --- | --- | --- |
| 01 | thirdweb SDK/account abstraction; `SessionVault` | Create a thirdweb project/API key; copy its **server secret** to `THIRDWEB_SECRET_KEY` (not its public client ID). Enable/configure the account-abstraction sponsorship used by `sponsorGas:true`. Set dedicated `AGENT_PRIVATE_KEY`, deployed `SESSION_VAULT` and `USDC_ADDRESS`. No thirdweb Engine credential is used. |
| 02 | x402 HTTP facilitator; Circle USDC | Set `FACILITATOR_URL`, recipient `PAY_TO`, `TOLL_USDC=0.01`, `TOLL_DAILY_BUDGET=1`, dedicated `AGENT_PRIVATE_KEY` and `USDC_ADDRESS`. Current client passes only the facilitator URL; authenticated production facilitator credentials need implementation if required. No custom contract. |
| 03 | custom `AgentPassport`; optional EAS | Deploy and set `PASSPORT_REGISTRY`; prepare separate owner/client/validator wallets. If using EAS, set actual `EAS_ADDRESS` and registered `EAS_SCHEMA`. No server agent key required. |
| 04 | MCP client/server; `QuestEscrow` | Set dedicated `AGENT_PRIVATE_KEY`, deployed `QUEST_ESCROW`, `USDC_ADDRESS`; prepare creator and independent validator wallets. External MCP clients use this app's `PUBLIC_ORIGIN` and `OPERATOR_TOKEN`, not an additional MCP vendor key. |
| 05 | `FlightTreasury`; two USDC ERC4626 vaults | Set dedicated `AGENT_PRIVATE_KEY`, deployed `FLIGHT_TREASURY`, `USDC_ADDRESS`, and `VAULT_CONFIG` entries with real `address`, `name`, `kind` (`lending`/`savings`) and integer `risk` (0–3). The vault protocols/addresses remain to be verified; demo names are fixtures. |
| 06 | CoW Order Book API/SDK and vault relayer | Production: `CHAIN_ID=8453`, `COW_CHAIN_ID=8453`, `COW_USDC`, `COW_WETH`, Base RPC and funded browser wallet. Basic CoW API operations require no API key. Base Sepolia live settlement is an unresolved compatibility gap; no custom contract or server agent signer. |
| 07 | Phala/dstack Intel TDX CVM; Ollama; optional `InferenceAnchor` | Obtain CVM hosting, private HTTPS `TEE_WORKER_URL`, random 32+ character `TEE_WORKER_TOKEN`, `TEE_MODEL=qwen3:0.6b`, exact `TEE_MODEL_DIGEST`, approved `TEE_MEASUREMENTS`. Optional anchor: deployed `INFERENCE_ANCHOR`, Base RPC/chain and owner wallet gas. No static inference signing key or OpenAI key. |
| 08 | `SenateVoice` and `SwarmGovernor` | Set `SENATE_TOKEN`, `SENATE_GOVERNOR`, deployment block `SENATE_START_BLOCK`, and a dedicated `AGENT_PRIVATE_KEY` used as delegate seed. Prepare founding member wallets and native ETH for derived delegates. |
| 09 | UMA Optimistic Oracle v3; `ForecastColosseum` | Set verified `UMA_ORACLE`, deployed `FORECAST_MARKET`, six-decimal `USDC_ADDRESS` and dedicated `AGENT_PRIVATE_KEY`. Verify `ASSERT_TRUTH2`, collateral whitelist and minimum bond; reserve assertion/dispute bonds separately from stakes. No UMA API key consumed. |
| 10 | World ID production RP; ERC-8004 registry; `HumanCheckpointRewards`; WebAuthn | Obtain `WORLD_APP_ID`, `WORLD_RP_ID`, private `WORLD_SIGNING_KEY`; retain `WORLD_ACTION=dapptober-human-checkpoint-2026`. Set stable random `CHECKPOINT_SESSION_SECRET`, actual `CHECKPOINT_REGISTRY`, deployed `CHECKPOINT_REWARDS`, `USDC_ADDRESS` and dedicated voucher `AGENT_PRIVATE_KEY`. No external passkey-service API key is used. |
| 11 | `GpuNightMarket`, Akash/Ollama workers | Set `GPU_MARKET`, capped buyer `AGENT_PRIVATE_KEY`, `GPU_AGENT_JOB_CAP`/`GPU_AGENT_DAILY_CAP`, actual `GPU_PROVIDERS` wallets/HTTPS workers/private tokens, separately funded Akash lease. No OpenAI key. |
| 12 | `ProvenancePress`, Pinata, thirdweb | Set `PROVENANCE_PRESS`, `PRESS_START_BLOCK`, `PINATA_JWT`, `THIRDWEB_SECRET_KEY` and `PRESS_AGENT_LICENSE_CAP`/`PRESS_AGENT_DAILY_CAP`; native Story remains a network/implementation gap. No OpenAI key. |
| 13 | Thirdweb-based `AgentLaunchGantry`, Jev/OpenAI, Dune | Set `LAUNCH_FACTORY`, dedicated buyer `AGENT_PRIVATE_KEY`, `LAUNCH_AGENT_BUY_CAP`/`LAUNCH_AGENT_DAILY_CAP`, `THIRDWEB_SECRET_KEY`, `DUNE_API_KEY` and numeric `DUNE_LAUNCH_QUERY_ID` for the supplied mainnet SQL. Public wallet previews need no operator token; buyer authority does. |
| 14 | `GuardrailSentinel`, LangChain TypeSafeClassifier, Tenderly | Set `SENTINEL_VAULT`, separate `SENTINEL_GUARDIAN_PRIVATE_KEY`, private `SENTINEL_SIGNERS` name/key JSON, `TENDERLY_ACCESS_KEY`, `TENDERLY_ACCOUNT_SLUG` and `TENDERLY_PROJECT_SLUG`; Jev/OpenAI/Supabase keys as above. Owner creates policies/co-signs. Signers hold gas only, USDC sits in onchain compartments. |
| 15 | Centrifuge AsyncVault, Chainlink USDC/USD, Vercel AI SDK, TypeSafe Jev | Set reviewed `RWA_CATALOG_JSON`, investor `OWNER_ADDRESS`, `CHAINLINK_USDC_USD_FEED_ADDRESS`/heartbeat and NAV age; Supabase/Jev/OpenAI/operator credentials. Obtain issuer membership and exact Base Sepolia vault/share pair first. No server spending key or custom production contract. |

Day 11 additional dependencies: `GPU_MARKET`, `GPU_PROVIDERS`, `GPU_AGENT_JOB_CAP`, `GPU_AGENT_DAILY_CAP` and its own buyer signer. Each provider needs `GPU_PROVIDER_PRIVATE_KEY`, `GPU_WORKER_BEARER_TOKEN`, `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `GPU_WORKER_SLOTS` and durable `GPU_OUTPUT_DIRECTORY`. See the annotated app/worker templates; an Akash lease is separate funding from Base job payments.

### Shared phase 2 — Configure the local apps against those services

- [ ] Open each daily folder's ignored `.env.local`; copy required fields from its `.env.example` and the dependency table above. Keep these files out of Git. Leave `AGENT_MODE=demo` until that day's required fields/contracts are ready.
- [ ] Generate a different random 32+ character `OPERATOR_TOKEN` for each app. This is a secret you create, not a provider-issued credential. Days 01–09 require it to open the real control room; Day 10 uses it for administration only. Days 11–12 use private operator control rooms; Day 13 reserves it for private records and autonomous buyer controls, with public wallet previews.
- [ ] Set the Supabase testing `SUPABASE_DATABASE_URL` in each app and verify a real database write/read. Confirm `dapptober_state` is created for shared state and Day 10's checkpoint tables are private/RLS-enabled; do not expose database passwords in browser variables.
- [ ] Set Base Sepolia `RPC_URL`, `CHAIN_ID=84532`, `OWNER_ADDRESS` and applicable `USDC_ADDRESS`; set `PUBLIC_ORIGIN=http://localhost:3000+DD` using the actual port (for example Day 01 `http://localhost:3001`). Day 06 now defaults to `CHAIN_ID=COW_CHAIN_ID=84532`; demo works, but real CoW settlement is explicitly blocked without a supported endpoint.
- [ ] Complete the selected day's preparation below: provider setup, reviewed test contract deployment, address configuration, narrowly funded test wallets and required permissions. Set `AGENT_MODE=real` only when configuration is complete.
- [ ] Test Jev and OpenAI access from that app (Ollama/TDX for Day 07), then proceed to phase 3. Missing keys/provider errors must remain visible failures, not silently simulated success.

### Shared phase 3 — Rehearse before deploying the public app

- [ ] Run `pnpm readiness DD --init --online` after configuring deployed addresses; resolve missing fields. It does not deploy, spend, validate provider accounts or certify readiness.
- [ ] Verify CI for the chosen implementation and build the selected app independently with `pnpm run build DD`.
- [ ] Run available real-provider and supported-testnet rehearsals from the local app with small controlled amounts; inspect receipts, rejected actions and recovery paths. Record unsupported testnet/provider paths explicitly for later production acceptance.
- [ ] Resolve rehearsal failures and document expected operating limits before provisioning the public app. Do not count mock/local-chain results as live provider or production acceptance.

### Shared phase 4 — Deploy privately, then validate the hosted app

- [ ] Choose the stable production domain and hosting project with sufficient request duration; create a separate `dapptober-production` Supabase project, copy its private session-pooler/direct URI to production `SUPABASE_DATABASE_URL`, and verify backups/restore.
- [ ] Deploy the selected standalone container or separate hosting project with private secrets, `AGENT_MODE=real` and the final HTTPS `PUBLIC_ORIGIN`. Set `CHAIN_ID=8453`, the Base mainnet `RPC_URL`, Base USDC/token addresses and production Supabase/Jev/OpenAI secrets; deploy remaining production-chain contracts from the daily preparation steps if rehearsal used testnet deployments.
- [ ] Reconcile rehearsal versus production namespaces, addresses and funding; do not copy simulated balances/identities into production. For Days 01–09, changing the operator token changes the workspace namespace; reconcile stored/chain history before resuming workers.
- [ ] Confirm HTTPS, operator authentication, public/private route boundaries, durable state across restarts, receipt export and error handling. Configure ingress rate limits and request-size limits before public access.
- [ ] Complete this day's production acceptance checklist below on the hosted origin, with small funded amounts and actual providers; reconcile transaction events, token balances and provider receipts.

### Shared phase 5 — Operate and release, after acceptance

- [ ] Configure monitoring/alerts for RPC/provider failures, balances, expiring permissions and stuck workflows; enable bounded scheduling where required and test incident pause/revocation and rollback.
- [ ] Publish applicable privacy/retention/provider terms; verify key handling and backup/restore procedures preserve the production state and claim history.
- [ ] Record the release commit, date, deployed origin, chain, contract addresses, transaction hashes, redacted provider evidence and reviewer sign-off here or in a linked daily audit.
- [ ] Confirm required checks pass for the final release commit, resolve remaining acceptance failures and obtain approval before opening public access or increasing funding/permissions.

### Day 01 — Wallet Genesis

Setup: [app README](../apps/agents/day-01-wallet-genesis/README.md).

**Preparation — shared phase 2, then rehearse in phase 3.** Use supported testnets for rehearsal; repeat chain-specific deployment/configuration on the production chain before acceptance.

- [ ] Create the thirdweb project/server secret (`THIRDWEB_SECRET_KEY`), set owner and dedicated `AGENT_PRIVATE_KEY`, and configure Base Sepolia RPC/chain for testing. Confirm the thirdweb gas sponsorship required by the current `sponsorGas:true` implementation; repeat on Base for production.
- [ ] Deploy `SessionVault` for the intended owner, verify its owner/bytecode and set `SESSION_VAULT`.
- [ ] Birth the actual thirdweb smart account and record its address. Fund **SessionVault** with the selected USDC; fund or sponsor the smart account's transaction gas.
- [ ] Owner grants a scoped session with explicit token/recipient allowlists, per-transfer and daily caps, approval threshold and expiry.
**Production acceptance — after shared phase 4 deployment.**

- [ ] Execute a small real transfer through the smart account/bundler and reconcile recipient balance and receipt; verify a transfer requiring owner co-signature.
- [ ] Verify forbidden recipient/token, cap breach, expiry and replay rejection; revoke the session and confirm previously authorized execution fails.
- [ ] Record thirdweb/bundler production evidence separately from the existing local SessionVault tests; document safe session renewal and owner recovery.

### Day 02 — Pay-Per-Prompt

Setup: [app README](../apps/agents/day-02-pay-per-prompt/README.md). No custom contract deployment.

**Preparation — shared phase 2, then rehearse in phase 3.** Use supported testnets for rehearsal; repeat chain-specific deployment/configuration on the production chain before acceptance.

- [ ] Test the configured x402 facilitator (`FACILITATOR_URL=https://x402.org/facilitator`) for Base Sepolia USDC; set `PAY_TO`, `TOLL_USDC` and `TOLL_DAILY_BUDGET`. For Base production, verify facilitator support and implement server credential/header configuration if that provider requires authentication; current code only supplies its URL.
- [ ] Fund a dedicated paying signer with the supported USDC and any required native gas; verify the recipient address independently.
**Production acceptance — after shared phase 4 deployment.**

- [ ] Request the resource without payment and verify the 402 challenge's price, recipient, token and network.
- [ ] Perform a real agent payment and retry; verify facilitator settlement, transaction hash, recipient balance change and release of the paid resource.
- [ ] Test invalid/replayed payment proofs, exhausted budget and facilitator outage; confirm unpaid requests cannot obtain the protected resource.
- [ ] Monitor settlement failures, payer balance and facilitator credentials; record actual settlement evidence rather than simulated payment receipts.

### Day 03 — Agent Passport

Setup: [app README](../apps/agents/day-03-agent-passport/README.md).

**Preparation — shared phase 2, then rehearse in phase 3.** Use supported testnets for rehearsal; repeat chain-specific deployment/configuration on the production chain before acceptance.

- [ ] Prepare separate owner, job-client and validator browser wallets on the same chain, each with native gas; publish reachable registration metadata.
- [ ] Deploy `AgentPassport`, verify the deployment and set `PASSPORT_REGISTRY`; this custom passport is distinct from Day 10's actual ERC-8004 registry.
- [ ] Decide whether to enable optional EAS. If enabled, verify its official chain deployment, register the exact `bytes32 job,bytes32 evidence,uint8 score` schema, configure address/schema ; verify a real attestation during production acceptance. If omitted, record that scope decision.

**Production acceptance — after shared phase 4 deployment.**

- [ ] Register the passport and verify its owner/metadata in the live directory; record a completed job.
- [ ] Obtain independent client signed feedback and validator attestation; reconcile signatures, chain events and the directory's trust summary.
- [ ] Verify self-feedback, unauthorized job updates, invalid signatures and duplicate feedback are rejected.
- [ ] Document metadata availability and trusted-client/validator policy; preserve provenance without treating a reputation score as guaranteed truth.

### Day 04 — MCP Mercenary

Setup: [app README](../apps/agents/day-04-mcp-mercenary/README.md).

**Preparation — shared phase 2, then rehearse in phase 3.** Use supported testnets for rehearsal; repeat chain-specific deployment/configuration on the production chain before acceptance.

- [ ] Prepare a funded creator wallet, independent validator and dedicated agent with native gas; set the agent's budget and accepted quest constraints.
- [ ] Deploy `QuestEscrow` with the correct USDC, verify configuration and set `QUEST_ESCROW`.
- [ ] Connect an actual external MCP client to authenticated `/api/mcp` or the supplied stdio bridge; verify discovery and authorization on the production origin.
**Production acceptance — after shared phase 4 deployment.**

- [ ] Creator approves USDC and funds a small bounty with clear brief, validator and deadline.
- [ ] Complete live discovery → agent claim → real Jev/model work → submission → human approval → payout; reconcile escrow events and recipient USDC balance.
- [ ] Run a separate dispute/refund case and verify timeout recovery and duplicate-payout rejection.
- [ ] If unattended execution is required, schedule bounded Day 04 worker runs with private credentials and deadline/gas alerts; verify it cannot approve its own payout. Otherwise document manual operation.

### Day 05 — Stablecoin Autopilot

Setup: [app README](../apps/agents/day-05-stablecoin-autopilot/README.md).

**Preparation — shared phase 2, then rehearse in phase 3.** Use supported testnets for rehearsal; repeat chain-specific deployment/configuration on the production chain before acceptance.

- [ ] Identify at least two distinct existing USDC ERC4626 vaults, one lending and one savings; verify official addresses, underlying asset, share conversion, liquidity and withdrawal behavior on the selected chain.
- [ ] Review protocol/vault risks and configure `VAULT_CONFIG` with approved names, kinds and risk ratings; fixture vaults and test APY are not production yield evidence.
- [ ] Deploy owner-controlled `FlightTreasury` with correct USDC; verify owner/token, set `FLIGHT_TREASURY`, fund its small USDC budget and fund agent gas.
**Production acceptance — after shared phase 4 deployment.**

- [ ] Owner allowlists approved vaults and grants an expiring flight plan with daily movement, allocation, liquidity and risk limits.
- [ ] Collect real dated share-price samples at least 60 seconds apart; verify rate calculations and live Jev/model policy review.
- [ ] Perform small deposits, withdrawals and a permitted rebalance; reconcile shares/assets and confirm cap, non-allowlisted-vault and policy violations are rejected.
- [ ] Disengage the agent and verify owner withdrawal/liquid recovery; document recovery limits for illiquid vaults.
- [ ] Schedule bounded monitoring/rebalance runs, or explicitly choose manual operation; alert on liquidity changes, failed withdrawals, permission expiry and gas depletion.

### Day 06 — Intent Calligrapher

Setup: [app README](../apps/agents/day-06-intent-calligrapher/README.md). No custom contract deployment.

**Preparation — shared phase 2, then rehearse in phase 3.** Use supported testnets for rehearsal; repeat chain-specific deployment/configuration on the production chain before acceptance.

- [ ] Resolve the requested Base Sepolia testing gap: the official CoW API has no documented solver endpoint on this network. Keep that acceptance blocked until a supported path exists; Ethereum Sepolia is no longer accepted by the shared configuration or CoW adapter. Configure Base production with `CHAIN_ID=COW_CHAIN_ID=8453`, Base RPC and official `COW_USDC`/`COW_WETH`/relayer addresses; verify quote liquidity.
- [ ] Fund the browser owner wallet with supported tokens and gas; approve only the verified CoW vault relayer with an appropriate allowance.
**Production acceptance — after shared phase 4 deployment.**

- [ ] Generate an intent using real providers and inspect amount, minimum output, recipient and deadline against the actual quote before signing.
- [ ] Sign and submit a real EIP-712 order; record its UID and verify a solver fill, settlement transaction and resulting wallet balances.
- [ ] Submit and cancel a separate real order; verify cancellation status and that it cannot subsequently fill.
- [ ] Verify expired/invalid intents and breached amount/recipient/deadline constraints fail; document unfilled-order monitoring and allowance revocation.

### Day 07 — Glass-Box Mind

Setup: [app and worker README](../apps/agents/day-07-glass-box-mind/README.md). Confidential infrastructure is required; onchain anchoring is optional.

**Preparation — shared phase 2, then rehearse in phase 3.** Use supported testnets for rehearsal; repeat chain-specific deployment/configuration on the production chain before acceptance.

- [ ] Review the worker/container images, model and deployment configuration; pin immutable image digests and approve the confidential hosting budget.
- [ ] Provision an actual Intel TDX dstack CVM and run Ollama/model inference entirely inside it; configure dstack quote/key socket access and private authenticated HTTPS worker ingress. This worker infrastructure is needed for phase 3 hardware rehearsal, before public app deployment.
- [ ] Independently approve the exact model manifest/weights and digest; pin `TEE_MODEL`/`TEE_MODEL_DIGEST`, protect model storage and verify integrity before/after inference.
- [ ] Independently derive and approve `mrtd` and all four RTMR measurements for the reviewed workload; configure `TEE_MEASUREMENTS`, worker URL/token and Jev credentials.
**Production acceptance — after shared phase 4 deployment.**

- [ ] Obtain a fresh nonce-bound inference receipt and hardware quote; verify signature/report-data binding, current Intel collateral, revocation/TCB status, non-debug policy and approved measurements/model.
- [ ] Test tampering, stale/replayed receipts and model/workload mismatches; verify the independent sharing/verifier flow rejects them. Historical quote fixtures do not satisfy this item.
- [ ] Decide whether to publish commitments onchain. If enabled, deploy/configure `InferenceAnchor` on the supported chain, fund owner gas and verify the actual commitment/URI; anchoring alone does not prove hardware trust or answer accuracy.
- [ ] Monitor quote/collateral and worker availability; require renewed review and measurement approval after workload/model changes.

### Day 08 — Swarm Senate

Setup: [app README](../apps/agents/day-08-swarm-senate/README.md).

**Preparation — shared phase 2, then rehearse in phase 3.** Use supported testnets for rehearsal; repeat chain-specific deployment/configuration on the production chain before acceptance.

- [ ] Agree the fixed founding membership (3–32 addresses) and voting/override windows; account for the app's smaller profile/proposal bounds before enrolling.
- [ ] Configure a dedicated delegate seed, durable profile/transcript storage and live Jev/model reasoning; use hosting that supports debate request duration.
- [ ] Deploy `SenateVoice` and `SwarmGovernor`; verify membership, token/governor wiring and windows, and configure addresses plus `SENATE_START_BLOCK`.
**Production acceptance — after shared phase 4 deployment.**

- [ ] Each member signs a current values profile and delegates before the proposal snapshot; fund member and derived delegate wallets with native gas.
- [ ] Create a live proposal, run debate and cast provisional agent votes; verify snapshot weights and the resulting public-chain tally.
- [ ] Exercise human override before/after an agent vote and confirm no double counting; verify nonmembers, late agent votes and repeated overrides are rejected.
- [ ] Verify quorum/majority outcomes and explicit human adoption of an approved policy; record failed-proposal behavior too.
- [ ] Schedule bounded senate worker runs if desired; monitor voting deadlines and delegate gas. Document that seed changes require new delegation and existing snapshot votes require human override.

### Day 09 — Forecast Colosseum

Setup: [app README](../apps/agents/day-09-forecast-colosseum/README.md).

**Preparation — shared phase 2, then rehearse in phase 3.** Use supported testnets for rehearsal; repeat chain-specific deployment/configuration on the production chain before acceptance.

- [ ] Verify the official UMA OOv3 deployment, production dispute/DVM support, approved `ASSERT_TRUTH2`, whitelisted six-decimal USDC and current minimum bond on the chosen chain.
- [ ] Deploy `ForecastColosseum` with intended owner/token/oracle/identifier and at least a two-hour live dispute window; verify immutables and configure addresses.
- [ ] Fund human/agent trading wallets with USDC/gas and reserve **separate assertion/dispute bond budgets**; configure actual Jev/model credentials.
**Production acceptance — after shared phase 4 deployment.**

- [ ] Register agent per-trade, cumulative market and daily caps before trading; verify direct contract enforcement and owner trading-pause controls.
- [ ] Publish precise immutable market rules, cutoff/time zone, authoritative resolution sources and missing-data/INVALID handling; perform both human and agent trades with real evidence.
- [ ] Verify cap/confidence/cutoff rejection; make an actual bonded assertion, exercise a real oracle dispute and wait for supported oracle resolution/settlement.
- [ ] Claim actual USDC winnings/refunds and reconcile events/balances; verify duplicate claims, INVALID/no-winner outcomes and ranking/calibration updates.
- [ ] Verify/document trading pause versus available claims, 30-day unasserted stale recovery and pending-dispute restrictions; no local oracle double counts as DVM acceptance.
- [ ] Operate oracle/dispute monitoring with funded bond budgets and incident response; obtain independent contract review before increasing stakes.

### Day 10 — Human Checkpoint

Setup: [app README](../apps/agents/day-10-human-checkpoint/README.md).

**Preparation — shared phase 2, then rehearse in phase 3.** Use supported testnets for rehearsal; repeat chain-specific deployment/configuration on the production chain before acceptance.

- [ ] Create the production World ID app/RP and fixed action; configure private `WORLD_APP_ID`, `WORLD_RP_ID`, `WORLD_SIGNING_KEY` and `WORLD_ACTION` with the actual production proof flow.
- [ ] Prepare private Supabase database and a 32+ character `CHECKPOINT_SESSION_SECRET`; verify checkpoint schema/RLS and persistence. Plan the final passkey RP/domain; establish its stable HTTPS origin during shared phase 4 before real identity acceptance. Keep the operator token separate from visitor identity.
- [ ] Verify an actual ERC-8004 IdentityRegistry on the selected chain, configure `CHECKPOINT_REGISTRY` and register the agent wallet; do not substitute Day 03's custom passport.
- [ ] Provision a dedicated managed voucher signer. Deploy `HumanCheckpointRewards` with intended owner, six-decimal USDC, verifier, fixed reward and `keccak256(UTF8(WORLD_RP_ID + ':' + WORLD_ACTION))`; verify configuration matches its immutables.
- [ ] Fund only the intended USDC reward budget and ensure visitors can pay claim gas. Document that the offchain verifier is trusted to authorize rewards and protect that signing key accordingly.
**Production acceptance — after shared phase 4 deployment.**

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

## Configuration references — October 10, 2026

The credential names above were checked against `packages/config/src/index.ts`, `scripts/readiness.mjs`, each app's `.env.example`, and the actual wallet/payment/database adapters. [Supabase database connections](https://supabase.com/docs/guides/database/connecting-to-postgres), [thirdweb server SDK setup](https://portal.thirdweb.com/typescript/v5/getting-started), and [CoW API networks/authentication](https://docs.cow.fi/cow-protocol/integrate/api) were rechecked. Supabase session pooling is a suitable default; both drivers now disable prepared statements for transaction-pooler compatibility. This documentation does not claim that any accounts, keys or contracts have been provisioned.

## Day 06 network configuration update — October 10, 2026

Day 06 now defaults to Base Sepolia (`CHAIN_ID=COW_CHAIN_ID=84532`), including its private local configuration, matching the owner's testing requirement. Production remains Base (8453). The adapter explicitly rejects unavailable Base Sepolia live CoW operations before issuing a signing payload or approval, rather than falling through to Ethereum Sepolia. Remaining implementation/dependency work: establish a genuine Base Sepolia solver/settlement path; changing configuration cannot provision an external CoW deployment. Local demo testing remains available and labelled simulated.

## All-days Base/Supabase alignment audit — October 10, 2026

Reviewed the ten daily configuration boundaries, shared chain/database layers, nine custom contracts, daily chain adapters and Foundry deployment wrapper. All examples now name Supabase and default to Base Sepolia; Base is the production target. Ethereum Sepolia configuration/fallback has been removed; local Anvil remains available for isolated tests. Supabase drivers disable prepared statements, require remote TLS by parsed hostname, keep connections separate by database URL and enable RLS on both app tables. Wallet/escrow/treasury adapters verify relevant owner/token/vault configuration; chain readers reject an RPC network mismatch, and the deployment wrapper rejects other public networks before broadcast.

See [the detailed per-day audit](BASE-SUPABASE-ALIGNMENT-AUDIT.md) for evidence and remaining external work. These changes do not deploy or fund public contracts, provision Supabase accounts, or establish real provider acceptance. Day 06 Base Sepolia live solver settlement remains unavailable; Day 02 facilitator authentication depends on the selected production provider. UMA documentation lists both requested networks, but Base Sepolia has no production DVM dispute support.

Final local alignment validation: **lint/typecheck, 82 application tests, 44 contract tests, seven actual Anvil integrations, ten production builds and ten fresh production HTTP workflows pass**. Supabase driver tests use an explicit mock connection; account acceptance remains unchecked. Production-build warnings from the inherited viem/ox dynamic dependency remain. Hosted CI must verify the new pushed commit separately.

Hosted check status for implementation commit `8193788`: build/container CI is pending. GitGuardian flags five invented PostgreSQL URI fixtures in `tests/supabase-store.test.ts` and `tests/network-alignment.test.ts`; these are mock-driver/fetch tests, not provisioned credentials or reachable database accounts. Review and dismiss those specific false-positive incidents in GitGuardian before treating the security check as passing. No real secret rotation is required for these fixtures.

GitGuardian fixture follow-up: the owner marked the five original findings as false positives. Mocked database URLs now contain no usernames/passwords and use reserved `.invalid` hosts; the TLS parsing regression uses a harmless `localhost` query value. Repository guidance requires credential-free mock fixtures without excluding tests from secret scanning. Focused tests, lint and typecheck are verified before publishing this follow-up; the next hosted scan remains separate.

Environment template follow-up: root `.env.example` now lists the complete configuration reference for Days 01–10 instead of a two-line pointer. All ten daily templates include the official Base Sepolia public RPC, known token/model/settings defaults and field-level instructions for provider keys, Supabase URI, generated secrets and actual deployed addresses. Unused server signer fields were removed from Days 03 and 06. Templates remain in demo mode until real prerequisites are completed; existing private environments are preserved. Contract addresses, worker measurements, registry/oracle/vault configuration and funding remain pending, not invented defaults. Validation: 14 network/readiness tests and lint pass; every template parses through the shared config schema.

Root environment clarification: `.env.example` is again a pointer to the ten app-specific templates, with no configuration assignments. Each app loads its own private `.env.local`; the populated daily templates remain the configuration source. Verified the root contains comments only and the daily templates were preserved.

Service-specific environment naming: runtime, stores, readiness, tests and daily docs now use `SUPABASE_DATABASE_URL`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_SMALL_MODEL`, `OPENAI_LARGE_MODEL` and `JEV_API_KEY`. All ten private `.env.local` files were updated to the same annotated layout as their examples; existing values were preserved and checked without printing them. Hosting/secret-manager settings using previous names must be renamed before deploying this revision. Root environment remains a pointer; no private values are committed. Live account/provider acceptance remains separate.

See [environment field guide](ENVIRONMENT-SETUP.md). Empty known non-secret local settings now inherit the daily template defaults; previously populated private settings remain preserved.

GitGuardian recurrence clarification: its GitHub skip action tags the check-run findings; it does not make the underlying incidents Ignored. The same five incidents from commit `8193788` remain in PR history. Set incidents 38086180–38086184 to **Ignored → False positive** in the GitGuardian dashboard for persistent dismissal, then rerun the check. Current test fixtures have no credentials. See [GitHub check-run skip behavior](https://docs.gitguardian.com/internal-monitoring/prevent/detect-secrets-in-real-time-in-github) and [ignored incident lifecycle](https://docs.gitguardian.com/internal-repositories-monitoring/remediate/overview).

Environment rename validation: lint/typecheck, all 82 application tests, seven actual local-chain integrations, ten production builds and ten fresh production HTTP workflows pass. All ten private and example environments parse; existing populated values are preserved and private files remain ignored. Hosted CI must verify the new commit independently.

## Day 11 — ordered production completion checklist

Preparation and Base Sepolia rehearsal:

- [ ] Configure Supabase testing URI, unique operator token, actual Jev access, public owner wallet and dedicated compute buyer signer in Day 11’s private environment. No OpenAI key required.
- [ ] Fund deployer/provider/buyer with Base Sepolia ETH and buyer with test USDC; deploy `GpuNightMarket(owner, USDC)` and set its actual address. Verify constructor owner/token/network.
- [ ] Obtain an Akash account/lease budget, select verified GPU capacity and storage class, publish/pin reviewed worker and Ollama image digests, and provision the supplied SDL after reviewing lease pricing and private provider key handling.
- [ ] Pull/pin the Ollama model, verify GPU use with hardware/Ollama evidence and configure persistent output storage, provider signer, token and delivery gas. Verify restart/retry recovery.
- [ ] Put the worker behind HTTPS and public status behind WSS; keep Ollama internal. Configure ingress limits. Worker HTTPS is an integration prerequisite; public app hosting still comes later.
- [ ] Register actual provider model/VRAM/slots/minute price from its wallet; reconcile advertised capacity with worker concurrency. Pin its reviewed wallet/origin/private token/public WSS in `GPU_PROVIDERS`.
- [ ] Owner allowlists stalls and grants the dedicated buyer’s job/daily caps and expiry; verify the caps match app configuration. Keep buyer/owner keys off leased provider machines.
- [ ] Run small funded Base Sepolia human and agent jobs using real Jev and real GPU inference. Verify input/model/output commitments, exact price protection, allowance, confirmed delivery, USDC payout and observed availability.
- [ ] Verify direct-contract overspend/replay/capacity rejection; pause preserves delivery/refunds; expire and refund a failed job; recover a paid output without inference or payment duplication. Record actual transaction/lease/GPU/provider evidence.

Production preparation and release:

- [ ] Obtain independent review of the custom escrow, worker signer handling, endpoint admission and failure recovery; explicitly accept output-delivery trust assumptions and retention policy.
- [ ] Create production Supabase/provider namespaces and deploy Base mainnet market with Circle Base USDC. Configure Base RPC, verified addresses and narrowly funded production buyer/provider wallets. Repeat listings, endpoint bindings, caps and allowlists for production.
- [ ] Deploy the independent Day 11 app on its final HTTPS origin with private secrets and sufficient request duration; verify authentication, route/rate limits, backups and restart durability.
- [ ] Complete small funded production human/agent delivery, cache recovery, price/cap rejection, refund and pause acceptance with real Jev/GPU endpoints, reconciled balances and exported receipts.
- [ ] Monitor capacity, lease expiry, provider health, signing gas, failed/expiring jobs and backup retention; establish incidents/rollback/pause procedures. Address scaling before exceeding 100 providers/1,000 lifetime jobs.
- [ ] Verify CI for the final release commit, record environment/lease/contract/transaction evidence and owner sign-off, then open public access.

No live Akash lease, actual GPU execution, paid Jev, real Supabase account or public-chain deployment/funding is claimed by local tests. This app is a single-operator control room; a public multi-tenant service and answer-correctness dispute mechanism require separate implementation before advertising them.

## Day 11 local build evidence — October 11, 2026

Lint/typecheck, **87 application tests**, **52 contract tests**, all **eight actual Anvil cases** (including the worker HTTP/WebSocket/human-agent compute flow), and **all eleven production builds** pass. Five compute application tests and eight compute contract tests exercise the new workflow and safety constraints. Browser reservation/delivery and copper layout were verified; [the final audit](DAY-11-AUDIT.md) maps each canonical requirement to implementation/evidence. Hosted CI and local Docker execution are separate checks; no local Docker server was available for container validation. App/container CI now includes Day 11 plus the GPU-worker image. Actual Akash, GPU, Supabase, Jev and public-chain acceptance remain unchecked above.

Final fresh production HTTP audit: all eleven page/API/core-workflow/receipt checks pass, including Day 11 agent reservation/delivery and human expiry refund. Readiness correctly lists the unconfigured live keys, market/worker deployment, operator access and final HTTPS origin; no live item was checked off.

## Day 12 — ordered completion checklist

- [ ] Resolve the **native Story requirement versus fixed Base networks**: approve a Story-chain exception or design/implement a verified supported cross-chain registration/licensing/royalty integration. Story SDK 1.4.4 supports Aeneid/Story, not Base, and Story payment currencies must be verified separately. The custom Base registry must not be called Story/PIL. This is implementation work, not just an API key.
- [ ] Review actual legal license text, authorship/rights verification, public-IPFS consent and offchain use declarations. Decide what the three technical Base templates can legitimately represent; do not advertise copyright proof or AI detection.
- [ ] Obtain testing Supabase URI, actual Jev access, Pinata public-upload JWT and thirdweb server secret; set Day 12's private operator secret and public owner wallet. No OpenAI key required.
- [ ] Prepare a dedicated license-buyer signer and testing USDC/ETH; fund the Base Sepolia deployer. Deploy ProvenancePress(owner, Circle USDC), record its address/block and verify owner/token/template hashes/NFT behavior.
- [ ] Configure actual registry, deployment block and matching Base Sepolia token/RPC. Owner signs buyer caps/expiry and explicit work approvals. Keep the buyer key separate from owner/artist keys.
- [ ] With real Jev, select and inspect each approved template; test rejection/low confidence. With consent, upload actual public metadata to Pinata, retrieve it from IPFS independently and verify content commitment. Confirm cancelled registration can leave a public uploaded file.
- [ ] Register original and permitted remixes using owner/creator wallets. Test no-training/no-derivative restrictions, duplicate rejection, inherited terms/minimum price and ancestor depth.
- [ ] Buy minimal funded human/agent training/inference/remix licenses, verify dedicated agents cannot buy human-use rights, check direct-contract caps/allowlist/expiry and pause. Reconcile every USDC unit in a multi-level royalty waterfall; claim from separate creator wallets and reject duplicate claims.
- [ ] Verify public certificate/NFT owner/hash/metadata/terms and real paginated royalty history, including external purchases, empty pages and explicit truncation. Record public transaction/provider evidence.
- [ ] Obtain independent contract/security review, legal/ownership policy and IPFS pinning/retention plan; add indexing/scalability before 500 works/2,000 licenses or dense history windows.
- [ ] Deploy a separate Base production registry and configure production Supabase/provider keys, addresses, deployment block and narrowly funded wallets; repeat caps/approvals and the funded acceptance workflow.
- [ ] Host the independent app on its final HTTPS origin with private secrets, operator authentication, ingress/rate limits and durable backups; verify restart/restore and public/private route boundaries.
- [ ] Verify CI for the release commit, monitoring/pinning/royalty/incident procedures, retained evidence and owner sign-off before public release. Native Story acceptance remains separate until its implementation gap is actually resolved.

No paid provider, actual Supabase, public IPFS upload, Base deployment/funding or native Story transaction is claimed by local tests. Jev/Pinata fixtures, simulated licenses and real local-chain transactions are recorded separately in [the Day 12 audit](DAY-12-AUDIT.md).

Day 12 final local evidence: lint/typecheck, 92 application tests, 60 Solidity tests, all nine actual local-chain cases, all twelve independent production builds and all twelve fresh production HTTP workflows passed. Browser registration, agent purchase and royalty claim were verified. The production-server audit uses demo providers; funded Anvil transactions are separate evidence. Public providers, Base deployments and native Story integration remain unchecked.

## Day 13 — ordered production completion checklist

- [ ] Review the fixed supply, 20% creator allocation, 90-day cliff/365-day vest, perpetual virtual-reserve curve and holder distribution terms; obtain independent contract review and review applicable token/revenue legal obligations.
- [ ] Obtain **Supabase Session pooler URI**, **TypeSafe Jev key**, **OpenAI key/model access** and **thirdweb server secret**; fill the detailed Day 13 `.env.local`, unique operator token and public owner wallet. Keep testing and production Supabase projects separate.
- [ ] Create a dedicated gas-only buyer signer; set `LAUNCH_AGENT_BUY_CAP` and `LAUNCH_AGENT_DAILY_CAP`. Owner approvals, pause and 24-hour expiry must be rehearsed before arming autonomous purchases.
- [ ] Fund deployer/creator gas on **Base Sepolia (84532)**; deploy **AgentLaunchGantry** with test Circle USDC; verify source/constructor, copy receipt address to `LAUNCH_FACTORY`; deploy owner-controlled **GantryBuyerVault** with owner/signer/USDC/factory and set `LAUNCH_BUYER_VAULT`, then run online readiness.
- [ ] Launch a real test agent and token in one browser transaction; confirm fixed supply/zero owner, public prompt, vested creator allocation and no admin reserve withdrawal. Verify supply through actual thirdweb access.
- [ ] Fund buyer vault/client test USDC and signer/client gas; verify exact approvals, slippage/deadline reverts, human/allowlisted agent buys, budget persistence/expiry/pause and sell reserve boundaries.
- [ ] Pay an actual text-service job; verify Jev gate, OpenAI output, onchain job/request binding, cached replay and failed-provider retry. Confirm no payment is spent twice and no automatic refund is promised.
- [ ] Transfer holder tokens, pay a second fee/tip and claim each wallet's exact eligible USDC; verify prior holder dividends persist, inventory/vesting exclusion, reserve solvency and duplicate-claim rejection. Rehearse creator vesting.
- [ ] Validate Supabase durability/restart recovery, public-feed redaction, rate/body/origin limits, receipt verification, private key handling and backup/retention policy.
- [ ] Complete contract review fixes and provider/wallet acceptance; prepare separate **Base mainnet (8453)** secrets/USDC/factory, deploy and verify production contracts, then fund the limited operating wallets.
- [ ] Publish and execute **DAY-13-DUNE.sql** for the mainnet factory; obtain **DUNE_API_KEY**/numeric **DUNE_LAUNCH_QUERY_ID**, schedule fresh (<24h) results, reconcile received revenue/trade totals with RPC. Sepolia indexing is not assumed.
- [ ] Deploy Day 13 independently to its final HTTPS origin, configure private environment and operator access, verify browser wallet/service/revenue flow and production database recovery under hosting request limits.
- [ ] Verify hosted CI/container checks, run a funded public-chain acceptance with independent wallets, establish service/model uptime and revenue/reserve monitoring, publish limitations and release.

No live provider keys or public Base launch/payment is claimed by local tests. SQL fixtures do not prove Dune execution; a saved mainnet query must be tested after deployment. Core local implementation and production preparation are documented in [Day 13 audit](DAY-13-AUDIT.md).

Day 13 local build evidence — October 13, 2026: frozen pnpm install, lint/typecheck, 97 application tests, 69 Solidity tests, all ten actual local-chain cases, all thirteen independent production builds and production HTTP workflow checks passed. Browser simulated paid-agent output and holder claim were verified. Public/operator boundary tests cover private-state redaction and unauthorized autonomous actions. Production audit retains one low inherited dependency advisory; native provider/deployment/legal/security/release items above remain unchecked.

Day 13 onchain buyer setup: after the factory deployment, deploy `GantryBuyerVault(owner, agentSigner, CircleUSDC, factory)` and set `LAUNCH_BUYER_VAULT`. Owner-signed grants atomically replace the allowed listing IDs and set caps/24-hour expiry; owner-signed revoke stops the vault. Fund the vault with limited USDC, the signer with gas only. Owner recovery and holder-revenue claims use wallet previews. The vault checks the actual factory listing and retains UTC-day spent across renewed grants.

## Day 14 — ordered production completion checklist

- [ ] Review GuardrailSentinel custody, hard caps, guardian oracle trust, 5-minute permits, UTC-day accounting, global epochs and EOA/ERC1271 owner signatures; obtain independent contract/security review before meaningful funding.
- [ ] Create separate owner custody, guardian signer and gas-only session keys. Populate private `SENTINEL_GUARDIAN_PRIVATE_KEY` and `SENTINEL_SIGNERS` JSON; never use owner/guardian keys as agent sessions.
- [ ] Obtain **Supabase Session pooler URI**, unique random **OPERATOR_TOKEN**, **TypeSafe Jev key** and **OpenAI key/model access**. Configure the annotated Day 14 `.env.local`; use separate test/production databases.
- [ ] Create a **Tenderly project**; set **TENDERLY_ACCESS_KEY**, exact **TENDERLY_ACCOUNT_SLUG** and **TENDERLY_PROJECT_SLUG**. Verify actual Base Sepolia simulations; official network compatibility is verified, account access is not.
- [ ] Fund deployment gas on **Base Sepolia (84532)**; deploy **GuardrailSentinel(owner, guardian, CircleUSDC)**, verify source/constructor and set `SENTINEL_VAULT` from its receipt.
- [ ] Verify intended allowlisted contract recipients can safely receive/recover direct USDC payments; this capability does not call arbitrary service methods or approve unrelated protocols.
- [ ] Owner-sign each session's policy, caps, threshold, start/end and contract allowlist; fund narrowly limited onchain compartments and native gas for session/guardian signers. Do not fund session EOAs with treasury USDC.
- [ ] Verify real Jev MCP request gates and chat model routing; test unavailable/malformed provider responses, body/rate/origin limits and critical financial abuse. Do not infer live-model success from fixtures.
- [ ] Execute an actual low-value scoped payment with RPC/Tenderly previews, then high-value and low-confidence payments with real owner signatures. Verify target/amount/nonce/chain/domain mutations and replay fail.
- [ ] Drill global owner/guardian revoke, gas exhaustion alerting, owner-only resume, required re-enrollment and retained daily counters; verify pending permits and old session keys cannot execute after reopening. Test owner recovery while stopped.
- [ ] Verify actual Supabase restart/concurrent-state durability, receipt integrity, RLS/private records, key custody, backups/retention and operator ingress protections. Decide and implement scheduled/background monitoring if required beyond request-derived incidents.
- [ ] Revoke legacy wallet/session authorities and recover/migrate funds from earlier agents before enrolling replacement Sentinel policies. Existing Days 01–13 wallets are not automatically protected by this build.
- [ ] Complete review fixes and Base Sepolia acceptance; prepare separate **Base (8453)** configuration/USDC/factory custody, deploy and verify the mainnet Sentinel, then fund limited production compartments and gas.
- [ ] Deploy the independent Day 14 app to its final HTTPS origin with private secrets and sufficient request duration; verify real wallet co-signing, authenticated external MCP clients, live model/simulation flow and production persistence.
- [ ] Verify hosted CI/container checks, run funded public-chain acceptance with independent wallets, publish perimeter limitations/runbooks, establish model/RPC/guardian-gas/incident monitoring and release.

Day 14 local tests, simulation fixtures and actual local-chain signatures are recorded separately in [the audit](DAY-14-AUDIT.md). No live provider, Supabase or public-chain production item is checked off from local evidence.

Day 14 release verification (October 14, 2026): frozen install, lint/typecheck, 102 application tests, 78 contract tests, all eleven separate local-chain cases, fourteen independent builds and fourteen production HTTP workflows passed. Browser payment/approval/revocation/re-enrollment checks passed. Hosted CI for this new release remains pending; the audit records provider fixtures and live acceptance boundaries separately.

Day 14 design follow-up: Three.js fleet topology now reflects recorded request states, authoritative session validity and daily budget usage, with linked agent selection, orbit, pause/reduced motion and a WebGL fallback. Ten-second visible-page refresh reports failures as last-known state. This is request-state visualization; public-chain event subscriptions/background anomaly monitoring and earlier-wallet enrollment remain separate production work. Validate GPU fallback, reduced motion and larger fleet usability on the final hosted release.

Day 14 fleet management: sandbox initialization now loads five sample agents once (Atlas, Mercenary, Aerostat, Oracle and Courier). Existing three-agent demo state receives the two missing samples without resetting historical policies/spending. **Enroll a new session** adds an agent; **Remove agent** requires confirmation and, in real mode, an owner-signed onchain `remove(id)` transaction. It clears session authority, pauses and advances policy version, invalidating permits. Removed agents leave the roster/projection but remain in **Removed agents** for owner recovery and explicit re-enrollment. Balances, daily spending, IDs and audit records are retained; removal never erases financial history or automatically transfers funds. New IDs remain append-only, with 100 lifetime compartment slots.

The contract now includes `remove(uint256)`; any deployment from the earlier non-upgradeable artifact needs a reviewed replacement deployment/migration before this control is available. No public deployment is claimed. Removal and fund recovery passed the funded Anvil case; 105 application tests, 79 contract tests and Day 14 production build passed. Browser removal/archive/re-enrollment was verified.

Sentinel projection selection now rotates the selected satellite onto the front focal meridian with eased shortest-arc motion. Selection works from satellites, agent buttons and policy roster; dragging overrides orbit until the next selection. Pause/reduced-motion selection snaps without animation. Focus geometry tests cover fleets of 1–24 satellites; browser selection and paused positioning were verified. Lint/typecheck, focused tests and the independent Day 14 production build passed.

## Day 15 — ordered production completion checklist

- [ ] Review the **Centrifuge AsyncVault** adapter and exact issuer version/interface, required share approvals, request ID 0, NAV cadence, cancellation/recovery routes and request/claim semantics. Local fixtures are not Centrifuge acceptance.
- [ ] Complete **issuer KYC/AML/onboarding** directly with the issuer. Obtain current offering documents, legal issuer, permitted jurisdictions, investor category, minimum, fees, settlement/redemption terms and wallet allowlisting. This app accepts no identity documents and self-declarations do not establish eligibility.
- [ ] Obtain an issuer-approved **Base Sepolia (84532) USDC AsyncVault and share token**, along with actual permission for the test investor wallet. Do not copy the Base mainnet JTRSY addresses into testnet configuration. Protocol availability does not imply that a particular issuer offers a public test pool.
- [ ] Obtain a verified **Chainlink Base Sepolia USDC / USD proxy**, confirm its heartbeat and rounds, and set `CHAINLINK_USDC_USD_FEED_ADDRESS` and `CHAINLINK_USDC_MAX_AGE_SECONDS`. If no supported feed is available, resolve that test dependency explicitly; a deployed oracle fixture is not a live Chainlink DON.
- [ ] Provision the testing **Supabase Session pooler**, **TypeSafe Jev key**, **OpenAI API key/model access**, unique deployment **OPERATOR_TOKEN**, private RPC and public investor **OWNER_ADDRESS**. No server spending/private agent key or thirdweb credential is used.
- [ ] Build a reviewed **RWA_CATALOG_JSON** for the exact test vaults. Bind each fact to issuer/protocol sources, set future `reviewUntil`, actual allowed countries/minimum, appropriate NAV maximum age and an intentional allocation cap. The disabled mainnet example is a template requiring issuer review, not investment authorization.
- [ ] Fund the investor test wallet with Base Sepolia gas and Circle USDC; verify exact approvals, rejected issuer permission, stale NAV/feed, depeg handling, preview expiry, changed declarations, uncertainty review and explicit wallet confirmation before requests.
- [ ] Execute actual issuer request → fulfillment → claim → redemption → fulfillment → USDC claim. Confirm share/value/pending states directly onchain, exact receipt matching, no reuse, and resume after timeout/reload. Revoke leftover allowances after abandoning a multi-step instruction; verify direct issuer recovery/cancellation procedures.
- [ ] Validate **live Jev + Vercel AI SDK/OpenAI** responses against issuer documents, rejected/malformed providers, citation IDs and quick/compliance model routes. Structural citations do not independently verify every generated claim.
- [ ] Review investor privacy, Supabase isolation/least privilege, receipts and source retention, archive export/rotation, backups, abuse controls and operator key custody. Keep professional/country declarations out of public logs.
- [ ] Prepare separate **Base mainnet (8453)** RPC/database/issuer onboarding/catalog. Reverify the official JTRSY vault/share and any other product, issuer documents, minimum and allocation cap, mainnet Chainlink USDC proxy/heartbeat and sequencer uptime guard. Mainnet address reads do not establish purchase eligibility.
- [ ] After local/provider rehearsal, deploy the independent app at its final **HTTPS origin**, private credentials and sufficient execution duration; verify browser wallet switching, explicit multi-step signing, error/resume behavior and hosted Supabase durability.
- [ ] Perform the bounded funded mainnet acceptance run with the issuer and investor, verify actual settlement/redemption and support runbooks, confirm hosted CI/container results, monitoring, privacy disclosures and release approval before public launch.

No Day 15 live financial, identity, provider or hosted-production item is completed by simulated screening or test-only issuer/feed contracts. Base read-only JTRSY evidence is recorded separately in the daily audit.

Deployment audit correction: Days 13 and 14 inherited a Vercel build command targeting Day 12. Each now targets its own day, and Day 15 targets 15. Local independent builds passed; hosted Vercel deployment acceptance remains separate. A cross-app configuration regression checks every day’s deployment target.

Day 15 release checks (October 15, 2026): frozen pnpm install, lint/typecheck, **113 application tests**, **81 contract tests**, **all twelve separately enabled local-chain cases**, **fifteen independent production builds** and **fifteen fresh production HTTP workflows** passed. Browser checks covered declarations, disabled confirmation until acknowledgment, cited answers, request/fulfill/claim/redeem/withdraw, final cash/holdings and reload persistence. [Browser evidence](day-15-browser.png). The Day 15 funded case additionally rejects issuer permission revoked after preview, unrelated receipts, missing confirmation and stale oracle rounds. Preflight simulates the exact next owner transaction with RPC before wallet submission. Production dependency audit retains one inherited low advisory; hosted CI/container and live-provider acceptance remain separate.


## Day 16 — ordered production completion checklist

- [ ] Review **BotBourse** contract/escrow economics and dispute terms: immutable Circle USDC/registry/arbiter/order cap; 24-hour review/release; 7-day unresolved dispute 50/50 fallback. Complete independent security review before real funds.
- [ ] Verify the actual official **ERC-8004 Identity Registry** on **Base Sepolia (84532)**; register a buyer and each seller, bind actual `agentWallet` proofs and record IDs. Do not substitute Day 03's custom passport registry or the unrestricted test fixture. V1 client enrolls EOA sellers; add/test ERC1271 client verification before enrolling smart-wallet sellers.
- [ ] Establish separately controlled buyer browser wallet, gasless seller signing keys and arbiter wallet/custody. Define how parties accept arbitration terms and how the arbiter handles evidence; keep seller signing keys separate from buyer money.
- [ ] Provision testing **Supabase Session pooler URI**, unique **OPERATOR_TOKEN**, dedicated **Base Sepolia RPC**, **TypeSafe Jev API key**, and **OpenAI project key/model access** for local sellers. No thirdweb/Tenderly or server buyer-spending key required. Keep earlier-day envs isolated.
- [ ] Deploy **BotBourse** with the verified test Circle USDC, registry, arbiter and intentional immutable cap. Verify source, constructor and onchain `usdc`, `registry`, `arbiter`, `maxDeal`; enter `BOURSE_ESCROW`, `BOURSE_REGISTRY`, buyer wallet/ID and matching app cap.
- [ ] Enroll actual sellers in **BOURSE_SELLERS_JSON** with skills, minimum price/time, registered wallet/ID and distinct private bearer tokens. Add matching gasless keys only for local sellers. For independent services, pin exact reviewed HTTPS A2A 1.0 cards/interfaces implementing [Bourse v1](BOURSE-A2A.md), verify domain/DNS and hosting egress rules; do not enable open URL submission.
- [ ] Fund the buyer with limited **Base Sepolia ETH and Circle USDC**. Run genuine model negotiations and representative Jev calibration/uncertainty evaluation. Verify minimum price/deadline, ceiling, unsafe input rejection, six-round bound, malformed/unavailable providers and independent seller interoperability.
- [ ] Complete a funded public testnet order: card/registry discovery → counter/accept → explicit human confirmation → exact allowance and signed escrow funding → actual text artifact → signed delivery anchor → buyer review/release. Verify chain receipts, identity transfer before funding, changed terms, expired offers, duplicate transactions and receipt replay rejection.
- [ ] Rehearse missed-delivery full refund, disputed delivery/arbiter split, review-window release, 7-day fallback, pause with recovery and direct contract access if hosting is down. Document review/timeout monitoring and notifications; no background keeper exists in this build.
- [ ] Validate **Supabase** buyer/seller namespace isolation, concurrent/restart/idempotent recovery, token rotation, pending wallet hash resume/replacement handling and unused allowance revocation. Establish evidence export/retention before 128-order/512-instruction/256-message limits, backups, ingress/rate limits and signing-key security.
- [ ] After testnet acceptance and review fixes, prepare separate **Base mainnet (8453)** Supabase/RPC/identities/EOA wallets/arbiter and Circle USDC; deploy and verify a separate immutable escrow. Re-enroll mainnet cards/signatures and fund limited mainnet buyer amounts.
- [ ] Deploy the independent Day 16 app at its final **HTTPS origin**, set private secrets and sufficient handler duration, verify public card URLs, private A2A bearer protection, browser wallet confirmations, actual model calls and hosted persistence.
- [ ] Verify hosted CI/standalone-container checks, complete bounded funded mainnet acceptance, publish exact dispute/service/authority limitations, and confirm monitoring, recovery/backup ownership and release approval.

Day 16 local evidence and limitations: [audit](DAY-16-AUDIT.md), [research](DAY-16-RESEARCH.md), [A2A extension](BOURSE-A2A.md). No production checklist item is completed from local doubles or simulation.

Day 16 release checks (October 16, 2026): frozen pnpm install, lint/typecheck, **121 application tests**, **92 contract tests**, the separate **funded Day 16 Anvil/A2A HTTP integration**, **sixteen independent production builds** and **sixteen fresh production HTTP workflows** passed. Browser verified negotiation distributions, explicit funding/payment release, content hash/output and persisted state; mobile width 390px has no horizontal overflow. The first HTTP run exposed a missing common receipt-verification hook; the fix passed the full rerun. Earlier day local-chain cases were not re-run for this release; earlier app regression tests/production HTTP passed. [Browser evidence](day-16-browser.png). One inherited low dependency advisory remains. No live/provider/hosted checklist item is marked complete from these results.

Hosted CI blocker (October 16, 2026): Day 16 [PR #12](https://github.com/EverEye-El/dapptober-agents/pull/12) passed GitGuardian, but GitHub [refused to start all Actions jobs](https://github.com/EverEye-El/dapptober-agents/actions/runs/38969959716): recent account payments failed **or** the spending limit must be increased. No workflow steps ran. Repository owner must resolve **GitHub Settings → Billing & plans**, then rerun the checks and verify hosted containers/tests before marking release verification complete. Local passing results remain distinct from this blocked hosted evidence.


## Day17 — ordered production completion checklist

- [ ] Review **CoronerProbe** source/runtime and diagnostic threat model (all calls revert, immutable router, native cap, forged-error handling). Select an actual **Base Sepolia84532 V2 Router02-compatible token/WETH route**, factory and pools. Unsupported V3/Aerodrome or missing testnet liquidity must remain unknown, not a fake sell test or network change.
- [ ] Define lab/attester ownership and evidence-publication process. Create a browser-controlled attester wallet and separate test/mainnet Supabase projects. No server spending key, USDC funding, thirdweb or token approvals are needed.
- [ ] Provision the actual **Base Sepolia archive-capable RPC**, **Blockscout** endpoint/optional API key, **Supabase Session pooler URI**, unique **OPERATOR_TOKEN**, **Tenderly Access Token/account slug/project slug**, **TypeSafe Jev key**, **OpenAI project key/model access**, and **Pinata public-upload JWT** in the app env.
- [ ] Deploy **CoronerProbe** with the reviewed test router; verify source/runtime/immutable router/factory/WETH. Set bounded `CORONER_PROBE_ETH`. Validate a real Tenderly full-trace response exposes expected root revert data at the exact block; no token storage/balance overrides. Unrecognized results must remain unknown.
- [ ] Verify official **EAS/SchemaRegistry Base Sepolia predeploys** and register the exact revocable/no-resolver schema in the app README. Set `CORONER_SCHEMA`; earlier-day schemas are incompatible. Choose intentional report TTL/expiry.
- [ ] If time-lock coverage is needed, independently review actual **OpenZeppelin VestingWallet LP locker instances**, runtime bytecode and schedule semantics; enroll addresses/code hashes in `CORONER_LOCKERS_JSON`. Verify releasable LP is excluded, ends/beneficiaries match, changed code fails closed, and unsupported lockers remain unknown.
- [ ] Fund attester **Base Sepolia ETH for EAS gas only**. Examine real verified/unverified, owner-controlled, paused, proxy-upgradable, concentrated, restricted-sell and empty/unsupported-pool tokens. Verify pinned RPC evidence/indexer lag, minimum severity, missing-provider handling and no unauthorized onchain buy/approval/sell.
- [ ] Evaluate actual **Jev classification/severity/confidence** and **AI SDK/OpenAI narratives** against representative cases; tune escalation only with evidence. Check that text does not turn heuristic absence into clearance or accuse intent, citations refer to real findings, and low-confidence/unknown evidence always requires human review.
- [ ] Complete a consented **Pinata public upload**; independently retrieve canonical JSON and recompute hash. Publish the exact **EAS** owner-wallet instruction, inspect recipient/attester/schema/hash/expiry and matching UID, test duplicate/unrelated receipts, revoke/correct a report and verify public reader revocation/expiration/unknown-RPC status.
- [ ] Rehearse pending/reverted/replaced wallet recovery, rejected publication after pinning (public content persists), source/provider timeout, reorg/changed implementation/expired report rejection, Supabase restart/concurrent locking and operator-token namespace recovery.
- [ ] Establish public evidence/privacy language, reviewer-note consent, ingress/provider quotas, artifact retention/export before128-case capacity, Supabase/IPFS backups and ongoing model/RPC/indexer/Tenderly monitoring. Implement scheduled rescanning/revocation monitoring if required; no keeper exists yet.
- [ ] After review fixes and public testnet acceptance, configure separate **Base mainnet8453** RPC/Blockscout/Supabase/wallet, deploy/review the mainnet probe/router and EAS schema, re-enroll locker instances and fund limited attester gas.
- [ ] Deploy Day17 independently at final **HTTPS origin** with private secrets and sufficient120-second handler duration; verify wallet switching, provider reachability, publication/resume, public case JSON and hosted durability.
- [ ] Verify hosted CI/standalone containers, execute bounded mainnet evidence/publication/revocation acceptance, confirm retention/recovery/monitoring ownership and release approval. Keep the earlier GitHub billing/spending blocker unresolved until hosted jobs actually run successfully.

Day17 source boundaries and tested evidence are maintained in [the audit](DAY-17-AUDIT.md) and [research](DAY-17-RESEARCH.md). Read-only public token evidence is not a live sell result, and local official EAS tests are not public-chain publication.

Day17 release verification:130 application tests passed (15 opt-in skips);98 Solidity tests passed; separate Day17 funded Anvil integration and read-only Base Sepolia collection passed; all17 independent production builds and HTTP workflows passed. Desktop publication/review workflows were exercised. Genuine provider inference, public-chain sell/publication, mobile-device acceptance and hosted CI remain separate unchecked work. See the audit for fixture boundaries.

Hosted verification: [PR13](https://github.com/EverEye-El/dapptober-agents/pull/13), implementation6096cb2. [GitHub run39052425659](https://github.com/EverEye-El/dapptober-agents/actions/runs/39052425659) refused to start every job (zero steps): “recent account payments have failed or your spending limit needs to be increased.” GitGuardian passed. This is an unresolved account-level release blocker; hosted builds/containers have not executed for Day17. Local final lint/typecheck and all17 production HTTP workflows passed again after the last display correction.


## Day18 — ordered production completion checklist

- [ ] Confirm product scope: Hush currently auctions self-declared **allocation credits**, not USDC or asset claims. If funded settlement is required, implement/review an actual confidential token/asset-escrow adapter before calling it money; do not fund this ledger expecting withdrawal. Hidden-order/payroll execution requires separate adapters.
- [ ] Independently review **EncryptedConfidant** and Fhenix's coprocessor/verifier/ACL/Teecryptor trust assumptions. Review input proof binding, encrypted-zero affordability, u64 bounds, one-time initialization, same-bid tie handling, multi-lot conservation, result ACL timing and pause recovery.
- [ ] Create separate testnet guardian/auctioneer/bidder wallets. Configure actual **Base Sepolia private RPC** and **browser-visible domain-restricted HTTPS RPC**. Do not put private RPC credentials in `CONFIDANT_PUBLIC_RPC_URL`.
- [ ] Create **Supabase** testing project; copy its Session pooler URI to `SUPABASE_DATABASE_URL`. Add unique app `OPERATOR_TOKEN`, **TypeSafe Jev** key and **OpenAI** project key/model access. Keep server storage/host logging amount-free; no server wallet key or CoFHE API secret is needed.
- [ ] Confirm installed **CoFHE SDK1.0.0/contracts1.0.1** compatibility with live Base Sepolia address book/TaskManager/ACL. The documentation matrix lags npm; verify actual proof consumption and decryption, not just the passing synthetic encryption test.
- [ ] Deploy **EncryptedConfidant** from the intended guardian on **Base Sepolia84532**. Verify source, immutable guardian and version; independently hash runtime and set `CONFIDANT_CONTRACT`/`CONFIDANT_CODE_HASH`. Ensure no local mock is deployed as a privacy service.
- [ ] Fund guardian/auctioneer/bidder wallets with **Base Sepolia ETH for gas only**. Create actual encrypted allocations/bids with separate wallets, inspect ciphertext-only calldata/events, test affordable/unaffordable/zero/tie bids and duplicate rejection. Confirm sum of private balances plus consumed winning allocation is conserved across concurrent lots.
- [ ] Verify actual owner-only **ACP** decryption, unauthorized wallet rejection, creator access only after deadline, no creator access to other budgets, expiry and official revocation. Test account/network changes and scope enforcement; UI locking is not revocation of copied permissions.
- [ ] Run live close/settle, guardian pause and recovery; test rejected/reverted/pending/replaced/dropped wallet transactions and restart recovery. Implement robust replacement/drop tracking if production requirements demand it; only hash resume exists now.
- [ ] Audit actual **Jev/OpenAI** outbound payloads and host/Supabase records to confirm raw drafts/amounts/balances/recipient data are absent. Calibrate category confidence/mismatch rejection; unsupported hidden-order/payroll requests must remain blocked.
- [ ] Establish browser/XSS/CSP policy, provider quotas, public receipt retention/export, Supabase backups, ACP incident response and wallet recovery. The in-memory demo is disposable; real balances require wallet-backed decryption. No autonomous scheduler/financial settlement is shipped.
- [ ] After testnet acceptance, deploy the independent app at final **HTTPS origin** with120-second handler allowance. Verify browser WASM/proof loading, desktop/mobile wallets, viewport layouts, consent/signature text, tab-hide/two-minute lock and hosted restart durability.
- [ ] Resolve actual **Base mainnet8453 CoFHE support** with official deployment/SDK/operations evidence. Update the explicit fail-closed network gate only after support exists, deploy/review a separate mainnet contract and scope/config, and execute bounded acceptance. Do not substitute Ethereum Sepolia or invent a Base endpoint.
- [ ] Verify hosted CI/standalone container jobs actually execute, complete an independent security review and documented release approval. GitHub's account billing/spending blocker remains open until hosted evidence supersedes it.

Day18 simulation, official local mock tests, genuine remote synthetic encryption and live app deployment are distinct evidence levels. See [Day18 audit](DAY-18-AUDIT.md) and [research](DAY-18-RESEARCH.md). Earlier daily runtime behavior was not changed; shared config/types/UI workspace integration requires full regression/build checks.

Day18 release verification:139 application tests passed (16 opt-in skips);108 Solidity tests passed, including ten Day18 cases and conservation fuzzing; all18 independent production builds/HTTP workflows passed. Genuine remote CoFHE synthetic encryption/proof verification passed without broadcast. Desktop full simulation/lock and phone390px layout were checked. No live Hush deployment, real owner decryption, funded asset settlement or paid-model inference is inferred from these results.

Hosted verification: [PR14](https://github.com/EverEye-El/dapptober-agents/pull/14), implementationab97ab8, stacked on open PR13. [Run39160582541](https://github.com/EverEye-El/dapptober-agents/actions/runs/39160582541) completed with zero job steps: GitHub refused to start jobs because recent account payments failed or the spending limit must increase. **GitGuardian passed.** Hosted CI/container execution remains an account-level release blocker, not passing evidence.
