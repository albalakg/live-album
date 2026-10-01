/**
 * Subscriptions + PayPlus checkout (FE only).
 *
 * Backend contract (align other repo):
 * - GET  api/subscriptions — array of { id, name, price, slug | code | value }
 * - POST api/subscriptions/:id/checkout-link — { paymentUrl | payment_url | payment_page_link, ... }
 * - PayPlus refURL_success / refURL_failure should send the user to the SPA, e.g.
 *   {origin}/payments/payplus/success and {origin}/payments/payplus/failure
 *   (or 302 from API to those URLs).
 */
import axios from "axios";
import { notify } from "@kyvg/vue3-notification";
import ErrorsHandler from "@/helpers/errorsHandler";
import {
  ICheckoutLinkResponse,
  IOrderResponse,
  ISubscriptionPlan,
} from "@/helpers/interfaces";
import { SubscriptionTypesEnum } from "@/helpers/enums";
import { DEMO_SUBSCRIPTION_STORAGE_HOURS } from "@/helpers/subscriptionPricing";

export interface ISubscriptionsState {
  plans: ISubscriptionPlan[];
  plansLoaded: boolean;
}

const SLUG_BY_SUBSCRIPTION_NAME: Record<string, string> = {
  [SubscriptionTypesEnum.DEMO]: "demo",
  [SubscriptionTypesEnum.CLASSIC]: "classic",
  [SubscriptionTypesEnum.PREMIUM]: "premium",
};

/** Stable fallback when name does not match enum (e.g. staging data). */
const SLUG_BY_ID: Record<number, string> = {
  1: "demo",
  2: "classic",
  3: "premium",
};

const SLUG_ORDER = ["demo", "classic", "premium"] as const;

function parsePrice(raw: Record<string, unknown>): number {
  const p = raw.price ?? raw.amount;
  if (typeof p === "number" && Number.isFinite(p)) return p;
  if (typeof p === "string") {
    const n = parseFloat(p);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function resolveSlug(raw: Record<string, unknown>, id: number): string | null {
  const fromApi =
    (raw.slug as string) ||
    (raw.code as string) ||
    (raw.value as string) ||
    "";
  if (fromApi) return String(fromApi).toLowerCase();
  const name = String(raw.name ?? "");
  if (name && SLUG_BY_SUBSCRIPTION_NAME[name])
    return SLUG_BY_SUBSCRIPTION_NAME[name];
  if (SLUG_BY_ID[id]) return SLUG_BY_ID[id];
  return null;
}

// BE: id, name, status, price, events_allowed, files_allowed, storage_time, payment_page_link, …
function normalizePlan(raw: Record<string, unknown>): ISubscriptionPlan | null {
  const id = Number(raw.id);
  if (!Number.isFinite(id)) return null;
  const slug = resolveSlug(raw, id);
  if (!slug) return null;
  const status = raw.status != null ? Number(raw.status) : undefined;
  if (Number.isFinite(status) && status !== 1) return null;

  const name = String(raw.name ?? "");
  const price = parsePrice(raw);
  const events_allowed =
    raw.events_allowed != null ? Number(raw.events_allowed) : undefined;
  const files_allowed =
    raw.files_allowed != null ? Number(raw.files_allowed) : undefined;
  const storage_time =
    raw.storage_time != null ? Number(raw.storage_time) : undefined;
  const payment_page_link =
    (raw.payment_page_link as string | null | undefined) ?? undefined;

  const resolvedStorageTime =
    slug === "demo" ? DEMO_SUBSCRIPTION_STORAGE_HOURS : storage_time;

  return {
    id,
    slug,
    name,
    price,
    status,
    events_allowed,
    files_allowed,
    storage_time: resolvedStorageTime,
    payment_page_link,
  };
}

function slugSortRank(slug: string): number {
  const i = SLUG_ORDER.indexOf(slug as (typeof SLUG_ORDER)[number]);
  return i === -1 ? 999 : i;
}

function sortPlansBySlug(plans: ISubscriptionPlan[]): ISubscriptionPlan[] {
  return [...plans].sort((a, b) => slugSortRank(a.slug) - slugSortRank(b.slug));
}

function normalizeCheckoutPayload(data: Record<string, unknown>): ICheckoutLinkResponse | null {
  const paymentUrl =
    (data.paymentUrl as string) ||
    (data.payment_url as string) ||
    (data.payment_page_link as string);
  if (!paymentUrl || typeof paymentUrl !== "string") return null;
  return {
    paymentUrl,
    expiresAt: (data.expiresAt ?? data.expires_at) as string | undefined,
    providerRequestUid: (data.providerRequestUid ??
      data.provider_request_uid) as string | undefined,
    provider: data.provider as string | undefined,
  };
}

function toIframeSession(checkout: ICheckoutLinkResponse): IOrderResponse {
  return { payment_page_link: checkout.paymentUrl };
}

const OFFLINE_FALLBACK_PLANS: ISubscriptionPlan[] = sortPlansBySlug([
  {
    id: 1,
    slug: "demo",
    name: SubscriptionTypesEnum.DEMO,
    price: 0,
    status: 1,
    events_allowed: 1,
    files_allowed: 10,
    storage_time: DEMO_SUBSCRIPTION_STORAGE_HOURS,
  },
  {
    id: 2,
    slug: "classic",
    name: SubscriptionTypesEnum.CLASSIC,
    price: 200,
    status: 1,
    events_allowed: 1,
    files_allowed: 1000,
    storage_time: 4320,
  },
  {
    id: 3,
    slug: "premium",
    name: SubscriptionTypesEnum.PREMIUM,
    price: 300,
    status: 1,
    events_allowed: 1,
    files_allowed: 5000,
    storage_time: 8760,
  },
]);

function extractSubscriptionsPayload(resData: unknown): unknown[] {
  if (Array.isArray(resData)) return resData;
  if (resData && typeof resData === "object" && Array.isArray((resData as { data?: unknown }).data)) {
    return (resData as { data: unknown[] }).data;
  }
  return [];
}

const SubscriptionsModule = {
  namespaced: true,

  state: {
    plans: [] as ISubscriptionPlan[],
    plansLoaded: false,
  } as ISubscriptionsState,

  getters: {
    plans(state: ISubscriptionsState): ISubscriptionPlan[] {
      return state.plans;
    },
    plansLoaded(state: ISubscriptionsState): boolean {
      return state.plansLoaded;
    },
  },

  mutations: {
    SET_PLANS(state: ISubscriptionsState, plans: ISubscriptionPlan[]) {
      state.plans = plans;
      state.plansLoaded = true;
    },
    RESET_PLANS(state: ISubscriptionsState) {
      state.plans = [];
      state.plansLoaded = false;
    },
  },

  actions: {
    fetchPlans(context: {
      commit: (m: string, p: ISubscriptionPlan[]) => void;
    }) {
      return new Promise<ISubscriptionPlan[]>((resolve) => {
        axios
          .get("subscriptions")
          .then((res) => {
            const list = extractSubscriptionsPayload(res.data);
            let normalized = sortPlansBySlug(
              list
                .map((item) =>
                  item && typeof item === "object"
                    ? normalizePlan(item as Record<string, unknown>)
                    : null
                )
                .filter(Boolean) as ISubscriptionPlan[]
            );

            if (normalized.length === 0) {
              normalized = OFFLINE_FALLBACK_PLANS;
            }

            context.commit("SET_PLANS", normalized);
            resolve(normalized);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err),
              type: "error",
              duration: 5000,
            });
            console.warn("subscriptions fetch: ", err);
            context.commit("SET_PLANS", OFFLINE_FALLBACK_PLANS);
            resolve(OFFLINE_FALLBACK_PLANS);
          });
      });
    },

    createCheckoutLink(
      _context: unknown,
      subscriptionId: number
    ) {
      return new Promise<IOrderResponse | null>((resolve) => {
        axios
          .post(`subscriptions/${subscriptionId}/checkout-link`)
          .then((res) => {
            const data = res.data?.data;
            const checkout = normalizeCheckoutPayload(
              data && typeof data === "object"
                ? (data as Record<string, unknown>)
                : {}
            );
            if (!checkout) {
              notify({
                text: "לא התקבל קישור תשלום מהשרת",
                type: "error",
                duration: 5000,
              });
              resolve(null);
              return;
            }
            resolve(toIframeSession(checkout));
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err),
              type: "error",
              duration: 5000,
            });
            console.warn("checkout-link: ", err);
            resolve(null);
          });
      });
    },
  },

  modules: {},
};

export default SubscriptionsModule;
