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

declare module "@snapshare/design/site" {
  export const SHOW_LAUNCH_SALE_STRIKETHROUGH: boolean;
  export const GA4_MEASUREMENT_ID: string;
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

declare module "@snapshare/design/analytics" {
  export function installAnalytics(options?: {
    ga4Id?: string;
    metaPixelId?: string;
  }): void;
}
