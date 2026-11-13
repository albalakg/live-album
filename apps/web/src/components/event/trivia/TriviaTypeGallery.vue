<template>
  <teleport to="body">
    <div v-if="open" class="tb-backdrop" @click="$emit('close')"></div>
    <div v-if="open" class="tb-modal-wrap" role="presentation">
      <div
        class="tb-modal gallery"
        role="dialog"
        aria-modal="true"
        aria-label="בחירת סוג שאלה"
        @click.stop
      >
        <div class="tb-modal-head">
          <div>
            <h2>{{ mode === 'change' ? "שינוי סוג השאלה" : "הוספת שאלה" }}</h2>
            <p class="lede">בחרו סוג — אפשר לשנות אחר כך. סוגים עם «בקרוב» ייפתחו בהמשך.</p>
          </div>
          <button type="button" class="tb-modal-close" aria-label="סגירה" @click="$emit('close')">×</button>
        </div>

        <div
          v-for="group in groups"
          :key="group.id"
          class="tb-gal-group"
        >
          <h3>{{ group.label }}</h3>
          <div class="tb-gal-grid">
            <button
              v-for="item in typesFor(group.id)"
              :key="item.id"
              type="button"
              class="tb-gal-card"
              :class="{ soon: item.soon || !item.mvp }"
              :disabled="item.soon || !item.mvp"
              @click="pick(item.id)"
            >
              <span class="tb-gal-ico" :style="{ background: item.bg }">{{ item.ico }}</span>
              <h4>{{ item.label }}</h4>
              <p>{{ item.desc }}</p>
              <span class="tb-gal-mini" aria-hidden="true">
                <i></i><i></i><i></i><i></i>
              </span>
              <span v-if="item.soon || !item.mvp" class="tb-gal-soon">בקרוב</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  TRIVIA_TYPE_CATALOG,
  TRIVIA_TYPE_GROUPS,
  TriviaTypeGroupId,
} from "@/helpers/triviaTypes";

export default defineComponent({
  name: "TriviaTypeGallery",

  props: {
    open: { type: Boolean, default: false },
    mode: { type: String as () => "add" | "change", default: "add" },
  },

  emits: ["close", "pick"],

  computed: {
    groups() {
      return TRIVIA_TYPE_GROUPS;
    },
  },

  methods: {
    typesFor(groupId: TriviaTypeGroupId) {
      return TRIVIA_TYPE_CATALOG.filter((t) => t.group === groupId);
    },
    pick(id: string) {
      const meta = TRIVIA_TYPE_CATALOG.find((t) => t.id === id);
      if (!meta || meta.soon || !meta.mvp) return;
      this.$emit("pick", id);
    },
  },
});
</script>
