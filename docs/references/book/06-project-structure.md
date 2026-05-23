# Cap. 6 — Struttura del progetto e gestione della configurazione

> **Libro:** *Accelerating Server-Side Development with Fastify* (2023, Fastify v3/v4, Node 18, CommonJS)
> **Aggiornato a:** Fastify v5 — Node.js ≥ 24 — ESM + TypeScript (type stripping) — pnpm

---

## Struttura raccomandata

```
src/
├── index.ts          # bootstrap: crea l'istanza, registra app.ts, avvia listen
├── app.ts            # plugin root: carica plugins/, schemas/, routes/
├── plugins/          # plugin fp() — condivisi su tutto il server
├── schemas/          # JSON schema / Zod schema — caricati prima delle route
├── routes/           # endpoint — caricati dopo plugins/ e schemas/
└── configs/          # configurazione centralizzata (env, server options)
test/
```

**Ordine di caricamento** (critico): `schemas/` → `plugins/` → `routes/`.
Invertire questo ordine porta a errori di runtime ("decorator not found").

---

## Bootstrap: `src/index.ts`

Il libro delega bootstrap e graceful shutdown a **fastify-cli**. Senza fastify-cli, gestiamo noi con `close-with-grace` (già in `dependencies`):

```ts
import Fastify from 'fastify'
import closeWithGrace from 'close-with-grace'
import app from './app.ts'

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
    transport: process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty' }
      : undefined,
    // redact: evita che segreti finiscano nei log in chiaro
    redact: ['req.headers.authorization', '*.password', '*.secret', '*.token']
  }
})

await server.register(app)

closeWithGrace({ delay: 10_000 }, async ({ signal, err }) => {
  if (err) server.log.error({ err }, 'shutdown error')
  else server.log.info({ signal }, 'graceful shutdown')
  await server.close()
})

await server.listen({
  port: Number(process.env.PORT ?? 3000),
  host: '0.0.0.0'   // necessario per Docker e ambienti cloud
})
```

---

## Plugin root: `src/app.ts`

`app.ts` esporta un plugin standard (non istanzia Fastify, non chiama `listen`). Viene passato a `server.register()` in `index.ts`.

```ts
import type { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import AutoLoad from '@fastify/autoload'
import { join } from 'node:path'

const app: FastifyPluginAsync = async (fastify, opts) => {
  // 1. configurazione env — prima di tutto
  await fastify.register(import('./configs/env.ts'))

  // 2. schemas — prima delle route
  await fastify.register(AutoLoad, {
    dir: join(import.meta.dirname, 'schemas'),
    indexPattern: /^loader\.ts$/i
  })

  // 3. plugin condivisi
  fastify.register(AutoLoad, {
    dir: join(import.meta.dirname, 'plugins'),
    ignorePattern: /.*\.no-load\.ts/,
    indexPattern: /^no$/i,
    options: { ...opts }
  })

  // 4. route
  fastify.register(AutoLoad, {
    dir: join(import.meta.dirname, 'routes'),
    indexPattern: /.*routes(\.ts)$/i,
    ignorePattern: /.*\.ts/,
    autoHooksPattern: /.*hooks(\.ts)$/i,
    autoHooks: true,
    cascadeHooks: true,
    options: { ...opts }
  })
}

export default fp(app)
```

### ⚠️ `__dirname` non esiste in ESM — usa `import.meta.dirname`

```ts
// ❌ CommonJS — non funziona con "type": "module"
path.join(__dirname, 'plugins')

// ✅ ESM — disponibile da Node.js 21.2 (incluso in Node ≥ 24)
import.meta.dirname
```

### ⚠️ `module.exports` → `export default`

```ts
// ❌ libro (CommonJS)
module.exports = async function (fastify, opts) { ... }
module.exports.options = { ... }

// ✅ ESM + TypeScript
export default async function (fastify: FastifyInstance, opts: unknown) { ... }
```

---

## `@fastify/autoload`

```bash
pnpm add @fastify/autoload
```

Carica automaticamente i file in una directory e li registra come plugin.

### Configurazione `plugins/`

| Opzione | Valore | Effetto |
|---|---|---|
| `ignorePattern` | `/.*\.no-load\.ts/` | Non carica file che finiscono in `.no-load.ts` — utile per helper non autoloadati |
| `indexPattern` | `/^no$/i` | Disabilita il comportamento di default che carica solo `index.ts` se presente |
| `options` | `{ ...opts }` | Passa la stessa configurazione a tutti i plugin |

### Configurazione `routes/`

| Opzione | Valore | Effetto |
|---|---|---|
| `indexPattern` | `/.*routes\.ts$/i` | Carica solo file che finiscono in `routes.ts` |
| `ignorePattern` | `/.*\.ts/` | Ignora tutti gli altri `.ts` (utility, types, ecc.) |
| `autoHooks` | `true` | Registra automaticamente un `hooks.ts` accanto a ogni `routes.ts` |
| `cascadeHooks` | `true` | I hook del parent si propagano alle sottocartelle |

### Esempio `autoHooks` con `cascadeHooks`

```
routes/
└─┬ users/
  ├── routes.ts       ← endpoint utenti
  ├── hooks.ts        ← hook auth (onRequest) — si applica a users/ e games/
  └─┬ games/
    └── routes.ts     ← endpoint giochi — eredita hooks.ts del parent
```

Se `cascadeHooks: false`, i hook si applicano solo a `users/routes.ts`.

---

## Gestione della configurazione

### `@fastify/env` — validazione variabili d'ambiente

```bash
pnpm add @fastify/env
```

Crea `src/configs/env.ts`:

```ts
import fp from 'fastify-plugin'
import fastifyEnv from '@fastify/env'

const schema = {
  type: 'object',
  required: ['DATABASE_URL'],
  properties: {
    NODE_ENV: { type: 'string', default: 'development' },
    PORT: { type: 'integer', default: 3000 },
    LOG_LEVEL: { type: 'string', default: 'info' },
    DATABASE_URL: { type: 'string' }
  }
} as const

export default fp(async function envPlugin(fastify) {
  await fastify.register(fastifyEnv, {
    confKey: 'config',   // accessibile come fastify.config
    schema,
    dotenv: true         // legge il file .env automaticamente
  })
}, { name: 'env-config' })

// augmentation TypeScript
declare module 'fastify' {
  interface FastifyInstance {
    config: {
      NODE_ENV: string
      PORT: number
      LOG_LEVEL: string
      DATABASE_URL: string
    }
  }
}
```

### Alternativa: validazione con Zod (già in `dependencies`)

Se il progetto usa già `zod` e `@fastify/type-provider-zod`:

```ts
import { z } from 'zod/v4'

const EnvSchema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string()
})

const env = EnvSchema.parse(process.env)
// env è typed, ma non è un decorator Fastify — meno integrabile con i plugin
```

`@fastify/env` è preferibile: lancia un errore a startup con messaggio chiaro, integra il decorator `fastify.config` e funziona con le dipendenze tra plugin.

### `.env` e sicurezza

> **Feature flag vs `NODE_ENV`:** la regola della skill (`configuration.md`) sconsiglia di fare branch su `NODE_ENV` — preferire variabili esplicite come `ENABLE_SWAGGER=true`, `PRETTY_LOGS=true`. Il vantaggio: puoi attivare un comportamento in qualsiasi ambiente senza cambiare il codice; lo svantaggio è un `.env` leggermente più lungo. Entrambi gli approcci funzionano — la differenza è di disciplina operativa.

```bash
# .env          — NON committare mai, aggiungere a .gitignore e .dockerignore
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://localhost:5432/mydb

# .env.sample   — committare, senza valori segreti
NODE_ENV=
PORT=3000
DATABASE_URL=          # esempio: postgres://host:5432/dbname
```

### Dipendenze tra plugin con `fp`

Il libro usa `dependencies` per garantire l'ordine di caricamento:

```ts
// plugins/database.ts
export default fp(async function (fastify) {
  // fastify.config è già disponibile perché 'env-config' è già caricato
  await fastify.register(someDbPlugin, {
    url: fastify.config.DATABASE_URL
  })
}, {
  name: 'database',
  dependencies: ['env-config']  // garantisce l'ordine
})
```

---

## Error handler

Crea `plugins/error-handler.ts`:

```ts
import fp from 'fastify-plugin'

export default fp(function errorHandler(fastify) {
  fastify.setErrorHandler((err, req, reply) => {
    if (reply.statusCode >= 500) {
      req.log.error({ err }, err.message)
      // non esporre dettagli interni in produzione
      reply.send(`Internal error. Support ID: ${req.id}`)
      return
    }
    req.log.info({ err }, err.message)
    reply.send(err)
  })
})
```

**Perché usare `req.log` e non `fastify.log`?** `req.log` include automaticamente `reqId` in ogni log, rendendo tracciabile ogni errore alla sua richiesta originale.

---

## Swagger / OpenAPI

```bash
pnpm add @fastify/swagger @fastify/swagger-ui
```

Crea `plugins/swagger.ts`:

```ts
import fp from 'fastify-plugin'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const pkg = JSON.parse(
  readFileSync(join(import.meta.dirname, '../../package.json'), 'utf8')
)

export default fp(async function swaggerPlugin(fastify) {
  await fastify.register(fastifySwagger, {
    openapi: {                    // ⚠️ il libro usa "swagger:" (OAS 2.0) — preferire openapi: (OAS 3.0)
      info: {
        title: 'My API',
        description: 'API documentation',
        version: pkg.version
      }
    }
  })

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list' }
  })
}, { dependencies: ['env-config'] })
```

### ⚠️ `swagger:` → `openapi:` in v5

Il libro usa la chiave `swagger` (OAS 2.0). Da `@fastify/swagger` v8+, la chiave raccomandata è `openapi` (OAS 3.0). La chiave `swagger` è ancora supportata ma deprecata.

Swagger UI è disponibile su `http://localhost:3000/docs`. In produzione, proteggi la rotta con un hook di autenticazione anziché nasconderla condizionalmente.

---

## CORS

```bash
pnpm add @fastify/cors
```

Crea `plugins/cors.ts`:

```ts
import fp from 'fastify-plugin'
import fastifyCors from '@fastify/cors'

export default fp(async function corsPlugin(fastify) {
  await fastify.register(fastifyCors, {
    // origin: true  → accetta qualsiasi origine (solo per sviluppo)
    origin: fastify.config.NODE_ENV === 'production'
      ? ['https://mio-frontend.com']
      : true
  })
}, { dependencies: ['env-config'] })
```

### ⚠️ `fastify-cors` → `@fastify/cors`

Il libro usa il pacchetto `fastify-cors` (obsoleto). Il nome corretto è `@fastify/cors`.

---

## Linter

Il libro suggerisce `standard`. Questo template usa **ESLint con `@antfu/eslint-config`** (già configurato):

```bash
pnpm lint        # controlla
pnpm lint:fix    # corregge automaticamente
```

Non installare `standard` — conflitto con la config esistente.

---

## Dockerfile aggiornato

Il libro usa Node 18 e npm. Aggiornato a Node 24 e pnpm:

```dockerfile
FROM node:24-alpine AS builder
WORKDIR /build
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod

FROM node:24-alpine
RUN apk update && apk add --no-cache dumb-init
ENV HOME=/home/app
ENV APP_HOME=$HOME/node/
ENV NODE_ENV=production
WORKDIR $APP_HOME
COPY --chown=node:node . $APP_HOME
COPY --chown=node:node --from=builder /build/node_modules $APP_HOME/node_modules
USER node
EXPOSE 3000
ENTRYPOINT ["dumb-init"]
CMD ["node", "src/index.ts"]
```

`dumb-init` gestisce correttamente i segnali Unix (`SIGTERM`, `SIGINT`) nel container — necessario per il graceful shutdown.

---

## Debug con VS Code

Senza fastify-cli, avvia il server in modalità inspect manualmente:

```bash
node --inspect src/index.ts
```

Poi crea `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to Node",
      "type": "node",
      "request": "attach",
      "port": 9229
    }
  ]
}
```

Premi `F5` in VS Code per attaccare il debugger. Breakpoint e watch funzionano normalmente anche su file `.ts` grazie al source mapping implicito di Node 24 con type stripping.

---

## Riepilogo struttura finale

```
src/
├── index.ts              # bootstrap + close-with-grace
├── app.ts                # plugin root, registra autoload
├── configs/
│   └── env.ts            # @fastify/env — validazione .env
├── plugins/
│   ├── error-handler.ts  # setErrorHandler globale
│   ├── swagger.ts        # @fastify/swagger + swagger-ui
│   ├── cors.ts           # @fastify/cors
│   └── database.ts       # connessione DB (dipende da env-config)
├── schemas/
│   └── loader.ts         # addSchema() per tutti i JSON schema
└── routes/
    └── users/
        ├── routes.ts     # endpoint (autoloadati)
        └── hooks.ts      # hook (autoloadati con autoHooks)
.env                      # NON committare
.env.sample               # committare
```

Riferimenti: [`../fastify-docs/Plugins-Fastify.md`](../fastify-docs/Plugins-Fastify.md), [`../fastify-docs/Hooks-Fastify.md`](../fastify-docs/Hooks-Fastify.md), [`../fastify-docs/Encapsulation.md`](../fastify-docs/Encapsulation.md)
