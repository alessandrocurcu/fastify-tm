Varlock uses the term _sensitive_ to describe any value that should not be exposed to the outside world. This includes secret api keys, passwords, and other generally sensitive information. Instead of relying on prefixes (e.g., `NEXT_PUBLIC_`) to know which items may be “public”, varlock relies on `@decorators` to mark sensitive items explicitly.

Because we understand which values are sensitive, we can apply extra security guardrails to keep them safe at every step of the SDLC.

## Identifying `@sensitive` items

[Section titled “Identifying @sensitive items”](https://varlock.dev/guides/secrets/#identifying-sensitive-items)

Whether each item is sensitive or not is controlled by the [`@defaultSensitive`](https://varlock.dev/reference/root-decorators/#defaultsensitive) root decorator and the [`@sensitive`](https://varlock.dev/reference/item-decorators/#sensitive) item decorator. For example:

```
# @defaultSensitive=false# ---# not sensitive by default (because of the root decorator)NON_SECRET_FOO=# @sensitive # explicitly marking this item as sensitiveSECRET_FOO=
```

These decorators are typically used only in your `.env.schema` file, but may be used in any file - which can be usefult to override sensitivity in a specific environment.

## Local encryption via `varlock()`

[Section titled “Local encryption via varlock()”](https://varlock.dev/guides/secrets/#local-encryption)

For local git-ignored secrets (typically overrides in `.env.local`), use the [`varlock()` function](https://varlock.dev/reference/functions/#varlock) to store encrypted values on disk.

Note that the encryption key used is tied to your device, so these encrypted values are not meant to be shared or committed to git.

```
PLAINTEXT=shh-im-secret            # 🚨 dangerSECURED=varlock(local:abc123...)  # ✅ secured at restNEW_ITEM=varlock(prompt) # will prompt for new value
```

See the [local encryption guide](https://varlock.dev/guides/local-encryption/) for full setup, platform-specific details, and related CLI commands like [`varlock encrypt`](https://varlock.dev/reference/cli-commands/#encrypt), [`varlock reveal`](https://varlock.dev/reference/cli-commands/#reveal), and [`varlock lock`](https://varlock.dev/reference/cli-commands/#lock).

On macOS, you can also use the built-in [keychain()](https://varlock.dev/plugins/macos-keychain/) plugin, which provides a similar experience but stores encrypted values in the system keychain.

## Loading secrets from external sources

[Section titled “Loading secrets from external sources”](https://varlock.dev/guides/secrets/#loading-secrets-from-external-sources)

### Using plugins (recommended)

[Section titled “Using plugins (recommended)”](https://varlock.dev/guides/secrets/#using-plugins-recommended)

`varlock` provides official plugins for popular secret management platforms, offering a seamless and type-safe way to fetch secrets directly in your `.env` files.

Available plugins include:

-   [1Password](https://varlock.dev/plugins/1password/)
-   [AWS Secrets Manager & Parameter Store](https://varlock.dev/plugins/aws-secrets/)
-   [Azure Key Vault](https://varlock.dev/plugins/azure-key-vault/)
-   [Bitwarden](https://varlock.dev/plugins/bitwarden/)
-   [Google Secret Manager](https://varlock.dev/plugins/google-secret-manager/)
-   [HashiCorp Vault](https://varlock.dev/plugins/hashicorp-vault/)
-   [Infisical](https://varlock.dev/plugins/infisical/)

See the [plugins overview](https://varlock.dev/plugins/overview/) for the complete list.

Plugins are able to register new decorators and resolver functions that declaratively fetch secrets:

```
# Install and initialize the 1Password plugin# @plugin(@varlock/1password-plugin)# @initOp(token=$OP_TOKEN, allowAppAuth=forEnv(dev))# ---# Load secrets using the op() resolver function# @sensitive @requiredMY_SECRET=op(op://my-vault/item-name/field-name)
```

Benefits of using plugins:

-   Declarative secret references safe to check into version control
-   Built-in validation and type safety applied to fetched values
-   Built-in authentication handling
-   Better error messages and debugging
-   Platform-specific features (e.g., biometric unlock for 1Password)

See each plugin’s documentation for detailed setup instructions.

### Using exec() as a fallback

[Section titled “Using exec() as a fallback”](https://varlock.dev/guides/secrets/#using-exec-as-a-fallback)

For cases where a plugin doesn’t exist or you need custom logic, `varlock` supports fetching secrets via CLI commands using `exec()` function syntax.

```
# A secret fetched via CLI# @sensitive @requiredMY_SECRET=exec(`op read "op://devTest/myVault/credential"`);
```

This approach works with any CLI tool, ensuring no secrets are left in plaintext on your system, even if they are gitignored.

### Bulk injection with `@setValuesBulk()`

[Section titled “Bulk injection with @setValuesBulk()”](https://varlock.dev/guides/secrets/#bulk-injection-with-setvaluesbulk)

For some secret management platforms, you may already be setting key names that match your environment variable names - in which case, wiring up each value can feel like a lot of boilerplate.

In case like this, you can set many values at once using the [`@setValuesBulk()`](https://varlock.dev/reference/root-decorators/#setvaluesbulk) root decorator.

For example, using 1Password, you could store a .env style blob within a text field, or you could fetch values from their new environments tool.

```
# fetch a dotenv style blob within a text field# @setValuesBulk(op("op://vault/field/item"))## load values in a 1Password environment# @setValuesBulk(opLoadEnvironment(your-environment-id), createMissing=true)## load all secrets from an Infisical project environment# @setValuesBulk(infisicalBulk())## load Infisical secrets filtered by path or tag# @setValuesBulk(infisicalBulk(path="/database", tag="backend"))## Fetch all secrets from HashiCorp Vault as JSON# @setValuesBulk(exec("vault kv get -format=json secret/myapp"), format=json)
```

The bulk values are injected at the precedence level of the file containing the decorator — so `.env.local` and `process.env` will still override them as expected. See the [reference docs](https://varlock.dev/reference/root-decorators/#setvaluesbulk) for full details.

## Security enhancements

[Section titled “Security enhancements”](https://varlock.dev/guides/secrets/#security-enhancements)

Unlike other tools where you have to rely on pattern matching to detect _sensitive-looking_ data, `varlock` knows exactly which values are sensitive, and can take extra precautions to protect them.

### CLI log redaction

[Section titled “CLI log redaction”](https://varlock.dev/guides/secrets/#cli-log-redaction)

The varlock CLI itself redacts sensitive values in its own output. Commands like [`varlock explain`](https://varlock.dev/reference/cli-commands/#explain) will display resolved values with partial masking (e.g., `my▒▒▒▒▒`) so you can verify configuration without exposing secrets in your terminal scrollback.

When you need to see the actual plaintext value, use [`varlock reveal`](https://varlock.dev/reference/cli-commands/#reveal) which provides a secure viewing experience:

```
varlock reveal              # interactive picker to select a secretvarlock reveal MY_SECRET    # reveal a specific variablevarlock reveal MY_SECRET --copy  # copy to clipboard (auto-clears after 10s)
```

The `reveal` command displays values in an **alternate screen buffer** — when you press any key to dismiss, the value disappears from your terminal entirely and won’t be visible in scrollback history. With `--copy`, the value is copied to your clipboard and automatically cleared after 10 seconds.

#### Redaction in `varlock run`

[Section titled “Redaction in varlock run”](https://varlock.dev/guides/secrets/#redaction-in-varlock-run)

[`varlock run`](https://varlock.dev/reference/cli-commands/#run) pipes stdout/stderr of the child process through the same redaction engine, so any sensitive values that end up in your application’s output will be masked automatically.

Some interactive tools (e.g., `psql`, `claude`) rely on TTY detection which is broken by piping. Use the `--no-redact-stdout` flag to disable output redaction and preserve TTY behavior:

```
varlock run --no-redact-stdout -- psql
```

### Runtime log redaction

[Section titled “Runtime log redaction”](https://varlock.dev/guides/secrets/#runtime-log-redaction)

_Only available in JavaScript/Node.js projects using varlock’s runtime integrations._

When using `varlock/auto-load` or a [framework integration](https://varlock.dev/integrations/overview/), varlock automatically patches global `console` methods (`log`, `warn`, `error`, `debug`, `info`, `trace`) to redact any sensitive values before they reach stdout/stderr. Sensitive values are replaced with a partially masked string using the `▒` character — for example, `my-secret-value` becomes `my▒▒▒▒▒`.

```
console.log(process.env.SECRET_KEY);// outputs "my▒▒▒▒▒" instead of "my-secret-value"
```

This works by intercepting Node.js internal console internals, with an additional layer that wraps the console methods themselves to handle environments where `console.log` has been patched by the platform (e.g., AWS Lambda).

If you need to intentionally reveal a secret in logs (for example during debugging), you can use the `revealSensitiveConfig` helper:

```
import { revealSensitiveConfig } from 'varlock/env';console.log(revealSensitiveConfig(process.env.SECRET_KEY));// outputs the actual value
```

To disable runtime log redaction, set the [`@redactLogs`](https://varlock.dev/reference/root-decorators/#redactlogs) root decorator to `false`.

_Only available in JavaScript/Node.js projects using varlock’s runtime integrations._

Varlock scans outgoing HTTP responses at runtime to detect if any sensitive values are being accidentally sent to clients. If a leak is detected, varlock throws an error with a detailed diagnostic message including the config item key and where the leak was detected.

This works by patching:

-   **Node.js `ServerResponse`** — intercepts `write()` and `end()` calls, scanning text and JSON response bodies (including gzip-compressed responses)
-   **Global `Response` constructor** — intercepts the `Response` class used in edge runtimes (e.g., Cloudflare Workers), scanning bodies passed to the constructor and `Response.json()`

Our [framework integrations](https://varlock.dev/integrations/overview/) automatically apply the appropriate patches for your environment. For example, a Next.js integration will scan both server-rendered pages and API route responses.

To disable leak prevention, set the [`@preventLeaks`](https://varlock.dev/reference/root-decorators/#preventleaks) root decorator to `false`.

## Scanning files for leaked secrets

[Section titled “Scanning files for leaked secrets”](https://varlock.dev/guides/secrets/#scanning-files-for-leaked-secrets)

The [`varlock scan` command](https://varlock.dev/reference/cli-commands/#scan) checks your project files for any plaintext occurrences of your `@sensitive` values. It loads your varlock config, resolves all sensitive values, and then searches through files to detect leaks.

```
varlock scan
```

This is intended to be used as a pre-commit git hook to prevent accidentally committing secrets into version control. If no sensitive values are found in plaintext, it exits successfully. If any are detected, it reports the file, line number,and which secret was found, then exits with a non-zero status code.

It can also be used to scan build output as an extra step to prevent accidentally bundling secrets into client-facing code. Our [drop-in integrations](https://varlock.dev/integrations/overview/) usually do this automatically, but this can be useful in some scenarios.

-   `varlock scan` - default mode, scans all files except gitignored ones
-   `varlock scan --include-ignored` - scans all files including gitignored ones
-   `varlock scan --staged` - scans only the files you have staged for commit
-   `varlock scan path1 path2/**/*.js` - scans specific files

The easiest way to set this up is:

```
varlock scan --install-hook
```

This will detect if you use a hook manager (like [husky](https://typicode.github.io/husky/) or [lefthook](https://github.com/evilmartians/lefthook)) and provide appropriate instructions. If no hook manager is detected, it will create a `.git/hooks/pre-commit` script for you.

If you prefer to set it up yourself, add the following to your pre-commit hook:

**Plain git hook** (`.git/hooks/pre-commit`):

```
#!/bin/shvarlock scan
```

Make sure the hook file is executable:

```
chmod +x .git/hooks/pre-commit
```

**With husky** (`.husky/pre-commit`):

```
varlock scan
```

**With lefthook** (`lefthook.yml`):

```
pre-commit:  commands:    varlock-scan:      run: varlock scan
```