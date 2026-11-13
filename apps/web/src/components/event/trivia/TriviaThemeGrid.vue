<template>
  <div class="tb-theme-tab">
    <p class="tb-lede">
      כל עיצוב הוא מסך שונה לגמרי: טיפוגרפיה, תנועה, טיימר וחשיפה. בחרו אחד — הוא חל על כל המשחק.
    </p>
    <div class="tb-theme-grid">
      <button
        v-for="t in themes"
        :key="t.id"
        type="button"
        class="tb-theme-card"
        :class="{ on: theme === t.id, soon: !t.mvp }"
        :disabled="!t.mvp"
        @click="t.mvp && $emit('select', t.id)"
      >
        <div class="tb-theme-thumb">
          <div
            class="swatch"
            :style="{ '--sw1': t.sw, '--sw2': t.sw2 }"
          ></div>
          <span v-if="!t.mvp" class="soon-badge">בקרוב</span>
        </div>
        <figcaption>
          <h3>{{ t.name }}</h3>
          <p>{{ t.for }}</p>
        </figcaption>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { TRIVIA_THEMES } from "@/helpers/triviaTypes";

export default defineComponent({
  name: "TriviaThemeGrid",

  props: {
    theme: { type: String, default: "elegant" },
  },

  emits: ["select"],

  computed: {
    themes() {
      return TRIVIA_THEMES;
    },
  },
});
</script>
