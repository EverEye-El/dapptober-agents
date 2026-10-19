# Gremlin — The Group-Chat Familiar / Day19

A copper, sticker-filled group chat with a leveling pet. Tip USDC, reimburse a shared bill, mint a meme collectible and run wallet-based onchain polls. Farcaster mini app plus authenticated Telegram, Discord and Slack command adapters share the same capability layer.

Run `pnpm --filter @dapptober/day-19 dev` from the workspace, then open http://localhost:3019. Build/start use the matching `build`/`start` scripts. Copy this app's `.env.example` to `.env.local`; demo needs no credentials. Independent Docker/Vercel packaging follows the other days.

## Commands

- `@gremlin tip @milo 2`
- `@gremlin split 60 to @milo among 3`
- `@gremlin mint when the gang buys the top`
- `@gremlin poll Dinner alpha? | Pizza | Tacos`

Demo @milo/@nova addresses are fixtures only. Real mode uses explicitly reviewed `FAMILIAR_MEMBERS_JSON` addresses or Neynar verified Ethereum addresses. Always review the displayed recipient. Bills reimburse a collector; this is not escrow, debt enforcement or an invitation system. The creator may pay one share. Amounts divide exactly down to the final micro-USDC. Polls enforce one wallet per vote, not one person.

## Real deployment and identity

Deploy `contracts/src/GroupChatFamiliar.sol` with Circle USDC on Base Sepolia84532 first. Pin its deployed runtime hash; configure RPC, Supabase session-pooler URI, unique operator/state namespace and HMAC challenge secret. Fund users with ETH gas and test USDC. Switch to Base8453 and its Circle USDC only after acceptance. Contract transfers directly from users, never agent custody; fixed100USDC/payment and500/day/wallet, guardian pause. Guardian is deployer; independently review keys/contracts before production funds.

Wallet commands use five-minute signed challenges bound to exact payload, room, wallet, origin, nonce and chain. Operator token stays backend-only. Actions produce exact calldata previews; user signs approvals and actions. Receipt acceptance checks mined sender, destination, calldata, zero native value and block time. XP/tallies come from contract reads. Wallet signatures are required even for posting real-mode commands; no login through untrusted Farcaster context. Plain browser wallets and Farcaster native Ethereum providers are supported.

Jev classifies deterministic parsed commands and selects lightweight/creative OpenAI-compatible models. Model outputs never set transaction economics. Chat/meme captions forward only the directed excerpt, not entire history. Meme SVG and NFT JSON are generated from approved captions; metadata is onchain as a data URI. Actual caption inference and Neynar require configured keys. No image-generation or external NFT-hosting key is needed.

## Chat apps

Native adapters are optional. `FAMILIAR_CHAT_ROOMS_JSON` explicitly enrolls platform/channel/workspace into a public room; no ambient chat surveillance. Obtain participants' consent first: directed excerpts, handles and resulting action cards become public at `?room=…`, and excerpts go to AI providers. Chat-platform identity never authorizes spending. Native replies link to the wallet app.

1. Telegram: create bot through BotFather; set `TELEGRAM_BOT_TOKEN` and independent `TELEGRAM_WEBHOOK_SECRET`. Register HTTPS `/api/telegram` using `setWebhook` with `secret_token`. Keep privacy mode on; only `/gremlin …` commands are processed.
2. Discord: create app/bot, set `DISCORD_PUBLIC_KEY`/`DISCORD_BOT_TOKEN`, interaction endpoint `/api/discord`. Register `/gremlin` with string option `command`; install with `applications.commands`/`bot`, permit Send Messages only in enrolled channels. Ed25519 raw-body signatures and timestamps are verified; PING and deferred ACK supported.
3. Slack: set `SLACK_SIGNING_SECRET`/`SLACK_BOT_TOKEN`; install with `chat:write`, add bot to enrolled channels, configure `/gremlin` command URL `/api/slack`. Raw-body HMAC/timestamp verified. Enroll exact team ID as workspace.
4. Farcaster: publish final HTTPS domain, generate its signed accountAssociation using Farcaster developer tools and set `FARCASTER_ACCOUNT_ASSOCIATION`. Inspect `/.well-known/farcaster.json`/embed metadata in client tools. Until signed, manifest is noindex. SDK ready/native wallet included; no cast-posting permission requested.

Native requests acknowledge quickly and persist deduplicated bounded jobs. Next `after()` drains queued jobs (max120s route). Delivery errors/unknown outcomes become `review`; never automatically resend ambiguous messages. A crash during processing needs operator inspection of Supabase state before manual recovery. No scheduled retry service/admin recovery UI is provided. Bound room retention, archive the100-proposal capacity and500-job ledger, add ingress limits/monitoring before production. Set unique secrets across environments. Supabase storage uses shared agent-core, isolated Day19 namespace; configure backup/retention and restricted server credentials.

Optional thirdweb **BuyWidget** replaces deprecated PayEmbed/thirdweb Pay. Domain-restricted public client ID; visible only on Base mainnet. No fiat top-up is advertised for Base Sepolia.

## Verification

`pnpm exec vitest run tests/day-19.test.ts`; `pnpm run test:contracts`; `pnpm run test:familiar-chain` (requires Anvil). The latter deploys real local contracts, funds fixture USDC, tips, creates/pays a bill, mints NFT, creates/votes poll and validates exact mined receipts. Jev/OpenAI are explicitly mocked there; this is not production provider evidence. Native signature tests are local cryptographic tests, not live group installation.

See [ordered remaining work](../../../docs/PROJECT-COMPLETION-TRACKER.md) and [audit](../../../docs/DAY-19-AUDIT.md).
