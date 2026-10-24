# Day 24 research — October 24, 2026

Read the full master build specification and canonical Day 24 prompt before implementation. Inspected the live [Day 24 challenge](https://www.dapptober.xyz/dapp/24) in the browser and matching preserved graphic `2026SocialPosts/36-day-24.png`. The challenge calls for reputation-priced cover, pooled capital/yield, incident logs/traces, member voting/payout and Jev sufficiency recommendations in a Victorian insurance office.

Primary documentation reviewed before implementation decisions:

- [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004): identity owner/agent wallet and Reputation `getSummary(agentId, trustedReviewers, tag1, tag2)`, including feedback count and decimal score. Require verified registries and explicit trusted reviewers; do not treat the project's Day 03 registry as protocol-compatible without verification.
- [OpenZeppelin Checkpoints](https://docs.openzeppelin.com/contracts/5.x/api/utils#Checkpoints): historical share voting. Freeze at policy issuance, exclude claimant and prevent same-block capital changes from producing stale electorates.
- [OpenZeppelin ERC-4626 security discussion](https://docs.openzeppelin.com/contracts/5.x/erc4626): conversion rounding/inflation considerations. This mutual uses nontransferable custom shares with virtual units, no ERC-4626 compliance claim and no external yield strategy. Premiums net of claims are the actual capital return.
- [Snapshot SDK source](https://github.com/snapshot-labs/snapshot.js) and [official GraphQL API](https://docs.snapshot.box/tools/graphql-api): genuine production/testnet Hub proposal reads. Use binding onchain ballots and an optional evidence/network/block-bound advisory Snapshot discussion mirror. Snapshot scores do not independently authorize USDC transfers. No invented Base Sepolia protocol deployment or automated Snapshot publisher is claimed.

Architecture choice: Base Sepolia rehearsal and separately deployed Base production mutual, exact Circle USDC, finite seven-day underwriting season, full-limit reserves, frozen electorate, permissionless settlement and beneficiary pull payouts. Jev remains advisory to accountable member votes. Actual loss assessment and the trust/legal model require outside review. Private Supabase-backed office protects redacted preimages; public hashes do not make underlying evidence true.
