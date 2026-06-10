---
title: "Builtin variables"
site: "Varlock"
source: "https://varlock.dev/reference/builtin-variables/"
domain: "varlock.dev"
language: "en"
description: "Auto-detected VARLOCK_* variables for CI platform, branch, commit, and environment info"
word_count: 486
---

Varlock provides a set of **builtin `VARLOCK_*` variables** that are automatically populated with information about the current CI/deploy platform, git branch, commit, and inferred deployment environment. They are entirely **opt-in** — they only exist in your schema when you reference them.

## Usage

Builtin variables are activated when you reference them via `$VARLOCK_*` in a value expression:

```env-spec
# @currentEnv=$VARLOCK_ENV
# ---
BUILD_TAG="build-$VARLOCK_COMMIT_SHA_SHORT"
DB_URL=if(
  eq($VARLOCK_ENV, development),
  postgres://localhost/myapp,
  postgres://${VARLOCK_ENV}-db.example.com/myapp
)
```

If you want to include a builtin variable in your resolved env without referencing it from another item, just define it with an empty value — varlock will populate it automatically:

```env-spec
VARLOCK_BRANCH=
VARLOCK_COMMIT_SHA_SHORT=
```

You can also use `VARLOCK_ENV` as your environment flag with `@currentEnv`, which means you don’t need to create your own `APP_ENV` variable — Varlock will auto-detect the environment for you.

## Builtin Vars

### VARLOCK\_ENV

**Type:** `string` — one of `development`, `preview`, `staging`, `production`, `test`

The inferred deployment environment. Detection follows this priority:

1. **Test environment** — detected from `NODE_ENV=test`, `VITEST`, `JEST_WORKER_ID`, or `VITEST_POOL_ID`
2. **Platform-provided** — uses the platform’s own environment concept (e.g., Vercel’s `VERCEL_ENV`, Netlify’s `CONTEXT`)
3. **Branch inference** — in CI, infers from branch name: `main` / `master` / `production` / `prod` → `production`, `staging` / `stage` / `develop` / `dev` → `staging`, `qa` / `test` → `test`, anything else → `preview`
4. **CI fallback** — if in CI but no branch info is available, defaults to `preview`
5. **Local fallback** — if not in CI, defaults to `development`

#### Using with @currentEnv

```env-spec
# @currentEnv=$VARLOCK_ENV
# ---
DB_HOST=if(forEnv(production), "prod-db.example.com", "localhost")
DB_NAME=myapp
DB_URL="postgres://$DB_HOST/$DB_NAME"
```

#### Test environment caveat

### VARLOCK\_IS\_CI

**Type:** `boolean`

Whether the current process is running in a CI environment.

### VARLOCK\_BRANCH

**Type:** `string | undefined`

The current git branch name. In CI environments, sourced from the platform’s environment variables. When running locally (non-CI), auto-detected via `git branch --show-current`. Undefined if the branch cannot be determined (e.g., detached HEAD state, no git repo, or platform doesn’t expose branch info).

### VARLOCK\_PR\_NUMBER

**Type:** `string | undefined`

The pull/merge request number, if the current build is for a PR. Undefined otherwise.

### VARLOCK\_COMMIT\_SHA

**Type:** `string | undefined`

The full git commit SHA.

### VARLOCK\_COMMIT\_SHA\_SHORT

**Type:** `string | undefined`

The short (7-character) git commit SHA.

### VARLOCK\_PLATFORM

**Type:** `string | undefined`

The name of the detected CI/deploy platform (e.g., `"GitHub Actions"`, `"Vercel"`, `"Netlify CI"`).

### VARLOCK\_BUILD\_URL

**Type:** `url | undefined`

A URL linking to the current build or deploy in the CI platform’s UI.

### VARLOCK\_REPO

**Type:** `string | undefined`

The repository name in `owner/repo` format.

## Supported platforms

Detection is built-in for these platforms (no configuration required):

- GitHub Actions
- GitLab CI
- Vercel
- Netlify
- Cloudflare Pages / Workers
- AWS CodeBuild
- Azure Pipelines
- Bitbucket Pipelines
- Buildkite
- CircleCI
- Jenkins
- Render
- Travis CI
- and [many more](https://github.com/dmno-dev/varlock/tree/main/packages/ci-env-info/src/platforms.ts)

Not all platforms expose all fields. For example, some may not provide branch name or PR number.

CI/deploy platform detection is powered by [`@varlock/ci-env-info`](https://www.npmjs.com/package/@varlock/ci-env-info), which can also be used as a standalone package.