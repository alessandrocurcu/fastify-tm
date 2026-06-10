---
title: "Streaming Render Service Logs"
site: "Render"
source: "https://render.com/docs/log-streams"
domain: "render.com"
language: "en"
description: "Render can stream logs from your web services, private services, background workers, cron jobs, and datastores to third-party logging providers via TLS-enabled syslog or HTTPS endpoints."
word_count: 1271
---

You can stream logs from your Render services and datastores to third-party logging providers via **syslog (TLS)** or **HTTPS**. The protocol you use depends on your [logging provider](#finding-your-endpoint).

After you set a default stream destination for your workspace, all of your supported services start streaming their logs to that destination. You can [override this](#overriding-defaults) for individual services.

Render does not emit logs for [static sites](https://render.com/docs/static-sites). Log stream support is not yet available for [workflows (beta)](https://render.com/docs/workflows).

## Setup

1. From your workspace home in the [Render Dashboard](https://dashboard.render.com/), click **Integrations \> Observability** in the left pane.
2. Scroll down to the **Log Streams** section:
	![Log stream settings in the Render Dashboard](https://render.com/docs-assets/d0dad47f10aa18dfd590e692081cb7f5d3b9937129d14f40125fed97f3a1b2c6/log-streams-section.webp)
3. Under **Default destination**, click **\+ Set default**.
	The following dialog appears:
	![Setting a default log stream in the Render Dashboard](https://render.com/docs-assets/7cb7eb37f41b15f45e2b5fc9f1cfb83ea57c25b35724f846dbf187e4d0923b72/log-stream-settings.webp)
4. Provide your logging provider's endpoint in the **Log Endpoint** field.
	The format depends on your provider's endpoint type:
	- **Syslog:** Use the format `HOST:PORT` (for example, `logs.papertrailapp.com:34302`)
		- **HTTPS:** Use the full URL (for example, `https://http-intake.logs.datadoghq.com/api/v2/logs`)
	For help finding the endpoint for common providers, [see below](#finding-your-endpoint).
5. If your provider requires an authentication token or API key, provide it in the **Token** field.
6. Click **Save Changes**.
7. Toggle **Include logs from preview instances** to configure whether your log stream includes logs from your [service previews](https://render.com/docs/service-previews) and [preview environments](https://render.com/docs/preview-environments).

You're all set! Logs from Render will start to appear in your provider's feed shortly.

## Overriding defaults

[**Pro** workspaces](https://render.com/docs/platform-features-by-plan) and higher can override log stream settings for individual services:

| Custom Setting | Hobby | Pro | Scale / Enterprise |
| --- | --- | --- | --- |
| Omit individual services from log stream | ❌ | 🟢 | 🟢 |
| Set a custom destination for individual services | ❌ | ❌ | 🟢 |

1. In the [Render Dashboard](https://dashboard.render.com/), open the Settings page for the service you want to override and scroll down to the **Log Stream** section:
	![Log stream settings for an individual service](https://render.com/docs-assets/f947486fb5dd95beb340dececb0cb80e40713142d562e26fe1ad4bcc9e539278/log-stream-single-service.webp)
2. Open the **•••** menu and click **Override**. The following dialog appears:
	![Overriding log stream settings for an individual service](https://render.com/docs-assets/ddc534fe435db1d6d9fa232e9191ab1775a0e3a39c55d19107369b2663c9d71d/log-stream-override.webp)
3. Select **Forward to a different destination** or **Don't forward this service's logs**.
	- Forwarding to a different destination requires a **Scale** workspace or higher.
4. Provide any necessary details for the selected option and click **Save override**.

You're all set! Your service now uses its own custom log stream settings:

![Overridden log stream settings](https://render.com/docs-assets/2ffd275f06125faea665c5d94b955a3c8c21cc2bb3e8a0f87d9c43494dfb2c95/log-stream-overridden.webp)

You can revert this custom configuration by clicking **Reset to default**.

## Reporting format

Render delivers logs in different formats depending on the endpoint type.

### Syslog endpoints

For syslog endpoints, Render streams logs over TLS-encrypted TCP. Log lines are formatted according to [RFC5424](https://tools.ietf.org/html/rfc5424), which is supported by most popular syslog providers.

If you encounter issues integrating with a syslog-compatible provider, please let us know at **[support@render.com](mailto:support@render.com)**.

A formatted log line looks like this:

```
<0>1 2021-03-31T16:00:00-08:00 test-service cron-12345 74440 cron-12345 - hello this is a test
```

Render annotates each log line with:

- The corresponding service's slug
- The type of service (`web`, `cron`, etc.)
- A unique identifier for the instance
	- Use this value to track your service between deploys, or to distinguish between multiple instances if you're running more than one.

If you're using a standard format like `logfmt` or `json`, Render maps the `level` field to an appropriate syslog priority. Otherwise, Render makes a best effort to parse log levels, defaulting to `INFO`.

### HTTPS endpoints

Render streams encrypted logs over HTTPS as JSON payloads. These JSON payloads have provider-specific schemas, including service metadata and log levels.

If an endpoint doesn't match a [supported HTTPS provider](#finding-your-endpoint), Render treats it as a syslog destination.

## Finding your endpoint

Render supports streaming logs to providers that have a TLS-enabled syslog endpoint. Consult your provider's documentation for your endpoint and token, or refer to the instructions for common providers below.

HTTPS streaming is only available for the specified providers in the table below:

| Provider | Endpoint Type |
| --- | --- |
| [Datadog](#datadog) | HTTPS |
| [Loggly](#loggly) | HTTPS |
| [Better Stack](#better-stack) | Syslog |
| [Coralogix](#coralogix) | Syslog |
| [LaunchDarkly](#launchdarkly-previously-highlightio) | Syslog |
| [Mezmo](#mezmo-previously-logdna) | Syslog |
| [New Relic](#new-relic) | Syslog |
| [Papertrail](#papertrail) | Syslog |
| [SolarWinds](#solarwinds) | Syslog |
| [Sumo Logic](#sumo-logic) | Syslog |

**Want support for another HTTPS logging provider?**

Please submit a [feature request](https://feedback.render.com/) with the provider you'd like to see supported.

### Better Stack

1. From the **Telemetry** section of your Better Stack dashboard, click **Sources** in the left sidebar.
2. Click **Connect source**. The following form appears:
	![Connecting a Better Stack source](https://render.com/docs-assets/cc96c5a16398193ac0281d4ab7acc19ab1fa929a2e88aef0b26391bb1e635444/betterstack-connect-source.webp)
3. Give your source a descriptive **Name** (e.g., "Render log stream").
4. Under **Platform**, switch to the **Logs** tab and select **Render**.
5. Click **Connect source**. Better Stack opens the details page for your new source:
	![Better Stack source details](https://render.com/docs-assets/568986e2ad51178384f707e86b5b96b92290fd22419efc9143b1aee4d876426f/betterstack-source-details.webp)
6. Copy your source's **Ingesting host** URL.
	Provide this value as your log stream's **Log Endpoint** in the Render Dashboard, and append the port `6514` to the end. For example:
	```
	s1636872.eu-nbg-2-vec.betterstackdata.com:6514
	```
7. Copy your source's **Source token**.
	Provide this value as your log stream's **Token** in the Render Dashboard.
8. In the Render Dashboard, click **Add Log Stream**.

After you save your changes, Render logs start to appear in the **Logs & traces** tab of your Better Stack dashboard within a few minutes:

![Render logs in Better Stack](https://render.com/docs-assets/941afda44d284cc6f0b7f4ae7040696a6ebb900eacec8ba01da2205006443b23/betterstack-live-logs.webp)

For more information, see the [Better Stack documentation](https://betterstack.com/docs/logs/render).

### Coralogix

To stream logs to Coralogix:

1. Provide the syslog endpoint for your Coralogix region as the **Log Endpoint**:
	```
	syslog.<REGION>.coralogix.com:6514
	```
	To determine your endpoint, see the [Coralogix documentation](https://coralogix.com/docs/integrations/coralogix-endpoints/#endpoints).
2. Provide your [Send-Your-Data API key](https://coralogix.com/docs/user-guides/account-management/api-keys/api-keys/#send-your-data-api-keys) as the **Token**.
	To create this key, navigate to **Settings \> Users and Teams \> API Keys** in the Coralogix dashboard and add a **Send Your Data** key with the `SendData` role.

For more information, see the [Coralogix syslog documentation](https://coralogix.com/docs/integrations/syslog/syslog/).

### Datadog

**Use HTTPS to stream logs to Datadog.**

Datadog has deprecated TCP log forwarding. If you previously configured a syslog endpoint (such as `intake.logs.datadoghq.com:10516`), replace it with the appropriate HTTPS endpoint for your [Datadog site](https://docs.datadoghq.com/getting_started/site/).

Follow the instructions to [stream logs to Datadog](https://render.com/docs/datadog#stream-logs).

### LaunchDarkly (previously highlight.io)

To stream logs to your existing LaunchDarkly project:

- Provide `syslog.observability.app.launchdarkly.com:34302` as the **Log Endpoint**.
- Provide your LaunchDarkly client-side ID as the **Token**.

For more information, including where to find your client-side ID, see the [LaunchDarkly documentation](https://launchdarkly.com/docs/home/observability/syslog-log-drain).

### Loggly

To stream logs to your Loggly account over HTTPS:

1. Log in to your [Loggly account](https://www.loggly.com/) and navigate to **Source Setup \> [Customer Tokens](https://documentation.solarwinds.com/en/success_center/loggly/content/admin/customer-token-authentication-token.htm)**.
2. Copy your existing token or create a new one.
3. In the Render Dashboard, provide the following:
	- **Log Endpoint:** `https://logs-01.loggly.com:443`
		- **Token:** Your Loggly customer token.

Render delivers each log line to Loggly as a JSON object. If your service has JSON logs, those fields are included directly, for example:

```json
{"render_service":"my-service","render_instance":"srv-abc123-1","level":"info","log":"hello world"}
{"render_service":"my-service","level":"error","request_id":"r1","message":"boom"}
```

For more information, see the [Loggly documentation](https://documentation.solarwinds.com/en/success_center/loggly/content/admin/http-bulk-endpoint.htm).

### Mezmo (previously LogDNA)

Log in to your Mezmo account and navigate to the [sources page](https://app.logdna.com/pages/add-source). Select **syslog** on the left sidebar to see your syslog endpoint.

![Mezmo Syslog Settings](https://render.com/docs-assets/e6639aa338a557d2b4b7c2a5dc65bd85cc80eea7f50af2d751fc8ef0d68f8d56/logdna-settings.webp)

### New Relic

To stream logs to your New Relic account:

- Provide the New Relic syslog endpoint for your account's region as the **Log Endpoint**:
	- US: `newrelic.syslog.nr-data.net:6514`
		- EU: `newrelic.syslog.eu.nr-data.net:6514`
- Provide your New Relic [license key](https://docs.newrelic.com/docs/apis/intro-apis/new-relic-api-keys/#license-key) as the **Token**.

For more information, see the [New Relic documentation](https://docs.newrelic.com/docs/logs/log-api/use-tcp-endpoint-forward-logs-new-relic/).

### Papertrail

Log in to your account and navigate to the [setup page](https://papertrailapp.com/systems/setup?type=system&platform=unix#unix-manual) to find your Syslog endpoint:

![Papertrail Syslog Settings](https://render.com/docs-assets/d87ac8c066a0e8e8bf3f02b1173eca74c53a1e89619156c086851d191cd3f6b7/papertrail-settings.webp)

If you use the same Papertrail account to collect logs from multiple providers, you can optionally [generate a unique endpoint for your Render services](https://papertrailapp.com/destinations/new).

### SolarWinds

Follow the instructions for [sending logs using syslog](https://documentation.solarwinds.com/en/success_center/observability/content/configure/configure-logs-syslog.htm).

- Set the **Log Endpoint** to your organization's syslog collector endpoint. This endpoint has the format `syslog.collector.xx-yy.cloud.solarwinds.com:6514`, where `xx-yy` represents the data center your organization uses. See [Data centers and endpoint URIs](https://documentation.solarwinds.com/en/success_center/observability/content/system_requirements/endpoints.htm) to find the exact URL.
- Provide your API ingestion token as the **Token**.
	- Your API ingestion token is found in the Token field.

### Sumo Logic

Follow the instructions for [configuring a cloud syslog source](https://help.sumologic.com/docs/send-data/hosted-collectors/cloud-syslog-source/#configure-a-cloudsyslogsource).

After you configure your source, Sumo Logic displays a modal with a **Token** and **Host**. Use these for your log stream's **Token** and **Log Endpoint**, respectively.