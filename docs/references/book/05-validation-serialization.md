# Cap. 5 — Validazione e Serializzazione

> **Libro:** *Accelerating Server-Side Development with Fastify* (2023, Fastify v3)
> **Aggiornato a:** Fastify v5 — Node.js ≥ 24 — ESM + TypeScript (type stripping)
> **Scelta del validator:** Zod via `@fastify/type-provider-zod` (già in `dependencies`)

---

## Perché servono

### Il problema: il client è untrusted

Un server HTTP riceve dati da chiunque. Senza controlli, il codice lavora su input arbitrario:

```ts
// ❌ senza validazione
app.post('/users', async (request) => {
  const { name, age } = request.body   // tipi: unknown
  await db.insert({ name, age })       // age potrebbe essere "DROP TABLE users"
})
```

I rischi concreti:
- **Tipo sbagliato** — `age` arriva come stringa `"ventidue"`, il DB riceve un valore inatteso
- **Campi mancanti** — `name` è `undefined`, query fallisce, stack trace esposto al client
- **Campi extra** — il client manda `{ name, age, isAdmin: true }`, finisce tutto nel DB
- **Injection** — dati non sanitizzati usati in query, template o comandi di sistema

La validazione è il **confine di fiducia** (trust boundary): tutto ciò che arriva dall'esterno è da considerarsi ostile finché non è stato verificato.

### Due meccanismi distinti

Fastify separa deliberatamente l'ingresso dall'uscita perché i problemi da risolvere sono diversi:

**Validazione (ingresso)** — funziona come un gate keeper: approva o rifiuta la richiesta prima che il codice la tocchi. Se l'input non rispetta lo schema, Fastify risponde `400` senza eseguire il handler. Il codice riceve dati già verificati.

**Serializzazione (uscita)** — funziona come un filtro: trasforma l'output del handler nella risposta HTTP. I campi non dichiarati nello schema `response` vengono rimossi. Questo non è solo performance — è sicurezza.

```ts
// il handler restituisce tutto il record DB
async function getUser() {
  return db.findOne({ id: 1 })
  // → { id: 1, name: 'Alice', passwordHash: '...', internalRole: 'superadmin' }
}

// lo schema response filtra l'output prima che arrivi al client
schema: {
  response: {
    200: z.object({ id: z.number(), name: z.string() })
    // passwordHash e internalRole non sono qui → non arrivano mai al client
  }
}
```

Senza schema `response`, Fastify usa `JSON.stringify` su tutto — inclusi i campi che non dovrebbero uscire.

### Il doppio vantaggio della serializzazione

Oltre alla sicurezza, la serializzazione con schema offre un vantaggio di performance: Fastify usa `fast-json-stringify` invece di `JSON.stringify`. Poiché lo schema descrive esattamente la struttura dell'oggetto, la libreria può generare codice di serializzazione ottimizzato, **2–3× più veloce** di `JSON.stringify` su oggetti complessi.

In pratica, definire uno schema `response` è l'unica ottimizzazione di serializzazione con zero costi di sviluppo — basta scriverlo.

### Fail-fast e messaggi d'errore utili

Un altro motivo per cui la validazione è preferibile al controllo manuale nel handler: il messaggio di errore.

```ts
// ❌ controllo manuale — generico, difficile da debuggare
if (!body.name) throw new Error('invalid input')

// ✅ Zod — specifico, localizzato, con path
// → { "message": "body/name: String must contain at least 1 character(s)" }
```

Il framework sa esattamente quale campo ha fallito, quale vincolo non è stato rispettato e in quale parte della richiesta (body, params, query, headers). Il client riceve un errore `400` strutturato senza che il server abbia eseguito nemmeno una riga di logica.

---

## Panoramica

```
HTTP Request
    │
    ├─► Validazione (Zod — preValidation hook)
    │     params → querystring → headers → body
    │
    ▼
Handler  ← tipi TypeScript inferiti automaticamente dagli schema Zod
    │
    ├─► preSerialization hook
    ├─► Serializzazione (response schema Zod → fast-json-stringify)
    │
    ▼
HTTP Response
```

- **Validazione**: approva o nega l'input; se la validazione fallisce, il handler non viene eseguito e Fastify risponde `400`
- **Serializzazione**: filtra l'output in base allo schema `response` — i campi non dichiarati vengono rimossi dalla risposta

Riferimento: [`../fastify-docs/Validation-and-Serialization.md`](../fastify-docs/Validation-and-Serialization.md)

---

## Validator: Zod vs TypeBox

Questo capitolo usa **Zod** perché è già in `dependencies` del template. La skill `fastify-best-practices` raccomanda invece **TypeBox** (`@sinclair/typebox`) come approccio primario. Trade-off:

| | Zod | TypeBox |
|---|---|---|
| In `dependencies` del template | ✅ | ❌ |
| TypeScript inference automatica | ✅ | ✅ |
| Integrazione AJV / fast-json-stringify | tramite adapter | nativa |
| Composizione schema | `.omit()`, `.pick()`, `.extend()` | `Type.Omit()`, `Type.Pick()`, `Type.Intersect()` |
| Validazioni custom | `.refine()` | keywords AJV custom |
| Validazione runtime (non solo tipi) | ✅ | ✅ |

**Quando usare TypeBox:** se stai creando un nuovo progetto da zero e vuoi l'integrazione più diretta con l'ecosistema Fastify/AJV. Vedi `rules/schemas.md` della skill per il pattern completo con `@fastify/type-provider-typebox`.

**Quando usare Zod:** se stai lavorando su questo template (già configurato) o se preferisci l'API Zod per la validazione a runtime.

---

## Setup

```ts
import Fastify from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from '@fastify/type-provider-zod'

const app = Fastify({ logger: true })
  .withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)
```

`withTypeProvider<ZodTypeProvider>()` abilita l'inferenza dei tipi TypeScript dagli schema Zod — senza questo, `request.params` / `request.body` restano `unknown`.

---

## Schema nelle route

Tutti i campi `schema` sono opzionali. Se una parte HTTP non ha schema, non viene validata.

```ts
import * as z from 'zod'

app.post(
  '/users/:id/items',
  {
    schema: {
      params:      z.object({ id: z.coerce.number().pipe(z.int().positive()) }),
      querystring: z.object({ page: z.coerce.number().pipe(z.int()).default(1) }),
      headers:     z.object({ 'x-api-key': z.string() }),
      body:        z.object({
                     name: z.string().min(1).max(50),
                     tags: z.array(z.string()).optional()
                   }),
      response: {
        201: z.object({ id: z.int(), name: z.string() })
      }
    }
  },
  async (request) => {
    // tipi tutti inferiti — niente `as`
    const { id } = request.params          // number
    const { page } = request.query         // number
    const { name, tags } = request.body    // string, string[] | undefined
    return { id, name }
  }
)
```

---

## Funzionalità Zod utili per le route

### Coercizione dei tipi

Path param e querystring arrivano **sempre come stringhe** — è il protocollo HTTP che li trasporta così. `/users/42` porta la stringa `"42"`, non il numero `42`. Il body JSON invece arriva già parsato, quindi `z.coerce` non serve per il body.

Per convertire e validare params e querystring usa `z.coerce`:

```ts
params: z.object({
  id:   z.coerce.number().pipe(z.int()),   // "42" → 42, poi valida che sia intero
  slug: z.string()
})
```

**Cosa succede passo per passo** per `GET /users/42`:

1. Fastify estrae `{ id: "42" }` dall'URL (stringa)
2. `z.coerce.number()` converte → `{ id: 42 }` (number)
3. `.pipe(z.int().positive())` verifica che sia intero positivo → ✅
4. Il handler riceve `{ id: 42 }` già tipizzato come `number`

Se la validazione fallisce, Fastify risponde `400` senza eseguire il handler:

| URL | Valore raw | Risultato |
|---|---|---|
| `/users/42` | `"42"` | ✅ `42` |
| `/users/abc` | `"abc"` | ❌ 400 — coercizione fallisce |
| `/users/-5` | `"-5"` | ❌ 400 — non è positivo |
| `/users/3.14` | `"3.14"` | ❌ 400 — non è intero |

> **`z.int()` vs `z.number()`** — In Zod v4 sono tipi distinti: `z.number()` accetta qualsiasi numero finito (inclusi i float); `z.int()` restringe ai safe integer. `.int()` non è un metodo su `z.number()`. Per coercere una stringa a intero usa `.pipe(z.int())` dopo `z.coerce.number()`.

### Valori di default

```ts
querystring: z.object({
  page:  z.coerce.number().pipe(z.int()).default(1),
  limit: z.coerce.number().pipe(z.int().min(1).max(100)).default(20)
})
```

### Nullable e optional

```ts
body: z.object({
  name:  z.string(),
  email: z.email().nullable(),    // string | null  — z.email() è top-level in Zod v4
  bio:   z.string().optional(),   // string | undefined
  age:   z.number().nullish()     // number | null | undefined
})
```

> **Formati stringa in Zod v4** — `z.email()`, `z.uuid()`, `z.url()`, `z.iso.datetime()` ecc. sono schemi top-level, non metodi su `z.string()`. `z.string().email()` non esiste più.

### Validazione custom con `refine`

```ts
body: z.object({
  password: z.string().min(8),
  confirm:  z.string()
}).refine(
  (data) => data.password === data.confirm,
  { error: 'Le password non coincidono', path: ['confirm'] }
  // ⚠️ Zod v4: usa `error`, non `message` — il campo nell'issue output è sempre `message`
)
```

---

## Errori di validazione

Quando la validazione fallisce, Fastify risponde `400 Bad Request`. Il payload di default contiene i dettagli Zod:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "body/name: Required"
}
```

### Personalizzare la risposta di errore

```ts
app.setErrorHandler((error, request, reply) => {
  if (error.validation) {
    reply.status(400).send({
      error: 'VALIDATION_ERROR',
      context: error.validationContext,   // 'body' | 'params' | 'querystring' | 'headers'
      issues: error.validation            // array di ZodIssue
    })
    return
  }
  reply.status(500).send({ error: 'INTERNAL_ERROR' })
})
```

### `attachValidation` — gestire l'errore nel handler

```ts
app.post('/lenient', {
  attachValidation: true,
  schema: { body: z.object({ name: z.string() }) },
  handler: async (request) => {
    if (request.validationError) {
      return { ok: false, issues: request.validationError.validation }
    }
    return { ok: true }
  }
})
```

---

## Riuso degli schema

Con Zod gli schema sono normali variabili TypeScript — si condividono con `import`/`export`:

```ts
// schemas/user.ts
import * as z from 'zod'

export const UserSchema = z.object({
  id:   z.int().positive(),           // z.int() è uno schema standalone in Zod v4
  name: z.string().max(50),
  role: z.enum(['admin', 'user'])
})

export type User = z.infer<typeof UserSchema>

// schema derivato — es. senza id per la creazione
export const CreateUserSchema = UserSchema.omit({ id: true })
export type CreateUser = z.infer<typeof CreateUserSchema>
```

```ts
// routes/users.ts
import { UserSchema, CreateUserSchema } from '../schemas/user.ts'

app.post('/users', {
  schema: {
    body:     CreateUserSchema,
    response: { 201: UserSchema }
  },
  handler: async (request) => {
    const user = await db.create(request.body)
    return user
  }
})
```

---

## Serializzazione — `response` schema

La serializzazione **non valida** l'output — lo **filtra**. I campi non presenti nello schema `response` vengono rimossi dalla risposta. Questo è un meccanismo di sicurezza: evita di esporre accidentalmente dati sensibili.

```ts
const UserPublicSchema = z.object({
  id:   z.number(),
  name: z.string()
  // 'passwordHash' non è qui → non verrà mai inviato al client
})

app.get('/me', {
  schema: { response: { 200: UserPublicSchema } },
  handler: async () => ({
    id: 1,
    name: 'Alice',
    passwordHash: 'secret'   // filtrato — non arriva al client
  })
})
```

Le chiavi del `response` object sono HTTP status code (`200`, `404`) o pattern stringa (`'2xx'`, `'5xx'`).

### Response schema vs DTO

Lo scopo del response schema è lo stesso di un DTO (Data Transfer Object): definire la forma dei dati che attraversano il confine API e impedire che campi interni (`passwordHash`, `internalRole`) arrivino al client.

Non è però la stessa cosa tecnicamente. In un framework come NestJS il DTO è un oggetto che istanzi esplicitamente:

```ts
// NestJS — mapping esplicito, nuovo oggetto allocato
return new UserResponseDto(user)
```

In Fastify il response schema è una dichiarazione: non istanzi nulla, Fastify usa lo schema per filtrare l'oggetto esistente durante la serializzazione con `fast-json-stringify`.

| | DTO classico | Response schema Fastify |
|---|---|---|
| Crei un nuovo oggetto | ✅ | ❌ — filtra quello esistente |
| Mapping esplicito | ✅ | ❌ — implicito nella serializzazione |
| Stripping dei campi extra | manuale | automatico |
| Performance | allocazione extra | usa `fast-json-stringify` |

Usare "DTO" per comunicare l'intento al team è un'approssimazione accettabile; il termine preciso nel contesto Fastify/OpenAPI è **response schema**.

### Risultati dal DB: `as` cast vs `parse()`

Quando leggi dati dal database e il tipo restituito è `unknown`, il pattern corretto è il cast TypeScript, non `Schema.parse()`:

```ts
// ✅ corretto — il DB è un confine di fiducia diverso dal client
const users = db.prepare('SELECT * FROM users').all() as z.infer<typeof UserSchema>[]

// ❌ inutilmente costoso
const users = db.prepare('SELECT * FROM users').all().map(row => UserSchema.parse(row))
```

Tre ragioni per preferire il cast:

1. **Il DB è sotto il tuo controllo** — i dati che escono dal DB sono già stati validati quando sono entrati (tramite lo schema del body della POST/PUT). Il confine di fiducia è il client, non il DB.

2. **Il response schema è la rete di sicurezza** — se il DB restituisce un campo inatteso (`passwordHash`, `internalRole`), lo schema `response` lo filtra prima che arrivi al client.

3. **`parse()` ha un costo runtime reale** — eseguire validazione Zod su ogni riga di ogni query, per ogni request, senza benefici pratici se lo schema `response` è già definito, è spreco.

> Questo pattern (`as z.infer<typeof Schema>`) è quello usato implicitamente in tutte le fonti — skill, docs ufficiali Fastify, `fastify/demo`. Nessuno raccomanda `parse()` sui risultati del DB.

### Reply serializer custom (per XML, CSV, ecc.)

Quando la risposta non è JSON, usa `reply.serializer()` o `setReplySerializer()`:

```ts
app.get('/export.csv', (request, reply) => {
  reply
    .type('text/csv')
    .serializer((payload) => {
      const rows = payload as Array<Record<string, unknown>>
      return rows.map(r => Object.values(r).join(',')).join('\n')
    })
    .send(data)
})
```
