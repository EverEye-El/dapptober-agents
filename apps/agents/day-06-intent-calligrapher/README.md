# Day 06 — Intent Calligrapher

Canonical prompt: [`prompts/dapp-prompts.ts`](../../../prompts/dapp-prompts.ts), day 6. Primary build specification: [`MasterPrompt-DapptoberAgentsBuild.md`](../../../MasterPrompt-DapptoberAgentsBuild.md). Acceptance mapping: [`docs/ACCEPTANCE.md`](../../../docs/ACCEPTANCE.md).

## What it builds

Natural-language USDC→WETH buy intents with maximum cost, minimum output and explicit deadline. Verified CoW quote precedes EIP712 confirmation, relayer allowance and order submission. Real CoW auction status/trades and solver competition are inspectable. Local solvers compete deterministically.

## Architecture and agent workflow

Draft “Get me 0.5 ETH for under 1600 USDC before Friday” → inspect exact UTC deadline/limits → simulate → approve exact USDC allowance → user signs → CoW auction → inspect settlement. Local mode uses simulated signatures and never invents a transaction hash.

This Next.js application compiles shared source packages into its own build. It never calls another daily application's server. It owns its environment, cookie namespace, state partition and deployment.

## Onchain components

CoW settlement and vault relayer; official SDK chain addresses.

## Tools and guardrails

Tools: `intent.draft, intent.approve, intent.sign, intent.status, intent.cancel.preview, intent.cancel`.

Owner-signed previews control real administrative transactions. Server financial tools require operator authentication, typed arguments, policy checks and Jev confidence. No model can create arbitrary calldata. Real mode fails closed when infrastructure is absent. Demo state/receipts are explicitly simulated. Secrets stay in server environment; the agent key must be separate from the human owner. Receipt hashes are tamper-evident but are not signatures or onchain anchors.

## Environment and local run

From the repository root:

```sh
pnpm install --frozen-lockfile
cp apps/agents/day-06-intent-calligrapher/.env.example apps/agents/day-06-intent-calligrapher/.env.local
pnpm run dev 06
```

Open http://localhost:3006. Local mode works without credentials. For real mode, configure this application's `.env.local`, set `AGENT_MODE=real`, and follow [`docs/DEPLOYMENT.md`](../../../docs/DEPLOYMENT.md). Blank optional variables are ignored; required real-mode values produce explicit errors. `PUBLIC_ORIGIN` must exactly match the deployment origin. The operator token must be at least 32 random characters; enter it in the control room.

## Test and build independently

```sh
pnpm --filter @dapptober/day-06 run test
pnpm run build 06
pnpm --filter @dapptober/day-06 run start
```

Contract and shared checks: `pnpm run test:contracts`, `pnpm test`, `pnpm run typecheck`, `pnpm run lint`.

## Deploy independently

Use this app directory as the Vercel project root, enable files outside the root, install from the workspace root and build this workspace. Or use the root Dockerfile with `--build-arg APP=day-06-intent-calligrapher`. Each app needs its own environment and Supabase PostgreSQL state namespace; no other day must be deployed. See [`docs/DEPLOYMENT.md`](../../../docs/DEPLOYMENT.md) for complete setup, contract commands and worker operation.

## Known limitations

Only explicit USDC→WETH buy intents, complete fills, EOA signatures; ETH is delivered as WETH. Testing is configured for Base Sepolia (`CHAIN_ID=COW_CHAIN_ID=84532`); production uses Base (`8453`). Base Sepolia demo actions are simulated. Real CoW actions are explicitly blocked because the external solver API does not support Base Sepolia; no fallback to Ethereum Sepolia occurs. Real solver competition arrives after settlement; pre-sign quote is a verified estimate, not a full auction. Friday is next Friday 23:59:59 UTC. Deadline capped at seven days. Real fills need liquidity/funds; cancellation may race settlement.

Credential-dependent live transactions and paid AI inference cannot be claimed tested without the user's credentials and funded wallets. Consult the final audit for actual verification evidence.

## Base networks and Supabase

Testing uses Base Sepolia (`CHAIN_ID=84532`); production uses Base (`CHAIN_ID=8453`). Copy that network's deployed contract addresses and RPC into this app's private environment. For USDC workflows, use Circle's token on the same network; do not retain the testnet USDC address when switching to Base. Local Anvil (`31337`) remains a separate integration-test environment.

Use the **Supabase database URI** in `DATABASE_URL`, not a Supabase project URL or anon/service-role API key. The server supports direct, session-pooler and transaction-pooler connections with prepared statements disabled and remote TLS required. Use a private table-owner connection: app tables enable RLS without public visitor policies. Keep testing and production in separate Supabase projects; verify persistence/restore against the actual account before release. See the [alignment audit](../../../docs/BASE-SUPABASE-ALIGNMENT-AUDIT.md) and [production tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md).
