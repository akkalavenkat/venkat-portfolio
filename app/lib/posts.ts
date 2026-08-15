export type Post = {
  title: string;
  excerpt: string;
  date: string;
  href: string;
  slug: string;
};

export const posts: Post[] = [
  {
    title: "Designing resilient microservices for failure",
    excerpt:
      "Strategies for circuit breakers, retries, and fallback flows that keep services available under load.",
    date: "Mar 2026",
    slug: "designing-resilient-microservices",
    href: "/blog/designing-resilient-microservices",
  },
  {
    title: "Practical observability for Java services",
    excerpt:
      "How to get meaningful metrics and logs without overwhelming your team.",
    date: "Feb 2026",
    slug: "practical-observability",
    href: "/blog/practical-observability",
  },
  {
    title: "Scaling event-driven systems with RabbitMQ",
    excerpt:
      "Tips for designing durable event schemas and preventing topic bloat.",
    date: "Jan 2026",
    slug: "scaling-event-driven-systems",
    href: "/blog/scaling-event-driven-systems",
  },
];
