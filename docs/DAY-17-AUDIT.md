# Day17 final audit — Toe Tag

Date: October17,2026. Local implementation and protocol integration; production acceptance remains separate.

| Prompt requirement | Implementation | Evidence / boundary |
| --- | --- | --- |
| Contract privileges / rug-pattern checks | Pinned RPC code/supply/owner/pause, EIP-1967 implementation, Blockscout verified primary source/ABI heuristics for mint/restrictions/tax/upgrades | Unit cases; actual local RPC token; live read-only Base Sepolia collection. Heuristics are not access-control proofs or a full audit |
| Holder concentration |20 Blockscout candidates, pinned balances, burn/validated-pair exclusions; custody identity and ranking lag explicit | Actual local balances plus indexed double; live20-holder reads. Not a complete census |
| Liquidity locks | V2 pair identity/reserves/LP supply/burn; runtime-pinned reviewed VestingWallet LP locked amount/end/owner, releasable excluded | Actual local LP burn and official VestingWallet schedule reads. Other lockers/V3 stay unknown |
| Sell simulations | Always-reverting buy/exact-approval/sell probe, stage-specific errors, native-only Tenderly override, pinned block | Six contract tests including forged-error rejection and full state rollback; actual local eth_call; Tenderly request/response unit test. Live provider still requires acceptance |
| Jev severity and uncertainty gate | Named pattern/severity choices/probabilities/confidence; deterministic severity floor; unknown/low-confidence requires recorded review | Unit/live-shape provider doubles; no genuine Jev inference claimed |
| LLM plain-language report | Structured summary/sections, known finding IDs, untrusted names/provider strings treated as data; no model transaction tools | AI SDK adapter with explicit local model double and browser simulation. Structural citations are not semantic proof |
| Onchain attestation | Consent→public canonical Pinata JSON→exact EAS schema/calldata→owner wallet→matching mined Attested event/UID; expiry/revocation status | Official pinned EAS contracts deployed on Anvil, schema registered, real attestation event/data and revocation tested. Pinata is a fixture locally; no public EAS transaction claimed |
| Polished independent product | Noir copper examination room, paper toe-tag, archive/evidence rows, review/public record, export/receipts, own env/3017/build17 | Browser full workflow, independent build/HTTP checks recorded below |

## Remaining boundaries

No production custom registry or agent spender is required. Deploy/review CoronerProbe on each Base network; verify route/instance bytecode, then configure actual Blockscout/Tenderly/Jev/OpenAI/Supabase/Pinata and official EAS schema. Testnet route availability is not fabricated. Probe result scope is one identity, block, route and size, with no guarantee of later sellability. Token ABI/source scans and holder candidates are bounded, no symbolic proof or criminal-intent finding. Reviewed VestingWallets require independent enrollment review.

Public pinning is already disclosure before EAS confirmation; rejected wallet actions do not unpublish IPFS. Published reports cannot be edited. EAS revocation happens through official attester tools/contract, followed by new examination; public JSON reports current revocation/expiration or unknown RPC status. No background watcher/keeper, public rescanning service, generic locker/DEX adapter or multi-tenant lab is claimed. Archive128 cases; export/backups/token-namespace recovery needed. Host ingress/rate limits/provider budgets and model calibration still require live acceptance.

## Validation

Original prompts→requirements→implementation→tests→independent build were reviewed; no live production item is inferred from simulation or doubles.

- Frozen pnpm install, lint and type checking passed.
- Application suite:130 passed;15 intentionally opt-in cases skipped in the default run. The nine Day17 unit cases also passed after the final unknown-evidence display correction.
- Solidity suite:98 passed, including all six CoronerProbe cases.
- Separate funded Anvil integration passed against the official EAS1.9.0 compiled contracts, with schema registration, exact attestation receipt/UID, revocation, diagnostic rollback and LP vesting reads. Explorer/model/upload/router fixtures are explicitly doubles. Earlier daily chain harnesses were not rerun in this release.
- All17 independent production builds and production HTTP workflows passed.
- Separate read-only Base Sepolia collection passed against public RPC/Blockscout; exact snapshot is recorded in research. Sell simulation remained unknown without configured probe/provider.
- Desktop browser intake, classification, narrative, separate review/publication consent, sealed archive and reload passed. Responsive CSS is implemented; actual mobile/device acceptance remains open because the browser viewport override did not target the deliverable tab reliably.
- Production dependency audit retains one inherited low-severity advisory; no moderate-or-higher finding.
- Real-mode readiness correctly remains blocked by missing deployment/provider configuration. Hosted verification will be recorded with the pull request; the previous account billing/spending restriction remains unresolved until jobs execute.
