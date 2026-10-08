# Day 07 final audit — 2026-10-07

Built against the complete canonical **The Glass-Box Mind** prompt in `prompts/dapp-prompts.ts`, with the master build specification's shared-capability, independent deployment, testing and honesty requirements. Live challenge and official dstack, Intel DCAP/Phala and Ollama documentation were researched before implementation; see [research](DAY-07-RESEARCH.md).

| Prompt requirement | Implementation | Verification |
| --- | --- | --- |
| AI answer with TEE evidence binding model/input/output | Confidential CPU Ollama worker, TEE-derived receipt key, explicit ABI/EIP191 protocol and TDX REPORTDATA binding | Signed-field tampering tests; fresh request nonce/prompt/time checks; independently hashes manifest and every model blob; worker refuses absent configuration/simulator |
| Verification page | `/verify`, local browser signature verification, server Intel-root DCAP verification and reviewed model/workload policy | Real Intel-signed upstream quote verified at historical collateral validity; modified quote and current-time stale collateral rejected; all MRTD/RTMR/model/debug/TCB/payload checks tested |
| Onchain receipt posting | Owner-wallet transaction to tested immutable `InferenceAnchor`, public URI plus commitment to complete proof | Solidity records publisher/time/URI; empty/oversized input and replacement rejected; no claim that this anchor verifies DCAP |
| Tamper demonstration | Altered answer creates rejected verification receipt and red fractured glass; original remains intact | HTTP workflow and browser interaction pass; local browser tampering fails before relying on server |
| Shareable answer cards | Explicit publication, persistent public card retrieval and independently verifying `/share/[id]` | Private cards return 404; cross-session public reads and share page pass |
| Jev confidence appraisal | Shared Jev judge sees cryptographic verification facts, never private prompts/answers; cannot override failed proof | Demo decisions are explicitly simulated; failed crypto remains failed regardless of appraisal |
| Clinical cyan glass laboratory | Dedicated responsive Day 7 room, inspectable receipt/history, red failure state, cyan simulation state; green reserved for hardware verified | Desktop interaction and 390px mobile control room/public verifier inspected; 390px content width, no horizontal overflow |
| Independent app and reusable capability | Day 7 workspace on port 3007, standalone Next output, shared inference package and separate confidential worker recipe | Independent Day 7 build/test; all seven app builds and production HTTP workflows pass |

## Completed checks

- `npm run lint` and `npm run typecheck` pass.
- `npm test`: 35 tests across 11 files, including Days 01–06 regressions and Day 7 cryptography, hardware policy, worker and model integrity tests.
- Independent Day 7 workspace tests: eight tests across four files pass.
- `npm run test:contracts`: 20 tests pass; existing session fuzz test runs 256 cases.
- `npm run build`: all seven optimized independent production builds pass. Day 7 routes include operator API, public card API, public verification API, share page and verifier.
- `npm start` + `npm run smoke`: all seven pages, APIs, critical local workflows and receipt chains pass. Day 7 adds tamper rejection, private-card 404, public-card retrieval and verification.
- Browser: generated receipt, red tamper rejection, restoration, publication, public-page signature verification, JSON-edit status invalidation and client-side tamper rejection tested. Control room and public page inspected at desktop and 390px mobile size. [Preview](day-07-preview.png).
- Worker Node syntax and receipt protocol loading checked; startup refusal and simulated/replayed/mismatched worker response rejection tested. Actual model-file hashing tested with matching artifacts and same-size substituted weights.
- Production dependency audit: zero critical/high, 17 moderate inherited from the existing thirdweb dependency chain, two low in DCAP's elliptic verification dependency. `npm audit` suggests downgrading DCAP to 0.2.0 for the latter; that would discard current attestation security fixes, so no unsafe downgrade was applied. DCAP uses public-key verification; worker receipt signing uses viem. Lockfile retains the patched DCAP 0.6.5 release.

## External validation still required

No Intel TDX CVM, deployment credentials, Jev key, private PostgreSQL service or funded wallet were supplied. Real confidential inference, current provider collateral retrieval for our own deployment, live Jev appraisal and a funded onchain publication were **not exercised**. Historical upstream quotes prove the verifier test path, not execution of this worker. Local answers are deterministic simulations with a public signing key and never display hardware verification.

Docker is unavailable in this environment; Dockerfiles and CVM composition are provided, but container image build/push and hardware provisioning were not performed. Review/pin images, bootstrap and independently approve the exact model artifact, protect the CVM storage, enroll reviewed measurements, inject secrets, and run one fresh real inference before enabling public production use. The app receives prompts before forwarding them to the TEE; no end-to-end attested browser channel is claimed. Hardware attestation proves the measured workload ran, not that an answer is factually correct.

[App README](../apps/agents/day-07-glass-box-mind/README.md) and both `.env.example` files document those steps. Days 01–06 remain independently runnable; shared dispatch exposes Day 7 capabilities for future composition without calling this daily app's server.
