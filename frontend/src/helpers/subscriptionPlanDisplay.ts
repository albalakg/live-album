import { ISubscriptionPlan } from "@/helpers/interfaces";
import {
  showSubscriptionStrikePrice,
  subscriptionPlanDescription,
  subscriptionStrikePrice,
} from "@/helpers/subscriptionPricing";

export const SUBSCRIPTION_PLAN_SLUG_ORDER = ["demo", "classic", "premium"] as const;

export type SubscriptionPlanSlug = (typeof SUBSCRIPTION_PLAN_SLUG_ORDER)[number];

export const ICON_BY_SLUG: Record<string, string> = {
  demo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect x="12" y="16" width="40" height="32" rx="7"
        stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M12 24h40"
        stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M22 38l6 6 14-14"
        stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M54 28h-2.5c-1.4 0-2.5 1.1-2.5 2.5v3c0 1.4 1.1 2.5 2.5 2.5H54"
        stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  classic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect x="12" y="16" width="40" height="32" rx="7"
        stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M12 24h40"
        stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M22 38l6 6 14-14"
        stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M54 28h-2.5c-1.4 0-2.5 1.1-2.5 2.5v3c0 1.4 1.1 2.5 2.5 2.5H54"
        stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  premium: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <path d="M14 26l10 8 8-14 8 14 10-8 2 22H12l2-22z"
        stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18 48h28"
        stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
  <circle cx="24" cy="34" r="2.2" stroke="currentColor" stroke-width="2.2"/>
  <circle cx="32" cy="30" r="2.2" stroke="currentColor" stroke-width="2.2"/>
  <circle cx="40" cy="34" r="2.2" stroke="currentColor" stroke-width="2.2"/>
  <path d="M10 18h4M12 16v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M50 16h4M52 14v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
</svg>`,
};

export type PlanDisplayCard = {
  slug: string;
  title: string;
  displayPrice: number;
  strikePrice: number;
  showStrikePrice: boolean;
  description: string;
  icon: string;
  cardClass: string;
};

export function cardClassForSlug(slug: string): string {
  if (slug === "classic") return "classic-card";
  if (slug === "premium") return "premium-card";
  return "";
}

export type BuildPlanDisplayCardOptions = {
  priceOverride?: number;
};

export function buildPlanDisplayCard(
  plan: ISubscriptionPlan,
  options?: BuildPlanDisplayCardOptions
): PlanDisplayCard {
  const displayPrice = options?.priceOverride ?? plan.price;
  return {
    slug: plan.slug,
    title: `מסלול ${plan.name}`,
    displayPrice,
    strikePrice: subscriptionStrikePrice(displayPrice),
    showStrikePrice: showSubscriptionStrikePrice(displayPrice),
    description: subscriptionPlanDescription(plan),
    icon: ICON_BY_SLUG[plan.slug] ?? ICON_BY_SLUG.classic,
    cardClass: cardClassForSlug(plan.slug),
  };
}

export function buildPlanDisplayCardsFromPlans(
  plans: ISubscriptionPlan[],
  options?: {
    slugOrder?: readonly string[];
    priceOverrideForSlug?: (slug: string, plan: ISubscriptionPlan) => number | undefined;
  }
): PlanDisplayCard[] {
  const slugOrder = options?.slugOrder ?? SUBSCRIPTION_PLAN_SLUG_ORDER;
  const bySlug = Object.fromEntries(plans.map((p) => [p.slug, p]));
  const out: PlanDisplayCard[] = [];

  for (const slug of slugOrder) {
    const plan = bySlug[slug];
    if (!plan) continue;
    const priceOverride = options?.priceOverrideForSlug?.(slug, plan);
    out.push(
      buildPlanDisplayCard(plan, {
        priceOverride: priceOverride ?? undefined,
      })
    );
  }

  return out;
}
