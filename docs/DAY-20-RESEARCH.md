# Day20 research — October20,2026

Read the complete master specification, repository workflow and canonical Day20 prompt before code. Inspected matching `2026SocialPosts/32-day-20.png`; source collection preserved. Live Dapptober Day20 page was read in the browser and matches the canonical requirements: collateral-backed operators, signed task verification, slashing evidence, instant replay and Jev confidence. Its stack is suggested, not a requirement to pretend unsupported deployments exist.

## Current primary documentation

- [Live challenge](https://www.dapptober.xyz/dapp/20): striped referee/stadium/instant replay visual direction.
- [EigenLayer deployment matrix](https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/README.md): current mainnet core v1.13.1 and Base/Base Sepolia destination v1.9.0; Base explicitly supports certificate verification, not native restaking/slashing. Keep user-selected Base networks, never silently substitute an Ethereum deployment.
- [AllocationManager](https://github.com/Layr-Labs/eigenlayer-contracts/blob/main/docs/core/AllocationManager.md): operator sets/unique slashable allocations, slasher configuration and delays. AVSDirectory is an older integration path; current source registration needs AllocationManager. No fabricated source-chain registration is supplied.
- [Official IECDSACertificateVerifier v1.9.0](https://github.com/Layr-Labs/eigenlayer-contracts/blob/v1.9.0/src/contracts/interfaces/IECDSACertificateVerifier.sol), read completely: certificate reference timestamp/messageHash/ordered concatenated signatures; verifyCertificateProportion(OperatorSet,certificate,uint16[]) checks transported stake-weight thresholds. Certificate digests can replay across destinations, so Overrule binds its message to destination chain/contract/task/verdict. Fresh table reference and pinned verifier are additional app checks. Proxy implementation and table transport trust still require review.
- [ERC8004 current draft](https://eips.ethereum.org/EIPS/eip-8004), complete validation section: agent owner/operator requests a validator, validator records0–100 response plus optional evidence URI/hash/tag. Slashing is outside that registry. Real adapter checks matching validator/agent request and publishes only a finalized deterministic result. Fixtures are not official deployments.
- Installed OpenZeppelin IERC4626/ERC4626, SafeERC20, EIP712, SignatureChecker and ReentrancyGuard sources provide vault deposits/shares, safe token movement, typed domain separation, EOA/1271 signatures and effects-before-transfer protection.
- Existing official Jev System One protocol and AI-compatible shared reasoner are reused. Typed confidence is advisory; Solidity re-execution alone controls slashing.

## Implemented choice and remaining gap

Base-native USDC ERC4626 receipt collateral secures the working validation service. Operators re-use already invested yield-bearing receipt shares as encumbered security, with explicit vault/liquidity risk. This is custom vault-share collateral, **not EigenLayer restaked ETH**. Each report locks shares covering10USDC at submission. Deterministic sum/max checks allow honest fail/release and dishonest pass/slash, unlike subjective LLM quality judgements.

A separate genuine ABI adapter inspects Eigen destination certificates when configured with a transported actual AVS table, verifier and thresholds. It does not bridge slashes or equate local collateral with Ethereum stake. Native Eigen source registration, allocation, certificate collection and source slashing relay remain integration work. This distinction is visible in the product and completion tracker.
