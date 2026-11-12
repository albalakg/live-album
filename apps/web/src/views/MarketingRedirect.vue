<template>
  <main class="sheet">
    <p class="kicker">SnapShare</p>
    <h1>מעבירים לאתר</h1>
    <p>עמוד הבית הוא אתר השיווק. אם ההעברה לא קרתה, <a :href="target">המשיכו לכאן</a>.</p>
  </main>
</template>

<script lang="ts">
import { marketingHref } from "@/helpers/marketingUrl";
import { defineComponent } from "vue";

function marketingUrl(): string {
  const url = new URL(marketingHref("/"), window.location.origin);
  url.hash = window.location.hash;
  url.search = window.location.search;
  return url.toString();
}

export default defineComponent({
  name: "MarketingRedirect",
  data() {
    return { target: marketingUrl() };
  },
  mounted() {
    window.location.replace(this.target);
  },
});
</script>

<style lang="scss" scoped>
.sheet {
  width: min(560px, calc(100% - 32px));
  margin: 48px auto;
  padding: 32px;
  background: #fffcfa;
  border-radius: 28px;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
}
.kicker { color: #dc5b66; font-weight: 800; }
h1 { font-weight: 900; margin: 8px 0; }
a { color: #161310; font-weight: 800; }
</style>
