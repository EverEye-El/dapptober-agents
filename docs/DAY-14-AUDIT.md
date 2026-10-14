# Day 14 requirement audit

| Canonical requirement | Implementation | Validation / limit |
| --- | --- | --- |
| Onchain budgets, contract allowlists, time windows | GuardrailSentinel policies and isolated USDC compartments, scoped session keys, persistent daily counters | Solidity/funded local-chain tests; direct USDC payments only, no arbitrary calls |
| Human co-sign above threshold | EIP-712 guardian request plus owner EOA/ERC1271 signature | Actual owner signatures and missing-signature rejection locally; signatures bind all payment fields |
| Low-confidence escalation | Jev confidence <85% sets guardian-signed needsHuman flag, enforced onchain even below amount threshold | Unit and funded local-chain uncertainty tests; agent cannot unset the flag |
| Anomaly alerts / Jev kill triggers | Policy failures and Jev abuse generate actual request incidents; critical financial abuse invokes guardian shutdown | Simulated scenarios and actual funded guardian revoke; chat cannot spend or trigger financial kill |
| Global kill / key revocation | Global epoch, stopped flag, owner-only resume and explicit re-enrollment | Actual shutdown/resume/stale-request rejection; only enrolled compartments are covered |
| Every MCP tool risk-checked | SDK Streamable HTTP, guarded inspect/request/execute, scoped operator authentication | SDK client tools/call tests and independent HTTP endpoint checks |
| Jev model routing | Official LangChain TypeSafeClassifier route before configured chat reasoner | Response schema/routing tests; actual live inference remains provider acceptance |
| Tenderly / simulation | Actual RPC plus Tenderly REST successful-status gate for Base; no Tenderly claims for local chain | RPC-tested Anvil execution; Tenderly success/failure fixtures and official network catalog verification |
| Independent deploy / reusable layer | App 14 on 3014, packages/sentinel, private annotated env and CI/container entry | Independent production build and workflow checks; no earlier-day server dependency |
| Distinct security UI | Fleet roster, policy boundary, review queue, incident timeline, guardian channel, prominent red shutdown | Browser workflow and final copper screenshot; no fabricated security metrics |

## Release evidence boundaries

Credentials are not supplied. Real Jev/OpenAI/Tenderly, public Base deployments/signatures/payments, Supabase persistence and hosted production remain separate acceptance tasks. Local provider doubles are explicitly labeled; funded local-chain contracts and wallet signatures are actual. Tests are not an independent security review. Guardian/session key isolation and operator/hosting controls matter; compromising the guardian can disrupt the fleet or approve within owner-set autonomous caps, but cannot remove hard limits or required owner co-signatures.

Earlier apps are not automatically enrolled and existing wallets are not retroactively protected. Migrate funds and revoke old authorities separately. There is no background chain monitoring worker in this build; incidents arise from submitted tool requests and authoritative policy reads. Larger fleets require indexing. Recipient code alone does not guarantee safe receipt/recovery of direct USDC transfers.

## Verified local release checks — October 14, 2026

- Frozen pnpm install, lint and TypeScript checking passed.
- 102 application tests passed; eleven separately enabled integration cases are skipped in the default unit run.
- 78 Solidity tests passed, including nine Sentinel cases and 256-run spend-conservation fuzzing.
- All eleven separately enabled funded Anvil cases passed across release, senate, forecast, checkpoint, compute, press, launch and Sentinel suites. Actual Sentinel deployments, USDC payments, owner signatures, missing-signature rejection, replay/chain-domain rejection, critical guardian shutdown and explicit re-enrollment were verified. Jev responses in these tests are declared HTTP fixtures.
- All fourteen apps built independently. All fourteen fresh production HTTP workflows passed, including Day 14's SDK MCP initialization, request/execution, co-sign simulation, chat, kill/reopen and stale-session rejection.
- Browser walkthrough passed enrollment, autonomous simulated payment, high-value human approval, balances/receipts, global revoke, owner reopen, explicit policy re-enrollment with daily spending preserved, and routed chat. [Full browser evidence](day-14-browser.png) records the resulting state. Emergency controls remain visible at a 1280×720 viewport.
- Production dependency audit reports one inherited low-severity advisory; no moderate-or-higher advisory. Hosted CI/container results are pending for the new commit; local Docker execution is not claimed.

A repeated Day 8 test exposed a full developer demo archive. Its test now uses isolated in-memory archive state instead of accumulating in the user's local demo data. Runtime governance behavior is unchanged. Production smoke errors now retain server diagnostics so restricted-port failures are distinguishable from app failures.

## Three.js design follow-up

Added a client-only 3D guardian topology linked to real application state and the selected policy. Browser checks verified WebGL rendering, drag orbit, satellite picking, accessible selection, motion pause/resume and immediate human-review state updates. Inactive policy status overrides historical executions; two new state-mapping regressions pass. [Projection evidence](day-14-threejs.png).

Follow-up validation: lint/typecheck, 104 application tests, Day 14 production build and all fourteen production HTTP workflows passed. Frozen dependency install passed. No contract or execution authority changed. Context-loss fallback, reduced-motion behavior and resource cleanup are implemented; broader device/hosted GPU acceptance remains in the production checklist.
