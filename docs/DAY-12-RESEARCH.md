# Day 12 research — October 12, 2026

Complete canonical prompt read in `prompts/dapp-prompts.ts`: registration with selectable terms, AI training/inference license purchases, automatic royalty splits for remixes, certificate/earnings history and Jev choosing only approved templates. Full primary master specification was read. The supplied `2026SocialPosts/24-day-12.png` was inspected for copper letterpress/brass/certificate design. The live challenge fetch failed; no unverified live-page requirement was substituted.

## Protocol compatibility decision

The owner explicitly requires Base Sepolia testing and Base production for every day. Published official `@story-protocol/core-sdk` **1.4.4** was downloaded from npm and its shipped declarations inspected: `SupportedChainIds` and exported chains are Story **Aeneid 1315** and **mainnet 1514**. Base is not a supported deployment. Story's royalty documentation also lists whitelisted Story payment currencies; it does not establish Circle Base USDC settlement through Story.

Accordingly, this build implements a custom **Base ProvenancePress registry** with USDC permissions/payments/derivative royalties, not Story Protocol or the Story Programmable IP License. Native Story registration/licensing/royalty integration remains an explicit **implementation and network compatibility gap**, not a missing API key and not a completed requirement. It needs either an owner-approved Story network exception or a verified supported cross-chain architecture and implementation. No network switch, Story IP ID, PIL license or bridge is fabricated. The three Base templates are technical usage permissions, not Story legal templates.

## Official sources inspected

- [Published Story SDK](https://www.npmjs.com/package/@story-protocol/core-sdk): version 1.4.4 declarations for supported chains and unified IP registration APIs inspected directly from the official package.
- [Story licensing](https://docs.story.foundation/developers/typescript-sdk/mint-license) and [royalty module](https://docs.story.foundation/concepts/royalty-module): distinguish native protocol assets/licenses/royalty vaults from the Base implementation. Several direct documentation fetches failed; indexed official pages and the published SDK were used.
- [Pinata upload API](https://docs.pinata.cloud/files/uploading-files): multipart file/network=public through `https://uploads.pinata.cloud/v3/files`, response data.cid. Actual transport implemented and tested with an explicit provider fixture.
- [thirdweb ERC721 reference](https://portal.thirdweb.com/typescript/v5/erc721/getNFT): unified v5 NFT tooling. This build uses current `createThirdwebClient`, `getContract`, `defineChain` and `readContract` to verify immutable certificate ownership, tested against Anvil.

Base registry decisions: fixed approved hashes, immutable author/certificate/price/terms, no NFT transfer of royalty rights, remix purchase required before child registration, inherited terms/minimum price, 20% recursive parent waterfall up to depth eight, claimable creator credits to avoid receiver failures, dedicated buyer caps/allowlist/expiry/pause. Onchain usage is declared; unregistered wallets cannot be cryptographically classified as humans or AI. Registered agents cannot buy human-use licenses. Public IPFS is provenance storage, not a paywall or proof of lawful authorship.
