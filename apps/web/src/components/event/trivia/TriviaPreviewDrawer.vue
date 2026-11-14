<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="tb-preview-backdrop"
      @click="close"
    ></div>
    <div
      v-if="open"
      class="tb-preview-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="תצוגה חיה"
    >
      <div class="tb-drawer-handle"></div>
      <div class="tb-drawer-h">
        <h2>תצוגה חיה</h2>
        <div class="tb-phase-bar">
          <button
            v-for="p in phases"
            :key="p.id"
            type="button"
            :class="{ on: phase === p.id }"
            @click="$emit('phase', p.id)"
          >{{ p.label }}</button>
        </div>
        <div class="tb-theme-mini">
          <button
            v-for="t in themeSwatches"
            :key="t.id"
            type="button"
            :class="{ on: theme === t.id }"
            :style="{ '--sw': t.sw, '--sw2': t.sw2 }"
            :title="t.name"
            :aria-label="t.name"
            @click="$emit('theme', t.id)"
          ></button>
        </div>
        <button type="button" class="tb-btn tb-btn-ghost" @click="close">סגירה</button>
      </div>
      <div class="tb-preview-body">
        <div class="tb-tv-wrap">
          <div class="tb-tv-inner">
            <EventTriviaPodium
              v-if="phase === 'podium' && screen"
              :screen="screen"
              :event-name="eventName"
            />
            <EventTriviaLiveStage
              v-else-if="screen"
              :screen="screen"
              :event-name="eventName"
            />
          </div>
        </div>
        <div class="tb-phone-scale" aria-hidden="true">
          <div class="ph-meta">{{ phoneMeta }}</div>
          <div class="ph-title">{{ phoneTitle }}</div>
          <div
            v-for="(opt, i) in phoneOptions"
            :key="i"
            class="ph-opt"
          >{{ opt }}</div>
          <div v-if="!phoneOptions.length" class="ph-opt">מסתכלים על המסך</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import EventTriviaLiveStage from "@/components/event/EventTriviaLiveStage.vue";
import EventTriviaPodium from "@/components/event/EventTriviaPodium.vue";
import { TRIVIA_THEMES, TriviaScreenPayload } from "@/helpers/triviaTypes";

export default defineComponent({
  name: "TriviaPreviewDrawer",

  components: { EventTriviaLiveStage, EventTriviaPodium },

  props: {
    open: { type: Boolean, default: false },
    screen: {
      type: Object as PropType<TriviaScreenPayload | null>,
      default: null,
    },
    phase: { type: String, default: "lobby" },
    theme: { type: String, default: "elegant" },
    eventName: { type: String, default: "" },
  },

  emits: ["close", "phase", "theme"],

  data() {
    return {
      scrollLocked: false,
      prevBodyOverflow: "",
    };
  },

  computed: {
    phases() {
      return [
        { id: "lobby", label: "הצטרפות" },
        { id: "question", label: "שאלה" },
        { id: "reveal", label: "חשיפה" },
        { id: "leaderboard", label: "ניקוד" },
        { id: "podium", label: "פודיום" },
      ];
    },
    themeSwatches() {
      return TRIVIA_THEMES.filter((t) => t.mvp);
    },
    phoneMeta(): string {
      if (this.phase === "lobby") return "הצטרפות";
      if (this.phase === "reveal") return "חשיפה על המסך";
      if (this.phase === "leaderboard" || this.phase === "podium") return "תוצאות";
      return "שאלה";
    },
    phoneTitle(): string {
      if (this.phase === "lobby") return "יאללה, מתחילים";
      if (this.phase === "reveal") return "מסתכלים על המסך";
      return this.screen?.question?.prompt || "שאלה";
    },
    phoneOptions(): string[] {
      if (this.phase !== "question") return [];
      return (this.screen?.question?.options || [])
        .slice(0, 4)
        .map((o) => o.label)
        .filter(Boolean);
    },
  },

  watch: {
    open: {
      immediate: true,
      handler(isOpen: boolean) {
        if (isOpen) this.lockBody();
        else this.unlockBody();
      },
    },
  },

  beforeUnmount() {
    this.unlockBody();
  },

  methods: {
    close() {
      this.$emit("close");
    },
    onKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") this.close();
    },
    lockBody() {
      if (this.scrollLocked || typeof document === "undefined") return;
      this.prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      this.scrollLocked = true;
      window.addEventListener("keydown", this.onKeydown);
    },
    unlockBody() {
      if (!this.scrollLocked || typeof document === "undefined") return;
      document.body.style.overflow = this.prevBodyOverflow;
      this.scrollLocked = false;
      window.removeEventListener("keydown", this.onKeydown);
    },
  },
});
</script>

<style scoped>
.tb-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 10px 18px;
  font-weight: 800;
  font-size: 0.92rem;
  white-space: nowrap;
  cursor: pointer;
  border: 0;
  font-family: inherit;
}
.tb-btn-ghost {
  background: #fff;
  color: #161310;
  border: 1.5px solid rgba(22, 19, 16, 0.11);
}
</style>
