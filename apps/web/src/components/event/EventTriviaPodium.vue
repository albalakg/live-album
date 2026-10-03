<template>
  <section class="podium-stage">
    <p class="eyebrow">התוצאות</p>
    <h2>{{ title }}</h2>
    <div v-if="ordered.length" class="podium" dir="ltr">
      <article
        v-for="player in ordered"
        :key="player.rank"
        class="place"
        :class="`place-${player.rank}`"
      >
        <img v-if="player.avatar_url" :src="player.avatar_url" alt="" />
        <span v-else class="avatar-fallback">{{ initial(player.nickname) }}</span>
        <strong>{{ player.nickname }}</strong>
        <span class="score">{{ player.score }}</span>
        <em>{{ medal(player.rank) }}</em>
      </article>
    </div>
    <p v-else class="empty">אף אחד לא הספיק לשחק</p>
      <div class="confetti" aria-hidden="true">
      <span
        v-for="piece in 18"
        :key="piece"
        :style="{ left: `${(piece / 19) * 100}%`, animationDelay: `${piece * 0.18}s`, animationDuration: `${3 + (piece % 4)}s` }"
      ></span>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

interface TriviaPlayerCard {
  rank: number;
  nickname: string;
  avatar_url?: string | null;
  score: number;
}

interface TriviaScreen {
  title?: string | null;
  top?: TriviaPlayerCard[];
}

export default defineComponent({
  name: "EventTriviaPodium",

  props: {
    screen: {
      type: Object as PropType<TriviaScreen>,
      required: true,
    },
  },

  computed: {
    title(): string {
      return this.screen.title || "טריוויה";
    },

    ordered(): TriviaPlayerCard[] {
      const top = this.screen.top || [];
      const second = top.find((player) => player.rank === 2);
      const first = top.find((player) => player.rank === 1);
      const third = top.find((player) => player.rank === 3);
      return [second, first, third].filter((player): player is TriviaPlayerCard => !!player);
    },
  },

  methods: {
    initial(name: string): string {
      return (name || "?").trim().charAt(0);
    },

    medal(rank: number): string {
      if (rank === 1) return "מקום ראשון";
      if (rank === 2) return "מקום שני";
      return "מקום שלישי";
    },
  },
});
</script>

<style lang="scss" scoped>
.podium-stage {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 50% 0%, rgba(246, 133, 137, 0.45), transparent 46%),
    #171517;
  text-align: center;
  padding: 40px 20px 60px;
  box-sizing: border-box;
}

.eyebrow,
h2,
.empty {
  color: #fff;
  position: relative;
  z-index: 1;
}

.eyebrow {
  letter-spacing: 0.12em;
  color: var(--lightPink);
}

h2 {
  font-size: clamp(40px, 5vw, 72px);
  margin: 8px 0 36px;
  font-weight: 700;
}

.podium {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 18px;
}

.place {
  width: min(220px, 28vw);
  background: #fff;
  border-radius: 24px 24px 12px 12px;
  padding: 22px 16px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.place-1 {
  min-height: 340px;
  transform: translateY(-24px);
}

.place-2,
.place-3 {
  min-height: 270px;
}

img,
.avatar-fallback {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-fallback {
  display: grid;
  place-items: center;
  background: var(--gray);
  font-size: 32px;
  font-weight: 700;
}

.place strong {
  font-size: 22px;
}

.score {
  font-size: 28px;
  font-weight: 700;
  color: var(--pink);
}

em {
  font-style: normal;
  color: var(--dark-gray);
}

.confetti span {
  position: absolute;
  top: -10px;
  width: 8px;
  height: 14px;
  border-radius: 2px;
  animation: fall 4.5s linear infinite;
  background: var(--pink);
}

.confetti span:nth-child(3n) {
  background: var(--green);
}

.confetti span:nth-child(3n + 1) {
  background: #f6d36b;
}

@keyframes fall {
  to {
    transform: translateY(110vh) rotate(180deg);
  }
}
</style>
