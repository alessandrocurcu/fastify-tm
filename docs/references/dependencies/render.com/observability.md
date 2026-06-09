## Health Checks
### Render makes sure your services are ready for incoming traffic.

Every few seconds, Render sends **health checks** to each running web service and private service instance to confirm it's healthy and able to receive traffic:

Health checks serve the following purposes:

-   To identify unresponsive instances and automatically restart them
-   To confirm when a newly deployed version of your service is ready to start receiving traffic

### Health checks only apply to web services and private services

These checks are specific to service types that receive incoming network traffic.

By default, health checks are TCP socket probes to one of your service's open ports. For web services, this is usually the port of your public-facing HTTP server (default `10000`).

Web services can enable [HTTP health checks](https://render.com/docs/health-checks#http-health-checks-web-services-only) to determine application-level readiness. Private services only support default TCP checks.

Web services can receive health checks as HTTP GET requests to a path you specify:

By defining a health check endpoint in your service, you can execute custom logic to verify instance health:

-   To indicate a healthy instance, your endpoint can respond with any `2xx` or `3xx` status code.
-   To indicate an unhealthy instance, your endpoint can respond with any `4xx` or `5xx` status code.

If your service has any verified [custom domains](https://render.com/docs/custom-domains), Render sets one of those domains as the value of the `Host` header for all HTTP health checks. Otherwise, Render uses the service's `onrender.com` subdomain.

**How should my endpoint verify instance health?**

This varies from service to service. We recommend performing operation-critical checks, such as executing a simple database query to confirm connectivity.

### [](https://render.com/docs/health-checks#setup)Setup

Enable HTTP health checks in any of the following ways:

1.  In the [Render Dashboard](https://dashboard.render.com/), scroll down to the **Health Checks** section of your web service's **Settings** page:
    
    ![Setting health check path in the Render Dashboard](https://render.com/docs-assets/5ec5959841012efeb5b15809c5957f8d94f6b6a6555ac617d4d4e2978327d12e/health-check-path.png)
    
2.  Click **Edit**.
    
3.  Specify a path starting with a `/` character.
    
4.  Click **Save Changes**.
    

In your Blueprint YAML file, add the [`healthCheckPath`](https://render.com/docs/blueprint-spec#healthcheckpath) field to your web service's definition:

render.yaml

yaml

```yaml
services:  - type: web    runtime: node    name: my-service    healthCheckPath: /health
```

### [](https://render.com/docs/health-checks#success-criteria)Success criteria

**For default TCP checks,** Render considers a check successful if the instance accepts the attempted TCP connection within five seconds.

**For [HTTP checks](https://render.com/docs/health-checks#http-health-checks-web-services-only),** Render considers a check successful if the instance responds with a `2xx` or `3xx` status code within five seconds.

In all other cases, Render considers the check failed.

### [](https://render.com/docs/health-checks#handling-failures)Handling failures

Render handles health check failures for new deploys and actively running services in different ways:

Whenever you deploy a new version of your service, Render does _not_ immediately start routing traffic to the new instances. Instead, Render starts sending them health checks

-   Whenever _all_ of the new instances are passing their health checks _at the same time_, Render considers the deploy successful and starts routing traffic to the new instances.
-   If this condition is not met within 15 minutes, Render cancels the deploy and continues routing traffic to your service's existing instances.
    -   In this case, Render [notifies you](https://render.com/docs/notifications) according to your settings.

Learn more about [zero-downtime deploys](https://render.com/docs/deploys#zero-downtime-deploys).

-   If a running service instance fails consecutive health checks for 15 seconds, Render temporarily stops routing traffic to it to give it an opportunity to recover.
    -   If your service has other instances that are healthy, Render continues routing traffic to them.
-   If an instance fails consecutive health checks for 60 seconds, Render automatically [restarts the instance](https://render.com/docs/deploys#restarting-a-service).
    -   In this case, Render [notifies you](https://render.com/docs/notifications) according to your settings.

---

## Service-Metrics
View any service's usage metrics from its **Metrics** page in the [Render Dashboard](https://dashboard.render.com/):

![CPU usage graph in the Render Dashboard](https://render.com/docs-assets/f9c26cef4a8f5f9da3182d6867858c0fdb588db056179690ba45af8c78b854e7/metrics-cpu.png)

Use these metrics in combination with your service's [logs](https://render.com/docs/logging) to help diagnose issues as they arise.

**Want to stream OpenTelemetry metrics to your observability provider?**

See [Streaming Render Service Metrics](https://render.com/docs/metrics-streams).

### [](https://render.com/docs/service-metrics#available-metrics)Available metrics

Depending on your service's type, the **Metrics** page shows graphs for one or more of the following:

|Metric(s)|Which services?|
|---|---|
|[**CPU and memory usage**](https://render.com/docs/service-metrics#cpu-and-memory-usage)|All services except [static sites](https://render.com/docs/static-sites)|
|[**Disk storage**](https://render.com/docs/service-metrics#disk-storage)|All services with persistent storage, including:
-   [Render Postgres](https://render.com/docs/postgresql) databases
-   [Render Key Value](https://render.com/docs/key-value) instances (only the **Disk Activity** graph)
-   Services with an attached [persistent disk](https://render.com/docs/disks)|
|[**HTTP requests**](https://render.com/docs/service-metrics#http-requests)|[Web services](https://render.com/docs/web-services) only
Some features of these graphs require a [**Pro** workspace](https://render.com/docs/platform-features-by-plan) or higher.|
|[**Outbound bandwidth**](https://render.com/docs/service-metrics#outbound-bandwidth)|All service types|
|[**Database activity**](https://render.com/docs/service-metrics#database-activity)|-   [Render Postgres](https://render.com/docs/postgresql) databases
-   [Render Key Value](https://render.com/docs/key-value) instances (only the **Active Connections** graph)|

### [](https://render.com/docs/service-metrics#cpu-and-memory-usage)CPU and memory usage

Your service's Metrics page displays CPU and memory usage in the **Application Metrics** section:

![RAM usage graph in the Render Dashboard](https://render.com/docs-assets/2222f46d92dd1763b7ac65f17efadeca6fae544e7269453b10755bbe5498e05c/metrics-ram.png)

Use the controls at the top of the section to customize these graphs:

-   If you've [scaled](https://render.com/docs/scaling) your service, you can view metrics for all its instances, or for any subset.
-   When viewing metric values for multiple instances, you can aggregate those values into a _single_ value.
    -   The aggregate value can use the minimum, maximum, or average value across your selected instances.
-   You can view each metric as its actual value (such as 500 MB of memory), or as a percentage of the maximum allowed value for your service's [instance type](https://render.com/pricing#services).

### [](https://render.com/docs/service-metrics#disk-storage)Disk storage

The Metrics page shows disk-related metrics for the following services:

-   [Render Postgres](https://render.com/docs/postgresql) databases
-   [Render Key Value](https://render.com/docs/key-value) instances
    -   Key Value instances only show the **Disk Activity** graph.
-   Services with an attached [persistent disk](https://render.com/docs/disks)
    -   Web services, private services, and background workers support attaching a persistent disk.

Disk-related metrics include:

|Metric|Description|
|---|---|
|**Disk Usage**|The amount of disk space used by your service.
This helps you identify when you're approaching your instance's current storage limit.|
|**Disk Activity**|The amount of data your service has read from and written to disk.
[Free Key Value](https://render.com/docs/free#free-key-value) instances _don't_ display this metric, because they don't persist data to disk.|
|**Disk Operations**|The number of read and write operations your service has performed on its disk.|

### [](https://render.com/docs/service-metrics#http-requests)HTTP requests

**Certain features of HTTP request metrics require a [Pro plan](https://render.com/docs/platform-features-by-plan) or higher.**

For details, see the [pricing page](https://render.com/pricing).

The Metrics page for a [web service](https://render.com/docs/web-services) shows graphs for HTTP request volume and response latency in the **Network Metrics** section.

Note that these graphs show metrics only for requests from the public internet—they _don't_ include requests over your [private network](https://render.com/docs/private-network).

#### [](https://render.com/docs/service-metrics#request-volume)Request volume

The **Total Requests** graph shows your web service's HTTP request volume over your selected time range:

![Total network requests graph in the Render Dashboard](https://render.com/docs-assets/8d5d3e6e0809ae1ae4ab9050ad9d7177e816939b936bed83b0460bbc597fa702/metrics-total-requests.png)

Use the controls at the top of the section to customize this graph:

-   You can filter the graph to include only requests that returned a particular HTTP status code.
-   You can group each bar in the graph by the HTTP status code returned for those requests.
    -   Both of these controls can help you identify time periods that had a high error rate.

Teams can perform additional customizations:

-   Teams can filter the graph to include only requests that were sent to a particular host (i.e., domain) or path.
-   Teams can group each bar in the graph by which host each request was sent to.

#### [](https://render.com/docs/service-metrics#response-latency)Response latency

**Response latency metrics require a [Pro plan](https://render.com/docs/platform-features-by-plan) or higher.**

For details, see the [pricing page](https://render.com/pricing).

The **Response Times** graph shows your web service's response latency for common helpful percentiles (p50, p75, p90, and p99):

![Graph of response times by percentile in the Render Dashboard](https://render.com/docs-assets/8bfe32c593507852c54898be7b77ae59e9afe750862f36a87d2147f8ebdfe49b/metrics-response-times.png)

Click the **Percentile** dropdown to display only a specific percentile.

### [](https://render.com/docs/service-metrics#outbound-bandwidth)Outbound bandwidth

The Metrics page shows your service's recent [outbound bandwidth](https://render.com/docs/outbound-bandwidth) usage under the **Network Metrics** section:

![Outbound bandwidth graph in the Render Dashboard](https://render.com/docs-assets/d3f9ed51fc08748ea558ca24e3b96c9c256f5cda10d1be65dff18eec93179c95/metrics-outbound-bandwidth.png)

This graph displays up to four categories of outbound bandwidth, depending on your service's type and its recent network activity:

|Category|Description|
|---|---|
|**HTTP Responses**|[Web services](https://render.com/docs/web-services) and [static sites](https://render.com/docs/static-sites) only (other service types can't receive HTTP requests over the public internet)
Your service's responses to HTTP requests initiated by browsers and other clients over the public internet.|
|**WebSocket Responses**|[Web services](https://render.com/docs/web-services) only (other service types can't receive WebSocket connections over the public internet)
Your service's responses to WebSocket connections initiated by browsers and other clients over the public internet.|
|**Service-Initiated**|All service types.
Traffic initiated by your service to any destination over the public internet (e.g., connecting to a third-party API). Includes all protocols (HTTP, WebSocket, etc.).|
|**Service-Initiated (Private Link)**|All service types.
Traffic initiated by your service to any destination over a [private link connection](https://render.com/docs/private-network#integrating-with-aws-privatelink). Includes all protocols (HTTP, WebSocket, etc.).|

Note the following:

-   This graph's resolution is fixed at one data point per hour. Each point represents the amount of outbound bandwidth used during the previous hour.
-   Each new data point becomes available approximately 60 minutes after its measurement window ends.
-   This graph might display very small data point values (less than 1 MB) as 0.
-   You can customize this graph's time range, but it doesn't support any other filters.

### [](https://render.com/docs/service-metrics#database-activity)Database activity

The Metrics page for a [Render Postgres](https://render.com/docs/postgresql) database includes the following database-specific metrics:

|Metric|Description|
|---|---|
|**Active Connections**|The number of open connections to your database from all connecting clients.
This graph is also available for [Render Key Value](https://render.com/docs/key-value) instances.|
|**Network Activity**|The amount of data your database has read from and written to the network.|
|**Transaction Volume**|The number of transactions executed by your database.|
|**Replication Lag**|The amount of time your primary database takes to sync changes to any [read replicas](https://render.com/docs/postgresql-read-replicas).
This graph appears only if your database has at least one read replica.|
|**Lock-Delayed Queries**|The number of recently completed database queries that were delayed by another operation holding a lock for one second or longer.
Queries appear on this graph _after_ they've completed. They do not appear while they're still waiting on a lock.|
|**Running Processes**|Click the **Queries** tab at the top of your database's Metrics page to view a table of processes that are currently running on your database. Most of these processes correspond to a client connection.
Processes with the status `idle` are not actively executing a query. In this case, the table's **Duration** column shows the execution time of the process's most recently completed query.|
|**Top Queries**|Click the **Queries** tab at the top of your database's Metrics page to view a table of the queries that have been executed most frequently on your database.|

### [](https://render.com/docs/service-metrics#metrics-retention-period)Metrics retention period

Your metrics retention period depends on your workspace's [plan](https://render.com/pricing):

|Plan|Retention period|
|---|---|
|**Hobby**|7 days|
|**Pro**|14 days|
|**Scale** / **Enterprise**|30 days|

---