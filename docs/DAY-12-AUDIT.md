# Day 12 audit — October 12, 2026

Full master build specification and complete Day 12 canonical prompt read before implementation. Supplied letterpress graphic inspected. Live Dapptober fetch failed; official Pinata/thirdweb docs and published Story SDK were researched. [Research](DAY-12-RESEARCH.md) records the explicit network discrepancy.

| Requirement | Implemented and verified | Remaining boundary |
| --- | --- | --- |
| Registration and selectable templates | Custom Base ERC721 registry; three immutable hashes; consent-gated public IPFS multipart upload; Jev selects only approved IDs | Native Story IP registration and PIL are not implemented under Base-only network constraints. Paid Pinata/Jev and authorship/legal rights require live acceptance. |
| Paid training/inference | Exact wallet previews and dedicated agent buy; work allowlist, expiry, per-purchase/daily caps; forbidden purposes reject | Public content is not encrypted/paywalled; purpose is declared. Known agents cannot buy human-use licenses. Offchain compliance is separate. |
| Derivative royalty splits | Remix license required; terms/minimum fee inherited; 20% recursive upstream split; atomic creator credits and claims | Eight-level bound; no transferable royalty rights or external Story royalty vault claimed. |
| Certificate/earnings history | Public printable paper/brass certificates; immutable author/hash/terms/URI; accrued earnings and paginated Royalty event history | History is bounded/truncated explicitly; full-scale indexing and legal interpretation remain. |
| Independent capability/app | Shared @dapptober/provenance, own 3012 app/config/API/container/Vercel boundary | No daily-server dependency; real state uses Supabase; external keys/contracts are unconfigured. |

Local verification: **92 application tests**, **60 contract tests** including eight new press cases and 256-run royalty conservation fuzzing. Actual Anvil test verifies original/remix registration, inherited permission, agent allowlist/caps, funded purchases, exact 1.2/0.8 USDC credits, claims with zero residual contract balance, actual thirdweb ownership read and public history reconstructed from chain events. Jev and Pinata in that flow are explicit doubles. Other daily local-chain workflows are rerun separately. Production build/HTTP final results are recorded in the completion tracker.

Browser evidence: registration → simulated agent training purchase → claim updates 1 USDC earned/claimed; no provider upload or transaction is presented as real. Copper/brass UI and certificate contrast inspected and corrected. [Browser screenshot](day-12-browser.png).

Security review: template hashes/price/author/parent are immutable; derivative parent IDs point only backward and depth is capped; creator credits sum to actual fee even with rounding. Owner controls agent permissions/caps/pause; renewing caps does not reset spend. Claims stay available while paused. Provider credentials never enter public state. Public certificate reads only confirmed chain records in real mode; no private drafts/raw contents or secrets are returned. Public IPFS publication requires explicit consent and remains public if wallet registration is cancelled. Error receipts record failure without pretending a real chain rollback occurred.

Remaining: native Story integration/network decision and supported settlement-currency architecture; independently reviewed legal terms/rights/identity workflows; actual Pinata/Jev/Supabase keys and acceptance; Base Sepolia then Base contract/gas/USDC funding; private agent authorization/allowlists; HTTPS hosting; actual metadata retrieval/hash checking and multi-level payout reconciliation; contract/security review; public abuse/rate limits, backup/retention/IPFS pinning/monitoring and scaling/indexing. No production task is marked complete solely from simulations or local transactions.

Final workspace audit: all twelve independent production builds and fresh production-server page/API/workflow/receipt checks passed. The corrected certificate text contrast was verified in the saved browser screenshot. No public-chain or live provider evidence is inferred from these checks.
