# Day 09 — The Forecast Colosseum

Copper terminal prediction arena: humans and registered agents buy funded YES/NO stakes, compare forecasting accuracy and claim USDC after UMA resolution. Runs independently on port 3009, with shared source capabilities bundled into its own deployment.

```sh
pnpm install --frozen-lockfile
pnpm run dev 09
pnpm run build 09
pnpm --filter @dapptober/day-09 run start
pnpm --filter @dapptober/day-09 run test
pnpm run test:contracts
pnpm run test:forecast-chain
```

Demo needs no keys. Load four simulated markets, trade as a human, supply evidence to the simulated agent, advance one hour, assert a result, advance the dispute window, settle and claim. Rankings remain empty until resolution. Fixtures, AI responses, clock and arbitration are labelled simulations; no real hashes are fabricated. Each cookie has its own local arena and receipt history.

## Market mechanics

This version uses fully funded binary **pari-mutuel** pools. Buy YES/NO by staking USDC before cutoff. Stake units are nontransferable accounting positions; no leverage, order book, AMM or early exit. Indicative odds are the YES proportion of current total stakes. Winners divide the final total pool in proportion to their winning stakes. INVALID or an empty winning pool refunds original stakes. Floor rounding can leave at most one micro-USDC per winning claim in the contract; no owner withdrawal can remove it. One wallet can stake on both sides; its latest pre-cutoff probability is its single forecasting sample.

The owner creates up to 100 small markets, each with up to 256 participants. Resolution rules must name the exact observation source, timestamp/timezone, thresholds and missing/ambiguous-data fallback. The owner cannot edit rules, take collateral or choose a final outcome. Trading can be paused while claims remain available. Markets without a pending assertion can be refunded permissionlessly 30 days after close; a UMA dispute cannot be bypassed with this timeout.

Agent registration is owner-controlled and permanent. Contract-enforced per-trade, cumulative per-market and UTC-day gross spend limits apply to every call from that wallet, regardless of API lane. Pausing an agent preserves its classification and blocks new stakes. Register before its first trade; relabelling an existing human position is rejected. Limits cover new stakes, not claims or separate human oracle bonds. Each live deployment executes one configured agent signer; multiple registered external wallets can trade the contract directly under their own keys and caps. No separate Day 03 server is required.

Brier score is mean `(p - outcome)^2` over resolved, nonvoid markets. Lower wins. A single latest probability per wallet/market avoids volume-weighted score manipulation. Lane averages are weighted by sample count. Ten calibration bins show mean forecast versus actual YES frequency; empty observed bins have no points. Rankings show sample counts, do not certify expertise and do not prevent multiple-wallet identities.

## Agent API

`POST /api/trade` accepts `{id, amount, evidence}`. Real mode requires `Authorization: Bearer <OPERATOR_TOKEN>` and uses only `AGENT_PRIVATE_KEY`; callers cannot select another server signer. Supplied dated evidence is the only forecasting source, not an automatic web feed. Jev gates and routes to a typed LLM output `{probability, yes, reason}`; deterministic limits and the contract decide whether execution is permitted. Provider failures block trades. Receipts preserve the source evidence, policy and real mined transaction hashes. The console uses the same serialized capability path via `/api/agent`.

Human trade actions return an exact token approval and market call for the selected browser wallet. The wallet signs and pays its own stake. Claiming the server agent position uses its configured signer; human claims remain wallet-signed.

## Live deployment

Copy `.env.example` to private `.env.local`, configure real mode, HTTPS origin, PostgreSQL, owner/operator, RPC, exact USDC, UMA OOv3, Jev/AI and agent key. Run `pnpm readiness 09 --online`; configuration checks do not certify UMA support or production truth.

1. Verify current addresses in UMA's official network registry. Check bytecode, supported currency whitelist, minimum bond, `ASSERT_TRUTH2` approval and actual dispute support on the chosen network. Testnets have no production DVM support. Native six-decimal USDC is required; no fee/rebasing token support.
2. Deploy `contracts/src/ForecastColosseum.sol` with `(owner, USDC, OOv3, 7200, bytes32("ASSERT_TRUTH2"))`. Use at least a two-hour live dispute window and independent monitoring. Contract deployment permits 60 seconds–7 days for test flexibility, so verify live configuration yourself.
3. Set `FORECAST_MARKET` and `UMA_ORACLE`. The adapter checks immutable owner/token/oracle/identifier before use. Fund the agent with a small USDC balance and gas, register strict caps, then create a precisely sourced market.
4. Human and agent stakes require their own funds. Asserter approves a **separate** minimum USDC bond to the market; the market forwards it to UMA. Disputers approve the original assertion bond directly to UMA, even if the current minimum changed. AI confidence is evidence review, never oracle authority. Low confidence requires explicit human review.
5. Exercise cutoff, assertion, dispute and settlement on a supported testnet, then verify small public-chain acceptance with real Jev/AI. Persist transaction and oracle IDs. Public-chain DVM/monitoring, HTTPS/DB deployment and independent contract security review remain required before meaningful funds.

Foundry deployment example (use your private environment/keystore, never commit keys):

```sh
forge create --root contracts src/ForecastColosseum.sol:ForecastColosseum \
  --rpc-url "$RPC_URL" --account deployer --broadcast \
  --constructor-args "$OWNER_ADDRESS" "$USDC_ADDRESS" "$UMA_ORACLE" 7200 \
  0x4153534552545f54525554483200000000000000000000000000000000000000
```

No public contracts or paid providers were used during the build. The local-chain suite deploys real custom contracts and tokens on Anvil but deliberately substitutes UMA arbitration and AI providers. See [research](../../../docs/DAY-09-RESEARCH.md), [audit](../../../docs/DAY-09-AUDIT.md) and [completion tracker](../../../docs/PROJECT-COMPLETION-TRACKER.md).
