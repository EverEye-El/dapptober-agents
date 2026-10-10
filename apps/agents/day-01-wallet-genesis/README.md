# Day 01 — Wallet Genesis

Canonical prompt: [`prompts/dapp-prompts.ts`](../../../prompts/dapp-prompts.ts), day 1. Primary build specification: [`MasterPrompt-DapptoberAgentsBuild.md`](../../../MasterPrompt-DapptoberAgentsBuild.md). Acceptance mapping: [`docs/ACCEPTANCE.md`](../../../docs/ACCEPTANCE.md).

## What it builds

Conversational agent with a thirdweb ERC4337 smart account and a scoped ERC20 custody session. The human grants a session, allowlists USDC and recipients, and reviews each typed transfer. Jev routes small/large models, gates policy fit and requires a human co-sign below confidence 0.85.

## Architecture and agent workflow

Birth agent → grant a one-day session → ask balance → prepare send 5 USDC → review → execute → revoke. The server agent key controls its own smart account; the owner owns the policy vault. USDC used by this agent lives in that vault, and session signatures authorize transfers without granting unrestricted owner access.

This Next.js application compiles shared source packages into its own build. It never calls another daily application's server. It owns its environment, cookie namespace, state partition and deployment.

## Onchain components

SessionVault.sol

## Tools and guardrails

Tools: `wallet.birth, wallet.grant, wallet.chat, wallet.execute, wallet.revoke`.

Owner-signed previews control real administrative transactions. Server financial tools require operator authentication, typed arguments, policy checks and Jev confidence. No model can create arbitrary calldata. Real mode fails closed when infrastructure is absent. Demo state/receipts are explicitly simulated. Secrets stay in server environment; the agent key must be separate from the human owner. Receipt hashes are tamper-evident but are not signatures or onchain anchors.

## Environment and local run

From the repository root:

```sh
pnpm install --frozen-lockfile
cp apps/agents/day-01-wallet-genesis/.env.example apps/agents/day-01-wallet-genesis/.env.local
pnpm run dev 01
```

Open http://localhost:3001. Local mode works without credentials. For real mode, configure this application's `.env.local`, set `AGENT_MODE=real`, and follow [`docs/DEPLOYMENT.md`](../../../docs/DEPLOYMENT.md). Blank optional variables are ignored; required real-mode values produce explicit errors. `PUBLIC_ORIGIN` must exactly match the deployment origin. The operator token must be at least 32 random characters; enter it in the control room.

## Test and build independently

```sh
pnpm --filter @dapptober/day-01 run test
pnpm run build 01
pnpm --filter @dapptober/day-01 run start
```

Contract and shared checks: `pnpm run test:contracts`, `pnpm test`, `pnpm run typecheck`, `pnpm run lint`.

## Deploy independently

Use this app directory as the Vercel project root, enable files outside the root, install from the workspace root and build this workspace. Or use the root Dockerfile with `--build-arg APP=day-01-wallet-genesis`. Each app needs its own environment and Supabase PostgreSQL state namespace; no other day must be deployed. See [`docs/DEPLOYMENT.md`](../../../docs/DEPLOYMENT.md) for complete setup, contract commands and worker operation.

## Known limitations

Real wallet/bundler calls require thirdweb credentials and funded vault. SessionVault is a custody extension, not a replacement EntryPoint or a claim that thirdweb native target restrictions enforce USDC caps. ENS commands in local mode resolve to the labelled local recipient; real mode currently requires explicit addresses.

Credential-dependent live transactions and paid AI inference cannot be claimed tested without the user's credentials and funded wallets. Consult the final audit for actual verification evidence.

## Base networks and Supabase

Testing uses Base Sepolia (`CHAIN_ID=84532`); production uses Base (`CHAIN_ID=8453`). Copy that network's deployed contract addresses and RPC into this app's private environment. For USDC workflows, use Circle's token on the same network; do not retain the testnet USDC address when switching to Base. Local Anvil (`31337`) remains a separate integration-test environment.

Use the **Supabase database URI** in `DATABASE_URL`, not a Supabase project URL or anon/service-role API key. The server supports direct, session-pooler and transaction-pooler connections with prepared statements disabled and remote TLS required. Use a private table-owner connection: app tables enable RLS without public visitor policies. Keep testing and production in separate Supabase projects; verify persistence/restore against the actual account before release. See the [alignment audit](../../../docs/BASE-SUPABASE-ALIGNMENT-AUDIT.md) and [production tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md).
