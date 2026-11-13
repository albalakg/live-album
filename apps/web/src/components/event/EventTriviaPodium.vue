<template>
  <div class="trivia-stage-host" ref="host" dir="rtl">
    <div class="stage-scale">
      <section
        class="stage"
        ref="stage"
        :data-theme="theme"
        data-phase="podium"
        data-type="choice"
      >
        <div class="stage-bg"></div>
        <div class="stage-fx" aria-hidden="true">
          <div class="confetti">
            <span
              v-for="piece in 22"
              :key="piece"
              :style="{
                left: `${(piece / 22) * 100}%`,
                animationDelay: `${piece * 0.16}s`,
                animationDuration: `${3 + (piece % 4)}s`,
              }"
            ></span>
          </div>
        </div>
        <div class="stage-ui">
          <header class="stage-top">
            <div class="stage-brand">
              <span class="logo-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="7.2" stroke="#C9A36A" stroke-width="1.8" />
                  <circle cx="12" cy="12" r="2.6" fill="#DC5B66" />
                  <path
                    d="M16.8 7.2l1.4-1.4"
                    stroke="#C9A36A"
                    stroke-width="1.6"
                    stroke-linecap="round"
                  />
                </svg>
              </span>
              SnapShare
            </div>
            <div class="stage-event">{{ eventLabel }}</div>
            <div class="stage-progress">התוצאות</div>
          </header>

          <div class="podium-wrap">
            <p class="eyebrow">התוצאות</p>
            <h2>{{ title }}</h2>
            <p v-if="prizeText" class="prize">{{ prizeText }}</p>
            <div v-if="ordered.length" class="podium">
              <article
                v-for="slot in ordered"
                :key="slot.rank"
                class="place"
                :class="`place-${slot.rank}`"
              >
                <div v-if="slot.rank === 1" class="crown" aria-hidden="true">👑</div>
                <i
                  class="av"
                  :style="avatarStyle(slot.nickname, slot.rank === 1 ? 112 : 96)"
                >{{ initial(slot.nickname) }}</i>
                <strong>{{ slot.nickname }}</strong>
                <span class="score">{{ formatScore(slot.score) }}</span>
                <em>{{ medal(slot.rank) }}</em>
              </article>
            </div>
            <p v-else class="prize">אף אחד לא הספיק לשחק</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import {
  TRIVIA_LETTER_COLORS,
  TriviaPlayerCard,
  TriviaScreenPayload,
} from "@/helpers/triviaTypes";

export default defineComponent({
  name: "EventTriviaPodium",

  props: {
    screen: {
      type: Object as PropType<TriviaScreenPayload>,
      required: true,
    },
    eventName: {
      type: String,
      default: "",
    },
  },

  data() {
    return {
      resizeObserver: null as ResizeObserver | null,
    };
  },

  computed: {
    theme(): string {
      const t = this.screen.theme || "elegant";
      return t === "neon" ? "neon" : "elegant";
    },

    title(): string {
      return this.screen.title || "טריוויה";
    },

    eventLabel(): string {
      return this.eventName || this.screen.event_name || this.title;
    },

    prizeText(): string {
      return this.screen.prize_text || "";
    },

    ordered(): TriviaPlayerCard[] {
      const top = this.screen.top || [];
      const second = top.find((p) => p.rank === 2);
      const first = top.find((p) => p.rank === 1);
      const third = top.find((p) => p.rank === 3);
      return [second, first, third].filter((p): p is TriviaPlayerCard => !!p);
    },
  },

  mounted() {
    this.applyScale();
    this.resizeObserver = new ResizeObserver(() => this.applyScale());
    if (this.$refs.host) {
      this.resizeObserver.observe(this.$refs.host as Element);
    }
    window.addEventListener("resize", this.applyScale);
  },

  beforeUnmount() {
    this.resizeObserver?.disconnect();
    window.removeEventListener("resize", this.applyScale);
  },

  methods: {
    applyScale() {
      const host = this.$refs.host as HTMLElement | undefined;
      const stage = this.$refs.stage as HTMLElement | undefined;
      if (!host || !stage) return;
      const s = Math.min(host.clientWidth / 1440, host.clientHeight / 810);
      stage.style.transform = `translate(-50%, -50%) scale(${s})`;
    },

    initial(name: string): string {
      return (name || "?").trim().charAt(0) || "?";
    },

    avatarStyle(name: string, size: number): Record<string, string> {
      const colors = [...TRIVIA_LETTER_COLORS];
      const code = (name || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const bg = colors[code % colors.length];
      return {
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.round(size * 0.4)}px`,
        background: bg,
        color: "#fff",
        borderColor: "transparent",
      };
    },

    formatScore(n: number): string {
      return Number(n || 0).toLocaleString("he-IL");
    },

    medal(rank: number): string {
      if (rank === 1) return "מקום ראשון";
      if (rank === 2) return "מקום שני";
      return "מקום שלישי";
    },
  },
});
</script>

<style lang="scss">
@import "@/styles/trivia-stage.scss";
</style>
