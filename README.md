# Dapptober Agents

Ten independently runnable crypto-native agents for Dapptober 2026, built on a shared TypeScript capability layer. The supplied daily prompts are canonical; the master build specification defines the architecture and audit requirements.

[Project completion tracker](docs/PROJECT-COMPLETION-TRACKER.md) records tested functionality and remaining work for every built day and is updated after each daily build.

| Day | Agent | Local URL | Core protocol |
| --- | --- | --- | --- |
| 01 | [Wallet Genesis](apps/agents/day-01-wallet-genesis/README.md) | http://localhost:3001 | thirdweb ERC4337 + scoped USDC session vault |
| 02 | [Pay-Per-Prompt](apps/agents/day-02-pay-per-prompt/README.md) | http://localhost:3002 | x402 exact-EVM USDC |
| 03 | [Passport Office](apps/agents/day-03-agent-passport/README.md) | http://localhost:3003 | ERC8004-inspired identity, EIP712 feedback, EAS |
| 04 | [Mercenary Guild](apps/agents/day-04-mcp-mercenary/README.md) | http://localhost:3004 | MCP SDK, USDC escrow |
| 05 | [Stablecoin Autopilot](apps/agents/day-05-stablecoin-autopilot/README.md) | http://localhost:3005 | Contract policy, ERC4626 lending/savings vaults |
| 06 | [Intent Calligrapher](apps/agents/day-06-intent-calligrapher/README.md) | http://localhost:3006 | CoW quotes, EIP712 orders and solver auctions |
| 07 | [The Glass-Box Mind](apps/agents/day-07-glass-box-mind/README.md) | http://localhost:3007 | Intel TDX / dstack, local Ollama, Intel DCAP verifier |
| 08 | [The Swarm Senate](apps/agents/day-08-swarm-senate/README.md) | http://localhost:3008 | OpenZeppelin Governor, VotesExtended, human overrides |
| 09 | [The Forecast Colosseum](apps/agents/day-09-forecast-colosseum/README.md) | http://localhost:3009 | UMA OOv3, bounded USDC pools, Brier/calibration rankings |

| 10 | [The Human Checkpoint](apps/agents/day-10-human-checkpoint/README.md) | http://localhost:3010 | World ID 4, verified passkeys, ERC-8004, fixed USDC rewards |

## Start here

Node 22.12+ and pnpm 10.2.0. Foundry is required for Solidity tests. Dependencies and compiler are pinned in `pnpm-lock.yaml`.

Enable the pinned package manager with `corepack enable` and `corepack prepare pnpm@10.2.0 --activate` (or install `pnpm@10.2.0` through npm).

See [pnpm migration and validation](docs/PNPM-MIGRATION.md) for the workspace changes and remaining upstream warnings.

```sh
pnpm install --frozen-lockfile
pnpm run dev 01
# Or run all ten independent servers:
pnpm run dev
```

Local simulation is the default and needs no secrets. Every simulated balance, signature, payment and attestation is labelled. State and receipts persist under each application's ignored `.data/` directory, isolated by HttpOnly session cookie. Local mode supports one process per app; use Supabase PostgreSQL for real/serverless mode. The agents never fabricate real transaction hashes.

Real mode uses configured RPCs, contracts, Jev, generative AI, thirdweb, x402 or CoW as relevant. Copy an app's `.env.example` to its `.env.local`. [Deployment instructions](docs/DEPLOYMENT.md) explain every required variable, funding and contract step. [Live setup checklist](docs/LIVE-SETUP-CHECKLIST.md) lists the owner inputs and acceptance runs; `pnpm readiness` reports missing live configuration without printing secrets. Days 01–09 use single-operator control rooms; Day 10 has private visitor sessions and separately authenticated operator pause controls. For Days 01–09, real server actions require a deployment-specific bearer token. Human owner/client signatures remain in their browser wallet.

## Commands

```sh
pnpm run dev 04                 # independent Day 04 server
pnpm run build 03               # independent Day 03 production build
pnpm --filter @dapptober/day-06 run test
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run test:contracts            # Solidity unit and fuzz tests, offline
pnpm run build                    # all ten independent builds
pnpm run check                    # full verification
pnpm run smoke                    # production HTTP workflow audit (servers must run)
```

`pnpm --filter @dapptober/day-01 run start` runs a built app. `pnpm run start` starts all ten after a full build. No other daily server is needed by any real deployment.

## Shared capabilities

`packages/agent-core` separates typed dispatch, reasoning/provider routing, durable state and HTTP authentication. `guardrails`, `receipts`, `chain`, `wallet`, `payments`, `identity`, `mcp`, `treasury`, `intents`, `inference`, `governance`, `forecast`, `checkpoint` and `ui` encapsulate working functionality reused by the apps. The shared packages are source dependencies compiled into each deployment. See [architecture](docs/ARCHITECTURE.md), [security](docs/SECURITY.md), [research](docs/RESEARCH.md), [acceptance criteria](docs/ACCEPTANCE.md) and [final audit](docs/FINAL-AUDIT.md).

## Adding the next day

Read its entire canonical prompt, inspect the live page and official APIs, and add acceptance criteria before coding. Follow one daily app's folder/config/API boundary. Reuse typed capabilities; add a package only when it contains functioning behavior worth composing. Add a day-specific dispatch module and tests, distinct UI, `.env.example`, README and independent deployment configuration. Re-run existing tests and builds. The ten current daily apps remain separate products; a future Day 31 orchestrator can compose capabilities with its own policy, tool registry, state and signer rather than calling daily app servers.

Day 07 adds portable inference receipts, opt-in public answer cards, a browser signature verifier, pinned Intel TDX verification, an optional onchain commitment and a deployable confidential CPU worker. [Day 7 audit](docs/DAY-07-AUDIT.md) records validation and live-deployment prerequisites.

Day 08 adds member-signed value mandates, routed multi-agent debates, publicly archived transcripts, contract-enforced human voting authority and a bounded delegate scheduler. [Day 8 audit](docs/DAY-08-AUDIT.md).

Day 09 adds funded binary markets, permanent agent registration with onchain risk limits, typed evidence forecasts, UMA assertions/disputes and stablecoin claims. [Day 9 audit](docs/DAY-09-AUDIT.md). `pnpm run test:forecast-chain` runs its real local-contract acceptance; oracle arbitration and AI are explicit test doubles.

Day 10 adds private World ID uniqueness, returning verified passkeys, an isolated human chat, current registered agent authority and contract-bound single USDC claims. [Day 10 audit](docs/DAY-10-AUDIT.md). `pnpm run test:checkpoint-chain` verifies actual local reward transactions with explicitly substituted personhood/provider fixtures.

### Network and storage policy

All ten apps default to Base Sepolia (84532) for testing and target Base (8453) for production. Local Anvil (31337) is reserved for isolated integrations. Use separate Supabase projects and private database connection URIs for testing/production; no Supabase browser API keys are required. See [the alignment audit](docs/BASE-SUPABASE-ALIGNMENT-AUDIT.md) for per-day contracts, provider dependencies and unavailable live CoW settlement on Base Sepolia.

Configuration names and where to enter each value: [environment setup](docs/ENVIRONMENT-SETUP.md). Each daily `.env.local` includes field explanations; private values belong there, not in `.env.example`.
