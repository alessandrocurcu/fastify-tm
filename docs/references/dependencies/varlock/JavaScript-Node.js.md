There are a few different ways to integrate Varlock into a JavaScript / Node.js application.

Some tools/frameworks may require an additional package, or have more specific instructions. Check the Integrations section in the navigation for more details.

**Want to help us build more integrations? Join our [Discord](https://chat.dmno.dev/)!**

## Node.js - `varlock/auto-load`

[Section titled “Node.js - varlock/auto-load”](https://varlock.dev/integrations/javascript/#nodejs---varlockauto-load)

The best way to integrate varlock into a plain Node.js application (⚠️ version 22 or higher) is to import the `varlock/auto-load` module. This uses `execSync` to call out to the varlock CLI, sets resolved env vars into `process.env`, and initializes varlock’s runtime code, including:

-   varlock’s `ENV` object
-   log redaction (if enabled)
-   leak detection (if enabled)

```
import 'varlock/auto-load';import { ENV } from 'varlock/env';const FROM_VARLOCK_ENV = ENV.MY_CONFIG_ITEM; // ✨ recommendedconst FROM_PROCESS_ENV = process.env.MY_CONFIG_ITEM; // 🆗 still works
```

## Boot via `varlock run`

[Section titled “Boot via varlock run”](https://varlock.dev/integrations/javascript/#boot-via-varlock-run)

A less invasive way to use varlock with your application is to run your application via [`varlock run`](https://varlock.dev/reference/cli-commands/#run).

```
varlock run -- <your-command>
```

This will load and validate your environment variables, then run the command you provided with those environment variables injected into the process. This will not inject any runtime code, and varlock’s `ENV` object will not be available.

If you have installed varlock as a project dependency instead of globally, you should run this via your package manager:

-   [npm](https://varlock.dev/integrations/javascript/#tab-panel-569)
-   [pnpm](https://varlock.dev/integrations/javascript/#tab-panel-570)
-   [bun](https://varlock.dev/integrations/javascript/#tab-panel-571)
-   [vlt](https://varlock.dev/integrations/javascript/#tab-panel-572)
-   [yarn](https://varlock.dev/integrations/javascript/#tab-panel-573)

```
pnpm exec -- varlock run -- <your-command>
```

In `package.json` scripts, calling `varlock` directly will work, as your package manager handles path issues:

```
"scripts": {  "start": "varlock run -- node index.js"}
```

Even when using a deeper integration for your code, you may still need to use `varlock run` when calling external scripts/tools, like database migrations, to pass along resolved env vars.

## Front-end frameworks

[Section titled “Front-end frameworks”](https://varlock.dev/integrations/javascript/#front-end-frameworks)

While environment variables are not available in the browser, many frameworks expose some env vars that are available _at build time_ to the client by embedding them into your bundled code. This is best accomplished using tool-specific integrations, especially for frameworks that are handling both client and server-side code.