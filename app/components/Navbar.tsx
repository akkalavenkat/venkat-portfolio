"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { Award, Milestone } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/app/site.config";
import { GithubIcon, LinkedinIcon } from "@/app/components/BrandIcons";

const iconMap = { Github: GithubIcon, Linkedin: LinkedinIcon };

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("hero");
  const pathname = usePathname();
  const isJourneyPage = pathname === "/journey";
  const isCertificationsPage = pathname === "/certifications";
  const iconButtonClassName = "ds-icon-btn";

  const { person, navbar, social } = siteConfig;
  const navbarSocial = social.filter((s) => s.navbarVisible);

  useEffect(() => {
    const sectionIds = navbar.navItems.map((item) => item.href.slice(1));
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) {
      return;
    }

    const updateActiveSection = () => {
      // Use a viewport anchor below the sticky navbar so active state tracks the section in focus.
      const viewportAnchor = window.innerHeight * 0.32;
      const currentSection = sections.find((section) => {
        const rect = section.getBoundingClientRect();
        return rect.top <= viewportAnchor && rect.bottom > viewportAnchor;
      });

      if (currentSection) {
        setActiveSection(currentSection.id);
        return;
      }

      if (window.scrollY < sections[0].offsetTop) {
        setActiveSection(sections[0].id);
        return;
      }

      const lastSection = sections.at(-1) ?? sections[0];
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) {
        setActiveSection(lastSection.id);
      }
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [navbar.navItems]);

  return (
    <header className="ds-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
        <a
          href="#hero"
          title={person.title}
          className="ds-text flex items-center gap-3 leading-tight"
        >
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-[var(--ds-accent-border)]">
            <Image
              src={person.profilePhoto}
              alt={person.name}
              fill
              sizes="(max-width: 768px) 100vw, 48px"
              className="object-cover"
              priority
            />
          </div>
          <span className="flex flex-col">
            <span className="ds-display-font text-xl">{person.name}</span>
            <span className="ds-soft text-xs font-medium tracking-wide">{person.title}</span>
          </span>
        </a>
        <nav className="hidden items-center gap-4 text-[13px] font-medium lg:gap-5 lg:text-sm md:flex">
          {navbar.navItems.map((item) => {
            const isActive = activeSection === item.href.slice(1);

            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`ds-nav-link ${isActive ? "is-active" : ""}`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/journey"
            aria-label="Career journey timeline"
            aria-current={isJourneyPage ? "page" : undefined}
            title="Career journey timeline"
            className={`${iconButtonClassName} ${isJourneyPage ? "is-active" : ""}`}
          >
            <Milestone className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/certifications"
            aria-label="Technical certifications"
            aria-current={isCertificationsPage ? "page" : undefined}
            title="Technical certifications"
            className={`${iconButtonClassName} ${isCertificationsPage ? "is-active" : ""}`}
          >
            <Award className="h-4 w-4" aria-hidden="true" />
          </Link>
          {navbarSocial.map((s) => {
            const Icon = iconMap[s.icon as keyof typeof iconMap];
            return (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className={iconButtonClassName}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </a>
            );
          })}
          <ThemeToggle />
          <a
            href={navbar.cta.href}
            className="ds-btn-primary px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
          >
            {navbar.cta.label}
          </a>
        </div>
      </div>
    </header>
  );
}
