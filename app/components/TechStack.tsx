import {
  Cloud,
  Database,
  Leaf,
  Package,
  ServerCog,
  Workflow,
} from "lucide-react";

export default function TechStack() {
  const stack = [
    {
      icon: ServerCog,
      name: 'Java',
      description: 'Java is the foundation of my backend work—clean, stable, and performant services.',
    },
    {
      icon: Leaf,
      name: 'Spring Boot',
      description: 'Modular, testable Spring Boot applications with security and metrics.',
    },
    {
      icon: Package,
      name: 'Microservices',
      description: 'Resilient, decoupled services designed for evolution at scale.',
    },
    {
      icon: Database,
      name: 'Redis',
      description: 'Cache and distributed locking to reduce latency and improve throughput.',
    },
    {
      icon: Workflow,
      name: 'RabbitMQ',
      description: 'Event-driven systems and streaming pipelines for reliable async processing.',
    },
    {
      icon: Cloud,
      name: 'OCI',
      description: 'Infrastructure automation and resilient cloud deployments on OCI.',
    },
  ];

  return (
    <section id="tech" className="ds-section">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="reveal mx-auto max-w-2xl text-center">
          <h2 className="ds-section-title">Core technology stack</h2>
          <p className="ds-section-sub mt-4 text-base leading-7 sm:text-lg sm:leading-8">
            The tools and platforms I rely on to deliver proven backend systems and efficient developer workflows.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stack.map((item, index) => (
            <div
              key={item.name}
              className="reveal ds-card ds-card-hover p-6"
              style={{ "--reveal-delay": `${(index % 3) * 100}ms` } as React.CSSProperties}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--ds-radius-btn)] bg-[var(--ds-accent-soft)]">
                  <item.icon className="ds-accent-text h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="ds-display-font ds-text text-lg">{item.name}</h3>
              </div>
              <p className="ds-muted mt-3 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
