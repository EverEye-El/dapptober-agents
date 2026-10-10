# Base and Supabase alignment audit — Days 01–10

Date: October 10, 2026. Scope: daily environment boundaries, chain adapters, persistent stores, contract network dependencies and deployment tooling. This is an implementation alignment review, not an independent security audit or evidence of public deployment.

## Fixed target

Testing: Base Sepolia, chain ID **84532**. Production: Base, chain ID **8453**. Local Anvil, chain ID **31337**, is retained exclusively for isolated integrations. Ethereum Sepolia is removed from supported application configuration, chain selection and CoW fallback. Every daily `.env.example` defaults to 84532.

Circle USDC: Base Sepolia `0x036CbD53842c5426634e7929541eC2318f3dCF7e`; Base `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`. Runtime token selection rejects another token on these real public networks; local integration fixtures use explicitly configured mock tokens. Changing chain ID requires changing RPC, USDC and contract addresses together.

## Shared fixes

- Chain readers verify the RPC's actual chain ID before accepting contract/block data; invalid network metadata no longer falls through to Base Sepolia.
- The Foundry deployment wrapper checks the RPC before `forge create`. Only Base Sepolia/Base or localhost Anvil may deploy through it. No public deployment was performed by this audit.
- Both Supabase stores disable prepared statements for direct/session/transaction pooling and require TLS for remote hostnames. A password containing `localhost` cannot disable TLS.
- Days 01–09 now cache connections/schema readiness separately per database URL, preventing accidental reuse of a different project's connection.
- Both `dapptober_state` and `dapptober_checkpoint` enable row-level security without public policies. Use a private table-owner server connection; anon/service-role API keys are not application inputs. Actual Supabase role permissions, connectivity, persistence and restore still require account acceptance.
- Receipt defaults and public explorer links now use the requested Base networks; local Anvil receipts do not link to a public explorer.
- Existing workspace keys are preserved. Real stored state rejects a different chain rather than relabelling previous balances and history. Days 01–09 remain isolated by day/operator-token namespace; operator rotation needs reconciliation. Day 10 retains RP/action uniqueness across operator rotation. Separate testing/production Supabase projects are required.

## Per-day findings

| Day | Reviewed contracts / adapter | Alignment and remaining external requirements |
| --- | --- | --- |
| 01 | `SessionVault`, thirdweb wallet/session adapter | EIP-712 binds chain and vault. Adapter checks configured owner. Correct Circle token and Base RPC required. thirdweb server secret and configured sponsorship (`sponsorGas:true`), real account/bundler execution and funded vault remain to verify. |
| 02 | x402 exact-EVM client/server; no custom contract | Network derives from configured chain; payer checks token/recipient/price. Verify facilitator supports Base Sepolia and Base. Production provider authentication is not implemented if the selected provider requires it. No credential-supported live settlement was performed. |
| 03 | `AgentPassport`, signed feedback, optional EAS | Identity/feedback domains use configured chain/registry; contract EIP-712 prevents cross-network feedback replay. Actual public registry deployment, independent client/validator feedback and optional EAS deployment/schema remain. This is a custom passport, not Day 10's actual ERC-8004 registry. |
| 04 | `QuestEscrow`, MCP/guild adapter | Escrow takes the token at deployment. Adapter now verifies its token matches configured USDC before accepting quest data/work. Deploy/fund the escrow and verify full MCP/provider approval/refund workflow on requested networks. |
| 05 | `FlightTreasury`, ERC4626 monitoring/rebalance | Adapter verifies owner/USDC, vault asset, distinct lending/savings configuration; contract enforces permissions and constraints. Existing compatible public vault addresses/yield observations remain; mock vaults are not production protocol evidence. |
| 06 | CoW typed orders, relayer and Order Book API; no custom contract | Default is Base Sepolia; Base is production. Unsupported testnet live operations explicitly reject before approvals/signing, with no Ethereum Sepolia fallback. Official CoW has no documented Base Sepolia solver endpoint: real settlement there remains external integration work. Base production token/RPC/solver fills still require live acceptance. |
| 07 | `InferenceAnchor`, inference/TDX worker | Anchor has no fixed-chain dependency and receives chain-specific transaction metadata. Test on Base Sepolia, publish production commitments on Base. Phala/dstack Intel TDX VM, approved measurements/model and fresh hardware quotes remain required separately from anchoring. |
| 08 | `SenateVoice`, `SwarmGovernor`, profiles/delegate keys | Contracts have no hardcoded deployment chain. Profile signature and delegate-key derivation bind chain/governor; adapter verifies governor/token wiring. Deploy both contracts, enroll/delegate/fund members and verify public lifecycle plus real Jev/AI. |
| 09 | `ForecastColosseum`, UMA OOv3 adapter | Constructor injects token/oracle; assertion text includes chain ID. Adapter verifies owner/token/oracle/identifier. UMA lists Base and Base Sepolia; testnet has no production DVM support. Verify actual OOv3 address, whitelist, identifier, bond and live liveness before deploying/funding; independently operate dispute monitoring. |
| 10 | `HumanCheckpointRewards`, World ID/WebAuthn/ERC-8004 | Reward and agent signatures bind chain/contract; adapter verifies token/verifier/campaign. Obtain actual Base Sepolia/Base ERC-8004 registry addresses and production World RP credentials. Real personhood/hardware passkey, Supabase durability, funded payout and privacy/security acceptance remain. |

All nine custom contracts were inspected. Their chain-independent constructors and OpenZeppelin domain binding already support deployment on Base networks; no production contract source rewrite was necessary. The added Solidity regressions explicitly change chain ID from Base Sepolia to Base and verify session, feedback and reward signatures cannot replay.

## Verification evidence

Final local validation passes: lint, type checking, **82 application tests**, **44 Solidity tests**, **seven actual Anvil integration cases**, **all ten production builds** and **all ten fresh production HTTP/page/API/workflow/receipt checks**. The seven Anvil cases are skipped in the ordinary application suite and run separately through the release, senate, forecast and checkpoint harnesses. Added tests cover all ten example networks, rejection of Ethereum Sepolia, incorrect Circle token configuration, mismatched RPC refusal before block reads, deployment network refusal, Supabase connection isolation/RLS setup and TLS/pooling options. Database tests use an explicit mock driver; they do not claim real Supabase acceptance. Existing actual Anvil integrations test the adapters and funded fixture contracts, not public-chain infrastructure.

## Official references rechecked

- [Base network configuration](https://docs.base.org/get-started/connect-to-base)
- [Circle USDC deployment addresses](https://developers.circle.com/stablecoins/usdc-contract-addresses)
- [Supabase connection modes](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [CoW API network endpoints](https://docs.cow.fi/cow-protocol/integrate/api)
- [UMA network support and DVM boundaries](https://docs.uma.xyz/resources/network-addresses)

The live Dapptober site fetch failed during this pass; the complete repository prompts for Days 01–10 were reread as the canonical specification. No paid account, production database, external provider key, funded public wallet or public deployment is claimed.

Hosted check status for implementation commit `8193788`: build/container CI is pending. GitGuardian flags five invented PostgreSQL URI fixtures in `tests/supabase-store.test.ts` and `tests/network-alignment.test.ts`; these are mock-driver/fetch tests, not provisioned credentials or reachable database accounts. Review and dismiss those specific false-positive incidents in GitGuardian before treating the security check as passing. No real secret rotation is required for these fixtures.
