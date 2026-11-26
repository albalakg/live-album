<template>
  <div class="msg-phone" aria-label="תצוגה מקדימה בוואטסאפ">
    <div class="msg-phone-head">
      <span class="gs-ava" aria-hidden="true">SS</span>
      <div>
        <b>SnapShare אירועים ✓</b>
        <small>חשבון עסקי מאומת · תצוגה ל{{ guestName || "אורח לדוגמה" }}</small>
      </div>
    </div>
    <div class="msg-chat">
      <div class="msg-chat-row">
        <div class="msg-bubble in">
          <div v-if="header" class="h">{{ header }}</div>
          <div>{{ body || "…" }}</div>
          <div v-if="footer" class="f">{{ footer }}</div>
          <div class="t">{{ time }}</div>
        </div>
        <button v-for="(b, i) in buttons" :key="i" class="msg-bubble-btn" type="button" tabindex="-1">
          {{ b.type === "url" ? "🔗 " : "" }}{{ b.text }}
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { TemplateButton } from "@/helpers/messaging/types";

export default defineComponent({
  name: "MessagingPhonePreview",
  props: {
    header: { type: String, default: "" },
    body: { type: String, default: "" },
    footer: { type: String, default: "" },
    buttons: { type: Array as PropType<TemplateButton[]>, default: () => [] },
    guestName: { type: String, default: "" },
    time: { type: String, default: "17:30" },
  },
});
</script>
