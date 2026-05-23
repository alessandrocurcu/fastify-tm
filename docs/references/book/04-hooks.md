# Cap. 4 — Hooks

> **Libro:** *Accelerating Server-Side Development with Fastify* (2023, Fastify v3)
> **Aggiornato a:** Fastify v5 — Node.js ≥ 24 — ESM + TypeScript (type stripping)

---

## Middleware vs hooks

| | Middleware | Hooks |
|---|---|---|
| **Ordine** | Dipende dall'ordine di dichiarazione | Garantito dal framework |
| **Esecuzione** | Sempre, per ogni request | Solo quando il lifecycle raggiunge quel punto |
| **Scope** | Globale | Encapsulato (plugin-level o route-level) |
| **Riutilizzo** | Più difficile — coupling implicito | Plugin isolati e componibili |

Fastify è hook-based: ogni hook viene eseguito solo se registrato nel contesto corretto, solo quando serve. Questo è il motivo per cui Fastify è più veloce di framework middleware-based a parità di funzionalità.

---

## `addHook`

```ts
app.addHook('onRequest', async (request, reply) => {
  // logica
})
```

Può essere chiamato più volte sullo stesso evento — gli hook vengono accodati ed eseguiti nell'ordine di registrazione. Ogni hook è **encapsulato**: vale solo nel plugin in cui è dichiarato e nei suoi figli.

---

## Application lifecycle hooks

Ordine di esecuzione:

```
onRoute / onRegister  (sincroni, durante la registrazione)
     ↓
  onReady             (async, prima di accettare richieste)
     ↓
  onListen            (async, dopo che il socket è aperto)  ← aggiunto in v4
     ↓
  [server in esecuzione]
     ↓
  preClose            (async, server ancora attivo)         ← aggiunto in v4
     ↓
  onClose             (async, richieste completate)
```

Riferimento: [`../fastify-docs/Hooks-Fastify.md#application-hooks`](../fastify-docs/Hooks-Fastify.md#application-hooks)

### `onRoute`

Sincrono. Chiamato per ogni route registrata nel contesto. Il parametro `routeOptions` è **mutabile** — puoi aggiungere hook o modificare la configurazione prima che la route venga istanziata.

```ts
app.addHook('onRoute', (routeOptions) => {
  // aggiunge preHandler a ogni route con config.auth === true
  const config = routeOptions.config as { auth?: boolean } | undefined
  if (config?.auth !== true) return

  const existing = routeOptions.preHandler
  const guard = async (request: FastifyRequest) => {
    if (!request.headers['x-token']) throw app.httpErrors.unauthorized()
  }

  routeOptions.preHandler = existing
    ? [...(Array.isArray(existing) ? existing : [existing]), guard]
    : [guard]
})
```

> Il libro usa `routeOptions.preHandler = [...]` sovrascrivendo. Usa sempre lo spread per non perdere hook già presenti.

### `onRegister`

Sincrono. Chiamato prima della registrazione di ogni plugin che **crea un nuovo scope** (non chiamato per plugin wrappati con `fastify-plugin`). Utile per copiare/isolare i decorator per contesto.

```ts
declare module 'fastify' {
  interface FastifyInstance {
    data: { shared: boolean }
  }
}

app.decorate('data', { shared: true })

app.addHook('onRegister', (instance, options) => {
  // shallow-copy: ogni plugin ha la propria copia dell'oggetto
  instance.data = { ...instance.data }
})
```

### `onReady`

Async. Chiamato dopo `app.ready()` / `app.listen()`, prima che il server accetti richieste. `this` è bound all'istanza Fastify — usa `function` normale, non arrow function.

```ts
app.addHook('onReady', async function () {
  // this = app instance
  this.log.info('server pronto, eseguo warm-up')
  await warmUpCache()
})
```

Un errore in `onReady` blocca lo startup.

### `onListen` ← novità v4 (non nel libro)

Async. Chiamato **dopo** che il socket è aperto. Solo per side effects (log, metriche). `this` è bound all'istanza Fastify.

```ts
app.addHook('onListen', async function () {
  const address = this.server.address()
  this.log.info({ address }, 'server in ascolto')
})
```

Differenza con `onReady`: un errore in `onListen` **non** blocca lo startup.

### `preClose` ← novità v4 (non nel libro)

Async. Chiamato prima che il server smetta di accettare connessioni. È il posto giusto per chiudere WebSocket, SSE stream o qualsiasi risorsa che impedirebbe a `server.close()` di completare.

```ts
app.addHook('preClose', async () => {
  await closeWebSocketConnections()
})
```

### `onClose`

Async. Chiamato dopo che tutte le richieste in volo sono completate e il server è fermo. Qui si rilasciano DB pool, connessioni cache, ecc. Il parametro è l'istanza Fastify.

```ts
app.addHook('onClose', async (instance) => {
  await instance.db.close()
})
```

---

## Request/reply lifecycle hooks

Ordine di esecuzione per ogni richiesta:

```
onRequest → preParsing → preValidation → preHandler
  → preSerialization → onSend → onResponse
```

In caso di errore: `onError` (poi `onSend → onResponse`).
In caso di disconnect del client: `onRequestAbort` ← aggiunto in v4.
In caso di timeout socket: `onTimeout`.

Tutti i hook request/reply sono **encapsulati** (scope del plugin in cui sono dichiarati).

### `onRequest`

Primo hook. Il `body` è sempre `null` — il parsing non è ancora avvenuto.

```ts
app.addHook('onRequest', async (request, reply) => {
  request.log.info('richiesta ricevuta: %s %s', request.method, request.url)
})
```

```ts
// esempio con encapsulation
app.addHook('onRequest', async (request) => {
  request.log.info('hook globale')
})

app.register(async (child) => {
  child.addHook('onRequest', async (request) => {
    request.log.info('hook solo per le route di questo plugin')
  })
  child.get('/scoped', async () => 'scoped')
})

app.get('/global', async () => 'global')
// GET /global → esegue solo hook globale
// GET /scoped → esegue entrambi (prima globale, poi scoped)
```

### `preParsing`

Permette di trasformare il payload **prima** del parsing. Il terzo parametro è lo stream del payload — devi restituire un nuovo `Readable` se vuoi modificarlo.

```ts
import { Readable } from 'node:stream'

app.addHook('preParsing', async (request, reply, payload) => {
  let body = ''
  for await (const chunk of payload) {
    body += chunk
  }
  request.log.info({ original: JSON.parse(body) }, 'payload originale')

  const newPayload = new Readable()
  newPayload.receivedEncodedLength = parseInt(
    request.headers['content-length'] as string, 10
  )
  newPayload.push(JSON.stringify({ modified: true }))
  newPayload.push(null)
  return newPayload
})
```

Caso d'uso tipico: decompressione, decriptazione del payload in ingresso.

### `preValidation`

Il parsing è già avvenuto — `request.body` è disponibile. Modifica il body prima che venga validato contro lo schema.

```ts
app.addHook('preValidation', async (request) => {
  // normalizza il body prima della validazione
  const body = request.body as Record<string, unknown>
  request.body = { ...body, source: 'api' }
})
```

### `preHandler`

Ultimo hook prima del route handler. Body già parsato **e** validato. Usalo per logica che richiede il body validato (es. autorizzazione basata sul contenuto). **Non usarlo come sostituto dei hook precedenti** — se non hai bisogno del body validato, usa `onRequest` o `preValidation`.

```ts
app.addHook('preHandler', async (request) => {
  const body = request.body as { userId: string }
  // verifica che l'utente possa accedere alla risorsa richiesta
  await checkPermission(body.userId, request.routeOptions.url)
})
```

### `preSerialization`

Chiamato dopo il handler, prima della serializzazione. Il terzo parametro è il payload (oggetto JS) — restituisci il nuovo payload.

**Non viene chiamato** se il payload è `string`, `Buffer`, `Stream` o `null`.

```ts
app.addHook('preSerialization', async (request, reply, payload) => {
  // wrappa tutte le risposte in un envelope
  return { data: payload, requestId: request.id }
})
```

### `onSend`

Payload già serializzato (stringa). Ultimo hook prima dell'invio. Sempre chiamato, indipendentemente dal tipo di payload. Il valore restituito deve essere `string`, `Buffer`, `Stream` o `null`.

```ts
app.addHook('onSend', async (request, reply, payload) => {
  // aggiungi header prima dell'invio
  reply.header('x-request-id', request.id)
  return payload  // non modificato
})
```

### `onResponse`

Chiamato **dopo** che la risposta è stata inviata al client. Non puoi più modificare il payload. Usa per logging, metriche, cleanup.

```ts
app.addHook('onResponse', async (request, reply) => {
  metrics.record({
    method: request.method,
    url: request.routeOptions.url,
    status: reply.statusCode,
    duration: reply.elapsedTime
  })
})
```

> `reply.send()` da `onResponse` produce l'errore `"Reply was already sent"` — non farlo.

### `onError`

Chiamato quando viene inviata una risposta di errore al client, **dopo** l'error handler. Usalo solo per logging aggiuntivo o modifica degli header — non chiamare `reply.send()`.

```ts
app.addHook('onError', async (request, reply, error) => {
  // non modificare l'error — solo side effects
  request.log.error({ err: error, url: request.url }, 'errore applicativo')
  await errorTracker.capture(error)
})
```

### `onTimeout`

Chiamato quando scatta il timeout a livello di socket (`connectionTimeout`). Il socket è già chiuso — non puoi inviare dati al client. Usalo per logging/cleanup.

```ts
const app = Fastify({ connectionTimeout: 5_000 })

app.addHook('onTimeout', async (request) => {
  request.log.warn('connessione socket scaduta')
})
```

> **`connectionTimeout` vs `handlerTimeout`:** `connectionTimeout` è a livello di socket TCP (inattività). `handlerTimeout` (novità v5) è a livello applicativo — scatta se il handler non risponde entro il tempo configurato, invia `503` e abbort `req.signal`. I due meccanismi sono indipendenti. Vedi `01-introduction.md`.

> Node.js 24 ESM: per `sleep` usa `import { setTimeout as sleep } from 'node:timers/promises'` invece di `promisify(setTimeout)`.

### `onRequestAbort` ← novità v4 (non nel libro)

Chiamato quando il client si disconnette prima che la risposta venga inviata. Non puoi inviare dati.

```ts
app.addHook('onRequestAbort', async (request) => {
  request.log.warn('client disconnesso, cancello operazioni in corso')
  // annulla query DB, pulizia risorse, ecc.
})
```

---

## Errori negli hook

In un hook async basta fare `throw`:

```ts
app.addHook('preHandler', async (request) => {
  if (!request.headers['x-token']) {
    throw app.httpErrors.unauthorized('token mancante')
  }
})
```

L'errore viene gestito dall'error handler del contesto e trigge `onError`.

---

## Rispondere da un hook (early exit)

Per terminare il ciclo anticipatamente (es. autenticazione), chiama `reply.send()` e ritorna `reply`:

```ts
app.addHook('onRequest', async (request, reply) => {
  const authorized = await checkToken(request.headers['x-token'])
  if (!authorized) {
    reply.code(401)
    reply.send({ error: 'Unauthorized' })
    return reply   // ← segnala a Fastify che la risposta è stata delegata
  }
})
```

Tutto ciò che viene dopo nel lifecycle (altri hook, handler) **non verrà eseguito**.

---

## Hook a livello di route

Gli hook possono essere dichiarati direttamente nell'oggetto `routeOptions`. Vengono eseguiti **per ultimi** nella catena degli hook dello stesso tipo.

```ts
app.route({
  method: 'GET',
  url: '/protected',
  onRequest: async (request) => {
    if (!request.headers['x-token']) throw app.httpErrors.unauthorized()
  },
  // più hook dello stesso tipo → array
  onSend: [
    async (request, reply, payload) => {
      reply.header('x-served-by', 'fastify')
      return payload
    },
    async (request, reply, payload) => {
      reply.header('x-timestamp', Date.now().toString())
      return payload
    }
  ],
  handler: async () => ({ ok: true })
})
```

Gli hook a livello di route supportano tutti i tipi del request/reply lifecycle (eccetto `onRequestAbort` e `onTimeout` che non sono supportati a livello di route).

---

## Pattern: `onRegister` per isolamento dei decorator

Il libro mostra come usare `onRegister` per fare shallow-copy di un decorator e isolare le modifiche tra plugin:

```ts
declare module 'fastify' {
  interface FastifyInstance {
    config: { debug: boolean }
  }
}

app.decorate('config', { debug: false })

app.addHook('onRegister', (instance) => {
  // ogni plugin ottiene la propria copia — le modifiche non si propagano al parent
  instance.config = { ...instance.config }
})

app.register(async (child) => {
  child.config.debug = true   // visibile solo in questo plugin
})
```

---

## Riepilogo: quale hook usare

| Obiettivo | Hook consigliato |
|---|---|
| Autenticazione (no body) | `onRequest` |
| Trasformare il payload grezzo | `preParsing` |
| Normalizzare il body prima della validazione | `preValidation` |
| Autorizzazione basata sul body validato | `preHandler` |
| Wrappare/trasformare la risposta JS | `preSerialization` |
| Aggiungere header alla risposta / manipolare payload serializzato | `onSend` |
| Logging, metriche post-risposta | `onResponse` |
| Tracking errori | `onError` |
| Cleanup su disconnect del client | `onRequestAbort` |
| Cleanup su timeout socket | `onTimeout` |
| Warm-up pre-avvio | `onReady` |
| Log indirizzo di ascolto | `onListen` |
| Chiudere WebSocket/SSE prima dello shutdown | `preClose` |
| Rilasciare DB/cache allo shutdown | `onClose` |

Riferimento completo: [`../fastify-docs/Hooks-Fastify.md`](../fastify-docs/Hooks-Fastify.md)
