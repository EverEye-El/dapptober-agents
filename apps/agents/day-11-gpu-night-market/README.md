# Day 11 — The GPU Night Market

Canonical prompt: [complete Day 11 requirements](../../../prompts/dapp-prompts.ts). Build architecture: [master specification](../../../MasterPrompt-DapptoberAgentsBuild.md). A lantern-lit compute bazaar: provider capacity, Jev-ranked bids, reserved-minute USDC escrow, hash-bound inference delivery and observed reliability. Design uses the supplied `23-day-11.png` in the established copper terminal universe.

## Run and test independently

```sh
pnpm install --frozen-lockfile
cp apps/agents/day-11-gpu-night-market/.env.example apps/agents/day-11-gpu-night-market/.env.local
pnpm run dev 11
pnpm --filter @dapptober/day-11 test
pnpm run build 11
pnpm --filter @dapptober/day-11 start
```

Open http://localhost:3011. Click **Light demo lanterns**, rank a request, bid, run funded inference, inspect its hash and export receipts. Demo uses deterministic labelled inference/accounting; no GPU, blockchain transaction or payment is claimed. Expiry-clock advancement is demo-only.

## Architecture and capabilities

This app compiles `@dapptober/compute`, shared HTTP/auth, Supabase state, chain validation, Jev and receipts into its own deployment. No other daily server is required. The provider worker is a separately deployable compute service, not another daily app.

`compute.rank`, `compute.bid`, `compute.book`, `compute.run`, `compute.refund`, `compute.list`, `compute.allow`, `compute.authorize`, `compute.pause`, `compute.refresh`, `receipt.verify`. Agent bidding endpoint: `POST /api/bids` with operator bearer authorization, `Content-Type: application/json`, and `{ "input": { "model": "qwen3:0.6b", "prompt": "Explain escrow", "minutes": 1, "budget": "1", "vram": 16 } }`. The API ranks approved eligible providers and funds a job inside both app and contract caps. Provider tokens are server-only and never returned in API state.

Bookings use a **fixed reserved-minute charge**, price × minutes; they do not meter actual GPU seconds or lease costs. Provider output commits `keccak256(UTF8(output))`, while input commits `keccak256(UTF8(JSON.stringify({model,prompt})))`. Contract model hash is snapshotted at booking. Successful delivery immediately pays the full reserved amount. The hash verifies output integrity, not semantic correctness, GPU hardware, provider identity reputation or confidential execution. Providers are reviewed and allowlisted by the owner for agent purchases.

## Onchain components and real setup

Testing uses Base Sepolia (84532); production uses Base (8453). Local Anvil (31337) is exclusively integration evidence. Contract: `GpuNightMarket(owner, USDC)`. Deploy with the network-checked Foundry wrapper:

```sh
node scripts/contracts.mjs create src/GpuNightMarket.sol:GpuNightMarket --rpc-url "$RPC_URL" --account dapptober-deployer --broadcast --constructor-args "$OWNER_ADDRESS" "$USDC_ADDRESS"
```

1. Configure this app's annotated `.env.local`: Supabase connection URI, unique operator token, public owner address, dedicated buyer private key, Jev API key, actual market contract and matching Circle USDC. No OpenAI key is used; inference runs on the selected worker.
2. Deploy a provider worker and Ollama on real GPU capacity using [the worker setup](../../../services/gpu-provider/README.md). It needs its own provider signer, narrowly funded native gas, bearer token, pinned model and persistent outputs.
3. Connect that provider wallet and list model, declared VRAM, concurrent slots and USDC/minute price. Keep specs consistent with the deployed worker. Provider leases are purchased separately on Akash; this app does not provision Akash leases or pay Akash charges in Base USDC.
4. Pin the reviewed worker wallet, name, private HTTPS origin/token and optional **public WSS status URL** in `GPU_PROVIDERS`. Origins cannot contain credentials/query strings. The operator can configure up to 16 endpoints; users cannot choose arbitrary URLs.
5. Owner signs **Allow agent bids** for approved stalls, and **Authorize agent caps / 24h**. Default job cap is 2 USDC and gross daily cap 10 USDC; renewal never resets onchain spending. Fund the buyer with a narrow USDC/ETH amount.
6. Switch to real, restart, enter the operator token and refresh. Health checks verify the pinned worker's provider/model, observe availability every ≥15 seconds and fail closed on offline workers. Price, busy slots and delivered/failed totals come from chain. WebSocket messages only affect live visual telemetry.
7. Humans use browser wallet previews for exact approval and booking. Agents sign their own bounded purchases. Run the job; worker verifies its funded onchain assignment and input commitment, executes Ollama, stores output durably, delivers its hash and waits for payout confirmation. Verify browser output against the onchain hash and token balances.
8. If the worker fails, retry the same funded job or refund after its deadline (reserved minutes + five minutes). Anyone may trigger the refund to the original buyer. Market pause stops new jobs, while delivery/refund remain available.

## Guardrails and operational limits

Contracts enforce price protection, capacity, deadline, replay protection, dedicated agent caps, provider allowlist and pause. Input is capped at 8,000 characters, inference output 32,768 characters, completion 512 generated tokens, reservations 1–60 minutes. API allows 30 actions/minute per operator workspace. A rejected Jev decision or confidence below 0.85 blocks a bid. Ranking combines smoothed completion rate (65%) and observed availability (35%), multiplied by Jev policy-fit probability, then uses price as a tie-breaker. New providers are **unrated**, with an explicit 50% ranking prior rather than fabricated uptime/history.

Provider listings are declarations and completion counts can be manipulated by coordinated wallets; they are not Sybil-resistant reputation. Review hardware/lease/ownership externally before approving providers. Paid output delivery alone cannot adjudicate incorrect inference. Add a separately specified validation/dispute mechanism before advertising answer correctness guarantees. Prompts/results are private operator state plus provider outputs; establish retention and backups before release.

Contract bounds: 100 providers and 1,000 lifetime jobs, including expired jobs. Deploy an indexed/scalable market design before exceeding these limits; the app scans this bounded market. The app is a single-operator control room with both human-wallet and agent buying lanes, not a public multi-tenant custody service. An external buyer may use the permissionless contract, but this workspace can only run jobs whose prompt it holds. Use a Node host with sufficient request time (up to 120 seconds configured); serverless plan limits must be verified.

## Independent deployment and remaining work

Use this app directory as Vercel Root Directory with access to workspace files, or build the root Dockerfile with `--build-arg APP=day-11-gpu-night-market`. Host the worker separately on Akash GPU capacity behind TLS/WSS. The worker image and Akash SDL are supplied; a funded live lease and actual GPU inference are unverified.

See [Day 11 research](../../../docs/DAY-11-RESEARCH.md), [audit](../../../docs/DAY-11-AUDIT.md) and [living production checklist](../../../docs/PROJECT-COMPLETION-TRACKER.md). Public deployments, paid Jev, actual Akash lease/hardware, real Supabase durability, funded Base acceptance, independent security review and operational retention/monitoring remain owner-dependent release steps.
