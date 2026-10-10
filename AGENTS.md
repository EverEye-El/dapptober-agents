# Repository workflow

Use pnpm 10.2.0 for installs and scripts. Keep `pnpm-lock.yaml` as the sole dependency lockfile; use `pnpm install --frozen-lockfile` for reproducible installs.

For future changes, work on a dedicated branch (use the `codex/` prefix unless the user specifies a name) and open a pull request when publishing changes. Do not push changes directly to `main` or merge a pull request without explicit user authorization.

Follow `MasterPrompt-DapptoberAgentsBuild.md` as the primary build specification and read the complete relevant daily prompt in `prompts/dapp-prompts.ts` before implementing each day.

After each daily build, update `docs/PROJECT-COMPLETION-TRACKER.md`. Add the new day and record all remaining implementation, deployment, configuration, funding, verification and release work. Keep earlier days current when shared changes affect them. Distinguish tested simulations, local-chain integrations and live production evidence; only mark remaining work complete after verifying it. Update the tracker whenever a listed task is completed or a new gap is found.

## Daily visual inspiration

The user supplied `2026SocialPosts/` graphics. Inspect the matching day graphic when designing subsequent daily agents; use it as inspiration while retaining the established copper hyper-tech terminal UI. Day 10 uses `22-day-10.png`. Preserve the source collection.

## Credential-free test fixtures

For mocked database tests, use credential-free connection URLs on reserved `.invalid` hosts. Do not embed invented username/password pairs or plausible Supabase project hosts. Test URL parsing with harmless path/query values when possible. Keep secret scanning enabled; do not add blanket test-directory exclusions.
