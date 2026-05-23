# Cap. 2 — Plugin System e Boot Process

> **Libro:** *Accelerating Server-Side Development with Fastify* (2023, Fastify v3)
> **Aggiornato a:** Fastify v5 — Node.js ≥ 24 — ESM + TypeScript (type stripping)

---

## Cosa è un plugin

Un plugin è la singola unità costruttiva di Fastify. Tutto — route, middleware, connessioni a DB, decoratori — dovrebbe vivere dentro un plugin. Le proprietà fondamentali:

- Un plugin può registrare altri plugin al suo interno
- Crea per default un nuovo scope **figlio** (encapsulation)
- Riceve un parametro `options` per controllarne il comportamento
- Definisce route prefissate, agendo da router

Riferimento: [`../fastify-docs/Plugins-Fastify.md`](../fastify-docs/Plugins-Fastify.md), [`../fastify-docs/Encapsulation.md`](../fastify-docs/Encapsulation.md)

---

## Dichiarazione di un plugin

### Firma base

```ts
import Fastify, { type FastifyPluginAsync } from 'fastify'

const myPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get('/hello', async () => 'world')
}

const app = Fastify({ logger: true })
app.register(myPlugin)
await app.ready()
```

> Il libro usa CommonJS (`require`) e la firma senza tipo. In TypeScript si usa `FastifyPluginAsync<Options>` — **non** `FastifyPlugin` che è deprecato.

### Due stili a confronto

```ts
// ✅ async (preferito nel libro e in questo template)
const myPlugin: FastifyPluginAsync = async (fastify, opts) => {
  // se throw → la Promise viene rejected → boot interrotto
}

// callback style — ⚠️ deprecated in v5 — usare sempre async
import { type FastifyInstance } from 'fastify'
function myPlugin(fastify: FastifyInstance, opts: object, done: (err?: Error) => void) {
  // done() → ok
  // done(new Error()) → boot interrotto
}
```

**Regola:** non mescolare i due stili. Con async, non passare `done` — la Promise è il segnale di completamento.

---

## Il parametro `options`

```ts
interface MyPluginOpts {
  prefix?: string    // riservato da Fastify
  logLevel?: string  // riservato da Fastify
  connectionUrl: string  // custom
}

const dbPlugin: FastifyPluginAsync<MyPluginOpts> = async (fastify, opts) => {
  const conn = createConnection(opts.connectionUrl)
  fastify.decorate('db', conn)
}

app.register(dbPlugin, { connectionUrl: process.env.DB_URL! })
```

**Opzioni riservate da Fastify** (non usarle per custom config):
- `prefix` — prefissa tutte le route del plugin
- `logLevel` — imposta il log level del plugin
- `logSerializers` — serializer custom per i log

**Best practice:** raggruppa le opzioni custom sotto una chiave con namespace per evitare collisioni future. Valida sempre le opzioni ricevute prima di usarle:

```ts
import { z } from 'zod/v4'

const DbOptsSchema = z.object({
  connectionUrl: z.string().url(),
  poolSize: z.number().int().min(1).max(50).default(10)
})

const dbPlugin: FastifyPluginAsync<z.input<typeof DbOptsSchema>> = async (fastify, rawOpts) => {
  const opts = DbOptsSchema.parse(rawOpts)  // lancia a startup se opts non valide
  const conn = createConnection(opts.connectionUrl, opts.poolSize)
  fastify.decorate('db', conn)
}
```

### Options come funzione

`options` può essere una funzione che riceve il parent instance e restituisce l'oggetto:

```ts
app.register(myPlugin, (parent) => ({
  connectionUrl: parent.config.DB_URL,  // accede al parent decorato
}))
```

Utile per passare valori che dipendono da decorator già registrati sul parent.

---

## Encapsulation

```ts
app.decorate('rootProp', 'visible a tutti')

app.register(async (child) => {
  // ✅ vede rootProp dal parent
  console.log(child.rootProp)

  child.decorate('childProp', 'solo qui e nei figli')

  child.register(async (grandchild) => {
    // ✅ vede sia rootProp che childProp
    console.log(grandchild.rootProp)
    console.log(grandchild.childProp)
  })
})

// ❌ rootProp visibile, childProp NO
await app.ready()
console.log(app.rootProp)   // 'visible a tutti'
console.log(app.childProp)  // undefined
```

Le entità soggette allo scoping sono: **decoratori**, **hook**, **plugin**, **route**.

---

## Rompere l'encapsulation: `fastify-plugin`

Usa `fastify-plugin` quando il plugin deve rendere visibili i suoi decorator/hook al **parent** (tipico per DB, auth, config).

```ts
import fp from 'fastify-plugin'
import { type FastifyPluginAsync } from 'fastify'

// augment per TypeScript
declare module 'fastify' {
  interface FastifyInstance {
    db: DatabaseConnection
  }
}

const dbPlugin: FastifyPluginAsync = async (fastify) => {
  const db = await createConnection()
  fastify.decorate('db', db)
  fastify.addHook('onClose', async () => db.close())
}

export default fp(dbPlugin, {
  name: 'db-plugin',        // nome esplicito — importante per errori e dipendenze
  fastify: '5.x',           // ⚠️ aggiornato da '4.x' del libro
  decorators: {
    fastify: [],            // decorator richiesti sul parent prima della registrazione
  },
  dependencies: [],         // nomi di altri plugin che devono essere già caricati
})
```

> Senza `fastify-plugin`, `app.db` sarebbe `undefined` fuori dal plugin.

### `skip-override` — alternativa manuale

```ts
myPlugin[Symbol.for('skip-override')] = true
```

Funziona, ma **evitalo**: `fastify-plugin` offre in più la verifica della versione, il nome, e i controlli sui decorator richiesti. Se Fastify cambia API interne, `fastify-plugin` gestisce la compatibilità per te.

---

## TypeScript: dichiarazione dei tipi per i decorator

Ogni volta che aggiungi un decorator al scope globale con `fastify-plugin`, devi fare **module augmentation**:

```ts
// per decorator su fastify instance
declare module 'fastify' {
  interface FastifyInstance {
    db: DatabaseConnection
    config: AppConfig
  }
}

// per decorator su request
declare module 'fastify' {
  interface FastifyRequest {
    user: User
  }
}

// per decorator su reply
declare module 'fastify' {
  interface FastifyReply {
    sendSuccess(data: unknown): void
  }
}
```

Senza questa dichiarazione, TypeScript non riconosce `fastify.db`, `request.user`, ecc.

---

## Prefix e route scoping

```ts
const usersRouter: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async () => []) // → GET /users
  fastify.post('/', async (req) => req.body) // → POST /users
}

// v1
app.register(usersRouter, { prefix: '/v1/users' })

// v2 — stesso router + route aggiuntiva
app.register(async (fastify) => {
  fastify.register(usersRouter)                          // → GET/POST /v2/users
  fastify.delete('/:name', async (req) => {})            // → DELETE /v2/:name
}, { prefix: '/v2' })
```

`app.printRoutes()` mostra l'albero completo delle route — utile in sviluppo.

---

## Boot sequence

Il boot è **asincrono** e gestito da [avvio](https://github.com/mcollina/avvio). I plugin vengono caricati **in ordine di registrazione**, uno alla volta. Il server non inizia ad accettare richieste finché tutti i plugin non sono caricati senza errori.

```
app.register(pluginA)   ← caricato per primo
app.register(pluginB)   ← caricato per secondo
app.register(pluginC)   ← caricato per terzo
await app.listen(...)   ← avvia il boot, poi mette in ascolto
```

**Ordine consigliato** per dichiarare i plugin:
1. Plugin da npm (db, auth, cors, ecc.)
2. Plugin interni condivisi (fp → rompono l'encapsulation)
3. Decorator
4. Hook
5. Route / services

### `await register` — caricare un plugin prima di procedere

```ts
// plugin1 e plugin2 sono caricati e i loro decorator disponibili
// prima di arrivare alla riga successiva
await app
  .register(fp(plugin1))
  .register(fp(plugin2))

console.log(app.hasDecorator('plugin1Decorator')) // true
```

Necessario solo quando hai bisogno di accedere al risultato del plugin prima che il boot sia completo. **Nella maggior parte dei casi non serve.**

### `after` — callback dopo un gruppo di plugin

```ts
app
  .register(plugin1)
  .register(plugin2)
  .after((err) => {
    if (err) app.log.error(err, 'plugin1 o plugin2 falliti')
    // qui plugin1 e plugin2 sono caricati
  })
  .register(plugin3)
```

`after` è chiamato dopo che tutti i plugin registrati **fino a quel punto** nella catena sono stati caricati. Fastify garantisce che tutti gli `after` siano eseguiti prima dell'evento `ready`.

---

## Boot errors

### `ERR_AVVIO_PLUGIN_TIMEOUT`

L'errore più comune. Scatta se un plugin non completa il caricamento entro `pluginTimeout` (default: 10 secondi).

**Cause tipiche:**
- Si usa la firma con callback (`done`) ma non si chiama mai `done()`
- La Promise del plugin non si risolve (connessione DB irraggiungibile, deadlock)

```ts
// ❌ genera ERR_AVVIO_PLUGIN_TIMEOUT
app.register(function myPlugin(fastify, opts, done) {
  // done() mai chiamata!
})

// ✅
app.register(function myPlugin(fastify, opts, done) {
  done()
})
// oppure semplicemente
app.register(async function myPlugin(fastify) {
  // async: la risoluzione della Promise è il segnale
})
```

Per aumentare il timeout (es. connessioni DB lente in avvio):

```ts
const app = Fastify({ pluginTimeout: 30_000 }) // 30s
```

### Recovery con `after`

In casi eccezionali (plugin opzionali) puoi intercettare un errore di boot senza crashare:

```ts
app
  .register(optionalMetricsPlugin)
  .after((err) => {
    if (err) {
      app.log.warn(err, 'metrics plugin non disponibile, continuo senza')
      // NON rilancio → il boot continua
    }
  })
```

> **Regola generale:** non recuperare dagli errori di boot. Un'applicazione che si avvia in stato inconsistente è pericolosa. Usa il recovery solo per plugin veramente opzionali.

---

## Verifica rapida

```ts
// dopo app.ready() o app.listen()
app.hasPlugin('@fastify/cors')   // true/false — controlla per nome
app.hasDecorator('db')          // true/false — controlla decorator
app.printPlugins()              // stampa l'albero dei plugin caricati
```

Riferimento: [`../fastify-docs/Server-Fastify.md#hasplugin`](../fastify-docs/Server-Fastify.md#hasplugin)
