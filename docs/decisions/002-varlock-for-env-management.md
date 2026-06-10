# ADR-002: Use Varlock for Environment Variable Management

## Status
Accepted

## Date
2026-06-10

## Context
The application needs to load, validate, and type environment variables at startup. The baseline approach — reading from `process.env` directly — has well-known failure modes:

- Missing variables are only discovered at runtime, often in production
- All values arrive as `string | undefined`; the app must coerce and validate them manually
- No central inventory of what variables the app depends on
- Sensitive and non-sensitive variables are indistinguishable without naming conventions (e.g. `NEXT_PUBLIC_` prefixes)
- `.env.example` files drift out of sync with the actual variable set

We also want TypeScript types for `process.env` fields (no more `process.env.FOO!` assertions) and the ability to encrypt local secrets at rest rather than storing them in plaintext `.env.local` files.

## Decision
Use **Varlock** (`varlock` npm package) to manage environment variables via a committed `.env.schema` file.

How it is used in this project:

- `.env.schema` is the single source of truth for every env var the app consumes; it is committed to version control
- Root decorators (`@defaultRequired=infer`, `@defaultSensitive=false`, `@generateTypes`) are declared in the schema header
- `@generateTypes(lang=ts, path=env.d.ts)` generates `env.d.ts` automatically, giving `process.env.LOG_LEVEL` a precise TypeScript type without manual declarations
- `@sensitive` marks secrets explicitly; Varlock then applies guardrails (redaction in logs, local encryption support)
- Local secrets can be encrypted at rest with `varlock(local:...)` — the key is device-bound and never committed

Reference documentation: [`docs/references/dependencies/varlock/varlock-toc.md`](../references/dependencies/varlock/varlock-toc.md)

## Alternatives Considered

### Plain `process.env` + manual validation (e.g. with Zod)
- Pros: zero dependencies, fully custom
- Cons: requires writing and maintaining a validation schema by hand; types must be kept in sync manually; no encryption support; `.env.example` still drifts
- Rejected: the schema and type-generation overhead is non-trivial to maintain correctly over time

### `dotenv` + `dotenv-safe`
- Pros: ubiquitous, minimal
- Cons: `dotenv-safe` only checks that keys from `.env.example` are present — no type coercion, no sensitivity tagging, no TypeScript generation; still requires manual Zod wrappers for type safety
- Rejected: solves presence-check only; does not address typing, coercion, or secrets handling

## Consequences
- `.env.schema` serves as the authoritative contract for all env vars — readable by humans, tooling, and AI agents
- `env.d.ts` is auto-generated; it must not be edited by hand and should be committed so editors and CI pick up the types without running the generator
- Adding a new env var requires updating `.env.schema` (and running Varlock to regenerate types) — slightly more friction than adding a line to `.env`, by design
- Varlock requires Node.js ≥ 22, which aligns with the `engines` constraint already set in `package.json`
