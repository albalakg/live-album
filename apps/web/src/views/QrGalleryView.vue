<template>
  <main class="qr-page">
    <p class="kicker">כרטיסי QR</p>
    <h1>בחרו עיצוב לפי האירוע.</h1>
    <p class="lead">
      אחד-עשר העיצובים שכבר קיימים במוצר. הסינון לפי סוג אירוע וסגנון, והרשימה עצמה היא קובץ אחד — אפשר להוסיף אליו עיצובים בלי לגעת במסך.
    </p>
    <QrCardGallery />
    <p v-if="hasActiveEvent" class="hint">
      <router-link to="/event/qr">המשיכו לעריכת הכרטיס באירוע</router-link>
    </p>
  </main>
</template>

<script lang="ts">
import QrCardGallery from "@/components/event/QrCardGallery.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "QrGalleryView",
  components: { QrCardGallery },
  computed: {
    hasActiveEvent(): boolean {
      return Boolean(this.$store.getters["event/hasActiveEvent"]);
    },
  },
});
</script>

<style lang="scss" scoped>
.qr-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 20px 80px;
  font-family: var(--font, Heebo, sans-serif);
  color: var(--ink, #161310);
}
.kicker { color: var(--rose, #dc5b66); font-weight: 800; margin-bottom: 8px; }
h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 900; line-height: 1.15; }
.lead { color: var(--muted, #5e564e); max-width: 40rem; margin: 10px 0 22px; }
.hint { margin-top: 18px; }
.hint a { color: var(--espresso, #12100e); font-weight: 800; }
</style>
