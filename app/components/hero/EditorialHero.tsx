import { siteConfig } from "@/app/site.config";

export default function EditorialHero() {
  const { hero } = siteConfig;

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
      <p className="reveal ds-eyebrow">{hero.tagline}</p>
      <h1
        className="reveal ds-display-font mt-7 text-4xl leading-[1.08] sm:text-6xl lg:text-7xl"
        style={{ "--reveal-delay": "90ms" } as React.CSSProperties}
      >
        {hero.headline}
        <span className="ds-accent-text">.</span>
      </h1>
      <p
        className="reveal ds-muted mt-7 max-w-2xl text-lg leading-8 sm:text-xl sm:leading-9"
        style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
      >
        {hero.bio}
      </p>

      <div
        className="reveal mt-9 flex flex-wrap items-center gap-5"
        style={{ "--reveal-delay": "260ms" } as React.CSSProperties}
      >
        <a href={hero.cta.primary.href} className="ds-btn-primary px-6 py-3 text-sm">
          {hero.cta.primary.label}
        </a>
        <a href={hero.cta.secondary.href} className="ds-link-accent text-sm font-medium">
          {hero.cta.secondary.label} →
        </a>
      </div>
      <p
        className="reveal ds-soft mt-5 text-sm"
        style={{ "--reveal-delay": "320ms" } as React.CSSProperties}
      >
        {hero.credentials}
      </p>

      <div
        className="reveal mt-16 grid gap-x-8 gap-y-6 border-t pt-8 sm:grid-cols-3 ds-rule"
        style={{ "--reveal-delay": "380ms" } as React.CSSProperties}
      >
        {hero.services.map((service, index) => (
          <div key={service.title}>
            <p className="ds-soft text-xs tracking-[0.18em]">0{index + 1}</p>
            <p className="ds-display-font ds-text mt-2 text-lg">{service.title}</p>
            <p className="ds-muted mt-1.5 text-sm leading-6">{service.description}</p>
          </div>
        ))}
      </div>

      <div
        className="reveal mt-10 grid grid-cols-2 gap-x-8 gap-y-5 border-t pt-7 sm:grid-cols-4 ds-rule"
        style={{ "--reveal-delay": "440ms" } as React.CSSProperties}
      >
        {hero.stats.map((stat) => (
          <div key={stat.label}>
            <p className="ds-text text-base font-semibold">{stat.value}</p>
            <p className="ds-soft mt-0.5 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
