# PostgreSQL | Better Auth

[Link](https://better-auth.com/)

[readme](https://better-auth.com/)

[docs](https://better-auth.com/docs)

products

[enterprise](https://better-auth.com/enterprise)

resources

[sign-in](https://dash.better-auth.com/sign-in)

# PostgreSQL

Integrate Better Auth with PostgreSQL.

PostgreSQL is a powerful, open-source relational database management system known for its advanced features, extensibility, and support for complex queries and large datasets. Read more about [PostgreSQL](https://www.postgresql.org/).

## [Example Usage](https://better-auth.com/docs/adapters/postgresql#example-usage)

Make sure you have PostgreSQL installed and configured. Then, you can connect it straight into Better Auth.

auth.ts

```
import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: "postgres://user:password@localhost:5432/database",
  }),
});
```

*auth.ts*

For more information, read Kysely's documentation to the [PostgresDialect](https://kysely-org.github.io/kysely-apidoc/classes/PostgresDialect.html).

## [Schema generation & migration](https://better-auth.com/docs/adapters/postgresql#schema-generation--migration)

The [Better Auth CLI](https://better-auth.com/docs/concepts/cli) allows you to generate or migrate your database schema based on your Better Auth configuration and plugins.

| PostgreSQL Schema Generation | PostgreSQL Schema Migration |
| --- | --- |
| ✅ Supported | ✅ Supported |

```
pnpm dlx auth@latest migrate
```

## [Joins (Experimental)](https://better-auth.com/docs/adapters/postgresql#joins-experimental)

Database joins is useful when Better-Auth needs to fetch related data from multiple tables in a single query. Endpoints like `/get-session`, `/get-full-organization` and many others benefit greatly from this feature, seeing upwards of 2x to 3x performance improvements depending on database latency.

The Kysely PostgreSQL dialect supports joins out of the box since version `1.4.0`. To enable this feature, you need to set the `experimental.joins` option to `true` in your auth configuration.

auth.ts

```
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  experimental: { joins: true }
});
```

*auth.ts*

It's possible that you may need to run migrations after enabling this feature.

## [Use a non-default schema](https://better-auth.com/docs/adapters/postgresql#use-a-non-default-schema)

In most cases, the default schema is `public`. To have Better Auth use a non-default schema (e.g., `auth`) for its tables, you have several options:

### [Option 1: Set search_path in connection string (Recommended)](https://better-auth.com/docs/adapters/postgresql#option-1-set-search_path-in-connection-string-recommended)

Append the `options` parameter to your connection URI:

auth.ts

```
import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: "postgres://user:password@localhost:5432/database?options=-c search_path=auth",
  }),
});
```

*auth.ts*

URL-encode if needed: `?options=-c%20search_path%3Dauth`.

### [Option 2: Set search_path using Pool options](https://better-auth.com/docs/adapters/postgresql#option-2-set-search_path-using-pool-options)

auth.ts

```
import { betterAuth } from "better-auth";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "password",
    database: "my-db",
    options: "-c search_path=auth",
  }),
});
```

*auth.ts*

### [Option 3: Set default schema for database user](https://better-auth.com/docs/adapters/postgresql#option-3-set-default-schema-for-database-user)

Set the PostgreSQL user's default schema:

```
ALTER USER your_user SET search_path TO auth;
```

After setting this, reconnect to apply the changes.

### [Prerequisites](https://better-auth.com/docs/adapters/postgresql#prerequisites)

Before using a non-default schema, ensure:

1. **The schema exists:** ```
CREATE SCHEMA IF NOT EXISTS auth;
```
2. **The user has appropriate permissions:** ```
GRANT ALL PRIVILEGES ON SCHEMA auth TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA auth TO your_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA auth GRANT ALL ON TABLES TO your_user;
```

### [How it works](https://better-auth.com/docs/adapters/postgresql#how-it-works)

The Better Auth CLI migration system automatically detects your configured `search_path`:

- When running `npx auth migrate`, it inspects only the tables in your configured schema
- Tables in other schemas (e.g., `public`) are ignored, preventing conflicts
- All new tables are created in your specified schema

### [Troubleshooting](https://better-auth.com/docs/adapters/postgresql#troubleshooting)

**Issue:** "relation does not exist" error during migration

**Solution:** This usually means the schema doesn't exist or the user lacks permissions. Create the schema and grant permissions as shown above.

**Verifying your schema configuration:**

You can verify which schema Better Auth will use by checking the `search_path`:

```
SHOW search_path;
```

This should return your custom schema (e.g., `auth`) as the first value.

## [Additional Information](https://better-auth.com/docs/adapters/postgresql#additional-information)

PostgreSQL is supported under the hood via the [Kysely](https://kysely.dev/) adapter, any database supported by Kysely would also be supported. ([Read more here](https://better-auth.com/docs/adapters/other-relational-databases))

If you're looking for performance improvements or tips, take a look at our guide to [performance optimizations](https://better-auth.com/docs/guides/optimizing-for-performance).

[Edit on GitHub](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/adapters/postgresql.mdx)

### On this page

[Example Usage](https://better-auth.com/docs/adapters/postgresql#example-usage)[Schema generation & migration](https://better-auth.com/docs/adapters/postgresql#schema-generation--migration)[Joins (Experimental)](https://better-auth.com/docs/adapters/postgresql#joins-experimental)[Use a non-default schema](https://better-auth.com/docs/adapters/postgresql#use-a-non-default-schema)[Option 1: Set search_path in connection string (Recommended)](https://better-auth.com/docs/adapters/postgresql#option-1-set-search_path-in-connection-string-recommended)[Option 2: Set search_path using Pool options](https://better-auth.com/docs/adapters/postgresql#option-2-set-search_path-using-pool-options)[Option 3: Set default schema for database user](https://better-auth.com/docs/adapters/postgresql#option-3-set-default-schema-for-database-user)[Prerequisites](https://better-auth.com/docs/adapters/postgresql#prerequisites)[How it works](https://better-auth.com/docs/adapters/postgresql#how-it-works)[Troubleshooting](https://better-auth.com/docs/adapters/postgresql#troubleshooting)[Additional Information](https://better-auth.com/docs/adapters/postgresql#additional-information)