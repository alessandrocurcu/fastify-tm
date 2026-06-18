# Database connection with Drizzle

Drizzle ORM runs SQL queries on your database via **database drivers**.

index.ts

schema.ts

```ts
import { drizzle } from "drizzle-orm/node-postgres"
import { users } from "./schema"

const db = drizzle(process.env.DATABASE_URL);
const usersCount = await db.$count(users);
``````plaintext
                        ┌──────────────────────┐
                        │   db.$count(users)   │ <--- drizzle query
                        └──────────────────────┘
                            │               ʌ
select count(*) from users -│               │
                            │               │- [{ count: 0 }]
                            v               │
                         ┌─────────────────────┐
                         │    node-postgres    │ <--- database driver
                         └─────────────────────┘
                            │               ʌ
01101000 01100101 01111001 -│               │
                            │               │- 01110011 01110101 01110000
                            v               │
                         ┌────────────────────┐
                         │      Database      │
                         └────────────────────┘
```

Under the hood Drizzle will create a **node-postgres** driver instance which you can access via `db.$client` if necessary

```ts
import { drizzle } from "drizzle-orm/node-postgres"

const db = drizzle(process.env.DATABASE_URL);
const pool = db.$client;
``````ts
// above is equivalent to
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle({ client: pool });
```

Drizzle is by design natively compatible with every **edge** or **serverless** runtime, whenever you’d need access to a serverless database - we’ve got you covered

Neon HTTP

Neon with websockets

Vercel Postgres

PlanetScale HTTP

Cloudflare d1

```ts
import { drizzle } from "drizzle-orm/neon-http";

const db = drizzle(process.env.DATABASE_URL);
```

And yes, we do support runtime specific drivers like [Bun SQLite](https://orm.drizzle.team/docs/connect-bun-sqlite) or [Expo SQLite](https://orm.drizzle.team/docs/connect-expo-sqlite):

```ts
import { drizzle } from "drizzle-orm/bun-sqlite"

const db = drizzle(); // <--- will create an in-memory db
const db = drizzle("./sqlite.db");
``````ts
import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

const expo = openDatabaseSync("db.db");
const db = drizzle(expo);
```

#### Database connection URL

Just in case if you’re not familiar with database connection URL concept

```plaintext
postgresql://alex:AbC123dEf@ep-cool-darkness-123456.us-east-2.aws.neon.tech/dbname
             └──┘ └───────┘ └─────────────────────────────────────────────┘ └────┘
              ʌ    ʌ          ʌ                                              ʌ
        role -│    │          │- hostname                                    │- database
                   │
                   │- password
```

#### Next steps

Feel free to check out per-driver documentations

**PostgreSQL drivers**

[PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)[Neon](https://orm.drizzle.team/docs/connect-neon)[Vercel Postgres](https://orm.drizzle.team/docs/connect-vercel-postgres)[Supabase](https://orm.drizzle.team/docs/connect-supabase)[Xata](https://orm.drizzle.team/docs/connect-xata)[PGLite](https://orm.drizzle.team/docs/connect-pglite)

**MySQL drivers**

[MySQL](https://orm.drizzle.team/docs/get-started-mysql)[PlanetsScale](https://orm.drizzle.team/docs/connect-planetscale)[TiDB](https://orm.drizzle.team/docs/connect-tidb)

**SQLite drivers**

[SQLite](https://orm.drizzle.team/docs/get-started-sqlite)[Turso Cloud](https://orm.drizzle.team/docs/connect-turso)[Turso Database](https://orm.drizzle.team/docs/connect-turso-database)[Cloudflare D1](https://orm.drizzle.team/docs/connect-cloudflare-d1)[Bun SQLite](https://orm.drizzle.team/docs/connect-bun-sqlite)[SQLite Cloud](https://orm.drizzle.team/docs/connect-sqlite-cloud)

**Native SQLite**

[Expo SQLite](https://orm.drizzle.team/docs/get-started/expo-new)[OP SQLite](https://orm.drizzle.team/docs/connect-op-sqlite)[React Native SQLite](https://orm.drizzle.team/docs/connect-react-native-sqlite)

**Others**

[Drizzle Proxy](https://orm.drizzle.team/docs/connect-drizzle-proxy)