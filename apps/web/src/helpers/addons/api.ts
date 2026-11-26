import axios from "axios";

type Envelope<T> = { data: T };
const unwrap = <T>(res: { data: Envelope<T> }): T => res.data.data;

export type AddonProductKey = "wa_pro" | "wa_topup" | "seating_addon" | "seating_ai_topup";
export type AddonStatus = "pending" | "in_progress" | "paid" | "failed" | "cancelled";

export interface AddonProduct {
  key: AddonProductKey;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  max_quantity: number;
  feature: "whatsapp" | "seating" | null;
  runs: number | null;
  owned: boolean;
  available: boolean;
}

export interface AddonPurchase {
  uid: string;
  event_id: number;
  product: AddonProductKey;
  title: string;
  quantity: number;
  unit_price: number;
  amount: number;
  currency: string;
  status: AddonStatus;
  provider: "payplus" | "mock";
  credited: boolean;
  paid_at: string | null;
  created_at: string | null;
}

export interface AddonCatalog {
  enabled: boolean;
  driver: "payplus" | "mock";
  is_mock: boolean;
  products: AddonProduct[];
  whatsapp: { pro_addon: boolean; topups: number };
  seating: { unlocked: boolean; ai_extra_runs: number; paywall: boolean };
  purchases: AddonPurchase[];
}

export const addonsApi = {
  catalog: (eventId: number) => axios.get(`events/${eventId}/addons`).then((r) => unwrap<AddonCatalog>(r)),
  checkout: (eventId: number, product: AddonProductKey, quantity = 1) =>
    axios.post(`events/${eventId}/addons/checkout`, { product, quantity }).then((r) => unwrap<{ purchase: AddonPurchase; payment_page_link: string }>(r)),
  purchase: (uid: string) => axios.get(`store/addons/${uid}`).then((r) => unwrap<AddonPurchase>(r)),
  devComplete: (eventId: number, uid: string, outcome: "success" | "failure" | "cancel") =>
    axios.post(`events/${eventId}/addons/purchases/${uid}/dev-complete`, { outcome }).then((r) => unwrap<AddonPurchase>(r)),
};

const RETURN_KEY = "snapshare.addon_return";

/** Opens the hosted payment page (PayPlus, or the local mock checkout). The return page sends the host back here. */
export async function startAddonCheckout(eventId: number, product: AddonProductKey, quantity = 1): Promise<void> {
  const res = await addonsApi.checkout(eventId, product, quantity);
  try {
    window.sessionStorage.setItem(RETURN_KEY, window.location.pathname + window.location.search);
  } catch (e) {
    /* storage unavailable: the return page falls back to the dashboard */
  }
  window.location.assign(res.payment_page_link);
}

export function addonReturnPath(fallback: string): string {
  try {
    const p = window.sessionStorage.getItem(RETURN_KEY);
    if (p && p.startsWith("/") && !p.startsWith("//")) return p;
  } catch (e) {
    /* ignore */
  }
  return fallback;
}

export const ADDON_STATUS_LABEL: Record<AddonStatus, string> = {
  pending: "ממתין לתשלום",
  in_progress: "ממתין לאישור התשלום",
  paid: "שולם",
  failed: "התשלום נכשל",
  cancelled: "בוטל",
};
