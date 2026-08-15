---
title: "Designing production-grade Spring Boot microservices"
date: "2026-02-20"
excerpt: "How to structure Spring Boot services for scale, resilience, and operational simplicity: service boundaries, REST contracts, security, observability, and deployment patterns."
tags: "spring-boot,microservices,java,architecture"
source: "original"
---

Spring Boot makes building a microservice feel easy — add annotations, define a controller, deploy. The difficulty emerges when you're running 50 services in production and one team's change breaks another team's contract. When resilience patterns fail silently. When security becomes an afterthought.

This post covers the design decisions that separate proof-of-concept Spring services from production platforms.

## Service Boundaries: Domain-First

The first mistake is drawing boundaries by technical layer (DataService, AuthService, UtilService). The right boundary is around a cohesive business domain.

Good boundaries:

```
PaymentsService — owns payment capture, refunds, settlement workflows
UsersService — owns user identity, profiles, authentication
NotificationsService — owns email, SMS, push notification delivery
```

Each service owns its domain data. No cross-service direct database access. No entity sharing. Period.

```java
// PaymentsService
@Service
public class PaymentService {
    private final PaymentRepository repo;
    
    public Payment capturePayment(String paymentId, BigDecimal amount) {
        // Service boundary: other services call this, don't read repo directly
        Payment payment = repo.findById(paymentId);
        payment.capture(amount);
        return repo.save(payment);
    }
}
```

A useful exercise: write down which data only this service modifies. If the list is fuzzy, the boundary is wrong.

## REST API Contracts as Borders

Every service exposes a REST API. That API is your contract with the outside world.

Version explicitly:

```java
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {
    
    @PostMapping("/{paymentId}/capture")
    public PaymentResponse capturePayment(
        @PathVariable String paymentId,
        @RequestBody CaptureRequest req
    ) {
        // Implementation
    }
}
```

When you need to evolve the schema, create v2. Support both versions for a deprecation window. This sounds tedious but it's the difference between coordinated deploys (brittle) and independent deploys (scalable).

Define request/response contracts as DTOs, not domain entities:

```java
public class CaptureRequest {
    private String paymentId;
    private BigDecimal amount;
    private String idempotencyKey;  // Required for retries
}

public class PaymentResponse {
    private String id;
    private String status;           // CAPTURED, FAILED, PENDING
    private BigDecimal amount;
    private Instant createdAt;
    private Instant capturedAt;
}
```

Include timestamps and status enums in responses. Consumers need to know when something happened and what state it's in. Vague responses create debugging nightmares.

## Security: Principle of Least Privilege

API security has three layers in a microservice environment.

**1. Service-to-service authentication**

Use mutual TLS or signed JWTs:

```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
            .antMatchers("/internal/**").requireMutualTls()
            .antMatchers("/api/**").requireValidJwt()
            .and()
            .oauth2ResourceServer().jwt();
        return http.build();
    }
}
```

Public APIs use OAuth2 with signed tokens. Internal service-to-service calls use mutual TLS. The boundary between them should be explicitly coded.

**2. Rate limiting**

Protect against resource exhaustion:

```java
@Configuration
public class RateLimitConfig {
    @Bean
    public RateLimiter rateLimiter() {
        return new KeyValueRateLimiter(
            redis,
            "5/minute",    // 5 requests per minute
            "100/hour"     // 100 per hour
        );
    }
}
```

Use Redis for distributed rate limiting across service instances.

**3. Input validation**

Never trust client input:

```java
@PostMapping("/payments")
public PaymentResponse createPayment(@Valid @RequestBody PaymentRequest req) {
    // @Valid triggers bean validation
    // PaymentRequest has @NotBlank, @Positive, etc.
}

public class PaymentRequest {
    @NotBlank(message = "Payment ID required")
    private String paymentId;
    
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
}
```

Validation constraints are self-documenting. They also prevent invalid data from reaching business logic.

## Resilience: Timeouts, Retries, Circuit Breakers

Distributed systems are held together by timeouts and fallbacks.

Use Resilience4j for production-grade controls:

```java
@Service
public class PricingServiceClient {
    
    private final RestTemplate restTemplate;
    private final CircuitBreaker circuitBreaker;
    private final Retry retry;
    
    @PostConstruct
    void setup() {
        circuitBreaker = CircuitBreaker.ofDefaults("pricing");
        retry = Retry.ofDefaults("pricing");
    }
    
    public Price getPrice(String productId) {
        return circuitBreaker.executeCallable(() -> 
            retry.executeCallable(() -> 
                fetchPriceFromRemote(productId)
            )
        );
    }
    
    private Price fetchPriceFromRemote(String productId) {
        // Hard timeout: request must complete within 500ms
        restTemplate.getForObject(
            "http://pricing-service/api/v1/products/{id}/price",
            Price.class,
            productId
        );
    }
}
```

Configure timeouts at the HTTP client level, not just application level:

```java
@Configuration
public class HttpClientConfig {
    @Bean
    public RestTemplate restTemplate() {
        HttpClientHttpRequestFactory factory = new HttpClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofMillis(500));
        factory.setReadTimeout(Duration.ofMillis(2000));
        return new RestTemplate(factory);
    }
}
```

Explicit timeouts and circuit breakers prevent cascading failures where one slow service brings down the platform.

## Observability: Structured Logging and Tracing

Every request needs correlation and traceability.

Use Spring Cloud Sleuth for automatic trace ID propagation:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-sleuth</artifactId>
</dependency>
```

Sleuth automatically injects traceId and spanId into logs:

```java
@RestController
public class PaymentController {
    
    @PostMapping("/{id}/capture")
    public ResponseEntity<PaymentResponse> capture(@PathVariable String id) {
        logger.info("Capturing payment {}", id);  // traceId is automatic
        // ...
    }
}
```

The log output automatically includes traceId:

```
2026-02-20T14:32:01Z [payments-api,a1b2c3d4,e5f6g7h8] INFO Capturing payment pay_123
```

Send logs to a centralized system (Splunk, ELK) where you can query by traceId across all services.

## Configuration: Externalized and Immutable

Never hardcode credentials or environment-specific settings:

```java
@Configuration
@ConfigurationProperties(prefix = "app.payment")
public class PaymentConfig {
    private String apiKey;
    private int maxRetries;
    private Duration timeout;
    
    // getters, setters
}
```

Load from `application.yml`:

```yaml
app:
  payment:
    apiKey: ${PAYMENT_API_KEY}  # From environment
    maxRetries: 3
    timeout: 5s
```

For Kubernetes deployments, use ConfigMaps and Secrets:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: payment-service-config
data:
  application.yml: |
    app:
      payment:
        maxRetries: 3
---
apiVersion: v1
kind: Secret
metadata:
  name: payment-service-secrets
data:
  PAYMENT_API_KEY: base64-encoded-value
```

## Deployment: Stateless and Repeatable

Spring Boot services should be stateless. All state goes to external systems (Redis, database, message broker).

Build Docker images that run anywhere:

```dockerfile
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
```

Use health checks so orchestrators know when to restart:

```java
@Component
public class LivenessProbe {
    @GetMapping("/health/live")
    public ResponseEntity<String> live() {
        return ResponseEntity.ok("OK");
    }
    
    @GetMapping("/health/ready")
    public ResponseEntity<String> ready() {
        // Check database, cache, message broker connectivity
        return connectedToBroker() 
            ? ResponseEntity.ok("Ready") 
            : ResponseEntity.status(503).body("Not ready");
    }
}
```

Kubernetes uses these endpoints to determine if the pod is alive and ready for traffic.

## Database Per Service

Each service owns its data. Never share databases:

```
PaymentService → payment_db
UserService → user_db
NotificationService → notification_db
```

This prevents hidden coupling and allows independent scaling. The cost is eventual consistency — services communicate via APIs and events, not shared schema.

```java
@Service
public class UserEventPublisher {
    private final KafkaTemplate<String, UserEvent> kafka;
    
    public void onUserCreated(User user) {
        UserEvent event = UserEvent.created(user.getId(), user.getEmail());
        kafka.send("users.created.v1", user.getId(), event);
    }
}
```

When UserService creates a user, it publishes an event. NotificationService subscribes and sends a welcome email. Services stay loosely coupled.

## Final Takeaway

Production Spring Boot services are built on domain boundaries, explicit contracts, resilience patterns, and observable behavior. Get these right early, and scaling from 10 services to 100 feels natural instead of chaotic.
