---
title: "How Render handles DDoS attacks | built-in edge protection"
site: "render.com"
source: "https://render.com/articles/how-render-handles-ddos-attacks"
domain: "render.com"
language: "en"
description: "Learn how Render handles DDoS attacks using built-in edge mitigation. Protect your apps with zero-configuration network defense against malicious traffic."
word_count: 830
---

DDoS attacks flood your application with traffic to make it unavailable. Render provides built-in [DDoS protection](https://render.com/docs/ddos-protection) that automatically blocks network-level attacks before they reach your app. No configuration, no add-ons, no extra cost.

That covers the attacks that would otherwise take your infrastructure down. But attacks that look like real user traffic (targeting your login page, API endpoints, or expensive database queries) can still reach your application. Defending against those is your responsibility, and that's true on every cloud platform. This article covers both sides: what Render handles for you and what you need to handle yourself.

All inbound traffic to Render web services passes through Cloudflare's global network before reaching your application. Malicious traffic gets filtered at the edge, far from your compute resources.

DDoS attacks target different layers of the network stack. Lower-layer attacks (Layer 3 and Layer 4) flood your connection with raw traffic to overwhelm it. Higher-layer attacks (Layer 7) send legitimate-looking HTTP requests designed to exhaust your application's resources.

Here's what each layer of protection looks like:

- **Layer 3/4 (network floods like SYN floods, UDP reflection):** Fully mitigated. Cloudflare drops malicious packets automatically. Your application never sees them.
- **Layer 7 (HTTP floods):** Cloudflare applies heuristic-based filtering that catches large-volume floods. Effective against obvious attack patterns.
- **Targeted Layer 7 (credential stuffing, API abuse, slow requests):** Not fully covered by edge protection. These requests look like legitimate traffic, so they pass through to your application. You need application-level defenses for these.

This is the same boundary you'll find on AWS, GCP, or any other platform. No edge network can distinguish a carefully crafted malicious request from a real one.

Protection is automatic for every public-facing web service on Render, regardless of plan. There's nothing to configure. Inbound traffic is completely free, so you're never charged for malicious incoming requests, and edge filtering prevents your services from generating unnecessary outbound responses to attack traffic.

Render's edge protection stops the attacks that would overwhelm your infrastructure. Everything that targets your application logic is on you. Common examples:

- Credential stuffing against login endpoints
- Brute-force attacks on authentication flows
- Expensive queries (deeply nested GraphQL, unprotected database pagination)
- Slow-read attacks that hold connections open

Because traffic passes through Cloudflare and Render's load balancers, your app sees the proxy's IP by default. To get the real client IP, read the `x-forwarded-for` header. Render also forwards the `CF-Ray` header on every request, which is useful for tracing and debugging.

Application-level rate limiting is the most important defense you can add. Here's a basic example with Express:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.headers['x-forwarded-for']?.split(',')[0] || req.ip
});

app.set('trust proxy', 1);
app.use('/api', limiter);
```

If you're running multiple instances, use a distributed store like [Render Key Value](https://render.com/docs/key-value) (Redis-compatible) instead of in-memory state, so rate limit counts are shared across instances.

For Python (Flask), the equivalent pattern uses `flask-limiter`. For Go, middleware like `tollbooth` serves the same purpose. The key in every framework is the same: read the client IP from `x-forwarded-for`, not from the socket connection.

If you suspect your application is under attack, work through these steps:

1. **Check your service metrics.** Open [service metrics](https://render.com/docs/service-metrics) in the Render Dashboard. Look at HTTP request rates alongside CPU and memory usage.
2. **Determine what's reaching your app.** If request rates are spiking but CPU and memory are flat, the edge is absorbing the attack and your app is fine. If CPU and memory are spiking too, attack traffic is reaching your application.
3. **Check your application logs.** Look for patterns: repeated requests to the same endpoint, a single IP generating hundreds of requests, or unusual user agents. Use the [Render CLI](https://render.com/docs/cli) (`render logs`) or the [MCP server](https://render.com/docs/mcp-server) to tail logs from your terminal or editor.
4. **Enable or tighten rate limiting.** If you don't have rate limiting in place, add it. If you do, lower the thresholds on the affected endpoints.
5. **Block specific IPs if needed.** Use your application's middleware to reject requests from identified attacker IPs based on the `x-forwarded-for` header.
6. **Contact support for sustained attacks.** If a sophisticated L7 attack persists after application-level defenses, contact Render support through the [Render Dashboard](https://dashboard.render.com/) for enterprise mitigation options.

The key diagnostic signal is the gap between edge traffic and application traffic. If your metrics show normal application load during a period when you know traffic is elevated, the edge protection is working.

- Add rate limiting to your authentication and API endpoints before you need it
- Make sure your app reads `x-forwarded-for` for client IPs and logs `CF-Ray` for tracing
- Set up [service metrics](https://render.com/docs/service-metrics) monitoring and [notifications](https://render.com/docs/notifications) so you know about anomalies early
- Review the [Render DDoS protection docs](https://render.com/docs/ddos-protection) and [uptime best practices](https://render.com/docs/uptime-best-practices) for additional hardening