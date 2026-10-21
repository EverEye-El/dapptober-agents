# Day19 research — October19,2026

Read master specification and complete canonical Day19 Group-Chat Familiar prompt before implementation. Live dapptober.xyz challenge matches the supplied daily brief: feed mini app/Telegram, tipping, splits, memes, polls, leveling pet, Jev intent/model routing. User asks for degen group-chat design and multiple chat clients. Source graphic `2026SocialPosts/31-day-19.png` supplies copper cyber-cat/chat inspiration; original preserved.

Primary sources used:

- [Farcaster SDK getting started](https://miniapps.farcaster.xyz/docs/getting-started), [wallet guide](https://miniapps.farcaster.xyz/docs/guides/wallets), [publishing](https://miniapps.farcaster.xyz/docs/guides/publishing): ready(), native Ethereum provider, signed exact-domain manifest and required chain/capability declarations. SDK0.3.0 installed. Context identity is not spending authority.
- [Telegram Bot API](https://core.telegram.org/bots/api): setWebhook secret_token header, privacy-mode commands and sendMessage. No polling service required.
- [Discord interactions](https://docs.discord.com/developers/interactions/receiving-and-responding): verify raw body Ed25519/timestamp, authenticated PING and prompt interaction acknowledgment; final response is a permitted bot channel message.
- [Slack request verification](https://docs.slack.dev/authentication/verifying-requests-from-slack/): v0 raw-body HMAC, five-minute timestamp rejection; chat.postMessage with bot token.
- [Neynar username lookup](https://docs.neynar.com/reference/lookup-user-by-username): current x-api-key header, exact username response and verified_addresses.eth_addresses. No cast-posting signer required.
- [thirdweb BuyWidget](https://portal.thirdweb.com/bridge/buy-widget/react): current Bridge widget replaces deprecated PayEmbed/Pay; public client ID, mainnet only in this app.
- Installed Next16 route-handler and after() documentation: raw verification in Node route, persist before acknowledgment, use after() for background work with bounded route duration. Hosting/worker failure recovery remains operational work.

Architecture: deterministic commands own recipients/amounts; Jev validates intent and chooses small/creative narration; no AI signer. Base Sepolia84532 testing and Base8453 production with immutable Circle USDC checks. A custom reviewed social contract is necessary for exact bill shares, group XP, wallet poll results and meme NFT ownership. No fake third-party deployments are substituted. Wallet signatures gate web commands and every chain broadcast; native identities only queue proposals.

SDK dependency audit: Farcaster's Solana wallet support introduces @solana/web3.js. Its jayson4.3 dependency introduces vulnerable stream-json1.9; pin only @solana/web3.js>jayson to compatible4.1.3. Production audit returns one inherited low elliptic advisory. Revisit upstream releases; do not disable scanners.
