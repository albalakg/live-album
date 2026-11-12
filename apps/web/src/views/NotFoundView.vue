<template>
  <main class="sheet">
    <p class="kicker">SnapShare</p>
    <h1>העמוד לא נמצא</h1>
    <p>הקישור לא מוביל לעמוד באפליקציה.</p>
    <p><a href="/">חזרה לאתר</a></p>
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({ name: "NotFoundView" });
</script>

<style lang="scss" scoped>
.sheet {
  width: min(560px, calc(100% - 32px));
  margin: 48px auto;
  padding: 32px;
  background: #fffcfa;
  border-radius: 28px;
}
.kicker { color: #dc5b66; font-weight: 800; }
h1 { font-weight: 900; }
a { color: #161310; font-weight: 800; }
</style>
