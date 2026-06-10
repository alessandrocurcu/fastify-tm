---
title: "Environment Variables and Secrets"
site: "Render"
source: "https://render.com/docs/configure-environment-variables"
domain: "render.com"
language: "en"
description: "Learn how to configure environment variables and secrets on Render."
word_count: 1401
---

You can (and should!) use **environment variables** to configure your Render services:

![List of environment variables in the Render Dashboard](https://render.com/docs-assets/bfa2c8f8594e356d1f5b657c3ec3bd98238d7fc71634dea157a8679907bd6e00/env-vars-dashboard.webp)

Environment variables enable you to customize a service's runtime behavior for different environments (such as development, staging, and production). They also protect you from committing secret credentials (such as API keys or database connection strings) to your application source.

In addition to setting environment variables, you can:

- Upload plaintext [secret files](#secret-files) to Render that are available from your service's file system at runtime.
- Create [environment *groups*](#environment-groups) to share a collection of environment variables and secret files across multiple Render services.

## Setting environment variables

Render sets default values for certain environment variables. [See the list](https://render.com/docs/environment-variables).

### In the Render Dashboard

1. In the [Render Dashboard](https://dashboard.render.com/), select the service you want to add an environment variable to.
2. Click **Environment** in the left pane.
3. Under **Environment Variables**, click **\+ Add Environment Variable**.
	- You can also click **Add from.env** to [add environment variables in bulk](#adding-in-bulk-from-a-env-file).
4. Provide a **Key** and **Value** for each new environment variable.
5. Save your changes. You can select one of three options from the dropdown:
	![Save options for environment variables in the Render Dashboard](https://render.com/docs-assets/6d79cb61650c38435ec077468239903983bb5e471c8f8b33ba17868f2a19db6c/env-vars-dropdown.webp)
	- **Save, rebuild, and deploy:** Render triggers a new build for your service and deploys it with the new environment variables.
		- **Save and deploy:** Render redeploys your service's *existing* build with the new environment variables.
		- **Save only:** Render saves the new environment variables *without* triggering a deploy. Your service will not use the new variables until its next deploy.

That's it! Render saves your environment variables and then kicks off a deploy (unless you selected **Save only**).

#### Adding in bulk from a.env file

If you have a local `.env` file, you can bulk-add its environment variables to your service by clicking **Add from.env** on your service's **Environment** page.

Your file must use valid `.env` syntax. Here are some valid variable declarations:

```bash
# Value without quotes (doesn't support whitespace)
KEY_1=value_of_KEY_1

# Value with quotes (supports whitespace)
KEY_2="value of KEY_2"

# Multi-line value
KEY_3="-----BEGIN-----
value
of
KEY_3
-----END-----"
```

### Via Blueprints

If you're using Render [Blueprints](https://render.com/docs/infrastructure-as-code) to represent your infrastructure as code, you can declare environment variables for a service directly in your `render.yaml` file.

**Don't commit the values of secret credentials to your `render.yaml` file!** Instead, you can declare [placeholder environment variables](https://render.com/docs/blueprint-spec#prompting-for-secret-values) for secret values that you then populate from the Render Dashboard.

Here are common patterns for declaring environment variables in a Blueprint:

```yaml
envVars:
  - key: NODE_ENV
    value: staging # Set NODE_ENV to the hardcoded string 'staging'

  - key: APP_SECRET
    generateValue: true # Render generates a random base64-encoded, 256-bit secret for APP_SECRET

  - key: DB_URL
    fromDatabase: # Set DB_URL to the connection string for the db 'mydb'
      name: mydb
      property: connectionString

  - key: MINIO_ROOT_PASSWORD
    fromService: # Copy the MINIO_ROOT_PASSWORD from the private service 'minio'
      type: pserv
      name: minio
      envVarKey: MINIO_ROOT_PASSWORD

  - key: STRIPE_API_KEY
    sync: false # For security, provide STRIPE_API_KEY in the Render Dashboard

  - fromGroup: my-env-group # Link the 'my-env-group' environment group to this service
```

For more details and examples, see the [Blueprint Specification](https://render.com/docs/blueprint-spec#environment-variables).

## Secret files

You can upload **secret files** to Render to make those files available to your service at runtime. These are plaintext files that usually contain one or more secret credentials, such as a private key.

The combined size of all secret files uploaded to any given service or [environment group](#environment-groups) cannot exceed 1 MB.

1. In the [Render Dashboard](https://dashboard.render.com/), select the service you want to add a secret file to.
2. Click **Environment** in the left pane.
3. Under **Secret Files**, click **\+ Add Secret File**.
	- You can click the button multiple times to add multiple files.
4. Provide a **Filename** for the secret file.
	- At runtime, the secret file is available at `/etc/secrets/<filename>`.
		- For non-Docker services, the file is *also* available in your service's root directory.
		- To access the secret file from a Docker-based service, see [Accessing secret files at runtime](https://render.com/docs/docker-secrets#accessing-secret-files-at-runtime).
5. Click the **Contents** field to paste in the file's contents.
6. Click **Save Changes**.

That's it! Render kicks off a new deploy of your service to make the secret file available.

## Environment groups

**Environment groups** are collections of environment variables and/or [secret files](#secret-files) that you can link to any number of different services. They're a helpful way to distribute configuration across a [multi-service architecture](https://render.com/docs/multi-service-architecture) using a single source of truth:

<svg id="graphDiv" width="100%" xmlns="http://www.w3.org/2000/svg" style="max-width: 547.046875px;" viewBox="0 0 547.046875 241.2734375" role="graphics-document document" aria-roledescription="flowchart-v2"><g><marker id="graphDiv_flowchart-v2-pointEnd" viewBox="0 0 10 10" refX="5" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" style="stroke-width: 1; stroke-dasharray: 1, 0;" /></marker><marker id="graphDiv_flowchart-v2-pointStart" viewBox="0 0 10 10" refX="4.5" refY="5" markerUnits="userSpaceOnUse" markerWidth="8" markerHeight="8" orient="auto"><path d="M 0 5 L 10 10 L 10 0 z" style="stroke-width: 1; stroke-dasharray: 1, 0;" /></marker><marker id="graphDiv_flowchart-v2-circleEnd" viewBox="0 0 10 10" refX="11" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto"><circle cx="5" cy="5" r="5" style="stroke-width: 1; stroke-dasharray: 1, 0;" /></marker><marker id="graphDiv_flowchart-v2-circleStart" viewBox="0 0 10 10" refX="-1" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto"><circle cx="5" cy="5" r="5" style="stroke-width: 1; stroke-dasharray: 1, 0;" /></marker><marker id="graphDiv_flowchart-v2-crossEnd" viewBox="0 0 11 11" refX="12" refY="5.2" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto"><path d="M 1,1 l 9,9 M 10,1 l -9,9" style="stroke-width: 2; stroke-dasharray: 1, 0;" /></marker><marker id="graphDiv_flowchart-v2-crossStart" viewBox="0 0 11 11" refX="-1" refY="5.2" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto"><path d="M 1,1 l 9,9 M 10,1 l -9,9" style="stroke-width: 2; stroke-dasharray: 1, 0;" /></marker><g><g /><g /><g /><g><g transform="translate(0, 0)"><g><g id="subGraph0" data-look="classic"><rect x="8" y="8" width="531.046875" height="225.2734375" /><g transform="translate(193.9921875, 8)"><foreignobject width="159.0625" height="26.109375"><p><strong>Render Workspace</strong></p></foreignobject></g></g></g><g><path stroke="currentColor" fill="none" d="M175.781,100.681L191.612,95.581C207.443,90.482,239.104,80.282,270.263,75.182C301.422,70.082,332.078,70.082,347.406,70.082L362.734,70.082" id="L_env_serviceA_0" style=";" data-edge="true" data-et="edge" data-id="L_env_serviceA_0" data-points="W3sieCI6MTc1Ljc4MTI1LCJ5IjoxMDAuNjgxMzc4MDI2MzU0MjV9LHsieCI6MjcwLjc2NTYyNSwieSI6NzAuMDgyMDMxMjV9LHsieCI6MzY2LjczNDM3NSwieSI6NzAuMDgyMDMxMjV9XQ==" marker-end="url(#graphDiv_flowchart-v2-pointEnd)" /><path stroke="currentColor" fill="none" d="M175.781,141.592L191.612,146.525C207.443,151.459,239.104,161.325,270.182,166.258C301.26,171.191,331.755,171.191,347.003,171.191L362.25,171.191" id="L_env_serviceB_0" style=";" data-edge="true" data-et="edge" data-id="L_env_serviceB_0" data-points="W3sieCI6MTc1Ljc4MTI1LCJ5IjoxNDEuNTkyMDU5NDczNjQ1NzV9LHsieCI6MjcwLjc2NTYyNSwieSI6MTcxLjE5MTQwNjI1fSx7IngiOjM2Ni4yNSwieSI6MTcxLjE5MTQwNjI1fV0=" marker-end="url(#graphDiv_flowchart-v2-pointEnd)" /></g><g><g transform="translate(270.765625, 70.08203125)"><g data-id="L_env_serviceA_0" transform="translate(-57.984375, -23.28125)"><foreignobject width="115.96875" height="46.5625"><p><code>DATABASE_URL<br />REDIS_URL</code></p></foreignobject></g></g><g transform="translate(270.765625, 171.19140625)"><g data-id="L_env_serviceB_0" transform="translate(-57.984375, -23.28125)"><foreignobject width="115.96875" height="46.5625"><p><code>DATABASE_URL<br />REDIS_URL</code></p></foreignobject></g></g></g><g><g id="flowchart-env-0" transform="translate(110.390625, 120.63671875)"><polygon stroke="currentColor" fill="none" points="0,0 113.78125,0 113.78125,-57.21875 0,-57.21875 0,0 -8,0 121.78125,0 121.78125,-57.21875 -8,-57.21875 -8,0" transform="translate(-56.890625,28.609375)" /><g transform="translate(-49.390625, -21.109375)"><rect /><foreignobject width="98.78125" height="42.21875"><p>Environment<br />Group</p></foreignobject></g></g><g id="flowchart-serviceA-1" transform="translate(433.8984375, 70.08203125)"><rect stroke="currentColor" fill="none" x="-67.1640625" y="-25.5546875" width="134.328125" height="51.109375" /><g transform="translate(-37.1640625, -10.5546875)"><rect /><foreignobject width="74.328125" height="21.109375"><p>Service A</p></foreignobject></g></g><g id="flowchart-serviceB-2" transform="translate(433.8984375, 171.19140625)"><rect stroke="currentColor" fill="none" x="-67.6484375" y="-25.5546875" width="135.296875" height="51.109375" /><g transform="translate(-37.6484375, -10.5546875)"><rect /><foreignobject width="75.296875" height="21.109375"><p>Service B</p></foreignobject></g></g></g></g></g></g></g></svg>

### Creating an environment group

1. In the [Render Dashboard](https://dashboard.render.com/), click **Environment Groups** in the left pane.
2. Click **\+ New Environment Group**. The following form appears:
	![Env group creation form](https://render.com/docs-assets/7ff1a07824db933a0d65830f0c0789fadb6592c5f172b5330d8311275440b48c/new-env-group.webp)
3. Provide a helpful **Group Name**.
4. Provide the keys and values for any environment variables you want to add to the group.
5. Upload any [secret files](#secret-files) you want to add to the group.
6. Click **Create Environment Group**. The newly created group appears in the list on your **Env Groups** page.

### Linking a group to a service

After you [create an environment group](#creating-an-environment-group), you can link it to any number of different services. You can link multiple environment groups to a single service.

**Important precedence details:**

- **Avoid variable collisions when linking multiple environment groups.** Render *does not guarantee* its precedence behavior when multiple linked environment groups define the same environment variable.
	- Currently, Render uses the value from the *most recently created* environment group. **This behavior might change in the future without notice.**
- If a service defines an environment variable in its individual settings, that value always takes precedence over any linked environment groups that also define the variable. Render *does* guarantee this behavior.

1. In the [Render Dashboard](https://dashboard.render.com/), select the service you want to link an environment group to.
2. Click **Environment** in the left pane.
3. Under **Linked Environment Groups**, select a group from the dropdown and click **Link**.

That's it! Render kicks off a new deploy of your service to incorporate the values from the linked environment group.

### Modifying a group

You can modify an existing environment group from your **Env Groups** page in the [Render Dashboard](https://dashboard.render.com/). You can add new values, replace existing values, and so on.

If you make changes to an environment group (including deleting it), Render kicks off a new deploy for every linked service that has autodeploys enabled.

### Scoping a group to a single environment

You can create [projects](https://render.com/docs/projects) to organize your services by their application and environment (such as staging or production). You can then scope an environment group to only the services in a single project environment. If you do, you can't link the group to any service *outside* that environment. This helps ensure that your services use exactly the configuration you expect.

If an environment group *doesn't* belong to a particular project environment, you can link it to *any* service in your team—including services that *do* belong to an environment.

1. From your environment group's details page, click **Manage \> Move group**:
	![Moving an environment group in the Render Dashboard](https://render.com/docs-assets/dc5751f04b370b23a779c860972687fb09696b903f800cf967e3b31f3406e52b/move-env-group-into-environment.webp)
	(This option doesn't appear if you haven't created any projects.)
2. In the dialog that appears, select a project and environment to move to.
3. Click **Move env group**.

After you move a group to a particular environment, it appears on the associated project's page:

![Environment groups on project overview page](https://render.com/docs-assets/722f56819550895820c350a6d813f9188563155cf0b1062a07b6426407b3c29e/projects-environment-groups.webp)

Note that you still need to link the group to any applicable services in the environment.

## Reading environment variables from code

Each programming language provides its own mechanism for reading the value of an environment variable. Below are basic examples of reading the environment variable `DATABASE_URL`.

**Environment variable values are always strings.**

In your application logic, perform any necessary conversions for variable values that represent other data types, such as `"false"` or `"10000"`.

#### JavaScript

```js
const databaseUrl = process.env.DATABASE_URL
```

#### Python

```python
import os
database_url = os.environ.get('DATABASE_URL')
```

#### Ruby

```ruby
database_url = ENV['DATABASE_URL']
```

#### Go

```go
package main
import "os"

func main() {
    databaseURL := os.Getenv("DATABASE_URL")
}
```

#### Elixir

```elixir
database_url = System.get_env("DATABASE_URL")
```

## Setting environment variables locally

### Using export

To set environment variables in your local environment, you can use the `export` command in your terminal:

```shell
$ export KEY=value
```

### Using a.env file

It can be useful to create a local `.env` file at the root of your local project that lists the names and values of environment variables, like so:

```bash
KEY1=value1
KEY2=value2
```

Many languages have a library for reading a `.env` file, such as [dotenv](https://www.npmjs.com/package/dotenv) for Node.js and [python-dotenv](https://github.com/theskumar/python-dotenv) for Python.

If you use a `.env` file, you can [bulk-add its environment variables](#adding-in-bulk-from-a-env-file) to your Render service.

**Do not commit your `.env` file to source control!** This file often contains secret credentials. To avoid accidentally committing it, add `.env` to your project's `.gitignore` file.