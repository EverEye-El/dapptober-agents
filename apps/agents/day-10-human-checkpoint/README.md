# Day 10 — The Human Checkpoint

An independently deployable noir checkpoint with two enforced lanes: private World ID personhood opens human-only chat and fixed USDC rewards; an ERC-8004 registry signature opens a clearly labeled public-information agent API. Copper terminal styling uses the supplied `2026SocialPosts/22-day-10.png` graphic.

```sh
pnpm install --frozen-lockfile
pnpm run dev 10                 # http://localhost:3010
pnpm run build 10
pnpm run start 10
pnpm --filter @dapptober/day-10 run test
pnpm run test:checkpoint-chain
```

Demo needs no credentials. Simulate a human, post a message, save a simulated return passkey, claim the simulated reward, leave and return. Then leave and enter as a simulated registered agent. Ask the labeled API and test its rejected reward attempt. The simulation bench exposes the fixture nullifier and passkey so you can exercise duplicate enrollment from another session. A passkey fixture is not a hardware-authenticator test. No proof, AI inference or money movement is fabricated as live evidence.

## Authority and privacy

- World ID 4.x `proofOfHuman` uses a server-signed RP context, a fixed production action and a signal bound to the nonce and reward wallet. The backend rejects legacy, staging, wrong nonce/action/signal/issuer and expired proofs before calling the pinned production verification endpoint. No human identity is accepted from a browser badge or claimed lane.
- The verified nullifier is normalized as a decimal, then hashed under the RP/action scope. Only its derived commitment, enrollment expiration, immutable recipient and passkey public keys are retained. No biometric/name/proof data enters storage, receipts or AI prompts. The World verifier still receives the required zero-knowledge proof; configure and disclose that provider use before public onboarding.
- Enrollment uniqueness spans all visitors. Real storage uses Supabase PostgreSQL row locking under a stable RP/action namespace; rotating operator or cookie-signing secrets does not reset claims. Demo has a single-process atomic file queue. Never delete/reset the production enrollment database or change the RP/action in an existing campaign.
- Passkeys attach only after verified personhood. Registration/login verify challenge, RP ID, origin, signature and user verification using SimpleWebAuthn. Returning humans retain the same identity, claim history and reward wallet. An expired credential blocks access; a fresh World ID enrollment proof can renew the expired record for the original wallet while preserving its claim/passkeys. Passkeys alone do not establish unique humanity.
- Agent login signs short-lived EIP-712 challenges. The adapter reads `ownerOf` and `getAgentWallet` from an actual ERC-8004 registry, supports EOA/ERC-1271 signature verification, and rechecks registry authority on every API query. A transfer or unset wallet removes that authority. Day 03's custom ERC8004-inspired passport is intentionally not treated as this standard registry.
- Jev scores abuse/Sybil risk from minimal verified facts, moderates human chat, and routes public agent questions to the configured small/large model. AI never grants personhood, overrides cryptographic failure or reads the private human conversation for agent responses. Provider failure closes the attempted operation.
- Visitors have signed, HttpOnly, SameSite=Strict cookies and fixed 24-hour sessions. Real cookies are Secure on HTTPS. Cross-origin/cross-site requests, oversized bodies and requests beyond 60/minute/session are rejected. A deployed ingress must also rate-limit new sessions by IP and apply resource quotas; session limits alone do not prevent bot-created visitor floods.

## Rewards

`HumanCheckpointRewards` pays one **fixed six-decimal token amount** per person commitment per immutable campaign. The contract enforces verifier signatures, recipient/campaign/chain/contract binding, expiry, pause and permanent claim uniqueness. The signer only issues vouchers; it never transfers funds or pays visitor gas. Visitors review and submit the exact transaction in their own wallet. Anyone may relay a voucher, but it can only pay its bound recipient. Receipts are accepted only with a successful transaction containing that person's exact `Claimed` event.

The contract verifies the voucher, not a World ID proof. **The backend verifier is trusted** to issue vouchers only after a valid unique proof. Use a dedicated managed signer and least-privilege server; a compromised signer could invent person commitments and drain the funded campaign. The contract has no admin withdrawal: deploy a small bounded campaign and fund only its intended budget. Lost-wallet recovery and moving recipients are intentionally unavailable in a funded campaign. A claim that fails for insufficient contract funds does not consume the person commitment.

## Real deployment

1. Create a production World Developer Portal app/RP, register the fixed action and obtain its RP signing key. Keep `WORLD_SIGNING_KEY`, `AGENT_PRIVATE_KEY`, database and cookie secrets server-only. No `NEXT_PUBLIC` secrets. Use the World App for real proofs; simulator proofs are rejected in real mode.
2. Select a supported chain and verify the official ERC-8004 registry address and bytecode on that chain. Register the agent and confirm its current owner/wallet. Set `CHECKPOINT_REGISTRY` and the matching RPC/chain. No Day 03 server is needed.
3. Provision Supabase PostgreSQL using a direct, session-pooler or transaction-pooler connection; prepared statements are disabled for transaction-pooler compatibility. Use the server DB role over TLS, private credentials and backups. The server creates `dapptober_checkpoint` automatically and enables row-level security without public policies; use its private table-owner server connection. This build stores one serialized checkpoint JSON row; it is bounded to 10,000 enrollments, 10,000 active sessions and the last 100 human messages. Scale the storage model and retention policy before a larger public launch. Do not expose the table through a public client or service key.
4. Generate a 32+ character random `CHECKPOINT_SESSION_SECRET` and a separate operator bearer token. Configure HTTPS `PUBLIC_ORIGIN`; its hostname becomes the passkey RP ID. Changing domains invalidates existing passkey RP authentication.
5. Deploy `HumanCheckpointRewards(owner, USDC, verifier, campaign, rewardMicroUSDC)`. `campaign` must equal `keccak256(UTF8(WORLD_RP_ID + ':' + WORLD_ACTION))`. The backend checks this immutable binding, the token and verifier before issuing vouchers. For a 1 USDC reward use `1000000`. Use a six-decimal non-fee/non-rebasing token.

```sh
# From the repository root; constructor values come from your private environment/keystore.
node scripts/contracts.mjs create src/HumanCheckpointRewards.sol:HumanCheckpointRewards --rpc-url "$RPC_URL" --account dapptober-deployer --broadcast --constructor-args "$OWNER_ADDRESS" "$USDC_ADDRESS" "$VERIFIER_ADDRESS" "$CAMPAIGN_BYTES32" 1000000
```

6. Set `CHECKPOINT_REWARDS`, fund a small USDC budget, and fund visitor wallets with network gas. Supply real Jev/AI credentials. Run `pnpm readiness 10 --online`; it reports configuration/bytecode gaps without revealing secret values, and does not certify live providers.
7. Build on a Node 22.12+ host or independent Vercel project rooted at this app; allow 60 seconds for routed AI operations. Vercel uses the supplied config. Docker: `docker build --build-arg APP=day-10-human-checkpoint -t checkpoint .` and run with private environment injection. The shared Docker recipe includes this app's public graphic.
8. Verify a real private proof, hardware/browser passkey enrollment and return, second-session duplicate rejection, registered agent signatures/transfer rejection, private chat exclusion, Jev/LLM decisions and one funded public-chain payout. Save provider/chain evidence privately. Obtain an independent contract/security review and set ingress limits, key rotation, privacy retention, backups and monitoring before public release.

The operator can pause application admissions/actions using `/api/agent` action `checkpoint.pause` with `{paused:true}` and its bearer token. Visitors can always leave the lane. Contract payout pause is a separate owner-signed `setPaused(bool)` transaction: application pause does not invalidate vouchers already issued. Use both during a reward incident. There is no admin UI that reveals secrets or silently signs owner transactions.

## API

All identity workflows use `POST /api/agent` JSON `{action,input}`. `GET /api/agent` returns only the current cookie's sanitized identity/receipts and, for a verified human, the human chat. Agent/guest projections contain no human message text or private enrollment/key maps.

Actions: `human.begin`, `human.verify`, `passkey.begin`, `passkey.register`, `passkey.login.begin`, `passkey.login`, `agent.begin`, `agent.verify`, `human.chat`, `human.reward`, `chain.receipt`, `checkpoint.leave`, `receipt.verify`, `checkpoint.pause`.

After `agent.begin`/`agent.verify`, external clients preserve the returned signed cookie and call `POST /api/agents` with `{input:{message:'Explain this public protocol'}}`. That endpoint forces `agent.query`; body-supplied actions/lanes cannot change it. Agent responses always include `badge:'agent'` and the verified agent ID. Human-only access remains forbidden.

[Research](../../../docs/DAY-10-RESEARCH.md), [audit](../../../docs/DAY-10-AUDIT.md) and [living tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md) distinguish tested simulation, real local transactions and unperformed production acceptance.

## Base networks and Supabase

Testing uses Base Sepolia (`CHAIN_ID=84532`); production uses Base (`CHAIN_ID=8453`). Copy that network's deployed contract addresses and RPC into this app's private environment. For USDC workflows, use Circle's token on the same network; do not retain the testnet USDC address when switching to Base. Local Anvil (`31337`) remains a separate integration-test environment.

Use the **Supabase database URI** in `SUPABASE_DATABASE_URL`, not a Supabase project URL or anon/service-role API key. The server supports direct, session-pooler and transaction-pooler connections with prepared statements disabled and remote TLS required. Use a private table-owner connection: app tables enable RLS without public visitor policies. Keep testing and production in separate Supabase projects; verify persistence/restore against the actual account before release. See the [alignment audit](../../../docs/BASE-SUPABASE-ALIGNMENT-AUDIT.md) and [production tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md).
