"use client";

import { useState, type SyntheticEvent } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { siteConfig } from "@/app/site.config";
import { GithubIcon, LinkedinIcon } from "@/app/components/BrandIcons";

const iconMap = { Github: GithubIcon, Linkedin: LinkedinIcon };

type FormState = {
  name: string;
  email: string;
  message: string;
  website: string;
  turnstileToken: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  message: "",
  website: "",
  turnstileToken: "",
};

export default function ContactSection() {
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const canSubmit = status !== "submitting" && (!turnstileSiteKey || Boolean(form.turnstileToken));

  const { contact, resume, social } = siteConfig;
  const navbarSocial = social.filter((s) => s.navbarVisible);

  const updateField = (field: keyof FormState, value: string) => {
    if (status !== "idle") {
      setStatus("idle");
      setStatusMessage("");
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (turnstileSiteKey && !form.turnstileToken) {
      setStatus("error");
      setStatusMessage("Please complete the anti-spam check.");
      return;
    }

    setStatus("submitting");
    setStatusMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        setStatus("error");
        setStatusMessage(payload.message ?? "Unable to send your message. Please try again.");
        return;
      }

      setStatus("success");
      setStatusMessage(contact.successMessage);
      setForm(initialState);
    } catch {
      setStatus("error");
      setStatusMessage("Something went wrong while sending your message. Please try again.");
    }
  };

  const statusClassMap: Partial<Record<typeof status, string>> = {
    success:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-900/20 dark:text-emerald-300",
    error:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/70 dark:bg-rose-900/20 dark:text-rose-300",
  };
  const statusClass =
    statusClassMap[status] ??
    "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400";

  return (
    <section id="contact" className="ds-section">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="reveal mx-auto max-w-2xl text-center">
          <h2 className="ds-section-title">{contact.heading}</h2>
          <p className="ds-section-sub mt-4 text-base leading-8 sm:text-lg sm:leading-9">
            {contact.subheading}
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-start">
          <div className="reveal lg:order-2" style={{ "--reveal-delay": "150ms" } as React.CSSProperties}>
            <div className="ds-card mt-6 p-4">
              <p className="ds-text text-sm font-semibold">{contact.hintsTitle}</p>
              <ul className="ds-muted mt-2 space-y-1 text-sm">
                {contact.hints.map((hint) => (
                  <li key={hint}>- {hint}</li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a href={resume.path} download className="ds-btn-primary w-full px-5 py-2.5 text-sm sm:w-auto">
                Download Resume
              </a>
              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
                {navbarSocial.map((s) => {
                  const Icon = iconMap[s.icon as keyof typeof iconMap];
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="ds-btn-secondary h-10 w-full px-3 text-sm sm:w-auto"
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      <span>{s.label}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="reveal lg:order-1 lg:border-r lg:pr-10 ds-rule">
            <form id="contact-form" onSubmit={onSubmit} className="ds-card p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-1">
                  <span className="ds-text mb-1 block text-sm font-medium">Your name</span>
                  <input
                    required
                    maxLength={80}
                    value={form.name}
                    onChange={(event) => updateField("name", event.target.value)}
                    className="ds-input h-11"
                  />
                </label>

                <label className="sm:col-span-1">
                  <span className="ds-text mb-1 block text-sm font-medium">Your email</span>
                  <input
                    required
                    type="email"
                    maxLength={120}
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className="ds-input h-11"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="ds-text mb-1 block text-sm font-medium">Message</span>
                  <textarea
                    required
                    rows={6}
                    maxLength={3000}
                    placeholder={contact.messagePlaceholder}
                    value={form.message}
                    onChange={(event) => updateField("message", event.target.value)}
                    className="ds-input min-h-40 resize-y py-3"
                  />
                </label>

                {/* Honeypot field for basic bot filtering */}
                <label className="hidden" aria-hidden="true">
                  Website{" "}
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(event) => updateField("website", event.target.value)}
                  />
                </label>

                {turnstileSiteKey && (
                  <div className="sm:col-span-2">
                    <Turnstile
                      siteKey={turnstileSiteKey}
                      onSuccess={(token: string) => updateField("turnstileToken", token)}
                      onExpire={() => updateField("turnstileToken", "")}
                      onError={() => updateField("turnstileToken", "")}
                      options={{ theme: "auto", size: "normal" }}
                    />
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="ds-btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "submitting" ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send message"
                  )}
                </button>
                <p className="ds-soft text-xs">{contact.responseTime}</p>
              </div>

              {status !== "idle" && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`mt-3 rounded-md border px-3 py-2 text-sm ${statusClass}`}
                >
                  {statusMessage}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
