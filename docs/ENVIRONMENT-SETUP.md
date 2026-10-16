# Where to enter configuration

Edit `apps/agents/day-XX-<name>/.env.local` for each app. Each private file now contains the same field explanations as its `.env.example`. The root `.env.example` only points to these files.

## Provider settings

| Setting | What it is | Where to obtain it |
| --- | --- | --- |
| `SUPABASE_DATABASE_URL` | Full private database connection URI, including your database credentials | Supabase project → Connect → Session pooler; copy the URI with your actual database password |
| `OPENAI_API_KEY` | OpenAI server API key for the reasoning model | Your OpenAI API project; enable billing and access to the configured models |
| `OPENAI_BASE_URL` | Reasoning API endpoint | Already filled with `https://api.openai.com/v1`; change only for another compatible provider |
| `OPENAI_SMALL_MODEL` | Model Jev selects for simple reasoning | Already filled with `gpt-4.1-mini` |
| `OPENAI_LARGE_MODEL` | Model Jev selects for complex reasoning | Already filled with `gpt-4.1` |
| `JEV_API_KEY` | TypeSafe/Jev key for screening, confidence and model routing | Your TypeSafe/Jev account with `jev-latest` access |
| `THIRDWEB_SECRET_KEY` | Day 01 thirdweb server secret | thirdweb project/API key settings; use the secret, not the public client ID |

Days 07 and 11 use Ollama in their own workers and have no OpenAI settings. Its template explains worker URL, token, model digest and attestation measurements. Day 10's template explains the World ID app, RP and private signing key separately.

## Wallets, secrets and addresses

`OWNER_ADDRESS` is your public owner wallet address. `AGENT_PRIVATE_KEY` is a separate day-specific signer; its exact purpose is described in that day's file. `OPERATOR_TOKEN` is a random secret you generate, not a provider key. Generate a separate token per app. Day 10 also needs a stable random `CHECKPOINT_SESSION_SECRET`.

Contract fields such as `SESSION_VAULT` and `FORECAST_MARKET` must contain the address from that contract's actual deployment receipt. API keys do not deploy contracts. The completion tracker lists deployment and funding steps for each day.

You may reuse the same testing Supabase connection URI across days: shared storage separates records by day/operator, and Day 10 has its own checkpoint table. Use a separate production Supabase project. Keep all private values in `.env.local` or the host's secret manager; never enter them in committed `.env.example` files.

## Renamed settings

The runtime now reads `SUPABASE_DATABASE_URL`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_SMALL_MODEL`, `OPENAI_LARGE_MODEL` and `JEV_API_KEY`. These replace the previous generic database, AI and TypeSafe names. Local private files were migrated with values preserved. If you previously configured a hosting service or secret manager, rename those settings there too. The old names are no longer consumed.

Keep `AGENT_MODE=demo` while required accounts/contracts are missing. Once that day's real prerequisites are configured, change it to `real`, restart the app, and run its readiness check. Restart running apps after editing environment settings.

Day 11 compute/provider settings are documented field by field in its app template and `services/gpu-provider/.env.example`. The app holds only the buyer key; the independently deployed worker holds only the provider key. Akash lease account/funding is separate from Base USDC job settlement.

Day 12 uses Jev for approved license selection and does not require OpenAI. Its app template documents `PINATA_JWT` (public IPFS upload), `THIRDWEB_SECRET_KEY` (server NFT ownership reads), `PROVENANCE_PRESS` (deployed Base registry), `PRESS_START_BLOCK` (certificate history scan floor), and `PRESS_AGENT_LICENSE_CAP`/`PRESS_AGENT_DAILY_CAP` (USDC agent limits). Native Story/PIL integration remains a separate implementation and network compatibility gap.

Day 13 requires OpenAI for paid agent text inference and launch narration, Jev for risk gates, thirdweb secret for token verification, Supabase for durable jobs/caps, and LAUNCH_FACTORY for the deployed Base factory. DUNE_API_KEY / DUNE_LAUNCH_QUERY_ID configure the supplied saved Base mainnet SQL query. LAUNCH_AGENT_BUY_CAP / LAUNCH_AGENT_DAILY_CAP constrain the dedicated funded buyer; all fields are annotated in its app template.

Day 13 onchain buyer setup: after the factory deployment, deploy `GantryBuyerVault(owner, agentSigner, CircleUSDC, factory)` and set `LAUNCH_BUYER_VAULT`. Owner-signed grants atomically replace the allowed listing IDs and set caps/24-hour expiry; owner-signed revoke stops the vault. Fund the vault with limited USDC, the signer with gas only. Owner recovery and holder-revenue claims use wallet previews. The vault checks the actual factory listing and retains UTC-day spent across renewed grants.

Day 14 uses SENTINEL_VAULT, separate SENTINEL_GUARDIAN_PRIVATE_KEY and private SENTINEL_SIGNERS JSON (name/privateKey per gas-only session). Tenderly access/account/project fields authorize mandatory Base simulations. JEV_API_KEY is passed explicitly to LangChain TypeSafeClassifier; no second Typesafe key alias. OpenAI supports routed guardian explanations, and Supabase persists private permits/receipts.


Day 15 uses its own annotated `.env.local`: Supabase Session pooler, operator token, public investor wallet, Base RPC/Circle USDC, TypeSafe Jev and OpenAI keys, `CHAINLINK_USDC_USD_FEED_ADDRESS`/heartbeat, issuer NAV age and `RWA_CATALOG_JSON`. The supplied mainnet JTRSY template is disabled until issuer review and must not be reused on Base Sepolia. No AGENT_PRIVATE_KEY/thirdweb/Tenderly credential is used.


## Day 16 — Brass

Day 16 uses its own annotated app .env.example/.env.local: BOURSE_ESCROW, BOURSE_REGISTRY, BOURSE_BUYER_ID, BOURSE_SELLERS_JSON, BOURSE_SELLER_KEYS_JSON, BOURSE_MAX_USDC, OWNER_ADDRESS, Circle USDC/RPC, SUPABASE_DATABASE_URL, OPERATOR_TOKEN, JEV_API_KEY, and OpenAI fields for local sellers. Seller tokens/keys remain private; no buyer private key, thirdweb, or Tenderly configuration. Root env remains a pointer.
