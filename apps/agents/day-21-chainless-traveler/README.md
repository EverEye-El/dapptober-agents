# Layover — Day 21 / The Chainless Traveler

A copper airport lounge for outcome-first payments, minting and swaps. Independently runnable Next app on **3021**, shared `@dapptober/traveler` package, and a fixed-price Base souvenir NFT. The departures board uses accessible split-flap text with reduced-motion support.

## Run locally

From the repository root, use pnpm 10.2.0:

```sh
pnpm install --frozen-lockfile
pnpm dev 21
```

Open http://localhost:3021 in Codex. Demo mode needs no credentials. Try `pay 5 USDC to 0x3333333333333333333333333333333333333333`, `mint a pass`, or `swap 5 USDC for at least 0.001 WETH`. Check the itinerary consent box, confirm, then use the explicitly simulated departure/arrival controls. Demo multi-network balances and sponsorship are synthetic; no hashes or real payments are fabricated.

Production build: `pnpm build 21`; run it with `pnpm start 21`. Independent Vercel settings and the root standalone Docker build support this app. Shared setup and per-day outstanding work are in [the completion tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md).

## Configure real operation, in order

1. Copy this app's detailed `.env.example` to `.env.local` if absent. Preserve the generated operator password. Choose **Base Sepolia 84532** first; never mix test and mainnet funding sources. Use a separate Supabase project and app credentials when moving to Base 8453.
2. Supply **Supabase Session pooler PostgreSQL URI**, private `OPERATOR_TOKEN`, TypeSafe `JEV_API_KEY`, and billed `OPENAI_API_KEY`/models. Runtime automatically creates the shared namespaced state table with RLS. Restrict database privileges and test persistence/restore with your Supabase service.
3. Create a **thirdweb project**: restricted public client ID, private secret key, enabled/funded Account Abstraction sponsorship on Base Sepolia, bounded paymaster policy and billing alerts. Obtain the actual RPC and ERC-4337 bundler URL and matching EntryPoint address. The receipt verifier requires `eth_getUserOperationByHash` and thirdweb's single `execute(address,uint256,bytes)` account encoding. Verify the provider supports those before release. No server agent key is needed.
4. Fill `TRAVEL_SOURCES_JSON` with the destination first, canonical Circle USDC, RPC, bundler and EntryPoint. On production, optionally add approved mainnet Ethereum/Optimism/Arbitrum sources with their own details. Connect an injected EVM wallet; the app derives an account on each source without asking the user to pick a chain. **Fund the displayed smart-account addresses with USDC**, not merely the personal EOA. Approve your wallet requests yourself. Source native gas is paid by the configured paymaster.
5. Deploy `contracts/src/LayoverPass.sol` on Base Sepolia with Circle USDC `0x036CbD53842c5426634e7929541eC2318f3dCF7e` and your treasury address. Use the repository network-checked deployment wrapper (`node scripts/contracts.mjs create ... --broadcast --rpc-url <your-rpc>`), signing with your own deployer. Add its address and independently verified deployed runtime hash. Constructor price is fixed at one USDC. The pass confers no rewards, yield or actual travel entitlement.
6. For external bridge/swap routes, review official deployments and runtime/implementation/facet upgrade risks. Add **both transaction routers and allowance spenders** to `TRAVEL_ROUTERS_JSON` with provider, source chain, address and bytecode hash. Empty rules allow only direct Base payments/mint. Add LI.FI Partner Portal key if needed for production swap quota. No router addresses are invented. Unsupported Base Sepolia liquidity remains unavailable; test direct payment/mint there and only enable a bridge after its actual test quote is accepted.
7. Set `AGENT_MODE=real`; use the private lounge operator login, reconnect the same wallet after a page reload, refresh balances and run the readiness check. Inspect every recipient/minimum/input/fee and sign each sponsored call. External routes cap USDC fees at 5%, at most two USDC, for pay/mint; swaps cap exact input at 100 USDC. Direct and pay inputs cap at 100 USDC (a fee can raise total input to 102). Each flight is serialized while active. These are app gates, not autonomous custody limits.
8. After broadcast, **Verify receipt** checks the successful sponsored operation, exact calldata and three confirmations. **Check arrival** queries the bridge and checks the destination receipt. Mint connections stay blocked until delivery is verified. Partial/refund/failure goes to review. Keep inspecting the original hash; do not assume a timeout means failure or resend the transfer.
9. Test real wallets, sponsorship refusal, injected wallet account changes, provider failures/quotes/expiry, same/cross-chain output, pass receipts, restart persistence and allowance cleanup. Then finish security review, domain restrictions, HTTPS hosting, monitoring/backups and a small public-chain acceptance run before mainnet.

## Recovery and limits

Preparing a leg first records a durable signing lock. It prevents a second send while the wallet result is unknown. A transaction hash is saved in browser session storage immediately after wallet submission, then registered durably in Supabase. **Recover recorded broadcast** re-registers it if that request failed. Wallet/browser failure in the gap before a hash is returned cannot be inferred safely: inspect wallet and bundler history. Register an existing hash with the recovery form; unlock an unsent leg only after explicitly verifying no operation was submitted. That acknowledgement is an operator assertion, not an onchain proof. Replacements/drops, provider refunds and post-approval quote expiry require operator inspection. Do not silently retry. Exact unused allowances can be revoked from the account wallet before a fresh route. Full proxy/router semantics, paymaster policies, real bundler compatibility, external bridges and service persistence require live acceptance; local tests are not that evidence.

The app is a private operator lounge, not a public multi-user custody service. All wallets remain user-owned. `OPERATOR_TOKEN` authorizes the shared deployment workspace; do not share it publicly. Limits: five funding networks, ten open quotes, one active flight, 200 retained flights and 40 requests/minute. Export/archive before increasing limits. Secrets remain server-only; public client ID and smart-account addresses are intentionally public.

## Verification

`pnpm test` covers grammar, caps, state order, candidate gating and provider failures. `pnpm test:contracts` covers paid minting, insufficient allowances, network/token restrictions and fuzzing. `pnpm test:traveler-chain` runs funded USDC pay/mint and receipt substitution checks on an owned Anvil chain with **explicit smart-account/EntryPoint/bundler/Jev/LLM fixtures**. It does not implement or verify a real ERC-4337 paymaster, real bridge/DEX, real AI or production database.

[Research](../../../docs/DAY-21-RESEARCH.md) · [Audit](../../../docs/DAY-21-AUDIT.md)
