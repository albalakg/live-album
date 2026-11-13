<template>
  <a
    v-if="showWhatsapp"
    class="assist-fab assist-fab--wa"
    :href="href"
    target="_blank"
    rel="noopener"
    aria-label="וואטסאפ"
  >
    WhatsApp
  </a>
  <div v-else class="assist">
    <button class="assist-fab" type="button" :aria-expanded="open" @click="open = !open">
      צור קשר
    </button>
    <form v-if="open" class="assist-panel" @submit.prevent="submit">
      <p class="assist-title">כתבו לנו</p>
      <p><a :href="`mailto:${email}`">{{ email }}</a></p>
      <input v-model="form.full_name" required maxlength="100" placeholder="שם" />
      <input v-model="form.email" type="email" required placeholder="אימייל" />
      <textarea v-model="form.text" required maxlength="1000" rows="4" placeholder="הודעה"></textarea>
      <button class="assist-send" type="submit" :disabled="sending">{{ sending ? "שולחים…" : "שליחה" }}</button>
      <p class="assist-status" role="status">{{ status }}</p>
    </form>
  </div>
</template>

<script lang="ts">
import { sendContactMessage } from "@snapshare/design/contact";
import {
  BUSINESS_EMAIL_DEFAULT,
  isPaidPlan,
  whatsappHref,
  WHATSAPP_E164,
} from "@snapshare/design/site";
import { defineComponent } from "vue";

export default defineComponent({
  name: "HostAssist",
  data() {
    return {
      open: false,
      sending: false,
      status: "",
      form: { full_name: "", email: "", text: "" },
    };
  },
  computed: {
    email(): string {
      return process.env.VUE_APP_BUSINESS_EMAIL || BUSINESS_EMAIL_DEFAULT;
    },
    href(): string {
      return whatsappHref(process.env.VUE_APP_WHATSAPP_NUMBER || WHATSAPP_E164);
    },
    showWhatsapp(): boolean {
      const loggedIn = this.$store.getters["user/isLoggedIn"];
      if (!loggedIn) return false;
      const userPlan = this.$store.getters["user/getSubscriptionName"];
      const eventPlan = this.$store.getters["event/getEvent"]?.subscription_name;
      return isPaidPlan(userPlan) || isPaidPlan(eventPlan);
    },
  },
  methods: {
    async submit() {
      this.sending = true;
      this.status = "";
      const provider = process.env.VUE_APP_CONTACT_PROVIDER || "laravel";
      try {
        if (provider === "laravel" && !process.env.VUE_APP_CONTACT_ENDPOINT) {
          const ok = await this.$store.dispatch("contact/send", { ...this.form });
          this.status = ok ? "הפנייה נשלחה." : "השליחה לא הצליחה.";
          if (ok) this.form.text = "";
          return;
        }
        const result = await sendContactMessage(this.form, {
          provider,
          endpoint: process.env.VUE_APP_CONTACT_ENDPOINT || "",
          formspreeId: process.env.VUE_APP_FORMSPREE_ID || "",
          web3formsKey: process.env.VUE_APP_WEB3FORMS_ACCESS_KEY || "",
          businessEmail: this.email,
        });
        this.status = result.ok ? "הפנייה נשלחה." : "השליחה לא הצליחה.";
        if (result.ok) this.form.text = "";
      } catch (error) {
        this.status = `אפשר גם לכתוב אל ${this.email}`;
      } finally {
        this.sending = false;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.assist { position: fixed; z-index: 80; bottom: 22px; left: 22px; }
.assist-fab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1.5px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 999px;
  background: #fff;
  color: var(--ink, #161310);
  font-family: var(--font, Heebo, sans-serif);
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  padding: 14px 28px;
  text-decoration: none;
  cursor: pointer;
  box-shadow: var(--shadow-sm, 0 8px 24px rgba(18, 16, 14, 0.08));
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.assist-fab:hover {
  border-color: var(--ink, #161310);
  transform: translateY(-2px);
}
.assist-fab--wa {
  position: fixed;
  z-index: 80;
  bottom: 22px;
  left: 22px;
  background: #1fad4f;
  color: #fff;
  border-color: transparent;
}
.assist-panel {
  position: absolute;
  bottom: 58px;
  left: 0;
  width: min(320px, calc(100vw - 32px));
  background: var(--paper, #fff);
  color: var(--ink, #161310);
  border-radius: 18px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 24px 60px rgba(18, 16, 14, 0.16);
}
.assist-title { margin: 0; font-weight: 900; }
.assist-panel input, .assist-panel textarea {
  font: inherit;
  border: 1px solid rgba(22, 19, 16, 0.15);
  border-radius: 10px;
  padding: 8px 10px;
}
.assist-send {
  border: 0;
  border-radius: 999px;
  background: linear-gradient(
    135deg,
    var(--accent-2, #dc5b66),
    var(--accent, #c9a36a)
  );
  color: #fff;
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  padding: 14px 28px;
  cursor: pointer;
  box-shadow: 0 10px 28px var(--glow, rgba(201, 163, 106, 0.45));
  transition: transform 0.2s ease;
}

.assist-send:hover:not(:disabled) {
  transform: translateY(-2px);
}
.assist-status { min-height: 1.2em; color: var(--muted, #5e564e); font-size: 0.9rem; }
</style>
