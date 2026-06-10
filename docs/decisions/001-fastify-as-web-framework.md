# ADR-001: Use Fastify as Web Framework

## Status
Accepted

## Date
2026-06-10

## Context
This project is a Node.js HTTP server template written in TypeScript. We need a web framework that:

- Is performant enough to serve as a production template without hitting framework-imposed ceilings
- Has a plugin system that keeps the core small while allowing extension (auth, rate-limiting, sensible defaults, etc.)
- Is actively maintained and compatible with Node.js ESM

## Decision
Use **Fastify v5** with `@fastify/type-provider-zod` for schema validation and `@fastify/sensible` for sane HTTP defaults.

Key integration points already in use:

- `setValidatorCompiler` / `setSerializerCompiler` from `@fastify/type-provider-zod` wire Zod schemas directly into Fastify's request validation and response serialization pipeline, with full type inference on `request.params`, `request.body`, and reply types.
- Routes are defined as `FastifyPluginAsyncZod` — a typed plugin factory that carries the Zod provider through the plugin scope.
- `@fastify/sensible` adds standard HTTP error helpers (`reply.notFound()`, etc.) without custom middleware.

## Consequences

**Positive:**
- `close-with-grace` pairs naturally with Fastify's `app.close()` for graceful shutdown on SIGTERM/SIGINT

**Trade-offs:**
- `@fastify/type-provider-zod` is a thin adapter; breaking changes in either Fastify or Zod may require coordinated upgrades
- Fastify v5 dropped support for Node.js < 20; the `engines` field in `package.json` enforces Node.js ≥ 22 to stay within the supported range
