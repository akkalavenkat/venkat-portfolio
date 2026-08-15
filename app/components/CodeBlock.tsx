"use client";

import { useState } from "react";

type CodeBlockProps = {
  lang: string;
  codeText: string;
  children: React.ReactNode;
};

export default function CodeBlock({ lang, codeText, children }: Readonly<CodeBlockProps>) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(codeText);
    } catch {
      // Fallback for environments where clipboard API is unavailable
      const textarea = document.createElement("textarea");
      textarea.value = codeText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="my-7 overflow-hidden rounded-[var(--ds-radius-card)] bg-[#1e1e2e]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-2.5">
        {lang ? (
          <span className="font-mono text-xs text-slate-400">{lang}</span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className={`rounded-[var(--ds-radius-btn)] border px-2 py-0.5 font-mono text-xs transition-colors duration-150 ${
            copied
              ? "border-[var(--ds-accent)]/50 text-[var(--ds-accent-2)]"
              : "border-white/15 text-slate-400 hover:border-white/30 hover:text-slate-200"
          }`}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-5">
        <code className="text-sm leading-relaxed text-slate-100">{children}</code>
      </pre>
    </div>
  );
}
