One of the core features of varlock is its schema-driven approach to environment variables - which is best when shared with your team and committed to version control. We recommend creating a new `.env.schema` file to hold schema info set by [config item decorators](https://varlock.dev/reference/item-decorators), non-sensitive default values, and [root decorators](https://varlock.dev/reference/root-decorators) to specify global settings that affect `varlock` itself.

This schema should include all of the environment variables that your application depends on, along with comments and documentation about them, and decorators which affect coercion, validation, and generated types / documentation.

The more complete your schema is, the more validation and coercion `varlock` can perform, and the more it can help you catch errors earlier in your development cycle.

> Running [`varlock init`](https://varlock.dev/reference/cli-commands#init) will attempt to convert an existing `.env.example` file into a `.env.schema` file. It must be reviewed, but it should be a good starting point.

The _header_ section of a `.env` file is any comment block(s) at the beginning of the file, before the first config item. Within this header, you can use [root decorators](https://varlock.dev/reference/root-decorators) to specify global settings and default behavior for all config items.

```
# This is the header, and may contain root decorators# @currentEnv=$APP_ENV# @defaultSensitive=false @defaultRequired=false# @generateTypes(lang=ts, path=env.d.ts)# ---# This is a config item comment block and may contain decorators which affect only the item# @required @type=enum(dev, test, staging, prod)APP_ENV=dev
```

More details:

-   [Root decorators reference](https://varlock.dev/reference/root-decorators)

Config items are the environment variables that your application depends on. Like normal `.env` syntax, each item is a key-value pair of the form `KEY=value`. The key is the name of the environment variable, and a value may be specified or not.

While simply enumerating all of them in your `.env.schema` is useful (like a `.env.example` file), [@env-spec](https://varlock.dev/env-spec/) allows us to attach additional comments and [item decorators](https://varlock.dev/reference/item-decorators), making our schema much more powerful.

Values may be static, or set using [functions](https://varlock.dev/reference/functions/), which can facilitate loading values from external sources without exposing any sensitive values.

**Quote rules:**

-   Static values can be wrapped in quotes or not — all quotes styles (`` ` ``, `"`, `'`) are supported
-   Values wrapped in single quotes do not support [expansion](https://varlock.dev/guides/schema/#ref-expansion)
-   Single line values may not contain newlines, but `\n` will be converted to an actual newline except in single quotes
-   Multiline values can be wrapped in ` ``` `, `"""`. Also supported is `"` and `'` but not recommended.
-   Unquoted values will be parsed as a number/boolean/undefined where possible (`ITEM=foo` -> `"foo"`, while `ITEM=true` -> `true`), however data-types may further coerce values
-   No value (undefined) and empty string ("") are distinct

```
NO_VALUE= # will resolve to undefinedEMPTY_STRING_VALUE="" # will resolve to empty stringSTATIC_VALUE_UNQUOTED=quotes are optional # but are recommended!STATIC_VALUE_QUOTED="#hashtag" # and are necessary in some casesBOOLEAN_VALUE=trueNUMERIC_VALUE=123.456FUNCTION_VALUE=exec(`op read "op://api-config/item/credential"`)EXPANSION_VALUE=${OTHER_VAR}-suffixMULTILINE_VALUE="""multiplelines"""
```

Comments are used to attach additional documentation and metadata to config items using [item decorators](https://varlock.dev/reference/item-decorators). This additional metadata is used by varlock to perform validation, coercion, and generate types / documentation.

Multiple comment lines _directly_ preceding an item will be attached to that item. A blank line or a divider (e.g., `# ---`) breaks a comment block and detaches it from the following config item. Any comment block before the first item is still part of the document header until it is ended by a blank line, a divider, or the end of the file. Comment lines can either contain regular comments or [item decorators](https://varlock.dev/reference/item-decorators). Standalone comments only count as decorator comments when the comment content starts with `@`.

```
# description of item can be multiple lines# this @decorator will be ignored because the line does not start with @# @sensitive=false @required # decorator lines can end with a comment# @type=string(startsWith=pk-) # multiple lines of decorators are allowedSERVICE_X_PUBLISHABLE_KEY=pk-abc123
```

More details:

-   [Item decorators reference](https://varlock.dev/reference/item-decorators)
-   [@type data types reference](https://varlock.dev/reference/data-types)
-   [Functions reference](https://varlock.dev/reference/functions)

## Resolver Functions

[Section titled “Resolver Functions”](https://varlock.dev/guides/schema/#resolver-functions)

You may use [resolver functions](https://varlock.dev/reference/functions/) instead of static values within both config items and decorator values.

Functions may be composed together to create more complex value resolution logic.

```
# @required=forEnv(prod)API_DOMAIN=if(eq(ref(APP_ENV), prod), api.myapp.com, staging-api.myapp.com)
```

### Referencing other values

[Section titled “Referencing other values”](https://varlock.dev/guides/schema/#ref-expansion)

Within values and function args, you often need to reference other env vars within your schema.

You may use [`ref()`](https://varlock.dev/reference/functions/#ref) but we support _expansion_ syntax (like many other .env tools) for convenience.

Both `$ITEM` and `${ITEM}` are equivalent to `ref(ITEM)`.

We recommend using the bracket version only when used within a larger string.

```
WITH_BRACKETS=exec(`op read "op://${OP_VAULT_NAME}/service/api-key"`)NO_BRACKETS=fallback($OTHERVAR, foo)
```

Read more about string expansion in the [@env-spec reference](https://varlock.dev/env-spec/reference/#expansion).

## Decorator details

[Section titled “Decorator details”](https://varlock.dev/guides/schema/#decorator-details)

### Functions vs single use

[Section titled “Functions vs single use”](https://varlock.dev/guides/schema/#functions-vs-single-use)

Most decorators take a single value (e.g., `@sensitive`, `@currentEnv`) and may be used only once per item (or file in the case of a root decorator). Some decorators however, are function calls (e.g., `@docs()`, `@import()`) and may be called multiple times.

```
# @sensitive=true# @docs(https://xyzapi.com/docs/auth)# @docs(https://xyzapi.com/manage-api-keys)XYZ_API_KEY=
```

Values passed to decorators will be resolved, meaning if a decorator is expecting a boolean, either a static `true`/`false` or a [resolver function](https://varlock.dev/reference/functions) that resolves to a boolean may be used.

```
# @required=falseNEVER_REQUIRED=# @required=forEnv(prod) # resolves to true/false depending on the current environmentREQUIRED_FOR_PROD=
```