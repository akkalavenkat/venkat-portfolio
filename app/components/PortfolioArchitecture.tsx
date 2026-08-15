export default function PortfolioArchitecture() {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center gap-0">
        {/* Top: Hosting */}
        <div className="flex justify-center">
          <div className="min-w-[160px] rounded-xl border border-sky-300 bg-sky-50 px-5 py-2.5 text-center shadow-sm dark:border-sky-700/70 dark:bg-sky-500/10">
            <p className="text-sm font-bold text-sky-900 dark:text-sky-100">Vercel</p>
            <p className="text-xs opacity-75 text-sky-800 dark:text-sky-200">Hosting &amp; Deployment</p>
          </div>
        </div>

        <div className="h-5 w-px bg-[var(--ds-divider)]" />

        {/* Row 2: Core stack */}
        <div className="flex flex-wrap justify-center gap-3">
          <div className="min-w-[130px] rounded-xl border border-indigo-300 bg-indigo-50 px-4 py-2.5 text-center shadow-sm dark:border-indigo-700/70 dark:bg-indigo-500/10">
            <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Next.js 16</p>
            <p className="text-xs opacity-75 text-indigo-800 dark:text-indigo-200">App Router, SSR</p>
          </div>
          <div className="min-w-[130px] rounded-xl border border-blue-300 bg-blue-50 px-4 py-2.5 text-center shadow-sm dark:border-blue-700/70 dark:bg-blue-500/10">
            <p className="text-sm font-bold text-blue-900 dark:text-blue-100">TypeScript</p>
            <p className="text-xs opacity-75 text-blue-800 dark:text-blue-200">Type Safety</p>
          </div>
          <div className="min-w-[130px] rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-2.5 text-center shadow-sm dark:border-cyan-700/70 dark:bg-cyan-500/10">
            <p className="text-sm font-bold text-cyan-900 dark:text-cyan-100">Tailwind CSS v4</p>
            <p className="text-xs opacity-75 text-cyan-800 dark:text-cyan-200">Utility Styling</p>
          </div>
        </div>

        <div className="h-5 w-px bg-[var(--ds-divider)]" />

        {/* Row 3: DevOps & Quality */}
        <div className="flex flex-wrap justify-center gap-3">
          <div className="min-w-[130px] rounded-xl border border-violet-300 bg-violet-50 px-4 py-2.5 text-center shadow-sm dark:border-violet-700/70 dark:bg-violet-500/10">
            <p className="text-sm font-bold text-violet-900 dark:text-violet-100">GitHub Actions</p>
            <p className="text-xs opacity-75 text-violet-800 dark:text-violet-200">CI/CD Pipeline</p>
          </div>
          <div className="min-w-[130px] rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-center shadow-sm dark:border-emerald-700/70 dark:bg-emerald-500/10">
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">SonarCloud</p>
            <p className="text-xs opacity-75 text-emerald-800 dark:text-emerald-200">Quality Gates</p>
          </div>
          <div className="min-w-[130px] rounded-xl border border-orange-300 bg-orange-50 px-4 py-2.5 text-center shadow-sm dark:border-orange-700/70 dark:bg-orange-500/10">
            <p className="text-sm font-bold text-orange-900 dark:text-orange-100">Dependabot</p>
            <p className="text-xs opacity-75 text-orange-800 dark:text-orange-200">Dependency Security</p>
          </div>
        </div>

        <div className="h-5 w-px bg-[var(--ds-divider)]" />

        {/* Bottom: Security & Comms */}
        <div className="flex flex-wrap justify-center gap-3">
          <div className="min-w-[160px] rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-center shadow-sm dark:border-amber-700/70 dark:bg-amber-500/10">
            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">Cloudflare Turnstile</p>
            <p className="text-xs opacity-75 text-amber-800 dark:text-amber-200">Anti-spam</p>
          </div>
          <div className="min-w-[160px] rounded-xl border border-[var(--ds-border)] bg-[var(--ds-surface)] px-4 py-2.5 text-center shadow-sm">
            <p className="ds-text text-sm font-bold">Nodemailer / Resend</p>
            <p className="ds-muted text-xs opacity-75">Contact &amp; Health Email</p>
          </div>
        </div>
      </div>
    </div>
  );
}
