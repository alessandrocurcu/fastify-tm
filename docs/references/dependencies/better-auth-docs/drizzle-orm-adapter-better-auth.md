# Drizzle ORM Adapter | Better Auth

[Link](https://better-auth.com/)

[readme](https://better-auth.com/)

[docs](https://better-auth.com/docs)

products

[enterprise](https://better-auth.com/enterprise)

resources

[sign-in](https://dash.better-auth.com/sign-in)

# Drizzle ORM Adapter

Integrate Better Auth with Drizzle ORM.

Drizzle ORM is a powerful and flexible ORM for Node.js and TypeScript. It provides a simple and intuitive API for working with databases, and supports a wide range of databases including MySQL, PostgreSQL, SQLite, and more.

Before getting started, make sure you have Drizzle installed and configured. For more information, see [Drizzle Documentation](https://orm.drizzle.team/docs/overview/)

## [Installation](https://better-auth.com/docs/adapters/drizzle#installation)

To use the Drizzle adapter, you need to install the `@better-auth/drizzle-adapter` package:

```
pnpm add @better-auth/drizzle-adapter
```

## [Example Usage](https://better-auth.com/docs/adapters/drizzle#example-usage)

You can use the Drizzle adapter to connect to your database as follows.

auth.ts

```
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "./database.ts";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite", // or "pg" or "mysql"
  }),
  //... the rest of your config
});
```

*auth.ts*

## [Schema generation & migration](https://better-auth.com/docs/adapters/drizzle#schema-generation--migration)

The [Better Auth CLI](https://better-auth.com/docs/concepts/cli) allows you to generate or migrate your database schema based on your Better Auth configuration and plugins.

To generate the schema required by Better Auth, run the following command:

```
pnpm dlx auth@latest generate
```

To generate and apply the migration, run the following commands:

```
pnpm dlx drizzle-kit generate # generate the migration file
```

## [Joins (Experimental)](https://better-auth.com/docs/adapters/drizzle#joins-experimental)

Database joins is useful when Better-Auth needs to fetch related data from multiple tables in a single query. Endpoints like `/get-session`, `/get-full-organization` and many others benefit greatly from this feature, seeing upwards of 2x to 3x performance improvements depending on database latency.

The Drizzle adapter supports joins out of the box since version `1.4.0`. To enable this feature, you need to set the `experimental.joins` option to `true` in your auth configuration.

auth.ts

```
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  experimental: { joins: true }
});
```

*auth.ts*

Please make sure that your Drizzle schema has the necessary relations defined. If you do not see any relations in your Drizzle schema, you can manually add them using the [relation](https://orm.drizzle.team/docs/relations) drizzle-orm function or run our latest CLI version `npx auth@latest generate` to generate a new Drizzle schema with the relations.

Additionally, you're required to pass each [relation](https://orm.drizzle.team/docs/relations) through the drizzle adapter schema object.

## [Modifying Table Names](https://better-auth.com/docs/adapters/drizzle#modifying-table-names)

The Drizzle adapter expects the schema you define to match the table names. For example, if your Drizzle schema maps the `user` table to `users`, you need to manually pass the schema and map it to the user table.

```
import { betterAuth } from "better-auth";
import { db } from "./drizzle";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { schema } from "./schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite", // or "pg" or "mysql"
    schema: {
      ...schema,
      user: schema.users,
    },
  }),
});
```

You can either modify the provided schema values like the example above, or you can mutate the auth config's `modelName` property directly. For example:

```
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite", // or "pg" or "mysql"
    schema,
  }),
  user: {
    modelName: "users",
  }
});
```

## [Modifying Field Names](https://better-auth.com/docs/adapters/drizzle#modifying-field-names)

We map field names based on property you passed to your Drizzle schema. For example, if you want to modify the `email` field to `email_address`, you simply need to change the Drizzle schema to:

```
export const user = mysqlTable("user", {
  // Changed field name without changing the schema property name
  // This allows drizzle & better-auth to still use the original field name,
  // while your DB uses the modified field name
  email: varchar("email_address", { length: 255 }).notNull().unique(),
  // ... others
});
```

You can either modify the Drizzle schema like the example above, or you can mutate the auth config's `fields` property directly. For example:

```
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite", // or "pg" or "mysql"
    schema,
  }),
  user: {
    fields: {
      email: "email_address",
    }
  }
});
```

## [Using Plural Table Names](https://better-auth.com/docs/adapters/drizzle#using-plural-table-names)

If all your tables are using plural form, you can just pass the `usePlural` option:

```
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    ...
    usePlural: true,
  }),
});
```

## [Additional Information](https://better-auth.com/docs/adapters/drizzle#additional-information)

- If you're looking for performance improvements or tips, take a look at our guide to [performance optimizations](https://better-auth.com/docs/guides/optimizing-for-performance).

[Edit on GitHub](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/adapters/drizzle.mdx)

### On this page

[Installation](https://better-auth.com/docs/adapters/drizzle#installation)[Example Usage](https://better-auth.com/docs/adapters/drizzle#example-usage)[Schema generation & migration](https://better-auth.com/docs/adapters/drizzle#schema-generation--migration)[Joins (Experimental)](https://better-auth.com/docs/adapters/drizzle#joins-experimental)[Modifying Table Names](https://better-auth.com/docs/adapters/drizzle#modifying-table-names)[Modifying Field Names](https://better-auth.com/docs/adapters/drizzle#modifying-field-names)[Using Plural Table Names](https://better-auth.com/docs/adapters/drizzle#using-plural-table-names)[Additional Information](https://better-auth.com/docs/adapters/drizzle#additional-information)