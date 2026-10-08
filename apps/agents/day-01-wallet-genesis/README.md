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
npm ci
cp apps/agents/day-01-wallet-genesis/.env.example apps/agents/day-01-wallet-genesis/.env.local
npm run dev -- 01
```

Open http://localhost:3001. Local mode works without credentials. For real mode, configure this application's `.env.local`, set `AGENT_MODE=real`, and follow [`docs/DEPLOYMENT.md`](../../../docs/DEPLOYMENT.md). Blank optional variables are ignored; required real-mode values produce explicit errors. `PUBLIC_ORIGIN` must exactly match the deployment origin. The operator token must be at least 32 random characters; enter it in the control room.

## Test and build independently

```sh
npm run test --workspace @dapptober/day-01
npm run build -- 01
npm run start --workspace @dapptober/day-01
```

Contract and shared checks: `npm run test:contracts`, `npm test`, `npm run typecheck`, `npm run lint`.

## Deploy independently

Use this app directory as the Vercel project root, enable files outside the root, install from the workspace root and build this workspace. Or use the root Dockerfile with `--build-arg APP=day-01-wallet-genesis`. Each app needs its own environment and PostgreSQL state namespace; no other day must be deployed. See [`docs/DEPLOYMENT.md`](../../../docs/DEPLOYMENT.md) for complete setup, contract commands and worker operation.

## Known limitations

Real wallet/bundler calls require thirdweb credentials and funded vault. SessionVault is a custody extension, not a replacement EntryPoint or a claim that thirdweb native target restrictions enforce USDC caps. ENS commands in local mode resolve to the labelled local recipient; real mode currently requires explicit addresses.

Credential-dependent live transactions and paid AI inference cannot be claimed tested without the user's credentials and funded wallets. Consult the final audit for actual verification evidence.
