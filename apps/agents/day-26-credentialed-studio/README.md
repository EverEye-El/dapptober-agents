# Day 26 — TAKE ONE / The Credentialed Studio

A copper-lit film backlot for accountable AI images: render, sign, grade, inspect, publish and mint. Images are the implemented medium; clip generation is not required by the prompt's “images or clips” option. The public verifier also accepts supported JPEG, WebP and MP4 files.

Canonical prompt: `prompts/dapp-prompts.ts`, Day 26. Live context: [Dapptober Day 26](https://www.dapptober.xyz/dapp/26). Requirements: embedded creator/model/edit Content Credentials; onchain provenance; public drag/drop verification; per-asset edit timeline; independent image-model and Jev provenance gates. The supplied `38-day-26.png` inspires the clapperboard, spotlights, playback monitor and take reel. Source graphics are preserved.

## Run independently

From the repository root, with Node 22+ and pnpm **10.2.0**:

```sh
pnpm install --frozen-lockfile
pnpm readiness 26 --init
pnpm run dev 26
```

Open http://localhost:3026. `.env.local` is private; `.env.example` explains every provider key and deployment pin. Root environment remains a pointer. Practice uses OpenSSL to create ephemeral local C2PA credentials; install OpenSSL on the development machine. The container includes it. The root postinstall initializes the official pinned platform-specific C2PA native binary. Do not disable lifecycle scripts without separately provisioning that binary.

Practice pixels are **procedural**, not a paid model response. Embedded C2PA signatures and pixel transforms are genuine. Local practice certificates are **not trusted public identities**. Jev and mint/IPFS effects are explicitly simulated; no fake transaction hashes are returned. Practice state lives in this app's ignored `.data` directory.

## Workflow and architecture

- `packages/studio` supplies reusable image generation, C2PA stamping/inspection, image grades/crop, typed Jev gate, Pinata uploads, provenance mint permits and exact receipt reconciliation. It has no dependency on another daily app server.
- `studio.generate`: preflight Jev, one low-quality 1024px OpenAI image (preserve any upstream signed credentials as a component ingredient), C2PA ES256 signature, independent read-back validation. Creator is the configured owner EOA; model and prompt hash are embedded. Raw prompts remain private in the studio database, not the manifest.
- `studio.edit`: deterministic B&W grade, copper grade or center-square crop into a **new** signed PNG. The previous signed bytes are a `parentOf` C2PA ingredient. Earlier takes and manifests remain inspectable. These edits are pixel transforms, not model edits.
- `studio.mint`: explicit public-publication consent; independent file integrity and configured signer-trust checks; fresh Jev review; upload exact PNG and metadata to public IPFS, independently read back each byte-for-byte; issue a 15-minute EIP-712 permit. It binds recipient, file SHA-256, manifest-report SHA-256, model keccak256, parent SHA-256, URI, contract and chain.
- Creator reviews and signs the exact zero-value mint call in an injected EVM wallet. No server gas wallet, USDC treasury or automatic transaction executor exists. A mint is free except network gas.
- `studio.receipt`: successful exact sender/target/calldata/value transaction, two confirmation blocks and onchain URI/hash mapping. Pending mint survives reload; enter the submitted hash to reconcile. Only discard if no transaction was submitted; discarding does not revoke an outstanding permit before expiry.
- `/verify` and `POST /api/verify` are public. Drop a file or submit raw bytes with the MIME content type. SDK validates embedded credentials without fetching remote manifests. Report distinguishes content binding, signer trust, Jev gate and exact NFT file-hash evidence. Unsupported/uncredentialed files are not approved. The file is not retained. Jev receives bounded credential metadata only.
- A credential assertion can contain personal data. Metadata is untrusted input, never rendered as HTML. A signature is not proof of depicted truth, legal authorship or copyright ownership. Creator wallet is an operator assertion, not an independently attested CAWG identity.

## Onchain components

`contracts/src/CredentialedStudio.sol`: custom free ERC-721 **credential drop**, owner-controlled pause/verifier rotation, EIP-712 one-file-one-token gate, immutable token URI/provenance hashes. Replay and modified recipient/file/model/parent/metadata cannot reuse a permit. Chains: Base Sepolia **84532**, Base **8453**; local **31337** is testing only.

The suggested thirdweb NFT Drop is adapted to a dedicated credential-gated ERC-721, because an open generic claim would bypass the provenance gate. Unified thirdweb v5 performs NFT ownership reads on the pinned drop. No deprecated thirdweb application SDK is added. Foundry verifies the custom contract. This implementation does not claim to be a deployed thirdweb prebuilt NFT Drop.

Build contracts with `pnpm run test:contracts`. Deploy `CredentialedStudio(admin, verifierAddress)` on Base Sepolia using a separate reviewed deployer, then configure `STUDIO_DROP_ADDRESS` and keccak256 of its **deployed runtime** as `STUDIO_DROP_CODE_HASH`. The contract enforces the network before construction. Fund creator/deployer with test ETH only. Set `STUDIO_MINT_SIGNER_PRIVATE_KEY` to the dedicated verifier key; it needs no funds. Independently verify source, runtime, constructor admin and verifier. Rotate or pause using `configure(newVerifier, stop)` from the owner wallet.

## Production setup, in order

1. Configure test Supabase Session pooler URI, random operator token, creator EOA and Base Sepolia RPC. The common store namespaces this day and locks each project during changes; same Supabase project may serve other days, but use a separate project for Base production. Verify backup/restore. Raw prompts, signed files and production logs are private operator project data.
2. Enable OpenAI Images API billing/access; use the explicit `OPENAI_IMAGE_MODEL`. Configure TypeSafe Jev. Check allowed, denied, low-confidence and unavailable-provider responses with synthetic prompts. No silent fallback from real to practice.
3. Obtain a C2PA-compatible ES256 leaf+issuer certificate chain and its matching P-256 PKCS#8 PEM key. Base64 each PEM on one line. Enroll a reviewed trust-anchor bundle independently; do not trust uploaded roots. Configure optional reviewed HTTPS timestamp service according to certificate policy. Test expiry, revocation and long-term verification requirements; automatic OCSP and remote manifest fetching are disabled to prevent arbitrary upload-driven network access. Issuer revocation/anchor updates are an operator responsibility.
4. Configure Pinata public-file JWT and unified thirdweb private server secret. Deploy/pin the credential drop as above. Before real generation, check that the certificate profile can sign and is trusted under the deployed verifier policy. Keys remain server-only.
5. With synthetic images, run actual paid OpenAI → signed generation → grade → C2PA integrity+trust → Jev → explicit public IPFS publication → creator-signed testnet mint → exact receipt → independent public verifier round trip. Retrieve the signed image from IPFS and independently verify it using another C2PA reader.
6. Review custom contract, signer key custody/rotation, public content rights/retention, dependency advisories, ingress controls and billing. Limits: 12 takes / approximately 24 MB base64 per project; 8 MB per signed file/upload; 20 creation/edit/mint attempts per day; 100 durable public Jev reviews/day; 10 public verifies/minute per session and two per process. Cookies can be replaced, so add platform IP/admission/body/time limits before public exposure. Scale files to object storage/indexing before removing the project bound.
7. Build and host over HTTPS, exact `PUBLIC_ORIGIN`, private env, bounded ingress and enough Node memory/time for native C2PA and image calls (up to 240 seconds). `pnpm run build 26` then `pnpm run start 26`; Vercel config included, Docker `APP=day-26-credentialed-studio` preferred when platform-native dependencies/timeouts require control. Verify the platform's upload limit: Vercel ingress may be lower than the app's 8 MB cap. Production server must include the platform native C2PA binary and Sharp binaries. Test the standalone output/container on the target OS.
8. After test acceptance, deploy separate Base mainnet drop/database/certificate policy and repeat the full bounded live acceptance. Monitor permit/receipt backlog, provider cost, IPFS availability, certificate expiry/revocation, Jev review budget, database backups and admin pause. No public-chain/paid-provider evidence is implied by Anvil or fixtures.

## Tests and builds

```sh
pnpm exec vitest run tests/day-26-studio.test.ts
pnpm run test:contracts
pnpm run test:studio-chain
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run build 26
node scripts/smoke.mjs 26
```

`test:studio-chain` starts its own local Anvil, generates/funds random wallets, performs actual C2PA signing/trust, sends the mint and reconciles its exact receipt. OpenAI/Jev/Pinata are explicitly provider doubles. No funded fixed fixture keys are committed. The production smoke workflow runs this app independently. See `docs/DAY-26-AUDIT.md` and the living completion tracker for tested evidence and open work.
