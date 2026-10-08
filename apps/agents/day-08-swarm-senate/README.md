# Day 08 — The Swarm Senate

Canonical prompt: complete Day 08 in `prompts/dapp-prompts.ts`. Holographic Roman senate with distinct value-conditioned delegate agents, public opening statements and rebuttals, Jev review flags, provisional votes, human overrides, and outcome/alignment inspection. Profiles condition model reasoning; this is not weight fine-tuning.

```sh
pnpm install --frozen-lockfile
pnpm run dev 08                 # http://localhost:3008
pnpm --filter @dapptober/day-08 run test
pnpm run test:senate-chain         # disposable Anvil integration; external AI explicitly mocked
pnpm run build 08
pnpm start 08
node scripts/smoke.mjs 08
```

## Local workflow

Convene three local delegates, table a resolution, convene a public debate, cast each provisional ballot, and override a member's ballot. Advance the explicitly simulated clock to enter human-only review and then close voting. Successful resolutions can be adopted. Local answers and ballots are deterministic and labelled; no money moves and no chain hashes are invented. Distinct profiles produce distinct votes. A human override can come before an agent votes, and still counts only once.

`/senate` is the public archive. No operator token is needed to read debates or proposal histories. Public JSON is at `/api/senate`; export each proposal's transcript and ballots from the UI. Demo sessions have private control state and merge published debates into one bounded local public archive. Real deployments use one durable DAO namespace in PostgreSQL. Profiles and proposal text are public from submission; avoid personal or secret data.

## Architecture and tools

`packages/governance` implements profile authorization, isolated deterministic delegate signers, typed proposal lifecycle, two-round debate/reasoning, Jev confidence flags/model routing, human overrides, public archive and chain reconciliation. Reuses shared AI, chain, receipts, auth and storage rather than requiring Snapshot or ElizaOS as separate runtimes. No daily server is a dependency.

Tools: `senate.profile.prepare/save`, `senate.delegate`, `senate.propose`, `senate.debate`, `senate.cast`, `senate.override`, `senate.outcome`, `senate.execute`, `senate.pause`. Local-only `senate.seed/advance` facilitate testing. Operator controls deliberation/scheduling. Members control their profiles with domain-bound revisioned EIP712 signatures, delegate with their wallets and override directly with their wallets via the public senate page. Anyone can execute a passed resolution. Members do not need the operator token to exercise override authority. The public browser prepares override calldata locally and sends it directly through the member wallet, so a loaded senate page does not wait on an operator/API lock to vote.

Jev routes full opening/rebuttal reasoning and a separate concise summary, then evaluates provisional choices for faithful alignment with each member's values. Denied ballots cannot be submitted by the agent. Low confidence is flagged for human review; it never disables the human's independent contract rights. The LLM receives supplied text as untrusted context and has no direct transaction tool. Member profiles are frozen per proposal; updates affect future proposals. Global and per-profile pause prevent new agent votes but do not retract an already counted ballot: override it before the deadline.

## Onchain components and deployment

The app governs **symbolic policy resolutions**, not treasury transfers. `SwarmGovernor` only accepts a single zero-value self-call to `adopt(bytes32)` and stores the adopted description hash after successful governance. It cannot execute arbitrary target contracts. Funding resolutions express policy intent only; they do not pay a grant.

1. Install Foundry and run all tests. Create a deployer keystore using Foundry's normal private workflow. Choose 3–32 founding membership addresses. Deploy fixed `SenateVoice` (one nontransferable VOICE per member, 18 decimals) and `SwarmGovernor`, using a timestamp delay, voting period and final human review window. Example: delay=300, period=86400, override=21600 seconds. Constructors require delay>=1, period>=120 and 60<=override<period.

```sh
node scripts/contracts.mjs create src/SenateVoice.sol:SenateVoice --rpc-url "$RPC_URL" --account dapptober-deployer --broadcast --constructor-args '[0xMEMBER1,0xMEMBER2,0xMEMBER3]'
node scripts/contracts.mjs create src/SwarmGovernor.sol:SwarmGovernor --rpc-url "$RPC_URL" --account dapptober-deployer --broadcast --constructor-args "$SENATE_TOKEN" 300 86400 21600
```

Replace illustrative membership addresses with actual checksum addresses. Record token/governor addresses and the governor deployment block. These contracts are not externally audited.

2. Copy `.env.example` to `.env.local`. Set AGENT_MODE=real, HTTPS PUBLIC_ORIGIN, operator token (32+ characters), OWNER_ADDRESS for operator-room metadata, PostgreSQL DATABASE_URL, chain/RPC, both contracts and SENATE_START_BLOCK. Use a dedicated random AGENT_PRIVATE_KEY seed, TYPESAFE_API_KEY and AI_API_KEY with supported provider/model configuration. Never use a member/treasury wallet key as the delegate seed. The derived private keys remain server-side; derived public addresses appear in each profile. Chain/governor changes or seed rotation change those addresses and require fresh member delegation and new proposals.
3. Each member opens `/senate`, connects their membership wallet and signs their profile. Its signature binds the canonical public values, priorities, pause state, member, current revision, expiry, chain and governor. Onchain balance verifies membership; revisions prevent replay. Up to eight profiles and sixteen proposals per app workspace keep inference and RPC costs bounded.
4. Members **individually delegate** their VOICE to the agent address before a proposal's snapshot. Fund only those delegate EOAs with minimal native gas. The Governor permits only membership owners to propose even when they have delegated out their votes. Root seed and derived keys are not membership wallets and cannot override a human vote. No server key is needed for the human override.
5. Create a resolution in the operator room and confirm its proposal transaction in a membership wallet. Wait for the active agent window, run the debate, inspect Jev review flags, then cast provisional ballots (or schedule the bounded worker). Exact snapshot delegate checks prevent voting with a stale or unapproved agent. A snapshot is immutable: changing delegation after it does not revoke a ballot for that proposal; use your override.
6. Members can override **once** during the active vote, including before an agent casts. OpenZeppelin `GovernorCountingOverridable` subtracts their own snapshot units from the delegate tally. Zero-membership agent addresses are blocked by the contract after `agentDeadline`; humans retain the whole voting period. After the deadline, quorum (51% of fixed membership units; for+abstain) and a strict for majority determine success. Owner wallet confirmation adopts a passed resolution; no funds move.
7. Deploy this app independently using the root Dockerfile with `APP=day-08-swarm-senate`, or a Next Node host with persistent PostgreSQL and long-running request support. Debating up to eight members involves multiple provider calls; prefer a Node container/job host over a short-duration serverless function. Route maxDuration is 300 seconds; hosted plan limits must cover the configured debate. Configure ingress body/rate limits for public endpoints and API access. The public member endpoint admits only profile/delegation/override actions, requires bounded input and protects signatures with current revision and expiry.

`PUBLIC_ORIGIN` and `OPERATOR_TOKEN` injected as secrets into `node scripts/senate-worker.mjs` run one bounded scan/debate/provisional-vote cycle. The worker only acts inside the agent window, honors global/member pause and Jev denial, and never signs human overrides or adopts resolutions. Schedule conservative intervals and fund delegate gas sparingly. UI “Refresh chain” reconciles external human overrides, Governor tallies and status; it scans a bounded 2,000-block slice per refresh starting from deployment. Repeat until `scannedThrough` reaches the live head when backfilling. Historical metadata/transcripts require a backed-up database; the chain retains ballots, snapshots and adopted resolution hashes.

## Outcome and trust boundaries

Actual Governor tallies/status control real outcomes; database debate text never authorizes execution. Agent-versus-human alignment is measured only for tracked delegates with explicit override choices; unchanged unreviewed ballots are not treated as agreement. Other member votes still contribute to chain totals even if their profiles were not enrolled in this archive. Proposal description and profile snapshots remain inspectable.

This is one immutable equal-membership cohort per deployed token; adding or removing founding members requires a new DAO deployment. It is not token-weighted treasury governance, Snapshot integration, a fully autonomous DAO scheduler service, or a model-training platform. Real providers, durable storage, funded delegate wallets and public-chain deployment need external credentials. The complete local workflow, Solidity voting logic and failure cases are tested; live provider and funded deployment results are recorded separately in the final audit.

The real governance adapter uses the latest chain timestamp for lifecycle guards and reads quorum only after a historical snapshot exists. It also checks that the configured voice token matches the Governor. `pnpm run test:senate-chain` starts and stops its own disposable local Anvil node on port 18548, deploys both contracts, verifies member signature/replay handling, delegates, debates with mocked external cognition, casts actual transactions, overrides, reconciles logs and executes a successful resolution. Public-chain providers and live AI/Jev services are separate external validation.
