/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@vuepic/vue-datepicker';
declare module '@kyvg/vue3-notification';
declare module 'qrcode.vue';
declare module 'html2canvas';

declare module "*.css";

declare module "@snapshare/design/contact" {
  export function sendContactMessage(
    fields: { email?: string; full_name?: string; text?: string },
    options?: {
      provider?: string;
      endpoint?: string;
      formspreeId?: string;
      web3formsKey?: string;
      businessEmail?: string;
    }
  ): Promise<{ ok: boolean; via: string }>;
}

declare module "@snapshare/design/site" {
  export const SHOW_LAUNCH_SALE_STRIKETHROUGH: boolean;
  export const GA4_MEASUREMENT_ID: string;
  export const BUSINESS_EMAIL_DEFAULT: string;
  export const WHATSAPP_E164: string;
  export const PRICES: {
    trial: number;
    classic: number;
    premium: number;
    currency: string;
  };
  export type PlanFact = {
    slug: string;
    nameHe: string;
    nameApi: string;
    price: number;
    priceLabel: string | null;
    priceSub: string;
    features: string[];
    cta: string;
    featured: boolean;
    badge?: string;
    files_allowed: number;
    storage_hours: number;
  };
  export const PLAN_FACTS: PlanFact[];
  export function planFactBySlug(slug?: string | null): PlanFact | null;
  export function whatsappHref(number?: string): string;
  export function isPaidPlan(name?: string | null): boolean;
  export const GUEST_CTA: {
    label: string;
    path: string;
    query: {
      utm_source: string;
      utm_medium: string;
      utm_campaign: string;
    };
  };
}

declare module "@snapshare/design/reveal" {
  export function installReveal(): void;
}

declare module "@snapshare/design/analytics" {
  export function installAnalytics(options?: {
    ga4Id?: string;
    metaPixelId?: string;
  }): void;
}
