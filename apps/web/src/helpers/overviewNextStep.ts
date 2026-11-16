import type { OverviewPhase } from "@/helpers/overviewTiming";

export type OverviewNextStepId =
  | "details-name"
  | "mark-ready"
  | "publish-page"
  | "print-qr"
  | "review-pending"
  | "open-live"
  | "view-album"
  | "invite-guests";

export interface OverviewNextStep {
  id: OverviewNextStepId;
  title: string;
  body: string;
  cta: string;
  to: string;
}

export interface OverviewNextStepInput {
  hasName: boolean;
  hasDate: boolean;
  statusPending: boolean;
  phase: OverviewPhase;
  totalAssets: number;
  pendingCount: number;
  /** null = hub status unknown (404 / not loaded yet). */
  hubPublished: boolean | null;
}

/**
 * Single recommended action for the overview. Priority is intentional and calm.
 */
export function resolveOverviewNextStep(
  input: OverviewNextStepInput
): OverviewNextStep {
  if (!input.hasName) {
    return {
      id: "details-name",
      title: "השלימו את פרטי האירוע",
      body: "הוסיפו שם ותאריך כדי שהאורחים יידעו לאן הם מגיעים.",
      cta: "לפרטי האירוע",
      to: "/event/details",
    };
  }

  if (input.statusPending) {
    return {
      id: "mark-ready",
      title: "סמנו שהאירוע מוכן",
      body: input.hasDate
        ? "כשהאירוע מוכן, ההעלאות ייפתחו אוטומטית לפני המועד."
        : "שמרו תאריך וסמנו מוכן כדי לפתוח את ההעלאות בזמן.",
      cta: "לפרטי האירוע",
      to: "/event/details",
    };
  }

  if (input.hubPublished === false) {
    return {
      id: "publish-page",
      title: "פרסמו את דף האירוע",
      body: "דף האירוע הוא הקישור שתשלחו לאורחים — כדאי לפרסם לפני ההזמנות.",
      cta: "לדף האירוע",
      to: "/event/page",
    };
  }

  if (input.phase === "live") {
    return {
      id: "open-live",
      title: "פתחו את המסך החי",
      body: "הציגו את האלבום על מסך האולם או המחשב בזמן האמת.",
      cta: "פתיחת המסך החי",
      to: "/event/gallery/full-screen",
    };
  }

  if (input.pendingCount > 0) {
    return {
      id: "review-pending",
      title: "יש קבצים שממתינים לבדיקה",
      body:
        input.pendingCount === 1
          ? "קובץ אחד ממתין לאישור שלכם."
          : `${input.pendingCount} קבצים ממתינים לאישור שלכם.`,
      cta: "לבדיקת קבצים",
      to: "/event/assets?filter=pending",
    };
  }

  if (input.phase === "past") {
    return {
      id: "view-album",
      title: "האירוע הסתיים — האלבום כאן",
      body:
        input.totalAssets > 0
          ? "אפשר לעבור על הקבצים, להוריד ולשתף עם האורחים."
          : "לא נשמרו העלאות. אפשר עדיין לעדכן פרטים או לשתף קישורי צפייה.",
      cta: input.totalAssets > 0 ? "לכל הקבצים" : "לפרטי האירוע",
      to: input.totalAssets > 0 ? "/event/assets" : "/event/details",
    };
  }

  if (input.totalAssets === 0) {
    return {
      id: "print-qr",
      title: "הדפיסו כרטיסי QR לשולחנות",
      body: "אורחים סורקים ומעלים תמונות בלי אפליקציה — זה הצעד הכי שימושי לפני האירוע.",
      cta: "לכרטיסי QR",
      to: "/event/qr",
    };
  }

  return {
    id: "invite-guests",
    title: "הזמינו אורחים להעלות",
    body: "שתפו את עמוד ההעלאה או את דף האירוע — והאלבום יתמלא מעצמו.",
    cta: "לעמוד ההעלאה",
    to: "/event/upload",
  };
}
