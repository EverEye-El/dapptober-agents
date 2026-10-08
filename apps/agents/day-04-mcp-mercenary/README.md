# Day 04 — MCP Mercenary Guild

Canonical prompt: [`prompts/dapp-prompts.ts`](../../../prompts/dapp-prompts.ts), day 4. Primary build specification: [`MasterPrompt-DapptoberAgentsBuild.md`](../../../MasterPrompt-DapptoberAgentsBuild.md). Acceptance mapping: [`docs/ACCEPTANCE.md`](../../../docs/ACCEPTANCE.md).

## What it builds

USDC escrow quests with actual MCP discover/claim/submit tools. The agent selects a summarization quest, performs work, commits output and waits for independent approval. Supports dispute, validator resolution, review timeout and refund.

## Architecture and agent workflow

Post source and funded quest → dispatch harness → SDK MCP discovery/claim → generated or clearly simulated local summary → submission hash → creator/validator approval → escrow paid. The in-process harness uses a real MCP SDK client; external agents use /api/mcp Streamable HTTP or stdio.

This Next.js application compiles shared source packages into its own build. It never calls another daily application's server. It owns its environment, cookie namespace, state partition and deployment.

## Onchain components

QuestEscrow.sol

## Tools and guardrails

Tools: `bounty.discover, bounty.claim, bounty.submit over MCP; bounty.create, bounty.work, bounty.approve, bounty.dispute, bounty.resolve, bounty.timeout, bounty.leaderboard`.

Owner-signed previews control real administrative transactions. Server financial tools require operator authentication, typed arguments, policy checks and Jev confidence. No model can create arbitrary calldata. Real mode fails closed when infrastructure is absent. Demo state/receipts are explicitly simulated. Secrets stay in server environment; the agent key must be separate from the human owner. Receipt hashes are tamper-evident but are not signatures or onchain anchors.

## Environment and local run

From the repository root:

```sh
npm ci
cp apps/agents/day-04-mcp-mercenary/.env.example apps/agents/day-04-mcp-mercenary/.env.local
npm run dev -- 04
```

Open http://localhost:3004. Local mode works without credentials. For real mode, configure this application's `.env.local`, set `AGENT_MODE=real`, and follow [`docs/DEPLOYMENT.md`](../../../docs/DEPLOYMENT.md). Blank optional variables are ignored; required real-mode values produce explicit errors. `PUBLIC_ORIGIN` must exactly match the deployment origin. The operator token must be at least 32 random characters; enter it in the control room.

## Test and build independently

```sh
npm run test --workspace @dapptober/day-04
npm run build -- 04
npm run start --workspace @dapptober/day-04
```

Contract and shared checks: `npm run test:contracts`, `npm test`, `npm run typecheck`, `npm run lint`.

## Deploy independently

Use this app directory as the Vercel project root, enable files outside the root, install from the workspace root and build this workspace. Or use the root Dockerfile with `--build-arg APP=day-04-mcp-mercenary`. Each app needs its own environment and PostgreSQL state namespace; no other day must be deployed. See [`docs/DEPLOYMENT.md`](../../../docs/DEPLOYMENT.md) for complete setup, contract commands and worker operation.

## Known limitations

Initial worker capability is summarization of supplied source; no invented external research. Validator is a trusted address nominated by creator, not an automated truth oracle. Submitted quests pay after two days without dispute; unclaimed/unfinished quests refund after deadline; unresolved disputes refund after two days. Real scan limit 1000 quests.

Credential-dependent live transactions and paid AI inference cannot be claimed tested without the user's credentials and funded wallets. Consult the final audit for actual verification evidence.
