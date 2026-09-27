/**
 * Tests for POST /api/ops/deploy-health.
 * Auth is header-based (x-deploy-health-token).
 * sendPortfolioEmail is mocked to isolate the HTTP layer.
 */

import { POST } from "@/app/api/ops/deploy-health/route";
import type { SendPortfolioEmailResult } from "@/app/lib/email";

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      body,
    }),
  },
}));

jest.mock("@/app/lib/email", () => ({
  sendPortfolioEmail: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { sendPortfolioEmail } = require("@/app/lib/email") as {
  sendPortfolioEmail: jest.MockedFunction<() => Promise<SendPortfolioEmailResult>>;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const VALID_TOKEN = "super-secret-deploy-token";

interface MockResponse {
  status: number;
  body: Record<string, unknown>;
}

function makeRequest(token?: string, body: unknown = {}): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token !== undefined) {
    headers["x-deploy-health-token"] = token;
  }
  return new Request("http://localhost/api/ops/deploy-health", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  process.env.DEPLOY_HEALTH_TOKEN = VALID_TOKEN;

  (sendPortfolioEmail as jest.Mock).mockResolvedValue({ ok: true, provider: "smtp" } satisfies SendPortfolioEmailResult);
});

afterEach(() => {
  delete process.env.DEPLOY_HEALTH_TOKEN;
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("authorization", () => {
  it("returns 401 when the auth header is absent", async () => {
    const response = (await POST(makeRequest())) as unknown as MockResponse;

    expect(response.status).toBe(401);
    expect(sendPortfolioEmail).not.toHaveBeenCalled();
  });

  it("returns 401 when the auth token is wrong", async () => {
    const response = (await POST(makeRequest("wrong-token"))) as unknown as MockResponse;

    expect(response.status).toBe(401);
    expect(sendPortfolioEmail).not.toHaveBeenCalled();
  });

  it("returns 401 when DEPLOY_HEALTH_TOKEN env var is not set (even with a provided token)", async () => {
    delete process.env.DEPLOY_HEALTH_TOKEN;

    const response = (await POST(makeRequest("any-token"))) as unknown as MockResponse;

    expect(response.status).toBe(401);
  });

  it("returns 401 when an empty string is provided as the token", async () => {
    const response = (await POST(makeRequest(""))) as unknown as MockResponse;

    expect(response.status).toBe(401);
  });
});

describe("authorized requests", () => {
  it("returns 200 with the correct token", async () => {
    const response = (await POST(makeRequest(VALID_TOKEN))) as unknown as MockResponse;

    expect(response.status).toBe(200);
  });

  it("calls sendPortfolioEmail exactly once per authorized request", async () => {
    await POST(makeRequest(VALID_TOKEN));

    expect(sendPortfolioEmail).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when mail transport is not configured", async () => {
    (sendPortfolioEmail as jest.Mock).mockResolvedValue({ ok: false, error: "not-configured" } satisfies SendPortfolioEmailResult);

    const response = (await POST(makeRequest(VALID_TOKEN))) as unknown as MockResponse;

    expect(response.status).toBe(500);
  });

  it("returns 502 when mail send fails due to a provider error", async () => {
    (sendPortfolioEmail as jest.Mock).mockResolvedValue({ ok: false, error: "provider-error" } satisfies SendPortfolioEmailResult);

    const response = (await POST(makeRequest(VALID_TOKEN))) as unknown as MockResponse;

    expect(response.status).toBe(502);
  });
});
