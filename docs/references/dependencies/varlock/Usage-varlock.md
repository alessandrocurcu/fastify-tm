The basic workflow for using Varlock is to:

1.  Run [`varlock init`](https://varlock.dev/reference/cli-commands/#init) to set up your `.env.schema` file
2.  Run [`varlock load`](https://varlock.dev/reference/cli-commands/#load) to debug and refine your .env file(s)
3.  Use Varlock to load, validate, and inject env vars into your application, either:
    -   Use an [existing framework / tool integration](https://varlock.dev/integrations/overview/) that automatically calls Varlock under the hood (_recommended_)
    -   Use `import 'varlock/auto-load'` in a backend JavaScript/TypeScript project
    -   Boot your command via [`varlock run`](https://varlock.dev/reference/cli-commands/#run)
        
        (_necessary for non-JS/TS projects, or feeding env vars to external tools_)

-   [npm](https://varlock.dev/getting-started/usage/#tab-panel-448)
-   [pnpm](https://varlock.dev/getting-started/usage/#tab-panel-449)
-   [bun](https://varlock.dev/getting-started/usage/#tab-panel-450)
-   [vlt](https://varlock.dev/getting-started/usage/#tab-panel-451)
-   [yarn](https://varlock.dev/getting-started/usage/#tab-panel-452)
-   [standalone binary](https://varlock.dev/getting-started/usage/#tab-panel-453)

```
pnpm exec -- varlock load
```

Validates your environment variables according to your `.env.schema` and associated `.env.*` files, and prints the results.

Useful for debugging locally, and in CI to print out a summary of env vars, also when you’re authoring your `.env.schema` file and want immediate feedback.

See the [`varlock load` CLI Reference](https://varlock.dev/reference/cli-commands/#load) for more information.

-   [npm](https://varlock.dev/getting-started/usage/#tab-panel-454)
-   [pnpm](https://varlock.dev/getting-started/usage/#tab-panel-455)
-   [bun](https://varlock.dev/getting-started/usage/#tab-panel-456)
-   [vlt](https://varlock.dev/getting-started/usage/#tab-panel-457)
-   [yarn](https://varlock.dev/getting-started/usage/#tab-panel-458)
-   [standalone binary](https://varlock.dev/getting-started/usage/#tab-panel-459)

```
pnpm exec -- varlock run -- <your-command>
```

Executes a command in a child process, injecting your resolved and validated environment variables. This is useful when a code-level integration is not possible. For example, if you’re using a database migration tool, you can use `varlock run` to run the migration tool with the correct environment variables. Or if you’re using a non-js/ts language, you can use `varlock run` to run a command and inject validated environment variables.

See the [`varlock run` CLI Reference](https://varlock.dev/reference/cli-commands/#run) for more information.

-   [npm](https://varlock.dev/getting-started/usage/#tab-panel-460)
-   [pnpm](https://varlock.dev/getting-started/usage/#tab-panel-461)
-   [bun](https://varlock.dev/getting-started/usage/#tab-panel-462)
-   [vlt](https://varlock.dev/getting-started/usage/#tab-panel-463)
-   [yarn](https://varlock.dev/getting-started/usage/#tab-panel-464)
-   [standalone binary](https://varlock.dev/getting-started/usage/#tab-panel-465)

```
pnpm exec -- varlock encrypt --file .env.local
```

Encrypts sensitive values using device-local encryption. Use `--file` to encrypt all `@sensitive` plaintext values in a `.env` file in-place, or run without arguments for interactive single-value encryption.

Encrypted values are stored as `varlock("local:<encrypted>")` and are automatically decrypted during `varlock load` or `varlock run`.

See the [`varlock encrypt` CLI Reference](https://varlock.dev/reference/cli-commands/#encrypt) and the [Local encryption guide](https://varlock.dev/guides/local-encryption/) for more information.

-   [npm](https://varlock.dev/getting-started/usage/#tab-panel-466)
-   [pnpm](https://varlock.dev/getting-started/usage/#tab-panel-467)
-   [bun](https://varlock.dev/getting-started/usage/#tab-panel-468)
-   [vlt](https://varlock.dev/getting-started/usage/#tab-panel-469)
-   [yarn](https://varlock.dev/getting-started/usage/#tab-panel-470)
-   [standalone binary](https://varlock.dev/getting-started/usage/#tab-panel-471)

```
pnpm exec -- varlock reveal
```

Securely view or copy decrypted values of `@sensitive` environment variables. Values are shown in an alternate screen buffer to prevent scrollback capture.

See the [`varlock reveal` CLI Reference](https://varlock.dev/reference/cli-commands/#reveal) for more information.