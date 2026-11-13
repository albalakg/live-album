<template>
  <div class="tb-control-strip" :class="{ open: visible }">
    <b>המשחק על המסך</b>
    <button
      type="button"
      :disabled="busy"
      :class="{ pri: currentPhase === 'lobby' }"
      @click="$emit('phase', 'lobby')"
    >הצטרפות</button>
    <button
      type="button"
      class="pri"
      :disabled="busy || !hasQuestions"
      @click="$emit('phase', 'question')"
    >שאלה</button>
    <button type="button" :disabled="busy" @click="$emit('phase', 'reveal')">חשיפה</button>
    <button type="button" :disabled="busy" @click="$emit('phase', 'leaderboard')">ניקוד</button>
    <button type="button" :disabled="busy" @click="$emit('phase', 'podium')">פודיום</button>
    <button type="button" :disabled="busy" @click="$emit('photos')">חזרה לתמונות</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TriviaHostRemote",

  props: {
    visible: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
    hasQuestions: { type: Boolean, default: false },
    currentPhase: { type: String, default: "lobby" },
  },

  emits: ["phase", "photos"],
});
</script>
