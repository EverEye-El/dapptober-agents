# pnpm workspace migration — 2026-10-08

The repository uses pnpm 10.2.0, pinned in the root `packageManager` field. `pnpm-workspace.yaml` includes the eight independent apps and fifteen shared packages; the root is the twenty-fourth project. `pnpm-lock.yaml` is the sole dependency lockfile.

## Changes

- Imported the original npm lock and retained all original direct external dependency versions. Removed `package-lock.json` and npm workspace configuration.
- Declared each app/package's direct imports explicitly, with local dependencies using `workspace:*`. Root dependencies also link the shared packages used by tests and scripts. No hoisting workaround is required.
- Updated the daily build/start/dev dispatcher and Anvil integration runner to invoke pnpm. Single-day commands use `pnpm run build 08` / `pnpm run dev 08`; package-specific tests use `pnpm --filter @dapptober/day-08 run test`.
- Updated GitHub Actions, all existing Vercel configurations, both Dockerfiles and active setup/deployment instructions. Docker bootstraps the pinned pnpm executable through npm, then installs project dependencies exclusively with pnpm.
- Preserved the existing dependency overrides and restricted dependency build hooks to Tailwind oxide, esbuild and sharp. Optional bufferutil, keccak and utf-8-validate hooks remain disabled.
- Added a narrow package extension for `pino@7.11.0`'s optional `pino-pretty` formatter, resolving a missing-module build warning exposed by pnpm's isolated layout.
- Recorded the branch/PR workflow in `AGENTS.md`; no direct push to `main` or merge is part of this migration.

## Setup

Use Node 22.12+ and enable the pinned manager:

```sh
corepack enable
corepack prepare pnpm@10.2.0 --activate
pnpm install --frozen-lockfile
pnpm run check
pnpm run test:senate-chain
pnpm start
# In another terminal:
pnpm run smoke
```

Alternatively install `pnpm@10.2.0` through npm. Do not regenerate an npm lockfile. Historical build audits retain their original npm commands as records of those earlier runs.

## Verified results

- Fresh `pnpm install --frozen-lockfile --offline` succeeds after removing the previous root dependency tree from the workspace.
- An isolated copy installs with `--prod --frozen-lockfile --offline`; the confidential worker loads its production dependencies and refuses startup without the required secrets/model digest.
- `pnpm run check` passes: lint, typecheck, 40 application tests, 28 contract tests and all eight production builds. The optional Anvil integration is skipped in the default suite and passes separately with `pnpm run test:senate-chain`.
- Contract sources were also recompiled with `pnpm run test:contracts --force`; all 28 tests pass, including 512 fuzz cases.
- `pnpm --filter @dapptober/day-08 run test` passes five tests, verifying the documented filtered workspace command.
- `pnpm start` and `pnpm run smoke` pass all eight production page/API/workflow/receipt checks. All eight standalone outputs contain their server entrypoints and have no dependency symlinks escaping the deployment tree.
- Original direct external dependency versions were compared against the previous npm lock and match.

## Remaining upstream issues and external validation

pnpm reports existing circular capability dependencies and third-party peer mismatches involving legacy React/Zod and Solana versions. These were not hidden with broad peer overrides. The inherited thirdweb/ox dependency graph also emits a webpack dynamic-dependency warning. Live provider/wallet validation remains as documented in the project tracker.

The production dependency audit reports zero critical/high advisories and two advisory families: moderate `decode-uri-component` and low `elliptic`. This is not a clean audit; pnpm counts advisories differently from npm's affected-package totals in earlier audits. Resolving those upstream dependencies remains separate release work.

Docker is unavailable locally. Both container recipes are migrated, but image builds and hosted deployment/CI require external validation.
