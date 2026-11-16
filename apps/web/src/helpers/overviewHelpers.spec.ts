/**
 * Lightweight unit checks for overview helpers (no Jest/Vitest in apps/web).
 * Run via: node --loader ... or the overview-v2 verify script.
 */
import { resolveOverviewTiming } from "@/helpers/overviewTiming";
import { resolveOverviewNextStep } from "@/helpers/overviewNextStep";
import { pickOverviewRecentUploads } from "@/helpers/overviewRecentUploads";
import { resolveOverviewVenue } from "@/helpers/overviewVenue";
import { StatusEnum } from "@/helpers/enums";

export function runOverviewHelperChecks(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const eq = (a: unknown, b: unknown, what: string) => {
    if (a !== b) errors.push(`${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
  };

  // Timing: live by status
  eq(
    resolveOverviewTiming({
      hasName: true,
      status: StatusEnum.IN_PROGRESS,
    }).phase,
    "live",
    "live status"
  );

  // Timing: past by ACTIVE
  eq(
    resolveOverviewTiming({
      hasName: true,
      status: StatusEnum.ACTIVE,
    }).phase,
    "past",
    "active past"
  );

  // Timing: upcoming countdown
  const future = new Date(Date.now() + 3 * 86400000).toISOString();
  const upcoming = resolveOverviewTiming({
    hasName: true,
    status: StatusEnum.READY,
    startsAt: future,
  });
  eq(upcoming.phase, "upcoming", "upcoming phase");
  if (!/(יום|ימים)/.test(upcoming.timingLabel)) {
    errors.push(`upcoming label missing days: ${upcoming.timingLabel}`);
  }

  // Timing: setup
  eq(
    resolveOverviewTiming({ hasName: false, status: StatusEnum.PENDING }).phase,
    "setup",
    "setup"
  );

  // Next step: no name
  eq(
    resolveOverviewNextStep({
      hasName: false,
      hasDate: false,
      statusPending: true,
      phase: "setup",
      totalAssets: 0,
      pendingCount: 0,
      hubPublished: null,
    }).id,
    "details-name",
    "next: details"
  );

  // Next step: publish page
  eq(
    resolveOverviewNextStep({
      hasName: true,
      hasDate: true,
      statusPending: false,
      phase: "upcoming",
      totalAssets: 0,
      pendingCount: 0,
      hubPublished: false,
    }).id,
    "publish-page",
    "next: publish"
  );

  // Next step: QR when empty upcoming
  eq(
    resolveOverviewNextStep({
      hasName: true,
      hasDate: true,
      statusPending: false,
      phase: "upcoming",
      totalAssets: 0,
      pendingCount: 0,
      hubPublished: true,
    }).id,
    "print-qr",
    "next: qr"
  );

  // Next step: live
  eq(
    resolveOverviewNextStep({
      hasName: true,
      hasDate: true,
      statusPending: false,
      phase: "live",
      totalAssets: 5,
      pendingCount: 2,
      hubPublished: true,
    }).id,
    "open-live",
    "next: live beats pending"
  );

  // Recent uploads sort + video detect
  const thumbs = pickOverviewRecentUploads(
    [
      { id: 1, fullPath: "/a.jpg", created_at: "2026-01-01T00:00:00Z" },
      { id: 2, fullPath: "/b.mp4", type: "video", created_at: "2026-06-01T00:00:00Z" },
      { id: 3, path: "" },
    ],
    8
  );
  eq(thumbs.length, 2, "thumbs length");
  eq(thumbs[0].id, 2, "newest first");
  eq(thumbs[0].isVideo, true, "video flag");

  // Venue from hub hero
  const venue = resolveOverviewVenue({
    hubConfig: {
      blocks: [
        {
          type: "HERO_COUNTDOWN",
          data: { venue: "אולם הדוגמה", city: "השרון" },
        },
      ],
    },
  });
  eq(venue, "אולם הדוגמה, השרון", "venue line");

  return { ok: errors.length === 0, errors };
}
