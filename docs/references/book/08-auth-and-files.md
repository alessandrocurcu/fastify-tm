# Cap. 8 — Autenticazione, Autorizzazione e File

> **Libro:** *Accelerating Server-Side Development with Fastify* (2023, Fastify v3/v4, Node 18, CommonJS)
> **Aggiornato a:** Fastify v5 — Node.js ≥ 24 — ESM + TypeScript (type stripping) — pnpm

---

## Flusso autenticazione / autorizzazione

**Autenticazione** = chi può accedere al servizio.
**Autorizzazione** = cosa può fare l'utente autenticato.

Flusso JWT in 7 passi:

1. Il client invia username e password a `POST /authenticate`
2. Il server verifica le credenziali e crea un JWT firmato con il secret
3. Il server restituisce il token al client
4. Il client salva il token (header `Authorization: Bearer <token>`)
5. Ogni richiesta successiva porta il token nell'header
6. Il server verifica la firma e decodifica il payload
7. Il layer di autorizzazione controlla i permessi e risponde

---

## Plugin di autenticazione

```bash
pnpm add @fastify/jwt
```

Crea `plugins/auth.ts`:

```ts
import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import type { FastifyRequest, FastifyReply } from 'fastify'

// augmentation per @fastify/jwt — definisce la forma di request.user
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; username: string; jti: string }
    user:    { id: string; username: string; jti: string }
  }
}

// augmentation per i decorator aggiunti da questo plugin
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
  interface FastifyRequest {
    generateToken: () => Promise<string>
    revokeToken: () => void
  }
}

export default fp(async function authPlugin(fastify) {
  // store in-memory dei token revocati — vedi ⚠️ sotto
  const revokedTokens = new Map<string, true>()

  await fastify.register(fastifyJwt, {
    secret: fastify.config.JWT_SECRET,
    trusted(_request, decodedToken) {
      return !revokedTokens.has(decodedToken.jti)
    }
  })

  // decorator sull'istanza: verifica il token e popola request.user
  fastify.decorate('authenticate', async function authenticate(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.send(err)
    }
  })

  // decorator sulla request: revoca il token corrente
  fastify.decorateRequest('revokeToken', function (this: FastifyRequest) {
    revokedTokens.set(this.user.jti, true)
  })

  // decorator sulla request: genera un nuovo token dal user corrente
  fastify.decorateRequest('generateToken', async function (this: FastifyRequest) {
    return fastify.jwt.sign(
      { id: this.user.id, username: this.user.username },
      { jti: String(Date.now()), expiresIn: fastify.config.JWT_EXPIRE_IN }
    )
  })
}, {
  name: 'authentication-plugin',
  dependencies: ['env-config']
})
```

### ⚠️ `revokedTokens` in-memory — limite di produzione

La `Map` in memoria non sopravvive ai riavvii e non funziona in setup multi-istanza (load balancer, cluster). In produzione usa **Redis** con una chiave TTL pari all'expire del token:

```ts
// esempio con ioredis
await redis.set(`revoked:${jti}`, '1', 'EX', jwtExpireSeconds)
const isRevoked = await redis.exists(`revoked:${jti}`)
```

### Configurazione `.env` aggiuntiva

```bash
JWT_SECRET=almeno-32-caratteri-casuali-e-sicuri
JWT_EXPIRE_IN=1d
```

Aggiungere al JSON schema di `@fastify/env`:
```ts
JWT_SECRET:    { type: 'string' },
JWT_EXPIRE_IN: { type: 'string', default: '1d' }
```

---

## Route di autenticazione

`routes/auth/routes.ts` — prefisso root, non `/auth/`:

```ts
import fp from 'fastify-plugin'
import { generateHash, verifyHash } from './generate-hash.ts'

// ⚠️ ESM: named export per sovrascrivere il prefisso autoload
export const prefixOverride = ''

export default fp(
  async function applicationAuth(fastify) {
    // ... route definite sotto
  },
  {
    name: 'auth-routes',
    dependencies: ['authentication-plugin'],
    encapsulate: true   // usa fp solo per name/dependencies, mantiene l'encapsulation
  }
)
```

`encapsulate: true` in `fastify-plugin` v3+: consente di usare `name` e `dependencies` senza rompere l'encapsulation del plugin. Utile per route che non devono esporre i propri decorator al parent.

### ⚠️ `module.exports.prefixOverride` → named ESM export

```ts
// ❌ CommonJS (libro)
module.exports.prefixOverride = ''
module.exports = fp(...)

// ✅ ESM — entrambi gli export coesistono
export const prefixOverride = ''
export default fp(...)
```

### `POST /register`

```ts
fastify.post('/register', {
  schema: {
    body: RegisterBodySchema   // { username: string, password: string }
  },
  handler: async function registerHandler(request, reply) {
    const existing = await this.usersDataSource.readUser(request.body.username)
    if (existing) {
      const err = Object.assign(new Error('User already registered'), { statusCode: 409 })
      throw err
    }
    const { hash, salt } = await generateHash(request.body.password)
    await this.usersDataSource.createUser({
      username: request.body.username,
      hash,
      salt
    })
    reply.code(201)
    return { registered: true }
  }
})
```

### ⚠️ Password hashing — non usare SHA/MD5

Il libro delega a un modulo `generate-hash` personalizzato. Usa una libreria dedicata:

```bash
pnpm add argon2   # raccomandato
```

```ts
import { hash, verify } from 'argon2'

export async function generateHash(password: string) {
  const hashed = await hash(password)   // include il salt internamente
  return { hash: hashed, salt: '' }     // argon2 gestisce il salt nel hash
}

export async function verifyHash(password: string, storedHash: string) {
  return verify(storedHash, password)
}
```

`argon2` (vincitore di Password Hashing Competition 2015) è superiore a `bcrypt` per resistenza agli attacchi GPU e hash paralleli.

### `POST /authenticate`

```ts
fastify.post('/authenticate', {
  schema: {
    body: RegisterBodySchema,
    response: { 200: TokenResponseSchema }
  },
  handler: async function authenticateHandler(request, reply) {
    const user = await this.usersDataSource.readUser(request.body.username)
    if (!user) {
      // ⚠️ 401 e non 404: evita di rivelare quali utenti esistono
      throw Object.assign(new Error('Wrong credentials provided'), { statusCode: 401 })
    }
    const valid = await verifyHash(request.body.password, user.hash)
    if (!valid) {
      throw Object.assign(new Error('Wrong credentials provided'), { statusCode: 401 })
    }
    request.user = { id: String(user._id), username: user.username, jti: '' }
    return refreshHandler(request, reply)
  }
})
```

### `POST /refresh`

```ts
fastify.post('/refresh', {
  onRequest: fastify.authenticate,   // protetto: richiede token valido
  schema: {
    headers: TokenHeaderSchema,
    response: { 200: TokenResponseSchema }
  },
  handler: refreshHandler
})

async function refreshHandler(request: FastifyRequest, reply: FastifyReply) {
  const token = await request.generateToken()
  return { token }
}
```

### `GET /me`

```ts
fastify.get('/me', {
  onRequest: fastify.authenticate,
  handler: async function meHandler(request) {
    return this.usersDataSource.readUser(request.user.username)
  }
})
```

### `POST /logout`

```ts
fastify.post('/logout', {
  onRequest: fastify.authenticate,
  handler: async function logoutHandler(request, reply) {
    request.revokeToken()   // aggiunge jti alla Map dei revocati
    reply.code(204)
  }
})
```

---

## Rate limiting sugli endpoint auth

> **Critico in produzione.** Senza rate limiting, un attaccante può fare brute force sulle credenziali o saturare il server con richieste di registrazione.

```bash
pnpm add @fastify/rate-limit ioredis
```

### Configurazione

`plugins/rate-limit.ts`:

```ts
import fp from 'fastify-plugin'
import fastifyRateLimit from '@fastify/rate-limit'
import { Redis } from 'ioredis'

export default fp(async function rateLimitPlugin(fastify) {
  const redis = new Redis(fastify.config.REDIS_URL)

  // rate limit globale — permissivo, protegge contro burst
  await fastify.register(fastifyRateLimit, {
    global: true,
    max: 100,
    timeWindow: '1 minute',
    redis,                    // ← backend Redis: sopravvive ai riavvii, condiviso tra istanze
    keyGenerator: (request) => request.ip
  })
}, { dependencies: ['env-config'] })
```

### Rate limit stretto sugli endpoint auth

Nelle route auth, sovrascrive il limite globale con uno molto più restrittivo:

```ts
fastify.post('/authenticate', {
  config: {
    rateLimit: {
      max: 5,              // solo 5 tentativi
      timeWindow: '1 minute',
      errorResponseBuilder: () => ({
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Troppi tentativi. Riprova tra 1 minuto.'
      })
    }
  },
  // ... handler
})

fastify.post('/register', {
  config: {
    rateLimit: { max: 3, timeWindow: '1 minute' }
  },
  // ...
})
```

### ⚠️ Rate limiting in-memory non è sufficiente

| | In-memory | Redis |
|---|---|---|
| Sopravvive al riavvio | ❌ | ✅ |
| Condiviso tra istanze | ❌ | ✅ |
| Adatto a deployment multi-istanza | ❌ | ✅ |
| Setup | Zero | Richiede Redis |

Un backend in-memory in un deployment con 3 istanze vuol dire che ogni istanza conta separatamente: un attaccante ottiene 3× il limite configurato.

Aggiungere `REDIS_URL` alla configurazione `.env` e allo schema di validazione:

```bash
REDIS_URL=redis://localhost:6379
```

---

## Layer di autorizzazione sulle route todo

### Proteggere tutte le route con `onRequest`

`routes/todos/routes.ts` — una riga aggiunta:

```ts
const todoRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate)  // ← protegge tutte le route del plugin
  // ... route dal cap. 7
}
```

`fastify.authenticate` è definito nel plugin `auth.ts` con `fastify-plugin`, quindi è visibile in ogni contesto figlio.

### Data source con `userId` — autorizzazione a livello dati

Il problema: senza filtro per utente, ogni utente autenticato può leggere e modificare i task degli altri.

Soluzione: spostare il data source dal decorator sull'**istanza** al decorator sulla **request**, così ha accesso a `request.user`:

```ts
// routes/todos/hooks.ts
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyRequest {
    todosDataSource: TodosDataSource | null
  }
}

export default fp(async function todoHooks(fastify) {
  const todos = fastify.mongo.db.collection('todos')

  // decorateRequest con null → ottimizzazione: Fastify conosce la proprietà a compile time
  fastify.decorateRequest('todosDataSource', null)

  fastify.addHook('onRequest', async function (request) {
    // questo hook viene eseguito DOPO fastify.authenticate → request.user è già disponibile
    request.todosDataSource = {
      async listTodos({ filter = {}, skip = 0, limit = 50 } = {}) {
        const query = { ...filter, userId: request.user.id }  // ← filtra per utente
        if (query.title) query.title = new RegExp(query.title as string, 'i')
        return todos.find(query, { skip, limit, projection: { _id: 0 } }).toArray()
      },

      async createTodo(title: string) {
        const _id = new fastify.mongo.ObjectId()
        const now = new Date()
        const { insertedId } = await todos.insertOne({
          _id, id: _id,
          userId: request.user.id,   // ← aggiunge userId al documento
          title,
          done: false,
          createdAt: now,
          modifiedAt: now
        })
        return insertedId.toString()
      },

      async updateTodo(id: string, patch: object) {
        const res = await todos.updateOne(
          { _id: new fastify.mongo.ObjectId(id), userId: request.user.id },  // ← doppio filtro
          { $set: { ...patch, modifiedAt: new Date() } }
        )
        return res.modifiedCount > 0
      },

      async deleteTodo(id: string) {
        const res = await todos.deleteOne({
          _id: new fastify.mongo.ObjectId(id),
          userId: request.user.id   // ← impedisce di eliminare task altrui
        })
        return res.deletedCount > 0
      }
    }
  })
})
```

**Perché `decorateRequest` con `null`?** Fastify ottimizza l'allocazione degli oggetti request se conosce in anticipo le proprietà che verranno aggiunte. Dichiarare il decorator con valore iniziale `null` è sufficiente per attivare questa ottimizzazione.

---

## Upload file CSV

```bash
pnpm add @fastify/multipart csv-parse
```

`routes/todos/files/routes.ts`:

```ts
import fastifyMultipart from '@fastify/multipart'
import { parse as csvParse } from 'csv-parse'
import type { FastifyPluginAsync } from 'fastify'

const filesRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', fastify.authenticate)

  await fastify.register(fastifyMultipart, {
    attachFieldsToBody: 'keyValues',  // body.todoListFile → array di oggetti
    async onFile(part) {
      const lines: Array<{ title: string; done: boolean }> = []

      const stream = part.file.pipe(
        csvParse({
          bom: true,
          skip_empty_lines: true,
          trim: true,
          columns: true   // usa la prima riga come chiavi
        })
      )

      for await (const line of stream) {
        lines.push({
          title: String(line.title),
          done: line.done === 'true'
        })
      }

      part.value = lines   // disponibile come request.body.todoListFile
    },
    limits: {
      fileSize: 1_000_000,   // 1 MB
      files: 1
    }
  })

  fastify.post('/import', {
    handler: async function importHandler(request, reply) {
      const items = (request.body as { todoListFile: Array<{ title: string }> }).todoListFile
      const inserted = await Promise.all(
        items.map(item => request.todosDataSource!.createTodo(item.title))
      )
      reply.code(201)
      return { count: inserted.length }
    }
  })
}

export default filesRoutes
```

---

## Download file CSV

```bash
pnpm add csv-stringify
```

```ts
import { stringify as csvStringify } from 'csv-stringify'

fastify.get('/export', {
  schema: {
    querystring: ExportQuerySchema   // { title?: string }
  },
  handler: async function exportHandler(request, reply) {
    const { title } = request.query as { title?: string }

    // recupera come stream — evita di caricare tutto in memoria
    const cursor = todos
      .find(
        { userId: request.user.id, ...(title ? { title: new RegExp(title, 'i') } : {}) },
        { projection: { _id: 0 } }
      )
      .stream()

    reply.header('Content-Disposition', 'attachment; filename="todo-list.csv"')
    reply.type('text/csv')

    // Fastify accetta uno Stream come valore di ritorno dal handler
    return cursor.pipe(
      csvStringify({
        header: true,
        columns: ['title', 'done', 'createdAt', 'modifiedAt', 'id'],
        quoted_string: true,
        cast: {
          boolean: (v) => (v ? 'true' : 'false'),
          date: (v) => v.toISOString()
        }
      })
    )
  }
})
```

**Perché lo stream?** Se la lista è grande (migliaia di item), caricare tutto in memoria prima di serializzare causa picchi di RAM. Pipe diretto da MongoDB cursor a `csv-stringify` a Fastify reply → flusso costante, overhead O(1).

---

## Riepilogo struttura aggiunta

```
plugins/
└── auth.ts                    # @fastify/jwt + decorator authenticate/generateToken/revokeToken

routes/
├── auth/
│   ├── hooks.ts               # usersDataSource decorator
│   ├── routes.ts              # /register /authenticate /refresh /me /logout
│   └── generate-hash.ts      # argon2 wrapper
└── todos/
    ├── hooks.ts               # todosDataSource (ora sulla request, con userId)
    ├── routes.ts              # +onRequest: fastify.authenticate
    └── files/
        └── routes.ts          # POST /import  GET /export
```

Riferimenti: [`../fastify-docs/Decorators.md`](../fastify-docs/Decorators.md), [`../fastify-docs/Hooks-Fastify.md`](../fastify-docs/Hooks-Fastify.md)
