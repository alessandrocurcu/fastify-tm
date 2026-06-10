## Next steps with your schema

[Section titled “Next steps with your schema”](https://varlock.dev/getting-started/wrapping-up/#next-steps-with-your-schema)

With a more flexible env var toolkit, after an initial migration, you may be tempted to take advantage of Varlock’s features to improve your developer experience and security posture.

-   Move more configuration constants out of application code and into your `.env` files
-   Reduce the number of env-style checks in your code, favouring individual flags, with a default value set based on the current env
-   Add deeper validation, more thorough comments, and additional docs links to each env var within your schema
-   Compose values together to keep your configuration DRY
-   Use [imports](https://varlock.dev/guides/import/) to share common configuration across a monorepo, or to break up a large `.env.schema`
-   Reduce secret sprawl, by loading secrets from a single source of truth, instead of injecting them from your CI/hosting platform

Depending on your setup you will want to update your `.gitignore` to _not_ ignore your `.env.schema` file and any other `.env.xxx` files that can now be safely committed to your repo if they don’t contain secrets (which they shouldn’t).

If using [generated types](https://varlock.dev/reference/root-decorators/#generatetypes), we also recommend that you ignore the generated file (usually `env.d.ts` in TypeScript) as it is dynamically generated based the hierarchy of env files being loaded on each individual machine.

```
# Include .env.schema, .env.<dev|preview|prod|...> file# exclude local overrides.env.*.env.local.env.*.local# Exclude generated env types fileenv.d.ts
```

Consider how you can reuse and modularize your schema if you have a monorepo or multi-service setup. See the [Imports](https://varlock.dev/guides/import/) guide for more information.

It may be useful to validate your schema in CI/CD pipelines, especially if you want to validate configurations that you don’t have access to locally (e.g. Staging or Production). You can do this manually by running `varlock load` in your pipeline. And if you’re using GitHub Actions, you can use the [Varlock GitHub Action](https://varlock.dev/integrations/github-action/) to validate your schema automatically.

### Production deployments

[Section titled “Production deployments”](https://varlock.dev/getting-started/wrapping-up/#production-deployments)

Because varlock supports loading environment variables from the environment itself or via a [function](https://varlock.dev/reference/functions/) in your `.env.schema`, there are a few different approaches.

If you’re already using your deployment platform’s environment variable management, you may not need to do anything to benefit from varlock’s validation and security features. If you have a multi-environment setup, you may need to set the `currentEnv` environment flag to the correct environment.

```
APP_ENV=production varlock run -- your-production-command
```

If you’re not using your deployment platform’s environment variable management, you may consider using one of our [plugins](https://varlock.dev/plugins/overview/) to securely load environment variables from a secret storage system such as [1Password](https://varlock.dev/plugins/1password/).