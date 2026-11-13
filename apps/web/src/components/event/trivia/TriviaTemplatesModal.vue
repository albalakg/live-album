<template>
  <teleport to="body">
    <div v-if="open" class="tb-backdrop" @click="$emit('close')"></div>
    <div v-if="open" class="tb-modal-wrap" role="presentation">
      <div
        class="tb-modal templates"
        role="dialog"
        aria-modal="true"
        aria-label="תבניות"
        @click.stop
      >
        <div class="tb-modal-head">
          <div>
            <h2>התחילו מתבנית</h2>
            <p class="lede">
              שאלות בעברית, ניתנות לעריכה מלאה. אם כבר יש שאלות — נבקש אישור לפני החלפה.
            </p>
          </div>
          <button type="button" class="tb-modal-close" aria-label="סגירה" @click="$emit('close')">×</button>
        </div>

        <div class="tb-tpl-grid">
          <button
            v-for="tpl in templates"
            :key="tpl.id"
            type="button"
            class="tb-tpl"
            :disabled="busy"
            @click="$emit('apply', tpl.id)"
          >
            <h3>{{ tpl.title }}</h3>
            <p>{{ tpl.description }}</p>
            <span class="n">{{ tpl.questions.length }} שאלות</span>
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { TRIVIA_TEMPLATES } from "@/helpers/triviaTemplates";

export default defineComponent({
  name: "TriviaTemplatesModal",

  props: {
    open: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
  },

  emits: ["close", "apply"],

  computed: {
    templates() {
      return TRIVIA_TEMPLATES;
    },
  },
});
</script>
