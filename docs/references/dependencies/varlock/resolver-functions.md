---
title: "Resolver functions"
site: "Varlock"
source: "https://varlock.dev/reference/functions/"
domain: "varlock.dev"
language: "en"
description: "A comprehensive reference of all available function resolvers in varlock"
word_count: 1563
---

You may use *resolver functions* instead of static values within both config items and decorator values.

Functions can be composed together to create more complex value resolution logic.

```env-spec
ITEM=fn(arg1, arg2)
COMPOSITION=fn1(fn1Arg1, fn2(fn2Arg1, fn2Arg2))
```

Note that many built-in utility functions have *expansion* equivalents and often it will be more clear to use them that way. For example:

```env-spec
EXPANSION_EQUIVALENT="pre-${OTHER}-post"
USING_FN_CALLS=concat("pre-", ref(OTHER), "-post")

# mixed example
CONFIG=exec(\`aws ssm get-parameter --name "/config/${APP_ENV}" --with-decryption\`)
```

There are built-in utility functions, [random value generators](#random-value-generators), a [`cache()`](#cache) function for reusing values according to your global cache mode, encryption functions for device-local secrets, and plugin-provided resolver functions that can fetch data from external providers. See the [Plugins guide](https://varlock.dev/guides/plugins/) for more information on plugin-provided functions.

## Core

### ref()

References another config item (env var) - which is useful when composing multiple functions together.

Expansion equivalent: `ref(OTHER_VARL)` === `${OTHER_VAR}` (and also `$OTHER_VAR`)

We recommend using the bracketed version within string templates, and the simpler version when referencing an item directly.

```env-spec
API_URL=https://api.example.com
USERS_API_URL=${API_URL}/users
USERS_API_URL2=concat(ref("API_URL"), "/users") # without using expansion
```

### concat()

Concatenates multiple values into a single string.

Expansion uses `concat()` to combine multiple parts of strings when they include multiple parts.

```env-spec
PATH=concat("base/", ref("APP_ENV"), "/config.json")
PATH2=\`base/${APP_ENV}/config.json\` # equivalent using expansion
```

### exec()

Executes a CLI command and uses its output as the value. This is particularly useful for integrating with external tools and services.

Expansion equivalent: `exec(command)` === `$(command)`

```env-spec
# Using 1Password CLI
API_KEY=exec(\`op read "op://dev test/service x/api key"\`)
# Using AWS CLI
AWS_CREDENTIALS=exec(\`aws sts get-session-token --profile prod\`)
```

### fallback()

Returns the first non-empty value in a list of possible values.

```env-spec
POSSIBLY_EMPTY=
ANOTHER=
EXAMPLE=fallback(ref(POSSIBLY_EMPTY), ref(ANOTHER), "default-val")
```

### remap()

Maps a value to a new value based on a set of lookup pairs. This is useful for translating one value, often provided by an external platform, into another.

- The first argument is the value to remap (often a `ref()` to another variable).
- All following arguments are pairs of `(matchValue, resultValue)`.
- An optional trailing default value can be added as the last argument (when the total number of remaining args is odd).
- Match values can be a string, `undefined`, or a [regex-like string](https://varlock.dev/reference/functions#regex-like-strings) (`/pattern/`).
- If no match is found and there is no default, the original value is returned.

```env-spec
# env var that is set by CI/platform
CI_BRANCH=

# @type=enum(development, preview, production)
APP_ENV=remap($CI_BRANCH, "main", production, /.*/, preview, undefined, development)
```

## Utilities

### ifs()

Evaluates a series of condition/value pairs, returning the value for the first truthy condition. Similar to Excel’s `IFS` function.

- Arguments are pairs of `(condition, value)`.
- An optional trailing default value can be added as the last argument (when the total number of args is odd).
- If no condition is truthy and there is no default, returns `undefined`.

```env-spec
ENV=staging

# returns the value matching the first truthy condition
API_URL=ifs(
  eq($ENV, production), https://api.example.com,
  eq($ENV, staging), https://staging-api.example.com,
  http://localhost:3000
)
```

### Regex-like strings

Certain functions like `remap()` and type options like `matches` support regex pattern matching. You can use JavaScript-style regex syntax (`/pattern/flags`) as an unquoted value — these will be automatically detected and treated as regular expressions.

A string is treated as a regex when it:

- Starts and ends with `/` (with optional flags like `i`, `g`, `m`, `s`, `u`, `y` after the closing `/`)
- Is **not** wrapped in quotes

```env-spec
# regex pattern in remap — matches case-insensitively
ENV_TYPE=remap($APP_ENV, /^dev.*/i, dev, "production", prod)

# regex pattern in type options
# @type=string(matches=/^sk-[a-zA-Z0-9]+$/)
API_KEY=

# @type=url(matches=/^https:\/\/api\./)
API_URL=
```

### forEnv()

Resolves to a boolean, if the current [environment](https://varlock.dev/reference/root-decorators/#currentenv) matches any in the list passed in as args.

**Requirements:**

- Requires an [`@currentEnv`](https://varlock.dev/reference/root-decorators/#currentenv) to be set in your `.env.schema` file
- Takes one or more environment names as arguments

```env-spec
# @currentEnv=$APP_ENV @defaultRequired=false
# @disable=forEnv(test)  # entire file will be disabled if env is test
# ---
APP_ENV=staging

# Required only in development
# @required=forEnv(development)
DEV_API_KEY=

# Required in staging and production
# @required=forEnv(staging, production)
PROD_API_KEY=
```

### eq()

Checks if 2 values are equal and resolves to a boolean.

```env-spec
IS_STAGING_DEPLOYMENT=eq($GIT_BRANCH, "staging")
```

### if()

Checks a boolean to return a true/false option

```env-spec
API_URL=if(eq($GIT_BRANCH, "main"), api.example.com, staging-api.example.com)
```

### not()

Negates a value and returns a boolean. Falsy values are - `false`, `""`, `0`, `undefined`, and will be negated to `true`. Otherwise will return `false`.

```env-spec
# Negate the result of another function
SHOULD_DISABLE_FEATURE=not(forEnv(production))
```

### isEmpty()

Returns `true` if the value is `undefined` or an empty string, `false` otherwise.

```env-spec
# Check if a value is empty
HAS_API_KEY=not(isEmpty($API_KEY))

# Use with conditional logic
API_URL=if(isEmpty($CUSTOM_API_URL), "https://api.default.com", $CUSTOM_API_URL)
```

## Random value generators

These functions generate random values using cryptographically secure randomness (`node:crypto`). In ephemeral environments, it can be helpful to generate values that are unique per run/deployment. For local dev, the [`cache()`](#cache) function can be used to keep a value stable for a period of time.

### randomNum()

Generates a random number. **Integer by default**; if you pass `precision=N`, returns a float with `N` decimal places.

- With 1 arg: generates between `0` and `max` (inclusive)
- With 2 args: generates between `min` and `max` (inclusive)
- `precision=N` option switches to float mode (decimal places, 0-20)

```env-spec
# Cached random port between 3000 and 4000 (integer)
DEV_PORT=cache(randomNum(3000, 4000))

# One-off random integer up to 1000
SEED=randomNum(1000)

# Random float between 0 and 1 with 4 decimal places
RATE=randomNum(0, 1, precision=4)

# Cached random float between 10 and 20 with 4 decimal places
THRESHOLD=cache(randomNum(10, 20, precision=4))
```

### randomUuid()

Generates a random UUID v4.

```env-spec
# Unique identifier for this environment (stable across runs)
INSTANCE_ID=cache(randomUuid())

# Per-run / per-evaluation ID
REQUEST_ID=randomUuid()
```

### randomHex()

Generates a random hexadecimal string. By default the argument is the **character length** of the output. Pass `bytes=true` to interpret the argument as a byte count instead (where each byte = 2 hex characters). Default is `32` characters.

```env-spec
# 32-character hex string (default)
# @sensitive
SESSION_SECRET=cache(randomHex())

# 64-character hex string
# @sensitive
ENCRYPTION_KEY=cache(randomHex(64))

# 32 bytes (= 64 hex chars) — byte-length mode
# @sensitive
HMAC_KEY=cache(randomHex(32, bytes=true))

# Non-sensitive one-off value
NONCE=randomHex(16)
```

### randomString()

Generates a random alphanumeric string. Default length is `16` characters using `A-Za-z0-9`.

- First arg: character length (default: 16)
- `charset=S` option: custom character set to draw from

```env-spec
# 32-character alphanumeric string
# @sensitive
API_SECRET=cache(randomString(32))

# 8-character string from custom charset
PIN_CODE=cache(randomString(8, charset="0123456789"))

# One-off random string
TEMP_LABEL=randomString(10)
```

## Caching

### cache()

Wraps any resolver to cache its result. See [caching guide](https://varlock.dev/guides/caching/) for more details.

- First arg: the resolver to cache
- `ttl=D` option: how long to cache (default: `forever`). Accepts duration strings with `ms`, `s`, `m`, `h`, `d`, `w` suffixes (long forms and plurals also work), bare numbers as milliseconds, or the keyword `forever` to cache until manually cleared.
- `key=S` option: use an explicit cache key instead of the auto-generated one. Useful when the same cached value should be shared across files or when you want a stable key that doesn’t change with resolver edits.
	- Keys must be non-empty printable text (no control characters) and at most 2048 characters.

The cache automatically invalidates when you change the wrapped resolver expression (unless using a custom `key`).

```env-spec
# Cache a random UUID forever (until manually cleared)
INSTANCE_ID=cache(randomUuid())

# Cache an API token for 1 hour
AUTH_TOKEN=cache(exec(\`get-token.sh\`), ttl="1h")

# Cache for 30 minutes
TEMP_KEY=cache(randomHex(32), ttl="30m")

# Use an explicit cache key (shared across files/projects)
SHARED_TOKEN=cache(exec(\`fetch-org-token.sh\`), ttl="1d", key="org-auth-token")
```

Use the [`varlock cache`](https://varlock.dev/reference/cli-commands/#cache) CLI command to view or clear the **disk cache**.

Use `--clear-cache` or `--skip-cache` flags on `varlock load` / `varlock run` / `varlock printenv` to control caching behavior for a single invocation.

Global cache behavior is configured with the [`@cache` root decorator](https://varlock.dev/reference/root-decorators/#cache).

In `memory` mode, `varlock cache` will not show in-memory entries from a running process.

For strategy recommendations and troubleshooting, see the [Caching guide](https://varlock.dev/guides/caching/).

## Encryption

### varlock()

Decrypts a locally encrypted value, or prompts for a new secret to encrypt. This is the built-in resolver for varlock’s [device-local encryption](https://varlock.dev/guides/local-encryption/) feature.

**Decrypt mode** — pass an encrypted payload to decrypt at load time:

```env-spec
# @sensitive
API_KEY=varlock("local:<encrypted-payload>")
```

**Prompt mode** — prompts the user to enter a secret, encrypts it, and writes the encrypted value back to the source file:

```env-spec
# @sensitive
API_KEY=varlock(prompt)
# also valid as a key=value param:
API_KEY=varlock(prompt=1)
```

On first run with `prompt` mode, you’ll be asked to enter the secret value. Once entered, the file is automatically updated with the encrypted payload. On macOS with Secure Enclave, a native dialog with biometric authentication is used.

Values are encrypted using the best available backend on your platform — see the [Local encryption guide](https://varlock.dev/guides/local-encryption/) for details.

Encrypted payload lifecycle:

- Store encrypted payloads (`varlock("local:...")`) in local override files (typically `.env.local`)
- Decryption happens at runtime during `varlock load` / `varlock run`
- Use [`varlock reveal`](https://varlock.dev/reference/cli-commands/#reveal) when you need to inspect a decrypted value interactively

### keychain()

Reads a secret from the **macOS Keychain**. This built-in resolver communicates through Varlock’s native Swift daemon, enforcing biometric (Touch ID) authentication and per-session access control. See the [macOS Keychain page](https://varlock.dev/plugins/macos-keychain/) for full documentation.

**Array args:**

- `service` (optional): Service name of the keychain item (positional shorthand)
- `prompt` (optional): Enter interactive picker mode

**Key/value args:**

- `service` (optional): Service name of the keychain item
- `account` (optional): Account identifier for the keychain item
- `keychain` (optional): Name of a specific keychain to search (e.g., `"System"`)
- `field` (optional): Specific field to extract from the keychain item
- `prompt` (optional): If set, opens a native picker dialog for interactive selection

```env-spec
# Positional shorthand
DATABASE_PASSWORD=keychain("com.company.database")

# Named service with account
ADMIN_PW=keychain("com.company.db", account="admin")

# Interactive picker mode — writes back resolved reference
NEW_SECRET=keychain(prompt)
```