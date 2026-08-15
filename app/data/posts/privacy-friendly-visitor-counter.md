---
title: "Building a privacy-friendly visitor counter with Vercel KV"
date: "2026-04-16"
excerpt: "A minimal Redis-based counter that tracks portfolio visits without surveillance, using deduplication and atomic operations for correctness."
tags: "redis,nextjs,architecture,privacy"
source: "original"
---

I wanted a visitor counter on my portfolio. Not for analytics—I don't care about bounce rates or session flows. Just a simple number showing how many people have visited. The problem is that most visitor counters are either trivial (increment on every request) or excessive (full Google Analytics tracking).

So I built something in the middle. It took about 200 lines of code and uses only Vercel KV (Redis).

## The Problem With Simple Counters

Increment-on-every-request sounds simple. Load the page, bang, counter goes up. But this is awful:

- Refresh the page 10 times, counter jumps to 10. Your portfolio looks more popular than it is.
- Bots make requests too. The count becomes noise.
- No way to distinguish between a bot and a real visitor.

The other extreme is overkill. Google Analytics, Plausible, Segment—they're powerful but track way too much. You need to worry about privacy policies, GDPR, consent management, and cookie banners.

I wanted something in between. Count visits accurately enough, respect privacy completely, keep infrastructure minimal.

## Design Goals

- **Deduplication**: Same visitor today = count once only
- **Atomic**: No race conditions, accurate count under concurrent requests
- **TTL-aware**: Automatic cleanup, no memory bloat
- **Privacy**: Store only IP + date, nothing else
- **Low latency**: Fast response, doesn't block page render
- **Monthly tracking**: Show "500+ visits this month" on footer

The constraints shaped everything.

## Architecture: IP-Based Deduplication

The simplest approach: use visitor IP as a fingerprint, deduplicate per calendar day.

```
visit:{ip}:{YYYY-MM-DD} = "1" (expires in 24 hours)
visits:total = 1234 (never expires)
visits:2026-04 = 245 (monthly counter)
```

When a request comes in:

1. Extract visitor IP from request headers
2. Check if `visit:{ip}:{today}` exists in Redis
3. If not: increment counters, create the key with 24h TTL
4. If yes: return current count, don't increment

This works because Redis keys automatically expire. After 24 hours, the dedup key vanishes. Same IP next month = fresh count.

## Atomic Operations: Avoiding the Count Corruption

The dangerous version looks like this:

```javascript
// DON'T DO THIS
if (!exists(dedupeKey)) {
  get("visits:total"); // Read
  // <-- Network latency gap
  increment(it_by_one); // Write
  set(dedupeKey, ttl); // Write
}
```

Two concurrent requests hit the gap between read and write. Both see the key doesn't exist. Both increment. Off-by-one corruption.

Redis solves this with atomic operations:

```javascript
if (!(await kv.exists(dedupeKey))) {
  await Promise.all([
    kv.incr("visits:total"), // Atomic increment
    kv.incr(`visits:${yearMonth}`), // Atomic monthly increment
    kv.setex(dedupeKey, 86400, "1"), // Atomic set + expire
  ]);
}
```

`kv.incr` is a single Redis command. No gaps. The counter is guaranteed to be correct.

## Handling Missing IPs (Anonymous Visitors)

Some requests don't have valid IP headers. VPNs, proxies, or weird network setups strip them.

**Bad approach**: Use a shared "unknown" string for everyone. All anonymous visitors count as one visitor. Count becomes nonsense.

**Better approach**: Generate a unique anonymous ID per request:

```javascript
let ip =
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  request.headers.get("cf-connecting-ip") ||
  request.headers.get("x-real-ip") ||
  "";

if (!ip) {
  ip = `anon-${Math.random().toString(36).slice(2, 11)}`;
}
```

Each anonymous visitor gets a unique ID. They count once per day like real visitors. Counting is now fair.

## Frontend: Fetch Once, Cache Locally

The API is simple. On page load, React calls it once:

```javascript
const response = await fetch("/api/analytics/visits", {
  next: { revalidate: 60 }, // Cache for 60s, then refresh
});
```

`revalidate: 60` means the browser won't call the API again for 60 seconds. Your portfolio footprint drops massively (no API spam), and visitors see a slightly stale counter (big deal? No).

Graceful failure is built in. If KV is down, the component hides silently. The page still loads, counter just doesn't show. No error UI, no broken state.

## The Trade-Offs (This Is Not Google Analytics)

This system is not perfect analytics. It's better than nothing, worse than Segment. Here are the gaps:

**IP-based tracking is imperfect.**

- Shared networks (office WiFi, university networks, corporate proxies): Many people behind one IP → undercount
- VPNs: One person rotates IPs → overcount
- Cached responses: Cloudflare serves stale HTML → no new request → no count
- Bots: Some still sneak through

**You're not tracking behavior.**

This counter tells you "1.2k people visited last month." It doesn't tell you:

- How long they stayed
- What they clicked
- Whether they read the blog
- Bounce rate, conversion rate, anything useful for actual decisions

**This is fine.** I don't need that data. I just want to know if anyone visits. If I needed deeper analytics, I'd bite the bullet and use Plausible or a proper tool.

## Monthly Display: Simple and Relevant

The footer shows: **"500+ visits this month"**

This resets every month. It's more relevant than "50k+ visits all-time" (which looks impressive but means nothing after 2 years).

The logic is minimal:

```javascript
if (monthlyVisits < 1000) {
  return `${monthlyVisits} visits this month`;
}
return `${formatNumber(monthlyVisits)}+ visits this month`;
```

Under 1000, show the exact number. Over 1000, format it (1.2k, etc). Keep it simple.

## Why Vercel KV Specifically

I could have used:

- PostgreSQL: Overkill, needs a database
- DynamoDB: Overkill, vendor lock-in
- Upstash Redis: Good option, but I'm already on Vercel
- Redis Cloud: Same, vendor fragmentation

Vercel KV is just Redis-in-the-cloud, auto-connected to my Next.js deployment. It handles persistence, backups, and failover. I don't manage anything. Two lines of code to connect.

At scale this wouldn't work (Redis isn't a long-term store), but for a personal portfolio, it's ideal.

## Final Takeaway

Building custom infrastructure for trivial needs is wasteful. But using a sledgehammer (full analytics platform) for a needle task is also wasteful. This visitor counter sits in the sweet spot: minimal code, zero privacy concerns, accurate enough, and completely transparent.

The real lesson is: understand your constraint space. Know what you're trying to solve before you solve it. A counter that shows "real visitors" is better than one showing "page loads." A monthly view is more meaningful than all-time. Deduplication per day beats deduplication per session.

The best system is the one that answers your actual question.
