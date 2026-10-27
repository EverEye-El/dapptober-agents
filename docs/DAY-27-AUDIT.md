# Day 27 final audit — DEADLOCK / The Haunted Contract

Audited October 27, 2026 against the complete canonical Day 27 prompt and master build requirements. User-approved first release target is a **hosted editable demo**; live providers and funded contracts are a separate optional path. Independent app: `apps/agents/day-27-haunted-contract`, shared capability: `packages/haunted`, port **3027**.

| Prompt requirement | Implementation | Verified evidence |
| --- | --- | --- |
| Distinct ghost personas/rules | Sister Static's echo riddle, Lord Null's shadow riddle/arithmetic trick, Morrow's map riddle/exact bribe; new custom demo ghosts via keeper | Ordinary/wrong/injection move tests; browser talk → trick → bribe; wrong-type/uncertain/outage gate tests |
| Chat with ghosts using talk/trick/bribe | Explicit typed move controls, Jev >=90% gate before optional Vercel AI SDK dialogue, deterministic default conversations | Five core app tests; four HTTP tests; genuine providers not called |
| Hard contract win conditions | Fixed answer hashes, mirror integer 13, crypt-only one-USDC bribe; no model/verifier permit can mint keys | Nine Solidity tests including 256-run salt binding fuzz; wrong answer/injection/duplicate/empty-chest cases |
| Onchain keys and treasure | Chain/deployment/player-bound commit/reveal, one-block delay/80-block window, nontransferable key bits, reserved prize and one-time claim | Generated-wallet Anvil deployment/funding; exact three keys, 1-USDC bribe and 5-USDC payout; exact matching receipts and duplicate rejection |
| Spooky audio/glitch visuals | Original local Howler drone, opt-in/pause/unload, floating wardens, spectral copper mansion, scanlines/grain, reduced motion | Desktop browser game and audio toggle; local audio/image HTTP assets verified |
| Independently runnable/deployable | Next standalone build, workspace capability, app-specific env/README/Vercel config, Docker CI matrix | Independent production build and full page/API/workflow/receipt smoke; 69MB copied standalone runtime outside repository passes complete HTTP workflow |
| Hosted demo can accept new content | Private keeper authentication, shared catalog add/remove, per-visitor snapshots; Supabase in demo mode, explicit durable-disk alternative | Actual local and production HTTP add/remove/save/reload tests; database adapter verifies TLS/RLS/row lock with a credential-free mocked Supabase URL |

## Verification and distinction of evidence

- **All 27 independent production builds and all 27 production HTTP/page/API/workflow/receipt checks pass** on the final local source. The standalone copy also passes independently outside the repository.
- Full ordinary application suite: **273 passed / 24 opt-in skipped**. The new funded Day 27 opt-in case was run separately and passed. Other opt-in tests were not implied to run by this ordinary suite.
- Full Foundry suite: **186 passed / 0 failed**, including nine new haunted contract cases.
- Lint and TypeScript pass. Production compilation caught a result type that was corrected before the passing build.
- Frozen pnpm **10.2.0** offline installation passes. Only Howler and its declarations are new external dependencies; workspace linking also regenerates existing peer-resolution records.
- Actual browser play and saved reload pass. The browser viewport capability did not change measured width from 971px; **390px browser/mobile-wallet acceptance is not claimed**. Mobile/reduced-motion CSS is implemented but narrow-device acceptance remains an explicit release task.
- Production dependency audit: **6 high / 1 low**, zero critical/moderate; inherited TOML/Zod/elliptic findings remain. No clean security audit is claimed.
- Genuine Supabase service, paid Jev/OpenAI, public Base deployment/funding, actual browser wallet signing and public hosting are **not verified**. Database/provider doubles and actual Anvil are separately labeled.
- **Hosted Day 27 Linux container/workflow passes** for implementation `292148a` in [the 30-job run](https://github.com/EverEye-El/dapptober-agents/actions/runs/40582458137). **All 30 jobs passed**, including 27 standalone Linux containers/workflows, both worker images and shared application/contract/Anvil checks. GitGuardian passes. A subsequent local-readiness-helper/documentation follow-up records this exact implementation evidence; it does not claim that evidence applies to an unverified future commit. Local Docker is unavailable; Linux evidence comes from hosted CI, separately from the copied macOS standalone acceptance.

## Trust and operational limits

Ghost dialogue has no tools, wallet key or economic authority. Runtime/code, chain, token, prize/toll and solution hashes are checked before live instructions. Transaction submission is browser-controlled and locked before the wallet prompt; exact receipts bind sender/target/calldata/value after two blocks. Browser no-submission acknowledgements are assertions, not cancellation. Expired seals can be abandoned after 80 blocks; active seals retain their salt for recovery.

Puzzles and contract hashes are public; low-entropy answers can be inspected or brute-forced. This is a game, not a secret-answer or Sybil-resistant prize distribution system. Multiple wallets can solve; keep funded pools bounded and reviewed. The contract reserves five USDC when the last key is earned, reverting the entire reveal if unfunded. Reserved winnings remain claimable through pause/expiry. Owner can withdraw only separate bribes or unreserved post-season funds.

Demo visitor access depends on a signed browser cookie; clearing it loses access. Keeper token, cookie secret and workspace ID must stay stable through redeploys. Each visit snapshots room rules. Catalog changes affect future demo visits only, not immutable contract rules. Native public launch requires ingress/admission/retention and backup controls. Per-cookie limits do not stop cookie churn. Optional live review calls have a durable global reservation before any paid work; outages consume that reservation conservatively.

The game stores plaintext messages/riddles and is not a private-secret vault. Serverless launch requires Supabase; local disk is supported only when explicitly chosen and actually persistent. Earlier days are not automatically migrated to this demo storage model. See the [completion tracker](PROJECT-COMPLETION-TRACKER.md) for separate demo and live launch tasks.
