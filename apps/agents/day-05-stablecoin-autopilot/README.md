# Day 05 — Stablecoin Autopilot

Canonical prompt: [`prompts/dapp-prompts.ts`](../../../prompts/dapp-prompts.ts), day 5. Primary build specification: [`MasterPrompt-DapptoberAgentsBuild.md`](../../../MasterPrompt-DapptoberAgentsBuild.md). Acceptance mapping: [`docs/ACCEPTANCE.md`](../../../docs/ACCEPTANCE.md).

## What it builds

Contract-bounded USDC treasury across ERC4626 lending/savings vaults. Human defines maximum allocation, liquidity floor, risk, per-move/daily caps and expiry. Agent samples share prices, pre-screens with Jev, explains moves and executes only inside policy.

## Architecture and agent workflow

Set flight plan → monitor → propose → inspect reasoning and limits → execute → disengage → withdraw all. The agent cannot change policy, choose an arbitrary asset, withdraw funds to itself, or bypass the owner kill switch.

This Next.js application compiles shared source packages into its own build. It never calls another daily application's server. It owns its environment, cookie namespace, state partition and deployment.

## Onchain components

FlightTreasury.sol; audited external ERC4626 vaults.

## Tools and guardrails

Tools: `treasury.plan, treasury.monitor, treasury.propose, treasury.execute, treasury.chat, treasury.disengage, treasury.withdrawAll`.

Owner-signed previews control real administrative transactions. Server financial tools require operator authentication, typed arguments, policy checks and Jev confidence. No model can create arbitrary calldata. Real mode fails closed when infrastructure is absent. Demo state/receipts are explicitly simulated. Secrets stay in server environment; the agent key must be separate from the human owner. Receipt hashes are tamper-evident but are not signatures or onchain anchors.

## Environment and local run

From the repository root:

```sh
pnpm install --frozen-lockfile
cp apps/agents/day-05-stablecoin-autopilot/.env.example apps/agents/day-05-stablecoin-autopilot/.env.local
pnpm run dev 05
```

Open http://localhost:3005. Local mode works without credentials. For real mode, configure this application's `.env.local`, set `AGENT_MODE=real`, and follow [`docs/DEPLOYMENT.md`](../../../docs/DEPLOYMENT.md). Blank optional variables are ignored; required real-mode values produce explicit errors. `PUBLIC_ORIGIN` must exactly match the deployment origin. The operator token must be at least 32 random characters; enter it in the control room.

## Test and build independently

```sh
pnpm --filter @dapptober/day-05 run test
pnpm run build 05
pnpm --filter @dapptober/day-05 run start
```

Contract and shared checks: `pnpm run test:contracts`, `pnpm test`, `pnpm run typecheck`, `pnpm run lint`.

## Deploy independently

Use this app directory as the Vercel project root, enable files outside the root, install from the workspace root and build this workspace. Or use the root Dockerfile with `--build-arg APP=day-05-stablecoin-autopilot`. Each app needs its own environment and Supabase PostgreSQL state namespace; no other day must be deployed. See [`docs/DEPLOYMENT.md`](../../../docs/DEPLOYMENT.md) for complete setup, contract commands and worker operation.

## Known limitations

No yield guarantees. Real APY requires two share-price samples at least 60 seconds apart; it is historical annualization, not a forecast. Vault liquidity/losses can prevent withdraw-all, so individual owner withdrawal and recoverLiquid remain available. Monitoring/rebalancing is operator-triggered; deploy the bounded worker for scheduled runs. Coinbase AgentKit is a suggested alternative, while this implementation uses viem to minimize authority and expose exact calls.

Credential-dependent live transactions and paid AI inference cannot be claimed tested without the user's credentials and funded wallets. Consult the final audit for actual verification evidence.

## Base networks and Supabase

Testing uses Base Sepolia (`CHAIN_ID=84532`); production uses Base (`CHAIN_ID=8453`). Copy that network's deployed contract addresses and RPC into this app's private environment. For USDC workflows, use Circle's token on the same network; do not retain the testnet USDC address when switching to Base. Local Anvil (`31337`) remains a separate integration-test environment.

Use the **Supabase database URI** in `DATABASE_URL`, not a Supabase project URL or anon/service-role API key. The server supports direct, session-pooler and transaction-pooler connections with prepared statements disabled and remote TLS required. Use a private table-owner connection: app tables enable RLS without public visitor policies. Keep testing and production in separate Supabase projects; verify persistence/restore against the actual account before release. See the [alignment audit](../../../docs/BASE-SUPABASE-ALIGNMENT-AUDIT.md) and [production tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md).
