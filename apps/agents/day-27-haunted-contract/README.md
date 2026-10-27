# Day 27 — DEADLOCK / The Haunted Contract

A haunted mansion you can actually play. Three original ghost agents guard three keys; talk through riddles, trick Lord Null with arithmetic, or pay Morrow's exact crypt toll. All keys open the treasure chest. The canonical Day 27 prompt is in `prompts/dapp-prompts.ts`.

## Run and test

From the repository root, use Node 22.12+ and pnpm **10.2.0**:

```sh
pnpm install --frozen-lockfile
pnpm run dev 27
pnpm exec vitest run tests/day-27.test.ts tests/day-27-api.test.ts
pnpm run test:contracts
pnpm run test:haunted-chain
pnpm run test:haunted-demo
pnpm run build 27
pnpm --filter @dapptober/day-27 run start
```

`http://localhost:3027` is independent of every other daily server. The local `.env.local` is private and ignored. `test:haunted-demo` needs that local operator token and a running local server; it adds/removes a synthetic custom room and verifies saved visitor snapshots. It never uses paid APIs or public funds.

## Supported launch target: a hosted, editable demo

**AGENT_MODE=demo** is a valid hosted launch mode. Default dialogue, Jev results, keys, ten starting credits and five-credit prize are explicitly simulated. No transaction hashes or payments are fabricated. Bribing costs one practice credit only once; duplicate keys and repeat chest claims do not pay again. All three riddles can also be solved without bribing.

1. Create a Supabase project and copy its **Connect → Session pooler** PostgreSQL URI to private `SUPABASE_DATABASE_URL`. This is not the Supabase anon key. Keep separate test and production projects.
2. Set `HAUNTED_STORAGE=supabase`, `AGENT_MODE=demo`, `HAUNTED_DIALOGUE=simulated`, a stable `HAUNTED_WORKSPACE_ID` and two different random secrets (at least 32 characters) in `OPERATOR_TOKEN` and `HAUNTED_SESSION_SECRET`.
3. Deploy this directory with the supplied Vercel configuration, or use the root Dockerfile with `APP=day-27-haunted-contract`. Set `PUBLIC_ORIGIN` to the exact final HTTPS origin. No wallet/RPC/thirdweb/paid-provider credentials or contract deployment are needed for the hosted demo.
4. On the hosted app, open **Keeper's desk**, enter the operator token, add a unique room, then start a fresh visit. Verify another browser sees the room on its own new visit. Existing visits retain their original room snapshots so edited catalogs cannot invalidate progress. Remove custom rooms through the same desk; original three rooms are permanent. The pause control blocks new moves, not existing claims.
5. Verify saved content and progress after restart/redeploy, visitor-cookie isolation, private keeper access, backup/restore, origin rejection and platform ingress limits. Keep the cookie secret and workspace ID stable across deployments.

Supabase stores the catalog and visitor runs in `dapptober_haunted`, with row locking and RLS enabled before access. Use a private SQL role with the necessary migration privileges; do not add public access policies. Each browser has a random, HMAC-authenticated HttpOnly SameSite cookie. This is a browser visit, not a portable account: deleting cookies loses access to that run. Export the visitor ledger before clearing it. Chat and custom-room text are stored in plaintext; do not enter secrets.

A single Docker/server deployment can instead use `HAUNTED_STORAGE=local` with a **mounted persistent `.data` disk**. Never choose it on ephemeral/serverless storage. Production fails visibly if no database is supplied and local disk was not explicitly chosen. Filesystem mode serializes within one process; use Supabase for multiple instances.

## Ghosts, tools and boundaries

Reusable game behavior lives in `packages/haunted`. Tools: `haunt.move`, `haunt.claim`, `haunt.restart`, `haunt.wallet`, `haunt.refresh`, `haunt.commit`, `haunt.reveal`, `haunt.approve`, `haunt.receipt`, `haunt.discard`, `haunt.abandon`, `receipt.verify`; privileged `keeper.save`, `keeper.remove`, `keeper.pause`.

Every player chooses a typed **talk / trick / bribe** move. The move gate runs before ghost dialogue. The deterministic rule engine independently checks the answer, trick answer or exact toll; model text cannot award keys. Moves and errors produce linked shared receipts. Chat is capped at 120 messages, catalogs at eight rooms, text at 600 characters, request bodies at 6 KB, moves at 20/minute and 60/day per visit. A shared 100/day live-review reservation commits before paid calls, including failures. Use platform admission/rate controls before public hosting; fresh cookies can bypass per-visit limits.

Audio uses **Howler.js**, an included original synthesized organ/drone loop, explicit opt-in, pause when the page hides and cleanup on exit. Ghosts float; copper scanlines and grain echo the supplied Day 27 artwork. Reduced-motion preferences disable floating. No camera/microphone access or external audio service is used. Both original user graphics remain untouched.

## Optional genuine dialogue

Set `HAUNTED_DIALOGUE=live`, actual `JEV_API_KEY`, `JEV_MODEL`, `OPENAI_API_KEY`, `OPENAI_BASE_URL` and model IDs. Jev must return the declared allowed move with confidence >=90% before the existing Vercel AI SDK reasoner speaks. Wrong types, uncertainty, unavailable providers and malformed replies fail closed. The LLM receives bounded room/persona/turn text, no tools or wallet keys. You may keep simulated prizes while enabling real dialogue. No paid provider calls have been made in this build.

## Optional onchain treasure

Use **Base Sepolia 84532** for test acceptance; only then create an independent **Base 8453** season. Set `AGENT_MODE=real`, canonical Circle `USDC_ADDRESS`, actual `RPC_URL`, `HAUNTED_CONTRACT`, exact runtime `HAUNTED_CODE_HASH` and public domain-restricted `THIRDWEB_CLIENT_ID`. Browser wallets use the unified thirdweb SDK. There is no server player/deployer private key and no autonomous spending signer.

Deploy `contracts/src/HauntedContract.sol` with:

- `admin`: intentionally chosen owner, preferably reviewed multisig custody.
- `asset`: independently verified Circle USDC on the chosen chain.
- `solutions`: `keccak256(UTF8("echo"))`, `keccak256(UTF8("shadow"))`, `keccak256(UTF8("map"))`, in that order.
- `prize=5000000`, `toll=1000000` (six-decimal USDC), and an approved future Unix `deadline`.

Verify source, constructor, runtime, token/prize/toll/solution readback, owner and end time. Approve a small budget, call `fund(amount)` and verify the actual balance. Do not transfer unsupported fee-on-transfer tokens. Each wallet pays its own gas. Use a separately configured database/workspace/environment for each season/chain.

The contract binds commitments to chain, deployment, player, room, move, proof and salt. Reveal only after one block and within 80 blocks. Talk checks the fixed answer hash; trick works only in room 1 with integer 13; bribe works only in room 2 and transfers exactly one USDC. Keys cannot be transferred. Earning key 3 reserves exactly five USDC, or the whole reveal reverts if the chest is depleted. Claim pays the player once, even while paused or after the season ends. Owner may withdraw bribes and recover only **unreserved** prize funds after expiry. Reserved winnings cannot be swept by the owner. No ghost or LLM signs reward permits.

These are **public puzzles**, not secret commitments to high-entropy answers, proof of personhood or Sybil-resistant prize allocation. Anyone can inspect the answers/rules or solve with multiple wallets. Commit/reveal prevents copying another player's reveal to front-run that player; it does not hide public riddle solutions or guarantee profit. Keep any funded campaign deliberately bounded.

The UI saves the exact pending instruction and locks submission before opening the wallet. Preserve the browser's returned hash; recovery accepts only exact sender/target/calldata/zero-value receipts after two blocks. Do not discard an uncertain submission until wallet activity has been inspected. Discard does not cancel a transaction. A failed reveal keeps the salt for retry; expired seals can be explicitly abandoned after 80 blocks. Pausing the web house is separate from owner `setPaused` on the contract. Live rules never use custom demo rooms.

## Remaining work

See `docs/PROJECT-COMPLETION-TRACKER.md` for separate **hosted-demo** and **live-contract** release checklists, and `docs/DAY-27-AUDIT.md` for verified evidence. Genuine Supabase service acceptance, hosted deployment, mobile wallets, paid dialogue and public-chain transactions remain unverified. Contracts require independent review before meaningful funds. Existing inherited dependency advisories remain unresolved.
