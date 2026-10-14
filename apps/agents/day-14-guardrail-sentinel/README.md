# Day 14 — The Guardrail Sentinel

A copper security operations room for agent authority. The canonical Day 14 prompt requires contract-enforced budgets/allowlists/time windows, human co-signing, anomaly alerts, global session revocation, Jev gates on every MCP tool call and Jev model routing. The matching supplied `26-day-14.png` inspires the watch-floor art, dark glass, policy roster and emergency controls.

## Architecture and actual authority

The independent Next.js app runs on port 3014. `packages/sentinel` provides reusable policy, permit, risk, payment, simulation, chat and MCP capabilities, using existing Supabase state, receipts, chain and AI-provider infrastructure. No earlier daily server is needed.

`GuardrailSentinel` is a non-upgradeable **USDC smart-account policy custody contract**, the prompt's smart-account-policy alternative to a Safe module. It is not an enabled Safe module and does not control arbitrary external wallets. Each enrolled agent has a separate accounted USDC compartment, session key, contract-recipient allowlist, per-transaction cap, UTC-day cap, co-sign threshold, start/end window and policy version. Owner updates invalidate old permits without resetting daily spending. Owner recovery remains available during shutdown. Only scoped USDC transfers are exposed; arbitrary contract calls, approvals, native-value transfers and swaps are unavailable. Recipient contracts must be able to recover/use direct USDC deposits; contract code alone does not establish service compatibility or safety.

Every payment requires an EIP-712 guardian permit binding agent ID, target, amount, nonce, deadline, global epoch, policy version, human-review requirement and unique request ID. The session key submits the transaction. The owner must cryptographically co-sign above the configured threshold **or whenever Jev confidence is below 85%**. The agent cannot unset that requirement because it is guardian-signed. A human signature cannot override hard budgets, allowlists, expiry or balances. SignatureChecker supports EOA/ERC1271 owners; the built-in wallet UI assumes an EVM owner wallet, and contract-owner signatures can be supplied through the operator API.

The owner or guardian can shut down the fleet, advancing the global epoch and revoking every enrolled session and pending permit. Only the owner can reopen enrollment; old policies stay invalid until explicitly re-enrolled. The guardian can stop the fleet and sign scoped permits, but cannot grant policies, recover USDC or resume. Separate the guardian signer from session keys and owner custody. Host compromise can misuse guardian signing within hard contract limits and cause shutdown; it cannot silently lift owner-signed limits/co-sign thresholds. Fund session keys and the guardian with gas only, and compartments with narrowly limited USDC.

This controls **enrolled Sentinel compartments**, not Days 01–13's existing wallets/contracts or every key elsewhere. Migrate/recover prior funds and revoke their old authorities separately before enrolling replacement session keys. A future agent can compose this shared capability; retroactive universal protection is not claimed.

## Agent, MCP, alerts and simulation

The genuine pinned `@langchain/typesafe` TypeSafeClassifier invokes Jev for typed gate/fit/abuse/model-route decisions. Every MCP tool handler runs the gate before inspection or payment execution; payment execution rechecks risk. Provider failure/malformed responses block execution. Low-confidence allowed payments enter the human queue; explicit rejection cannot be overridden. Critical abuse on financial request/execution tools triggers guardian shutdown; chat rejection alone cannot trigger a financial shutdown.

`/api/mcp` implements SDK Streamable HTTP JSON-RPC tools `sentinel.inspect`, `sentinel.request` and `sentinel.execute`, with operator auth, host/origin checks and body/rate limits. The chat route uses Jev's small/large decision before the existing OpenAI-compatible reasoner; chat has no spending tools. Logs are tamper-evident receipts. Alerts reflect submitted requests and Jev/contract boundaries; there is no invented background security telemetry or automatic monitoring of unrelated wallets.

Every real Base payment must pass actual RPC simulation and the Tenderly Simulation API before broadcast. Only local chain 31337 uses real RPC simulation without Tenderly. API simulation fixtures and local-chain evidence are labeled separately. Tenderly's official public network catalog was checked October 14, 2026 and lists both Base 8453 and Base Sepolia 84532 with simulator support. Paid Tenderly/Jev/OpenAI calls still require live acceptance.

## Run, test and deploy independently

```sh
pnpm install --frozen-lockfile
pnpm readiness 14 --init
pnpm --filter @dapptober/day-14 dev
pnpm --filter @dapptober/day-14 test
pnpm run test:contracts
pnpm run test:sentinel-chain
pnpm --filter @dapptober/day-14 build
```

Open http://localhost:3014. Demo lets you enroll a sample fleet, edit policies, fund/recover simulated balances, submit low/high-confidence requests, approve/execute, acknowledge incidents, use routed chat and revoke/re-enroll. No external models, real signatures or payments are fabricated as production evidence.

Copy the annotated `.env.example` to `.env.local`, or use readiness initialization. Configure **Supabase Session pooler URI**, unique random **OPERATOR_TOKEN**, **JEV_API_KEY**, **OPENAI_API_KEY**/models, **TENDERLY_ACCESS_KEY**, account/project slugs, public **OWNER_ADDRESS**, separate **SENTINEL_GUARDIAN_PRIVATE_KEY** and private **SENTINEL_SIGNERS** JSON catalog (`name` and `privateKey` per session). The public derived addresses must match owner-enrolled session policies. No extra TYPESAFE_API_KEY alias is used and no thirdweb key is required for this day.

On **Base Sepolia (84532)**, deploy `contracts/src/GuardrailSentinel.sol:GuardrailSentinel(owner, guardian, CircleUSDC)` using the repository Foundry deployment wrapper with securely unlocked wallet/ledger. Do not place private keys in shell history. Test USDC is `0x036CbD53842c5426634e7929541ec2318f3dCF7e`; copy the verified deployment receipt address to `SENTINEL_VAULT`, verify source/constructor and fund gas wallets. Set real mode only after configuration. Owner-signed policy enrollment and compartment funding occur through wallet previews; AI cannot grant its own authority.

Production uses **Base 8453**, Circle USDC `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`, separate Supabase project/secrets and a reviewed mainnet deployment. Deploy the app independently with root Dockerfile `APP=day-14-guardrail-sentinel`, or an app-root Next.js hosting project. Use final HTTPS PUBLIC_ORIGIN, private secrets, 60-second request duration, durable database and ingress limits. Runtime independence and hosted-container checks are in CI; local Docker availability and public acceptance are separate evidence.

## Limitations and production completion

Five-minute permits are nonce-bound: competing queued requests for one session can become stale after one executes. Policies expire after at most 30 days. The fleet cap is 100, allowlists 32 contracts; larger monitoring needs indexing and pagination. Jev risk is a signal, not a security audit. The custom custody contract needs independent review before meaningful funds. Real provider access, Supabase durability/backup checks, testnet/mainnet deployments, guardian gas/runbook, independent wallets, signed approval/revocation drills, recipient compatibility, previous-wallet migration and hosted release remain in the ordered [completion tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md).

## Three.js fleet projection

The interactive copper 3D topology shows the guardian, enrolled sessions, their latest recorded request states and daily budget usage. Drag to orbit, click a satellite or use the keyboard-accessible agent buttons to select its policy. Motion can be paused and follows reduced-motion preferences; rendering stops while hidden/offscreen, pixel density is capped and GPU resources are disposed on unmount. WebGL2/context failure leaves the full agent controls and textual state available. The library loads only in the browser on this Sentinel route.

Visible pages refresh their state every ten seconds, with bounded single-flight requests and stale-state warnings after refresh failures. Pulses replay recorded request states; they do not imply new transactions, pending confirmations, live chain subscriptions or protection of unrelated wallets. Revoked/expired/paused policy state takes precedence over old execution records. GPU detail is capped at 24 agents; the accessible selector lists the complete fleet.

Day 14 fleet management: sandbox initialization now loads five sample agents once (Atlas, Mercenary, Aerostat, Oracle and Courier). Existing three-agent demo state receives the two missing samples without resetting historical policies/spending. **Enroll a new session** adds an agent; **Remove agent** requires confirmation and, in real mode, an owner-signed onchain `remove(id)` transaction. It clears session authority, pauses and advances policy version, invalidating permits. Removed agents leave the roster/projection but remain in **Removed agents** for owner recovery and explicit re-enrollment. Balances, daily spending, IDs and audit records are retained; removal never erases financial history or automatically transfers funds. New IDs remain append-only, with 100 lifetime compartment slots.

The contract now includes `remove(uint256)`; any deployment from the earlier non-upgradeable artifact needs a reviewed replacement deployment/migration before this control is available. No public deployment is claimed. Removal and fund recovery passed the funded Anvil case; 105 application tests, 79 contract tests and Day 14 production build passed. Browser removal/archive/re-enrollment was verified.
