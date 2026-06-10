---
title: "@type data types"
site: "Varlock"
source: "https://varlock.dev/reference/data-types/"
domain: "varlock.dev"
language: "en"
description: "A reference page of available data types to be used with the `@type` item decorator"
word_count: 812
---

The [`@type` item decorator](https://varlock.dev/reference/item-decorators/#type) sets the data type associated with an item. The data type affects coercion, validation, and [generated type files](https://varlock.dev/reference/root-decorators/#generatetypes).

### Additional data type options

All types (except `enum`) can be used without any arguments, but most take optional arguments that further narrow the type’s behavior.

```env-spec
# @type=string
NO_ARGS=
# @type=string(minLength=5, maxLength=10, toUpperCase=true)
WITH_ARGS=
```

### Coercion & validation process

Once a raw value is resolved - which could from a static value in an `.env` file, a [function](https://varlock.dev/reference/functions/), or an override passed into the process - the raw value will be coerced and validated based on the type, respecting additional arguments provided to the type.

Consider the following example:

```env-spec
# @type=number(precision=0, max=100)
ITEM="123.45"
```

The internal coercion/validation process looks like:  
`"123.45"` -\> `123.45` -\> `123` -\> ❌ invalid (greater than max)

### Default behavior

When no `@type` is specified, a type will be inferred where possible - for static values, and some functions that return a known type. Note that the use of quotes matters. Otherwise the type will default to `string`.

```env-spec
INFERRED_STRING_QUOTED="foo"
INFERRED_STRING_UNQUOTED=foo
INFERRED_NUMBER=123     # infers number type
QUOTED_NUM_STRING="123" # remains a string unless @type=number is used
INFERRED_BOOLEAN=true

# return type of some functions can be inferred
CONCAT_INFERS_STRING=\`concat-${SOMEVAR}-will-be-string\`
FN_INFER_BOOLEAN=eq($VAR1, $VAR2)
DEFAULTS_TO_STRING_FN=fnThatCannotInferType()

# with no other info, we default to string
DEFAULTS_TO_STRING=
```

Note that numeric values that would lose precision, or change any formatting (like leading/trailing zeros), will be treated as strings unless explicitly adding `@type=number`.

In any slightly ambiguous situation, it is better to explicitly add a `@type` decorator.

## Built-in data types

These are the built-in data types. [Plugins](https://varlock.dev/guides/plugins/) may register additional data types.

### string

**Options:**

- `minLength` (number): Minimum length of the string
- `maxLength` (number): Maximum length of the string
- `isLength` (number): Exact length required
- `startsWith` (string): Required starting substring
- `endsWith` (string): Required ending substring
- `matches` (string|RegExp): Regular expression pattern to match — use `/pattern/flags` syntax or a quoted string pattern (see [regex-like strings](https://varlock.dev/reference/functions#regex-like-strings))
- `toUpperCase` (boolean): Convert to uppercase
- `toLowerCase` (boolean): Convert to lowercase
- `allowEmpty` (boolean): Allow empty string (default: false)

```env-spec
# @type=string(minLength=5, maxLength=10, toUpperCase=true)
MY_STRING=value
```

### number

**Options:**

- `min` (number): Minimum allowed value (inclusive)
- `max` (number): Maximum allowed value (inclusive)
- `coerceToMinMaxRange` (boolean): Coerce value to be within `min` / `max` range
- `isDivisibleBy` (number): Value must be divisible by this number
- `isInt` (boolean): Value must be an integer (equivalent to `precision=0`)
- `precision` (number): Number of decimal places to keep

```env-spec
# @type=number(min=0, max=100, precision=1)
MY_NUMBER=42.5
```

### boolean

The following values will be coerced to a boolean and considered valid:

- True values: `"t"`, `"true"`, `true`, `"yes"`, `"on"`, `"1"`, `1`
- False values: `"f"`, `"false"`, `false`, `"no"`, `"off"`, `"0"`, `0`

Anything else will be considered invalid.

```env-spec
# @type=boolean
MY_BOOL=true
```

### url

**Options:**

- `prependHttps` (boolean): Automatically prepend “https://” if no protocol is specified
- `allowedDomains` (string\[\]): List of allowed domains
- `noTrailingSlash` (boolean): Disallow a trailing slash on the URL path (except root `/`)
- `matches` (string|RegExp): Regular expression pattern the full URL must match — use `/pattern/flags` syntax or a quoted string pattern (see [regex-like strings](https://varlock.dev/reference/functions#regex-like-strings))

```env-spec
# @type=url(prependHttps=true)
MY_URL=example.com/foobar

# @type=url(noTrailingSlash=true, matches=/^https:\/\/api\./)
API_URL=https://api.example.com/v1
```

### enum

Checks a value is contained in a list of possible values - it must match one exactly.

**NOTE** - this is the only type that cannot be used without any additional arguments

```env-spec
# @type=enum(development, staging, production)
ENV=development
```

### email

**Options:**

- `normalize` (boolean): Convert email to lowercase

```env-spec
# @type=email(normalize=true)
MY_EMAIL=User@Example.com
```

### port

Checks for valid port number. Coerces to a number.

**Options:**

- `min` (number): Minimum port number (default: 0)
- `max` (number): Maximum port number (default: 65535)

```env-spec
# @type=port(min=1024, max=9999)
MY_PORT=3000
```

### ip

Checks for a valid [IP address](https://en.wikipedia.org/wiki/IP_address).

**Options:**

- `version` (`4|6`): IPv4 or IPv6
- `normalize` (boolean): Convert to lowercase

```env-spec
# @type=ip(version=4, normalize=true)
MY_IP=192.168.1.1
```

### semver

Checks for a valid [semantic version](https://semver.org/).

```env-spec
# @type=semver
MY_VERSION=1.2.3-beta.1
```

### isoDate

Checks for valid [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) date strings with optional time and milliseconds.

```env-spec
# @type=isoDate
MY_DATE=2024-03-20T15:30:00Z
```

### uuid

Checks for valid [UUID](https://en.wikipedia.org/wiki/UUID) (versions 1-5 per RFC4122, including `NIL`).

```env-spec
# @type=uuid
MY_UUID=123e4567-e89b-12d3-a456-426614174000
```

### md5

Checks for valid [MD5 hash](https://en.wikipedia.org/wiki/MD5).

```env-spec
# @type=md5
MY_HASH=d41d8cd98f00b204e9800998ecf8427e
```

### simple-object

Validates and coerces JSON strings into objects.

```env-spec
# @type=simple-object
MY_OBJECT={"key": "value"}
```

### duration

Flexible duration type. Accepts human-readable strings (`"1h"`, `"30m"`, `"500ms"`, `"2days"`) or bare numbers (interpreted as milliseconds — plain decimals only, no hex/exponent/ `Infinity` notation), and outputs a number in the unit you specify.

**Options:**

- `output` — output unit: `ms` (default), `seconds`, `minutes`, `hours`, `days`, or `weeks`
- `min` / `max` — bounds in any duration format (e.g. `min="1s"`, `max="1d"`)

```env-spec
# Default: output is milliseconds
# @type=duration
REQUEST_TIMEOUT=30s

# Output in seconds — typical for HTTP client configs
# @type=duration(output="seconds")
HTTP_TIMEOUT=1h

# With min/max bounds
# @type=duration(output="minutes", min="1m", max="1d")
POLL_INTERVAL=15m
```

Same parser is used by `cache(..., ttl=...)` and the plugin `cacheTtl` option, so any string that works there also works here. For cache mode behavior and troubleshooting, see the [Caching guide](https://varlock.dev/guides/caching/).