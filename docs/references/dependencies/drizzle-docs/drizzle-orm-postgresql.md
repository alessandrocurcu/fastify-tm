# Drizzle <> PostgreSQL

This guide assumes familiarity with:

- Database [connection basics](https://orm.drizzle.team/docs/connect-overview) with Drizzle
- node-postgres [basics](https://node-postgres.com/)
- postgres.js [basics](https://github.com/porsager/postgres?tab=readme-ov-file#usage)

Drizzle has native support for PostgreSQL connections with the `node-postgres` and `postgres.js` drivers.

There are a few differences between the `node-postgres` and `postgres.js` drivers that we discovered while using both and integrating them with the Drizzle ORM. For example:

- With `node-postgres`, you can install `pg-native` to boost the speed of both `node-postgres` and Drizzle by approximately 10%.
- `node-postgres` supports providing type parsers on a per-query basis without globally patching things. For more details, see [Types Docs](https://node-postgres.com/features/queries#types).
- `postgres.js` uses prepared statements by default, which you may need to opt out of. This could be a potential issue in AWS environments, among others, so please keep that in mind.
- If there’s anything else you’d like to contribute, we’d be happy to receive your PRs [here](https://github.com/drizzle-team/drizzle-orm-docs/pulls)

## node-postgres

#### Step 1 - Install packages

npm

yarn

pnpm

bun

```shell
pnpm add drizzle-orm pg
pnpm add -D drizzle-kit @types/pg
```

#### Step 2 - Initialize the driver and make a query

node-postgres

node-postgres with config

```typescript
// Make sure to install the 'pg' package
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(process.env.DATABASE_URL);

const result = await db.execute('select 1');
```

If you need to provide your existing driver:

```typescript
// Make sure to install the 'pg' package
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle({ client: pool });

const result = await db.execute('select 1');
```

## postgres.js

#### Step 1 - Install packages

npm

yarn

pnpm

bun

```shell
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

#### Step 2 - Initialize the driver and make a query

postgres.js

postgres.js with config

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';

const db = drizzle(process.env.DATABASE_URL);

const result = await db.execute('select 1');
```

If you need to provide your existing driver:

```typescript
// Make sure to install the 'postgres' package
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const queryClient = postgres(process.env.DATABASE_URL);
const db = drizzle({ client: queryClient });

const result = await db.execute('select 1');
```

#### What’s next?

**Manage schema**

[Drizzle Schema](https://orm.drizzle.team/docs/sql-schema-declaration)[PostgreSQL data types](https://orm.drizzle.team/docs/column-types/pg)[Indexes and Constraints](https://orm.drizzle.team/docs/indexes-constraints)[Database Views](https://orm.drizzle.team/docs/views)[Database Schemas](https://orm.drizzle.team/docs/schemas)[Sequences](https://orm.drizzle.team/docs/sequences)[Extensions](https://orm.drizzle.team/docs/extensions/pg)

**Query data**

[Relational Queries](https://orm.drizzle.team/docs/rqb)[Select](https://orm.drizzle.team/docs/select)[Insert](https://orm.drizzle.team/docs/insert)[Update](https://orm.drizzle.team/docs/update)[Delete](https://orm.drizzle.team/docs/delete)[Filters](https://orm.drizzle.team/docs/operators)[Joins](https://orm.drizzle.team/docs/joins)[sql`` operator](https://orm.drizzle.team/docs/sql)