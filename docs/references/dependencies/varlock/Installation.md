There are two ways to install Varlock:

1.  Install as a `package.json` dependency in JavaScript/TypeScript projects (the `varlock` CLI package)
2.  Install as a standalone binary

If you prefer to let your AI agent install Varlock for you, you can skip these instructions and build a prompt for your agent:

There is also a Docs MCP server that exposes a search tool. See more details [here](https://varlock.dev/guides/mcp/#docs-mcp).

## As a JavaScript/TypeScript dependency

[Section titled “As a JavaScript/TypeScript dependency”](https://varlock.dev/getting-started/installation/#as-a-javascripttypescript-dependency)

Requires:

-   Node.js version 22 or higher

To install `varlock` in your project, run:

-   [npm](https://varlock.dev/getting-started/installation/#tab-panel-438)
-   [pnpm](https://varlock.dev/getting-started/installation/#tab-panel-439)
-   [bun](https://varlock.dev/getting-started/installation/#tab-panel-440)
-   [vlt](https://varlock.dev/getting-started/installation/#tab-panel-441)
-   [yarn](https://varlock.dev/getting-started/installation/#tab-panel-442)

```
pnpm dlx varlock init
```

This will install `varlock` as a dependency and scan your project for `.env` files and create a `.env.schema` file in the root of your project. Depending on your project configuration, it will optionally:

-   Remove your existing `.env.example` file
-   Add decorators to your `.env.schema` file to specify the type of each environment variable

For AI agent workflows, use non-interactive mode instead:

-   [npm](https://varlock.dev/getting-started/installation/#tab-panel-443)
-   [pnpm](https://varlock.dev/getting-started/installation/#tab-panel-444)
-   [bun](https://varlock.dev/getting-started/installation/#tab-panel-445)
-   [vlt](https://varlock.dev/getting-started/installation/#tab-panel-446)
-   [yarn](https://varlock.dev/getting-started/installation/#tab-panel-447)

```
pnpm dlx varlock init --agent
```

## As a standalone binary

[Section titled “As a standalone binary”](https://varlock.dev/getting-started/installation/#as-a-standalone-binary)

To install `varlock` CLI as a binary, run:

```
# Install via homebrewbrew install dmno-dev/tap/varlock# OR via cURLcurl -sSfL https://varlock.dev/install.sh | sh -s
```

Then run the setup wizard to help you get started:

```
varlock init
```

Then install the Varlock agent skill:

-   [skills](https://varlock.dev/getting-started/installation/#tab-panel-436)
-   [GitHub CLI](https://varlock.dev/getting-started/installation/#tab-panel-437)

```
npx skills add dmno-dev/varlock
```

See the [AI Tools guide](https://varlock.dev/guides/ai-tools/#install-the-varlock-skill) for update commands and agent-specific options.