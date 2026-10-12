# Day 11 research — October 11, 2026

Canonical source: complete Day 11 in `prompts/dapp-prompts.ts`; architecture/security/audit requirements from `MasterPrompt-DapptoberAgentsBuild.md`. Required features: provider capacity/model/VRAM/minute-price listings, human and agent job buying, escrow released on output-hash delivery, agent bidding API, uptime/reliability and Jev bid admission/provider ranking. Supplied graphic `2026SocialPosts/23-day-11.png` was inspected and informs the copper lantern/rack UI.

The live `https://dapptober.xyz/day/11` fetch failed. No conflicting page requirements were inferred; the repository prompt remains canonical.

Official implementation references inspected:

- [Akash GPU deployments](https://akash.network/docs/learn/core-concepts/gpu-deployments/): GPU leasing and inference deployment context.
- [Akash SDL advanced features](https://akash.network/docs/developers/deployment/akash-sdl/advanced-features/): GPU units/vendor/model constraints and persistent storage syntax. Included SDL is a configurable deployment reference, not a launched lease.
- [Ollama generate endpoint](https://docs.ollama.com/api/generate): non-streaming requests, model, prompt, done/output response and bounded generation options. Worker uses this actual HTTP protocol.
- [OpenZeppelin utilities](https://docs.openzeppelin.com/contracts/5.x/api/utils): reentrancy protection; SafeERC20 is used consistently with existing project escrow contracts.
- [Base network details](https://docs.base.org/get-started/connect-to-base): test 84532 and production 8453, preserving the owner's chosen networks.

Engineering choice: Base Solidity job escrow with a provider-owned Node/Ollama worker suitable for Akash. Akash leasing remains a separate provisioning/payment activity; provider signing keys authorize hash delivery on Base. No io.net integration or Solana path is claimed. Hardware/model claims are operator-reviewed declarations; a hash is an integrity commitment, not a proof of correct inference. Fixed reserved-minute pricing is explicit, rather than pretending to meter GPU usage. Reuse actual shared config, authentication, Supabase state, chain validation, Jev admission and receipts; promote compute market functionality into `@dapptober/compute`.
