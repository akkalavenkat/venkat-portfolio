import { siteConfig } from "@/app/site.config";

export default function BrutalistHero() {
  const { hero } = siteConfig;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
      <p className="reveal ds-eyebrow">{hero.tagline}</p>
      <h1
        className="reveal ds-display-font mt-6 text-[2.6rem] leading-[0.98] sm:text-7xl lg:text-[5.2rem]"
        style={{ "--reveal-delay": "90ms" } as React.CSSProperties}
      >
        {hero.headline}
        <span className="ds-accent-text">.</span>
      </h1>
      <p
        className="reveal ds-muted mt-8 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8"
        style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
      >
        {hero.bio}
      </p>

      <div
        className="reveal mt-9 flex flex-wrap gap-4"
        style={{ "--reveal-delay": "260ms" } as React.CSSProperties}
      >
        <a href={hero.cta.primary.href} className="ds-btn-primary px-6 py-3 text-sm">
          {hero.cta.primary.label}
        </a>
        <a href={hero.cta.secondary.href} className="ds-btn-secondary px-6 py-3 text-sm">
          {hero.cta.secondary.label}
        </a>
      </div>

      <div
        className="reveal mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        style={{ "--reveal-delay": "340ms" } as React.CSSProperties}
      >
        {hero.stats.map((stat) => (
          <div key={stat.label} className="ds-border-box bg-[var(--ds-surface)] p-5">
            <p className="ds-display-font ds-text text-xl sm:text-2xl">{stat.value}</p>
            <p className="ds-muted mt-1 text-xs uppercase tracking-[0.14em]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="reveal mt-10" style={{ "--reveal-delay": "420ms" } as React.CSSProperties}>
        {hero.services.map((service, index) => (
          <div
            key={service.title}
            className="ds-border-t flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:gap-8"
          >
            <span className="ds-accent-text ds-display-font text-sm">0{index + 1}</span>
            <span className="ds-display-font ds-text text-lg sm:w-64">{service.title}</span>
            <span className="ds-muted text-sm">{service.description}</span>
          </div>
        ))}
        <div className="ds-border-t pt-4">
          <p className="ds-soft text-xs uppercase tracking-[0.14em]">{hero.credentials}</p>
        </div>
      </div>
    </div>
  );
}
