---
title: "CLI Commands"
site: "Varlock"
source: "https://varlock.dev/reference/cli-commands/"
domain: "varlock.dev"
language: "en"
description: "Reference documentation for Varlock CLI commands"
word_count: 2303
---

Varlock provides a command-line interface for managing environment variables and secrets. This reference documents all available CLI commands.

See [installation](https://varlock.dev/getting-started/installation) for instructions on how to install Varlock. You can also enable [shell completion](https://varlock.dev/guides/shell-completion/) for tab completion of commands and flags.

### Running commands in JS projects

If you have installed varlock as a `package.json` dependency, rather than a standalone binary, the best way to invoke the CLI is via your package manager:

```bash
npm exec -- varlock ...
```

Also note that within package.json scripts, you can use it directly:

```json
{
  "scripts": {
    "start": "varlock run -- node app.js"
  }
}
```

### package.json configuration

You can configure varlock’s default behavior by adding a `varlock` key to your `package.json`:

```json
{
  "varlock": {
    "loadPath": "./envs/"
  }
}
```

| Option | Description |
| --- | --- |
| `loadPath` | Path (or array of paths) to a directory or specific `.env` file to use as the default entry point. Defaults to the current working directory if not set. Use a **directory path** (with trailing `/`) to automatically load all relevant files (`.env.schema`, `.env`, `.env.local`, etc.); a file path only loads that file and its explicit imports. When an array is provided, all paths are loaded and combined — later entries take higher precedence. Can be overridden by the `--path` CLI flag. Varlock looks for this config in the `package.json` in the current working directory only. |

## Commands reference

### varlock init

Starts an interactive onboarding process to help you get started. Will help create your `.env.schema` and install varlock as a dependency if necessary.

```bash
varlock init [options]
```

**Options:**

- `--agent`: Run non-interactively for agent/automation workflows. Skips confirmation prompts and uses deterministic defaults for schema generation.

**Examples:**

```bash
# Interactive setup wizard
varlock init

# Non-interactive setup for AI agents
varlock init --agent
```

### varlock load

Loads and validates environment variables according to your.env files, and prints the results. Default prints a nicely formatted, colorized summary of the results, but can also print out machine-readable formats.

Useful for debugging locally, and in CI to print out a summary of env vars.

```bash
varlock load [options]
```

**Options:**

- `--format`: Format of output \[pretty|json|env|shell|json-full\]
- `--agent`: Agent-safe mode — defaults to JSON output and redacts sensitive values. Not compatible with `--format env` or `--format shell`.
- `--compact`: Compact output (json-full: no indentation, env/shell: skip undefined values)
- `--show-all`: Shows all items, not just failing ones, when validation is failing
- `--env`: Set the default environment flag (e.g., `--env production`), only useful if not using `@currentEnv` in `.env.schema`
- `--path` / `-p`: Path to a specific `.env` file or directory to use as the entry point (overrides `varlock.loadPath` in `package.json`). Can be specified multiple times to load from multiple paths — later paths take higher precedence.
- `--clear-cache`: Clear the active cache store before resolving values, then re-resolve all values (when combined with `--skip-cache`, the cache is cleared first, then reads and writes are skipped for the run)
- `--skip-cache`: Skip cache entirely for this invocation (no reads or writes). This overrides `@cache=disk` / `@cache=memory`.

**Examples:**

```bash
# Load and validate environment variables
varlock load

# Load and validate for a specific environment (when not using @currentEnv in .env.schema)
varlock load --env production

# Output validation results in JSON format
varlock load --format json

# Output full serialized graph (including errors/configErrors fields)
varlock load --format json-full

# Compact output
varlock load --format json-full --compact

# Output as shell export statements (useful for direnv / eval)
eval "$(varlock load --format shell)"

# When validation is failing, will show all items, rather than just failing ones
varlock load --show-all

# Load from a specific .env file
varlock load --path .env.prod

# Load from a specific directory
varlock load --path ./config/

# Load from multiple directories (later paths take higher precedence)
varlock load -p ./envs -p ./overrides

# Agent-safe JSON output with sensitive values redacted
varlock load --agent
```

### varlock run

Executes a command in a child process, injecting your resolved and validated environment variables from your.env files. This is useful when a code-level integration is not possible.

```bash
varlock run -- <command>
```

**Options:**

- `--no-redact-stdout`: Disable stdout/stderr redaction to preserve TTY detection for interactive tools
- `--no-inject-graph`: Disable injection of `__VARLOCK_ENV` serialized config graph into the child process environment
- `--path` / `-p`: Path to a specific `.env` file or directory to use as the entry point. Can be specified multiple times to load from multiple paths — later paths take higher precedence.
- `--clear-cache`: Clear the active cache store before resolving values, then re-resolve all values (when combined with `--skip-cache`, the cache is cleared first, then reads and writes are skipped for the run)
- `--skip-cache`: Skip cache entirely for this invocation (no reads or writes). This overrides `@cache=disk` / `@cache=memory`.

**Examples:**

```bash
varlock run -- node app.js      # Run a Node.js application
varlock run -- python script.py # Run a Python script

# Use a specific .env file as entry point
varlock run --path .env.prod -- node app.js

# Use a specific directory as entry point
varlock run --path ./config/ -- node app.js

# Use multiple directories as entry points
varlock run -p ./envs -p ./overrides -- node app.js
```

### varlock printenv

Resolves and prints the value of a single environment variable to stdout. Only the requested item and its transitive dependencies are resolved, making this faster than loading the full graph.

This is useful within larger shell commands where you need to embed a single resolved env var value.

```bash
varlock printenv <VAR_NAME> [options]
```

**Options:**

- `--path` / `-p`: Path to a specific `.env` file or directory to use as the entry point. Can be specified multiple times to load from multiple paths — later paths take higher precedence.
- `--clear-cache`: Clear the active cache store before resolving values, then re-resolve all values (when combined with `--skip-cache`, the cache is cleared first, then reads and writes are skipped for the run)
- `--skip-cache`: Skip cache entirely for this invocation (no reads or writes). This overrides `@cache=disk` / `@cache=memory`.

**Examples:**

```bash
# Print the resolved value of MY_VAR
varlock printenv MY_VAR

# Use a specific .env file as entry point
varlock printenv --path .env.prod MY_VAR

# Use multiple directories as entry points
varlock printenv -p ./envs -p ./overrides MY_VAR

# Embed in a shell command using subshell expansion
sh -c 'some-tool --token $(varlock printenv MY_TOKEN)'
```

### varlock scan

Scans your project files for sensitive config values that should not appear in plaintext. Loads your varlock config, resolves all `@sensitive` values, then checks files for any occurrences of those values.

This is especially useful as a **pre-commit git hook** to prevent accidentally committing secrets into version control, and for **scanning build output** to ensure no secrets leaked into files that will be published or deployed.

```bash
varlock scan [paths...] [options]
```

**Positional arguments:**

- `[paths...]`: Optional list of file paths, directories, or glob patterns to scan. When provided, only these targets are scanned — git filtering (`--staged`, `--include-ignored`) is bypassed and build-output directories that are normally skipped (such as `dist`, `.next`, `build`) are included.

**Options:**

- `--staged`: Only scan staged git files (ignored when explicit paths are provided)
- `--include-ignored`: Include git-ignored files in the scan (ignored when explicit paths are provided)
- `--install-hook`: Set up `varlock scan` as a git pre-commit hook
- `--path` / `-p`: Path to a specific `.env` file or directory to use as the schema entry point. Can be specified multiple times to load from multiple paths — later paths take higher precedence.

**Examples:**

```bash
# Scan all non-gitignored files in the current directory
varlock scan

# Only scan staged git files
varlock scan --staged

# Scan all files, including gitignored ones
varlock scan --include-ignored

# Scan a specific build output directory (e.g. to check for leaked secrets before publishing)
varlock scan ./dist

# Scan multiple directories
varlock scan ./dist ./public

# Scan files matching a glob pattern
varlock scan './dist/**/*.js'

# Use a specific .env file as the schema entry point
varlock scan --path .env.prod

# Use multiple schema entry points
varlock scan -p ./envs -p ./overrides

# Set up as a git pre-commit hook
varlock scan --install-hook
```

### varlock encrypt

Encrypts sensitive values using device-local encryption. Encrypted values are stored in `.env` files using the `varlock()` resolver function and are automatically decrypted at load time.

On macOS, encryption is hardware-backed via the Secure Enclave (with Touch ID / biometric authentication). On Windows and Linux, platform-specific secure storage is used. A pure-JavaScript file-based fallback is available on all platforms.

```bash
varlock encrypt [options]
```

**Options:**

- `--file`: Path to a `.env` file — encrypts all sensitive plaintext values in-place

**Examples:**

```bash
# Interactive mode: encrypt a single value (prompts with hidden input)
varlock encrypt

# Pipe a value via stdin (keeps secrets out of shell history)
printf '%s' "$SECRET" | varlock encrypt
varlock encrypt < secret.txt

# Encrypt all sensitive plaintext values in a .env file
varlock encrypt --file .env.local
```

In single-value mode, you’ll either be prompted to enter a value (hidden input) or the value will be read from stdin when piped. The encrypted output is printed for you to copy into your `.env.local` file:

```plaintext
SOME_SENSITIVE_KEY=varlock("local:<encrypted>")
```

In file mode, varlock loads the env graph, identifies `@sensitive` items with plaintext values, and lets you select which to encrypt in-place.

### varlock reveal

Securely view or copy the value of a `@sensitive` environment variable. The value is displayed in an alternate terminal screen buffer so it doesn’t persist in your scrollback history.

🔒 Usually sensitive values are redacted, so this is needed to actually view the value without exposing it in plaintext on disk or in your terminal history.

```bash
varlock reveal [VAR_NAME] [options]
```

**Options:**

- `--copy`: Copy the value to clipboard instead of displaying (auto-clears after 10s)
- `--path` / `-p`: Path to a specific `.env` file or directory to use as the entry point
- `--env`: Set the environment (e.g., production, development, etc)

**Examples:**

```bash
# Interactive picker to browse and reveal sensitive values
varlock reveal

# Reveal a specific variable
varlock reveal MY_SECRET

# Copy a value to clipboard (auto-clears after 10s)
varlock reveal MY_SECRET --copy
```

### varlock lock

Locks the encryption daemon, requiring biometric authentication (e.g., Touch ID) for the next decrypt operation. This invalidates the current biometric session cache.

```bash
varlock lock
```

This command only has an effect when using a biometric-enabled encryption backend (macOS Secure Enclave, Windows Hello, or Linux with polkit/PAM biometric setup). On other backends, it will display a message and exit.

### varlock audit

Scans your source code for environment variable references and compares them against keys defined in your schema.

This command reports two drift categories:

- **Missing in schema**: key is used in code but not declared in schema
- **Unused in schema**: key is declared in schema but not referenced in code

Exit codes:

- `0` when schema and code are in sync
- `1` when drift is detected

```bash
varlock audit [paths...] [options]
```

**Positional arguments:**

- `[paths...]`: Optional list of directories to scan. When provided, only these directories are scanned instead of the auto-detected scan root.

**Options:**

- `--path` / `-p`: Path to a specific `.env` file or directory to use as the schema entry point
- `--ignore` / `-i`: Directory to exclude from code scanning (can be specified multiple times)

**Examples:**

```bash
# Audit current project
varlock audit

# Audit using a specific .env file as schema entry point
varlock audit --path .env.prod

# Audit using a directory as schema entry point
varlock audit --path ./config

# Only scan specific directories
varlock audit ./src ./lib

# Exclude directories from scanning
varlock audit --ignore vendor

# Exclude multiple directories
varlock audit -i vendor -i generated
```

### varlock cache

Manage the encrypted **disk cache** used by [`cache()`](https://varlock.dev/reference/functions/#cache) and plugin authors when cache mode is set to `disk`. When run in a TTY, opens an interactive browser; otherwise prints a status summary.

```bash
varlock cache [status|clear] [options]
```

**Sub-commands:**

- `status` — print a non-interactive cache status summary (location, file size, entry counts by group)
- `clear` — remove cache entries. Requires `--yes` for non-interactive use.

**Options:**

- `--plugin <name>`: When clearing, only remove entries for a specific plugin
- `--yes` / `-y`: Skip confirmation prompts (required when clearing without a TTY)

**Examples:**

```bash
# Interactive cache browser (or status summary in CI)
varlock cache

# Print a non-interactive status summary
varlock cache status

# Clear all cache entries (prompts to confirm)
varlock cache clear

# Clear all cache entries without confirming (e.g. CI)
varlock cache clear --yes

# Clear cache for a specific plugin only
varlock cache clear --plugin 1password --yes
```

See the [Caching guide](https://varlock.dev/guides/caching/) for cache mode strategy and troubleshooting.

### varlock typegen

Generates type files according to [`@generateTypes`](https://varlock.dev/reference/root-decorators/#generatetypes) and your config schema. Uses only non-environment-specific schema info, so output is deterministic regardless of which environment is active.

This command is particularly useful when you have set `auto=false` on the [`@generateTypes`](https://varlock.dev/reference/root-decorators/#generatetypes) decorator to disable automatic type generation during `varlock load` or `varlock run`.

```bash
varlock typegen [options]
```

**Options:**

- `--path` / `-p`: Path to a specific `.env` file or directory to use as the entry point. Can be specified multiple times to load from multiple paths — later paths take higher precedence.

**Examples:**

```bash
# Generate types using the default schema
varlock typegen

# Generate types from a specific .env file
varlock typegen --path .env.prod

# Generate types from multiple directories
varlock typegen -p ./envs -p ./overrides
```

### varlock telemetry

Opts in/out of anonymous usage analytics. This command creates/updates a configuration file at `$XDG_CONFIG_HOME/varlock/config.json` (defaults to `~/.config/varlock/config.json`) saving your preference.

```bash
varlock telemetry disable
varlock telemetry enable
```

### varlock generate-key

Generates a random 256-bit encryption key for use with `_VARLOCK_ENV_KEY`. This key is used to encrypt the resolved env blob that gets baked into your build output on certain frameworks/platforms.

```bash
varlock generate-key
```

See the [Next.js](https://varlock.dev/integrations/nextjs/#encrypting-the-env-blob) and [Vite](https://varlock.dev/integrations/vite/#encrypting-the-env-blob) integration docs for setup instructions.

### varlock help

Displays general help information, alias for `varlock --help`

```bash
varlock help
```

For help about specific commands, use:

```bash
varlock subcommand --help
```