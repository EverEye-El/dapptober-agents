# Day 25 — Vesper / The Memory Cathedral

A baroque copper library for user-owned portable agent memory. Complete canonical Day 25 requirements: encrypted preferences/notes/session summaries, decentralized ciphertext storage, owner-controlled onchain pointers, per-agent grants/revocation, import/export, visual search, Jev confidence gates and a risk check on every MCP memory tool invocation. Inspired by preserved `2026SocialPosts/37-day-25.png`.

## Independent run and deployment

Use pnpm 10.2.0 from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm readiness 25 --init
pnpm dev 25
pnpm build 25
pnpm start 25
pnpm exec vitest run tests/day-25.test.ts tests/day-25-api.test.ts
pnpm test:contracts
pnpm test:memory-chain
```

Open http://localhost:3025. Own `.env.local`, package, API and deployment boundary; no earlier daily server is needed. Vercel builds Day 25 through its per-app configuration. Root Dockerfile: `APP=day-25-memory-cathedral`. Root environment file remains a pointer.

## Architecture and cryptography

`packages/memory` exports browser-compatible cryptography/portable schema, pinned registry adapters, Pinata/IPFS storage, typed Jev access policy and an actual MCP SDK server/harness. Existing Supabase authorization/state and hash-linked receipts are reused.

- Browser creates a **3072-bit RSA-OAEP/SHA-256 owner key**. Private key stays in this tab unless the user explicitly downloads a backup. There is no server key, password reset or key escrow.
- Every memory gets a fresh **AES-256-GCM key and 96-bit random IV**. Title, type, tags and text are encrypted together. Authenticated additional data binds format, random tome ID and version. Owner gets the data key RSA-wrapped to their public key. Ciphertext transport rejects unknown plaintext/private-key fields.
- Live mode uploads only the canonical encrypted envelope through **Pinata public IPFS v3**. Its keccak commitment and CID are written to **MemoryCathedral** by the owner wallet. The app verifies exact registry runtime and protocol version, RPC network and pointer digest. Public IPFS is content-addressed storage, not a confidentiality/access-control service.
- An agent supplies an EVM identity and its own RSA public key. Owner unwraps the memory key locally and rewraps it to that agent. The onchain grant commits hashes of that exact capsule and public key, memory version and expiry (up to 30 days). UI grants 24 hours. Server stores encrypted capsules, not raw keys.
- Every content-key rotation generates a new independent data key and advances the pointer version. Anchoring invalidates all old-version grants. Regrant independently if needed. Nontransferable pointers stay in the owner's address namespace; no global admin, spending tool or treasury exists.

**Revocation cannot erase previously delivered keys/plaintext/ciphertext.** It blocks future MCP deliveries. An agent that kept an old key can still decrypt old public IPFS content. Rotate before writing future contents. Archiving blocks delivery; restoring can reactivate still-valid same-version grants, so revoke first if that is unwanted. IPFS deletion/unpinning does not guarantee erasure. The visual lock clears this tab's key and decrypted view; downloads, browser/runtime remnants and recipients' copies remain.

## Key custody and portable memory

Create a key, back it up, then inscribe or populate practice specimens. **The downloaded private key backup is unencrypted private material**: store it in an encrypted/password-managed location, never Git/chat/IPFS or this app's environment. Imports parse it locally. A fresh key cannot decrypt old memories. No automatic localStorage/sessionStorage/private-key database is used. Page reload requires reimporting the matching backup.

Portable exports contain the format version and encrypted envelopes only, with the same canonical hashes. Compatible agents can import/decrypt with the matching owner or granted agent key; RSA key backups are separate. Import can restore an existing matching registry pointer after verification. To migrate a later-version tome to a fresh registry/owner namespace, decrypt locally and inscribe it as a new tome/version 1; imports do not bypass optimistic version checks. Importing a new version requires a higher number; pointer writes require exactly the chain's next version. Keep exports/backups before rotating the operator token because it namespaces server state.

Search/filter runs in browser memory across unlocked contents only. No vector/embedding service or server plaintext index exists. Summary memories are authored/imported summaries; no LLM automatically reads or summarizes private conversations.

## Tools, access and Jev

Private office `/api/agent` requires `OPERATOR_TOKEN` in real mode and same-origin writes. This is a single configured-owner private office, not a public multiuser login system. Individual agent access uses **per-call EIP-712 EOA signatures**, not the operator token. Smart-account/EIP-1271 agent authentication is not implemented.

`/api/mcp` is a stateless Streamable HTTP MCP SDK endpoint, exposing:

- `memory.request`: signed request for one tome, public RSA key and bounded purpose; Jev review then owner-visible request. It never grants access itself.
- `memory.read`: signed request, fresh Jev review, current onchain permission/version/capsule/public-key checks, IPFS digest verification and a second permission check after retrieval. Returns ciphertext plus agent-wrapped key for **client-local** decryption. It never returns plaintext.

The signature binds chain/registry/owner/tome/tool/purpose hash/public-key hash/unique nonce/deadline. Requests expire within two minutes; nonce reservation and the daily model budget persist even if execution fails. No nonce eviction permits replay; export/migrate the workspace before 1,000 accepted signed calls. At most 50 tomes and 100 pending requests; ingress/admission controls and a scalable indexer/workspace lifecycle are production requirements.

Jev receives operation/agent/tome ID/user-entered purpose, **not memory contents or private keys**. Do not put sensitive material in the purpose. Grants and MCP delivery need `allow` with >=90% confidence. Deny/low confidence requires human review and a new safe request, without automatic override. Owner always explicitly signs grants. Revoke attempts Jev assessment too, but explicit owner revocation remains possible on a deny/outage; models cannot veto removal of access. Direct contract actions remain the owner's authority, independent of this optional application gate.

Sixty requests/minute per durable workspace and 30 model assessments/day bound costs. Signed nonce/model reservations are durable before the model call. Owner grant/revoke reviews run outside the final database transaction. Upload, bounded chain sync and MCP ciphertext retrieval still hold workspace locks: measure concurrency, apply ingress limits and replace bounded scans with a reviewed indexer before scale. Valid strangers can spend the request admission/model budget: add production admission/rate controls without trusting wallet signatures as an anti-spam proof.

## Compatible local agent client

Node >=22.12 with explicit TypeScript stripping:

```sh
node --experimental-strip-types scripts/memory-agent.mjs keygen /secure/path/agent-key.json
node --env-file=/secure/path/client.env --experimental-strip-types scripts/memory-agent.mjs request /secure/path/agent-key.json
# Owner reviews and signs the grant in Vesper, then:
node --env-file=/secure/path/client.env --experimental-strip-types scripts/memory-agent.mjs read /secure/path/agent-key.json
```

The **separate local client** environment needs `CHAIN_ID`, `MEMORY_MCP_URL` (exact app `/api/mcp` URL), `MEMORY_OWNER`, `MEMORY_ID`, `MEMORY_REGISTRY`, `MEMORY_PURPOSE` and `MEMORY_AGENT_PRIVATE_KEY` (agent EOA signing key). Never put the client EOA/RSA private keys in the deployed app environment. The client signs request metadata only; no gas/funds are needed for reading. `keygen` refuses to overwrite a file and creates it with private permissions. `read` explicitly prints the decrypted memory locally; review downstream agent/model disclosure yourself. Requests/imports cannot auto-send private memory to an LLM.

## Live configuration / transactions

Read all comments in `.env.example`. Supply Supabase Session pooler `SUPABASE_DATABASE_URL`, private `OPERATOR_TOKEN`, owner EOA `OWNER_ADDRESS`, Base Sepolia RPC/chain, actual `MEMORY_REGISTRY` and `MEMORY_REGISTRY_CODE_HASH`, scoped `PINATA_JWT`, and `JEV_API_KEY`. **No OpenAI, Lit, thirdweb or server wallet private key is used.** Lit was a suggested stack choice; direct Web Crypto key custody implements the requirement without a network-held key release service.

Deploy `MemoryCathedral()` on Base Sepolia first, independently verify source/runtime hash, fund only owner gas and rehearse the lifecycle. USDC and agent gas funding are unnecessary. Base production requires a distinct registry/environment/database after security/privacy review. Live initialization verifies the pinned deployment; incomplete configuration stays blocked.

Live pointer/grant/revoke/archive actions simulate exact owner transactions and store one pending preview. Browser checks owner/network and signs exact calldata/value zero. Receipt reconciliation checks exact sender/recipient/calldata/value, newer block, three confirmations and duplicate hash; failed/reverted receipts are recorded distinctly. Preview age (120 seconds) is an application limit, not a contract transaction deadline. Never retry uncertain submissions; reconcile their hash. Manual discard requires an assertion nothing was sent and cannot cancel an existing wallet transaction.

## Tested scope / limitations

Practice uses **real cryptography and actual MCP SDK tools/call** with local ciphertext storage and explicitly simulated chain/auth/Jev. Funded Anvil tests use actual registry transactions and generated EIP-712 wallets through the real SDK, then decrypt with real agent RSA keys, reject replay/wrong signer, revoke during a Jev outage and rotate. Pinata/IPFS/Jev/Supabase in those tests are provider doubles, not public/paid service evidence.

Actual Pinata pin/gateway availability, hosted Supabase durability/restore, paid Jev calibration, hardware wallet behavior, Base Sepolia funded acceptance and all Base production acceptance remain open. Hosting supplies the encryption code: a compromised origin/browser/extension or leaked backup can steal keys despite server-side ciphertext. Independent crypto/contract/privacy review is required. Onchain wallet relationships, CID, timing, size and access patterns are public metadata. Supabase stores ciphertext, wrapped capsules, purposes and receipts. Set retention/backups/admission limits, monitor providers/pending receipts and document incident recovery; no autonomous key recovery or erasure guarantee is claimed.

[Final audit](../../../docs/DAY-25-AUDIT.md) and [completion tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md) record evidence and ordered remaining work.
