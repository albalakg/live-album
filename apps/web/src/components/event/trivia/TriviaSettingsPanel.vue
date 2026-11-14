<template>
  <div class="tb-settings-tab">
    <p class="tb-lede">
      הגדרות שחלות על כל המשחק. אפשר לשנות אותן גם אחרי שיש שאלות.
    </p>
    <div class="tb-set-grid">
      <div class="tb-set-card">
        <h3>קצב המשחק</h3>
        <p class="hint">
          באירוע, כולם עונים באותו זמן ומסתכלים על המסך. זה ברירת המחדל.
        </p>
        <div class="tb-seg">
          <button type="button" :class="{ on: game.pace === 'host' }" @click="set('pace', 'host')">קצב המנחה</button>
          <button type="button" :class="{ on: game.pace === 'auto' }" @click="set('pace', 'auto')">התקדמות אוטומטית</button>
          <button type="button" :class="{ on: game.pace === 'free' }" @click="set('pace', 'free')">כל אחד בקצב שלו</button>
        </div>
      </div>

      <div class="tb-set-card">
        <h3>קבוצות</h3>
        <p class="hint">אפשר לשחק אישית, או לפתוח תחרות בין צדדים.</p>
        <div class="tb-seg">
          <button type="button" :class="{ on: game.teams_mode === 'none' }" @click="set('teams_mode', 'none')">בלי קבוצות</button>
          <button type="button" :class="{ on: game.teams_mode === 'sides' }" @click="set('teams_mode', 'sides')">צד עמית וצד גל</button>
          <button type="button" disabled title="בשלב הבא">לפי שולחנות</button>
        </div>
        <div v-if="game.teams_mode === 'sides'" class="tb-meta-row" style="margin-top: 8px">
          <label class="tb-field">
            <span>צד א</span>
            <input
              type="text"
              :value="game.team_labels.a"
              maxlength="40"
              @input="setLabel('a', ($event.target as HTMLInputElement).value)"
            />
          </label>
          <label class="tb-field">
            <span>צד ב</span>
            <input
              type="text"
              :value="game.team_labels.b"
              maxlength="40"
              @input="setLabel('b', ($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>
      </div>

      <div class="tb-set-card">
        <h3>ניקוד</h3>
        <label class="tb-toggle">
          בונוס על מהירות
          <button
            type="button"
            class="tb-switch"
            :class="{ on: game.speed_bonus }"
            :aria-pressed="game.speed_bonus"
            @click="set('speed_bonus', !game.speed_bonus)"
          ><i></i></button>
        </label>
        <p class="hint">
          מחצית הנקודות על תשובה נכונה, ומחצית לפי כמה מהר ענו.
        </p>
        <div class="tb-meta-row">
          <label class="tb-field">
            <span>שניות ברירת מחדל</span>
            <input
              type="number"
              min="5"
              max="120"
              :value="game.default_time"
              @input="set('default_time', Number(($event.target as HTMLInputElement).value))"
            />
          </label>
          <label class="tb-field">
            <span>נקודות ברירת מחדל</span>
            <input
              type="number"
              min="100"
              max="10000"
              :value="game.default_points"
              @input="set('default_points', Number(($event.target as HTMLInputElement).value))"
            />
          </label>
        </div>
      </div>

      <div class="tb-set-card">
        <h3>הפעלה</h3>
        <label class="tb-toggle">
          הפעלת טריוויה לאירוע
          <button
            type="button"
            class="tb-switch"
            :class="{ on: game.enabled }"
            :aria-pressed="game.enabled"
            @click="set('enabled', !game.enabled)"
          ><i></i></button>
        </label>
        <p class="hint">כשהאפשרות כבויה המשחק לא יחליף את התמונות.</p>
        <div class="tb-meta-row">
          <label class="tb-field">
            <span>שניות לחשיפה</span>
            <input
              type="number"
              min="2"
              max="30"
              :value="game.reveal_seconds"
              @input="set('reveal_seconds', Number(($event.target as HTMLInputElement).value))"
            />
          </label>
        </div>
      </div>

      <div class="tb-set-card wide">
        <h3>כותרת ופרס</h3>
        <label class="tb-field">
          <span>כותרת שמוצגת לאורחים</span>
          <input
            type="text"
            :value="game.title"
            maxlength="80"
            @input="set('title', ($event.target as HTMLInputElement).value)"
          />
        </label>
        <label class="tb-field">
          <span>משפט על הפודיום</span>
          <input
            type="text"
            :value="game.prize_text"
            maxlength="200"
            placeholder="הפרס: בקבוק יין וצילום עם הזוג"
            @input="set('prize_text', ($event.target as HTMLInputElement).value)"
          />
        </label>
        <div class="tb-field" style="margin-top: 8px">
          <span>קישור לאורחים</span>
          <div class="tb-link-row">
            <input
              type="text"
              readonly
              dir="ltr"
              :value="guestUrl"
              class="tb-link-input"
              @focus="($event.target as HTMLInputElement).select()"
            />
            <CopyLinkButton :text="guestUrl" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import CopyLinkButton from "@/components/ui/CopyLinkButton.vue";
import { TriviaBuilderGame } from "@/helpers/triviaBuilder";

export default defineComponent({
  name: "TriviaSettingsPanel",

  components: { CopyLinkButton },

  props: {
    game: {
      type: Object as PropType<TriviaBuilderGame>,
      required: true,
    },
    guestUrl: { type: String, default: "" },
  },

  emits: ["patch"],

  methods: {
    set(key: string, value: unknown) {
      this.$emit("patch", { [key]: value });
    },
    setLabel(side: "a" | "b", value: string) {
      this.$emit("patch", {
        team_labels: { ...this.game.team_labels, [side]: value },
      });
    },
  },
});
</script>

<style scoped>
.tb-link-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}
.tb-link-input {
  flex: 1;
  min-width: 0;
  direction: ltr;
  unicode-bidi: isolate;
  text-align: start;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

