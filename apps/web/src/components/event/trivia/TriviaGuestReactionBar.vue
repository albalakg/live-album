<template>
  <div class="grb" dir="rtl" role="group" aria-label="תגובות למסך הגדול" data-testid="trivia-reaction-bar">
    <p v-if="note" class="grb-note" role="status">{{ note }}</p>
    <div class="grb-row">
      <button
        v-for="r in reactions"
        :key="r.kind"
        type="button"
        class="grb-btn"
        :class="{ chip: r.chip, pop: popKind === r.kind }"
        :aria-label="r.label"
        :data-kind="r.kind"
        :disabled="cooling"
        @click="send(r.kind)"
      >
        <span aria-hidden="true">{{ r.emoji }}</span>
        <b v-if="r.chip">{{ r.label }}</b>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent } from "vue";
import { TRIVIA_REACTIONS, triviaErrorReason } from "@/helpers/triviaModeration";

/** Matches the server limit (5 per 10 s): keep taps from piling up 429s. */
const MIN_GAP_MS = 900;
const COOL_DOWN_MS = 3000;

export default defineComponent({
  name: "TriviaGuestReactionBar",

  props: {
    eventPath: { type: String, required: true },
    sessionToken: { type: String, required: true },
  },

  emits: ["removed", "disabled"],

  data() {
    return {
      reactions: TRIVIA_REACTIONS,
      popKind: "" as string,
      cooling: false,
      lastSent: 0,
      note: "",
      timers: [] as ReturnType<typeof setTimeout>[],
    };
  },

  beforeUnmount() {
    this.timers.forEach((t) => clearTimeout(t));
  },

  methods: {
    later(fn: () => void, ms: number) {
      this.timers.push(setTimeout(fn, ms));
    },

    async send(kind: string) {
      const now = Date.now();
      if (this.cooling || now - this.lastSent < MIN_GAP_MS) return;
      this.lastSent = now;
      this.popKind = kind;
      this.later(() => {
        if (this.popKind === kind) this.popKind = "";
      }, 450);
      try {
        await axios.post(
          `events/${this.eventPath}/trivia/react`,
          { kind },
          { headers: { "X-Trivia-Session": this.sessionToken } }
        );
        this.note = "";
      } catch (error) {
        const reason = triviaErrorReason(error);
        const status = (error as any)?.response?.status;
        if (reason === "removed") {
          this.$emit("removed");
          return;
        }
        if (reason === "reactions_off") {
          this.$emit("disabled");
          return;
        }
        if (status === 429 || reason === "rate_limited") {
          this.cooling = true;
          this.note = "רגע, לאט לאט 🙂";
          this.later(() => {
            this.cooling = false;
            this.note = "";
          }, COOL_DOWN_MS);
        }
      }
    },
  },
});
</script>

<style scoped>
.grb {
  position: sticky;
  bottom: 0;
  margin-top: 18px;
  padding: 10px 0 calc(10px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, var(--g-bg, #f3eee6) 70%, transparent);
}
.grb-note {
  margin: 0 0 6px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--g-muted, #5e564e);
}
.grb-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}
.grb-btn {
  min-width: 52px;
  height: 52px;
  border-radius: 999px;
  border: 1.5px solid var(--g-line, rgba(22, 19, 16, 0.12));
  background: var(--g-paper, #fff);
  color: var(--g-ink, #161310);
  font-size: 1.55rem;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 12px;
  cursor: pointer;
  transition: transform 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}
.grb-btn.chip {
  font-size: 1.1rem;
  background: linear-gradient(135deg, var(--g-gold, #c9a36a), var(--g-rose, #dc5b66));
  border-color: transparent;
  color: #fff;
}
.grb-btn.chip b {
  font-size: 0.95rem;
  font-weight: 800;
}
.grb-btn:active,
.grb-btn.pop {
  transform: scale(1.18);
}
.grb-btn:disabled {
  opacity: 0.5;
}
</style>
