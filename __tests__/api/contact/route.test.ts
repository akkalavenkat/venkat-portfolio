/**
 * Tests for POST /api/contact.
 * sendPortfolioEmail is mocked; NextResponse.json is replaced with a
 * plain object so status codes are easy to assert.
 *
 * The route module holds a module-level rate-limit Map. Each test uses
 * a unique x-forwarded-for IP address so the limiter never fires.
 */

import { POST } from "@/app/api/contact/route";
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

/** Monotonically increasing IP so each test gets its own rate-limit bucket. */
let ipSeq = 0;
function uniqueIp() {
  const n = ++ipSeq;
  return `10.${Math.floor(n / 65025) % 256}.${Math.floor(n / 255) % 256}.${n % 255 || 1}`;
}

interface MockResponse {
  status: number;
  body: Record<string, unknown>;
}

function makeRequest(body: unknown, extraHeaders: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": uniqueIp(),
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  });
}

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  // Ensure Turnstile is disabled so we don't need to mock the Cloudflare fetch.
  delete process.env.TURNSTILE_SECRET_KEY;

  // Default: email sends successfully.
  (sendPortfolioEmail as jest.Mock).mockResolvedValue({ ok: true, provider: "smtp" } satisfies SendPortfolioEmailResult);
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("honeypot", () => {
  it("silently returns 200 and does NOT call sendPortfolioEmail when the honeypot field is filled", async () => {
    const response = (await POST(
      makeRequest({ name: "Bot", email: "bot@spam.com", message: "Buy now", website: "https://spam.example" }),
    )) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(sendPortfolioEmail).not.toHaveBeenCalled();
  });
});

describe("input validation", () => {
  it("returns 400 when name is missing", async () => {
    const response = (await POST(
      makeRequest({ email: "alice@example.com", message: "Hello" }),
    )) as unknown as MockResponse;

    expect(response.status).toBe(400);
    expect(sendPortfolioEmail).not.toHaveBeenCalled();
  });

  it("returns 400 when email is missing", async () => {
    const response = (await POST(
      makeRequest({ name: "Alice", message: "Hello" }),
    )) as unknown as MockResponse;

    expect(response.status).toBe(400);
  });

  it("returns 400 when message is missing", async () => {
    const response = (await POST(
      makeRequest({ name: "Alice", email: "alice@example.com" }),
    )) as unknown as MockResponse;

    expect(response.status).toBe(400);
  });

  it("returns 400 for an invalid email format", async () => {
    const response = (await POST(
      makeRequest({ name: "Alice", email: "not-a-valid-email", message: "Hello" }),
    )) as unknown as MockResponse;

    expect(response.status).toBe(400);
  });

  it("accepts an email with subdomains (valid format)", async () => {
    const response = (await POST(
      makeRequest({ name: "Alice", email: "alice@mail.example.co.uk", message: "Hello" }),
    )) as unknown as MockResponse;

    expect(response.status).toBe(200);
  });
});

describe("successful submission", () => {
  it("returns 200 when all required fields are valid", async () => {
    const response = (await POST(
      makeRequest({ name: "Alice", email: "alice@example.com", message: "Hello there" }),
    )) as unknown as MockResponse;

    expect(response.status).toBe(200);
    expect(sendPortfolioEmail).toHaveBeenCalledTimes(1);
  });

  it("forwards name, email, and message to sendPortfolioEmail", async () => {
    await POST(makeRequest({ name: "Bob", email: "bob@example.com", message: "Test msg", subject: "My Subject" }));

    expect(sendPortfolioEmail).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Bob", email: "bob@example.com", message: "Test msg", subject: "My Subject" }),
    );
  });

  it("uses a default subject when subject field is omitted", async () => {
    await POST(makeRequest({ name: "Bob", email: "bob@example.com", message: "Hi" }));

    expect(sendPortfolioEmail).toHaveBeenCalledWith(
      expect.objectContaining({ subject: "Website contact message" }),
    );
  });
});

describe("email send failures", () => {
  it("returns 500 when sendPortfolioEmail reports not-configured", async () => {
    (sendPortfolioEmail as jest.Mock).mockResolvedValue({ ok: false, error: "not-configured" } satisfies SendPortfolioEmailResult);

    const response = (await POST(
      makeRequest({ name: "Alice", email: "alice@example.com", message: "Hello" }),
    )) as unknown as MockResponse;

    expect(response.status).toBe(500);
  });

  it("returns 502 when sendPortfolioEmail reports a provider-error", async () => {
    (sendPortfolioEmail as jest.Mock).mockResolvedValue({ ok: false, error: "provider-error" } satisfies SendPortfolioEmailResult);

    const response = (await POST(
      makeRequest({ name: "Alice", email: "alice@example.com", message: "Hello" }),
    )) as unknown as MockResponse;

    expect(response.status).toBe(502);
  });
});
