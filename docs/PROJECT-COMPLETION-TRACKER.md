# Project completion tracker

This living document tracks every built Dapptober agent from local implementation through verified live operation. Update it after each daily build and whenever remaining work is completed or new gaps are discovered. It is the ongoing completion checklist for the projects.

## Maintenance rules

- Add a row for each newly built day, preserving earlier days.
- Record what was actually tested and distinguish simulations, local-chain integration and live production evidence.
- Keep remaining implementation, deployment, configuration, funding, verification and release work explicit, including blockers.
- Remove a remaining task only after completing it; record the result in the tested column and link its audit or evidence.
- Update the status date and shared release work on every revision. A working UI or successful demo alone does not establish live completion.

## Current status

Status as of October 8, 2026: all eight apps work in local demo mode, but none is verified end to end as a live production service. Interfaces, workflows, shared logic and builds were tested. The localhost apps currently simulate financial actions and AI responses.

Real protocol integrations are implemented, but deployment, credentials, funding and live verification remain.

| Day | What’s working/tested | What remains for live use |
| --- | --- | --- |
| **01 — Wallet Genesis** | Wallet/session workflow; contract restrictions, caps, expiry, revocation and replay protection | Deploy **SessionVault**; configure thirdweb; create the smart account; fund USDC and gas or sponsorship; verify an actual authorized transfer and revocation |
| **02 — Pay-Per-Prompt** | HTTP 402 challenge → simulated payment → retry; budget and replay checks | **No custom contract deployment.** Configure a supported x402 facilitator and recipient; fund paying wallet with USDC/gas; verify actual settlement |
| **03 — Agent Passport** | Registration, directory, signed feedback and validation logic; registry contract tests | Deploy **AgentPassport**; use separate owner/client/validator wallets; verify live registration and feedback. Optional EAS requires its address and registered schema |
| **04 — MCP Mercenary** | Actual MCP client/server communication; local quest lifecycle; escrow contract tests | Deploy **QuestEscrow**; fund a USDC bounty and agent gas; verify claim, submission, approval, payout and dispute handling; schedule worker if desired |
| **05 — Stablecoin Autopilot** | Allocation policies, local monitoring/rebalancing, pause and withdrawal logic; treasury contract tests | Deploy **FlightTreasury**; configure at least two compatible, existing USDC ERC4626 vaults; fund treasury/agent; collect rate samples; verify small deposits, withdrawals and recovery; schedule worker |
| **06 — Intent Calligrapher** | Intent parsing, constraints, signing payloads and simulated solver workflow | **No custom contract deployment.** Use existing CoW contracts; configure supported chain/tokens; fund wallet, approve relayer and verify a real order, fill and cancellation |
| **07 — Glass-Box Mind** | Receipt signatures, tamper rejection, sharing and verification; historical Intel-signed quote tests | Deploy confidential worker/model inside an **Intel TDX CVM**; approve/pin workload measurements and model digest; verify fresh hardware-backed inference. **InferenceAnchor** deployment is needed only for onchain publication |
| **08 — Swarm Senate** | Debate/override workflow; contract tests; **actual local Anvil deployment, delegation, votes, override and adoption** | Deploy **SenateVoice + SwarmGovernor** on the chosen public chain; enroll members, sign profiles, delegate and fund agent gas; configure live reasoning; verify public-chain lifecycle; schedule worker if desired |

For every live app, remaining setup includes HTTPS hosting, PostgreSQL, private environment configuration, operator authentication and its required AI/Jev credentials. Each then needs a live acceptance run: passing demo tests does not establish that providers, wallets and public-chain transactions work together.

Release work also remains: verify hosted CI after pushing, address the remaining dependency advisories and review the custom contracts before putting meaningful funds into them. Keep subsequent daily work committed and pushed. The contracts have automated tests, not an independent security audit.

Day 07 has the most infrastructure left; Day 08 has the strongest tested real-chain integration so far.

## Shared tooling — pnpm migration

The workspace now uses pinned pnpm 10.2.0 and `pnpm-lock.yaml`. Fresh frozen installation, an isolated production-only worker installation, lint/typecheck, 40 application tests, 28 contract tests, the real Anvil integration, all eight production builds and all eight production HTTP workflows pass. Direct external dependency versions are preserved; scripts, CI, Docker, existing Vercel configurations and active setup docs use pnpm. See [migration audit](PNPM-MIGRATION.md).

Remaining: review and merge the migration pull request, verify hosted GitHub CI, build the container images, and resolve the documented upstream dependency advisories/peer warnings. Live deployment requirements for Days 01–08 above are unchanged. Package-manager migration does not establish live protocol validation.

## Supporting documentation

- [Deployment instructions](DEPLOYMENT.md)
- [pnpm migration audit](PNPM-MIGRATION.md)
- [Days 01–06 audit](FINAL-AUDIT.md)
- [Day 07 audit](DAY-07-AUDIT.md)
- [Day 08 audit](DAY-08-AUDIT.md)
