# Day 25 audit — Vesper / The Memory Cathedral

October 25, 2026. Complete canonical Day 25 prompt → requirements → implementation → tests → independent production build. [Research](DAY-25-RESEARCH.md) records live challenge/official documentation decisions. This is engineering evidence, not production/privacy clearance.

| Canonical requirement | Implementation | Evidence / remaining boundary |
| --- | --- | --- |
| Encrypted user-held memory | Browser AES-256-GCM, fresh version keys/IVs, owner RSA-OAEP wraps; encrypted titles/tags/body | Real roundtrip, wrong key/tamper/context and rotation tests. Keys/backups remain user's responsibility; no server escrow |
| Decentralized storage + controlled pointer | Pinata public IPFS v3 adapter, fixed-gateway bounded retrieval/commitment verification, Base MemoryCathedral | Actual deployed Anvil pointers/version changes; Pinata/IPFS fixture doubles. Genuine public storage and Base acceptance pending |
| Per-agent request/grant/revoke | EOA-signed MCP metadata, owner-specific RSA capsules, contract-bound key hashes/version/expiry and archive gate | Actual generated-wallet signed requests, owner grants/revokes/rotation, wrong signer/replay rejection. Already delivered copies cannot be erased |
| Import/export between agents | Versioned portable encrypted envelope schema, owner/agent local decryption, runnable compatible CLI | Export/import hash preservation and actual MCP agent-local decrypt. New registry migration of later versions requires local decrypt/reinscribe |
| Visual library/search | Cathedral arch, glowing tomes/shelf, reading desk, encrypted/sealed filters and local unlocked search | Browser workflow and production HTTP checks; no plaintext server index |
| Jev grant/revoke confidence | Typed metadata-only allow/deny >=90%; explicit owner signature | Calibrated-low-confidence/provider failure tests. Owner revoke remains available through outage; paid calibration pending |
| Risk check every MCP memory call | Actual SDK tools/call, durable nonce/model reservation before execution; onchain recheck after IPFS fetch | Protocol harness and signed Anvil read/request; replay, injected-purpose and revoked/rotated access reject |

## Verification

- pnpm 10.2.0 frozen offline installation passes using the existing store. Sole lockfile retained.
- Lint/TypeScript pass. Ordinary workspace tests: **254 passed, 22 opt-in skipped**; **170 contract tests passed**. Day 25 adds **12 ordinary application tests**, one separately executed funded Anvil case and **eight Solidity tests**, including 256-run version/ownership fuzzing. Canonical nonce normalization rejects alternate hex casing of a replayed signature; denied grant attempts consume durable model budget.
- Actual funded local Anvil lifecycle passes: deploy/pin registry; owner pointer write; generated EIP-712 agent request; owner grant committing capsule/key hash; actual MCP SDK ciphertext delivery; local agent decrypt; wrong signer/replay rejection; owner revoke during Jev outage; rejected subsequent read; regrant; fresh-key pointer rotation invalidating old grant/key; exact receipt/duplicate reconciliation and no plaintext/private key in stored application state.
- Browser verification passes key generation, real encryption of three specimens, local search, pointer anchoring, request/grant, actual MCP decrypt, revoked-read rejection and fresh-key/version rotation. At 390px viewport/document width remains 390px; no horizontal page overflow. Desktop hero/library previews are saved separately.
- Day 25 production build passes; all **25** independently running production page/API/workflow/receipt checks pass.
- October 25 production dependency audit retains **six high and one low** inherited TOML 4/transitive Zod 3/elliptic findings, zero critical/moderate. No new external dependency was added; pnpm also consolidated existing compatible qs/eventemitter3 resolutions onto already-locked patch versions.
- Practice HTTP workflow passes page/API, real encryption, actual SDK tools/call, agent-local decryption, revoke and valid receipt chain. Public CID, payment, signature or model success is never fabricated in practice mode.
- No paid Jev, real Supabase, Pinata pin/gateway or public chain acceptance is established by fixtures. The local incident-free memory app moves no USDC; owner transactions need gas only.

## Audit boundaries

User-held private backups are unencrypted sensitive files requiring encrypted private storage. Lost keys are unrecoverable; compromised origin/browser/extensions can steal keys or decrypted contents. Server cannot prove content quality, loss of copies or deletion. Public onchain metadata exposes IDs/CIDs/relationships/timing; public IPFS may retain old ciphertext indefinitely. Archive restore can reactivate valid grants; rotation then anchor is needed for new-version isolation.

MCP agent authentication supports EOAs, not EIP-1271. The office is single configured-owner, operator-authenticated administration. Valid stranger requests can consume admission/model budget; ingress and admission review are required. Bounded limits: 50 tomes, 100 requests, 1,000 signed nonces without eviction, 60 requests/minute and 30 model calls/day. Export/migrate before capacity; no production indexer or unattended retention service exists. Bounded upload/RPC/retrieval can hold a database lock. Failed pin batches can leave orphaned encrypted public files. Exact receipt checks and no-auto-retry prevent silent duplicate submission; manual discard is an operator assertion, not wallet cancellation. Application preview expiry cannot make signed calldata expire onchain.

Independent crypto/contract/privacy review, provider availability/retention, backup restore, hardware wallet recovery, funded Base Sepolia rehearsal and separate Base production remain in the [completion tracker](PROJECT-COMPLETION-TRACKER.md). Existing dependency advisories remain release blockers, not ignored tests.
