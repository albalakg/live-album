<template>
  <main class="landing-state" dir="rtl">
    <p class="brand">SnapShare</p>
    <h1>{{ title }}</h1>
    <p class="body">{{ body }}</p>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "LandingNotFoundState",
  props: {
    title: {
      type: String,
      default: "העמוד לא נמצא או שעדיין לא פורסם",
    },
    body: {
      type: String,
      default: "בדקו את הקישור או פנו למארחי האירוע.",
    },
  },
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
  background: linear-gradient(165deg, #f6f1e8 0%, #ebe4d8 48%, #e2d8c8 100%);
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
  font-size: clamp(1.55rem, 4vw, 2.1rem);
  font-weight: 700;
  line-height: 1.25;
  max-width: 18ch;
}
.body {
  margin: 0;
  max-width: 32ch;
  font-family: Heebo, sans-serif;
  font-size: 1rem;
  line-height: 1.55;
  color: rgba(44, 36, 28, 0.78);
}
</style>
