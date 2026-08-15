import Link from "next/link";
import { Code2, TerminalSquare } from "lucide-react";
import { siteConfig } from "@/app/site.config";
import { GithubIcon, LinkedinIcon } from "@/app/components/BrandIcons";
import VisitorCounter from "@/app/components/VisitorCounter";

const iconMap = { Github: GithubIcon, Linkedin: LinkedinIcon, Code2, TerminalSquare };

export default function Footer() {
  const { person, social, footer } = siteConfig;

  return (
    <footer id="contact" className="ds-section ds-section-alt">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div>
          <div>
            <h3 className="ds-display-font ds-text text-xl sm:text-2xl">Quick links</h3>
            <div className="mt-6 grid grid-cols-2 gap-8 sm:grid-cols-3">
              {footer.quickLinks.map((group) => (
                <div key={group.heading}>
                  <p className="ds-text text-sm font-semibold">{group.heading}</p>
                  <ul className="ds-muted mt-3 space-y-2 text-sm leading-relaxed">
                    {group.links.map((link) => (
                      <li key={link.href}>
                        {link.href.startsWith("#") ? (
                          <a className="text-link-subtle hover:text-[var(--ds-accent)]" href={link.href}>
                            {link.label}
                          </a>
                        ) : (
                          <Link className="text-link-subtle hover:text-[var(--ds-accent)]" href={link.href}>
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div>
                <p className="ds-text text-sm font-semibold">Social</p>
                <ul className="ds-muted mt-3 space-y-2 text-sm leading-relaxed">
                  {social.map((s) => {
                    const Icon = iconMap[s.icon as keyof typeof iconMap];
                    return (
                      <li key={s.label}>
                        <a
                          className="inline-flex items-center gap-2 whitespace-nowrap transition-colors hover:text-[var(--ds-accent)]"
                          href={s.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          {s.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="ds-rule ds-soft mt-12 border-t pt-6 text-center text-sm">
          <p>© {new Date().getFullYear()} {person.name}. {footer.copyright}</p>
          <VisitorCounter />
          <p className="mt-1">
            ⭐ Like this portfolio? Build yours →{" "}
            <a
              href={footer.templateRepo}
              target="_blank"
              rel="noopener noreferrer"
              className="ds-link-accent"
            >
              Use the template
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
