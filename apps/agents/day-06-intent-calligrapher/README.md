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
npm ci
cp apps/agents/day-06-intent-calligrapher/.env.example apps/agents/day-06-intent-calligrapher/.env.local
npm run dev -- 06
```

Open http://localhost:3006. Local mode works without credentials. For real mode, configure this application's `.env.local`, set `AGENT_MODE=real`, and follow [`docs/DEPLOYMENT.md`](../../../docs/DEPLOYMENT.md). Blank optional variables are ignored; required real-mode values produce explicit errors. `PUBLIC_ORIGIN` must exactly match the deployment origin. The operator token must be at least 32 random characters; enter it in the control room.

## Test and build independently

```sh
npm run test --workspace @dapptober/day-06
npm run build -- 06
npm run start --workspace @dapptober/day-06
```

Contract and shared checks: `npm run test:contracts`, `npm test`, `npm run typecheck`, `npm run lint`.

## Deploy independently

Use this app directory as the Vercel project root, enable files outside the root, install from the workspace root and build this workspace. Or use the root Dockerfile with `--build-arg APP=day-06-intent-calligrapher`. Each app needs its own environment and PostgreSQL state namespace; no other day must be deployed. See [`docs/DEPLOYMENT.md`](../../../docs/DEPLOYMENT.md) for complete setup, contract commands and worker operation.

## Known limitations

Only explicit USDC→WETH buy intents, complete fills, EOA signatures; ETH is delivered as WETH. CoW supports Base mainnet and Ethereum Sepolia, not Base Sepolia. Real solver competition arrives after settlement; pre-sign quote is a verified estimate, not a full auction. Friday is next Friday 23:59:59 UTC. Deadline capped at seven days. Real fills need liquidity/funds; cancellation may race settlement.

Credential-dependent live transactions and paid AI inference cannot be claimed tested without the user's credentials and funded wallets. Consult the final audit for actual verification evidence.
