import { LayoutTemplate, Zap, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/app/site.config";

const iconMap = { LayoutTemplate, Zap, ShieldCheck };

export default function BentoHero() {
  const { hero } = siteConfig;
  const [statA, statB, ...restStats] = hero.stats;

  return (
    <div className="ds-glow mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <div className="grid gap-4 lg:grid-cols-3">
        <div
          className="reveal ds-card p-8 sm:p-10 lg:col-span-2 lg:row-span-2"
        >
          <p className="ds-eyebrow">{hero.tagline}</p>
          <h1 className="ds-section-title mt-4 text-4xl sm:text-6xl">{hero.headline}</h1>
          <p className="ds-muted mt-6 max-w-xl text-base leading-7 sm:text-lg sm:leading-8">
            {hero.bio}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={hero.cta.primary.href} className="ds-btn-primary px-6 py-3 text-sm">
              {hero.cta.primary.label}
            </a>
            <a href={hero.cta.secondary.href} className="ds-btn-secondary px-6 py-3 text-sm">
              {hero.cta.secondary.label}
            </a>
          </div>
          <p className="ds-soft mt-5 text-sm">{hero.credentials}</p>
        </div>

        <div
          className="reveal grid grid-cols-2 gap-4"
          style={{ "--reveal-delay": "140ms" } as React.CSSProperties}
        >
          {[statA, statB].map((stat) => (
            <div key={stat.label} className="ds-card ds-card-hover p-5">
              <p className="ds-display-font ds-accent-text text-lg leading-tight">{stat.value}</p>
              <p className="ds-soft mt-1.5 text-xs leading-4">{stat.label}</p>
            </div>
          ))}
        </div>

        <div
          className="reveal ds-card ds-card-hover ds-float p-6"
          style={{ "--reveal-delay": "220ms" } as React.CSSProperties}
        >
          {(() => {
            const service = hero.services[0];
            const Icon = iconMap[service.icon as keyof typeof iconMap];
            return (
              <>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--ds-radius-btn)] bg-[var(--ds-accent-soft)]">
                  <Icon className="h-5 w-5 ds-accent-text" aria-hidden="true" />
                </span>
                <p className="ds-text mt-4 text-sm font-semibold">{service.title}</p>
                <p className="ds-muted mt-1 text-sm leading-6">{service.description}</p>
              </>
            );
          })()}
        </div>

        {hero.services.slice(1).map((service, index) => {
          const Icon = iconMap[service.icon as keyof typeof iconMap];
          return (
            <div
              key={service.title}
              className="reveal ds-card ds-card-hover p-6"
              style={{ "--reveal-delay": `${300 + index * 80}ms` } as React.CSSProperties}
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--ds-radius-btn)] bg-[var(--ds-accent-soft)]">
                <Icon className="h-5 w-5 ds-accent-text" aria-hidden="true" />
              </span>
              <p className="ds-text mt-4 text-sm font-semibold">{service.title}</p>
              <p className="ds-muted mt-1 text-sm leading-6">{service.description}</p>
            </div>
          );
        })}

        <div
          className="reveal ds-card ds-card-hover flex items-center justify-between gap-4 p-6 lg:col-span-2"
          style={{ "--reveal-delay": "460ms" } as React.CSSProperties}
        >
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {restStats.map((stat) => (
              <div key={stat.label}>
                <p className="ds-display-font ds-accent-text text-lg leading-tight">{stat.value}</p>
                <p className="ds-soft mt-1 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
          <a href="#projects" className="ds-link-accent shrink-0 text-sm font-medium">
            View work →
          </a>
        </div>
      </div>
    </div>
  );
}
