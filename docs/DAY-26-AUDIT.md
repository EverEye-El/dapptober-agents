# Day 26 — implementation and acceptance audit

Canonical source: full `prompts/dapp-prompts.ts` Day 26; master specification read. Live challenge matches the brief. Source graphic inspected and preserved. Research and protocol adaptations are recorded in `DAY-26-RESEARCH.md`.

| Prompt requirement | Implementation | Acceptance evidence |
| --- | --- | --- |
| AI generation + embedded Content Credentials | OpenAI Images API adapter; actual C2PA native ES256 Builder; explicit procedural practice mode | Signed PNG read-back, metadata and file hash tests; real paid API remains a release step |
| Mint provenance onchain | Dedicated free ERC-721 credential drop, exact EIP-712 permit, owner wallet submission, thirdweb ownership read | Seven Foundry cases including 256-run file-binding fuzz; funded generated-wallet Anvil mint, duplicate rejection and exact receipt |
| Public drag/drop file verification | Public `/verify` and bounded raw-byte API; independently evaluated file binding, signer trust and Jev result; exact chain hash lookup | Unsigned/unsupported/body-limit/origin tests; browser signed edit upload; source files are not retained |
| Edit history timeline | B&W/copper/crop pixel transformations create new C2PA parent ingredients and timeline entries | Native SDK chain retains original + edit; browser grade/reel/timeline acceptance |
| LLM/Jev split and mint gate | Separate image provider and typed Jev confidence >=90%; hard C2PA integrity/trust checks cannot be overridden by Jev | Denial, uncertain response, outage, daily budget, pause tests; simulated gate labeled; actual provider calibration remains open |
| Distinct copper film-backlot design | Clapperboard hero, playback monitor, director slate, filmstrip reel and screening room | Desktop browser inspection; 390px mobile width matches document width, no horizontal overflow |
| Independence and alibis | Own app config/build, shared studio capabilities, Supabase private project boundary, hash-linked receipts | Frozen install, lint/typecheck/application suite, standalone production HTTP workflow; hosted CI status recorded separately |

Local evidence is not production evidence. Anvil test uses actual funded random wallets, contract deployment/permit/signature/mint, C2PA signing and configured local-root trust, and unified thirdweb ownership reads. OpenAI/Jev/Pinata are provider doubles; Supabase is not used by that direct capability test. Local C2PA trust is deliberately enrolled only for the test; it does not imply public trust-list status.

Security boundaries: one private operator/creator workspace; public verification cannot create a project or mint. No owner private key or funded server wallet. Mint verifier signs exact 15-minute permits. No mint fee/USDC treasury. Duplicate file and cross-recipient mutation rejected onchain. Source raw prompt stays private; only hash in credentials. Public IPFS may retain files indefinitely. Verifier disables remote manifest/OCSP fetches from uploads; revocation policy must be operated separately. Signature provenance does not prove image truth, copyright, or a human's identity.

Remaining acceptance: actual Supabase backup/restore, paid image and Jev allow/deny calibration, issued production certificate/anchor/timestamp/revocation policy, public Pinata retrieval, Base Sepolia deployment/wallet mint and independent reader, external contract/security/content review, target-platform container/HTTPS/ingress acceptance, separate Base mainnet release. No untested item is marked complete in the living tracker.

## Verified local checks

- Frozen pnpm 10.2.0 install succeeds, including native runtime initialization.
- Lint/typecheck pass; ordinary suite: **263 passed, 23 opt-in skipped**. Day 26 adds nine ordinary cases; the additional local-chain case runs through its explicit script.
- Foundry: **177 contract tests passed**, including seven Day 26 cases and 256-run file-binding fuzz.
- Actual funded Anvil Day 26 acceptance passes, including independent IPFS read-back doubles and replay/receipt checks. No real provider account is certified.
- Day 26 desktop browser generation, signed B&W edit, two-take reel/history, explicit simulated mint and public signed-file upload pass. Verifier reports real binding integrity and correctly refuses public trust for the practice root. At 390px, document width equals viewport width (no page overflow). Preview: `day-26-preview.jpg`.
- Production dependency audit after using patched Sharp **0.35.5**: inherited **6 high / 1 low**, no added Sharp advisory. TOML/Zod/elliptic upstream findings remain release blockers. Do not interpret tests as a security audit.
- All **26 independent production builds and all 26 production HTTP/workflow/receipt audits pass**. A copied **99 MB macOS standalone runtime outside the repository** also passes the complete HTTP workflow, including native C2PA/Sharp and public assets. Local Docker is unavailable on this host; target-OS container results must come from actual CI. Hosted results are recorded separately.

Published as [PR #23](https://github.com/EverEye-El/dapptober-agents/pull/23), stacked on open PR #22. Hosted final implementation evidence appears below; no merge or public deployment was performed.

Current Pinata documentation exposes raw-file `bafk…` CIDv1 values. Day 26 and earlier Day 12/17/25 adapters now accept that prefix alongside `bafy…`; fixture upload/retrieval/mint coverage verifies the compatibility change. Earlier chain/application behavior is unchanged; real Pinata acceptance remains a release check.

Baseline implementation `24c281d` passed the actual Day 26 Linux standalone container/workflow and GitGuardian checks in GitHub. CI caught missing install-helper copies in the pre-existing GPU/TEE Dockerfiles; both are corrected in the follow-up. The final follow-up implementation is verified below; baseline container success alone did not certify later changes. Cost attempts are now committed before media work, with a regression test proving a later database rollback cannot restore the budget.

## Hosted final implementation evidence

Implementation **`4794acb0e353bbb4cef73964fc83f13d27d7ac59`** passed [all 29 jobs](https://github.com/EverEye-El/dapptober-agents/actions/runs/40549290711): all 26 actual standalone Linux containers and their independent HTTP workflows, the corrected TEE/GPU images, and shared application/Foundry/funded Anvil checks. GitGuardian also passes. This documentation-only follow-up records that exact source evidence and changes no implementation. Provider doubles and local chains remain distinct from production provider/public-chain evidence.
