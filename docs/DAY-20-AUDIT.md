# Day20 audit — Overrule

## Original prompt → implementation

- Operator registration/collateral: real Base USDC deposits into an immutable approved ERC4626 vault; receipt shares credited/locked per operator, withdrawals limited to free shares. This custom Base bond is distinct from EigenLayer restaking.
- Task verification and signed verdicts: exact ABI-committed input/algorithm/claim, independent Node sum/max rerun, chain/contract-bound EIP712 signatures, five-minute expiry, replay guards and onchain signature verification. Arbitrary semantic outputs are unsupported.
- Slashing/evidence: permissionless challenge of a provably wrong call; delayed settlement independently rechecks truth, including unchallenged lies. Slashed shares go to task creator; honest collateral unlocks. Vault risk/yield are not guaranteed.
- Replay UI: stadium/striped official design, recorded-task animated replay frames, compare claim/result, signed report bundles, challenge flag, Jev recommendation, collateral state, export and receipt chain. Animation is explicitly not live transaction throughput.
- Jev: typed slash/release response requires >=.9 confidence and deterministic agreement; optional OpenAI commentary has no tool/fund authority. Unavailable/disagreeing providers fail review, not objective fund recovery.
- ERC8004: real interface adapter verifies prior validator/agent request and final response publication; optional standalone mode and fixture testing are explicit.
- EigenLayer: current Base destination certificate inspection adapter with domain-bound task message, freshness, pinned verifier and >=2/3 thresholds. Actual source-chain restaking/allocation/slashing relay is not implemented and not claimed.

## Authority and limits

Human wallets sign deposits, withdrawals, task publication, challenges and settlement. The Node operator key signs and broadcasts only deterministic verdicts through app tools; its normal wallet authority still requires real key management.30actions/minute operator API limit and contract collateral lock prevent unlimited report capacity. Guardian pause preserves exits/settlement. Real dashboard/evidence APIs require an operator token; public onchain inputs are not private. Secrets remain app-local; no invented credentials or real external messages/payments are used.

Maximum200indexed tasks/500reports, bounded event start block, production RPC range management/indexer/archiving, watch/settlement scheduling, proxy/vault trust, key rotation, unknown broadcast reconciliation and security review remain operational work. Evidence exports carry public data; real paid providers, Supabase durability, public-chain wallet recovery and genuine Eigen certificates remain live acceptance requirements.

## Verification evidence

Unit tests exercise typed signatures, payload/domain tampering, evidence hashes, exact integer execution, honest failure versus dishonest success, review delay, duplicate settlement and Jev mismatch/unavailability. Eigen ABI tests use a controlled RPC mock, not live restaked security. Foundry exercises deposits/share conservation, lock/withdrawal, honest and dishonest finality, replay, pause, ERC8004 fixture publication and256-run arithmetic fuzzing.

Funded Anvil integration deploys actual fixture USDC/ERC4626 vault and RestakedReferee; deposits100USDC, confirms a real Node-signed verdict, releases an honest lock, challenges/slashes a wrong signature, redeems10USDC of slashed shares, withdraws remaining90shares and checks exact mined wallet receipts. No Jev/OpenAI/Eigen external service is used in that chain test.

Final check totals, browser results and hosted release status are recorded below after execution. No live deployment is certified by this audit.

Local verification:159 application tests passed (18 opt-in skips);125 Solidity tests passed, including nine Day20 tests and256-run sum/max fuzzing. Final funded Anvil integration passed after creator-bound commitment/evidence-event refinements. Lint/typecheck and frozen pnpm install passed; production dependency audit retains one inherited low advisory. Browser verified the demo bad-call → Jev advisory → challenge → delayed simulated settlement/Overruled flow and separate evidence/official controls. Responsive CSS is implemented; live mobile wallet/visual acceptance remains open.

Git history check: PR14 merged Day18 into the Day17 branch and PR15 merged Day19 into the Day18 branch after the earlier parent merge. Main still contained Day17 only when this build started. The dedicated Day20 branch preserves both merged branch histories and carries existing Days18–19 forward to main in the new PR; no existing daily implementation is dropped.
