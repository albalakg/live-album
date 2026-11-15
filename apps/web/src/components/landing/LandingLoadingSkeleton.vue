<template>
  <div class="landing-skeleton" dir="rtl" aria-busy="true" aria-live="polite">
    <p class="sr-only">טוען את עמוד האירוע…</p>
    <div class="sk-nav" />
    <div class="sk-hero">
      <div class="sk-card">
        <div class="sk-line sk-kicker" />
        <div class="sk-line sk-title" />
        <div class="sk-line sk-sub" />
      </div>
      <div class="sk-aside">
        <div class="sk-count" />
        <div class="sk-btn" />
      </div>
    </div>
    <div class="sk-block" />
    <div class="sk-block sk-short" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "LandingLoadingSkeleton",
});
</script>

<style scoped>
.landing-skeleton {
  min-height: 100vh;
  background: linear-gradient(180deg, #f3f0ea 0%, #ebe6de 100%);
  color: #3a342c;
  padding-bottom: 48px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
.sk-nav {
  height: 56px;
  background: rgba(255, 255, 255, 0.55);
  border-bottom: 1px solid rgba(58, 52, 44, 0.08);
}
.sk-hero {
  display: grid;
  gap: 24px;
  padding: 28px 18px 36px;
  max-width: 960px;
  margin: 0 auto;
}
.sk-card,
.sk-aside,
.sk-block,
.sk-line,
.sk-count,
.sk-btn {
  background: linear-gradient(90deg, #e4dfd6 25%, #efeae2 50%, #e4dfd6 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
  border-radius: 16px;
}
.sk-card {
  min-height: 220px;
  padding: 28px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.sk-line {
  height: 14px;
  border-radius: 8px;
  animation: none;
  background: rgba(58, 52, 44, 0.1);
}
.sk-kicker { width: 36%; }
.sk-title { width: 72%; height: 28px; }
.sk-sub { width: 54%; }
.sk-aside { min-height: 140px; padding: 18px; display: flex; flex-direction: column; gap: 14px; }
.sk-count { height: 72px; border-radius: 12px; animation: none; background: rgba(58, 52, 44, 0.08); }
.sk-btn { height: 44px; width: 55%; border-radius: 999px; animation: none; background: rgba(58, 52, 44, 0.12); }
.sk-block {
  max-width: 960px;
  margin: 18px auto;
  height: 160px;
  width: calc(100% - 36px);
}
.sk-short { height: 96px; opacity: 0.85; }
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@media (min-width: 720px) {
  .sk-hero {
    grid-template-columns: 1.2fr 0.8fr;
    align-items: stretch;
    padding: 40px 24px;
  }
}
</style>
