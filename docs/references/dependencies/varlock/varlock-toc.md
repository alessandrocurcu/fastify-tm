# Varlock — Table of Contents

Reference documentation for [Varlock](https://varlock.dev), the schema-driven environment variable manager used in this project.

## Getting Started

- [Installation](./Installation.md) — how to install Varlock as a package dependency or standalone binary
- [Usage](./Usage-varlock.md) — basic workflow: `varlock init`, `varlock load`, and injecting env vars into the app
- [Migration from dotenv](./Migration-varlock.md) — how to migrate an existing dotenv setup to Varlock

## Core Concepts

- [Schema](./Schema-varlock.md) — defining `.env.schema` with decorators, defaults, and validation rules
- [Environments](./Environments.md) — per-environment configuration via env-specific files and functions
- [Secrets Management](./Secrets-management.md) — `@sensitive` decorator, guardrails, and how Varlock handles secret values
- [Local Encryption](./Local-encryption.md) — encrypting local secrets (`.env.local`) tied to the current device

## Integration

- [JavaScript / Node.js](./JavaScript-Node.js.md) — integrating Varlock into a Node.js application

## Reference
- [CLI Commands](./cli-commands.md) — command-line interface for managing environment variables and secrets
- [Root Decorators](./root-decorators.md) — decorators globali nel header del file (es. `@defaultRequired`, `@generateTypes`, `@currentEnv`)
- [Item Decorators](./item-decorators.md) — decoratori per singola variabile (es. `@required`, `@sensitive`, `@type`)
- [Data Types](./data-types.md) — tipi disponibili per `@type`: `string`, `number`, `boolean`, `enum`, `url`, `port`, `duration` e altri
- [Resolver Functions](./resolver-functions.md) — funzioni per valori dinamici (es. `exec()`, `ref()`, `forEnv()`, `fallback()`)
- [Built in variables](./built-in-variables.md) — variabili built-in iniettate automaticamente da Varlock

## Wrapping Up

- [Next Steps](./Wrapping-up.md) — improving DX and security posture after the initial migration
