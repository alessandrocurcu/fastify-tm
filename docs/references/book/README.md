# Accelerating Server-Side Development with Fastify — Note aggiornate

> Fonte: libro del 2023 (Fastify v3/v4, Node 18, CommonJS)
> Aggiornato a: **Fastify v5** — Node.js ≥ 24 — ESM + TypeScript (type stripping) — pnpm

Ogni file aggiorna i concetti del capitolo originale eliminando il codice obsoleto, aggiungendo le breaking change di v5 e allineando gli esempi al setup di questo template.

---

## Capitoli

| # | File | Argomento |
|---|---|---|
| 1 | [01-introduction.md](./01-introduction.md) | Componenti core, server options, lifecycle, route, graceful shutdown |
| 2 | [02-plugin-system.md](./02-plugin-system.md) | Plugin, encapsulation, `fastify-plugin`, boot sequence, TypeScript augmentation |
| 3 | [03-routes.md](./03-routes.md) | Route options, handler, error handling, constraints, AOP con `onRoute` |
| 4 | [04-hooks.md](./04-hooks.md) | Application hooks, request/reply lifecycle hooks, early exit, `onRegister` |
| 5 | [05-validation-serialization.md](./05-validation-serialization.md) | Zod + type provider, schema per route, serializzazione, TypeBox come alternativa |
| 6 | [06-project-structure.md](./06-project-structure.md) | Struttura progetto, `@fastify/autoload`, configurazione env, Swagger, CORS, Docker |
| 7 | [07-restful-api.md](./07-restful-api.md) | API CRUD, schema Zod per route, autohooks, pattern DRY con decorator |
| 8 | [08-auth-and-files.md](./08-auth-and-files.md) | JWT, autenticazione/autorizzazione, rate limiting, upload/download CSV |

---

## Riferimenti rapidi

- Documentazione Fastify offline → [`../fastify-toc.md`](../fastify-toc.md)
- Progetto di riferimento ufficiale → [`../../demo/`](../../demo/)
- Best practices AI skill → [`.claude/skills/fastify-best-practices/`](../../../.claude/skills/fastify-best-practices/)
