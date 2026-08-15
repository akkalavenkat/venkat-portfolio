---
title: "Designing event-driven systems with Kafka"
date: "2026-03-05"
excerpt: "From topic design to consumer coordination: how to build scalable, loosely-coupled event-driven architectures that don't collapse under change."
tags: "kafka,event-driven,architecture,distributed-systems"
source: "original"
---

Event-driven architectures promise loose coupling and independent scalability. They deliver on that promise — until they don't. What starts as a clean topic-based design can become a maze of hidden dependencies and schema drift.

This post covers the patterns that separate working event systems from ones that scale.

## Event Schema Design as a Contract

Events are your public API. Treat them with the same discipline as REST endpoints.

Every event should include:

- **eventType**: What happened (e.g., `PaymentAuthorized`, `UserCreated`)
- **version**: Schema version for compatibility tracking
- **aggregateId**: The root entity ID (payment ID, user ID)
- **aggregateVersion**: Optimistic locking or causality tracking
- **occurredAt**: When the event happened on the source system
- **payload**: Event-specific data

```json
{
  "eventType": "PaymentAuthorized",
  "version": 1,
  "paymentId": "pay_1029384",
  "paymentVersion": 3,
  "occurredAt": "2026-03-05T14:22:11Z",
  "authorizedAmount": {
    "currency": "USD",
    "amountMinor": 9999
  },
  "authorizationCode": "AUTH-567890",
  "metadata": {
    "userId": "user_456",
    "merchantId": "merchant_123"
  }
}
```

Version your schema. When you need to add fields:

```json
{
  "eventType": "PaymentAuthorized",
  "version": 2,
  "paymentId": "pay_1029384",
  "paymentVersion": 3,
  "occurredAt": "2026-03-05T14:22:11Z",
  "authorizedAmount": { ... },
  "authorizationCode": "AUTH-567890",
  "metadata": { ... },
  "riskScore": 0.15,           // New in v2
  "authenticationMethod": "3ds" // New in v2
}
```

Old consumers ignore unknown fields. New consumers handle both v1 and v2 by checking version. No breaking changes, no coordination.

## Topic Taxonomy and Ownership

Topic naming reveals intent and prevents sprawl:

```
{domain}.{entity}.{verb}.v{version}

payments.payment.authorized.v1
payments.payment.captured.v1
payments.payment.refunded.v1
users.user.created.v1
users.user.deleted.v1
notifications.email.sent.v1
```

Each domain owns its event stream. PaymentsService publishes `payments.*` events. No other service publishes to that namespace.

Attach metadata to each topic:

```yaml
name: payments.payment.authorized.v1
owner: payments-team
retention: 7 days
compacted: false
partitionKey: paymentId
schema:
  version: 1
  fields:
    - name: paymentId
      type: string
      required: true
    - name: authorizedAmount
      type: object
      required: true
```

This makes discoverability and governance possible at scale.

## Partition Strategy: Ordering vs. Parallelism

Partition by the entity that must maintain order:

```java
// Good: Same payment always goes to same partition
ProducerRecord<String, PaymentEvent> record = 
    new ProducerRecord<>("payments.payment.authorized.v1", 
        event.getPaymentId(),  // key = paymentId
        event);
```

Kafka guarantees ordering within a partition. If you partition by paymentId, all events for a payment maintain causality.

If you partition by timestamp or random key, events for the same entity scatter across partitions and ordering breaks:

```java
// Bad: Same payment can go to different partitions
new ProducerRecord<>("payments.payment.authorized.v1", 
    UUID.randomUUID().toString(),  // Random key
    event);
```

The tradeoff: more partitions = more parallelism but less ordering. For financial or stateful workflows, order matters. For notifications or analytics, parallelism wins.

## Consumer Coordination and State Management

Event consumers need to track which events they've processed. Kafka tracks this via consumer groups and offsets:

```java
@Configuration
public class KafkaConsumerConfig {
    
    @Bean
    public ConsumerFactory<String, PaymentEvent> consumerFactory() {
        Map<String, Object> props = new HashMap<>();
        props.put("bootstrap.servers", kafkaServers);
        props.put("group.id", "notification-service");
        props.put("key.deserializer", StringDeserializer.class);
        props.put("value.deserializer", EventDeserializer.class);
        props.put("enable.auto.commit", false);  // Commit after processing
        return new DefaultKafkaConsumerFactory<>(props);
    }
    
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, PaymentEvent> 
    kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, PaymentEvent> factory =
            new ConcurrentKafkaListenerContainerFactory<>();
        factory.setCommonErrorHandler(new DefaultErrorHandler());
        return factory;
    }
}
```

Disable auto-commit. Process events, persist state, then commit:

```java
@Service
public class NotificationEventListener {
    
    @KafkaListener(topics = "payments.payment.authorized.v1")
    public void onPaymentAuthorized(PaymentAuthorizedEvent event, 
                                     Acknowledgment ack) {
        try {
            // Send notification
            emailService.send(event.getUserId(), event.getPaymentId());
            
            // Persist confirmation
            notificationRepo.markSent(event.getPaymentId());
            
            // Only then commit offset
            ack.acknowledge();
        } catch (Exception e) {
            // Don't acknowledge; offset stays; message will be retried
            throw e;
        }
    }
}
```

If processing fails, the offset isn't committed. Kafka retries from the same position. This guarantees at-least-once delivery.

## Idempotency: Handling Duplicate Events

At-least-once delivery means duplicates happen. Idempotent consumers survive them:

```java
@Service
public class PaymentSettlementService {
    
    @KafkaListener(topics = "payments.payment.captured.v1")
    public void onPaymentCaptured(PaymentCapturedEvent event) {
        // Check if we've already settled this
        if (settlementRepo.exists(event.getPaymentId())) {
            logger.info("Settlement already processed for {}", event.getPaymentId());
            return;
        }
        
        // Process settlement
        Settlement settlement = new Settlement(event.getPaymentId(), event.getAmount());
        settlementRepo.save(settlement);
        
        // Publish settlement event
        kafkaTemplate.send("settlements.settlement.initiated.v1", 
            event.getPaymentId(), 
            settlement);
    }
}
```

The settlement record prevents duplicate processing. Even if Kafka delivers the event twice, only one settlement is created.

## Dead Letter Queues for Failures

Not every message can be processed. Networks fail, dependencies are unavailable, data is corrupt.

Send unprocessable events to a dead letter queue:

```java
@Bean
public DefaultErrorHandler errorHandler() {
    DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(
        kafkaTemplate,
        new TopicNameStrategy()  // Maps topic to {topic}.dlq
    );
    return new DefaultErrorHandler(recoverer, 
        new FixedBackOff(1000, 3));  // Retry 3 times, then DLQ
}
```

Messages in the DLQ can be replayed once the underlying issue is fixed:

```
payments.payment.authorized.v1 (main topic)
payments.payment.authorized.v1.dlq (dead letter)
```

Monitor the DLQ size. Growth indicates a systemic issue that needs investigation.

## Event Sourcing vs. Event Publishing

There's a spectrum:

**Event Sourcing**: All state changes are events. Events are the source of truth. Rebuild state by replaying events.

```java
@Service
public class PaymentService {
    private List<PaymentEvent> events = new ArrayList<>();
    
    public void capturePayment(String paymentId, BigDecimal amount) {
        PaymentCapturedEvent event = new PaymentCapturedEvent(paymentId, amount);
        eventStore.append(paymentId, event);  // Append to event log
        events.add(event);
        publishEvent(event);  // Publish to Kafka
    }
}
```

**Event Publishing**: Only publish events for things consumers care about. Internal state is separate.

```java
@Service
public class PaymentService {
    private final PaymentRepository repo;
    private final KafkaTemplate<String, PaymentEvent> kafka;
    
    public Payment capturePayment(String paymentId, BigDecimal amount) {
        Payment payment = repo.findById(paymentId);
        payment.capture(amount);
        repo.save(payment);  // Write to database
        
        // Publish only the captured event
        kafka.send("payments.payment.captured.v1", paymentId, 
            new PaymentCapturedEvent(paymentId, amount));
    }
}
```

Event sourcing is powerful but operational complexity is high. For most teams, event publishing (publish key domain events, store state separately) is the right trade-off.

## Monitoring Event Flow

Instrument consumers to catch failures early:

- **Consumer lag**: How many unprocessed events exist
- **Processing time**: p50, p95, p99 per event
- **Error rate**: Percentage of events failing
- **Rebalance frequency**: How often partitions reassign

```java
MeterRegistry registry = ...;

Gauge.builder("kafka.consumer.lag", consumer::lag)
    .description("Number of unprocessed messages")
    .register(registry);

Timer.builder("kafka.event.processing.duration")
    .description("Time to process one event")
    .publishPercentiles(0.5, 0.95, 0.99)
    .register(registry);
```

Lag growth signals a processing bottleneck. Processing time increases signal degraded dependencies.

## Final Takeaway

Event-driven systems scale beautifully when boundaries are explicit, schemas are versioned, and idempotency is built-in. The complexity lives in coordination and failure handling, not in the happy path. Design for it.
