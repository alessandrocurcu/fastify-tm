# @fastify/sensible

Un plugin che raccoglie utility che tutti finiscono per riscrivere nelle proprie app, ma che Fastify core non include per rimanere minimale. Il nome è ispirato a `vim-sensible` — configurazioni che "chiunque può concordare siano ragionevoli".

## In breve
Tutto ruota attorno al ciclo request/response:
- errori HTTP → modificano la response
- assert → validano la request (o lo stato) prima di rispondere
- to → gestisce errori in operazioni async che portano a una response
- cache control → header della response
- req.forwarded(), req.is() → ispezione della request

Nello specifico
1. Errori HTTP — httpErrors.*, reply.notFound(), ecc. (la parte più usata)
2. Guard inline — fastify.assert() per validazioni senza try/catch
3. Async error handling — fastify.to(), il pattern Go [err, result]
4. Cache control — reply.preventCache(), reply.staticCache(), reply.cacheControl()
5. Request utilities — req.forwarded(), req.is() per content-type detection
6. Schema condiviso — sharedSchemaId per documentare errori in Swagger

## Installazione e registrazione

```bash
pnpm add @fastify/sensible
```

```typescript
import sensible from '@fastify/sensible';

// Registra prima delle route — con await perché è async
await fastify.register(sensible);
```

---

## 1. `httpErrors` — costruttori per ogni errore HTTP

Il problema che risolve: creare errori HTTP a mano è verboso e inconsistente.

```typescript
// ❌ Senza sensible
const err = new Error('Recipe not found');
(err as any).statusCode = 404;
throw err;

// ✅ Con sensible
throw fastify.httpErrors.notFound('Recipe not found');
throw fastify.httpErrors.unauthorized('Token mancante');
throw fastify.httpErrors.conflict('Titolo già in uso');
throw fastify.httpErrors.badRequest('Body non valido');
throw fastify.httpErrors.forbidden('Non hai i permessi');
throw fastify.httpErrors.internalServerError();
```

Gli errori prodotti hanno già `statusCode` impostato correttamente e si integrano
perfettamente con `setErrorHandler`.

### Errori 4xx disponibili

| Metodo | Status |
|---|---|
| `badRequest()` | 400 |
| `unauthorized()` | 401 |
| `paymentRequired()` | 402 |
| `forbidden()` | 403 |
| `notFound()` | 404 |
| `methodNotAllowed()` | 405 |
| `conflict()` | 409 |
| `gone()` | 410 |
| `unprocessableEntity()` | 422 |
| `tooManyRequests()` | 429 |

### Errori 5xx disponibili

| Metodo | Status |
|---|---|
| `internalServerError()` | 500 |
| `notImplemented()` | 501 |
| `badGateway()` | 502 |
| `serviceUnavailable()` | 503 |
| `gatewayTimeout()` | 504 |

### `createError` — errori custom

```typescript
const err = fastify.httpErrors.createError(418, "I'm a teapot");
```

---

## 2. `reply.[httpError]` — shorthand sulla reply

La stessa cosa ma direttamente sull'oggetto reply, utile quando vuoi rispondere
senza lanciare un'eccezione:

```typescript
fastify.get('/api/v1/recipes/:id', async (request, reply) => {
  const recipe = await recipeRepo.findById(request.params.id);

  if (!recipe) {
    return reply.notFound();
  }

  if (!request.user.canView(recipe)) {
    return reply.forbidden();
  }

  return recipe;
});
```

---

## 3. `assert` — guard inline senza try/catch

Verifica una condizione e lancia l'errore HTTP appropriato se è falsa.
Riduce il rumore di `if (!x) throw ...`:

```typescript
fastify.post('/api/v1/recipes', async (request) => {
  // Se la condizione è falsa, lancia automaticamente l'errore con lo status code indicato
  fastify.assert(request.headers.authorization, 401, 'Token mancante');
  fastify.assert(request.body.title.length > 0, 400, 'Titolo vuoto');
  fastify.assert.equal(request.user.role, 'admin', 403, 'Solo gli admin possono farlo');

  // Se arrivi qui, tutte le condizioni sono soddisfatte
  return recipeRepo.create(request.body);
});
```

### Metodi disponibili

- `fastify.assert(condition, status, message)`
- `fastify.assert.ok(value)`
- `fastify.assert.equal(a, b)`
- `fastify.assert.notEqual(a, b)`
- `fastify.assert.strictEqual(a, b)`
- `fastify.assert.notStrictEqual(a, b)`
- `fastify.assert.deepEqual(a, b)`
- `fastify.assert.notDeepEqual(a, b)`

---

## 4. `to` — async error handling senza try/catch
In Go, le funzioni restituiscono due valori: il risultato e l'errore. Non esiste try/catch:

```go
user, err := db.FindUser(id)
if err != nil {
    // gestisci errore
}
```

fastify.to() porta questo pattern in JavaScript: restituisce `[errore, risultato]` invece di lanciare eccezioni.
Utile quando hai molte operazioni async in sequenza:

```typescript
// ❌ Senza sensible
try {
  const recipe = await recipeRepo.findById(id);
  return recipe;
} catch (err) {
  throw fastify.httpErrors.internalServerError();
}

// ✅ Con sensible
const [err, recipe] = await fastify.to(recipeRepo.findById(id));
if (err) throw fastify.httpErrors.internalServerError();
return recipe;
```

> **Nota:** non è universalmente preferito rispetto a try/catch. Valuta caso per caso
> in base alla leggibilità del codice.

---

## 5. Cache control helpers

Shorthand per gli header di cache HTTP — evita di ricordare la sintassi esatta:

```typescript
// Risposta cacheable a lungo termine (asset statici, dati immutabili)
reply.staticCache(86400);
// → 'public, max-age=86400, immutable'

// Non cacheare mai (dati utente, risposte dinamiche)
reply.preventCache();
// → 'no-store, max-age=0, private'
// → aggiunge anche 'pragma: no-cache' ed 'expires: 0' per HTTP/1.0

// Forza rivalidazione (dati che cambiano spesso)
reply.revalidate();
// → 'max-age=0, must-revalidate'

// Cache configurabile — supporta il formato github.com/vercel/ms
reply.cacheControl('max-age', '1d');   // → 'max-age=86400'
reply.cacheControl('public');
reply.cacheControl('immutable');

// Stale-while-revalidate
reply.maxAge(86400);
reply.stale('while-revalidate', 42);
reply.stale('if-error', 1);
```

---

## 6. `sharedSchemaId` — schema JSON per errori HTTP

Se vuoi documentare gli errori negli schema delle route (utile con `@fastify/swagger`),
puoi registrare uno schema condiviso per tutti gli errori HTTP:

```typescript
await fastify.register(sensible, {
  sharedSchemaId: 'HttpError'
});

fastify.get('/api/v1/recipes/:id', {
  schema: {
    response: {
      200: RecipeSchema,
      404: { $ref: 'HttpError' },
      403: { $ref: 'HttpError' }
    }
  }
}, handler);
```

---

## 7. Utility sulla request

```typescript
// request.forwarded() — lista degli indirizzi IP (proxy chain)
fastify.get('/', (req, reply) => {
  reply.send(req.forwarded());
});

// request.is() — verifica il Content-Type della richiesta
fastify.post('/', (req, reply) => {
  if (req.is(['json'])) {
    // il body è JSON
  }
});
```

---

## Integrazione con `setErrorHandler`

`httpErrors` e `setErrorHandler` lavorano insieme: gli errori creati con sensible
arrivano già con `statusCode` impostato, quindi l'error handler non deve fare nulla
di speciale per distinguerli:

```typescript
fastify.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode ?? 500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    request.log.error({ err: error }, 'Server error');
    return reply.status(500).send({
      error: { code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred' }
    });
  }

  // Gli errori di sensible (4xx) arrivano qui già formattati
  return reply.status(statusCode).send({
    error: { code: error.code ?? 'ERROR', message: error.message }
  });
});

// Negli handler, basta lanciare
throw fastify.httpErrors.notFound('Recipe not found');
// → arriva all'error handler con statusCode: 404 già impostato ✅
```

---

## Compatibilità

| Plugin version | Fastify version |
|---|---|
| `>=6.x` | `^5.x` |
| `^5.x` | `^4.x` |
| `^4.x` | `^3.x` |