---
title: "How Render handles logging and observability"
site: "render.com"
source: "https://render.com/articles/how-render-handles-logging-and-observability"
domain: "render.com"
language: "en"
description: "Learn how Render logging and observability work. Use built-in logs, the Log Explorer, service metrics, and log streams to diagnose production issues."
---

Render gives you built-in [logs](https://render.com/docs/logging) and [service metrics](https://render.com/docs/service-metrics) in the Render Dashboard, with no SDK or additional setup required. You can use these to verify runtime behavior immediately after deploying.

As your architecture grows, you can add [log streams](https://render.com/docs/log-streams) to forward logs to an external provider. This gives you a path from Render's built-in tooling to a centralized observability stack.

You can access logs directly from the Render Dashboard. Render retains logs based on your workspace plan, so older logs eventually expire unless you stream them to an external provider.

Render captures `stdout` and `stderr` from your web services, background workers, and cron jobs. Static sites do not emit logs.

You can view logs through two primary interfaces:

- **Live tail** provides a real-time stream in the Render Dashboard or via the CLI with `render logs`. Use it during deploys, restarts, and active incident response.
- **The log explorer** lets you search and filter retained logs over a selected time range. For Professional workspaces or higher, it also includes HTTP request logs for public traffic to web services.

To make logs easier to search, emit structured JSON and include stable fields such as `level`, `message`, `requestId`, and route metadata. The log explorer supports filters such as `level`, `instance`, and (for HTTP request logs) `method`, `status_code`, `host`, and `path`. Structured logs make search terms and correlated IDs more consistent.

This minimal example demonstrates how structured logging formats data for the log explorer:

```javascript
function logEvent(level, msg, meta = {}) {
  // Simplification: In practice, use a robust library like Pino or Winston
  const payload = {
    timestamp: new Date().toISOString(),
    level: level,
    message: msg,
    ...meta 
  };
  
  // Production: add error stack trace handling and request ID
  process.stdout.write(JSON.stringify(payload) + '\n');
}
```

For production workloads, add robust error serialization and adapt this pattern using a dedicated logging library for your specific framework.

Effective root-cause analysis requires correlating runtime symptoms with recent changes. In practice, that means comparing your logs, [service metrics](https://render.com/docs/service-metrics), and recent deploy activity.

Service metrics help you spot resource pressure and traffic changes. Depending on the service type and workspace plan, you can inspect signals such as CPU usage, memory usage, HTTP request volume, latency, and outbound bandwidth. During a memory leak, for example, the most useful clue is often a sustained upward memory trend in the metrics view, followed by restart or failure symptoms in logs.

When you suspect a deploy introduced a regression, use the service's Events page to locate the deploy, then open the logs for that individual deploy or job. For web services, health check failures during deploys can also help explain why a new instance never became healthy.

If your metrics reveal a sudden CPU spike or an influx of `500` responses, open the log explorer for the same time range and compare the behavior against your most recent deploys. For public web traffic on Professional workspaces or higher, HTTP request logs can help you narrow the issue to a method, path, or status code pattern.

Distributed architectures and compliance requirements often call for centralized log retention. You can add that with [log streams](https://render.com/docs/log-streams), which forward supported Render logs to a TLS-enabled syslog endpoint over TCP.

Set up log streams in the Render Dashboard for providers such as Datadog, Better Stack, Papertrail, or another syslog-compatible service. This is not zero-config: you need to provide an endpoint, and some providers also require a token.

You should also understand the feature boundaries. Log streams forward logs in RFC5424 syslog format, but they do not create full tracing or APM correlation on their own. If you want end-to-end correlation in an external platform, include request IDs or trace IDs in your application logs and configure that platform to parse them.

This simplified Express middleware pattern demonstrates how to attach metadata that external tools (like Datadog) can parse via log streams:

```javascript
import crypto from 'crypto';
import express from 'express';

// Concept: Generate a trace ID to track the request across services
const app = express();

app.use((req, res, next) => {
  const traceId = req.headers['x-request-id'] || crypto.randomUUID();
  const logEntry = {
    timestamp: new Date().toISOString(),
    traceId: traceId,
    // Production: sanitize headers to prevent logging sensitive tokens
    path: req.path,
    method: req.method
  };
  
  console.log(JSON.stringify({ type: 'request', ...logEntry }));
  next();
});
```

For production, add strict sanitization so you never write PII or authentication tokens to `stdout`. Adapt this baseline pattern for your specific application framework.

One common mistake is relying entirely on unstructured plain-text logs. Plain text is still searchable, but structured logs make repeated searches, correlation, and downstream parsing much easier.

Another common mistake is assuming logs alone are enough for memory and performance debugging. If your service exceeds its memory limits, you might see OOM-related failures in logs or events, but that usually tells you only where the problem surfaced. To identify the cause, compare those failures against memory trends in service metrics and the timing of recent deploys.

Render gives you a strong baseline for observability with built-in logs, log search, deploy-specific log views, and service metrics. Start there, then add structured logging, request correlation IDs, and log streams as your operational requirements grow.

To learn more, explore these resources:

- [Logs in the Render Dashboard](https://render.com/docs/logging): view, search, and filter your service's runtime logs, including HTTP request logs.
- [Service metrics](https://render.com/docs/service-metrics): visualize CPU, memory, HTTP requests, latency, and outbound bandwidth.
- [Streaming Render service logs](https://render.com/docs/log-streams): forward logs to a syslog-compatible provider for long-term retention and alerting.