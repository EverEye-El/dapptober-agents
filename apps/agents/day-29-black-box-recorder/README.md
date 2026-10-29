# MAYDAY — Day 29 / The Black Box Recorder

A signed flight recorder for prompts, tool calls and transaction claims. Timeline replay and a Merkle integrity lab accompany private saved flights; live anchors use the official EAS deployment on Base Sepolia, then Base. Original graphic: `2026SocialPosts/41-day-29.png`.

## Run

From repository root: `pnpm install --frozen-lockfile`, then `pnpm dev 29`. Copy this app’s `.env.example` to `.env.local` on a fresh checkout, preserving any existing private configuration. Local operator/cookie values have been generated in this checkout. Use two different random 32+ character values on a fresh machine. Open `http://localhost:3029`.

Load the practice flight, replay its steps, inspect the rejected transfer, review flagged steps, seal a practice batch and verify its inclusion proof. Capture your own bounded steps. Export the flight; edit an entry in the exported entries array and paste it into the integrity lab to verify tamper detection. Practice policy/anchors are simulated, while hashes and EOA signatures are real cryptography. No fake transaction hashes or EAS UIDs are generated.

## Architecture / tools

`@dapptober/recorder` exposes append, verify, Merkle proof and batch anchoring capabilities. `@dapptober/experience` supplies independent signed-cookie visitor workspaces, authenticated shared operator spaces, persisted wallet instructions and exact receipt confirmation; `@dapptober/persistence` supplies atomic single-process local files or Supabase transactional row locking. No other daily app server is called.

Entries include sequence index, timestamp, kind, agent/tool, redacted payload, previous hash, random salt, trace ID and policy result. Canonical content is keccak256-hashed, then signed with a workspace/chain-bound message. Sorted-pair Merkle trees duplicate odd leaves; batch commitments bind root/range/head/signer. Anchored verification reads the EAS attestation back and compares workspace, schema, attester, revocation state and commitment fields. Local unanchored ranges cannot prove that an unseen prefix/suffix was never omitted; use an independently known anchor for completeness.

Agent producers can POST **JSON OTLP** resourceSpans/scopeSpans/spans to `/api/otlp/v1/traces`, with `Authorization: Bearer <OPERATOR_TOKEN>`. This writes to the shared operator flight, not a visitor space. Supply 32-hex traceId, 16-hex spanId, name, startTimeUnixNano, optional endTimeUnixNano and up to 12 bounded string/int/bool attributes. Limit: 10 spans, 32KB. Partial rejection follows OTLP’s partialSuccess response shape. Binary protobuf is not accepted. The OpenTelemetry API instruments intake; host SDK/exporter setup is required for exporting its internal spans to an external collector. The JSON intake works with external OTLP/HTTP producers independently of that setup.

## Host a saved demo

1. Configure **Supabase → Connect → Session pooler → private PostgreSQL URI** as `SUPABASE_DATABASE_URL`; choose `EXPERIENCE_STORAGE=supabase`, `AGENT_MODE=demo`, stable unique `OPERATOR_TOKEN`, `EXPERIENCE_SESSION_SECRET`, workspace ID and exact origin. No paid provider, owner wallet, signing key or EAS setup is needed for demo.
2. Verify a real database write/read, RLS/public-role denial, visitor isolation, shared operator access and backup/restore. The app creates the RLS-enabled shared workspace table. The private DB role needs appropriate server-side privileges/policies.
3. Deploy the independent Vercel app directory or Docker `APP=day-29-black-box-recorder`; build with `pnpm build 29`. Set final HTTPS `PUBLIC_ORIGIN` and verify capture/seal/export/reload/redeploy on that host. A single server may instead use explicit local storage with a mounted persistent `.data` volume. The file mutex does not coordinate multiple app processes.

## Enable actual anchors

1. Keep testing on **Base Sepolia 84532**, production **Base 8453**. Configure owner wallet address and chain-matched RPC. Its private key stays in the wallet. Fund a narrow gas budget only; EAS attestations do not require USDC.
2. Configure a stable private **RECORDER_SIGNING_PRIVATE_KEY**, a server EOA needing no funds. Back it up; pin/trust its public address externally. Rotate between sealed batches, not halfway through an unbatched range.
3. Verify official EAS `0x4200000000000000000000000000000000000021` and pin its runtime keccak256 in `RECORDER_EAS_CODE_HASH`. Register a **nonrevocable**, zero-resolver schema on that chain’s SchemaRegistry: `bytes32 workspace,bytes32 root,uint256 first,uint256 last,bytes32 head,address signer`. Save its UID as `RECORDER_SCHEMA`; verify schema bytes/resolver/revocability independently.
4. Review provider data sharing and explicitly set **RECORDER_JEV_METADATA_CONSENT=true** before enabling billed **TypeSafe Jev JEV_API_KEY**. This authorizes redacted step fields and batch integrity/flag-count summaries to `https://api.typesafe.ai/v1/systemone`; false sends no log metadata and marks steps for human review. Never submit secrets/personal data; no OpenAI or thirdweb key is used by Day 29. Set real mode only after Supabase/auth setup. Logging marks off-policy/uncertain steps for review; it does not execute or approve the described tool. Local crypto checks take precedence over model judgments. Intake has a 100-paid-assessment/day workspace quota, 1000-entry flight cap and 100-entry anchor batches.
5. Run `pnpm readiness 29`, capture bounded test steps, review flagged entries and sign the exact EAS instruction. Verify its hash after two additional blocks. A matching reverted receipt clears the instruction and records failure. Never discard a submitted transaction as “not submitted.”
6. Verify public-chain attestation readback, altered/missing/reordered records, wrong schema/owner/chain/signer and producer token revocation. Obtain independent review, deploy separate Base configuration/keys/database and repeat genuine hosted acceptance before release.

A server signature proves who signed the stored assertion—not whether an arbitrary producer told the truth, a model was honest, or a tool ran. A stolen signing key can sign a new history; a previously published trusted anchor exposes rewriting. Roots/salts reduce disclosure but do not make commitments to low-entropy data private. Redaction is deliberately limited: do not submit secrets/personal data. Retain the log data and signer evidence offchain; an anchor alone cannot recover them. Operate ingress limits, producer authentication, retention/deletion policy, monitoring and backups.

## Verification

`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:recorder-chain`, `pnpm build 29`, and `node scripts/smoke.mjs 29` against a running demo. The separate local-chain test deploys genuine EAS/SchemaRegistry 1.9.0 bytecode and verifies anchor/readback; Jev is an explicit provider double. It is not funded public-chain or paid-model evidence. See [audit](../../../../docs/DAY-29-AUDIT.md) and [tracker](../../../../docs/PROJECT-COMPLETION-TRACKER.md).
