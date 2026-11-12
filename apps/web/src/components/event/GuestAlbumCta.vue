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
  left: 16px;
  right: 16px;
  bottom: 16px;
  width: auto;
  max-width: calc(100vw - 32px);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(255, 252, 250, 0.96);
  color: var(--ink, #161310);
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.12);
  font-family: var(--font, Heebo, sans-serif);
}
.guest-cta p {
  margin: 0;
  flex: 1 1 auto;
  min-width: 0;
  font-weight: 800;
  color: inherit;
  line-height: 1.35;
}
.guest-cta-link {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  background: var(--rose, #dc5b66);
  color: #fff;
  font-weight: 800;
  text-decoration: none;
  border-radius: 999px;
  padding: 10px 18px;
  white-space: nowrap;
}
@media (max-width: 640px) {
  .guest-cta { bottom: 12px; }
}
</style>
