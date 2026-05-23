# Cap. 7 — Costruire un'API RESTful

> **Libro:** *Accelerating Server-Side Development with Fastify* (2023, Fastify v3/v4, Node 18, CommonJS, JSON Schema)
> **Aggiornato a:** Fastify v5 — Node.js ≥ 24 — ESM + TypeScript (type stripping) — Zod

---

## Struttura delle route

Il libro usa un'applicazione todo-list come esempio. La struttura delle route segue il pattern CRUD + custom action:

| Metodo   | URL              | Handler        | Operazione              |
|----------|------------------|----------------|-------------------------|
| `GET`    | `/`              | `listTodo`     | Lista con paginazione   |
| `POST`   | `/`              | `createTodo`   | Crea un task            |
| `GET`    | `/:id`           | `readTodo`     | Leggi un singolo task   |
| `PUT`    | `/:id`           | `updateTodo`   | Aggiorna un task        |
| `DELETE` | `/:id`           | `deleteTodo`   | Elimina un task         |
| `POST`   | `/:id/:status`   | `changeStatus` | Azione custom (done/undone) |

La custom action `changeStatus` non è strettamente CRUD: agisce su una risorsa esistente con logica dedicata. `POST /:id/:status` è leggibile ma accoppia lo stato all'URL — alternativa più RESTful: `PATCH /:id` con `{ done: true }` nel body.

---

## Plugin delle route

`routes/todos/routes.ts` — tutti gli handler in un unico plugin:

```ts
import type { FastifyPluginAsync } from 'fastify'

const todoRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: 'GET',
    url: '/',
    handler: async function listTodo(request, reply) {
      return { data: [], totalCount: 0 }
    }
  })

  fastify.route({
    method: 'POST',
    url: '/',
    handler: async function createTodo(request, reply) {
      reply.code(201)
      return { id: 'placeholder' }
    }
  })

  fastify.route({
    method: 'GET',
    url: '/:id',
    handler: async function readTodo(request, reply) {
      return {}
    }
  })

  fastify.route({
    method: 'PUT',
    url: '/:id',
    handler: async function updateTodo(request, reply) {
      reply.code(204)
    }
  })

  fastify.route({
    method: 'DELETE',
    url: '/:id',
    handler: async function deleteTodo(request, reply) {
      reply.code(204)
    }
  })

  fastify.route({
    method: 'POST',
    url: '/:id/:status',
    handler: async function changeStatus(request, reply) {
      reply.code(204)
    }
  })
}

export default todoRoutes
```

Usa **named functions** (non arrow) per ogni handler: il nome compare negli stack trace, facilita il debug.

Con la struttura `routes/todos/routes.ts` e `@fastify/autoload` configurato con `indexPattern: /.*routes\.ts$/i`, tutte le route vengono registrate automaticamente sotto il prefisso `/todos` (il nome della cartella diventa il prefisso URL).

---

## Data model

```ts
// Interfaccia di dominio — non esposta al client
interface Todo {
  _id: string       // ID interno del DB
  id: string        // stesso valore di _id, esposto all'esterno
  title: string
  done: boolean
  createdAt: Date
  modifiedAt: Date
}
```

Esponi `id`, non `_id`: nasconde il dettaglio implementativo del database (MongoDB usa `_id`, altri DB usano nomi diversi).

---

## Implementazione degli handler

Il libro usa MongoDB (`@fastify/mongodb`). Gli esempi seguenti mantengono MongoDB come data layer ma il pattern — accesso al DB dalla closure del plugin, validazione input, gestione 404 — si applica a qualsiasi database.

```bash
pnpm add @fastify/mongodb
```

### `createTodo`

```ts
fastify.route({
  method: 'POST',
  url: '/',
  handler: async function createTodo(request, reply) {
    const _id = new fastify.mongo.ObjectId()
    const now = new Date()
    const newTodo = {
      _id,
      id: _id,
      ...request.body,   // ⚠️ senza schema: accetta qualsiasi campo
      done: false,
      createdAt: now,
      modifiedAt: now
    }
    await todos.insertOne(newTodo)
    reply.code(201)
    return { id: _id }
  }
})
```

### `listTodo` con paginazione

```ts
fastify.route({
  method: 'GET',
  url: '/',
  handler: async function listTodo(request, reply) {
    const { skip, limit, title } = request.query as {
      skip?: number
      limit?: number
      title?: string
    }
    const filter = title ? { title: new RegExp(title, 'i') } : {}
    const data = await todos.find(filter, { limit, skip }).toArray()
    const totalCount = await todos.countDocuments(filter)
    return { data, totalCount }
  }
})
```

**Paginazione:** `skip` salta i primi N risultati, `limit` limita il numero restituito. `totalCount` permette al client di calcolare il numero totale di pagine.

### `readTodo`

```ts
fastify.route({
  method: 'GET',
  url: '/:id',
  handler: async function readTodo(request, reply) {
    const { id } = request.params as { id: string }
    const todo = await todos.findOne(
      { _id: new fastify.mongo.ObjectId(id) },
      { projection: { _id: 0 } }   // esclude _id dalla risposta
    )
    if (!todo) {
      return reply.code(404).send({ error: 'Todo not found' })
    }
    return todo
  }
})
```

`projection: { _id: 0 }` esclude il campo MongoDB dall'output: il client vede solo `id` (campo esposto esplicitamente), non `_id`.

### `updateTodo`

```ts
fastify.route({
  method: 'PUT',
  url: '/:id',
  handler: async function updateTodo(request, reply) {
    const { id } = request.params as { id: string }
    const res = await todos.updateOne(
      { _id: new fastify.mongo.ObjectId(id) },
      { $set: { ...request.body, modifiedAt: new Date() } }
    )
    if (res.modifiedCount === 0) {
      return reply.code(404).send({ error: 'Todo not found' })
    }
    reply.code(204)
  }
})
```

### `deleteTodo`

```ts
fastify.route({
  method: 'DELETE',
  url: '/:id',
  handler: async function deleteTodo(request, reply) {
    const { id } = request.params as { id: string }
    const res = await todos.deleteOne({ _id: new fastify.mongo.ObjectId(id) })
    if (res.deletedCount === 0) {
      return reply.code(404).send({ error: 'Todo not found' })
    }
    reply.code(204)
  }
})
```

### `changeStatus`

```ts
fastify.route({
  method: 'POST',
  url: '/:id/:status',
  handler: async function changeStatus(request, reply) {
    const { id, status } = request.params as { id: string; status: string }
    const done = status === 'done'
    const res = await todos.updateOne(
      { _id: new fastify.mongo.ObjectId(id) },
      { $set: { done, modifiedAt: new Date() } }
    )
    if (res.modifiedCount === 0) {
      return reply.code(404).send({ error: 'Todo not found' })
    }
    reply.code(204)
  }
})
```

---

## Validazione — il problema senza schema

Senza schema, il client può iniettare campi arbitrari nel DB:

```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "task", "foo": "bar"}'

# → {"_id": "...", "title": "task", "foo": "bar", ...} salvato nel DB
```

Soluzione: aggiungere uno schema a ogni route. Fastify scarta automaticamente i campi non dichiarati (con `additionalProperties: false` in JSON Schema, o con Zod che fa strip di default).

---

## Validazione con Zod (raccomandato)

Il template include già `zod` e `@fastify/type-provider-zod`. Usali invece dei file `.json`.

### Setup del type provider

```ts
// src/app.ts
import { ZodTypeProvider, serializerCompiler, validatorCompiler } from '@fastify/type-provider-zod'

const app = Fastify().withTypeProvider<ZodTypeProvider>()
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)
```

### Definire gli schema in `routes/todos/schemas.ts`

```ts
import { z } from 'zod/v4'

export const CreateBodySchema = z.object({
  title: z.string()
})

export const CreateResponseSchema = z.object({
  id: z.string()
})

export const ListQuerySchema = z.object({
  title: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  skip: z.coerce.number().int().min(0).default(0)
})

export const IdParamsSchema = z.object({
  id: z.string()
})

export const StatusParamsSchema = z.object({
  id: z.string(),
  status: z.enum(['done', 'undone'])
})

export const TodoSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean(),
  createdAt: z.date(),
  modifiedAt: z.date()
})
```

### Route con schema Zod

```ts
import type { FastifyPluginAsyncZod } from '@fastify/type-provider-zod'
import {
  CreateBodySchema,
  CreateResponseSchema,
  ListQuerySchema,
  IdParamsSchema,
  StatusParamsSchema,
  TodoSchema
} from './schemas.ts'

const todoRoutes: FastifyPluginAsyncZod = async (fastify) => {
  fastify.route({
    method: 'POST',
    url: '/',
    schema: {
      body: CreateBodySchema,
      response: { 201: CreateResponseSchema }
    },
    handler: async function createTodo(request, reply) {
      // request.body è tipizzato come { title: string } — nessun cast
      const _id = new fastify.mongo.ObjectId()
      const now = new Date()
      await todos.insertOne({
        _id, id: _id,
        title: request.body.title,  // solo title — altri campi ignorati da Zod
        done: false, createdAt: now, modifiedAt: now
      })
      reply.code(201)
      return { id: _id.toString() }
    }
  })

  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      querystring: ListQuerySchema,
      response: { 200: z.object({ data: z.array(TodoSchema), totalCount: z.number() }) }
    },
    handler: async function listTodo(request, reply) {
      const { skip, limit, title } = request.query  // tipizzato automaticamente
      const filter = title ? { title: new RegExp(title, 'i') } : {}
      const data = await todos.find(filter, { limit, skip }).toArray()
      const totalCount = await todos.countDocuments(filter)
      return { data, totalCount }
    }
  })

  fastify.route({
    method: 'POST',
    url: '/:id/:status',
    schema: {
      params: StatusParamsSchema   // status è z.enum(['done', 'undone']) — validato automaticamente
    },
    handler: async function changeStatus(request, reply) {
      const { id, status } = request.params  // status: 'done' | 'undone' — tipo inferito
      // ...
      reply.code(204)
    }
  })
}
```

**Vantaggi Zod rispetto a JSON Schema:**
- Tipi TypeScript inferiti automaticamente — nessun `as { id: string }` nei handler
- Composizione tramite `.extend()`, `.pick()`, `.omit()` invece di `$ref`
- Errori di validazione più leggibili
- Un unico file `.ts` invece di più file `.json`

---

## Validazione con JSON Schema (approccio classico)

Se preferisci i file JSON, il pattern del libro funziona ancora in v5.

### `schemas/loader.ts`

```ts
import fp from 'fastify-plugin'

export default fp(async function schemaLoader(fastify) {
  fastify.addSchema(await import('./create-body.json', { assert: { type: 'json' } }))
  fastify.addSchema(await import('./create-response.json', { assert: { type: 'json' } }))
  fastify.addSchema(await import('./list-query.json', { assert: { type: 'json' } }))
  fastify.addSchema(await import('./status-params.json', { assert: { type: 'json' } }))
})
```

> Con Node ≥ 24 e `"type": "module"`, usare `import()` con `assert: { type: 'json' }` oppure `JSON.parse(readFileSync(...))`.

### `create-body.json`

```json
{
  "$id": "schema:todo:create:body",
  "type": "object",
  "required": ["title"],
  "additionalProperties": false,
  "properties": {
    "title": { "type": "string" }
  }
}
```

### `status-params.json`

```json
{
  "$id": "schema:todo:status:params",
  "type": "object",
  "required": ["id", "status"],
  "additionalProperties": false,
  "properties": {
    "id": { "type": "string" },
    "status": { "type": "string", "enum": ["done", "undone"] }
  }
}
```

> `enum` qui è una keyword **JSON Schema**, non `enum` TypeScript. È sintassi erasable-safe.

### Schema condivisi con `$ref`

Per proprietà riutilizzabili (es. `limit`, `skip`):

```json
{
  "$id": "schema:todo:list:query",
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "title": { "type": "string" },
    "limit": { "$ref": "schema:pagination#/properties/limit" },
    "skip":  { "$ref": "schema:pagination#/properties/skip" }
  }
}
```

Con Zod: `z.object({ limit: PaginationSchema.shape.limit, skip: PaginationSchema.shape.skip })`.

### Route con JSON Schema

```ts
fastify.route({
  method: 'POST',
  url: '/',
  schema: {
    body: fastify.getSchema('schema:todo:create:body'),
    response: { 201: fastify.getSchema('schema:todo:create:response') }
  },
  handler: async function createTodo(request, reply) {
    // request.body non è tipizzato automaticamente — serve cast o augmentation
    const body = request.body as { title: string }
    // ...
  }
})
```

---

## Autohooks — caricare schema e data source

Il plugin `routes/todos/hooks.ts` viene caricato automaticamente da `@fastify/autoload` grazie a `autoHooks: true` (vedi cap. 6). È il posto giusto per:
1. Registrare gli schema della feature
2. Inizializzare il data source e decorare l'istanza

```ts
import fp from 'fastify-plugin'
import schemaLoader from './schemas/loader.ts'

export default fp(async function todoHooks(fastify) {
  // 1. schema della feature
  await fastify.register(schemaLoader)

  // 2. data source come decorator — pattern DRY
  const todos = fastify.mongo.db.collection('todos')

  fastify.decorate('todoDataSource', {
    async create(title: string) {
      const _id = new fastify.mongo.ObjectId()
      const now = new Date()
      const { insertedId } = await todos.insertOne({
        _id, id: _id, title,
        done: false, createdAt: now, modifiedAt: now
      })
      return insertedId.toString()
    },

    async list(filter: object, skip: number, limit: number) {
      const data = await todos.find(filter, { skip, limit }).toArray()
      const totalCount = await todos.countDocuments(filter)
      return { data, totalCount }
    },

    async findById(id: string) {
      return todos.findOne(
        { _id: new fastify.mongo.ObjectId(id) },
        { projection: { _id: 0 } }
      )
    },

    async update(id: string, patch: object) {
      const res = await todos.updateOne(
        { _id: new fastify.mongo.ObjectId(id) },
        { $set: { ...patch, modifiedAt: new Date() } }
      )
      return res.modifiedCount > 0
    },

    async remove(id: string) {
      const res = await todos.deleteOne({ _id: new fastify.mongo.ObjectId(id) })
      return res.deletedCount > 0
    }
  })
})

// TypeScript augmentation
declare module 'fastify' {
  interface FastifyInstance {
    todoDataSource: {
      create(title: string): Promise<string>
      list(filter: object, skip: number, limit: number): Promise<{ data: unknown[]; totalCount: number }>
      findById(id: string): Promise<unknown | null>
      update(id: string, patch: object): Promise<boolean>
      remove(id: string): Promise<boolean>
    }
  }
}
```

---

## Pattern DRY negli handler

Con il data source nel decorator, gli handler diventano thin:

```ts
fastify.route({
  method: 'POST',
  url: '/',
  schema: {
    body: CreateBodySchema,
    response: { 201: CreateResponseSchema }
  },
  handler: async function createTodo(request, reply) {
    const id = await this.todoDataSource.create(request.body.title)
    reply.code(201)
    return { id }
  }
})

fastify.route({
  method: 'GET',
  url: '/:id',
  schema: { params: IdParamsSchema },
  handler: async function readTodo(request, reply) {
    const todo = await this.todoDataSource.findById(request.params.id)
    if (!todo) return reply.code(404).send({ error: 'Todo not found' })
    return todo
  }
})
```

**`this` vs closure:** negli handler `function` (non arrow), `this` è l'istanza Fastify — accessibile anche con `fastify` dalla closure. In TypeScript, `this` negli handler è inferito correttamente solo se il plugin usa il type provider.

---

## Struttura finale della feature

```
routes/
└─┬ todos/
  ├── hooks.ts          ← autohook: schemaLoader + todoDataSource decorator
  ├── routes.ts         ← handler thin, usa this.todoDataSource
  └── schemas/
      ├── loader.ts     ← addSchema() per tutti i json schema
      ├── create-body.json
      ├── create-response.json
      ├── list-query.json
      └── status-params.json
```

Con Zod, `schemas/loader.ts` e i file `.json` sono sostituiti da un unico `schemas.ts`.

---

## Riepilogo scelte

| Aspetto | JSON Schema (libro) | Zod (raccomandato) |
|---|---|---|
| Tipo inferito handler | No — serve cast | Sì — automatico |
| Schema condivisi | `$ref` + `addSchema` | import + composizione |
| File aggiuntivi | Molti `.json` | Un unico `.ts` |
| Compatibilità Swagger | ✅ (OAS 3.0 via conversione) | ✅ (via `@fastify/type-provider-zod`) |
| Curva di apprendimento | Bassa | Media |

Riferimenti: [`../fastify-docs/Routes-Fastify.md`](../fastify-docs/Routes-Fastify.md), [`../fastify-docs/Validation-and-Serialization.md`](../fastify-docs/Validation-and-Serialization.md), [`../fastify-docs/Decorators.md`](../fastify-docs/Decorators.md)
