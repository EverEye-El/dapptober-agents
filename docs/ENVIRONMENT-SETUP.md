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


## Day17 — Toe Tag

Day17 has an annotated per-app .env.example/.env.local. Provider-specific fields include BLOCKSCOUT_API_URL/optional key, CORONER_PROBE/ROUTER/LOCKERS_JSON, Tenderly access/account/project, CORONER_SCHEMA/SCHEMA_REGISTRY, EAS_ADDRESS, Pinata JWT, Supabase pooler, Jev and OpenAI keys. No USDC/thirdweb/server private key needed. Root env remains a pointer.


## Day18 — Hush

Day18 .env.local is annotated separately. Supabase/Jev/OpenAI keys remain server-only. CONFIDANT_PUBLIC_RPC_URL is explicitly browser-visible; domain-restrict any key. CONFIDANT_CONTRACT/CODE_HASH enroll reviewed runtime. No server spending key or private amounts are accepted by the API. Demo uses disposable in-memory AES, not FHE. Mainnet8453 remains unsupported by this CoFHE integration.

Day20 Overrule: use its app-local annotated template. Supabase/OPERATOR_TOKEN secure the private booth; REFEREE_OPERATOR_PRIVATE_KEY is a dedicated server verdict signer with funded gas and registered collateral. REFEREE_CONTRACT/CODE_HASH/VAULT/START_BLOCK pin actual Base deployment; optional validation registry and Eigen verifier/AVS/set thresholds require actual protocol configuration. Source-chain restaking/slashing credentials are not accepted. Demo uses ephemeral signatures and fixture collateral; no secrets are needed.

## Day 21 — Layover

The app-local template explains `TRAVEL_SOURCES_JSON` (per-chain RPC, canonical USDC, bundler and EntryPoint), `TRAVEL_ROUTERS_JSON` (reviewed router/spender bytecode pins), public `THIRDWEB_CLIENT_ID`, private `THIRDWEB_SECRET_KEY`, optional LI.FI quota key and `TRAVEL_PASS`/runtime hash. Users own their sponsored smart accounts; no server spending key is used. Actual bridge market availability and paymaster policy must be verified on the chosen Base network.

## Day 22 — Pitlane

Use Day 22's annotated `.env.example`/`.env.local`. `SUPABASE_DATABASE_URL` stores private reveal preimages, historical policies, signed outbox and wallet nonces; back them up securely. `OPERATOR_TOKEN` authenticates only private automation/admin. Public trainer/spectator actions use EOA signatures; no operator token is sent to their browser. `RPC_URL`, Circle `USDC_ADDRESS`, `ARENA_CONTRACT` and independently verified `ARENA_CODE_HASH` identify the actual Base deployment.

`ARENA_PILOT_KEYS_JSON` maps registered fighter IDs to their dedicated gas-only signer keys. These wallets cannot stake; never use a spectator wallet key here. `ARENA_MAX_GAS_GWEI` and `ARENA_GAS_DAILY_ETH` bound worker gas. Jev screens commits/reveals; OpenAI coaches training. External coaching runs outside the shared state transaction. Missing/uncertain gates and missing preimages stop that pilot for review while other eligible pilots can continue; an unresolved signed outbox still requires operator reconciliation.

Chainlink needs a **funded VRF v2.5 subscription**, arena consumer enrollment, and the official coordinator/lane hash as deployment constructor arguments. It does not need an API key. House treasury and guardian are also constructor addresses. The guardian enrolls fighters; the worker schedules no new bets, never chooses winners and cannot withdraw spectator funds. Keep all configuration private except deliberately public deployment/account addresses and published strategies.

### Day 23 — REDLINE

Use the detailed per-app `.env.example`. `HYPERLIQUID_ACCOUNT_ADDRESS` is the master account address, not an agent key; `HYPERLIQUID_NETWORK=testnet` selects the native external venue. `PIT_MAX_ORDER_USD=250` caps previews. `SUPABASE_DATABASE_URL` is the private Session pooler connection URI; `OPERATOR_TOKEN` protects the deployment's private reads/writes. `JEV_API_KEY` enables typed risk/routing and `OPENAI_API_KEY` enables trader explanations/debriefs. Browser EOA signs each order; never put its private key here. No thirdweb, RPC or custom contract field is needed. Global Base settings remain unchanged; a native Hyperliquid venue exception is explicit, not a claimed Base integration.

### Day 24 — Umbra Mutual

Use the app's commented `.env.example` / private `.env.local`. Configure Supabase Session pooler `SUPABASE_DATABASE_URL`, generated `OPERATOR_TOKEN`, `JEV_API_KEY`, Base chain/RPC/Circle USDC and verified `MUTUAL_POOL`, `MUTUAL_CODE_HASH`, `MUTUAL_IDENTITY_REGISTRY`, `MUTUAL_REPUTATION_REGISTRY`. Optional `SNAPSHOT_SPACE` enables a verified advisory proposal mirror. No OpenAI/thirdweb/server wallet key is used. Constructor guardian/trusted reviewers are deployment choices, not secret API credentials. Keep Base Sepolia and Base pools, epochs and Supabase projects separate.
