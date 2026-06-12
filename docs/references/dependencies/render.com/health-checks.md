---
title: "Health Checks"
site: "Render"
source: "https://render.com/docs/health-checks"
domain: "render.com"
language: "en"
description: "Render is a cloud application platform for deploying and scaling web applications, APIs, databases, AI workloads, workflows, and agent infrastructure."
word_count: 599
---

Every few seconds, Render sends **health checks** to each running web service and private service instance to confirm it's healthy and able to receive traffic:

Health checks serve the following purposes:

- To identify unresponsive instances and automatically restart them
- To confirm when a newly deployed version of your service is ready to start receiving traffic

**Health checks only apply to web services and private services.**

These checks are specific to service types that receive incoming network traffic.

By default, health checks are TCP socket probes to one of your service's open ports. For web services, this is usually the port of your public-facing HTTP server (default `10000`).

Web services can enable [HTTP health checks](#http-health-checks-web-services-only) to determine application-level readiness. Private services only support default TCP checks.

## HTTP health checks (web services only)

Web services can receive health checks as HTTP GET requests to a path you specify

By defining a health check endpoint in your service, you can execute custom logic to verify instance health:

- To indicate a healthy instance, your endpoint can respond with any `2xx` or `3xx` status code.
- To indicate an unhealthy instance, your endpoint can respond with any `4xx` or `5xx` status code.

If your service has any verified [custom domains](https://render.com/docs/custom-domains), Render sets one of those domains as the value of the `Host` header for all HTTP health checks. Otherwise, Render uses the service's `onrender.com` subdomain.

**How should my endpoint verify instance health?**

This varies from service to service. We recommend performing operation-critical checks, such as executing a simple database query to confirm connectivity.

### Setup

Enable HTTP health checks in any of the following ways:

1. In the [Render Dashboard](https://dashboard.render.com/), scroll down to the **Health Checks** section of your web service's **Settings** page:
	![Setting health check path in the Render Dashboard](https://render.com/docs-assets/5ec5959841012efeb5b15809c5957f8d94f6b6a6555ac617d4d4e2978327d12e/health-check-path.webp)
2. Click **Edit**.
3. Specify a path starting with a `/` character.
4. Click **Save Changes**.

In your Blueprint YAML file, add the [`healthCheckPath`](https://render.com/docs/blueprint-spec#healthcheckpath) field to your web service's definition:

```yaml
services:
  - type: web
    runtime: node
    name: my-service
    healthCheckPath: /health
    # …
```

## Success criteria

**For default TCP checks,** Render considers a check successful if the instance accepts the attempted TCP connection within five seconds.

**For [HTTP checks](#http-health-checks-web-services-only),** Render considers a check successful if the instance responds with a `2xx` or `3xx` status code within five seconds.

In all other cases, Render considers the check failed.

## Handling failures

Render handles health check failures for new deploys and actively running services in different ways:

Whenever you deploy a new version of your service, Render does *not* immediately start routing traffic to the new instances. Instead, Render starts sending them health checks:

- Whenever *all* of the new instances are passing their health checks *at the same time*, Render considers the deploy successful and starts routing traffic to the new instances.
- If this condition is not met within 15 minutes, Render cancels the deploy and continues routing traffic to your service's existing instances.
	- In this case, Render [notifies you](https://render.com/docs/notifications) according to your settings.

Learn more about [zero-downtime deploys](https://render.com/docs/deploys#zero-downtime-deploys).

- If a running service instance fails consecutive health checks for 15 seconds, Render temporarily stops routing traffic to it to give it an opportunity to recover.
	- If your service has other instances that are healthy, Render continues routing traffic to them.
- If an instance fails consecutive health checks for 60 seconds, Render automatically [restarts the instance](https://render.com/docs/deploys#restarting-a-service).
	- In this case, Render [notifies you](https://render.com/docs/notifications) according to your settings.