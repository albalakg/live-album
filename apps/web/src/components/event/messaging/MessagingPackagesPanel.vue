<template>
  <div class="msg-grid">
    <div class="msg-grid cols-3">
      <article v-for="p in quota.pricing.packages" :key="p.id" class="gs-card msg-pkg-card" :class="{ current: p.id === quota.package.id && !quota.pro_addon }">
        <div class="msg-q-top"><span v-if="p.id === quota.package.id && !quota.pro_addon" class="b b-gold">החבילה שלכם</span></div>
        <h3>{{ p.label }}</h3>
        <strong>{{ p.per_guest }} <small style="font-size: 14px">הודעות לאורח</small></strong>
        <ul>
          <li>{{ p.max_guests ? `עד ${p.max_guests} אורחים` : "כל האורחים ברשימה" }}</li>
          <li>בוט אישור הגעה + שאלון מנות</li>
          <li>תור שליחה עם עריכה עד רגע השליחה</li>
        </ul>
      </article>
    </div>
    <div class="msg-grid cols-2">
      <article class="gs-card msg-pkg-card dark">
        <div class="msg-q-top"><span class="b b-gold">תוסף</span><span v-if="quota.pro_addon" class="b b-green">פעיל</span></div>
        <h3>{{ quota.pricing.pro_addon.label }} — מחזור מלא</h3>
        <strong>₪{{ quota.pricing.pro_addon.price }}</strong>
        <p style="margin: 0">{{ quota.pricing.pro_addon.per_guest }} הודעות לכל אורח: Save the Date, הזמנה, תזכורת, יום לפני, שולחן ביום האירוע ותודה.</p>
        <button class="gs-btn gs-btn-gold" type="button" :disabled="!quota.pricing.checkout_enabled || quota.pro_addon || busy" @click="$emit('buy', { product: 'wa_pro', quantity: 1 })">
          {{ quota.pro_addon ? "פעיל באירוע" : quota.pricing.checkout_enabled ? `לתשלום ₪${quota.pricing.pro_addon.price}` : "רכישה תיפתח בקרוב" }}
        </button>
      </article>
      <article class="gs-card msg-pkg-card">
        <div class="msg-q-top"><span class="b b-gold">תוספת</span><span v-if="quota.topups" class="b b-green">{{ quota.topups }} נרכשו</span></div>
        <h3>{{ quota.pricing.topup.label }}</h3>
        <strong>₪{{ quota.pricing.topup.price }}</strong>
        <p class="msg-muted" style="margin: 0">עוד {{ quota.pricing.topup.per_guest }} הודעות לכל אורח באירוע.</p>
        <div class="msg-row msg-buy-row">
          <label class="gs-sr" for="topup-qty">כמות תוספות</label>
          <select id="topup-qty" v-model.number="topupQty" class="gs-select msg-qty" :disabled="!quota.pricing.checkout_enabled || busy">
            <option v-for="n in 5" :key="n" :value="n">{{ n }} × (+{{ n * quota.pricing.topup.per_guest }} לאורח)</option>
          </select>
          <button class="gs-btn" type="button" :disabled="!quota.pricing.checkout_enabled || busy" @click="$emit('buy', { product: 'wa_topup', quantity: topupQty })">
            {{ quota.pricing.checkout_enabled ? `לתשלום ₪${quota.pricing.topup.price * topupQty}` : "רכישה תיפתח בקרוב" }}
          </button>
        </div>
      </article>
    </div>
    <p v-if="quota.pricing.checkout_enabled" class="msg-muted msg-pay-note">
      התשלום מאובטח בדף התשלום של SnapShare (PayPlus), כמו ברכישת חבילה. ההודעות מתווספות לאירוע מיד אחרי אישור התשלום.
      <template v-if="checkoutMock"><br /><b>סביבת בדיקה:</b> דף תשלום מדומה, בלי חיוב אמיתי.</template>
    </p>
    <div v-if="devTools" class="msg-dev">
      <b>מצב בדיקה מקומי:</b> הפעלת תוסף בלי תשלום (לא קיים בפרודקשן).
      <div class="msg-row" style="margin-top: 6px">
        <button class="gs-btn gs-btn-sm" type="button" @click="$emit('dev-entitlement', { pro_addon: !quota.pro_addon })">{{ quota.pro_addon ? "כיבוי Pro" : "הפעלת Pro" }}</button>
        <button class="gs-btn gs-btn-sm" type="button" @click="$emit('dev-entitlement', { topups: quota.topups + 1 })">+ תוספת</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { QuotaSummary } from "@/helpers/messaging/types";

export default defineComponent({
  name: "MessagingPackagesPanel",
  props: {
    quota: { type: Object as PropType<QuotaSummary>, required: true },
    devTools: { type: Boolean, default: false },
    checkoutMock: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
  },
  emits: ["buy", "dev-entitlement"],
  data() {
    return { topupQty: 1 };
  },
});
</script>
