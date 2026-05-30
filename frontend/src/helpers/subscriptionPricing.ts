import { ISubscriptionPlan } from "@/helpers/interfaces";

/** Multiplier for crossed-out "was" price shown next to the real subscription price. */
export const SUBSCRIPTION_STRIKE_MULTIPLIER = 1.3;

export const SUBSCRIPTION_LAUNCH_SALE_LABEL = "מבצע השקה";

export function subscriptionStrikePrice(price: number): number {
  return Math.round(price * SUBSCRIPTION_STRIKE_MULTIPLIER);
}

export function showSubscriptionStrikePrice(price: number): boolean {
  return price > 0;
}

function retentionLabelHebrew(hours: number | undefined): string {
  if (hours == null || !Number.isFinite(hours)) return "";
  if (hours <= 1) return "לאחר שעה";
  const months = Math.round(hours / (24 * 30.4375));
  if (months >= 1) return `לאחר ${months} חודשים מתחילת האירוע`;
  const days = Math.round(hours / 24);
  return days <= 1 ? "לאחר יום" : `לאחר ${days} ימים מתחילת האירוע`;
}

export function subscriptionPlanDescription(plan: ISubscriptionPlan | null): string {
  if (!plan) return "";
  const parts: string[] = [];
  if (plan.files_allowed != null && Number.isFinite(plan.files_allowed)) {
    parts.push(`המסלול מוגבל עד ${plan.files_allowed} קבצים.`);
  }
  const ret = retentionLabelHebrew(plan.storage_time);
  if (ret) {
    parts.push(`האירוע נסגר ${ret}.`);
  }
  return parts.join("<br>");
}
