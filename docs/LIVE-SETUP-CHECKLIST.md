# What the owner needs to provide

All eight apps currently run in explicit demo mode. Repository code and local-chain tests do not establish live deployment. This checklist is the owner handoff for the remaining items in [the completion tracker](PROJECT-COMPLETION-TRACKER.md).

## Shared setup

1. Provide access to the hosting account and a PostgreSQL service. Deploy each app independently, with its own HTTPS origin and private environment. One database can serve the eight namespaced apps; deployment credentials need access to `dapptober_state`.
2. Supply a TypeSafe/Jev API key and an OpenAI-compatible model provider key for Days 01–06 and 08. Day 07 uses Jev plus its own model inside a confidential worker. Put credentials in each app's ignored `.env.local` or the host's secret manager, never in chat or Git.
3. Supply public owner wallet addresses. Keep owner wallet keys in the browser wallet or an encrypted deployment keystore. Days 03 and 04 need independent client/validator identities; Day 08 needs at least three member wallets.
4. Fund dedicated agent/deployment wallets with native gas, and fund the USDC workflows with the appropriate chain's token. Testnet tokens and gas suffice where the protocol supports that testnet. Day 06 needs CoW-supported tokens/liquidity; Base Sepolia is not a CoW deployment.
5. Review and merge PRs when ready. No automatic merging or direct pushes to main are part of this work.

For supported testnet USDC, [Circle's official faucet](https://faucet.circle.com/) supports Base Sepolia and Ethereum Sepolia without an account. Match the chain and token address to the app configuration; faucet tokens alone do not establish CoW liquidity or vault compatibility. Native gas is a separate requirement.

The private `.env.local` files have been initialized without replacing any existing file. They remain in demo mode until configuration is deliberately completed. Each deployment needs a different random `OPERATOR_TOKEN` (32+ characters). Use dedicated, minimally funded `AGENT_PRIVATE_KEY` signers rather than owner keys.

## Per-day live acceptance

| Day | Owner/provider input | Remaining engineering and acceptance |
| --- | --- | --- |
| 01 | thirdweb secret, owner address, dedicated agent signer, USDC and sponsored/funded gas | Deploy SessionVault for the chosen owner; birth smart account; owner grants scoped authority; transfer a small amount, revoke, and confirm further execution fails |
| 02 | recipient, dedicated paying signer, supported facilitator, USDC/gas | Verify facilitator support for chosen network; observe unpaid 402, real payment, retry, settlement hash and recipient balance change |
| 03 | separate owner/client/validator wallets with gas | Deploy AgentPassport; register, record a job, sign feedback, attest, and query the resulting public directory. EAS is optional; if enabled, register its schema |
| 04 | creator/validator wallets, funded dedicated worker, bounty USDC | Deploy QuestEscrow; exercise actual MCP discovery/claim/submission and approval/payout; check dispute/refund and timeout; schedule bounded worker if desired |
| 05 | owner/agent funding, approved live vaults and USDC | Verify two distinct compatible ERC4626 vaults (lending/savings) on selected network; deploy FlightTreasury; grant bounded plan; collect yield samples, move small amounts, disengage and recover funds |
| 06 | funded browser wallet on Base or Ethereum Sepolia, supported USDC/WETH | Check exact token addresses and liquidity with official CoW deployments; approve relayer; sign and submit a real order; verify fill plus a separately cancelled order |
| 07 | owner address for the control room, Phala/dstack Intel TDX hosting account/budget, pinned model and approved workload measurements | Build/publish immutable worker image; deploy worker inside CVM; independently enroll measurements; obtain fresh inference quote and current collateral; verify receipt and tampering. InferenceAnchor is optional |
| 08 | three or more founding member addresses and signatures, delegate gas funding | Deploy SenateVoice/SwarmGovernor; record start block; members sign values and delegate; run live debate, provisional votes, human override and final adoption; schedule bounded worker if desired |

Contract deployments and approvals require actual wallet signatures. Cloud provisioning may incur costs; none has been purchased or provisioned by this repository work.

## Configuration checks

```sh
pnpm readiness                    # all eight private configurations, no network requests
pnpm readiness 05                # one day
pnpm readiness --init            # create missing .env.local files without overwriting
pnpm readiness 05 --online       # read-only RPC chain and deployed-code checks
pnpm run test:contracts
pnpm run test:release-chain       # temporary Anvil: Days 01, 03, 04, 05
pnpm run test:senate-chain        # temporary Anvil: Day 08
pnpm run test:production          # fresh built servers on 3101–3108; stops them after audit
```

Run local-chain tests after building contract artifacts (`pnpm run test:contracts`). Anvil must be installed and ports 18548/18549 free. `SMOKE_PORT_BASE=3100 pnpm run smoke` can verify production servers on ports 3101–3108 without disturbing the usual browser ports. The checks print field names, not secrets. Missing live configuration intentionally exits with status 1. Online checks only query RPC chain ID/bytecode; they do not send transactions, query balances, probe paid providers, establish contract ownership, validate PostgreSQL, or certify deployment readiness. Passing configuration checks still requires the acceptance steps above.

## Evidence and unresolved infrastructure

Hosted migration CI passed on October 8, 2026: [push run](https://github.com/EverEye-El/dapptober-agents/actions/runs/37855611512) and [PR run](https://github.com/EverEye-El/dapptober-agents/actions/runs/37855633298). The initial new hosted run built the confidential worker successfully but exposed a Kit peer resolution failure in all eight app containers. Root Kit 5.5.1 and direct/nested import regression coverage address the x402 requirement; All eight corrected app container builds, startup probes and API/receipt checks passed on [run 37858718305](https://github.com/EverEye-El/dapptober-agents/actions/runs/37858718305), commit `ce60ccf`. The worker image also built successfully. These are packaging checks, not cloud/CVM deployments. Complete HTTP workflows for all eight actual containers subsequently passed on [run 37860191053](https://github.com/EverEye-El/dapptober-agents/actions/runs/37860191053), commit `10be663`. The final shared and container jobs all passed on [run 37860650867](https://github.com/EverEye-El/dapptober-agents/actions/runs/37860650867), implementation commit `7e85799`, after a test-timeout correction also verified with deliberately slow local blocks. Docker is unavailable on the current machine, so container builds are not claimed locally.

The moderate URI-decoder advisory is fixed with the maintainer's `decode-uri-component@0.5.0` release override. A version-pinned pnpm patch changes only the export/module format to preserve CommonJS callers in existing wallet dependencies; the upstream decoding algorithm is unchanged. Its regression test exercises legacy query parsing and malformed input. Both Docker builds copy the reproducible patch before installation. The remaining low elliptic advisory has no patched release in the registry audit. It is transitive through the Intel quote verifier; changing cryptography requires upstream review and independent hardware verification, not suppressing the advisory. Our receipt signing uses viem, not elliptic. [Maintainer URI advisory](https://github.com/SamVerschueren/decode-uri-component/security/advisories/GHSA-vcc3-ghjq-m6fr).

Official protocol references rechecked during this pass: [CoW](https://docs.cow.fi/), [Coinbase x402](https://docs.cdp.coinbase.com/x402/welcome), [Phala](https://docs.phala.com/). The Dapptober live site could not be fetched by the research tool; the repository's complete daily prompts remain canonical.
