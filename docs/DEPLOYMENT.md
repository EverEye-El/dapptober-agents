# Independent deployment

Use Node 22.12+, pnpm 10.2.0 and Foundry. Run `pnpm install --frozen-lockfile` at the repository root. The ten apps compile shared packages into their own deployment; they never call another daily server. Choose one app from the root README and copy its `.env.example` to `.env.local` inside that app. Blank optional variables are ignored.

Use the version in the root `packageManager` field. Run `corepack enable` and `corepack prepare pnpm@10.2.0 --activate`, or install `pnpm@10.2.0` through npm. All workspace imports are declared explicitly with `workspace:*`. CI and Docker install with `--frozen-lockfile`. Only Tailwind oxide, esbuild and sharp dependency build scripts are permitted; optional bufferutil/keccak/utf-8-validate hooks remain disabled.

## Local and production

`pnpm run dev 01` starts Day 01; replace the number for another day. `pnpm run build 01` builds that app, and `pnpm --filter @dapptober/day-01 run start` serves it on port 3001. Omit the day to build/start all ten. Demo mode uses a local `.data` directory and is intended for one persistent process. It is explicitly simulated and requires no credentials.

For Vercel, create ten separate projects as needed. Set the daily app directory as Root Directory and enable access to files outside it. Each app contains a `vercel.json` with root install and workspace build commands. Select Node 22 and set that project's environment variables. Real mode requires PostgreSQL because serverless local files are ephemeral. Do not deploy demo file storage as a durable multi-instance service.

For a standalone container: `docker build --build-arg APP=day-04-mcp-mercenary -t dapptober-day04 .`, then `docker run --env-file <private-env-file> -p 3004:3000 dapptober-day04`. Set PUBLIC_ORIGIN to the externally reachable origin, not an internal container hostname. All ten app containers and the confidential worker image have hosted CI build evidence; see the completion tracker for tested commits. Local Docker execution and live hosting remain separate checks.

Run `pnpm readiness --init` to initialize missing private environments without replacing existing files. `pnpm readiness` checks all ten apps; `pnpm readiness 05 --online` also checks RPC chain ID and contract bytecode without spending. See [owner setup and live acceptance](LIVE-SETUP-CHECKLIST.md). A configured environment is not live-operation evidence.

## Real mode configuration

Set AGENT_MODE=real, OWNER_ADDRESS to the owner wallet, OPERATOR_TOKEN to a unique random secret of at least 32 characters, DATABASE_URL to a PostgreSQL URL and PUBLIC_ORIGIN to this app's HTTPS origin. Set CHAIN_ID and RPC_URL consistently. The runtime creates a `dapptober_state` table; the database user must be permitted to create/use it. Each day and operator token has a separate state namespace. Back up PostgreSQL and use a pooler compatible with transactions. Rotating the operator token creates a new application state namespace; reconcile chain history before resuming workers.

TYPESAFE_API_KEY enables live Jev screening. AI_BASE_URL, AI_API_KEY, AI_SMALL_MODEL and AI_LARGE_MODEL configure the OpenAI-compatible reasoning adapter. Missing providers or provider errors fail closed. Never put these keys or AGENT_PRIVATE_KEY in NEXT_PUBLIC variables. The operator enters OPERATOR_TOKEN in the control room; it remains in memory and is sent as a bearer token over HTTPS. A deployment is one operator workspace, not a multi-tenant custodial service.

Day 01 additionally needs THIRDWEB_SECRET_KEY, AGENT_PRIVATE_KEY and SESSION_VAULT. The key is an agent signer, not the owner's wallet. Birth derives/connects a thirdweb ERC4337 account; it deploys lazily on a funded/bundled transaction. Fund SessionVault with USDC and fund/sponsor the smart account's gas. The browser owner grants token/recipient restrictions, caps and expiry; agent transfers use scoped EIP712 authority.

Day 02 needs AGENT_PRIVATE_KEY, PAY_TO, TOLL_USDC and FACILITATOR_URL. The official default facilitator must actually support the configured exact-EVM network. Use Base Sepolia with test USDC for sandbox runs; use a supported authenticated production facilitator for Base mainnet. The paying EOA needs USDC and gas. TOLL_DAILY_BUDGET bounds client purchases. The app calls its own paid resource; no other app is needed.

Day 03 needs PASSPORT_REGISTRY. Optional EAS_ADDRESS and EAS_SCHEMA must identify a deployed EAS instance and a schema `bytes32 job,bytes32 evidence,uint8 score`; register that schema using official EAS tooling before enabling it. The owner registers metadata and jobs, a distinct client signs feedback, and a distinct validator attests. Use funded browser wallets on the same chain.

Day 04 needs QUEST_ESCROW and AGENT_PRIVATE_KEY. The creator approves USDC and creates the funded bounty with a distinct validator address; the agent needs native gas to claim/submit. Creator/validator browser transactions approve or resolve disputes. The MCP endpoint is this app's `/api/mcp`, authenticated by bearer token in real mode.

Day 05 needs FLIGHT_TREASURY, AGENT_PRIVATE_KEY and VAULT_CONFIG: an array of `{address,name,kind,risk}` for at least two deployed USDC ERC4626 vaults, one lending and one savings. Verify addresses and asset compatibility against those protocols' current official deployments. Fund the treasury, fund the agent for gas, then owner approves vaults and the flight plan. Share-price APY needs samples at least 60 seconds apart and is historical, not a guaranteed forecast. The owner can disengage and withdraw all; individual contract withdrawals/recoverLiquid are recovery paths if a vault is illiquid.

Day 06 needs COW_CHAIN_ID (11155111 Sepolia or 8453 Base), COW_USDC, COW_WETH and RPC_URL for that chain. These must match the official CoW-supported token deployments and liquidity; Base Sepolia is not used for CoW. The browser owner approves the official vault relayer, signs the EIP712 order, and signs cancellations. Quote/order submission can be tested only with actual supported tokens, API availability and funded wallets.

## Contracts

Build/test with `pnpm run test:contracts`. `scripts/contracts.mjs` uses the pinned solc-js compiler offline, including OpenZeppelin imports; no forge-std download is needed. Start `anvil` for a local chain if desired.

Set RPC_URL and use an encrypted Foundry account (`cast wallet import dapptober-deployer --interactive`), then run from the repository root:

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

The convenience `pnpm start` command uses Next's local production server and may warn about standalone output. The Docker recipe executes the generated standalone server directly. In a demo container, mount a writable persistent state directory at the server's `.data` path; real deployment uses PostgreSQL and avoids local persistence.

## Day 07 extension

See [Day 7 research](DAY-07-RESEARCH.md), [application and worker deployment](../apps/agents/day-07-glass-box-mind/README.md) and [Day 7 audit](DAY-07-AUDIT.md). Shared `packages/inference` provides signed model/input/output receipts, strict Intel DCAP and workload/model appraisal, opt-in sharing and owner-wallet onchain commitments. The independent verifier page checks ECDSA locally; hardware appraisal requires current Intel collateral and independently approved measurements. Demo keys and historical fixtures never confer hardware trust. Jev receives verification facts and cannot override failed cryptography. No other daily app server is required.

## Day 08 extension

Build independently with `pnpm run build 08`, start with `pnpm start 08` (port 3008), or select `APP=day-08-swarm-senate` in the root Dockerfile. [The app README](../apps/agents/day-08-swarm-senate/README.md) documents contract deployment, timestamp voting windows, founding membership, signed profile registration and per-member delegation. Copy its `.env.example` and supply the Governor/token addresses, deployment block, RPC, private PostgreSQL, operator token, dedicated delegate seed and AI/Jev credentials.

Fund delegate EOAs with native gas only after members approve delegation. Use a Node host with sufficient debate request duration; schedule `scripts/senate-worker.mjs` for bounded operator debate/vote cycles. The worker never overrides humans or executes policy adoption. Back up transcript/profile storage and repeatedly refresh the bounded chain scanner when backfilling. Membership is immutable per deployment. See [research](DAY-08-RESEARCH.md) and [audit](DAY-08-AUDIT.md).

## Day 09 deployment

See [Day 09 README](../apps/agents/day-09-forecast-colosseum/README.md) and [audit](DAY-09-AUDIT.md). Deploy `ForecastColosseum` with verified six-decimal USDC, the official UMA OOv3 oracle, `ASSERT_TRUTH2` and at least a two-hour live liveness. Verify whitelist/identifier/minimum bond/dispute support; configure private owner/operator, PostgreSQL, HTTPS, Jev/AI and narrowly funded agent wallet. Register caps before trading. Verify both lanes, oversize rejection, cutoff, bonded assertion, real oracle dispute and settlement, calibrated rankings, duplicate-claim rejection and USDC balances on the public chain. Testnets and the local oracle double do not establish production DVM evidence. Payouts remain available when trading is paused; stakes are locked until settlement, unasserted stale refunds are permissionless after 30 days, pending disputes cannot be bypassed. Independent contract review and ongoing oracle monitoring remain release tasks.

## Day 10 deployment

See [Day 10 README](../apps/agents/day-10-human-checkpoint/README.md) for World ID production app/RP/action registration, server-only signing keys, verified returning passkeys, current ERC-8004 registry authority, PostgreSQL/Supabase and HTTPS setup. Deploy `HumanCheckpointRewards` with owner, six-decimal USDC, dedicated verifier, `keccak256(UTF8(WORLD_RP_ID + ':' + WORLD_ACTION))` and a fixed micro-USDC amount; fund only the intended budget. The adapter checks campaign/token/verifier and visitors submit their own gas-funded claims. Operator application pause and owner contract pause are separate. Configure ingress rate limits, privacy retention, backups and independent security review. Build/start independently with day `10`, or select `APP=day-10-human-checkpoint` in Docker. Public graphic assets are included. No Day 03 or other daily server is needed.
