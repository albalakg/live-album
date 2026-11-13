<template>
  <div class="tb-results-tab">
    <div class="tb-stats">
      <div class="tb-stat">
        <span>שחקנים</span>
        <strong>{{ report?.summary?.player_count ?? 0 }}</strong>
      </div>
      <div class="tb-stat">
        <span>ממוצע נקודות</span>
        <strong>{{ formatScore(report?.summary?.average_score) }}</strong>
      </div>
      <div class="tb-stat">
        <span>דיוק ממוצע</span>
        <strong>{{ accuracyLabel(report?.summary?.average_accuracy) }}</strong>
      </div>
      <div class="tb-stat">
        <span>השאלה הקשה</span>
        <strong>{{ hardestPrompt }}</strong>
      </div>
    </div>

    <div class="tb-results-panel">
      <div class="tb-panel-h" style="padding-inline: 0">
        <h2>טבלת ניקוד</h2>
        <button type="button" class="tb-linkish" :disabled="refreshing" @click="$emit('refresh')">
          {{ refreshing ? "מרענן..." : "רענון" }}
        </button>
      </div>

      <div v-if="report && report.players?.length" style="overflow: auto">
        <table class="tb-res-table">
          <thead>
            <tr>
              <th>#</th>
              <th>שחקן</th>
              <th>קבוצה</th>
              <th>ניקוד</th>
              <th>נכונות</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in report.players" :key="player.id">
              <td>
                <span class="tb-rk" :class="'r' + player.rank">{{ player.rank }}</span>
              </td>
              <td>
                <div class="tb-player-c">
                  <img v-if="player.avatar_url" class="tb-av" :src="player.avatar_url" alt="" />
                  <span v-else class="tb-av">{{ (player.nickname || "?").slice(0, 1) }}</span>
                  {{ player.nickname }}
                </div>
              </td>
              <td>{{ teamLabel(player.team) }}</td>
              <td>{{ formatScore(player.score) }}</td>
              <td>{{ player.correct_count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="tb-empty">
        <h3>עדיין אין תוצאות</h3>
        <p>ברגע שאורחים יצטרפו ויענו, הניקוד יופיע כאן.</p>
      </div>
    </div>

    <div v-if="report?.questions?.length" class="tb-results-panel" style="margin-top: 24px">
      <h2 style="font-size: 1.15rem; font-weight: 900; margin: 8px 0 16px">קושי השאלות</h2>
      <div v-for="q in report.questions" :key="q.id" style="margin-bottom: 14px">
        <div style="display: flex; justify-content: space-between; gap: 12px; font-weight: 750; margin-bottom: 6px">
          <span>{{ q.prompt }}</span>
          <strong>{{ q.accuracy === null ? "אין תשובות" : accuracyLabel(q.accuracy) }}</strong>
        </div>
        <div style="height: 8px; border-radius: 999px; background: #f3eee6; overflow: hidden">
          <span
            :style="{
              display: 'block',
              height: '100%',
              width: barWidth(q.accuracy),
              background: barColor(q.accuracy),
              borderRadius: '999px',
            }"
          ></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

interface ReportSummary {
  player_count: number;
  average_score: number;
  average_accuracy: number | null;
}

interface ReportPlayer {
  id: number;
  rank: number;
  nickname: string;
  avatar_url?: string | null;
  team?: string | null;
  score: number;
  correct_count: number;
}

interface ReportQuestion {
  id: number;
  prompt: string;
  accuracy: number | null;
  type?: string;
}

export interface TriviaReportData {
  summary: ReportSummary;
  players: ReportPlayer[];
  questions: ReportQuestion[];
}

export default defineComponent({
  name: "TriviaReportPanel",

  props: {
    report: {
      type: Object as PropType<TriviaReportData | null>,
      default: null,
    },
    refreshing: { type: Boolean, default: false },
    teamLabels: {
      type: Object as PropType<{ a: string; b: string }>,
      default: () => ({ a: "צד עמית", b: "צד גל" }),
    },
  },

  emits: ["refresh"],

  computed: {
    hardestPrompt(): string {
      const qs = this.report?.questions || [];
      const withAcc = qs.filter((q) => q.accuracy !== null) as ReportQuestion[];
      if (!withAcc.length) return "—";
      withAcc.sort((a, b) => (a.accuracy ?? 1) - (b.accuracy ?? 1));
      const p = withAcc[0].prompt || "";
      return p.length > 18 ? p.slice(0, 16) + "…" : p;
    },
  },

  methods: {
    formatScore(n: number | null | undefined) {
      if (n == null) return "—";
      return Number(n).toLocaleString("he-IL");
    },
    accuracyLabel(v: number | null | undefined) {
      if (v == null) return "—";
      return `${Math.round(v * 100)}%`;
    },
    teamLabel(team: string | null | undefined) {
      if (team === "a") return this.teamLabels.a;
      if (team === "b") return this.teamLabels.b;
      return "—";
    },
    barWidth(accuracy: number | null) {
      if (accuracy === null) return "0%";
      return `${Math.round(accuracy * 100)}%`;
    },
    barColor(accuracy: number | null) {
      if (accuracy === null) return "#ccc";
      if (accuracy >= 0.7) return "#2FBE6A";
      if (accuracy >= 0.4) return "#C9A36A";
      return "#DC5B66";
    },
  },
});
</script>
