---
title: "Practical observability for Java services"
date: "2026-02-01"
excerpt: "How to get meaningful metrics and logs without overwhelming your team."

tags: "observability,java,monitoring"
source: "original"
---

Most observability stacks fail for one reason: they optimize for data volume instead of decision quality. Good observability helps teams answer what changed, why it changed, and what to do next in minutes, not hours.

## Start with Service Objectives

Define SLOs before choosing charts or alerts. If your service objective is 99.9 percent success under 300 ms for key endpoints, telemetry should map directly to that contract.

Use this rule:

- Keep signals that drive an engineering or operational decision.
- Drop signals that are never used during incidents, reviews, or planning.

## Build a Reliable Metric Baseline

At minimum, every Java service should expose:

1. Request rate
2. Error rate
3. Latency percentiles (p50, p95, p99)
4. Saturation indicators (threads, pools, queue depth, CPU)

```yaml
alerts:
	- name: high_error_rate
		expr: sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))
			/ sum(rate(http_server_requests_seconds_count[5m])) > 0.02
	- name: p99_latency_regression
		expr: histogram_quantile(0.99, sum(rate(http_server_requests_seconds_bucket[5m])) by (le)) > 0.8
```

Percentiles matter because customer pain sits in the tail, not in averages.

## Log for Machines and Humans

Logs should be structured JSON with stable fields. Recommended baseline fields:

- timestamp
- level
- service
- env
- traceId
- spanId
- requestId
- errorCode
- message

```json
{
  "level": "ERROR",
  "service": "payments-api",
  "traceId": "9f92f2dc9a4b4ef0",
  "requestId": "req-7d2a2",
  "errorCode": "DOWNSTREAM_TIMEOUT",
  "message": "pricing service timeout after 120ms"
}
```

Structured logs make incident triage significantly faster.

## Trace the Critical Boundaries

Distributed tracing is most valuable on boundaries with latency or reliability risk:

- Ingress gateway
- Outbound HTTP clients
- Database operations
- RabbitMQ producers and consumers

Full sampling is rarely required. Adaptive sampling around errors and high-latency traces provides stronger signal per cost unit.

## Alert on User Impact and Burn Rate

Alert fatigue is usually caused by threshold-only alerts on noisy internals. Instead, alert on:

- SLO burn rate
- Sustained user-facing error increase
- Capacity signals that predict imminent degradation

A multi-window burn-rate strategy improves urgency quality and reduces flapping.

## Dashboard Design That Works Under Pressure

A useful dashboard answers three questions in under one minute:

1. Is the service healthy now?
2. What changed in the last 15 to 60 minutes?
3. Which dependency or resource is the bottleneck?

Connect dashboards to filtered logs and traces so responders can jump from symptom to root cause without context switching.

## Continuous Improvement Loop

After each incident, make three updates:

- Remove one noisy signal
- Add one missing signal
- Improve one runbook step

This small loop compounds quickly and builds a calm, trusted observability system.
