One of the main benefits of using environment variables is the ability to boot your application with configuration intended for different environments (e.g., development, preview, staging, production, test).

You may use both [functions](https://varlock.dev/reference/functions/) and/or environment-specific `.env` files (e.g., `.env.production`) to alter configuration accordingly in a declarative way. Plus the additional guardrails provided by `varlock` also make this much safer no matter where values come from.

### Process overrides

[Section titled “Process overrides”](https://varlock.dev/guides/environments/#process-overrides)

`varlock` will always treat environment variables passed into the process with the most precedence. Generally, we recommend moving as much configuration as possible into your `.env` files, but there are cases where you may want to override specific values at runtime, either from the environment itself, or by prepending them to your command (e.g., `APP_ENV=prod pnpm run build`).

At the very least, you’ll often need to inject an environment flag (e.g., `APP_ENV`) and a _secret-zero_ which allows access to the rest of your secrets in deployed environments. For local workflows, consider [device-local encryption](https://varlock.dev/guides/local-encryption/) to secure local secret-zero handling.

That said, as a first step to adopting `varlock`, you could rely entirely on process overrides to inject all config values, but still benefit from having a clear schema with validation applied to them.

### Loading environment-specific `.env` files

[Section titled “Loading environment-specific .env files”](https://varlock.dev/guides/environments/#loading-environment-specific-env-files)

Any environment-specific files (e.g., `.env.development`) will automatically be loaded if they match the value of the _current environment_ as set by the [`@currentEnv`](https://varlock.dev/reference/root-decorators/#currentenv) root decorator in your `.env.schema` file.

The files are applied with a specific precedence (increasing):

-   `.env.schema` - your schema file, which can also contain default values
-   `.env` - will be loaded, but not recommended, instead use something more specific
-   `.env.local` - local overrides (gitignored)
-   `.env.[currentEnv]` - environment-specific values
-   `.env.[currentEnv].local` - environment-specific local overrides (gitignored)

For example, consider the following `.env.schema`:

```
# @currentEnv=$APP_ENV# ---# @type=enum(development, test, staging, production)APP_ENV=development
```

Your environment flag key is set to `APP_ENV`, which has a default value of `development` - meaning that `.env.development` and `.env.development.local` will be loaded if they exist.

To tell `varlock` to load `.env.staging` instead, you must set `APP_ENV` to `staging` - usually using an override passed into the process. For example:

```
APP_ENV=staging varlock run -- node my-test-script.js
```

## Advanced logic using functions

[Section titled “Advanced logic using functions”](https://varlock.dev/guides/environments/#advanced-logic-using-functions)

On some platforms, you may not have full control over a build or boot command or the env vars passed into them. In this case, we can use functions to transform other env vars provided by the platform into the environment flag value we want. We can use [`remap()`](https://varlock.dev/reference/functions#remap) to transform a value according to a lookup, along with [regex literals](https://varlock.dev/reference/functions#regex-literals) if we need to match a pattern instead of an exact value.

For example, on the Cloudflare Workers CI platform, we get the current branch name injected as `WORKERS_CI_BRANCH`, which we can use to determine which environment to load:

```
# @currentEnv=$APP_ENV# ---# set to current branch name when build is running on Cloudflare CI, empty otherwiseWORKERS_CI_BRANCH=# @type=enum(development, preview, production, test)APP_ENV=remap($WORKERS_CI_BRANCH, "main", production, /.*/, preview, undefined, development)
```

You’ll notice that `test` is one of the possible enum values, but it is not listed in the remap. When running tests, you would just explicitly set `APP_ENV` when invoking your command.

```
APP_ENV=test varlock run -- your-test-command# or if your command is loading varlock internallyAPP_ENV=test your-test-command
```

or you could run a production style build locally `APP_ENV=production varlock run -- your-build-command`

## Setting a _default_ environment flag

[Section titled “Setting a default environment flag”](https://varlock.dev/guides/environments/#setting-a-default-environment-flag)

You can set the default environment flag directly when running CLI commands using the `--env` flag:

```
varlock load --env production
```

This is only useful if you do not want to create a new env var for your env flag, and you are only using varlock via CLI commands. Mostly it is used internally by some integrations to match existing default behavior, and should not be used otherwise.

## Using `currentEnv` in Turborepo

[Section titled “Using currentEnv in Turborepo”](https://varlock.dev/guides/environments/#using-currentenv-in-turborepo)

Turborepo users should be aware of a common pitfall when using `varlock`’s `@currentEnv` in monorepos managed by Turborepo, especially since Turborepo v2.0+ now enables **Strict Environment Mode** by default.

Turborepo, when running tasks, filters the environment variables available to each task. By default in Strict Mode, **only** variables listed in the `env` or `globalEnv` keys in your `turbo.json` are passed to your scripts. This means that if your environment flag set by `@currentEnv` (e.g., `APP_ENV`) is not explicitly listed, it will not be available to your process, even if you set it in your shell or CI environment. This can cause `varlock` to load the wrong environment, or fail to load the correct `.env.[currentEnv]` file.

### Solution: Add your environment flag to turbo.json

[Section titled “Solution: Add your environment flag to turbo.json”](https://varlock.dev/guides/environments/#solution-add-your-environment-flag-to-turbojson)

To ensure your environment flag variable is always available to your scripts, add it to the `env` or `globalEnv` section of your `turbo.json`:

```
{  "globalEnv": ["APP_ENV"],  "tasks": {    "build": {      "env": ["APP_ENV"]    },    "dev": {      "env": ["APP_ENV"]    }  }}
```

-   Use `globalEnv` if the variable should be available to all tasks.
-   Use `env` under a specific task if only needed for that task.

Now when you run the following:

```
APP_ENV=production turbo run build
```

it will load the correct `.env.production` file because the override for `APP_ENV` is passed correctly to `turbo` and in turn to `varlock`.

> Substitute whatever your env flag is for `APP_ENV` in the above example.

___

### Setting the Environment Flag

[Section titled “Setting the Environment Flag”](https://varlock.dev/guides/environments/#setting-the-environment-flag)

When running locally, or on a platform you control, you can set the env flag explicitly as an environment variable. However on some cloud platforms, there is a lot of magic happening, and the ability to set environment variables per branch is limited. In these cases you can use functions to transform env vars injected by the platform, like a current branch name, into the value you need.

#### Local/Custom Scripts

[Section titled “Local/Custom Scripts”](https://varlock.dev/guides/environments/#localcustom-scripts)

You can set the env var explicitly when you run a command, but often you will set it in `package.json` scripts:

```
"scripts": {  "build:preview": "APP_ENV=preview next build",  "start:preview": "APP_ENV=preview next start",  "build:prod": "APP_ENV=production next build",  "start:prod": "APP_ENV=production next start",  "test": "APP_ENV=test jest"}
```

You can use the injected `VERCEL_ENV` variable to match their concept of environment types, while adding your own additional options.

```
# @currentEnv=$APP_ENV# ---# @type=enum(development, preview, production)VERCEL_ENV=# @type=enum(development, preview, production, test)APP_ENV=fallback($VERCEL_ENV, development)
```

For more granular environments, use the branch name in `VERCEL_GIT_COMMIT_REF` (see Cloudflare example below).

#### Cloudflare Workers Build

[Section titled “Cloudflare Workers Build”](https://varlock.dev/guides/environments/#cloudflare-workers-build)

Use the branch name in `WORKERS_CI_BRANCH` to determine the environment:

```
# @currentEnv=$APP_ENV# ---WORKERS_CI_BRANCH=# @type=enum(development, preview, production, test)APP_ENV=remap($WORKERS_CI_BRANCH, "main", production, /.*/, preview, undefined, development)
```