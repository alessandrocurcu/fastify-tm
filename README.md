# fastify-template

Template per costruire server HTTP con [Fastify](https://fastify.dev) e TypeScript.

## Cosa contiene

### `docs/demo/` — Progetto di riferimento ufficiale

Copia del [fastify/demo](https://github.com/fastify/demo) — il progetto d'esempio mantenuto dai core maintainers di Fastify. È un'API REST per la gestione di task con:

- autenticazione con cookie e `@fastify/jwt`
- upload di file e download CSV
- ruoli e permessi (RBAC)
- MySQL con migrations e seed
- test end-to-end con `fastify.inject()`
- Swagger UI su `/api/docs`

Usalo come riferimento concreto di architettura e best practices Fastify in produzione.

### `docs/references/` — Documentazione offline

Copia locale della documentazione ufficiale Fastify (Reference + Guides), con link interni risolti in markdown.

→ Punto d'ingresso: [`docs/references/fastify-toc.md`](docs/references/fastify-toc.md)

### `docs/references/book/` — Note dal libro (aggiornate a v5)

Note aggiornate tratte da *Accelerating Server-Side Development with Fastify* (2023). Il libro usa Fastify v3/v4, Node 18 e CommonJS — ogni capitolo è stato riscritto per Fastify v5, Node ≥ 24, ESM e TypeScript con type stripping.

→ Punto d'ingresso: [`docs/references/book/README.md`](docs/references/book/README.md)

### `.agents/skills/fastify-best-practices/` — AI skill

Skill per Claude Code che inietta best practices Fastify nel contesto dell'AI durante lo sviluppo: plugin, route, validazione con JSON Schema, error handling, hooks, testing, logging, deployment e altro.

## Usarlo come template

```bash
pnpm dlx degit alessandrocurcu/fastify-template nome-nuovo-progetto
cd nome-nuovo-progetto
pnpm install
```

## Runtime

Node.js ≥ 24 con [type stripping nativo](docs/typescript.md) — niente compilazione, niente `tsx`.

```bash
node src/index.ts
```

**Vincoli** da rispettare:

- Usa `import type` per importare solo tipi
- No `enum` → usa `const` object + `as const`
- No `namespace`
- No constructor parameter properties (`constructor(public name: string)`)

## Circa la regola eslint erasableSyntaxOnly introdotta in TypeScript 5.8
erasableSyntaxOnly: true va aggiunto atsconfig.json. Questo template usa usa Node.js 24 con type stripping nativo — che supporta solo sintassi erasable. Senza questa flag, TypeScript non ti avverte se usi enum, namespace o constructor parameter properties, e il codice si rompe a runtime silenziosamente.

## Comandi

```bash
pnpm start       # avvia src/index.ts
pnpm dev         # avvia src/index.ts in watch mode
pnpm test        # vitest
pnpm lint        # eslint
pnpm lint:fix     # eslint --fix
```
