import Link from "next/link";
import ThemeToggle from "@/app/components/ThemeToggle";

type SubpageTopBarProps = {
  leftLabel: string;
  leftHref?: string;
  rightLabel?: string;
  rightHref?: string;
  maxWidthClass?: string;
};

export default function SubpageTopBar({
  leftLabel,
  leftHref,
  rightLabel = "Home",
  rightHref = "/",
  maxWidthClass = "max-w-6xl",
}: Readonly<SubpageTopBarProps>) {
  const rightLink = (
    <Link href={rightHref} className="text-link-subtle ds-muted caret-transparent text-sm font-medium hover:text-[var(--ds-accent)]">
      {rightLabel}
    </Link>
  );

  const leftContent = leftHref ? (
    <Link href={leftHref} className="text-link-subtle ds-link-accent caret-transparent text-sm font-medium">
      {leftLabel}
    </Link>
  ) : (
    <span className="ds-muted text-sm font-medium">{leftLabel}</span>
  );

  return (
    <section className="ds-header">
      <div className={`mx-auto flex ${maxWidthClass} items-center justify-between px-6 py-4`}>
        {rightLink}
        <div className="flex items-center gap-3">
          {leftContent}
          <ThemeToggle />
        </div>
      </div>
    </section>
  );
}