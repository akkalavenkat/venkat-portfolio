export type Project = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  role: string;
  context: string;
  architecture: string[];
  outcomes: string[];
  preface?: string;
  githubUrl?: string;
};

export const projects: Project[] = [
  {
    slug: "payment-transaction-processing-platform",
    title: "Enterprise Payment & Transaction Processing Platform",
    description:
      "High-throughput distributed platform supporting payment and transaction-processing workflows using Spring Boot microservices and Kafka-based event-driven architecture, delivering sub-100ms transaction latency at scale.",
    tags: ["Java 17", "Spring Boot 3", "Kafka", "Microservices", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "Splunk", "Dynatrace"],
    role: "Senior Backend Engineer, Distributed Systems",
    context:
      "Architected and implemented a mission-critical payment processing platform handling millions of transactions daily across multiple payment channels. The platform required fault-tolerant event-driven coordination, precisely sequenced transaction lifecycle management, and production-grade observability for compliance and incident response.",
    architecture: [
      "Event-driven microservices architecture orchestrated via Apache Kafka, decoupling payment intake, validation, processing, and settlement workflows across independent services.",
      "Kafka producer/consumer optimization for high-throughput scenarios, including partition strategy design, consumer group coordination, and exactly-once delivery semantics for financial transactions.",
      "Distributed transaction coordination with idempotency keys and compensation logic ensuring transaction ACID guarantees across service boundaries.",
      "Spring Boot services with circuit breakers (Resilience4j), retry policies, and bulkhead isolation to contain failures and prevent cascading outages.",
      "Redis for distributed caching and transactional state coordination, supporting high-frequency lookups and enabling sub-100ms transaction processing.",
      "PostgreSQL with optimized schema design for transactional consistency, supporting read replicas for reporting and analytics without impacting transaction latency.",
      "Kubernetes orchestration (auto-scaling based on transaction volume) with multi-region failover for high availability and disaster recovery.",
      "Observability stack: Splunk for log aggregation, Dynatrace for distributed tracing and performance monitoring, enabling root-cause analysis in multi-service contexts.",
      "OAuth2/JWT-based service-to-service authentication with mutual TLS enforcement across all service boundaries.",
    ],
    outcomes: [
      "Delivered sub-100ms P99 latency for transaction processing, exceeding business requirements by 4x.",
      "Achieved 99.99% uptime across production deployment with zero data loss.",
      "Processed 500M+ transactions annually with elastic scaling across peak and off-peak demand.",
      "Implemented exactly-once payment delivery semantics using Kafka idempotent producers and distributed transaction tracking.",
      "Established comprehensive observability enabling <5-minute mean-time-to-detection (MTTD) and <15-minute mean-time-to-resolution (MTTR).",
      "Reduced operational incident response time by 60% through improved distributed tracing and centralized logging.",
    ],
  },
  {
    slug: "event-driven-trade-processing-platform",
    title: "Event-Driven Trade Processing Platform",
    description:
      "Designed and implemented a resilient, event-driven trade processing platform coordinating the full transaction lifecycle from intake through settlement, supporting high-frequency trading workflows with guaranteed order preservation and at-least-once delivery semantics.",
    tags: ["Java 17", "Spring Boot", "Kafka", "Kafka Streams", "Microservices", "REST APIs", "PostgreSQL", "Redis", "Kubernetes"],
    role: "Senior Backend Engineer, Event-Driven Systems",
    context:
      "Built a sophisticated trade processing platform where precise event ordering, workflow state management, and reliable delivery were non-negotiable. The platform needed to coordinate complex multi-step workflows (intake → validation → business processing → persistence → downstream notifications) while maintaining consistency and visibility across distributed services.",
    architecture: [
      "End-to-end transaction lifecycle orchestrated via Kafka topics: order intake → order validation → business rule processing → database persistence → settlement events → notification/reporting.",
      "Kafka Streams for stateful stream processing: order aggregation, trade matching, and business rule validation with exactly-once processing guarantees.",
      "Spring Boot microservices with dedicated responsibilities: OrderIntake service, ValidationService, ProcessingEngine, SettlementService, and NotificationService — each independently deployable and scalable.",
      "Event sourcing for trade audit trail and temporal state reconstruction, enabling compliance requirements and post-trade analysis.",
      "Distributed tracing across Kafka events to track trade lifecycle end-to-end, providing operational visibility and debugging capabilities.",
      "PostgreSQL for canonical trade state with JSONB columns for flexible event payload storage alongside structured trade attributes.",
      "Redis for high-frequency lookups: order book state, recent trade history, and client account balances — enabling sub-millisecond validation checks.",
      "Kubernetes deployment with topic-aware consumer group scaling: partition count scaled with expected trade volume, consumer replicas scaled with throughput demands.",
      "Comprehensive error handling: dead-letter queues for failed trades, retry policies with exponential backoff, and circuit breaker patterns for downstream service failures.",
    ],
    outcomes: [
      "Processed 10M+ daily trades with guaranteed order preservation and at-least-once delivery.",
      "Achieved 99.95% uptime with zero trade data loss across all processing stages.",
      "Reduced trade settlement time from 4 hours to 15 minutes through optimized event flow.",
      "Implemented comprehensive trade audit trail supporting regulatory compliance and post-trade dispute resolution.",
      "Enabled real-time trade reporting and settlement monitoring via Kafka event streaming to analytics platform.",
      "Supported 100x traffic growth through stateless microservices and elastic Kubernetes scaling.",
    ],
  },
  {
    slug: "enterprise-cost-data-platform",
    title: "Enterprise Cost Data Platform",
    description:
      "Designed and implemented a centralized, governed data platform integrating cost data from four heterogeneous source systems into a unified Delta Lake architecture, enabling enterprise-wide cost analytics and optimization.",
    tags: ["Azure Databricks", "Apache Spark", "PySpark", "Delta Lake", "Unity Catalog", "Azure Data Factory", "Azure Blob Storage", "SQL", "Python", "Power BI"],
    role: "Senior Data Engineer, Platform Architecture",
    context:
      "Led design and implementation of a Cost Domain platform consolidating cost data from legacy systems, cloud-native services, and third-party providers. The platform needed to handle schema drift, reconcile conflicting definitions across source systems, and provide governed access to downstream analytics and optimization services.",
    architecture: [
      "Four-stage medallion architecture: Bronze (raw ingestion) → Silver (validated, standardized) → Gold (business-ready aggregates) → Enterprise APIs.",
      "Bronze layer: Raw data ingestion via Azure Data Factory from OLP (Operations Ledger Platform), RMS (Resource Management System), DSD (Data Storage Domain), and Magic (cost allocation service) using time-partitioned Delta tables.",
      "Silver layer: Data validation, schema harmonization, and business rule application — reconciling different cost definitions and chart-of-accounts across source systems into a unified cost model.",
      "Gold layer: Pre-aggregated cost facts and dimensions optimized for analytics queries — cost by department, service, time period, and cost-center, enabling fast BI queries.",
      "Unity Catalog for centralized governance: enforced row-level access control, data lineage tracking, and schema versioning across all platform layers.",
      "Azure Data Factory for orchestration: 20+ daily ingestion pipelines with data quality checks, schema evolution handling, and automatic retry/recovery.",
      "Delta Lake ACID guarantees ensuring data consistency during concurrent reads and writes — critical for high-volume intraday cost updates.",
      "Spark SQL performance optimization: partitioning strategy (by date/cost-center), file pruning, and caching of frequently-queried aggregates.",
      "PySpark for complex cost allocation algorithms: multi-step allocation of shared costs, handling allocation base changes, and generating audit trails.",
      "Power BI semantic layer for self-service analytics, connected to Gold tables via Databricks SQL endpoints for interactive cost exploration.",
      "REST APIs for downstream consumption: cost attribution services, optimization recommendations engine, and chargeback systems.",
    ],
    outcomes: [
      "Consolidated cost data from 4 heterogeneous sources into single source-of-truth platform.",
      "Reduced cost reporting latency from 5 days to 4 hours through automated daily ETL.",
      "Enabled cost allocation accuracy improvements through centralized rule engine — identifying $2M+ in allocation corrections annually.",
      "Achieved 99.9% data freshness SLA with automated reconciliation and quality checks.",
      "Supported 200+ concurrent BI users accessing cost analytics without performance degradation.",
      "Provided data lineage and auditability required for financial compliance and cost chargebacks.",
      "Enabled self-service analytics through Unity Catalog governance, reducing data request backlog by 70%.",
    ],
  },
  {
    slug: "enterprise-java-modernization-cloud-migration",
    title: "Enterprise Java Modernization & Cloud Migration",
    description:
      "Led multi-year transformation of a legacy J2EE monolith to Spring Boot microservices, modernizing technology stack and enabling cloud-native deployment on AWS, demonstrating 12-year career progression in enterprise Java.",
    tags: ["Java", "Spring Boot", "Hibernate/JPA", "Oracle", "PostgreSQL", "Redis", "AWS", "Docker", "Jenkins", "Microservices"],
    role: "Senior Engineer, Platform Modernization",
    context:
      "Architected and led the transformation of a 15-year-old J2EE enterprise application — built on JSP, Servlets, EJB, and Oracle — into a modern Spring Boot-based architecture. The program required careful sequencing to maintain business continuity, establish patterns for the broader enterprise, and demonstrate viability of migration approaches for 50+ legacy applications.",
    architecture: [
      "Legacy J2EE baseline: JSP presentation tier, Servlet/EJB business logic, Oracle backend with tight coupling and limited testability.",
      "Spring Boot target: REST APIs for clear service boundaries, Spring Data/Hibernate/JPA for data access, PostgreSQL replacing Oracle with improved scaling characteristics.",
      "Phased migration strategy: strangler pattern to incrementally replace J2EE endpoints with Spring Boot services, running both stacks in parallel during transition.",
      "REST API layer replacing Servlet/EJB interfaces, enabling external service consumption and supporting both web and mobile clients.",
      "Spring Data JPA and Hibernate for modern ORM replacing legacy EJB Entity Beans, enabling efficient querying and lazy-loading strategies.",
      "Database migration from Oracle to PostgreSQL: schema translation, performance optimization for new platform, connection pooling with HikariCP.",
      "Redis caching layer for session management and frequently-accessed data, reducing database load and improving response times.",
      "Docker containerization of Spring Boot services enabling consistent dev/staging/production environments.",
      "AWS cloud deployment: ECS for orchestration, RDS (PostgreSQL) for managed database, ElastiCache (Redis) for caching, ALB for load balancing.",
      "Jenkins CI/CD pipeline automation: automated testing, artifact versioning, blue-green deployments enabling zero-downtime releases.",
      "Comprehensive monitoring and logging: CloudWatch integration, application performance monitoring, enabling rapid troubleshooting in cloud environment.",
    ],
    outcomes: [
      "Successfully migrated 15-year-old monolith to modern Spring Boot architecture with zero business disruption.",
      "Reduced infrastructure costs by 40% through optimized cloud resource utilization vs. on-premise data center.",
      "Improved deployment frequency from quarterly to weekly through automated CI/CD pipeline.",
      "Reduced application response times by 35% through caching layer and query optimization.",
      "Enabled independent service scaling: front-end traffic spikes no longer required scaling entire application.",
      "Improved code quality and testability: unit test coverage increased from 8% to 72%, enabling safer refactoring.",
      "Established modernization playbook used as template for 15+ subsequent enterprise application migrations.",
      "Reduced operational overhead by 50% through managed services (RDS, ElastiCache, ECS) vs. custom infrastructure management.",
    ],
  },
  {
    slug: "portfolio-development",
    title: "Personal Portfolio Platform",
    preface: "Side project · Open Source",
    description:
      "Production-grade portfolio with CI/CD, static analysis, security hardening and automated deployment verification.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "GitHub Actions", "SonarCloud", "Vercel", "Claude Code"],
    githubUrl: "https://github.com/akkalavenkat/venkat-portfolio",
    role: "Designer and Engineer",
    context:
      "Personal project to build a consulting-focused portfolio applying the same production engineering standards used in enterprise backend systems.",
    architecture: [
      "GitHub Actions CI pipeline with commit validation, lint, typecheck and build gates",
      "SonarCloud static analysis with quality gates blocking poor code from merging",
      "CSP security headers, HSTS, Turnstile anti-spam on contact form",
      "Automated deployment health check via SMTP verification after each Vercel deploy",
      "AI-assisted development workflow using Claude Code with WebStorm JetBrains plugin",
    ],
    outcomes: [
      "Zero critical vulnerabilities via SonarCloud. Full engineering pipeline from day one.",
      "Automated post-deployment SMTP health check on every release",
      "Dependabot automated dependency vulnerability scanning",
    ],
  },
];

export function getProjectBySlug(slug: string): Project | null {
  return projects.find((project) => project.slug === slug) ?? null;
}
