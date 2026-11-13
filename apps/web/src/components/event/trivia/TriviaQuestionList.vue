<template>
  <section class="tb-q-list-panel" :class="{ 'mob-on': mobOn }">
    <button type="button" class="tb-template-banner" @click="$emit('open-templates')">
      <span class="ico" aria-hidden="true">✦</span>
      <div>
        <b>התחילו מתבנית</b>
        <span>חתונה, בר מצווה, יום הולדת ועוד — הכל ניתן לעריכה</span>
      </div>
    </button>

    <div class="tb-panel-h">
      <h2>שאלות</h2>
      <span class="tb-meta">{{ questions.length }}</span>
    </div>

    <div v-if="!questions.length" class="tb-empty">
      <h3>עדיין אין שאלות</h3>
      <p>בחרו תבנית או הוסיפו שאלה חדשה.</p>
    </div>

    <div
      v-else
      class="tb-q-list"
      @dragover.prevent
      @drop.prevent="onDropEnd"
    >
      <button
        v-for="(q, i) in questions"
        :key="q.key"
        type="button"
        class="tb-q-card"
        :data-type="q.type"
        :class="{ on: i === selectedIndex, dragging: dragIndex === i }"
        draggable="true"
        @click="$emit('select', i)"
        @dragstart="onDragStart(i, $event)"
        @dragover.prevent="onDragOver(i)"
        @dragend="onDragEnd"
      >
        <span class="handle" aria-hidden="true">⠿</span>
        <span class="tb-q-num">{{ i + 1 }}</span>
        <span class="q-info">
          <span class="tb-q-prompt">{{ q.prompt.trim() || "שאלה חדשה" }}</span>
          <span class="tb-type-chip">{{ typeLabel(q.type) }}</span>
        </span>
      </button>
    </div>

    <div class="tb-add-row">
      <button
        type="button"
        class="tb-btn-add"
        :disabled="locked || questions.length >= cap"
        @click="$emit('add')"
      >
        שאלה חדשה
      </button>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { TriviaBuilderQuestion } from "@/helpers/triviaBuilder";
import { triviaTypeLabel } from "@/helpers/triviaTypes";

export default defineComponent({
  name: "TriviaQuestionList",

  props: {
    questions: {
      type: Array as PropType<TriviaBuilderQuestion[]>,
      required: true,
    },
    selectedIndex: { type: Number, default: 0 },
    locked: { type: Boolean, default: false },
    cap: { type: Number, default: 40 },
    mobOn: { type: Boolean, default: false },
  },

  emits: ["select", "add", "reorder", "open-templates"],

  data() {
    return {
      dragIndex: null as number | null,
      overIndex: null as number | null,
    };
  },

  methods: {
    typeLabel(type: string) {
      return triviaTypeLabel(type);
    },

    onDragStart(index: number, event: DragEvent) {
      if (this.locked) {
        event.preventDefault();
        return;
      }
      this.dragIndex = index;
      event.dataTransfer?.setData("text/plain", String(index));
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    },

    onDragOver(index: number) {
      this.overIndex = index;
    },

    onDropEnd() {
      if (
        this.dragIndex === null ||
        this.overIndex === null ||
        this.dragIndex === this.overIndex
      ) {
        this.dragIndex = null;
        this.overIndex = null;
        return;
      }
      const from = this.dragIndex;
      const to = this.overIndex;
      this.dragIndex = null;
      this.overIndex = null;
      this.$emit("reorder", { from, to });
    },

    onDragEnd() {
      this.dragIndex = null;
      this.overIndex = null;
    },
  },
});
</script>
