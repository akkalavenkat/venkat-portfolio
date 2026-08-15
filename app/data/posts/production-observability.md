---
title: "Production observability for Java microservices"
date: "2026-03-15"
excerpt: "How to instrument Java applications for production ownership: metrics, logs, traces, alerts, and dashboards that support incident response and continuous improvement."
tags: "observability,monitoring,splunk,java,microservices"
source: "original"
---

Production observability is the difference between responding to incidents in 5 minutes and spending 2 hours reading logs. It's the difference between shipping confident and shipping scared.

Most teams optimize for data volume instead of decision quality. They collect everything, visualize little, and end up with expensive observability systems that don't help when it matters.

This post covers the observability stack that works: structured logging, distributed tracing, metrics with business meaning, and alerts that tell you what to do.

## Observability Foundation: Four Signals

Good observability rests on four signals that reveal system behavior.

**1. Metrics**

Numeric measurements: latency, throughput, errors, resource utilization.

Prefer histograms over averages. Averages hide tail behavior where customers hurt:

```java
@Service
public class PaymentProcessor {
    private final MeterRegistry registry;
    
    public Payment process(PaymentRequest req) {
        Timer.Sample sample = Timer.start(registry);
        
        try {
            Payment payment = processor.execute(req);
            sample.stop(Timer.builder("payment.process.duration")
                .tag("status", "success")
                .publishPercentiles(0.5, 0.95, 0.99)  // P50, P95, P99
                .register(registry));
            return payment;
        } catch (Exception e) {
            sample.stop(Timer.builder("payment.process.duration")
                .tag("status", "error")
                .register(registry));
            throw e;
        }
    }
}
```

P99 latency matters more than average. If average is 50ms but P99 is 5 seconds, one in a hundred customer requests is terrible.

**2. Logs**

Structured records of events: requests, errors, state changes, decisions.

JSON logs are mandatory in production. They're machine-parseable and searchable:

```java
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    
    @PostMapping
    public ResponseEntity<PaymentResponse> createPayment(
        @RequestBody PaymentRequest req,
        HttpServletRequest httpReq
    ) {
        String traceId = MDC.get("traceId");  // From Spring Cloud Sleuth
        
        logger.info("Payment creation started",
            kv("traceId", traceId),
            kv("userId", req.getUserId()),
            kv("amount", req.getAmount()),
            kv("currency", req.getCurrency())
        );
        
        try {
            Payment payment = paymentService.create(req);
            
            logger.info("Payment created successfully",
                kv("traceId", traceId),
                kv("paymentId", payment.getId()),
                kv("status", "CREATED")
            );
            
            return ResponseEntity.ok(new PaymentResponse(payment));
        } catch (PaymentException e) {
            logger.error("Payment creation failed",
                kv("traceId", traceId),
                kv("errorCode", e.getErrorCode()),
                kv("errorMessage", e.getMessage()),
                exception(e)
            );
            throw e;
        }
    }
}
```

Use Splunk's structured log format:

```
{"timestamp": "2026-03-15T14:22:11Z", "level": "INFO", "traceId": "a1b2c3d4", "userId": "user_456", "paymentId": "pay_1029", "status": "CREATED"}
```

Structured logs are searchable: `traceId=a1b2c3d4` shows every event for a single request across all services.

**3. Traces**

Distributed request flow across services: which service called which, when, how long it took.

Spring Cloud Sleuth adds automatic trace ID injection:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-sleuth</artifactId>
</dependency>
```

Sleuth injects traceId into logs and passes it in HTTP headers:

```
Client Request
    ↓
PaymentService (traceId: a1b2c3d4)
    ├─→ UserService (traceId: a1b2c3d4)
    ├─→ PricingService (traceId: a1b2c3d4)
    └─→ SettlementService (traceId: a1b2c3d4)
```

Export traces to a distributed tracing system (Dynatrace, Jaeger, Datadog):

```yaml
spring:
  sleuth:
    otel:
      exporter:
        jaeger:
          endpoint: http://jaeger:14268/api/traces
```

A single trace shows the entire request journey, where time was spent, and which service failed.

**4. Profiling**

CPU and memory profiles reveal hot paths and memory leaks.

Use async profilers:

```bash
# Collect 30-second CPU profile
jcmd <pid> JFR.start name=profile duration=30s filename=/tmp/profile.jfr

# View results
jfr dump --output-directory /tmp filename=/tmp/profile.jfr
```

Profile before shipping critical code paths to production. Identify obvious inefficiencies before they become operational problems.

## Instrumentation Strategy: What to Measure

Not everything is worth measuring. Focus on signals that drive operational decisions:

**Service Health Metrics:**

```java
// Request rate and latency
Timer.builder("http.request.duration")
    .tags("method", request.getMethod(), "uri", request.getUri())
    .publishPercentiles(0.5, 0.95, 0.99)
    .register(registry);

// Error rate
Counter.builder("http.request.errors")
    .tags("method", request.getMethod(), "status", response.getStatus())
    .increment();

// Saturation: thread pool usage
AtomicInteger activeThreads = new AtomicInteger();
Gauge.builder("thread.pool.active", activeThreads::get)
    .register(registry);
```

**Business Metrics:**

```java
// Payments processed
Counter.builder("payments.processed")
    .tags("status", "success")
    .increment();

// Revenue (in cents to avoid decimals)
DistributionSummary.builder("revenue")
    .tags("currency", "USD")
    .publishPercentiles(0.5, 0.95)
    .record(paymentAmount);
```

**Dependency Metrics:**

```java
// Database connection pool
Gauge.builder("db.connection.pool.active", connectionPool::getActiveCount)
    .register(registry);

// External API latency
Timer.builder("external.api.call.duration")
    .tags("service", "pricing-api")
    .publishPercentiles(0.5, 0.95, 0.99)
    .register(registry);

// Message queue depth
Gauge.builder("kafka.consumer.lag", consumer::lag)
    .register(registry);
```

The pattern: measure what users care about (latency, errors, throughput) and what operations teams need (resource usage, queue depth, dependency health).

## Logging Best Practices

Structure and cardinality matter.

**Good logs:**

```json
{"timestamp": "2026-03-15T14:22:11Z", "level": "ERROR", "traceId": "a1b2c3d4", "service": "payments", "errorCode": "DOWNSTREAM_TIMEOUT", "downstreamService": "pricing-api", "downstreamLatency": 5000, "message": "Pricing service timeout after 5000ms"}
```

Cardinality is bounded (errorCode has finite values). Searchable by traceId. Actionable (says which service, how long it took).

**Bad logs:**

```
ERROR: Exception occurred: java.net.SocketTimeoutException: timeout at com.example.PaymentService.fetchPrice
```

Unstructured. High cardinality (exception message varies). Doesn't say which service or latency. No traceId for correlation.

**Logging strategy:**

- Log every request start with request ID and key parameters
- Log every external service call with name, latency, status
- Log errors with context (what was being processed, which dependency failed, why)
- Log state changes (payment transitioned from PENDING → CAPTURED)
- Never log passwords, keys, or sensitive data

```java
@Service
public class PaymentService {
    
    public Payment capture(String paymentId) {
        logger.info("Capture starting", 
            kv("paymentId", paymentId), 
            kv("traceId", MDC.get("traceId")));
        
        try {
            Payment payment = repo.findById(paymentId);
            
            // Call downstream service
            long start = System.nanoTime();
            AuthorizationResponse auth = authService.authorize(payment);
            long latency = (System.nanoTime() - start) / 1_000_000;
            
            logger.info("Authorization call completed",
                kv("paymentId", paymentId),
                kv("authService", "authorization-api"),
                kv("latency", latency),
                kv("status", auth.getStatus()));
            
            payment.capture(auth);
            repo.save(payment);
            
            logger.info("Payment captured",
                kv("paymentId", paymentId),
                kv("status", "CAPTURED"));
            
            return payment;
        } catch (Exception e) {
            logger.error("Capture failed",
                kv("paymentId", paymentId),
                kv("errorCode", getErrorCode(e)),
                exception(e));
            throw e;
        }
    }
}
```

## Alerting Strategy: Alert on Outcomes, Not Symptoms

Most teams alert on thresholds. They get paged when CPU hits 80%, memory hits 90%, error rate exceeds 1%. These are symptoms, not problems.

Alert on business impact:

```yaml
alerts:
  - name: payment_processing_delay
    description: "Payments taking >2 seconds (SLO violation)"
    query: |
      histogram_quantile(0.95, 
        rate(payment.process.duration_seconds_bucket[5m])
      ) > 2
    severity: critical
    
  - name: payment_failure_spike
    description: "Payment error rate >2% for 5 minutes"
    query: |
      sum(rate(payment.errors[5m])) / 
      sum(rate(payment.processed[5m])) > 0.02
    severity: critical
    
  - name: downstream_dependency_degraded
    description: "Pricing service >1sec latency for 10 minutes"
    query: |
      histogram_quantile(0.95,
        rate(external.api.call.duration_seconds_bucket{service="pricing-api"}[5m])
      ) > 1
    severity: warning  # Page if it lasts 30 minutes
```

These alerts map directly to customer impact. When triggered, the runbook is clear: check payment processing, check payment errors, check pricing service.

## Dashboard Design for Incident Response

A production dashboard should answer three questions in under one minute:

1. **Is the service healthy?**
   - Request rate, error rate, P99 latency
   - Green/yellow/red status

2. **What changed?**
   - Metrics over last 15-60 minutes
   - Compare to baseline

3. **Which dependency is the bottleneck?**
   - Downstream service latencies
   - Resource utilization (CPU, memory, connections)
   - Queue depths

```yaml
dashboard:
  name: "PaymentService - Production"
  sections:
    - title: "Service Health"
      panels:
        - metric: "http.request.rate"
          title: "Request Rate"
        - metric: "http.error.rate"
          title: "Error Rate"
        - metric: "http.request.duration (p99)"
          title: "P99 Latency"
    
    - title: "Downstream Dependencies"
      panels:
        - metric: "external.api.call.duration (p95)"
          filters: ["service=pricing-api"]
        - metric: "external.api.call.duration (p95)"
          filters: ["service=settlement-api"]
    
    - title: "Resources"
      panels:
        - metric: "thread.pool.active"
        - metric: "db.connection.pool.active"
        - metric: "kafka.consumer.lag"
```

Link dashboards to logs and traces so responders can jump from symptom to root cause without context switching.

## Continuous Improvement: Post-Incident Review

After each incident, make three updates:

1. **Remove one noisy alert** — if it fires frequently but doesn't represent real problems, delete it
2. **Add one missing metric** — if you couldn't diagnose the root cause quickly, add the metric that would have helped
3. **Improve one runbook** — capture the fix so the next person doesn't spin their wheels

```
Incident: Payment processing latency spike
  Diagnosis: Hard to tell which downstream service was slow
  Fix: Pinged all dependencies, found settlement service latency at 8s
  
Updates:
  - Add metric: settlement.service.latency (p95, p99)
  - Add alert: settlement latency >2s for 5 minutes
  - Update runbook: check settlement service first if payment latency spikes
```

This small loop compounds. After 20 incidents, your observability system precisely captures what matters for your service.

## The Full Stack: Splunk, Dynatrace, Prometheus

For Java services processing billions of events, a complete stack looks like:

```
Metrics:  Prometheus (collection) → Grafana (visualization)
Logs:     JSON output → Splunk (aggregation + search)
Traces:   Spring Cloud Sleuth → Dynatrace (distributed tracing)
Alerts:   Prometheus Alert Manager → PagerDuty (incident routing)
Profiles: JDK Mission Control + async-profiler (on-demand)
```

Alternatives exist (Datadog, New Relic, Elastic) but the pattern is the same: structured data in, queryable systems out, actionable alerts.

## Final Takeaway

Production observability is not about data volume. It's about decision quality. Measure what matters (customer-facing latency, error rate, business throughput), correlate across services (traceId), and alert on outcomes (SLO violations) not symptoms (CPU spikes).

Teams that invest in observability ship faster and sleep better.
