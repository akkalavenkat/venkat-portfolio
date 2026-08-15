import { siteConfig } from "@/app/site.config";

export default function TerminalHero() {
  const { hero, person } = siteConfig;

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 sm:py-24 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16">
      <div>
        <p className="reveal font-mono text-xs text-[var(--ds-soft)]">
          <span className="ds-accent-text">~/portfolio</span> on{" "}
          <span className="text-[var(--ds-accent-2)]">main</span>
        </p>
        <p
          className="reveal mt-5 font-mono text-sm ds-muted"
          style={{ "--reveal-delay": "90ms" } as React.CSSProperties}
        >
          $ whoami
        </p>
        <h1
          className="reveal ds-display-font ds-text mt-3 text-4xl sm:text-5xl lg:text-6xl"
          style={{ "--reveal-delay": "170ms" } as React.CSSProperties}
        >
          {person.name}
          <span className="ds-caret" aria-hidden="true" />
        </h1>
        <p
          className="reveal ds-accent-text mt-3 font-mono text-sm sm:text-base"
          style={{ "--reveal-delay": "250ms" } as React.CSSProperties}
        >
          {hero.tagline.toLowerCase().replaceAll(" · ", " && ").replaceAll(" ", "_")}
        </p>
        <p
          className="reveal ds-muted mt-6 max-w-xl text-base leading-7"
          style={{ "--reveal-delay": "330ms" } as React.CSSProperties}
        >
          {hero.bio}
        </p>
        <div
          className="reveal mt-8 flex flex-wrap gap-3"
          style={{ "--reveal-delay": "410ms" } as React.CSSProperties}
        >
          <a href={hero.cta.primary.href} className="ds-btn-primary px-5 py-2.5 text-sm">
            ./{hero.cta.primary.label.toLowerCase().replaceAll(" ", "-").replaceAll("'", "")}
          </a>
          <a href={hero.cta.secondary.href} className="ds-btn-secondary px-5 py-2.5 text-sm">
            ls projects/
          </a>
        </div>
        <p
          className="reveal ds-soft mt-5 font-mono text-xs"
          style={{ "--reveal-delay": "470ms" } as React.CSSProperties}
        >
          # {hero.credentials}
        </p>
      </div>

      <div
        className="reveal ds-card overflow-hidden"
        style={{ "--reveal-delay": "300ms" } as React.CSSProperties}
      >
        <div
          className="flex items-center gap-1.5 px-4 py-3"
          style={{ borderBottom: "var(--ds-border-w) solid var(--ds-border)" }}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" aria-hidden="true" />
          <span className="ds-soft ml-3 font-mono text-xs">engineer.config</span>
        </div>
        <div className="px-5 py-5 font-mono text-[13px] leading-7">
          <p className="ds-soft">{"// focus areas"}</p>
          {hero.services.map((service) => (
            <p key={service.title} className="ds-text">
              <span className="ds-accent-text">▸</span> {service.title}
              <span className="ds-soft"> — {service.description.toLowerCase()}</span>
            </p>
          ))}
          <p className="ds-soft mt-4">{"// stats"}</p>
          {hero.stats.map((stat) => (
            <p key={stat.label} className="ds-text">
              <span className="text-[var(--ds-accent-2)]">{stat.label.replaceAll(" ", "_")}</span>
              <span className="ds-soft">:</span> &quot;{stat.value}&quot;
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
