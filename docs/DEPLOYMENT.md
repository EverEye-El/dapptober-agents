# Independent deployment

Use Node 22.12+, pnpm 10.2.0 and Foundry. Run `pnpm install --frozen-lockfile` at the repository root. The twenty-two apps compile shared packages into their own deployment; they never call another daily server. Choose one app from the root README and copy its `.env.example` to `.env.local` inside that app. Blank optional variables are ignored.

Use the version in the root `packageManager` field. Run `corepack enable` and `corepack prepare pnpm@10.2.0 --activate`, or install `pnpm@10.2.0` through npm. All workspace imports are declared explicitly with `workspace:*`. CI and Docker install with `--frozen-lockfile`. Only Tailwind oxide, esbuild and sharp dependency build scripts are permitted; optional bufferutil/keccak/utf-8-validate hooks remain disabled.

## Local and production

`pnpm run dev 01` starts Day 01; replace the number for another day. `pnpm run build 01` builds that app, and `pnpm --filter @dapptober/day-01 run start` serves it on port 3001. Omit the day to build/start all twenty-two. Demo mode uses a local `.data` directory and is intended for one persistent process. It is explicitly simulated and requires no credentials.

For Vercel, create twenty-two separate projects as needed. Set the daily app directory as Root Directory and enable access to files outside it. Each app contains a `vercel.json` with root install and workspace build commands. Select Node 22 and set that project's environment variables. Real mode requires Supabase PostgreSQL because serverless local files are ephemeral. Do not deploy demo file storage as a durable multi-instance service.

For a standalone container: `docker build --build-arg APP=day-04-mcp-mercenary -t dapptober-day04 .`, then `docker run --env-file <private-env-file> -p 3004:3000 dapptober-day04`. Set PUBLIC_ORIGIN to the externally reachable origin, not an internal container hostname. Hosted container evidence covers specific earlier commits; later Days 16–21 runs were refused before any job steps because of account billing/spending restrictions. See the completion tracker for exact evidence. Local Docker execution and live hosting remain separate checks.

Run `pnpm readiness --init` to initialize missing private environments without replacing existing files. `pnpm readiness` checks all twenty-two-one apps; `pnpm readiness 05 --online` also checks RPC chain ID and contract bytecode without spending. See [owner setup and live acceptance](LIVE-SETUP-CHECKLIST.md). A configured environment is not live-operation evidence.

## Real mode configuration

Set AGENT_MODE=real, OWNER_ADDRESS to the owner wallet, OPERATOR_TOKEN to a unique random secret of at least 32 characters, SUPABASE_DATABASE_URL to a Supabase PostgreSQL URL and PUBLIC_ORIGIN to this app's HTTPS origin. Set CHAIN_ID=84532 for Base Sepolia testing or 8453 for Base production, with matching RPC_URL. Ethereum Sepolia is no longer accepted. Local Anvil remains only for isolated integration tests. The runtime creates a `dapptober_state` table; the database user must be permitted to create/use it. Each day and operator token has a separate state namespace. Use the Supabase Connect database URI (direct, session or transaction pooler); prepared statements are disabled for pooler compatibility, remote TLS is required, and both state tables enable RLS without public policies. Use the private table-owner connection and verify backups/restore. Rotating the operator token creates a new application state namespace; reconcile chain history before resuming workers.

JEV_API_KEY enables live Jev screening. OPENAI_BASE_URL, OPENAI_API_KEY, OPENAI_SMALL_MODEL and OPENAI_LARGE_MODEL configure the OpenAI-compatible reasoning adapter. Missing providers or provider errors fail closed. Never put these keys or AGENT_PRIVATE_KEY in NEXT_PUBLIC variables. The operator enters OPERATOR_TOKEN in the control room; it remains in memory and is sent as a bearer token over HTTPS. A deployment is one operator workspace, not a multi-tenant custodial service.

Day 01 additionally needs THIRDWEB_SECRET_KEY, AGENT_PRIVATE_KEY and SESSION_VAULT. The key is an agent signer, not the owner's wallet. Birth derives/connects a thirdweb ERC4337 account; it deploys lazily on a funded/bundled transaction. Fund SessionVault with USDC and fund/sponsor the smart account's gas. The browser owner grants token/recipient restrictions, caps and expiry; agent transfers use scoped EIP712 authority.

Day 02 needs AGENT_PRIVATE_KEY, PAY_TO, TOLL_USDC and FACILITATOR_URL. The official default facilitator must actually support the configured exact-EVM network. Use Base Sepolia with test USDC for sandbox runs; use a supported authenticated production facilitator for Base mainnet. The paying EOA needs USDC and gas. TOLL_DAILY_BUDGET bounds client purchases. The app calls its own paid resource; no other app is needed.

Day 03 needs PASSPORT_REGISTRY. Optional EAS_ADDRESS and EAS_SCHEMA must identify a deployed EAS instance and a schema `bytes32 job,bytes32 evidence,uint8 score`; register that schema using official EAS tooling before enabling it. The owner registers metadata and jobs, a distinct client signs feedback, and a distinct validator attests. Use funded browser wallets on the same chain.

Day 04 needs QUEST_ESCROW and AGENT_PRIVATE_KEY. The creator approves USDC and creates the funded bounty with a distinct validator address; the agent needs native gas to claim/submit. Creator/validator browser transactions approve or resolve disputes. The MCP endpoint is this app's `/api/mcp`, authenticated by bearer token in real mode.

Day 05 needs FLIGHT_TREASURY, AGENT_PRIVATE_KEY and VAULT_CONFIG: an array of `{address,name,kind,risk}` for at least two deployed USDC ERC4626 vaults, one lending and one savings. Verify addresses and asset compatibility against those protocols' current official deployments. Fund the treasury, fund the agent for gas, then owner approves vaults and the flight plan. Share-price APY needs samples at least 60 seconds apart and is historical, not a guaranteed forecast. The owner can disengage and withdraw all; individual contract withdrawals/recoverLiquid are recovery paths if a vault is illiquid.

Day 06 uses COW_CHAIN_ID=84532 for Base Sepolia testing or 8453 for Base production, COW_USDC, COW_WETH and RPC_URL for that chain. These must match the official CoW-supported token deployments and liquidity; Base Sepolia is now the configured test network (`CHAIN_ID=COW_CHAIN_ID=84532`); demo workflows run there, while real CoW settlement reports an explicit unsupported-network error instead of using Ethereum Sepolia. Base production uses 8453. The browser owner approves the official vault relayer, signs the EIP712 order, and signs cancellations. Quote/order submission can be tested only with actual supported tokens, API availability and funded wallets.

## Contracts

Build/test with `pnpm run test:contracts`. `scripts/contracts.mjs` uses the pinned solc-js compiler offline, including OpenZeppelin imports; no forge-std download is needed. Start `anvil` for a local chain if desired.

Set RPC_URL and use an encrypted Foundry account (`cast wallet import dapptober-deployer --interactive`), then run from the repository root. The deployment wrapper checks RPC chain ID before invoking Forge and permits Base Sepolia, Base or localhost Anvil only:

```sh
node scripts/contracts.mjs create src/SessionVault.sol:SessionVault --rpc-url "$RPC_URL" --account dapptober-deployer --broadcast --constructor-args "$OWNER_ADDRESS"
node scripts/contracts.mjs create src/AgentPassport.sol:AgentPassport --rpc-url "$RPC_URL" --account dapptober-deployer --broadcast
node scripts/contracts.mjs create src/QuestEscrow.sol:QuestEscrow --rpc-url "$RPC_URL" --account dapptober-deployer --broadcast --constructor-args "$USDC_ADDRESS"
node scripts/contracts.mjs create src/FlightTreasury.sol:FlightTreasury --rpc-url "$RPC_URL" --account dapptober-deployer --broadcast --constructor-args "$OWNER_ADDRESS" "$USDC_ADDRESS"
```

Record deployed addresses in the selected app's private environment. Contract deployment and funded public-chain execution were not performed here. Inspect constructor arguments and review contracts before funding; tested contracts have not received an independent security audit.

## Bounded workers and external MCP clients

`PUBLIC_ORIGIN=https://your-day05.example OPERATOR_TOKEN=... node scripts/worker.mjs 5` executes one monitor/propose/execute cycle. Schedule with your platform's job scheduler at a conservative interval; a paused plan, missing APY sample or no eligible move exits with an error and executes no deposit. Day 04 uses the same command with `4` to discover, claim, generate and submit one matching quest. Neither worker changes owner policy or approves payouts. Use secret injection rather than typing secrets into shared shell history.

An MCP client can connect to `/api/mcp` with Streamable HTTP and its bearer token. Alternatively configure `node scripts/mcp-stdio.mjs` with PUBLIC_ORIGIN pointing to the independently deployed Day 04 app and OPERATOR_TOKEN in the client's private environment. The bridge reserves stdout for MCP JSON-RPC. Demo stdio has no durable shared browser cookie; use real mode for external worker identity and shared state.

## Release verification

Run `pnpm run check`, start the ten production apps using `pnpm start`, then `pnpm run smoke`. Inspect exported receipts, configure live credentials, and exercise a minimal funded test transaction before increasing owner caps. Public-chain and provider integration is implemented but cannot be certified by a local simulation.

The convenience `pnpm start` command uses Next's local production server and may warn about standalone output. The Docker recipe executes the generated standalone server directly. In a demo container, mount a writable persistent state directory at the server's `.data` path; real deployment uses Supabase PostgreSQL and avoids local persistence.

## Day 07 extension

See [Day 7 research](DAY-07-RESEARCH.md), [application and worker deployment](../apps/agents/day-07-glass-box-mind/README.md) and [Day 7 audit](DAY-07-AUDIT.md). Shared `packages/inference` provides signed model/input/output receipts, strict Intel DCAP and workload/model appraisal, opt-in sharing and owner-wallet onchain commitments. The independent verifier page checks ECDSA locally; hardware appraisal requires current Intel collateral and independently approved measurements. Demo keys and historical fixtures never confer hardware trust. Jev receives verification facts and cannot override failed cryptography. No other daily app server is required.

## Day 08 extension

Build independently with `pnpm run build 08`, start with `pnpm start 08` (port 3008), or select `APP=day-08-swarm-senate` in the root Dockerfile. [The app README](../apps/agents/day-08-swarm-senate/README.md) documents contract deployment, timestamp voting windows, founding membership, signed profile registration and per-member delegation. Copy its `.env.example` and supply the Governor/token addresses, deployment block, RPC, private Supabase PostgreSQL, operator token, dedicated delegate seed and AI/Jev credentials.

Fund delegate EOAs with native gas only after members approve delegation. Use a Node host with sufficient debate request duration; schedule `scripts/senate-worker.mjs` for bounded operator debate/vote cycles. The worker never overrides humans or executes policy adoption. Back up transcript/profile storage and repeatedly refresh the bounded chain scanner when backfilling. Membership is immutable per deployment. See [research](DAY-08-RESEARCH.md) and [audit](DAY-08-AUDIT.md).

## Day 09 deployment

See [Day 09 README](../apps/agents/day-09-forecast-colosseum/README.md) and [audit](DAY-09-AUDIT.md). Deploy `ForecastColosseum` with verified six-decimal USDC, the official UMA OOv3 oracle, `ASSERT_TRUTH2` and at least a two-hour live liveness. Verify whitelist/identifier/minimum bond/dispute support; configure private owner/operator, Supabase PostgreSQL, HTTPS, Jev/AI and narrowly funded agent wallet. Register caps before trading. Verify both lanes, oversize rejection, cutoff, bonded assertion, real oracle dispute and settlement, calibrated rankings, duplicate-claim rejection and USDC balances on the public chain. Testnets and the local oracle double do not establish production DVM evidence. Payouts remain available when trading is paused; stakes are locked until settlement, unasserted stale refunds are permissionless after 30 days, pending disputes cannot be bypassed. Independent contract review and ongoing oracle monitoring remain release tasks.

## Day 10 deployment

See [Day 10 README](../apps/agents/day-10-human-checkpoint/README.md) for World ID production app/RP/action registration, server-only signing keys, verified returning passkeys, current ERC-8004 registry authority, Supabase PostgreSQL/Supabase and HTTPS setup. Deploy `HumanCheckpointRewards` with owner, six-decimal USDC, dedicated verifier, `keccak256(UTF8(WORLD_RP_ID + ':' + WORLD_ACTION))` and a fixed micro-USDC amount; fund only the intended budget. The adapter checks campaign/token/verifier and visitors submit their own gas-funded claims. Operator application pause and owner contract pause are separate. Configure ingress rate limits, privacy retention, backups and independent security review. Build/start independently with day `10`, or select `APP=day-10-human-checkpoint` in Docker. Public graphic assets are included. No Day 03 or other daily server is needed.

## Day 11 deployment

See [Day 11 README](../apps/agents/day-11-gpu-night-market/README.md) and [provider worker](../services/gpu-provider/README.md). Deploy GpuNightMarket(owner,USDC) on Base Sepolia for testing, then Base for production. Set GPU_MARKET, reviewed GPU_PROVIDERS, a dedicated buyer key, owner-approved caps/providers, Jev and Supabase. No OpenAI key required. Deploy Ollama/worker on actual leased GPU capacity with separate provider signer, persistent output storage and private bearer token; configure TLS/WSS. Lease funding is separate from Base USDC escrow. Verify delivery, output commitment, payout, expiry refund, budget/pause controls and hardware/lease evidence before production release.

## Day 12 deployment

See [Provenance Press setup](../apps/agents/day-12-provenance-press/README.md). Deploy ProvenancePress(owner,USDC) on Base Sepolia then Base; set actual registry/deployment block, Circle USDC, private Supabase/Jev/Pinata/thirdweb settings and dedicated buyer wallet. Owner signs caps and approved works. Review public publication consent and legal permissions, then verify funded originals/remixes, license purposes, royalty claims and public credit history. This is a custom Base registry, not Story Protocol/PIL; native Story integration needs a compatible architecture or approved network exception.

Day 13 deploys independently as `day-13-agent-launch-gantry` on port 3013. Deploy AgentLaunchGantry with selected Base Circle USDC, then configure LAUNCH_FACTORY, Supabase/Jev/OpenAI/thirdweb and a capped signer. See the app README and ordered tracker before funding. Dune is supplemental mainnet query analytics; no Base Sepolia index support is assumed.

Day 13 onchain buyer setup: after the factory deployment, deploy `GantryBuyerVault(owner, agentSigner, CircleUSDC, factory)` and set `LAUNCH_BUYER_VAULT`. Owner-signed grants atomically replace the allowed listing IDs and set caps/24-hour expiry; owner-signed revoke stops the vault. Fund the vault with limited USDC, the signer with gas only. Owner recovery and holder-revenue claims use wallet previews. The vault checks the actual factory listing and retains UTC-day spent across renewed grants.

Day 14 runs independently on 3014. Deploy GuardrailSentinel(owner, guardian, CircleUSDC), set SENTINEL_VAULT, configure separate guardian/session keys, Supabase/Jev/OpenAI/Tenderly, then owner-enroll and fund isolated policies. See its ordered completion checklist before HTTPS/mainnet release.


Day 15 Aurel deploys independently with `APP=day-15-real-world-concierge`. It needs Supabase, operator authentication, an investor wallet, chain-matched issuer AsyncVault dossiers/permissions, Chainlink USDC/USD and Jev/OpenAI credentials. No custom production contract or agent private key is required. Follow the ordered Day 15 tracker and its annotated app README; verify issuer operations before hosting/public release.


## Day 16 — Brass

Day 16 / Brass runs on 3016 and builds independently with pnpm run build 16. Deploy BotBourse first with Circle USDC, verified official ERC-8004 registry, immutable arbiter/cap. Configure Supabase/Jev/OpenAI, reviewed seller catalog and buyer browser wallet; no server buyer key. Test Base Sepolia then separate Base state/deployment; HTTPS hosting follows provider and funded testnet rehearsal. See the app README and ordered tracker.


## Day17 — Toe Tag

Day17 / Toe Tag runs on3017 and builds independently with pnpm run build 17. Review/deploy CoronerProbe with a verified V2 router, register a dedicated revocable/no-resolver EAS schema, configure actual Supabase/Blockscout/Tenderly/Jev/OpenAI/Pinata and a gas-funded browser attester. Base Sepolia rehearsal precedes separate Base production/HTTPS hosting. See its README and ordered tracker.


## Day18 — Hush

Day18 deploys independently with `pnpm run build 18` / Docker APP=day-18-encrypted-confidant. Deploy reviewed EncryptedConfidant on Base Sepolia with actual guardian, set runtime hash, private and explicitly public browser RPCs. Fund gas only; no token/EAS/thirdweb setup. Base mainnet is deliberately blocked until official CoFHE support exists. Follow the app README and ordered tracker for live acceptance before HTTPS release.

Day20 Overrule deploys independently on3020 (or standalone host PORT). Deploy reviewed RestakedReferee with Circle USDC, approved ERC4626 vault, optional actual validation registry and at least3600second review delay on Base Sepolia/Base. Register/fund the dedicated Node operator; configure Supabase/Jev/OpenAI, guardian recovery, indexing and manual/scheduled settlement. Eigen destination certificates require an independently established actual source AVS/table; this Base app does not perform native Ethereum staking/slashing. Follow the ordered Day20 tracker before HTTPS/mainnet release.


## Completion-pass operations

Day 02 supports optional private `FACILITATOR_AUTH_HEADERS_JSON` containing an `Authorization` header on an HTTPS facilitator. It is supplied through the x402 SDK separately to supported/verify/settle requests. Only Authorization is accepted: the installed SDK follows redirects and custom API-key headers could be forwarded across origins. Providers needing path-bound short-lived signed JWTs still need a dedicated signing adapter. Provider acceptance remains required.

Day 19 operator-only `GET /api/native-admin` lists job IDs/status/error/age without chat bodies, channel credentials or replies. `POST` accepts `{id,action,note}` with the private operator Bearer token and the trusted origin. Actions are `review` for processing/delivering jobs stalled at least three minutes, then `retry`, `sent` or `cancel` after inspecting the actual enrolled chat. Use a descriptive note of at least ten characters. A retry preserves the prior action-card reply; it does not repeat successful model/planning work. The route starts a bounded drain after successful recovery. A delivery may have succeeded despite a timeout: inspect the platform first; no blind automatic retry is implemented. Old jobs without timestamps require the same explicit review. Terminal jobs cannot be retried through this endpoint. POST `{action:"archive",note:"..."}` archives up to 100 terminal sent/cancelled jobs in private `dapptober_familiar_jobs` storage before removing them from the active queue. Replayed platform IDs remain blocked by archived tombstones. `GET /api/native-admin?archiveOffset=0` reads private history in pages of 100. Include that table in backups/retention; do not delete tombstones while providers can replay old events. Interrupted/review jobs cannot be archived. Room-proposal archival/retention enforcement remains separate.

Day 20 `pnpm index:referee` runs a separate persistent finalized-event archive using the app's private environment. It checks Base network and pinned runtime, then writes private/RLS-enabled `dapptober_referee_events` and `dapptober_referee_index` tables. Each run scans at most twenty pages of up to 500 blocks (reducing ranges on RPC errors), atomically commits events and checkpoint under a namespace lock, and stops on a changed finalized checkpoint. Repeated runs resume; `pnpm index:referee --list 0` exports up to 100 public events, with the next offset in its response. Set the actual deployment block explicitly. On a checkpoint mismatch, stop scheduling, preserve/export the archive and investigate the chain/RPC before rebuilding that namespace. Include both tables in backups. This read-only-chain worker neither submits verdicts nor settles collateral. Its scanner is fixture-tested; real Supabase concurrency/restart/finalized-RPC acceptance remains pending. The authenticated `/api/archive?kind=tasks&offset=0` (or `kind=reports`) and evidence-room controls decode archived events in pages of 100; records carry the finalized checkpoint and are historical, not current collateral status. The booth's bounded active task/report view is still separate; this archive does not remove its 200-task/500-report limit or reconcile replaced/dropped operator transactions.


Day 18 browser confirmation now tracks speed-up replacements only when sender, recipient, nonce, value and encrypted calldata match the original instruction exactly. A cancelled or changed instruction clears tracking with an explicit failure and is never recorded as a successful Hush action. The actual mined replacement hash is recorded. Unknown/dropped transactions remain blocked for inspection; no automatic new transaction or private-value upload is introduced. Verify real wallet replacement/cancellation/restart behavior before release.

## Day 21 — Layover

Day 21 uses browser-owned thirdweb sponsored smart accounts, not a server agent key. Its funding RPC/bundler/USDC/EntryPoint configuration is in `TRAVEL_SOURCES_JSON`; it does not use a single `RPC_URL` for every source. The destination is Base Sepolia or Base. Deploy/pin `LayoverPass` for minting; direct payments need no custom payment contract. External bridge/swap quotes require reviewed router/spender pins and actual liquidity. Read the app-specific setup before enabling real mode. No funded public-chain paymaster/bridge evidence is claimed by local fixtures.

## Day 22 — Pitlane

Pitlane exposes public chain views and EOA-signed trainer/spectator actions; only its autonomous worker uses the private operator token. Deploy/pin AgentArena, enroll approved fighters through its guardian, fund a Base Sepolia Chainlink VRF v2.5 subscription with LINK and add the arena consumer. Pilot wallets are distinct gas-only accounts; user wagers use explicit EOA USDC approval/stake calls. Run `pnpm worker:arena` beside the independent app and keep private salts/policies/outbox durable in Supabase. Verify Chainlink/Jev/AI/wallet/worker behavior with funded testnet acceptance before a separate Base production release. Read the app README for exact rules, 90/5/5 losing-pool split, refunds, custody/collusion limits, capacity and recovery.
