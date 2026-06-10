---
title: "Default Environment Variables"
site: "Render"
source: "https://render.com/docs/environment-variables"
domain: "render.com"
language: "en"
description: "Render makes the following environment variables available to all services at runtime, as well as during builds and deploys."
word_count: 745
---

Render automatically sets the values of certain environment variables for your service.

Unless otherwise noted, these environment variables are available at both build time and runtime.

**Environment variable values are always strings.**

In your application logic, perform any necessary conversions for variable values that represent other data types, such as `"false"` or `"10000"`.

## By runtime

### All runtimes

###### IS\_PULL\_REQUEST

This value is `true` for [pull request previews](https://render.com/docs/service-previews) and `false` otherwise.

Note that these are the *string* values `"true"` and `"false"`. Convert to booleans as needed.

###### RENDER

This value is always `true`. Your code can check this value to detect whether it's running on Render.

###### RENDER\_CPU\_COUNT

The number of CPUs available for this service, based on its [instance type](https://render.com/pricing#services).

For example, this value is `0.5` for the Starter instance type and `2` for the Pro instance type. Note that these are the *string* values `"0.5"` and `"2"`. Convert to numbers as needed.

###### RENDER\_DISCOVERY\_SERVICE

The Render DNS name used to discover all running instances of a [scaled service](https://render.com/docs/scaling). Has the format `$RENDER_SERVICE_NAME-discovery`.

###### RENDER\_EXTERNAL\_HOSTNAME

For a web service or static site, this is the service's `onrender.com` hostname (such as `myapp.onrender.com`).

For other service types, this value is empty.

###### RENDER\_EXTERNAL\_URL

For a web service or static site, this is the service's full `onrender.com` URL (such as `https://myapp.onrender.com`).

For other service types, this value is empty.

###### RENDER\_GIT\_BRANCH

The Git branch for a service or deploy.

###### RENDER\_GIT\_COMMIT

The commit SHA for a service or deploy.

###### RENDER\_GIT\_REPO\_SLUG

Has the format `$username/$reponame`.

###### RENDER\_INSTANCE\_ID

The unique identifier of the current service instance. Useful for [scaled services](https://render.com/docs/scaling) with multiple instances.

###### RENDER\_SERVICE\_ID

The service's unique identifier. Used in the [Render API](https://render.com/docs/api).

###### RENDER\_SERVICE\_NAME

A unique, human-readable identifier for a service.

###### RENDER\_SERVICE\_TYPE

The current service's [type](https://render.com/docs/service-types). One of `web`, `pserv`, `cron`, `worker`, `static`.

###### RENDER\_WEB\_CONCURRENCY

For a web service or private service, this is the recommended number of concurrent web processes for handling requests. This is based on the number of CPUs available on the service's [instance type](https://render.com/pricing#services).

For example, this value is `1` for the Starter instance type and `2` for the Pro instance type. Note that these are the *string* values `"1"` and `"2"`. Convert to numbers as needed.

This is only available at runtime. At build time or for other service types, this value is empty.

###### WEB\_CONCURRENCY

For a web service or private service created after December 8th 2025, this defaults to the recommended number of concurrent web processes for handling requests. This is based on the number of CPUs available on the service's [instance type](https://render.com/pricing#services).

For example, this value is `1` for the Starter instance type and `2` for the Pro instance type. Note that these are the *string* values `"1"` and `"2"`. Convert to numbers as needed.

This is only available at runtime. At build time, for other service types, or for web and private services created before the cutoff date, this value is empty.

**Other environment variables starting with `RENDER_` might be present in your build and runtime environments.**

However, variables not listed above are strictly for internal use and might change without warning.

### Docker

Render does not provide additional environment variables on top of what's listed under [All runtimes](#all-runtimes).

### Elixir

###### MIX\_ENV

`prod`

###### RELEASE\_DISTRIBUTION

`name`

### Go

###### GO111MODULE

`on`

###### GOPATH

`/opt/render/project/go`

### Node.js

###### NODE\_ENV

`production` (runtime only)

###### NODE\_MODULES\_CACHE

`true`

### Python 3

###### CI

`true` (build time only)

###### FORWARDED\_ALLOW\_IPS

`*`

###### GUNICORN\_CMD\_ARGS

`--preload --access-logfile - --bind=0.0.0.0:10000`

###### PIPENV\_YES

`true`

###### VENV\_ROOT

`/opt/render/project/src/.venv`

### Ruby

###### BUNDLE\_APP\_CONFIG

`/opt/render/project/.gems`

###### BUNDLE\_BIN

`/opt/render/project/.gems/bin`

###### BUNDLE\_DEPLOYMENT

`true`

###### BUNDLE\_PATH

`/opt/render/project/.gems`

###### GEM\_PATH

`/opt/render/project/.gems`

###### MALLOC\_ARENA\_MAX

`2`

###### PASSENGER\_ENGINE

`builtin`

###### PASSENGER\_ENVIRONMENT

`production`

###### PASSENGER\_PORT

`10000`

###### PIDFILE

`/tmp/puma-server.pid`

###### RAILS\_ENV

`production`

###### RAILS\_SERVE\_STATIC\_FILES

`true`

###### RAILS\_LOG\_TO\_STDOUT

`true`

### Rust

###### CARGO\_HOME

`/opt/render/project/.cargo`

###### ROCKET\_ENV

`prod`

###### ROCKET\_PORT

`10000` (runtime only)

###### RUSTUP\_HOME

`/opt/render/project/.rustup`

## Optional environment variables

You can set these environment variables to modify the default behavior for your services.

### All runtimes

###### PORT

For [web services](https://render.com/docs/web-services), specify the port that your HTTP server binds to.

The default port is `10000`.

### Elixir

###### ELIXIR\_VERSION

See [Setting Your Elixir and Erlang Versions](https://render.com/docs/elixir-erlang-versions).

###### ERLANG\_VERSION

See [Setting Your Elixir and Erlang Versions](https://render.com/docs/elixir-erlang-versions).

### Node.js

###### SKIP\_INSTALL\_DEPS

Set this to `true` to skip running `yarn` / `npm install` during build.

###### NODE\_VERSION

See [Setting Your Node.js Version](https://render.com/docs/node-version).

###### BUN\_VERSION

See [Setting Your Bun Version](https://render.com/docs/bun-version).

### Python 3

###### PYTHON\_VERSION

See [Setting Your Python Version](https://render.com/docs/python-version).

###### POETRY\_VERSION

See [Setting Your Poetry Version](https://render.com/docs/poetry-version).

###### UV\_VERSION

See [Setting Your uv Version](https://render.com/docs/uv-version).

### Rust

###### RUSTUP\_TOOLCHAIN

See [Specifying a Rust Toolchain](https://render.com/docs/rust-toolchain).

## How to set environment variables

See [Environment Variables and Secrets](https://render.com/docs/configure-environment-variables).