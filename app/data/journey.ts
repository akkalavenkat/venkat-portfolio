export type TimelineEntry = {
  title: string;
  accent: "cyan" | "amber" | "rose";
  kind: "work" | "education";
  stage: string;
  location: string;
  period: string;
  role: string;
  narrative: string;
  tags: string[];
  highlights: string[];
};

export const timelineEntries: TimelineEntry[] = [
  {
    title: "Bachelor of Engineering in Computer Science",
    accent: "rose",
    kind: "education",
    stage: "Undergraduate Engineering",
    location: "Mumbai, India",
    period: "2004-2008",
    role: "Mumbai University",
    narrative:
      "Built rigorous foundation in computer science fundamentals including distributed systems, algorithms, and systems design — establishing core technical principles applied throughout 15+ year career in enterprise backend engineering.",
    tags: ["Computer Science", "Software Engineering", "Systems Design", "Algorithms"],
    highlights: [
      "Mastered core computer science disciplines: algorithms, data structures, operating systems, and distributed systems design.",
      "Developed systems thinking and architectural principles that shaped backend platform design in enterprise roles.",
      "Established programming fundamentals in multiple languages, providing foundation for Java backend specialization.",
    ],
  },
  {
    title: "Master's Degree in Mobile Computing",
    accent: "rose",
    kind: "education",
    stage: "Advanced Specialization",
    location: "Hagenberg, Austria",
    period: "2013-2015",
    role: "FH Upper Austria",
    narrative:
      "Pursued advanced specialization in distributed systems and mobile communication architectures, gaining international academic exposure and cross-cultural engineering perspective that informed later distributed systems work.",
    tags: ["Mobile Computing", "Distributed Systems", "Communication Protocols", "Advanced Architecture"],
    highlights: [
      "Graduated with distinction (1.29 grade on German scale — equivalent to top 5%).",
      "Completed thesis and coursework on advanced system architectures and communication protocols.",
      "Gained international perspective and cross-cultural collaboration skills through international graduate cohort.",
    ],
  },
  {
    title: "SysArc Infomatix Pvt. Ltd.",
    accent: "amber",
    kind: "work",
    stage: "Enterprise Software Engineering",
    location: "Pune, India",
    period: "2014-2017",
    role: "Software Engineer",
    narrative:
      "Architected and delivered J2EE enterprise applications supporting financial workflows at scale. Established core competencies in relational database optimization, enterprise integration patterns, and production reliability for mission-critical systems.",
    tags: ["Java", "J2EE", "JSP", "Servlets", "EJB", "Hibernate", "Oracle", "SQL", "PL/SQL", "Enterprise Integration"],
    highlights: [
      "Architected multi-tier J2EE applications (JSP, Servlets, EJB) supporting 500K+ daily transactions.",
      "Engineered Hibernate-based ORM layers for complex financial domain models with 200+ entity relationships.",
      "Optimized Oracle database performance through SQL/PL/SQL tuning, query optimization, and indexing strategy — reducing transaction latency by 40%.",
      "Designed and implemented enterprise integration patterns for legacy system connectivity using JMS messaging.",
      "Diagnosed and resolved production incidents in mission-critical applications, reducing MTTR by 50% through systematic monitoring.",
      "Established code review practices and engineering standards adopted team-wide.",
    ],
  },
  {
    title: "SANTROTECH Software Technologies",
    accent: "cyan",
    kind: "work",
    stage: "Enterprise Platform Modernization",
    location: "Pune, India",
    period: "2017-2021",
    role: "Senior Java Developer",
    narrative:
      "Led backend development for enterprise insurance and payment platforms, driving modernization from legacy Oracle to cloud-native PostgreSQL architectures with Spring Boot microservices.",
    tags: ["Java", "Spring Boot", "REST APIs", "Microservices", "Oracle", "PostgreSQL", "Hibernate", "JPA", "Redis", "Spring Batch", "AWS", "Docker"],
    highlights: [
      "Architected and implemented Spring Boot REST APIs for insurance and payment domain services.",
      "Led database modernization initiative: migrated monolithic Oracle applications to PostgreSQL with zero downtime.",
      "Designed and implemented distributed caching layer using Redis for high-frequency transaction lookups.",
      "Built Spring Batch jobs for batch processing, reconciliation, and nightly settlement workflows.",
      "Containerized applications using Docker and deployed on AWS infrastructure for scalable cloud operations.",
      "Established patterns for microservices development adopted across the engineering organization.",
      "Mentored junior developers in Spring Boot best practices, REST API design, and cloud-native architecture.",
    ],
  },
  {
    title: "Senior Full-Stack Java Developer / Backend Team Lead",
    accent: "cyan",
    kind: "work",
    stage: "Backend Leadership",
    location: "Toronto, Canada",
    period: "2021-Present",
    role: "Senior Full-Stack Java Developer / Backend Team Lead",
    narrative:
      "Direct backend architecture and platform development for enterprise banking and payment systems processing billions in transaction volume annually. Own system design decisions, technical mentorship, and production reliability for mission-critical infrastructure.",
    tags: ["Java", "Spring Boot", "Kafka", "Microservices", "Event-Driven Architecture", "PostgreSQL", "Redis", "Kubernetes", "AWS", "Leadership", "System Architecture"],
    highlights: [
      "Architect distributed backend systems for banking/payment platforms processing 500M+ daily transactions with 99.99% uptime SLA.",
      "Own system design decisions and trade-offs for event-driven microservices architecture — including Kafka topic strategy, consumer group scaling, and service decomposition.",
      "Establish backend engineering standards through code reviews and design reviews, raising team code quality metrics by 35%.",
      "Mentor 8+ backend engineers, providing technical guidance on distributed systems patterns, performance optimization, and production incident response.",
      "Design and implement Kafka-based event-driven services for real-time transaction processing, settlement workflows, and cross-service orchestration.",
      "Operate and optimize high-availability production systems — implementing comprehensive observability reducing mean-time-to-detect from 45 min to 8 min.",
      "Drive cloud cost optimization initiatives through reserved capacity planning and auto-scaling policies — reducing infrastructure costs by 30%.",
    ],
  },
];
