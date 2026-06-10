---
title: "Streaming Render Service Metrics"
site: "Render"
source: "https://render.com/docs/metrics-streams"
domain: "render.com"
language: "en"
description: "Render is a cloud application platform for deploying and scaling web applications, APIs, databases, AI workloads, workflows, and agent infrastructure."
word_count: 2460
---

Workspaces with a **Pro** plan or higher can push a variety of service metrics (memory usage, disk capacity, etc.) to an [OpenTelemetry](https://opentelemetry.io/) -compatible observability provider, such as New Relic, Honeycomb, or Grafana.

![Example OpenTelemetry metrics in Grafana](https://render.com/docs-assets/beda94f93d631e3689a6cd6dc053e282bb8349d6130f0b28c7bf3d5752397398/metrics-stream-grafana.webp)

**Render does not emit metrics for the following:**

- [Static sites](https://render.com/docs/static-sites)
- [Cron jobs](https://render.com/docs/cronjobs)
- [One-off jobs](https://render.com/docs/one-off-jobs)

## General setup

The following steps must be performed by a workspace [admin](https://render.com/docs/team-members#member-roles):

1. From your workspace's home in the [Render Dashboard](https://dashboard.render.com/), select **Integrations \> Observability** in the left sidebar:
	![Selecting Integrations in the Render Dashboard](https://render.com/docs-assets/8ccfa9505ff6b0aa6efb2253cd092c1ca10b3090283d9d0ac2054ee8f1b5e408/integrations-page.webp)
2. Under **Metrics Stream**, click **\+ Add destination**.
	The following dialog appears:
	![Setting a default metrics export in the Render Dashboard](https://render.com/docs-assets/3ba8ac76e606114220ade7a9e913ae4a7a6417c57aeb8a35c4385c1a317eb634/observability-provider.webp)
3. Select your observability provider from the dropdown. The dialog updates to display fields specific to your provider.
	If your provider isn't listed, select **Custom**. [Learn how to connect a custom provider](#other-providers-custom).
4. Fill in the provider-specific fields.
	- See instructions for your provider [below](#provider-specific-config).
5. Click **Add destination**.

You're all set! Your provider will start receiving [reported metrics](#reported-metrics) from Render shortly.

## Provider-specific config

When creating a metrics stream for your workspace, you provide different information depending on your observability provider:

![Provider-specific metrics config in the Render Dashboard](https://render.com/docs-assets/d99d6b8ca7750e41d55805e893b017e7adc4c3a1fff8dd45ef03ab29a748c16d/metrics-provider-config.webp)

See details for each supported provider below, along with instructions for [other providers](#other-providers-custom). Please also consult your provider's documentation for additional information.

If there’s a provider you’d like us to add to this list, please submit a [feature request](https://feedback.render.com/).

### New Relic

For **Region**, select **US** or **EU** according to where your New Relic data is hosted.

For **License key**, create a new key with the following steps:

1. From your New Relic [API keys page](https://one.newrelic.com/api-keys), click **Create a key**.
	The following dialog appears:
	![Creating a New Relic API key](https://render.com/docs-assets/f16dfa0996282d862627c5e92e426563d6492fcaa1497606fb29b96ed476297f/metrics-newrelic-config.webp)
2. For the **Key type**, select **Ingest - License**.
3. Add a descriptive **Name** (e.g., "Render Metrics Integration").
4. Click **Create Key**.

### Honeycomb

For **Region**, select **US** or **EU** according to where your Honeycomb data is hosted.

For **API key**, create a new key with the following steps:

1. In your Honeycomb dashboard, hover over **Manage Data** on the bottom left and click **Send Data**:
	![Clicking Send Data in Honeycomb](https://render.com/docs-assets/b6057372c52de268ecb11cd4006bf75dbc16d050eba4b99d7b47a9f2333ffdd1/metrics-honeycomb-senddata.webp)
2. Click **Manage API keys**.
3. Click **Create Ingest API Key**.
	The following dialog appears:
	![Creating a Honeycomb API key](https://render.com/docs-assets/7550e9430c4bc1db280a7ca93f866d8f31194a9dabc663ed9a13a186ed64cbd5/metrics-honeycomb-apikey.webp)
4. Add a descriptive **Name** (e.g., "Render Metrics Integration").
5. Make sure **Can create services/datasets** is enabled.
6. Click **Create**.

### Grafana

Obtain both your **Endpoint** and **API Token** with the following steps:

1. From your Grafana Cloud Portal (`grafana.com/orgs/[your-org-name]`), click **Details** for the Grafana stack you want to use:
	![Selecting a Grafana stack in the Grafana Cloud Portal](https://render.com/docs-assets/fc6f62ee69c672d791f1e018eb7651dc78fd973ae2c362d9e5ed81f5cfca83a9/metrics-grafana-details.webp)
2. Find the **OpenTelemetry** tile and click **Configure**.
3. Copy the value of **Endpoint for sending OTLP signals** (this is your **Endpoint**).
4. Under **Password / API Token**, click **Generate now**.
5. Add a token name (e.g., `render_metrics_integration`).
6. Click **Create Token**.
7. Copy the generated value starting with `glc_` (this is your **API Token**).

For more details, see the [Grafana documentation](https://grafana.com/docs/grafana-cloud/send-data/otlp/send-data-otlp/#manual-opentelemetry-setup-for-advanced-users).

### Datadog

To simplify metrics ingestion with Datadog, Render pushes metrics in Datadog's native format instead of using OpenTelemetry.

Specify your **Datadog site**, according to where your Datadog data is hosted.

For **API key**, generate a new organization-level API key from your [organization settings page](https://app.datadoghq.com/organization-settings/api-keys). You *cannot* use an application key or a user-scoped API key.

### Better Stack

Obtain both your **Ingesting host** and **Source token** with the following steps:

1. From your **Telemetry \> Sources** page in Better Stack, click **Connect source**.
	The following page appears:
	![Creating a Better Stack source](https://render.com/docs-assets/5966cf59bde3fc26fa419ebf6d4731917f43bd4f48d5118bed9e53c0dd357ce0/metrics-betterstack-connectsource.webp)
2. Add a descriptive **Name** (e.g., "Render Metrics Integration").
3. Select **OpenTelmetry** as the **Platform**.
4. Click **Connect source**.
	Better Stack creates the new source and redirects you to its details page.
5. Copy your source's **Ingesting host** URL and **Source token**.

### Signoz

Obtain both your Signoz **Endpoint** and **Ingestion key** with the following steps:

1. From your Signoz Cloud dashboard, select **Settings \> Workspace Settings** in the left sidebar.
2. Switch to the **Ingestion** tab:
	![Ingestion keys in the Signoz Cloud dashboard](https://render.com/docs-assets/f98eb379dcb707ff079a1432a1f5f7488c21e90b34915cc260f5deb97e0e3ff6/signoz-dashboard.webp)
3. Copy your **Ingestion URL** and provide it as your **Endpoint** in the Render Dashboard.
	Make sure to include `https://` at the beginning, for example:
	```
	https://ingest.us.signoz.cloud
	```
4. Create a **\+ New ingestion key** or copy an existing one. Provide this value as your **Ingestion key** in the Render Dashboard.

After you save your changes, Render metrics start to appear in the **Metrics** tab of your Signoz Cloud dashboard within a few minutes:

![Render metrics in the Signoz Cloud dashboard](https://render.com/docs-assets/64fbf4bfac7493ca21e63523f7d3ba1e27f522f7ca37c661151ffacffe1ab2a8/signoz-list-view.webp)

### Groundcover

Obtain both your Groundcover **Endpoint** and **API key** with the following steps:

1. From your Groundcover dashboard, select **Settings \> Access \> Ingestion Keys** in the sidebar.
2. Click **Create key**.
3. For **Key type**, select **Third Party**.
	Each ingestion key should be dedicated to a single data source for better security and manageability.
4. Add a descriptive name (e.g., "Render Metrics Integration").
5. Click **Create**.
6. Copy your **Ingestion key** and provide it as your **API key** in the Render Dashboard.
7. Copy your **Managed OpenTelemetry endpoint** URL and provide it as your **Endpoint** in the Render Dashboard.

For more details, see the [Groundcover documentation](https://docs.groundcover.com/use-groundcover/remote-access-and-apis/ingestion-keys#creating-an-ingestion-key).

### Other providers (custom)

Consult this section only if your observability provider isn't listed above.

Render can push service metrics to your OpenTelemetry-compatible endpoint, *if* that endpoint authenticates requests via an API key provided as a bearer token in an `Authorization` header.

**If your provider's endpoint supports authentication via bearer token:**

1. Consult your provider's documentation to obtain your OpenTelemetry endpoint and API key.
2. Specify **Custom** as your provider in the metrics stream creation dialog, then provide your endpoint and API key in the corresponding fields.

**If your provider's endpoint requires a different authentication method:**

1. Please [submit a feature request](https://feedback.render.com/) to let us know about your provider's requirements.
2. You can spin up your own OpenTelemetry collector (such as the official [vendor-agnostic implementation](https://github.com/open-telemetry/opentelemetry-collector)). Your collector's endpoint can receive metrics from Render, then transform and forward them to your provider using whatever authentication method it expects.

## Reported metrics

Render streams service metrics that pertain to the following categories:

- [CPU](#cpu)
- [Memory](#memory)
- [Network](#network)
- [HTTP requests](#http-requests)
- [Data storage](#data-storage)

All metrics use OpenTelemetry JSON format. The first component of each metric's name is `render` (e.g., `render.service.memory.usage`).

**Some observability providers transform metric names to match their conventions.**

For example, Grafana converts the metric `render.service.memory.usage` to `render_service_memory_usage_bytes`.

After you set up your metrics stream, inspect incoming data in your provider's dashboard to verify how it identifies Render metrics.

See names, descriptions, and included properties for each reported metric below.

### Universal properties

All reported metrics include the following properties:

| Property | Description |
| --- | --- |
| ###### service.name | The name of the service (e.g., `my-service`).  Grafana displays this property as `job`. |
| ###### service.id | The ID of the service (e.g., `srv-abc123`). |
| ###### service.instance.id | For *most* metrics, this is the ID of the metric's associated service instance (e.g., `srv-abc123-def456`). This is *not* the case for [HTTP request metrics](#http-requests).  Everything before the final hyphen is the service ID (`srv-abc123`), and the final component (`def456`) uniquely identifies the instance.  This value enables you to segment metrics by individual instances of a [scaled service](https://render.com/docs/scaling), and to identify when a service's instances are cycled as part of a redeploy. |

The following properties are also universal but optional:

| Property | Description |
| --- | --- |
| ###### service.project | The name of the service's associated [project](https://render.com/docs/projects), if it belongs to one (otherwise omitted). |
| ###### service.environment | The name of the service's associated [environment](https://render.com/docs/projects), if it belongs to one (otherwise omitted). |

### CPU

These metrics apply to all compute instances and datastores.

###### render.service.cpu.limit

The maximum amount of CPU available to a particular service instance (as determined by its instance type).

Includes [universal properties](#universal-properties) only.

###### render.service.cpu.time

The cumulative amount of CPU time used by a particular service instance, in seconds.

To visualize changes to CPU load over time, apply a `rate()` function or similar in your observability provider.

Includes [universal properties](#universal-properties) only.

### Memory

These metrics apply to all compute instances and datastores.

###### render.service.memory.limit

The maximum amount of memory available to a particular service instance (as determined by its instance type), in bytes.

Includes [universal properties](#universal-properties) only.

###### render.service.memory.usage

The amount of memory that a particular service instance is currently using, in bytes.

Includes [universal properties](#universal-properties) only.

###### render.service.memory.rss

The amount of anonymous and swap cache memory that a particular service instance is currently using, in bytes.

Includes [universal properties](#universal-properties) only.

###### render.service.memory.cache

The amount of page cache memory that a particular service instance is currently using, in bytes.

Includes [universal properties](#universal-properties) only.

### Network

These metrics apply to all compute instances and datastores.

###### render.service.network.transmit.bytes

The cumulative number of bytes transmitted by a particular service instance.

To visualize changes to network traffic over time, apply a `rate()` function or similar in your observability provider.

Includes [universal properties](#universal-properties) only.

###### render.service.network.receive.bytes

The cumulative number of bytes received by a particular service instance.

To visualize changes to network traffic over time, apply a `rate()` function or similar in your observability provider.

Includes [universal properties](#universal-properties) only.

### HTTP requests

These metrics apply only to [web services](https://render.com/docs/web-services).

**HTTP request metrics are not reported per instance.**

Render aggregates these metrics across all instances of a given web service. For these metrics, the value of [`service.instance.id`](#serviceinstanceid) matches that of [`service.id`](#serviceid).

###### render.service.http.requests.total

The cumulative number of HTTP requests that a given service has received *across all instances*, segmented by the properties below.

To visualize changes to request load over time, apply a `rate()` function or similar in your observability provider.

Includes [universal properties](#universal-properties), along with the following:

| Property | Description |
| --- | --- |
| ###### host | The destination domain for incoming requests. This can be your service's `onrender.com` domain or any [custom domain](https://render.com/docs/custom-domains) you've added. |
| ###### status\_code | The HTTP status code returned by the service (`200`, `404`, and so on). |

###### render.service.http.requests.latency

Provides a particular web service's p50, p95, or p99 response time, segmented by the properties below.

Includes [universal properties](#universal-properties), along with the following:

| Property | Description |
| --- | --- |
| ###### quantile | Indicates the percentile of the provided latency value. One of the following:  - `0.50` (p50) - `0.95` (p95) - `0.99` (p99) |
| ###### host | The destination domain for incoming requests. This can be your service's `onrender.com` domain or any [custom domain](https://render.com/docs/custom-domains) you've added. |
| ###### status\_code | The HTTP status code returned by the service instance (`200`, `404`, and so on). |

### Data storage

Each of these metrics applies to one or more of [Render Postgres](https://render.com/docs/postgresql), [Render Key Value](https://render.com/docs/key-value), and [persistent disks](https://render.com/docs/disks).

###### render.service.disk.capacity

The total capacity of a service's persistent storage, in bytes.

Applies to [Render Postgres](https://render.com/docs/postgresql) databases and [persistent disks](https://render.com/docs/disks).

Includes [universal properties](#universal-properties) only.

###### render.service.disk.usage

The amount of *occupied* persistent storage for a service, in bytes.

Applies to [Render Postgres](https://render.com/docs/postgresql) databases and [persistent disks](https://render.com/docs/disks).

Includes [universal properties](#universal-properties) only.

#### Disk I/O

The following metrics apply to [Render Postgres](https://render.com/docs/postgresql) and [Render Key Value](https://render.com/docs/key-value) instances.

###### render.service.disk.read.bytes

The cumulative number of bytes read from disk by a particular service instance.

To visualize changes to disk read activity over time, apply a `rate()` function or similar in your observability provider.

Includes [universal properties](#universal-properties) only.

###### render.service.disk.read.count

The cumulative number of read operations performed on disk by a particular service instance.

To visualize changes to disk read activity over time, apply a `rate()` function or similar in your observability provider.

Includes [universal properties](#universal-properties) only.

###### render.service.disk.write.bytes

The cumulative number of bytes written to disk by a particular service instance.

To visualize changes to disk write activity over time, apply a `rate()` function or similar in your observability provider.

Includes [universal properties](#universal-properties) only.

###### render.service.disk.write.count

The cumulative number of write operations performed on disk by a particular service instance.

To visualize changes to disk write activity over time, apply a `rate()` function or similar in your observability provider.

Includes [universal properties](#universal-properties) only.

#### Render Key Value

The following metrics apply to [Render Key Value](https://render.com/docs/key-value) instances.

###### render.keyvalue.connections

The number of active connections to a particular Render Key Value instance.

Includes [universal properties](#universal-properties) only.

###### render.keyvalue.connection.limit

The maximum number of concurrent connections supported for a particular Render Key Value instance (as determined by its instance type).

Includes [universal properties](#universal-properties) only.

#### Render Postgres

The following metrics apply to [Render Postgres](https://render.com/docs/postgresql) instances.

###### render.postgres.connections

The number of active connections to a particular Render Postgres instance.

Includes [universal properties](#universal-properties), along with the following:

| Property | Description |
| --- | --- |
| ###### database\_name | The name of the PostgreSQL database created in the instance (e.g., `my_db_abcd`). This value is helpful if your Render Postgres instance hosts [multiple databases](https://render.com/docs/postgresql-creating-connecting#adding-multiple-databases-to-a-single-instance).  This value usually does *not* match the value of `service.name`. |

###### render.postgres.connection.limit

The maximum number of concurrent connections supported by a particular Render Postgres instance (as determined by its instance type).

Includes [universal properties](#universal-properties) only.

###### render.postgres.database.size

The size of a particular PostgreSQL database, in bytes.

Includes [universal properties](#universal-properties), along with the following:

| Property | Description |
| --- | --- |
| ###### database\_name | The name of the PostgreSQL database created in the instance (e.g., `my_db_abcd`). |

###### render.postgres.indexes.size

The total size of all indexes in a particular PostgreSQL database, in bytes.

Includes [universal properties](#universal-properties), along with the following:

| Property | Description |
| --- | --- |
| ###### database\_name | The name of the PostgreSQL database created in the instance (e.g., `my_db_abcd`). |

###### render.postgres.replication.lag

The delay between when a change occurs on the primary Render Postgres instance and when its [read replica](https://render.com/docs/postgresql-read-replicas) (if it has any) *fully replicates* that change, in milliseconds.

Includes [universal properties](#universal-properties), along with the following:

| Property | Description |
| --- | --- |
| ###### replication\_host | The hostname or identifier of the read replica. |

###### render.postgres.replication.apply.lag

The delay between when a transaction commits on the primary Render Postgres instance and when its [read replica](https://render.com/docs/postgresql-read-replicas) (if it has any) *applies* those changes, in milliseconds.

Includes [universal properties](#universal-properties), along with the following:

| Property | Description |
| --- | --- |
| ###### replication\_host | The hostname or identifier of the read replica. |

###### render.postgres.slow.lock.count

The total number of slow locks on a particular Render Postgres instance. A slow lock occurs when a query waits an extended period to acquire a database lock.

Includes [universal properties](#universal-properties) only.

###### render.postgres.slow.lock.time

The cumulative wait time for slow locks on a particular Render Postgres instance, in seconds.

Includes [universal properties](#universal-properties) only.

###### render.postgres.table.scans

The total number of sequential table scans performed on a particular database within a Render Postgres instance.

Includes [universal properties](#universal-properties), along with the following:

| Property | Description |
| --- | --- |
| ###### database\_name | The name of the PostgreSQL database created in the instance (e.g., `my_db_abcd`). |

###### render.postgres.transaction.exhaustion

The percentage of available transaction IDs used by a particular PostgreSQL database. PostgreSQL databases have a maximum of approximately 2.1 billion transaction IDs before wraparound occurs.

Includes [universal properties](#universal-properties), along with the following:

| Property | Description |
| --- | --- |
| ###### database\_name | The name of the PostgreSQL database created in the instance (e.g., `my_db_abcd`). |

###### render.postgres.transaction.volume

The cumulative number of transactions (i.e., commits and rollbacks) on a particular Render Postgres instance.

To visualize changes to transaction activity over time, apply a `rate()` function or similar in your observability provider.

Includes [universal properties](#universal-properties) only.

### History of changes to reported metrics

| Date | Change |
| --- | --- |
| `2025-06-02` | Added the following Render Postgres transaction metrics:  - [`render.postgres.transaction.exhaustion`](#render-postgres-transaction-exhaustion) - [`render.postgres.transaction.volume`](#render-postgres-transaction-volume) |
| `2025-05-13` | Added the following Render Postgres metrics:  - [`render.postgres.table.scans`](#render-postgres-table-scans) - [`render.postgres.replication.apply.lag`](#render-postgres-replication-apply-lag) |
| `2025-04-30` | Added the following Render Postgres metrics:  - [`render.postgres.database.size`](#render-postgres-database-size) - [`render.postgres.indexes.size`](#render-postgres-indexes-size) - [`render.postgres.slow.lock.count`](#render-postgres-slow-lock-count) - [`render.postgres.slow.lock.time`](#render-postgres-slow-lock-time)  Added the following disk I/O metrics:  - [`render.service.disk.read.bytes`](#render-service-disk-read-bytes) - [`render.service.disk.read.count`](#render-service-disk-read-count) - [`render.service.disk.write.bytes`](#render-service-disk-write-bytes) - [`render.service.disk.write.count`](#render-service-disk-write-count) |
| `2025-04-17` | Added the following datastore connection metrics:  - [`render.postgres.connections`](#render-postgres-connections) - [`render.postgres.connection.limit`](#render-postgres-connection-limit) - [`render.keyvalue.connections`](#render-keyvalue-connections) - [`render.keyvalue.connection.limit`](#render-keyvalue-connection-limit)  Added the following memory metrics:  - [`render.service.memory.rss`](#render-service-memory-rss) - [`render.service.memory.cache`](#render-service-memory-cache)  Added the following networking metrics:  - [`render.service.network.transmit.bytes`](#render-service-network-transmit-bytes) - [`render.service.network.receive.bytes`](#render-service-network-receive-bytes) |
| `2025-03-11` | Added the following initial set of metrics:  - [`render.service.cpu.time`](#render-service-cpu-time) - [`render.service.cpu.limit`](#render-service-cpu-limit) - [`render.service.memory.usage`](#render-service-memory-usage) - [`render.service.memory.limit`](#render-service-memory-limit) - [`render.service.http.requests.latency`](#render-service-http-requests-latency) - [`render.service.http.requests.total`](#render-service-http-requests-total) - [`render.service.disk.capacity`](#render-service-disk-capacity) - [`render.service.disk.usage`](#render-service-disk-usage) - [`render.postgres.replication.lag`](#render-postgres-replication-lag) |