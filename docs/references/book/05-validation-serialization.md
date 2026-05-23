# Cap. 5 — Validazione e Serializzazione

> **Libro:** *Accelerating Server-Side Development with Fastify* (2023, Fastify v3)
> **Aggiornato a:** Fastify v5 — Node.js ≥ 24 — ESM + TypeScript (type stripping)
> **Scelta del validator:** Zod via `@fastify/type-provider-zod` (già in `dependencies`)

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

I path param e la querystring arrivano come stringhe. Usa `z.coerce` per convertirli:

```ts
params: z.object({
  id:   z.coerce.number().pipe(z.int()),   // "42" → 42, poi valida che sia intero
  slug: z.string()
})
```

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
