# Day 27 research — October 27, 2026

The complete master build specification and supplied canonical prompt file were read before implementation. Day 27 requires distinct ghost agents, hard contract rules, keys and treasure payouts, ambient audio/glitch visuals, and Jev move gating before LLM dialogue. Both `2026SocialPosts/39-day-27-A.png` and `39-day-27.-Bpng.png` were inspected. DEADLOCK retains copper spectral wardens, industrial readouts and a chained vault; the second supplied graphic is included as the mansion backdrop without modifying either original.

The [live challenge](https://www.dapptober.xyz/dapp/27) was fetched successfully through HTTPS and inspected as rendered HTML after the web tool could not open it. It matches the haunted mansion brief and stack. It calls Jev optional; the canonical prompt requires it, so the build includes a typed gate. Demo gates are labeled simulation; genuine dialogue requires a genuine Jev result first.

Official references inspected:

- [Vercel AI SDK text generation](https://ai-sdk.dev/docs/ai-sdk-core/generating-text): reuse the existing pinned AI SDK 6 reasoner and bounded timeouts. Documentation now defaults to a newer major; installed declarations and existing tested integration determine the exact API.
- [thirdweb external wallets](https://portal.thirdweb.com/wallets/external-wallets) and [wallet connections](https://portal.thirdweb.com/react/v5/connecting-wallets): unified `thirdweb/wallets` createWallet plus public client ID. Installed `Account.sendTransaction` declares `chainId`, not `chain`; TypeScript caught and corrected that difference.
- [Howler.js project documentation](https://github.com/goldfire/howler.js): lazy Howl instance, explicit user playback, loop/volume, pause and unload. Pin 2.2.4 and ship original synthesized local audio.
- [OpenZeppelin SafeERC20](https://docs.openzeppelin.com/contracts/5.x/api/token/erc20#SafeERC20): transfer wrappers plus independent exact-balance checks, reentrancy protection and explicit owner controls.
- [TypeSafe Jev API reference](https://typesafe-jev.com/en/guides/api/): typed Choice with confidence, reject option and the existing TypeSafe endpoint. A separately surfaced System One hosted-account API uses another origin/credential; it is not silently substituted for the project's configured Jev key.

Engineering decisions: deployable editable demo is an explicit user-approved target. Supabase is used even in demo mode when configured; keeper-owned shared room catalog is separate from visitor snapshots. Custom rooms affect future demo visits only. Onchain mode uses three immutable room rules, public verifiable answers, commit/reveal to bind each move to its wallet, separate bribe/prize accounting and reserved winnings. Chat cannot alter economic state. Public low-entropy puzzles are not secret or Sybil-resistant competitions; that limitation is documented.
