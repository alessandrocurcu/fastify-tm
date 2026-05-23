# Cap. 3 — Routes

> **Libro:** *Accelerating Server-Side Development with Fastify* (2023, Fastify v3)
> **Aggiornato a:** Fastify v5 — Node.js ≥ 24 — ESM + TypeScript (type stripping)

---

## Route options

Ogni route accetta un oggetto `routeOptions`. Le proprietà principali:

| Proprietà | Descrizione |
|---|---|
| `method` | HTTP method (`'GET'`, `'POST'`, ecc. — anche array) |
| `url` | Path dell'endpoint |
| `handler` | Funzione che gestisce la richiesta |
| `logLevel` | Log level per questa singola route |
| `logSerializer` | Serializer custom per i log della route |
| `bodyLimit` | Limite payload in byte — sovrascrive il valore globale |
| `constraints` | Condizioni aggiuntive per il routing (host, version, custom) |
| `errorHandler` | Error handler specifico per questa route |
| `config` | Dati custom accessibili in handler e hook via `request.routeOptions.config` |
| `prefixTrailingSlash` | Gestione dello slash finale durante la registrazione con prefix |
| `exposeHeadRoute` | Aggiunge automaticamente `HEAD` per ogni `GET` (default: `true`) |
| `handlerTimeout` | ⚠️ Novità v5 — timeout applicativo in ms per questa route |

Per le opzioni di validazione (`schema`, `validatorCompiler`, ecc.) vedi `05-validation.md`.

Gli hook del request lifecycle (`onRequest`, `preParsing`, `preValidation`, `preHandler`, `preSerialization`, `onSend`, `onResponse`) possono essere aggiunti direttamente all'oggetto `routeOptions`:

```ts
app.get('/path', {
  onRequest: async (request) => { /* solo per questa route */ },
  handler: async () => 'ok'
})
```

Riferimento: [`../fastify-docs/Routes-Fastify.md`](../fastify-docs/Routes-Fastify.md)

---

## Dichiarazione delle route

### Due forme equivalenti

```ts
// forma estesa — utile per automazione e route simili
app.route({
  method: 'GET',
  url: '/hello',
  handler: async () => 'world'
})

// shorthand — più leggibile per endpoint singoli
app.get('/hello', async () => 'world')

// shorthand con options
app.get('/hello', { handlerTimeout: 5_000 }, async () => 'world')
```

### Caricamento in bulk

La forma estesa permette di caricare route da array, utile quando le definizioni crescono:

```ts
// routes/cats.ts
import type { RouteOptions } from 'fastify'

const catRoutes: RouteOptions[] = [
  {
    method: 'POST',
    url: '/cat',
    handler: async (request) => request.body
  },
  {
    method: 'GET',
    url: '/cat/:id',
    handler: async (request) => ({ id: (request.params as { id: string }).id })
  }
]

export default catRoutes
```

```ts
// server.ts
import catRoutes from './routes/cats.ts'

for (const route of catRoutes) {
  app.route(route)
}
```

> Il libro usa CommonJS (`require`, `.cjs`). Con ESM + TypeScript si usa `import`/`export`.

---

## Handler: sincrono vs asincrono

### Async (preferito)

```ts
app.get('/data', async (request) => {
  const data1 = await readDb()
  const data2 = await readDb()
  return { data1, data2 }   // return invece di reply.send()
})
```

### Sync (callback style)

```ts
app.get('/data', function handler(request, reply) {
  readDb(function (err, data) {
    if (err) { reply.send(err); return }
    reply.send(data)
  })
})
```

Il libro mostra entrambi i casi. **Regola pratica:** usa sempre async. Il callback style è verboso, error-prone e difficile da leggere con più operazioni I/O asincrone.

### `reply` come thenable

Se in un handler async chiami `reply.send()` (es. perché stai riutilizzando codice legacy), devi restituire `reply` — altrimenti Fastify non sa che la risposta è stata delegata:

```ts
async function newHandler(request, reply) {
  if (request.body.type === 'legacy') {
    legacyHandler(request, reply)   // chiama reply.send() internamente
    return reply                    // ← obbligatorio
  }
  return { fresh: true }
}
```

`Reply` implementa l'interfaccia thenable (`.then()`): restituirlo è come restituire una Promise che si risolve quando `.send()` viene chiamato.

---

## Gestione degli errori

### Errori di default

```ts
// async — throw
app.get('/err', async () => {
  throw new Error('ops')  // → 500 Internal Server Error
})

// sync — reply.send(err)
app.get('/err', (request, reply) => {
  reply.send(new Error('ops'))
})
```

Output di default:

```json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "ops"
}
```

### Personalizzare l'errore inline

```ts
const err = new Error('risorsa non trovata')
err.statusCode = 404   // cambia HTTP status code e il campo "error"
throw err
// → { "statusCode": 404, "error": "Not Found", "message": "risorsa non trovata" }
```

Per errori HTTP comuni, usa `@fastify/sensible` (già in molti setup):

```ts
import sensible from '@fastify/sensible'
await app.register(sensible)

app.get('/protected', async (request) => {
  throw app.httpErrors.unauthorized('token mancante')
})
```

### `setErrorHandler` — error handler globale/per contesto

```ts
app.setErrorHandler(async function (error, request, reply) {
  request.log.error(error)
  reply.status(error.statusCode ?? 500)
  return { ok: false, message: error.message }
})
```

L'error handler è **incapsulato**: se registrato in un plugin, intercetta solo gli errori di quel contesto e dei suoi figli. Un errore non gestito risale al parent:

```ts
app.register(async (child) => {
  child.setErrorHandler(async function innerHandler(error, request, reply) {
    if (error.code === 'KNOWN_ERROR') {
      reply.code(400)
      return { handled: true }
    }
    throw error   // risale al parent error handler
  })

  child.get('/risky', async () => { throw new Error('ops') })
})
```

### Error handler per singola route

```ts
app.get('/route-error', {
  errorHandler: async (error, request, reply) => {
    request.log.error(error)
    return { routeFail: true }
  },
  handler: async () => { throw new Error('ops') }
})
```

### ⚠️ Breaking change v5: `request.context.config` rimosso

```ts
// ❌ v3/v4
request.context.config

// ✅ v5
request.routeOptions.config
```

---

## Routing

### 404 handler

```ts
app.setNotFoundHandler(function custom404(request, reply) {
  reply.code(404).send({ message: 'not found' })
})
```

Anche il 404 handler è incapsulato. Per avere handler diversi per contesti diversi, il plugin deve avere un `prefix`:

```ts
// ✅ prefix obbligatorio per 404 handler multipli
app.register(async (instance) => {
  instance.setNotFoundHandler((request, reply) => {
    reply.type('text/html').send('<h1>Pagina non trovata</h1>')
  })
}, { prefix: '/site' })

app.setNotFoundHandler((request, reply) => {
  reply.send({ error: 'API not found' })
})
```

- `GET /site/foo` → 404 HTML
- `GET /foo` → 404 JSON

Il 404 handler esegue i lifecycle hooks del suo contesto. Per sapere se un hook è stato triggerato da una 404:

```ts
app.addHook('onRequest', async (request) => {
  if (request.is404) return   // salta elaborazione non necessaria
  // ...
})
```

> **HTTP 405 Method Not Allowed:** Fastify non lo gestisce automaticamente. Se una route `GET /foo` esiste ma il client chiama `POST /foo`, Fastify risponde `404` (non `405`). Per implementare 405 bisogna registrare esplicitamente tutti i metodi sulla stessa URL e rispondere con il codice corretto.

### Trailing slash

```ts
const app = Fastify({ ignoreTrailingSlash: true })
// /foo e /foo/ → stesso handler
```

Fastify v5 aggiunge anche `ignoreDuplicateSlashes`:

```ts
const app = Fastify({
  ignoreTrailingSlash: true,
  ignoreDuplicateSlashes: true  // /foo//bar === /foo/bar
})
```

### URL case-insensitive

```ts
const app = Fastify({ caseSensitive: false })

app.get('/FOOBAR', async (request) => ({
  requestUrl: request.url,          // → '/FoObAr' (originale)
  routeUrl: request.routeOptions.url // → '/FOOBAR'
}))
```

> `request.routerPath` è rimosso in v5. Usa `request.routeOptions.url`.

### `rewriteUrl`

```ts
const app = Fastify({
  rewriteUrl(rawRequest) {
    if (rawRequest.url?.startsWith('/api')) return rawRequest.url
    return `/public${rawRequest.url}`
  }
})
```

`rawRequest` è `http.IncomingMessage`, non il `Request` Fastify. Per il logging usa `app.log`.

### Constraints

Permettono di registrare la stessa URL con handler diversi basandosi su header della request:

```ts
// senza constraint — fallback
app.get('/user', async () => ({ username: 'John' }))

// constraint version — obbligatorio: se il client manda accept-version, DEVE matchare
app.get('/user', {
  constraints: { version: '2.0.0' }
}, async () => ({ user: { name: 'John' } }))

// constraint host — non obbligatorio: se non matcha, usa il fallback senza constraint
app.get('/user', {
  constraints: { host: 'api.example.com' }
}, async () => ({ source: 'api subdomain' }))
```

Il client segnala la versione voluta con l'header `accept-version` (supporta SemVer range):

```sh
curl -H "accept-version: 2.x" http://localhost:3000/user
```

Riferimento: [`../fastify-docs/Routes-Fastify.md#constraints`](../fastify-docs/Routes-Fastify.md#constraints)

---

## Input del client

### Path parameters

```ts
app.get('/:userId/pets/:petId', async (request) => {
  const { userId, petId } = request.params as { userId: string; petId: string }
  return { userId, petId }
})
```

Lunghezza massima dei parametri (default 100 caratteri, globale):

```ts
const app = Fastify({ maxParamLength: 40 })
// superato il limite → 404
```

### Query string

```ts
// GET /search?q=cats&page=2
app.get('/search', async (request) => {
  const { q, page } = request.query as { q: string; page: string }
  return { q, page }
})
```

Per query string annidate (`foo.bar=42` → `{ foo: { bar: '42' } }`) installa `qs` e configura:

```ts
import qs from 'qs'

const app = Fastify({
  querystringParser: (str) => qs.parse(str, { allowDots: true })
})
```

### Headers

```ts
app.get('/check', async (request) => {
  // Node.js lowercasa sempre le chiavi degli header
  const token = request.headers['x-api-key']
  return { token }
})
```

Per gli header originali non normalizzati: `request.raw.rawHeaders`.

### Body

Fastify parsa automaticamente `application/json` (→ oggetto) e `text/plain` (→ stringa).

```ts
app.post('/submit', async (request) => {
  const body = request.body as { name: string }
  return { received: body.name }
})
```

Limite payload (default 1 MiB):

```ts
const app = Fastify({ bodyLimit: 256 * 1024 })  // 256 KB globale

app.post('/upload', {
  bodyLimit: 10 * 1024 * 1024   // 10 MB per questa route
}, async (request) => request.body)
```

**Best practice:** imposta il limite globale al minimo necessario e alzalo solo sulle route che richiedono payload grandi.

> I cast `as { ... }` su `params`, `query` e `body` sono necessari quando non è definito uno schema. Con `@fastify/type-provider-zod` (vedi `05-validation.md` e `07-restful-api.md`) i tipi sono inferiti automaticamente dagli schema Zod — i cast spariscono.

---

## Scope delle route

Una route eredita tutti gli hook e i decorator del contesto (plugin) in cui è registrata e dei suoi parent.

```ts
// augmentation — altrimenti TypeScript non conosce request.user
declare module 'fastify' {
  interface FastifyRequest {
    user: { level: number; isAdmin: boolean }
  }
}

app.addHook('onRequest', async function parseUser(request) {
  const level = parseInt(request.headers['x-level'] as string) || 0
  request.user = { level, isAdmin: level === 42 }
})

app.get('/public', async () => 'chiunque')

app.register(async (child) => {
  child.addHook('onRequest', async function requireLevel99(request) {
    if (request.user.level < 99) {
      throw child.httpErrors.forbidden('livello insufficiente')
    }
  })

  child.get('/vip', async () => 'solo livello 99+')

  child.register(async (deep) => {
    deep.addHook('onRequest', async function requireAdmin(request) {
      if (!request.user.isAdmin) {
        throw deep.httpErrors.unauthorized('solo admin')
      }
    })

    deep.get('/admin', async () => 'solo admin')
  })
})
```

Chiamando `GET /admin`, gli hook eseguiti in ordine sono:
1. `parseUser` (root)
2. `requireLevel99` (child)
3. `requireAdmin` (deep)

`GET /public` esegue solo `parseUser`.

---

## Debugging: `printPlugins` e `printRoutes`

```ts
await app.ready()

console.log(app.printPlugins())
// bound root 42ms
// ├── pluginA 10ms
// │   └── pluginB 8ms
// └── pluginX 0ms

console.log(app.printRoutes({ commonPrefix: false }))
// └── / (-)
//     ├── dogs (GET, POST)
//     └── cats (GET)

console.log(app.printRoutes({ commonPrefix: false, includeHooks: true }))
// └── / (-)
//     ├── dogs (GET)
//     │   • (onRequest) ["authHook()"]
//     │   • (preHandler) ["validateInput()"]
//     └── cats (GET)
```

`includeHooks: true` mostra gli hook in ordine di esecuzione per ogni route — fondamentale per debug di flussi complessi.

> Usa **named functions** per hook e handler: le arrow function appaiono come `"anonymous()"` nell'output.

---

## Route config e AOP con `onRoute`

### Accesso alla config della route

```ts
// ⚠️ Breaking change v5: request.context.config → request.routeOptions.config

app.addHook('preHandler', async function setPriority(request) {
  const config = request.routeOptions.config as { priority?: number }
  ;(request as any).priority = (config.priority ?? 1) * 10
})

app.get('/premium', {
  config: { priority: 5 },
  handler: async (request) => ({ priority: (request as any).priority })
})
```

### Pattern AOP con `onRoute`

L'hook `onRoute` si esegue a startup per ogni route registrata nel contesto. Permette di iniettare hook selettivamente basandosi sulla config:

```ts
app.addHook('onRoute', function applyAuth(routeOptions) {
  const config = routeOptions.config as { private?: boolean } | undefined
  if (config?.private !== true) return

  routeOptions.onRequest = async function authGuard(request) {
    if (request.headers['x-token'] !== 'secret') {
      throw app.httpErrors.unauthorized()
    }
  }
})

app.get('/private', {
  config: { private: true },
  handler: async () => ({ secret: 'data' })
})

app.get('/public', {
  config: { private: false },
  handler: async () => ({ public: 'data' })
})
```

**Vantaggi:**
- L'hook di autenticazione non gira per le route che non ne hanno bisogno (performance)
- La configurazione è centralizzata e dichiarativa
- Il pattern si presta a plugin riutilizzabili cross-team

Riferimento: [`../fastify-docs/Hooks-Fastify.md#onroute`](../fastify-docs/Hooks-Fastify.md#onroute)
