# Day 28 research — October 28, 2026

Read the complete primary master build specification and canonical Day 28 prompt before implementation. The live [Dapptober Day 28 brief](https://www.dapptober.xyz/dapp/28) agrees on the Per-Second Waterfall: creator pay while watching, contributor payroll and job-lifetime compute pay, flowing motion, live balances, pause/top-up, sender/receiver explorer, Superfluid/USDC/Base and TypeSafe Jev. The live brief calls Jev optional; the canonical prompt and this implementation retain the gate for real app starts.

Inspected `2026SocialPosts/40-day-28.png`: copper industrial USDC outlet, luminous falling coins, dark refinery/planet and terminal readouts. SPILLWAY crops the supplied source graphic without altering the source collection, adds a motion manifold driven by recorded channel states and gives each channel its own controls. Framer Motion 14.7.1 is pinned; reduced-motion users get static flow paths. Consulted [Motion animation documentation](https://motion.dev/docs/react-animation).

Protocol decisions derive from official sources:

- [Superfluid SDK create/update/delete flow](https://docs.superfluid.org/docs/sdk/money-streaming/create-update-delete-flow) and [ACL documentation](https://docs.superfluid.org/docs/sdk/money-streaming/acl-user-data): EVM SuperTokens, streaming rates and operator permissions.
- [Protocol flow guide](https://docs.superfluid.org/docs/protocol/money-streaming/guides/create-update-delete-flow): actual CFA flow lifecycle, requiring transactions to change/delete flows.
- [Official network metadata](https://github.com/superfluid-finance/protocol-monorepo/blob/dev/packages/metadata/networks.json): Base and Base Sepolia deployments.
- [CFAv1Forwarder source](https://github.com/superfluid-finance/protocol-monorepo/blob/dev/packages/ethereum-contracts/contracts/utils/CFAv1Forwarder.sol): `setFlowrate`, `getFlowrate`, `getBufferAmountByFlowrate`. Channel contract is the actual sender; no broad owner-wallet flow operator grant is needed.
- [SuperToken interface](https://github.com/superfluid-finance/protocol-monorepo/blob/dev/packages/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol) and [factory interface](https://github.com/superfluid-finance/protocol-monorepo/blob/dev/packages/ethereum-contracts/contracts/interfaces/superfluid/ISuperTokenFactory.sol): upgrade/downgrade use 18-decimal amounts, even for six-decimal USDC; wrapper deployments identify their underlying token. Permissionless factory supports a wrapper for the exact configured underlying.

| Network | Host | CFAv1Forwarder | SuperTokenFactory |
| --- | --- | --- | --- |
| Base Sepolia 84532 | `0x109412E3C84f0539b43d39dB691B08c90f58dC7c` | `0xcfA132E353cB4E398080B9700609bb008eceB125` | `0x7447E94Dfe3d804a9f46Bf12838d467c912C8F6C` |
| Base 8453 | `0x4C073B3baB6d8826b8C5b229f3cfdC1eC6E47E74` | `0xcfA132E353cB4E398080B9700609bb008eceB125` | `0xe20B9a38E0c96F61d1bA6b42a61512D56Fea1Eb3` |

No switch to Ethereum Sepolia. Public adapters require the shared Circle USDC address, official host and runtime pins. Testnet fake-USDC wrappers are rejected as substitutes. The fork rehearsal uses the official deployment with a local-only mock underlying; this exception is restricted to isolated chain 31337 and is labelled in tests.

A channel has a fixed receiver/rate, lifetime funding ceiling, maximum requested lease, reserve, replay-protected jobs and narrowly authorized agent. This keeps all untrusted text outside calldata construction. It does **not** solve Superfluid keeper liveness: deadlines do not delete streams themselves. Funding is channel-bounded; delayed stops can consume more than the planned lease and can lead to liquidation. Actual buffer queries, supervisor/alerts and funded tests remain required.

Use live TypeSafe Jev only for new app starts; require typed continue/pause and >=90% confidence, fail closed, cap paid start requests. The exact approved compute job reuses its decision during signing; contract checks are fresh. Stops/revocation/reconciliation do not call a paid model. No OpenAI API is needed for bounded compute work or typed policy requests.

A new generic persistence capability saves both demo and real workspaces. Supabase transaction row locks coordinate servers; local atomic files support a single process on persistent disk. Other days retain their existing stores. Authentication, namespace/mode/chain separation, body/record/action limits and private cookies apply before state mutation. Public demo visitors never control the operator queue.
