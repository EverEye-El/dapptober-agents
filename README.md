# Dapptober Agents

Eight independently runnable crypto-native agents for Dapptober 2026, built on a shared TypeScript capability layer. The supplied daily prompts are canonical; the master build specification defines the architecture and audit requirements.

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

## Start here

Node 22.12+ and pnpm 10.2.0. Foundry is required for Solidity tests. Dependencies and compiler are pinned in `pnpm-lock.yaml`.

Enable the pinned package manager with `corepack enable` and `corepack prepare pnpm@10.2.0 --activate` (or install `pnpm@10.2.0` through npm).

See [pnpm migration and validation](docs/PNPM-MIGRATION.md) for the workspace changes and remaining upstream warnings.

```sh
pnpm install --frozen-lockfile
pnpm run dev 01
# Or run all eight independent servers:
pnpm run dev
```

Local simulation is the default and needs no secrets. Every simulated balance, signature, payment and attestation is labelled. State and receipts persist under each application's ignored `.data/` directory, isolated by HttpOnly session cookie. Local mode supports one process per app; use PostgreSQL for real/serverless mode. The agents never fabricate real transaction hashes.

Real mode uses configured RPCs, contracts, Jev, generative AI, thirdweb, x402 or CoW as relevant. Copy an app's `.env.example` to its `.env.local`. [Deployment instructions](docs/DEPLOYMENT.md) explain every required variable, funding and contract step. [Live setup checklist](docs/LIVE-SETUP-CHECKLIST.md) lists the owner inputs and acceptance runs; `pnpm readiness` reports missing live configuration without printing secrets. Each deployment is a single-operator control room; real server actions require a deployment-specific bearer token. Human owner/client signatures remain in their browser wallet.

## Commands

```sh
pnpm run dev 04                 # independent Day 04 server
pnpm run build 03               # independent Day 03 production build
pnpm --filter @dapptober/day-06 run test
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run test:contracts            # Solidity unit and fuzz tests, offline
pnpm run build                    # all eight independent builds
pnpm run check                    # full verification
pnpm run smoke                    # production HTTP workflow audit (servers must run)
```

`pnpm --filter @dapptober/day-01 run start` runs a built app. `pnpm run start` starts all eight after a full build. No other daily server is needed by any real deployment.

## Shared capabilities

`packages/agent-core` separates typed dispatch, reasoning/provider routing, durable state and HTTP authentication. `guardrails`, `receipts`, `chain`, `wallet`, `payments`, `identity`, `mcp`, `treasury`, `intents`, `inference`, `governance` and `ui` encapsulate working functionality reused by the apps. The shared packages are source dependencies compiled into each deployment. See [architecture](docs/ARCHITECTURE.md), [security](docs/SECURITY.md), [research](docs/RESEARCH.md), [acceptance criteria](docs/ACCEPTANCE.md) and [final audit](docs/FINAL-AUDIT.md).

## Adding Day 09

Read its entire canonical prompt, inspect the live page and official APIs, and add acceptance criteria before coding. Follow one daily app's folder/config/API boundary. Reuse typed capabilities; add a package only when it contains functioning behavior worth composing. Add a day-specific dispatch module and tests, distinct UI, `.env.example`, README and independent deployment configuration. Re-run existing tests and builds. The eight current daily apps remain separate products; a future Day 31 orchestrator can compose capabilities with its own policy, tool registry, state and signer rather than calling daily app servers.

Day 07 adds portable inference receipts, opt-in public answer cards, a browser signature verifier, pinned Intel TDX verification, an optional onchain commitment and a deployable confidential CPU worker. [Day 7 audit](docs/DAY-07-AUDIT.md) records validation and live-deployment prerequisites.

Day 08 adds member-signed value mandates, routed multi-agent debates, publicly archived transcripts, contract-enforced human voting authority and a bounded delegate scheduler. [Day 8 audit](docs/DAY-08-AUDIT.md).
