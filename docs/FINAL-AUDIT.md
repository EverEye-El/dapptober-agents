# Final audit — Days 01–06

The complete master specification and complete canonical daily prompts were read before implementation. The actual canonical filename is `prompts/dapp-prompts.ts`. Live daily pages and official protocol documentation were researched; source links and differences are in RESEARCH.md. The canonical requirement for Jev is retained even where the live page calls it optional.

## Prompt → requirements → implementation → evidence

| Day | Implemented behavior | Verification |
| --- | --- | --- |
| 01 Wallet Genesis | thirdweb smart-account adapter, human grant/revoke, scoped USDC vault, typed balance/transfer chat, readable EIP712 preview, daily/max-transaction/recipient/token/expiry controls, confidence cosign and model routing | Day 01 workflow tests; Solidity signature/cap/allowlist/expiry/revoke/cosign/request-replay tests; independent production build; HTTP birth/grant/preview/transfer/receipt smoke |
| 02 Pay-Per-Prompt | Useful paid dataset, unpaid 402 challenge, official x402 exact-EVM facilitator seller, paying agent client auto-payment/retry, daily budget, Jev tier/eligibility/abuse, revenue and public toll log | Day 02 actual HTTP challenge/payment/retry tests; simulated ticket replay/budget/balance rejection; independent production build; production HTTP 402→payment→retry smoke |
| 03 Agent Passport | ERC8004-inspired registry/NFT metadata, programmatic directory/search, completed jobs with distinct clients, EIP712 feedback, validator evidence, optional EAS transaction, filtered trust/Jev authenticity | Day 03 crypto-signature/tamper/self-feedback/job/replay tests; registry Solidity tests; independent production build; HTTP registration/job/feedback/validation/trust smoke |
| 04 MCP Mercenary | Actual MCP SDK discover/claim/submit over linked client/server, stateless HTTP and stdio bridge, capability matching, generated summarization, funded USDC escrow, approvals/disputes/timeouts, leaderboard, gate every MCP call | Day 04 SDK client/server and malformed HTTP tests; escrow payout/authorization/double-pay/timeout/dispute tests; independent production build; HTTP funded quest→MCP work→creator approval smoke |
| 05 Stablecoin Autopilot | Contract plan and allowlisted ERC4626 vaults, lending/savings share-price sampling, bounded deposits and withdrawals, reserve/risk/allocation/day caps, reasoning logs, chat routing, kill switch and owner withdraw-all; one-cycle scheduled worker | Day 05 engage/monitor/deposit/pause/withdraw-all/withdraw-before-deposit tests; treasury Solidity accounting/slippage/replay/withdraw-cap tests; independent production build; HTTP plan/propose/execute smoke |
| 06 Intent Calligrapher | NL explicit spend/receive/deadline, readable preview, verified CoW quote in real mode and labelled local competition, official EIP712 payload, signature/allowance checks, order/cancellation/status/competition history | Day 06 parsing/deadline/failed-solver/cancel/signature-tamper tests; independent production build; HTTP draft→simulated sign→best-fill smoke |

The shared provider, authentication, durable serialization, hash-chain and policy tests supplement the daily tests. Solidity fuzzing exercises arbitrary transfer amounts against the session cap. Six distinct browser layouts were inspected, including a wallet birth interaction. All six were checked at a 390×844 mobile viewport with no horizontal document overflow; the treasury cockpit and intent studio were also visually inspected at desktop and mobile sizes. Each app owns its configuration, routes and build output; runtime code has no calls to another day's server. Day 02's HTTP client calls its own paid endpoint.

## Verification results

- ESLint and TypeScript: passed.
- Vitest: 7 files, 27 tests passed.
- Foundry: 18 tests passed, including 256 fuzz cases.
- Production: six independent Next.js builds passed.
- Runtime: six production HTTP workflow checks passed using `npm run smoke`.
- Dependencies: npm audit reports 0 critical, 0 high, 17 moderate advisories. Remaining reports propagate from thirdweb/WalletConnect's legacy query-string/decode-uri-component dependency chain. The patched decoder release is ESM and is not a safe drop-in override for the old CommonJS consumer; an upstream SDK dependency migration remains necessary. High/critical findings were resolved with tested version/override updates. This is not a clean dependency audit.

The build and runtime entries refer to the final verification run; the scripts are checked into the repository so the same checks can be repeated. CI runs lint, typing, application tests, Solidity tests, six builds and runtime smoke checks. Docker and Vercel deployment recipes are supplied; container images and remote deployments were not executed here.

## Live verification still requires deployment credentials

Local demo workflows are deterministic simulation, explicitly labelled throughout the UI and receipts. Real protocol adapters are implemented with official SDKs/viem and fail closed when credentials or providers are absent. No funded public-chain transaction, thirdweb bundler submission, x402 facilitator settlement, live paid Jev/LLM call, deployed EAS attestation, ERC4626 mainnet allocation or live CoW solver fill was executed here. PostgreSQL live persistence also requires a configured database; local atomic-file persistence and concurrency were tested. These distinctions are intentional and are not hidden behind mock transaction hashes.

Day 01 uses a policy custody extension because thirdweb target/native-value session permissions cannot enforce daily ERC20 amounts by themselves. The session covers USDC transfers, not arbitrary contract execution. Real commands use explicit EVM recipients; local `vitalik.eth` parsing is labelled simulation. Smart accounts deploy lazily when a bundled transaction executes. Owner recovery remains accessible directly on SessionVault.

Day 03 is ERC8004-inspired and does not claim complete draft-registry compatibility. Initial onchain directory and bounty indexing is capped at 1000 records and uses RPC logs; production scale needs an event indexer and pagination. Registry job links and schema-specific EAS records remain separate provenance signals. A validator is trusted, not an oracle of truth.

Day 04 initially supports summarization of supplied source; it does not invent external research. The nominated validator controls disputes and explicit timeouts prevent escrow from remaining locked indefinitely. External workers should use real authenticated mode; the browser-local simulation is isolated by session cookie.

Day 05 APY is a historical share-price observation after at least 60 seconds, not a forward rate. Supply actual compatible lending/savings vault addresses rather than fabricated protocol addresses. Reallocation uses a bounded withdrawal to liquid reserves followed by a subsequent deposit cycle, so each step is separately policy checked and receipted. Illiquid vaults can make withdraw-all revert; individual owner withdrawals and recoverLiquid exist on the contract. The optional worker runs one cycle and relies on platform scheduling.

Day 06 supports USDC→WETH buy intents on CoW-supported Base or Ethereum Sepolia. Native ETH is represented as WETH. “Before Friday” is explicitly next Friday 23:59:59 UTC. Public API liquidity/quotes/solver availability determine whether a real order can be submitted or filled; a signature guarantees constraints, not execution. Filled real orders expose actual trade hashes and competition responses, while local winners remain labelled simulated.

## Platform limits and next steps

A real deployment is a single operator control room with separately configured PostgreSQL state, scoped agent signer, owner wallet and bearer token. It is not a multi-tenant custodial product. Receipt hashes detect linked-record tampering but are not externally anchored. A process crash between external settlement and database commit requires reconciliation; onchain request IDs prevent repeated wallet/treasury previews from spending twice. Use platform-level rate limits on the public Jev-screened paid resource. No secrets are committed; all required environment fields and funding/deployment steps are documented.

Days 07–31 can add independent app boundaries and typed tools using the existing provider, guardrail, receipt and protocol packages. A future orchestrator composes those packages directly with its own state and authority rather than depending on the six daily servers.
