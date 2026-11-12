<template>
  <aside class="guest-cta">
    <p>{{ label }}</p>
    <router-link class="guest-cta-link" :to="to">נסו בחינם</router-link>
  </aside>
</template>

<script lang="ts">
import { GUEST_CTA } from "@snapshare/design/site";
import { defineComponent } from "vue";

export default defineComponent({
  name: "GuestAlbumCta",
  computed: {
    label(): string {
      return GUEST_CTA.label;
    },
    to(): { path: string; query: Record<string, string> } {
      return { path: GUEST_CTA.path, query: { ...GUEST_CTA.query } };
    },
  },
});
</script>

<style lang="scss" scoped>
.guest-cta {
  position: fixed;
  z-index: 40;
  right: 16px;
  left: 16px;
  bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(255, 252, 250, 0.94);
  color: var(--ink, #161310);
  box-shadow: var(--shadow, 0 24px 60px rgba(18, 16, 14, 0.16));
  font-family: var(--font, Heebo, sans-serif);
}
.guest-cta p {
  margin: 0;
  font-weight: 800;
  color: inherit;
}
.guest-cta-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--rose, #dc5b66);
  color: #fff;
  font-weight: 800;
  text-decoration: none;
  border-radius: 999px;
  padding: 10px 18px;
}
@media (max-width: 640px) {
  .guest-cta { bottom: 12px; }
}
</style>
