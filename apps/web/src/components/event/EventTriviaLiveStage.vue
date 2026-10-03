<template>
  <section class="trivia-live">
    <div class="trivia-live-copy">
      <p class="eyebrow">עכשיו על המסך</p>
      <h2>{{ title }}</h2>
      <p class="players">{{ playerCount }} משחקים עכשיו</p>
      <ol v-if="top.length" class="board">
        <li v-for="player in top" :key="player.rank" :class="`rank-${player.rank}`">
          <span class="rank">{{ player.rank }}</span>
          <img v-if="player.avatar_url" :src="player.avatar_url" alt="" />
          <span v-else class="avatar-fallback">{{ initial(player.nickname) }}</span>
          <span class="name">{{ player.nickname }}</span>
          <strong>{{ player.score }}</strong>
        </li>
      </ol>
      <p v-else class="waiting">מחכים לשחקנים הראשונים</p>
    </div>
    <div class="join-card">
      <p>סרקו והצטרפו</p>
      <qrcode-vue :value="joinUrl" :size="168" level="M" render-as="svg" />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import QrcodeVue from "qrcode.vue";

interface TriviaPlayerCard {
  rank: number;
  nickname: string;
  avatar_url?: string | null;
  score: number;
}

interface TriviaScreen {
  phase: string;
  title?: string | null;
  player_count?: number;
  join_path?: string;
  top?: TriviaPlayerCard[];
}

export default defineComponent({
  name: "EventTriviaLiveStage",

  components: { QrcodeVue },

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

    playerCount(): number {
      return this.screen.player_count || 0;
    },

    top(): TriviaPlayerCard[] {
      return this.screen.top || [];
    },

    joinUrl(): string {
      return window.location.origin + (this.screen.join_path || "");
    },
  },

  methods: {
    initial(name: string): string {
      return (name || "?").trim().charAt(0);
    },
  },
});
</script>

<style lang="scss" scoped>
.trivia-live {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  padding: 8vh 7vw;
  box-sizing: border-box;
  background:
    radial-gradient(circle at 15% 20%, rgba(246, 133, 137, 0.35), transparent 42%),
    radial-gradient(circle at 80% 80%, rgba(121, 174, 96, 0.22), transparent 36%),
    #1b191b;
  color: #fff;
}

.eyebrow {
  letter-spacing: 0.08em;
  color: var(--lightPink);
  margin-bottom: 8px;
}

h2 {
  font-size: clamp(42px, 6vw, 84px);
  line-height: 1;
  color: #fff;
  font-weight: 700;
}

.players {
  margin: 16px 0 28px;
  color: #f3e8e8;
  font-size: 22px;
}

.board {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: min(560px, 70vw);
}

.board li {
  display: grid;
  grid-template-columns: 52px 56px 1fr auto;
  gap: 14px;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 12px 16px;
}

.rank-1 {
  background: rgba(246, 133, 137, 0.22);
}

.rank {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

img,
.avatar-fallback {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-fallback {
  display: grid;
  place-items: center;
  background: #fff;
  color: var(--dark);
  font-weight: 700;
}

.name,
.board strong,
.waiting,
.join-card p {
  color: #fff;
}

.name {
  font-size: 26px;
  font-weight: 600;
}

.board strong {
  font-size: 28px;
}

.join-card {
  background: #fff;
  color: var(--dark);
  border-radius: 28px;
  padding: 28px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
}

.join-card p {
  color: var(--dark);
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 16px;
}

@media (max-width: 800px) {
  .trivia-live {
    flex-direction: column;
    justify-content: center;
    padding: 24px;
  }
}
</style>
