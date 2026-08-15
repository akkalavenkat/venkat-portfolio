"use client";

import { useEffect, useState } from "react";
import { formatNumber } from "@/app/lib/formatNumber";

interface VisitData {
  visits: number;
  monthlyVisits: number;
}

/**
 * VisitorCounter
 *
 * Displays a privacy-friendly visitor counter.
 * Fetches the count from /api/analytics/visits on mount.
 *
 * Features:
 * - Deduplicates visits per IP per day
 * - Shows loading placeholder while fetching
 * - Formats numbers for readability (1234 → "1.2k")
 * - Fails gracefully (hides on error)
 * - Minimal, non-blocking UI
 */
export default function VisitorCounter() {
  const [monthlyVisits, setMonthlyVisits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchVisits = async () => {
      try {
        const response = await fetch("/api/analytics/visits", {
          method: "GET",
          next: { revalidate: 60 }, // Cache for 60 seconds, then revalidate
        });

        if (!response.ok) {
          console.warn("[VisitorCounter] Failed to fetch visits:", response.status);
          if (isMounted) setIsLoading(false);
          return;
        }

        const data: VisitData = await response.json();
        if (isMounted) {
          setMonthlyVisits(data.monthlyVisits);
          setIsLoading(false);
        }
      } catch (error) {
        console.warn("[VisitorCounter] Error fetching visits:", error);
        // Fail silently; don't show component on error
        if (isMounted) setIsLoading(false);
      }
    };

    fetchVisits();

    return () => {
      isMounted = false;
    };
  }, []);

  // Don't render if loading or if fetch failed
  if (isLoading || monthlyVisits === null) {
    return null;
  }

  const suffix = "visits";
  const displayText = monthlyVisits < 1000
    ? `${monthlyVisits} ${suffix} this month`
    : `${formatNumber(monthlyVisits)}+ ${suffix} this month`;

  return (
    <span className="ds-soft text-xs">
      {displayText}
    </span>
  );
}

