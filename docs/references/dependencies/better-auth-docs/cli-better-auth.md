# CLI | Better Auth

[Link](https://better-auth.com/)

[readme](https://better-auth.com/)

[docs](https://better-auth.com/docs)

products

[enterprise](https://better-auth.com/enterprise)

resources

[sign-in](https://dash.better-auth.com/sign-in)

# CLI

Learn about the Better Auth CLI commands for generating and migrating database schemas, initializing projects, generating secret keys, and gathering diagnostic info.

Better Auth comes with a built-in CLI to help you manage the database schemas, initialize your project, generate a secret key for your application, and gather diagnostic information about your setup.

## [Generate](https://better-auth.com/docs/concepts/cli#generate)

The `generate` command creates the schema required by Better Auth. If you're using a database adapter like Prisma or Drizzle, this command will generate the right schema for your ORM. If you're using the built-in Kysely adapter, it will generate an SQL file you can run directly on your database.

Terminal

```
pnpm dlx auth@latest generate
```

*Terminal*

### [Options](https://better-auth.com/docs/concepts/cli#options)

- `--output` - Where to save the generated schema. For Prisma, it will be saved in prisma/schema.prisma. For Drizzle, it goes to schema.ts in your project root. For Kysely, it's an SQL file saved as schema.sql in your project root.
- `--config` - The path to your Better Auth config file. By default, the CLI will search for an auth.ts file in **./**, **./utils**, **./lib**, or any of these directories under the `src` directory.
- `--yes` - Skip the confirmation prompt and generate the schema directly.

## [Migrate](https://better-auth.com/docs/concepts/cli#migrate)

The migrate command applies the Better Auth schema directly to your database. This is available if you're using the built-in Kysely adapter. For other adapters, you'll need to apply the schema using your ORM's migration tool.

Terminal

```
pnpm dlx auth@latest migrate
```

*Terminal*

### [Options](https://better-auth.com/docs/concepts/cli#options-1)

- `--config` - The path to your Better Auth config file. By default, the CLI will search for an auth.ts file in **./**, **./utils**, **./lib**, or any of these directories under the `src` directory.
- `--yes` - Skip the confirmation prompt and apply the schema directly.

**Using PostgreSQL with a non-default schema?**

The migrate command automatically detects your configured `search_path` and creates tables in the correct schema. See the [PostgreSQL adapter documentation](https://better-auth.com/docs/adapters/postgresql#use-a-non-default-schema) for configuration details.

## [Init](https://better-auth.com/docs/concepts/cli#init)

The `init` command allows you to initialize Better Auth in your project.

Terminal

```
pnpm dlx auth@latest init
```

*Terminal*

### [Options](https://better-auth.com/docs/concepts/cli#options-2)

- `--name` - The name of your application. (defaults to the `name` property in your `package.json`).
- `--framework` - The framework your codebase is using. Currently, the only supported framework is `Next.js`.
- `--plugins` - The plugins you want to use. You can specify multiple plugins by separating them with a comma.
- `--database` - The database you want to use. Currently, the only supported database is `SQLite`.
- `--package-manager` - The package manager you want to use. Currently, the only supported package managers are `npm`, `pnpm`, `yarn`, `bun` (defaults to the manager you used to initialize the CLI).

## [Info](https://better-auth.com/docs/concepts/cli#info)

The `info` command provides diagnostic information about your Better Auth setup and environment. Useful for debugging and sharing when seeking support.

Terminal

```
pnpm dlx auth@latest info
```

*Terminal*

### [Output](https://better-auth.com/docs/concepts/cli#output)

The command displays:

- **System**: OS, CPU, memory, Node.js version
- **Package Manager**: Detected manager and version
- **Better Auth**: Version and configuration (sensitive data auto-redacted)
- **Frameworks**: Detected frameworks (Next.js, React, Vue, etc.)
- **Databases**: Database clients and ORMs (Prisma, Drizzle, etc.)

### [Options](https://better-auth.com/docs/concepts/cli#options-3)

- `--config` - Path to your Better Auth config file
- `--json` - Output as JSON for sharing or programmatic use

### [Examples](https://better-auth.com/docs/concepts/cli#examples)

```
# Basic usage
npx auth@latest info

# Custom config path
npx auth@latest info --config ./config/auth.ts

# JSON output
npx auth@latest info --json > auth-info.json
```

Sensitive data like secrets, API keys, and database URLs are automatically replaced with `[REDACTED]` for safe sharing.

## [Secret](https://better-auth.com/docs/concepts/cli#secret)

The CLI also provides a way to generate a secret key for your Better Auth instance.

Terminal

```
pnpm dlx auth@latest secret
```

*Terminal*

## [Common Issues](https://better-auth.com/docs/concepts/cli#common-issues)

**Error: Cannot find module X**

The CLI resolves most imports for you: `tsconfig.json` path aliases (including SvelteKit's `$lib`) and stubbed framework virtual modules (`$env/*`, `$app/*`, `cloudflare:workers`, Vite assets like `?raw`). For SvelteKit, run `svelte-kit sync` first so `.svelte-kit/tsconfig.json` exists.

A few module types can't load outside their bundler (e.g. `.svelte` components or `import.meta.glob`). Keep those out of your config file's import graph.

[Edit on GitHub](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/concepts/cli.mdx)

### On this page

[Generate](https://better-auth.com/docs/concepts/cli#generate)[Options](https://better-auth.com/docs/concepts/cli#options)[Migrate](https://better-auth.com/docs/concepts/cli#migrate)[Options](https://better-auth.com/docs/concepts/cli#options-1)[Init](https://better-auth.com/docs/concepts/cli#init)[Options](https://better-auth.com/docs/concepts/cli#options-2)[Info](https://better-auth.com/docs/concepts/cli#info)[Output](https://better-auth.com/docs/concepts/cli#output)[Options](https://better-auth.com/docs/concepts/cli#options-3)[Examples](https://better-auth.com/docs/concepts/cli#examples)[Secret](https://better-auth.com/docs/concepts/cli#secret)[Common Issues](https://better-auth.com/docs/concepts/cli#common-issues)