<template>
  <main class="landing-state" dir="rtl">
    <p class="brand">SnapShare</p>
    <h1>לא הצלחנו לטעון את העמוד</h1>
    <p class="body">נראה שיש בעיית תקשורת. נסו שוב בעוד רגע.</p>
    <button type="button" class="retry" @click="$emit('retry')">נסו שוב</button>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "LandingErrorState",
  emits: ["retry"],
});
</script>

<style scoped>
.landing-state {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 32px 20px;
  background: linear-gradient(165deg, #f3eee6 0%, #e8e0d4 55%, #ddd3c4 100%);
  color: #2c241c;
  box-sizing: border-box;
}
.brand {
  margin: 0;
  font-family: Outfit, Heebo, sans-serif;
  font-weight: 800;
  letter-spacing: 0.04em;
  font-size: 0.95rem;
  opacity: 0.7;
}
h1 {
  margin: 0;
  font-family: "Frank Ruhl Libre", Heebo, serif;
  font-size: clamp(1.45rem, 4vw, 2rem);
  font-weight: 700;
  line-height: 1.25;
  max-width: 18ch;
}
.body {
  margin: 0;
  max-width: 34ch;
  font-family: Heebo, sans-serif;
  font-size: 1rem;
  line-height: 1.55;
  color: rgba(44, 36, 28, 0.78);
}
.retry {
  margin-top: 8px;
  border: 0;
  cursor: pointer;
  font-family: Heebo, sans-serif;
  font-weight: 700;
  font-size: 1rem;
  padding: 12px 22px;
  border-radius: 999px;
  background: #2c241c;
  color: #f7f1e8;
}
.retry:focus-visible {
  outline: 2px solid #2c241c;
  outline-offset: 3px;
}
</style>
