<template>
  <div class="mod-page">
    <header class="page-head">
      <div>
        <h1>בדיקת תוכן</h1>
        <p class="lede">
          תור ממתינות וחסומות. אפשר לאשר או להסתיר אחת־אחת, או לבחור כמה ולאשר בבת אחת.
        </p>
      </div>
    </header>
    <div v-if="$route.query.empty === '1'" class="empty-card">
      <h2>אין תמונות ממתינות</h2>
      <p>כשתופיע תמונה לבדיקה, היא תופיע כאן.</p>
    </div>
    <EventModerationSection v-else />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EventModerationSection from "@/components/event/EventModerationSection.vue";

export default defineComponent({
  name: "EventModerationView",
  components: { EventModerationSection },
  async created() {
    if (this.$route.name === "previewModeration") {
      await this.$store.dispatch("event/loadSampleAlbum", "owner");
      return;
    }
    if (!this.$store.getters["event/getEvent"]) return;
    await this.$store.dispatch("event/getEventAssets");
  },
});
</script>

<style lang="scss" scoped>
.page-head h1 {
  margin: 0;
  font-size: clamp(1.9rem, 3vw, 2.55rem);
  font-weight: 900;
  letter-spacing: -0.04em;
}
.lede {
  margin: 8px 0 0;
  color: #5e564e;
  max-width: 42em;
}
.empty-card {
  margin-top: 18px;
  background: #fff;
  border-radius: 26px;
  padding: 36px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
}
</style>
