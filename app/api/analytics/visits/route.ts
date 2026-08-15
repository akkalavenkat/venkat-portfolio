import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/analytics/visits
 *
 * Increments a global visit counter, deduplicating visits per IP per day.
 * Also tracks monthly visits.
 * Uses Vercel KV for storage with 24-hour TTL on deduplication keys.
 *
 * Returns: { visits: number, monthlyVisits: number }
 */
export async function GET(request: NextRequest) {
  try {
    // Extract real IP address (handles proxies like Vercel, CloudFlare)
    let ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-real-ip") ||
      "";

    // Fallback: generate unique anonymous ID to avoid undercounting
    if (!ip) {
      ip = `anon-${Math.random().toString(36).slice(2, 11)}`;
    }

    // Create a deduplication key: visit:{ip}:{YYYY-MM-DD}
    // Use ISO format for deterministic, consistent date strings
    const now = new Date();
    const today = now.toISOString().slice(0, 10); // "2026-04-16"
    const dedupeKey = `visit:${ip}:${today}`;

    // Get month for monthly counter: YYYY-MM
    const yearMonth = now.toISOString().slice(0, 7); // "2026-04"

    // Atomic set with NX (only set if key doesn't exist) and 24h expiration
    // Returns true if key was newly created, false if already exists
    const added = await kv.set(dedupeKey, "1", { nx: true, ex: 86400 });

    if (added) {
      // New visit for this IP today: increment counters
      await Promise.all([
        kv.incr("visits:total"), // Increment global counter
        kv.incr(`visits:${yearMonth}`), // Increment monthly counter
      ]);
    }

    // Get current totals
    const visits = (await kv.get<number>("visits:total")) ?? 0;
    const monthlyVisits = (await kv.get<number>(`visits:${yearMonth}`)) ?? 0;

    return NextResponse.json({ visits, monthlyVisits }, { status: 200 });
  } catch (error) {
    // Log error but don't expose details; fail gracefully
    console.error("[API /analytics/visits] Error:", error);
    // Return safe response with 0 visits on error
    return NextResponse.json({ visits: 0, monthlyVisits: 0 }, { status: 500 });
  }
}

