# Day 03 — Agent Passport Office

Canonical prompt: [`prompts/dapp-prompts.ts`](../../../prompts/dapp-prompts.ts), day 3. Primary build specification: [`MasterPrompt-DapptoberAgentsBuild.md`](../../../MasterPrompt-DapptoberAgentsBuild.md). Acceptance mapping: [`docs/ACCEPTANCE.md`](../../../docs/ACCEPTANCE.md).

## What it builds

ERC8004-inspired ERC721 identities, machine-readable registration files, client-signed job feedback and independent validator records. Search and inspect passports before deciding trust. Jev gates feedback authenticity and reports fit/confidence.

## Architecture and agent workflow

Register → record completed job and distinct client → client signs EIP712 feedback → publish → independent validator attests → query passport. Read data URIs and chain logs; no server-side fetching of arbitrary untrusted endpoints.

This Next.js application compiles shared source packages into its own build. It never calls another daily application's server. It owns its environment, cookie namespace, state partition and deployment.

## Onchain components

AgentPassport.sol plus optional EAS deployment/schema.

## Tools and guardrails

Tools: `identity.register, identity.job, identity.feedback.preview, identity.feedback, identity.attest, identity.eas, identity.inspect; GET /api/passports?q=`.

Owner-signed previews control real administrative transactions. Server financial tools require operator authentication, typed arguments, policy checks and Jev confidence. No model can create arbitrary calldata. Real mode fails closed when infrastructure is absent. Demo state/receipts are explicitly simulated. Secrets stay in server environment; the agent key must be separate from the human owner. Receipt hashes are tamper-evident but are not signatures or onchain anchors.

## Environment and local run

From the repository root:

```sh
pnpm install --frozen-lockfile
cp apps/agents/day-03-agent-passport/.env.example apps/agents/day-03-agent-passport/.env.local
pnpm run dev 03
```

Open http://localhost:3003. Local mode works without credentials. For real mode, configure this application's `.env.local`, set `AGENT_MODE=real`, and follow [`docs/DEPLOYMENT.md`](../../../docs/DEPLOYMENT.md). Blank optional variables are ignored; required real-mode values produce explicit errors. `PUBLIC_ORIGIN` must exactly match the deployment origin. The operator token must be at least 32 random characters; enter it in the control room.

## Test and build independently

```sh
pnpm --filter @dapptober/day-03 run test
pnpm run build 03
pnpm --filter @dapptober/day-03 run start
```

Contract and shared checks: `pnpm run test:contracts`, `pnpm test`, `pnpm run typecheck`, `pnpm run lint`.

## Deploy independently

Use this app directory as the Vercel project root, enable files outside the root, install from the workspace root and build this workspace. Or use the root Dockerfile with `--build-arg APP=day-03-agent-passport`. Each app needs its own environment and Supabase PostgreSQL state namespace; no other day must be deployed. See [`docs/DEPLOYMENT.md`](../../../docs/DEPLOYMENT.md) for complete setup, contract commands and worker operation.

## Known limitations

The custom registry is explicitly ERC8004-inspired and does not claim full compatibility with the evolving draft. Clients/validators are not automatically trustworthy; filter feedback by known reviewers. Owner job registration is evidence linkage, not independent proof of completion. Public EAS schema must be registered separately. Current directory scanner supports 1000 identities; external URI indexing is not provided.

Credential-dependent live transactions and paid AI inference cannot be claimed tested without the user's credentials and funded wallets. Consult the final audit for actual verification evidence.

## Base networks and Supabase

Testing uses Base Sepolia (`CHAIN_ID=84532`); production uses Base (`CHAIN_ID=8453`). Copy that network's deployed contract addresses and RPC into this app's private environment. For USDC workflows, use Circle's token on the same network; do not retain the testnet USDC address when switching to Base. Local Anvil (`31337`) remains a separate integration-test environment.

Use the **Supabase database URI** in `SUPABASE_DATABASE_URL`, not a Supabase project URL or anon/service-role API key. The server supports direct, session-pooler and transaction-pooler connections with prepared statements disabled and remote TLS required. Use a private table-owner connection: app tables enable RLS without public visitor policies. Keep testing and production in separate Supabase projects; verify persistence/restore against the actual account before release. See the [alignment audit](../../../docs/BASE-SUPABASE-ALIGNMENT-AUDIT.md) and [production tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md).
