import { NextResponse } from "next/server";
import { sendPortfolioEmail } from "@/app/lib/email";

type DeployHealthPayload = {
  environment?: string;
  commitSha?: string;
  branch?: string;
  deployUrl?: string;
  trigger?: string;
};

function isAuthorized(request: Request) {
  const expectedToken = process.env.DEPLOY_HEALTH_TOKEN;
  if (!expectedToken) {
    return false;
  }

  const provided = request.headers.get("x-deploy-health-token")?.trim();
  return Boolean(provided) && provided === expectedToken;
}

function clamp(value: string, max: number) {
  return value.trim().slice(0, max);
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  let payload: DeployHealthPayload;
  try {
    payload = (await request.json()) as DeployHealthPayload;
  } catch {
    payload = {};
  }

  const environment = clamp(payload.environment ?? process.env.VERCEL_ENV ?? "unknown", 40);
  const commitSha = clamp(payload.commitSha ?? process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown", 64);
  const branch = clamp(payload.branch ?? process.env.VERCEL_GIT_COMMIT_REF ?? "unknown", 120);
  const deployUrl = clamp(payload.deployUrl ?? process.env.VERCEL_URL ?? "unknown", 500);
  const trigger = clamp(payload.trigger ?? "workflow", 80);
  const timestamp = new Date().toISOString();

  const sendResult = await sendPortfolioEmail({
    name: "Deployment Health Check",
    email: process.env.SMTP_USER || "deploy-health@localhost",
    subject: `SMTP health check (${environment})`,
    message: [
      "This verifies the production SMTP/Resend path using the same mail configuration as the contact form.",
      "",
      `Environment: ${environment}`,
      `Trigger: ${trigger}`,
      `Commit: ${commitSha}`,
      `Branch: ${branch}`,
      `Deploy URL: ${deployUrl}`,
      `Timestamp (UTC): ${timestamp}`,
    ].join("\n"),
  });

  if (sendResult.ok) {
    return NextResponse.json(
      { message: "Deployment SMTP health email sent.", provider: sendResult.provider },
      { status: 200 },
    );
  }

  if (sendResult.error === "not-configured") {
    return NextResponse.json(
      { message: "Mail transport is not configured for deployment health checks." },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Mail send failed for deployment health check." },
    { status: 502 },
  );
}