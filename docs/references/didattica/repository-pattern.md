# Repository Pattern in Fastify

## Il problema che risolve

Senza il pattern, le route chiamano il DB direttamente:

```ts
async function listUsers() {
  return fastify.db.prepare('SELECT * FROM users').all() as User[]
}
```

La route sa di SQL, del nome della tabella, della struttura del DB. Se cambi storage, tocchi le route.

## Come si mappa su Fastify

In NestJS/Spring il repository viene iniettato via DI container nel constructor. In Fastify non hai un DI container — la "iniezione" avviene tramite il sistema di plugin e decorator:

```ts
// plugins/users-repository.ts
import fp from 'fastify-plugin'

const usersRepository = fp(async (fastify) => {
  fastify.decorate('usersRepo', {
    findAll: () =>
      fastify.db.prepare('SELECT * FROM users').all() as User[],
    findById: (id: number) =>
      fastify.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined,
  })
})

export default usersRepository
```

```ts
// routes/users.ts — la route non sa di SQL
async function listUsers() {
  return fastify.usersRepo.findAll()
}
```

## Vantaggi

- **Testabilità** — nei test puoi sovrascrivere `fastify.usersRepo` con un mock senza toccare il DB
- **Separazione** — le route non sanno di SQL; se cambi da SQLite a Postgres tocchi solo il repository
- **Leggibilità** — `findById(id)` è più chiaro di `db.prepare('SELECT...').get(id)`

## Il trade-off

Aggiungi un layer. Ha senso quando:
- hai logica di accesso ai dati non banale (join, transazioni, business rules)
- vuoi testare le route in isolamento dal DB
- il team cresce e vuoi confini netti

Per un CRUD semplice su SQLite, chiamare `fastify.db.prepare(...)` direttamente nella route è già leggibile e corretto.

## Il plugin va registrato sull'istanza Fastify

Un plugin è solo una funzione — finché non la registri, non succede nulla:

```ts
// questa è solo una funzione TypeScript — non fa niente da sola
const usersRepository = fp(async (fastify) => {
  fastify.decorate('usersRepo', { ... })
})

// register la esegue e aggiunge 'usersRepo' all'istanza
await app.register(usersRepository)

// ora funziona
app.usersRepo.findAll()
```

`register` fa tre cose:
1. Chiama la funzione plugin passandole l'istanza Fastify
2. Gestisce lo scope (isolato, oppure globale se usi `fp()`)
3. Aspetta che il plugin finisca prima di procedere (se usi `await`)

### L'ordine di registrazione è il grafo delle dipendenze

Dato che le dipendenze vengono risolte nell'ordine di registrazione, devi registrare prima le dipendenze:

```ts
await app.register(db)           // aggiunge fastify.db
await app.register(usersRepo)    // può usare fastify.db ✅
await app.register(usersRoutes)  // può usare fastify.usersRepo ✅

// invertire l'ordine causa errore a runtime:
await app.register(usersRoutes)  // fastify.usersRepo non esiste ancora ❌
await app.register(usersRepo)
```

Questo è esattamente il punto che distingue Fastify da un DI container: l'ordine di registrazione in `index.ts` è il "grafo delle dipendenze" esplicito.

---

## `decorate` è il modo con cui Fastify fa DI?

Sì — con una precisazione.

`decorate` è il meccanismo con cui Fastify realizza qualcosa di funzionalmente equivalente alla DI, ma non è DI nel senso tecnico tradizionale.

**DI classica** (Spring, NestJS): un container gestisce il ciclo di vita degli oggetti, risolve le dipendenze automaticamente e le inietta nei constructor. Il consumer dichiara *cosa vuole*, il container decide *come ottenerlo*.

**Fastify con `decorate`**: non c'è un container. Le dipendenze vengono registrate sull'istanza `fastify` nell'ordine in cui i plugin vengono caricati, e i consumer le leggono direttamente da `fastify.qualcosa`. Il wiring è esplicito — sei tu che decidi l'ordine di registrazione.

```ts
// DI classica — il framework risolve la dipendenza
class UsersService {
  constructor(private repo: UsersRepository) {}  // iniettato dal container
}

// Fastify — leggi direttamente dall'istanza
const usersPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.usersRepo.findAll()  // disponibile perché il plugin db è stato registrato prima
}
```

La differenza pratica più importante: in Fastify **l'ordine dei plugin conta**. Se provi ad accedere a `fastify.db` prima che il plugin db sia stato registrato, ottieni un errore a runtime. Un DI container classico risolve le dipendenze indipendentemente dall'ordine in cui le dichiari.

Stessa intenzione (disaccoppiare le dipendenze), meccanismo diverso (istanza condivisa vs container).

---

## Disaccoppiare l'interfaccia dall'implementazione

Il repository nasconde **come** accedi ai dati, non **che tipo di DB** stai usando. Migrare da SQLite a PostgreSQL richiede comunque di riscrivere i metodi del repository — ma li riscrivi in un solo posto invece di cercarli sparsi nelle route.

Il vantaggio reale non è "zero modifiche", è **confinamento delle modifiche**:

| Senza repository | Con repository |
|---|---|
| Cerchi SQL in tutte le route | Tutte le query sono in un file |
| Tocchi N file | Tocchi 1 file |
| Le route cambiano | Le route non cambiano |

Per massimizzare questo vantaggio ha senso separare l'interfaccia dall'implementazione:

```ts
// il contratto stabile — le route dipendono solo da questo
interface UsersRepository {
  findAll: () => Promise<User[]>
  findById: (id: number) => Promise<User | undefined>
}

// implementazione SQLite
const sqliteUsersRepository: UsersRepository = {
  findAll: async () => db.prepare('SELECT * FROM users').all() as User[],
  findById: async (id) => db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined,
}

// implementazione PostgreSQL — stessa interfaccia, implementazione diversa
const postgresUsersRepository: UsersRepository = {
  findAll: async () => (await pool.query('SELECT * FROM users')).rows,
  findById: async (id) => (await pool.query('SELECT * FROM users WHERE id = $1', [id])).rows[0],
}
```

Le route dipendono dall'interfaccia, non dall'implementazione — non sanno e non gli importa quale DB c'è sotto. Questo è il principio **Dependency Inversion** (la D di SOLID).

### Rendi l'interfaccia asincrona fin dall'inizio

SQLite (`better-sqlite3`) è sincrono, PostgreSQL è asincrono. Se l'interfaccia è sincrona e un giorno passi a PostgreSQL, devi riscrivere l'interfaccia e tutte le route che la usano.

Definisci sempre l'interfaccia con `Promise<>` — anche se SQLite non ne ha bisogno. Il costo è trascurabile, la flessibilità è reale:

```ts
// ✅ interfaccia asincrona — funziona con qualsiasi DB
interface UsersRepository {
  findAll: () => Promise<User[]>
  findById: (id: number) => Promise<User | undefined>
}
```

---

## Dove mettere i test: route o use-case?

Una posizione comune è che i test di unità non dovrebbero stare al livello delle route, ma al livello dello **use-case**. Ha senso in un'architettura a layer:

```
Route (HTTP)     → gestisce request/response, niente logica
Use Case         → logica di business ("crea un utente", "approva un ordine")
Repository       → accesso ai dati
```

I test di unità stanno sugli use-case perché è lì che vive la logica che può rompersi. Le route sono "thin" — deserializzano l'input, chiamano lo use-case, serializzano l'output.

```ts
// use-case — logica testabile in isolamento, niente Fastify, niente DB
async function createUser(repo: UsersRepository, data: CreateUser): Promise<User> {
  const existing = await repo.findByEmail(data.email)
  if (existing) throw new ConflictError('email già in uso')
  return repo.create(data)
}

// route — thin, niente logica
fastify.post('/users', async (request, reply) => {
  const user = await createUser(fastify.usersRepo, request.body)
  return reply.status(201).send(user)
})
```

`createUser` puoi testarlo passando un repository mock — niente HTTP, niente DB.

### Quando ha senso, quando è over-engineering

La domanda da farsi è: *c'è logica qui che potrebbe rompersi indipendentemente dal DB e dall'HTTP?*

- **Sì** → estraila in uno use-case e testala lì con unit test
- **No** → un integration test sulla route con `fastify.inject()` copre tutto senza aggiungere layer inutili

Molte applicazioni CRUD non hanno use-case veri — sono "prendi dal DB → restituisci al client". In quel caso aggiungere un layer use-case è architettura per l'architettura.

### Come riconoscere quando serve un use-case

Un modo pratico: **la logica ha un nome nel dominio del problema?**

"Crea un utente" non è business logic — è CRUD. Ma:

- "Registra un utente" → controlla email duplicata, manda email di conferma, crea un wallet di default
- "Approva un ordine" → verifica stock, scala la disponibilità, notifica il magazzino, aggiorna lo stato
- "Cancella un account" → anonimizza i dati personali, mantieni la storia degli ordini, revoca i token

Questi hanno un nome, hanno regole, possono fallire in modi che non dipendono né dall'HTTP né dal DB.

Un altro segnale: **la stessa logica appare in più di un posto** — es. una regola di business chiamata da una route REST e da un job schedulato. In quel caso estrarla in uno use-case evita la duplicazione, non è purezza architetturale.

La regola in breve:

> CRUD semplice → route + repository + integration test con `fastify.inject()`  
> Logica con nome nel dominio → use-case + unit test con repository mock

---

## Differenza da NestJS

| | NestJS | Fastify |
|---|---|---|
| Meccanismo di iniezione | DI container + `@Injectable()` | plugin + `fastify.decorate()` |
| Scope | class instance | oggetto decorato sull'istanza Fastify |
| Interfaccia esplicita | ✅ (TypeScript interface + token) | via module augmentation (`declare module 'fastify'`) |
| Testabilità | mock del provider | override del decorator |
