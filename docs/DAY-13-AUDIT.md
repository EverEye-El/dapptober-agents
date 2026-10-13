# Day 13 requirement audit

| Canonical requirement | Implementation | Evidence / production limit |
| --- | --- | --- |
| Agent plus token in one flow | Factory atomically deploys a thirdweb ERC20Base-derived LaunchAgent with immutable public instructions; Day 13 hosts its bounded text inference | Solidity and actual Anvil deployment; requires configured model credentials/hosting for real inference |
| Revenue treasury and holder distributions | USDC tips and paid text services; transfer-corrected accumulator; separate reserve/revenue liabilities; pull claims | Contract conservation, transfer correction and funded local-chain service/claim; no public Base payment claimed |
| Vesting, locked liquidity, rug-risk indicators | 20% creator tokens: 90-day cliff/365-day vest; fixed supply, no privileged mint/burn/owner mutation; no curve reserve admin withdrawal; Jev confidence/abuse gate | Contract tests and actual local-chain vesting; reserve can fall through sells, no LP lock/DEX graduation or safety certification |
| Real revenue versus market cap | Onchain revenue/distributed/reserve; marginal curve FDV separately labeled; Dune cached-query adapter and raw-log SQL | RPC totals tested locally; Dune wrong-chain/stale fixtures tested; actual saved SQL query/live Base indexing remains release acceptance |
| Jev + LLM split | Jev gates and listing risk indicators; configured LLM narrates ledger figures and executes paid text jobs | Deterministic simulation and explicit local provider doubles; actual Jev/OpenAI acceptance remains unchecked |
| Independent product and extensible capability | New Next app on 3013; shared `packages/launchpad`; own env/config/README/CI/container entry; public read-only feed and paid service | Independent production build and workflow audit; no earlier-day runtime dependency |
| Degen launchpad identity | Launch feed, tickers/avatar marks, compact FDV/revenue columns, trade dock, projected curve, live tape and agent terminal; copper rocket gantry | Browser workflow and saved screenshot; no invented market history or transactions |

## Security and limits

No proxy/admin withdrawal, hidden mint, transfer tax or public service wallet tools. Actual claims preserve prior dividends when tokens transfer; inventories/vesting are excluded until circulating. USDC rounding dust stays in the contract. Public revenue includes tips/self-tipping and does not prove profit or independent demand. Permanent curve reserves are locked from administrators, not locked against legitimate sells. Virtual reserves are not backed USDC. Max 200 listings and bounded reads require indexing for larger deployments.

Paid jobs require onchain payer and exact request commitment before live inference. Job output is durable and cached. Failed inference can be retried, with no automatic USDC refund. Public instructions/commitments must not contain private data. Operator buyers require explicit listing approval, capped daily/per-buy funding, expiry and pause; enforcement is both onchain in the owner-configured GantryBuyerVault and in durable server state; the signer needs gas only, and USDC remains in the narrowly funded vault. Hosting and key compromise are outside contract invariants.

Provider keys, actual Supabase, paid inference, public Base deployments, real wallets, saved Dune SQL execution, independent security review and monitoring are release acceptance work, not established by fixtures or local transactions. Automated tests are not a contract audit.

## Verified local evidence

- Frozen pnpm install, lint and strict typecheck passed.
- 97 application tests passed; ten local-chain cases are deliberately skipped by the credential-free unit runner and run separately.
- 69 Solidity tests passed, including 256-run curve round-trip conservation fuzzing and transfer-corrected revenue tests.
- All ten actual Anvil cases passed: the nine earlier acceptance cases plus Day 13 atomic deployment, thirdweb supply read, funded buy/sell, exact paid-request proof, cached provider-double output, holder revenue claim, buyer caps/pause and creator vesting.
- All thirteen independent production builds and fresh HTTP workflows passed. The final Day 13 public access, paid-job recovery and onchain vault bundle was rebuilt and its production HTTP workflow rechecked before publication.
- Browser demo launch feed, service payment, labeled output and holder claim verified; the screenshot captures copper UI with the corrected gantry crop. Provider doubles/simulations are not public-chain or live model evidence.
- Production dependency audit reports the same one low inherited advisory. It does not constitute an independent security review. Hosted CI/container evidence remains separate from local builds.

Public reads and wallet-only previews never expose private jobs, receipts or buyer policy. Public callers cannot arm or execute the autonomous buyer. Private operator authorization remains necessary for signer actions, while the public funded-service endpoint validates payment before model use.

Day 13 onchain buyer setup: after the factory deployment, deploy `GantryBuyerVault(owner, agentSigner, CircleUSDC, factory)` and set `LAUNCH_BUYER_VAULT`. Owner-signed grants atomically replace the allowed listing IDs and set caps/24-hour expiry; owner-signed revoke stops the vault. Fund the vault with limited USDC, the signer with gas only. Owner recovery and holder-revenue claims use wallet previews. The vault checks the actual factory listing and retains UTC-day spent across renewed grants.
