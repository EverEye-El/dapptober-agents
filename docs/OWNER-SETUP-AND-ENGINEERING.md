# Owner setup and remaining engineering — Days 01–20

Updated October 20, 2026. Start with one daily app; configure shared accounts once, then use separate testing/production environments. This list consolidates owner inputs without replacing the detailed [completion tracker](PROJECT-COMPLETION-TRACKER.md). Never paste private keys or database/provider secrets into an issue or this document.

## Shared owner setup

| Input | What the owner supplies | What engineering can then finish |
| --- | --- | --- |
| GitHub billing | Resolve failed payment/spending limit in Settings → Billing & plans | Rerun final-commit CI and verify all twenty standalone containers and both worker images. Latest inspected run refused every job before steps. |
| Supabase | Testing and production projects, private table-owner connection access, backup budget | Configure private namespaces; verify read/write/RLS, concurrency, restart and backup/restore. No Supabase Auth or anon API keys are used. |
| RPC | Dedicated Base Sepolia/Base endpoints, archive capability where required; browser-safe restricted endpoint for Day 18 | Verify chain, bytecode/runtime pins, deployment metadata, event scans and receipt/recovery behavior. |
| AI/Jev | Jev access and applicable OpenAI project/model billing; private service credentials | Verify genuine routing/refusal, outages, payload privacy and calibration. Days 07/11 use separately provisioned inference; Day 12 uses Jev template selection. |
| Wallets | Public owner addresses, controlled test/production wallets, encrypted deployer custody, bounded gas/USDC budgets | Prepare/deploy/verify reviewed contracts, configure exact approvals/caps, run funded acceptance and record receipts. Owner and independent parties sign where required. |
| Hosting | Account/project access, stable HTTPS domains, request-duration and quota budget | Deploy separate apps, configure secrets/ingress/monitoring, verify hosted durability and recovery. Public release needs owner approval. |
| Reviews | Independent security reviewer and applicable legal/privacy/issuer review | Prepare review packets, resolve findings, document evidence and limitations. Agent self-review is not an independent audit. |

Missing operator/session secrets were generated privately during this pass. Hosting still needs those private values. Existing secrets were preserved. Keep the apps in demo mode until their actual service and deployment requirements are met. Changing an operator token can change the stored workspace namespace; do not rotate it as a shortcut to recovery.

## Additional inputs by day

| Day | Additional owner/account/decision input |
| --- | --- |
| 01 | thirdweb project and sponsorship budget; owner session signatures; smart-account gas/USDC. |
| 02 | Chosen supported facilitator, recipient wallet and payer funding. Static Authorization is supported; rotating signed JWT providers need another adapter. |
| 03 | Separate real client/validator participants and registration metadata; decision on optional EAS. |
| 04 | Creator/validator participation and bounty budget; decision on unattended operation. |
| 05 | Approval of two verified compatible lending/savings vaults, risk limits and monitoring mode. Research is engineering work; approving financial exposure is the owner's decision. |
| 06 | Keep Base Sepolia test settlement blocked unless an official supported path exists; approve any alternative test strategy before a network change. Base production requires funded browser signing. |
| 07 | Intel TDX/dstack hosting budget, reviewed model/workload measurement approval, and decision on optional anchoring. |
| 08 | Founding membership, voting windows, each member's profile/delegation signatures and worker preference. |
| 09 | Oracle/bond budgets, reviewed immutable market rules/resolution sources and dispute-monitoring responsibility. |
| 10 | World Developer app/RP/action, final passkey domain, real personhood/passkey participant and reward budget; dedicated verifier custody. |
| 11 | Akash lease/GPU/model/storage budget and provider custody; acceptance of output-delivery/retention terms. |
| 12 | Story/Base architecture decision plus reviewed license/rights/publication terms; Pinata/thirdweb accounts and buyer budget. |
| 13 | Reviewed token/revenue terms, buyer caps, thirdweb and Dune account/query access. |
| 14 | Separate guardian/session custody, Tenderly account, intentional allowances and legacy migration/revocation signatures. |
| 15 | Issuer onboarding/membership, country/minimum/terms review and actual test issuer vault access. |
| 16 | Independently controlled sellers/arbiter, arbitration terms, registered identities and seller-service credentials. |
| 17 | Attester wallet and public-evidence consent; Tenderly/Pinata access and reviewed router/locker enrollment. |
| 18 | Confirm allocation-credit scope or fund a separately reviewed financial-settlement implementation. Real bidder/auctioneer wallets and ACP testing are needed. Base mainnet remains gated. |
| 19 | Chosen chat platforms, room consent and installs, bot credentials, actual recipient directory and signed Farcaster manifest. No messages were sent by this pass. |
| 20 | Reviewed real ERC4626 vault, operator/guardian custody and collateral budget; choose explicit Base collateral scope or undertake separate source-chain Eigen allocation/slashing architecture. |

## Engineering that remains explicit

These are not all solved by supplying a credential. The initial estimate that roughly one-third could be finished immediately was not a measured inventory and should not be treated as a promise of live completion.

| Work | Current boundary / next action |
| --- | --- |
| Provider-specific x402 authentication | Static Authorization is implemented. If the chosen provider requires expiring path-bound JWTs, implement and test its signing/refresh adapter against that provider. |
| Day 12 native Story/PIL | The existing Base registry is not native Story. An approved network exception or reviewed supported bridge/currency design is needed before implementing that architecture. |
| Day 18 replacement/drop tracking | Exact-instruction replacement tracking and cancelled/changed-instruction rejection are implemented. Verify actual wallets and resolve dropped/unknown nonce outcomes before enabling resubmission; the UI keeps uncertain hashes blocked. Financial settlement/hidden-order/payroll adapters require a scope decision and separate review. |
| Day 19 history retention | Audited manual queue recovery exists. Private terminal-job archival, replay tombstones and paginated history are implemented; verify them against real Supabase. Room-proposal archival remains; the active 500-job/100-proposal bounds are unchanged. Platform delivery is inherently ambiguous on network failure, so retries require inspection. |
| Day 20 index integration | A finalized-event archive and paginated raw-event export are implemented. The evidence room now exposes paginated task/verdict archive APIs and controls. Archive-backed active task management must still replace the bounded 200/500 booth before exceeding those limits. Real database restart/concurrency acceptance remains pending. |
| Day 20 broadcast recovery | Persist/reconcile operator broadcast attempts and pending/replaced/dropped transactions before enabling unattended verdict submission. Do not blindly retry an uncertain broadcast. |
| Day 20 native Eigen security | Certificate inspection is separate from source-chain allocated stake/slashing. Real registration, transported tables and a reviewed slashing/adjudication relay remain absent. |
| Operational automation | Monitoring/alert/retention/backups and bounded scheduling must match the actual hosting, provider budgets and chosen operating policies. Implement missing scheduled/rescan behavior where selected; verify pause/recovery before enabling. |
| Production scale | Indexing/history/export beyond the other documented per-app bounds remains required before increasing capacity; do not remove limits without durable pagination and retention. |
| Dependency advisory | Current audit still finds one low elliptic advisory with no patched version. Prepare external review or an upstream-vetted replacement; scanner exclusions and ad-hoc cryptographic substitutions are not fixes. |

## External protocol constraints rechecked

[CoW's official endpoint list](https://docs.cow.fi/cow-protocol/integrate/api) lists Base and Ethereum Sepolia, with no Base Sepolia endpoint. Retain the explicit Day 06 block. [Story's official network guide](https://docs.story.foundation/node-setup-mainnet) identifies Story Mainnet/Aeneid; it does not establish native Base deployment. [Fhenix's current overview](https://www.fhenix.io/what-is-fhe) describes the public testnet rollout and planned mainnet support; it does not establish an operational Base mainnet endpoint. No network IDs or gates were changed based on these checks. An absent published path is a verified documentation limitation, not proof that every possible future integration is impossible.

## Acceptance handoff

After access is supplied, engineering can run the selected day's ordered checklist, keep evidence redacted, prepare release review and leave only owner/independent-party signatures and decisions pending. Record environment, release commit, chain/contract/runtime, transaction hashes, provider evidence and failure recovery. Local fixture/scanner/Anvil tests do not close live provider or production tasks.
