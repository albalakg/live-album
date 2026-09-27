<template>
  <div class="not-found width--page-size margin--auto">
    <h1 class="title--large text--dark">העמוד לא נמצא</h1>
    <p class="text--dark">
      הכתובת שחיפשתם לא קיימת ב-SnapShare. אפשר לחזור לדף הבית ולבחור אלבום דיגיטלי לאירוע.
    </p>
    <router-link to="/">
      <MainButton animation text="חזרה לדף הבית" />
    </router-link>
  </div>
</template>

<script lang="ts">
import MainButton from "@/components/library/buttons/MainButton.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "NotFoundView",

  components: {
    MainButton,
  },
});
</script>

<style lang="scss" scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 16px;
  padding: 48px 16px 80px;

  p {
    max-width: 36rem;
    font-size: 1.15rem;
    line-height: 1.6;
  }
}
</style>
