# Overrule — The Restaked Referee / Day20

Stadium lights, striped officials and an instant-replay booth for agent results. Operators independently re-run supported tasks and sign EIP712 verdicts; dishonest calls lose locked collateral. Jev supplies a confidence-scored slash/release recommendation, while the contract enforces objective truth. The original daily graphic is preserved and inspires the copper stadium/scoreboard design.

## Run and test

Use pnpm10.2.0 at repo root: `pnpm install --frozen-lockfile`, `pnpm --filter @dapptober/day-20 dev`, then http://localhost:3020. Build/start use that app’s independent scripts. Copy `.env.example` to `.env.local`; demo needs no keys. It seeds three explicitly simulated tasks with real ephemeral EIP712 signatures and fixture collateral. Demo time skipping never affects real mode.

Tests: `pnpm exec vitest run tests/day-20.test.ts tests/day-20-eigen.test.ts`, `pnpm run test:contracts`, `pnpm run test:referee-chain` (requires Anvil). Native destination-verifier tests mock RPC; local funded contract tests are not genuine EigenLayer, Supabase, Jev or OpenAI evidence.

## Architecture and scope

The shared `@dapptober/referee` package supplies deterministic execution, commitments, operator signatures, confidence gates, wallet previews, receipt verification and optional Eigen certificate inspection. Each deployment is independent of all earlier daily servers. Node handlers use shared durable agent-core storage and receipts. Supported task rules are sum or maximum of1–32 signed64-bit integers. They are examples of reproducible agent work; arbitrary prose, nondeterministic inference or subjective quality is **not** objectively slashable here.

A task ID hashes ABI-encoded `(creator,agentId,kind,inputs,claimed,salt)`. The exact ABI bytes are its validation request payload; the UI/API returns an octet-stream data URI. An operator runs the same pinned algorithm in Node and signs task/operator/pass/evidenceHash/deadline with chain/contract-bound EIP712. Claims and inputs are public onchain. The private operator booth is not private computation.

`RestakedReferee` holds reviewed ERC4626 receipt shares as collateral. Register deposits10–1000USDC into the immutable vault, with a minimum-share/slippage preview. Each verdict reserves shares equivalent to10USDC **at submission**, and locks them until the review window ends. Only free shares may withdraw. Anyone can challenge a provably wrong pass/fail during review. Anyone can settle afterward: wrong calls are slashed even without a challenge; honest calls release their lock. Slashed **vault shares**, not guaranteed liquid USDC, go to the task creator. Shares can appreciate, lose value, or become illiquid. No fixed yield/reward is promised. Collateral cannot be reused simultaneously beyond available unencumbered shares.

Guardian pause stops deposits/new tasks/new verdicts, but preserves exit and settlement. Guardian is deployer; use a reviewed multisig in production. There is no model-controlled slashing, unrestricted financial agent or arbitrary execution tool.

## Base, EigenLayer and ERC8004 boundaries

Base Sepolia84532 is testing; Base8453 is production. Circle USDC is enforced on those chains. Review/deploy `contracts/src/RestakedReferee.sol` with approved vault, optional actual validation registry and review window **at least3600seconds** on public Base chains. Pin runtime hash and deployment block. Local fixtures allow60seconds only on31337.

Current EigenLayer v1.9 destination contracts on Base verify operator certificates; native restaking, allocation and slashing remain on Ethereum source chains. This app does not silently substitute Ethereum for your Base deployment, and its Base vault-share bonds are **not EigenLayer restaked ETH**. Optional `referee.eigen` uses the actual official `verifyCertificateProportion` interface, a pinned configured verifier, configured AVS/operator set, >=2/3 per-stake-type thresholds and fresh <=24hour table reference. The AVS certificate message binds Base chain, referee address, task ID and pass/fail. It only reports a destination certificate result; it does not confer local slash authority. Genuine source registration, transported stake table/certificates and source slashing relay/adjudication remain external/unimplemented integration work before claiming EigenLayer-secured operation.

Optional actual ERC8004 Validation Registry integration checks that a request for this referee/agent ID exists before task publication. The agent owner/operator first calls `validationRequest(referee,agentId,requestURI,taskId)`. Completed collateral reviews can call `publishValidation`, producing `validationResponse` with deterministic task pass/fail, an evidence commitment and final tag. Response URI is blank because the operator evidence endpoint is authenticated; export/host a reviewed evidence bundle separately if a public URI is wanted. A local fixture registry tests interface behavior and is never presented as an official deployment. Standalone mode deliberately uses zero registry and makes no ERC8004 registration claim.

## Environment and operator

The app-local template names each provider and credential. Supabase Session pooler URI is `SUPABASE_DATABASE_URL`; operator room uses a unique32+character `OPERATOR_TOKEN`. Test/prod should use separate projects/namespaces. Configure private Base RPC, referee/vault addresses, runtime hash and start block. Set TypeSafe Jev key and OpenAI project key/model access. No source-chain transaction credentials are accepted.

`REFEREE_OPERATOR_PRIVATE_KEY` is a dedicated server operator signing key. Register collateral for its exact wallet and fund only bounded gas. The app only uses it to submit deterministic verdicts, one per operator/task, and never to withdraw collateral. The key itself retains all normal wallet authority; protect/rotate it as a real signing key. The human collateral wallet signs deposits, task creation, challenges, settlement, publication and withdrawals. Exact approval and wallet transaction previews are provided. Recover submitted wallet hashes from the persistent banner after reload; exact mined sender/destination/calldata/value/time are verified.

From the configured real app environment, `pnpm worker:referee <task-id>` invokes one Node operator run against the independently deployed server. Schedule explicit jobs only after live acceptance. The booth can also trigger the same run. No automatic broad scanning, automatic retry of ambiguous broadcasts or arbitrary operator endpoint fetching occurs. Network submission uncertainty must be reconciled with the chain before retrying; contract replay guards prevent duplicate reports but do not recover an unknown transaction hash automatically.

## Deploy and operate

The app includes an independent Vercel build descriptor and uses the workspace standalone Docker packaging. HTTPS is a late step after configuration, contract review and testnet rehearsals. Configure120second handlers, secrets, restricted Supabase credentials, backups/retention, ingress limits, alerts and guardian recovery. Server control-room tokens stay in session storage and Authorization headers, never URLs. Evidence export contains public task data/signatures; keep private material out of tasks.

Current index refresh is bounded to200tasks/500reports and uses the configured deployment block for event reads. A paginated persistent indexer/archive and RPC-range management are needed for larger production volumes. The booth does not autonomously monitor/settle every pending report; run a reviewed watch/settlement service or operate it manually. Neither a working UI nor local integration establishes public production security.

See [research](../../../docs/DAY-20-RESEARCH.md), [audit](../../../docs/DAY-20-AUDIT.md) and [ordered completion tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md).
