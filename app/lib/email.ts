import nodemailer from "nodemailer";

export type PortfolioEmailPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type ProviderAttemptResult = {
  attempted: boolean;
  ok: boolean;
};

export type SendPortfolioEmailResult = {
  ok: boolean;
  provider?: "smtp" | "resend";
  error?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildDeliverySubject(subject: string) {
  const timestamp = new Date().toISOString().replaceAll(/[-:]/g, "").replaceAll("T", "-").slice(0, 14);
  const shortId = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `[Portfolio ${timestamp}-${shortId}] ${subject}`;
}

function buildEmailContent({ name, email, subject, message }: PortfolioEmailPayload) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");

  const emailText = [
    "New portfolio message",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subject}`,
    "",
    "Message:",
    message,
  ].join("\n");

  const emailHtml = `
    <h2>New portfolio message</h2>
    <p><strong>Name:</strong> ${safeName}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    <p><strong>Subject:</strong> ${safeSubject}</p>
    <p><strong>Message:</strong></p>
    <p>${safeMessage}</p>
  `;

  return { emailText, emailHtml };
}

async function sendViaSmtp(payload: PortfolioEmailPayload): Promise<ProviderAttemptResult> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpSecure = process.env.SMTP_SECURE === "true";
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || smtpUser;

  if (!smtpHost || !smtpUser || !smtpPass || !toEmail || !fromEmail) {
    return { attempted: false, ok: false };
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const { emailText, emailHtml } = buildEmailContent(payload);

  await transporter.sendMail({
    from: fromEmail,
    to: toEmail,
    subject: buildDeliverySubject(payload.subject),
    replyTo: payload.email,
    text: emailText,
    html: emailHtml,
  });

  return { attempted: true, ok: true };
}

async function sendViaResend(payload: PortfolioEmailPayload): Promise<ProviderAttemptResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";

  if (!apiKey || !toEmail) {
    return { attempted: false, ok: false };
  }

  const { emailText, emailHtml } = buildEmailContent(payload);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: buildDeliverySubject(payload.subject),
      reply_to: payload.email,
      text: emailText,
      html: emailHtml,
    }),
  });

  return { attempted: true, ok: response.ok };
}

export async function sendPortfolioEmail(payload: PortfolioEmailPayload): Promise<SendPortfolioEmailResult> {
  try {
    const smtpResult = await sendViaSmtp(payload);
    if (smtpResult.attempted && smtpResult.ok) {
      return { ok: true, provider: "smtp" };
    }

    const resendResult = await sendViaResend(payload);
    if (resendResult.attempted && resendResult.ok) {
      return { ok: true, provider: "resend" };
    }

    if (!smtpResult.attempted && !resendResult.attempted) {
      return { ok: false, error: "not-configured" };
    }

    return { ok: false, error: "provider-error" };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "provider-error",
    };
  }
}