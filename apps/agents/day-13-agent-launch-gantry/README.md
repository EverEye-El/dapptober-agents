# Day 13 — Agent Launch Gantry / gantry.fun

Canonical prompt: deploy a tokenized agent, route its earned revenue to holders, and expose vested creator allocation, locked liquidity and rug-risk signals beside revenue versus valuation. Stack: thirdweb Token Contracts, bonding curves, Base, Dune and TypeSafe Jev. The interface is a degen launch feed, curve trade dock and paid agent terminal, inspired by the supplied rocket gantry graphic rather than the earlier daily control-room layouts.

## What works

A single factory transaction deploys **LaunchAgent**, inheriting the official thirdweb Solidity `ERC20Base` (pinned 3.15.0). The contract contains the immutable public agent prompt, token, curve and USDC treasury. Supply is exactly 1M; mint, burn and owner-change authority are disabled. 80% begins in the curve; 20% stays in creator vesting with a 90-day cliff and full linear vest after 365 days from launch. The day-90 release includes the elapsed 90 days. There is no proxy or admin reserve withdrawal.

Trading uses a perpetual virtual-reserve curve: `buyOut = payment * curveTokens / (1000 USDC + reserve + payment)`. Sells use the reverse formula and must fit real USDC reserves. Creator tokens, once vested, can be sold only against real reserves. This is **locked curve liquidity**, not an LP token lock or automatic DEX graduation. Sales can reduce reserves; there is no guaranteed exit liquidity. The projected chart is explicitly not historical market data. Curve FDV is marginal curve price × fixed supply, not externally traded market cap.

Paid text services and tips enter a separate revenue liability. Unsold curve inventory and unvested creator tokens do not receive dividends. A magnified per-token accumulator and transfer corrections preserve the sender's past earned revenue when tokens move; later buyers cannot steal earlier distributions. Holder claims pull USDC without reducing tracked curve reserves. Rounding dust remains in the contract. Revenue receipts prove money received, not profitability, independent customer demand or the absence of self-tipping.

The app verifies an onchain paid job ID and exact request hash before calling Jev and the configured OpenAI-compatible reasoner. Output is cached durably by job ID, and replay returns the cached output. The agent is text-only: no tools, wallet authority or arbitrary URL fetching. A failed inference can be retried; **service fees have no automatic refund**. Prompts and request commitments are public and must contain no secrets. Creators configure their agents in the launch form; the independently deployed Day 13 server hosts their inference runtime. Deploying a launch does not provision a new external server.

Jev gates launches, paid requests and autonomous buys and provides listing risk/abuse/confidence indicators. The LLM writes the launch/revenue narrative using actual ledger figures. No AI score certifies investment safety. Human wallet previews have exact approvals, 1% trade slippage and five-minute deadlines. Operator-authenticated autonomous buys require an explicit listing allowlist, a 24-hour authorization, per-buy and UTC-day caps, and a stop switch; spent counters survive rearming. Server state enforces an additional gate; GantryBuyerVault enforces the actual allowlist, per-buy/daily caps, expiry and revocation onchain. Fund the agent signer with gas only and the owner-controlled vault with narrowly bounded USDC. Rearming does not reset onchain UTC-day spending.

## Architecture and endpoints

`packages/launchpad` owns deploy/trade/revenue/AI/service/analytics capabilities. Shared config, chain, receipts, Jev/reasoner, Supabase state and HTTP auth are reused. App 13 runs independently; no other daily server is required.

- `/api/agent`: public sanitized launch feed and wallet-only transaction previews; operator-authenticated private state, buyer arming and autonomous execution. Public callers cannot access jobs, receipts or buyer policy; human actions require an explicit wallet. Cookie-isolated demo state.
- `/api/launches`: public read-only listing feed, with prompts/private jobs and wallet-specific claim values omitted.
- `/api/service`: public paid-job execution/recovery; funded contract payment and request commitment required before live inference. Uses durable operator namespace and bounded text bodies/rate limits.

Tools: `launch.deploy`, `launch.buy`, `launch.sell`, `launch.tip`, `launch.servicePay`, `launch.inspect`, `launch.claim`, `launch.vest`, `launch.verify`, `launch.dune`, `launch.arm`, `launch.agentBuy`, `launch.refresh`, `receipt.verify`. Generated agent outputs and decisions produce tamper-evident receipts. Demo fixtures pool simulated holder balances; multi-wallet transfer-corrected distributions are tested on actual local-chain contracts.

## Configure and run

```sh
pnpm install --frozen-lockfile
pnpm readiness 13 --init
pnpm --filter @dapptober/day-13 dev
```

Open http://localhost:3013. Use “Load sandbox launches” or launch your own simulated agent. All simulated trades, outputs and balances are labeled. No fabricated transaction hashes or model results are presented as real.

The app's `.env.example` explains every field. Add Supabase Session pooler URI, random operator secret, public owner address, gas-only buyer private key, Jev key, OpenAI model access, thirdweb server secret and factory address. Base Sepolia testing uses chain 84532 and Circle USDC `0x036CbD53842c5426634e7929541ec2318f3dCF7e`. Production uses Base 8453 and USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`. Use separate testing/production databases and deployed factory addresses. Root environment configuration remains a pointer.

## Contracts, verification and deployment

```sh
pnpm run test:contracts
pnpm --filter @dapptober/day-13 test
pnpm run test:launch-chain
pnpm --filter @dapptober/day-13 build
pnpm readiness 13 --online
```

Deploy `contracts/src/AgentLaunchGantry.sol:AgentLaunchGantry` through Foundry with the selected network's Circle USDC as the sole constructor argument. Use the repository deployment wrapper `node scripts/contracts.mjs create` with a verified Base RPC and a securely unlocked account/ledger; do not place private keys in command history. Copy the successful receipt address to `LAUNCH_FACTORY`. Verify source and constructor argument publicly. Then set `AGENT_MODE=real`, fund creator/buyer gas and buyer-vault USDC, launch from the browser, trade, pay a service, verify cached delivery and claim revenue. Contracts must be independently reviewed before meaningful funding.

Build and deploy only this app as a standalone container using root `Dockerfile` with `APP=day-13-agent-launch-gantry`, or a separate Next.js hosting project with app-root build command. Allow up to 60 seconds for AI requests and preserve Supabase persistence. Final hosting comes after local/provider rehearsal; set the exact final HTTPS `PUBLIC_ORIGIN`, private environment secrets and operator authentication.

## Dune

`docs/DAY-13-DUNE.sql` provides a raw-log Base mainnet query. Set its `factory` text parameter to your verified lowercase factory address without `0x`, save, run and schedule it. Set `DUNE_API_KEY` and numeric `DUNE_LAUNCH_QUERY_ID`. The adapter rejects stale (>24h), incomplete and wrong-chain/factory results. Dune is supplemental analytics; RPC totals remain authoritative. Base Sepolia indexing is not assumed. The SQL and live Dune service must be verified after a public Base deployment; credential-free response fixtures are not Dune production evidence.

## Remaining release work

See the ordered [completion tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md). Provider credentials, actual Supabase, Base Sepolia/Base deployments/funding, hosted wallet acceptance, real inference, Dune query execution, legal terms, independent contract review, backups/monitoring/retention and release remain owner/deployment tasks. No real public-chain launch, live model call or production readiness is claimed by the demo or local-chain tests.

Day 13 onchain buyer setup: after the factory deployment, deploy `GantryBuyerVault(owner, agentSigner, CircleUSDC, factory)` and set `LAUNCH_BUYER_VAULT`. Owner-signed grants atomically replace the allowed listing IDs and set caps/24-hour expiry; owner-signed revoke stops the vault. Fund the vault with limited USDC, the signer with gas only. Owner recovery and holder-revenue claims use wallet previews. The vault checks the actual factory listing and retains UTC-day spent across renewed grants.
