# Cap. 1 — Introduzione a Fastify

> **Libro:** *Accelerating Server-Side Development with Fastify* (2023, Fastify v3)
> **Aggiornato a:** Fastify v5 — Node.js ≥ 24 — ESM + TypeScript (type stripping)

---

## Componenti principali

| Componente | Ruolo |
|---|---|
| **Root application instance** | L'oggetto Fastify principale. Controlla `http.Server`, registra route, gestisce il lifecycle. |
| **Plugin instance** | Figlio dell'app instance. Crea un contesto isolato (encapsulation). |
| **Request** | Wrapper di `http.IncomingMessage`. Accesso a body, params, query, headers, logging. |
| **Reply** | Wrapper di `http.ServerResponse`. Invia la risposta al client. |
| **Hook** | Funzione che si aggancia a un evento del lifecycle (applicazione o request). |
| **Decorator** | Estende app/request/reply con proprietà o metodi custom. |
| **Parser** | Converte il payload della request in un tipo primitivo. |
| **Validator / Serializer** | Valida l'input (body, params, query, headers) e serializza le risposte. Default: AJV. Alternativa type-safe: Zod via `@fastify/type-provider-zod` — i tipi di `request.body`, `request.params`, `request.query` diventano inferiti automaticamente senza cast. |

---

## Avviare il server

```ts
import Fastify from 'fastify'
import closeWithGrace from 'close-with-grace'

const app = Fastify({ logger: true })

app.get('/health', async () => ({ status: 'ok' }))

closeWithGrace({ delay: 10_000 }, async ({ err }) => {
  if (err) app.log.error(err)
  await app.close()
})

await app.listen({ port: 3000, host: '0.0.0.0' })
```

> Il libro usa CommonJS (`require`) e gestisce `SIGINT` manualmente. Con `close-with-grace` (già in `dependencies`) tutto questo è gestito correttamente con un timeout di sicurezza. Vedi [Graceful shutdown](#graceful-shutdown).

`host: '0.0.0.0'` è necessario per Docker e ambienti cloud (es. Render.com). `localhost` accetta solo connessioni locali.

---

## Server options

Riferimento completo: [`../fastify-docs/Server-Fastify.md`](../fastify-docs/Server-Fastify.md)

Le opzioni più rilevanti:

```ts
const app = Fastify({
  logger: {
    level: 'info',          // fatal | error | warn | info | debug | trace | silent
    transport: {
      target: 'pino-pretty' // solo in dev — già installato
    }
  },
  requestIdHeader: 'x-request-id', // legge l'ID dalla request header se presente
  bodyLimit: 1_048_576,            // 1 MiB (default)
  handlerTimeout: 30_000,          // ⚠️ NUOVO in v5 — timeout applicativo per ogni route (ms)
})
```

### `handlerTimeout` — novità v5

A differenza di `connectionTimeout` (livello socket), `handlerTimeout` è un timeout **applicativo**: scatta se il handler non risponde entro il tempo configurato, invia `503` e abbort il signal. Sovrascrivibile per singola route:

```ts
app.get('/slow', { handlerTimeout: 60_000 }, async (req) => {
  // req.signal si abbort se scatta il timeout
  const data = await db.query(sql, { signal: req.signal })
  return data
})
```

### Opzioni invariate dal libro

`https`, `http2`, `keepAliveTimeout`, `connectionTimeout`, `bodyLimit`, `maxParamLength`, `ajv`, `serverFactory`, `onProtoPoisoning`, `onConstructorPoisoning` — nessuna breaking change.

---

## Application lifecycle

```
avvio
 │
 ├─▶ onRoute / onRegister  (sincroni, per ogni route/plugin registrato)
 ├─▶ onReady               (asincrono, prima di accettare richieste)
 ├─▶ onListen              (dopo che il server è in ascolto)  ← aggiunto in v4
 │
 │   [server in esecuzione]
 │
 ├─▶ preClose              (server ancora attivo, connessioni ancora aperte) ← aggiunto in v4
 ├─▶ server.close()        (attende il completamento delle richieste in volo)
 ├─▶ onClose               (tutte le richieste completate, server fermo)
 └─▶ fine
```

Riferimento: [`../fastify-docs/Hooks-Fastify.md#application-hooks`](../fastify-docs/Hooks-Fastify.md#application-hooks)

### `preClose` — novità rispetto al libro

Il libro descrive solo `onClose`. `preClose` si inserisce **prima** che il server smetta di accettare connessioni: è il posto giusto per chiudere WebSocket, SSE streams o qualsiasi risorsa che impedirebbe a `server.close()` di completare.

```ts
app.addHook('preClose', async () => {
  // chiudi WebSocket, SSE, ecc.
})
app.addHook('onClose', async (instance) => {
  // rilascia DB pool, cache connections, ecc. — qui le richieste sono già tutte completate
})
```

### Differenza `onReady` vs `onListen`

- `onReady` → prima di accettare richieste; errori qui bloccano lo startup
- `onListen` → dopo che il socket è aperto; solo per side effects (log, metriche, ecc.)

---

## Request/reply lifecycle — hooks

Ordine di esecuzione per ogni richiesta:

```
onRequest → preParsing → preValidation → preHandler
  → preSerialization → onSend → onResponse
```

In caso di errore: `onError` (poi `onSend` → `onResponse`).
In caso di client disconnect prima della risposta: `onRequestAbort` ← **nuovo in v4**.

```ts
app.addHook('onRequestAbort', async (request) => {
  // il client si è disconnesso — non puoi più inviare dati
  request.log.warn('client disconnected early')
})
```

Riferimento completo: [`../fastify-docs/Hooks-Fastify.md`](../fastify-docs/Hooks-Fastify.md)

---

## Route

### Dichiarazione

```ts
// forma estesa
app.route({
  method: 'GET',
  url: '/hello',
  handler: async (request, reply) => 'world'
})

// shorthand (equivalente)
app.get('/hello', async () => 'world')

// shorthand con options
app.get('/hello', { handlerTimeout: 5_000 }, async () => 'world')
```

### Handler: `this`, arrow function e return

```ts
// ✅ named function — `this` è l'app instance
app.get('/server', function handler(request, reply) {
  return { address: this.server.address() }
})

// ✅ async — return invece di reply.send()
app.get('/hello', async () => 'hello')

// ❌ arrow function — `this` è undefined
app.get('/fail', (req, reply) => {
  return { address: this.server.address() } // TypeError
})
```

Preferire **named functions** per facilitare il debug (il nome appare negli stack trace).

### Parametri e wildcard

```ts
app.get('/cat/:name', async (req) => {
  return req.params.name
})

// regex (con costo di performance — preferire validazione schema)
app.get('/cat/:id(^\\d+$)', async (req) => {
  return req.params.id
})

// wildcard
app.get('/assets/*', async (req) => {
  return req.params['*']
})
```

Ordine di priorità del router: match esatto → path param → wildcard → path param con regex.

---

## Reply

```ts
reply.code(201)
reply.header('x-custom', 'value')
reply.type('application/json')
reply.send(payload)         // stringa, oggetto, Buffer, Stream, Error

// concatenabile
reply.code(201).header('location', '/resource/1').send({ id: 1 })
```

**Content-Type automatico:** `string` → `text/plain`, oggetto/array → `application/json`, Buffer/Stream → `application/octet-stream`.

**Status automatico:** `200` su successo, `500` su errore non gestito.

Invece di `reply.send()` si può fare `return payload` dal handler — equivalente, ma più componibile.

Riferimento: [`../fastify-docs/Reply-Fastify.md`](../fastify-docs/Reply-Fastify.md)

---

## Request

```ts
request.body        // payload parsato (oggetto se application/json, stringa se text/plain)
request.query       // query string come oggetto
request.params      // path params come oggetto
request.headers     // headers come oggetto
request.id          // ID univoco della richiesta
request.ip          // IP del client
request.hostname    // hostname del client
request.protocol    // 'http' | 'https'
request.method      // HTTP method
request.url         // URL completo
request.is404       // true se gestito dal 404 handler
request.log         // logger con reqId già incluso — usare sempre questo nei handler
```

### ⚠️ Breaking change v5: `routerPath` rimosso

```ts
// ❌ v3/v4 — rimosso in v5
request.routerPath
request.routerMethod

// ✅ v5
request.routeOptions.url
request.routeOptions.method
request.routeOptions.config  // (in v3/v4 era request.context.config)
```

Riferimento: [`../fastify-docs/Request-Fastify.md`](../fastify-docs/Request-Fastify.md)

### Logging con reqId

```ts
app.get('/log', async (request) => {
  request.log.info('questo log ha reqId automatico')
  app.log.info('questo log NON ha reqId')
  return {}
})
```

Usare sempre `request.log` (o `reply.log`, alias) all'interno dei handler per mantenere la tracciabilità per richiesta.

---

## Plugin e encapsulation

```ts
import fp from 'fastify-plugin'

// plugin INCAPSULATO — decoratori/hook visibili solo internamente
app.register(async function myPlugin(instance, opts) {
  instance.decorate('privateUtil', () => 'solo qui')
  instance.get('/internal', async () => 'ok')
})

// plugin NON incapsulato con fastify-plugin — visibile al parent e ai sibling
app.register(fp(async function sharedPlugin(instance, opts) {
  instance.decorate('db', createDbConnection())
  instance.addHook('onClose', async () => { /* chiudi db */ })
}))
```

**Proprietà dell'encapsulation:**
- **Encapsulation** — hook, plugin, decorator registrati nel plugin restano nel suo scope
- **Isolation** — un plugin non può modificare i sibling
- **Inheritance** — un plugin eredita la configurazione del parent

`fastify-plugin` rompe l'encapsulation: usa quando vuoi condividere un decorator o hook con il parent (tipico per db, auth, config).

Riferimento: [`../fastify-docs/Plugins-Fastify.md`](../fastify-docs/Plugins-Fastify.md), [`../fastify-docs/Encapsulation.md`](../fastify-docs/Encapsulation.md)

---

## Graceful shutdown

Il libro propone un handler `SIGINT` manuale con `setTimeout`. Il modo corretto oggi è usare `close-with-grace` (già in `dependencies`):

```ts
import closeWithGrace from 'close-with-grace'

closeWithGrace({ delay: 10_000 }, async ({ signal, err }) => {
  if (err) app.log.error({ err }, 'shutdown error')
  else app.log.info({ signal }, 'shutdown signal received')
  await app.close()
})
```

`close-with-grace` gestisce `SIGINT`, `SIGTERM` e errori uncaught, con un timeout di sicurezza (10s di default) dopo il quale forza `process.exit(1)`.

**Cosa succede durante `app.close()`:**

1. Server marcato come "closing" — nuove richieste ricevono `503`
2. Hook `preClose` eseguiti (server ancora in ascolto)
3. Drain delle connessioni (secondo `forceCloseConnections`)
4. `server.close()` — attende le richieste in volo
5. Hook `onClose` eseguiti — qui rilasciare DB, cache, ecc.
6. Promise/callback risolti

Riferimento: [`../fastify-docs/Server-Fastify.md#shutdown-lifecycle`](../fastify-docs/Server-Fastify.md#shutdown-lifecycle)
