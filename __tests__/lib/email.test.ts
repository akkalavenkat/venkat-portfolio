/**
 * Tests for sendPortfolioEmail().
 * nodemailer is mocked; global fetch is mocked for the Resend path.
 */

import nodemailer from "nodemailer";
import { sendPortfolioEmail } from "@/app/lib/email";

jest.mock("nodemailer");

const mockSendMail = jest.fn();

const SMTP_ENV = {
  SMTP_HOST: "smtp.test.example",
  SMTP_USER: "user@test.example",
  SMTP_PASS: "secret-password",
  CONTACT_TO_EMAIL: "to@test.example",
};

const validPayload = {
  name: "Alice",
  email: "alice@example.com",
  subject: "Hello",
  message: "This is a test message.",
};

beforeEach(() => {
  jest.clearAllMocks();

  // Make createTransport return a transporter stub with a sendMail spy.
  jest.mocked(nodemailer.createTransport).mockReturnValue(
    { sendMail: mockSendMail } as unknown as ReturnType<typeof nodemailer.createTransport>,
  );
  mockSendMail.mockResolvedValue({ messageId: "test-id" });

  // Remove all mail-related env vars before each test.
  for (const key of ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "CONTACT_TO_EMAIL", "RESEND_API_KEY", "CONTACT_FROM_EMAIL"]) {
    delete process.env[key];
  }
});

describe("SMTP provider", () => {
  it("uses SMTP when all required SMTP env vars are present", async () => {
    Object.assign(process.env, SMTP_ENV);

    const result = await sendPortfolioEmail(validPayload);

    expect(result.ok).toBe(true);
    expect(result.provider).toBe("smtp");
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({ host: "smtp.test.example", auth: expect.objectContaining({ user: "user@test.example" }) }),
    );
    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });

  it("passes the correct recipient and reply-to to sendMail", async () => {
    Object.assign(process.env, SMTP_ENV);

    await sendPortfolioEmail(validPayload);

    const callArgs = mockSendMail.mock.calls[0][0] as Record<string, string>;
    expect(callArgs.to).toBe("to@test.example");
    expect(callArgs.replyTo).toBe("alice@example.com");
  });

  it("returns ok:false with provider-error when sendMail rejects", async () => {
    Object.assign(process.env, SMTP_ENV);
    mockSendMail.mockRejectedValue(new Error("Connection refused"));

    const result = await sendPortfolioEmail(validPayload);

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Connection refused");
  });

  it("does not attempt SMTP when SMTP_HOST is missing", async () => {
    // Only set partial SMTP config — SMTP_HOST is absent
    process.env.SMTP_USER = "user@test.example";
    process.env.SMTP_PASS = "secret";
    process.env.CONTACT_TO_EMAIL = "to@test.example";

    await sendPortfolioEmail(validPayload);

    expect(nodemailer.createTransport).not.toHaveBeenCalled();
  });
});

describe("Resend fallback", () => {
  beforeEach(() => {
    // Provide a working fetch mock for Resend
    global.fetch = jest.fn().mockResolvedValue({ ok: true } as Response);
  });

  afterEach(() => {
    // Restore fetch to avoid cross-test leakage
    jest.restoreAllMocks();
  });

  it("falls back to Resend when SMTP is not configured", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.CONTACT_TO_EMAIL = "to@test.example";

    const result = await sendPortfolioEmail(validPayload);

    expect(result.ok).toBe(true);
    expect(result.provider).toBe("resend");
    expect(global.fetch).toHaveBeenCalledWith("https://api.resend.com/emails", expect.any(Object));
  });

  it("sends the correct Authorization header to Resend", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.CONTACT_TO_EMAIL = "to@test.example";

    await sendPortfolioEmail(validPayload);

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0] as [string, RequestInit];
    const headers = fetchCall[1].headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer re_test_key");
  });

  it("returns ok:false with provider-error when Resend returns a non-ok response", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.CONTACT_TO_EMAIL = "to@test.example";
    global.fetch = jest.fn().mockResolvedValue({ ok: false } as Response);

    const result = await sendPortfolioEmail(validPayload);

    expect(result.ok).toBe(false);
    expect(result.error).toBe("provider-error");
  });
});

describe("not-configured case", () => {
  it("returns ok:false with error 'not-configured' when neither SMTP nor Resend is set up", async () => {
    // All env vars already cleared in beforeEach
    const result = await sendPortfolioEmail(validPayload);

    expect(result.ok).toBe(false);
    expect(result.error).toBe("not-configured");
  });

  it("does not call nodemailer or fetch when unconfigured", async () => {
    global.fetch = jest.fn();

    await sendPortfolioEmail(validPayload);

    expect(nodemailer.createTransport).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
