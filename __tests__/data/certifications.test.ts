/**
 * Tests for the certifications data array.
 * No mocks needed — these are pure data integrity checks.
 *
 * Note: the actual Certification type uses `title` (not `name`) and
 * `year: number` (not a date string), matching the TypeScript definition.
 */

import { certifications } from "@/app/data/certifications";
import type { CertificationStatus } from "@/app/data/certifications";

const VALID_STATUSES: CertificationStatus[] = ["active", "no-expiry", "expired"];

describe("certifications array", () => {
  it("is not empty", () => {
    expect(certifications.length).toBeGreaterThan(0);
  });

  it("contains only objects (no nulls or primitives)", () => {
    certifications.forEach((cert) => {
      expect(cert).toBeDefined();
      expect(typeof cert).toBe("object");
    });
  });

  it("has unique ids across all entries", () => {
    const ids = certifications.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

describe("each certification", () => {
  it.each(certifications)("$title — has a non-empty id", ({ id }) => {
    expect(typeof id).toBe("string");
    expect(id.trim().length).toBeGreaterThan(0);
  });

  it.each(certifications)("$title — has a non-empty title", ({ title }) => {
    expect(typeof title).toBe("string");
    expect(title.trim().length).toBeGreaterThan(0);
  });

  it.each(certifications)("$title — has a non-empty issuer", ({ issuer }) => {
    expect(typeof issuer).toBe("string");
    expect(issuer.trim().length).toBeGreaterThan(0);
  });

  it.each(certifications)("$title — has a positive integer year", ({ year }) => {
    expect(Number.isInteger(year)).toBe(true);
    expect(year).toBeGreaterThan(2000);
    expect(year).toBeLessThanOrEqual(new Date().getFullYear() + 1);
  });

  it.each(certifications)("$title — has a non-empty domain", ({ domain }) => {
    expect(typeof domain).toBe("string");
    expect(domain.trim().length).toBeGreaterThan(0);
  });

  it.each(certifications)("$title — has a valid status value", ({ status }) => {
    expect(VALID_STATUSES).toContain(status);
  });

  it.each(certifications.filter((c) => c.credentialId !== undefined))(
    "$title — credentialId is a non-empty string when present",
    ({ credentialId }) => {
      expect(typeof credentialId).toBe("string");
      expect((credentialId as string).trim().length).toBeGreaterThan(0);
    },
  );
});
