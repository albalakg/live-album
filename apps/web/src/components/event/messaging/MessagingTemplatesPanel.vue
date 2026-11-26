<template>
  <div>
    <div class="msg-filters" role="group" aria-label="סינון לפי שלב" style="margin-bottom: 12px">
      <button v-for="(label, key) in stagesWithAll" :key="key" type="button" class="msg-chip-btn" :class="{ on: stage === key }" :aria-pressed="stage === key" @click="stage = key">{{ label }}</button>
    </div>
    <div class="msg-grid cols-3">
      <article v-for="t in shown" :key="t.key + '-' + (t.id || 0)" class="gs-card msg-card" style="display: flex; flex-direction: column; gap: 8px">
        <div class="msg-q-top">
          <span class="b b-dark">{{ t.is_system ? "תבנית מוכנה" : "נוסח שלי" }}</span>
          <span class="b">{{ categoryLabel[t.category] }}</span>
          <span :class="'b ' + meta(t).cls">{{ meta(t).label }}</span>
        </div>
        <h3 class="msg-q-title">{{ t.title }}</h3>
        <p class="msg-muted" style="white-space: pre-wrap; margin: 0; max-height: 7.5em; overflow: hidden">{{ t.body }}</p>
        <p v-if="t.meta_status === 'rejected' && t.meta_reason" class="msg-note red" style="margin: 0">{{ t.meta_reason }}</p>
        <div class="msg-row" style="margin-top: auto">
          <button class="gs-btn gs-btn-sm gs-btn-gold" type="button" @click="$emit('use', t)">שימוש בתבנית</button>
          <button v-if="devTools && !t.is_system && t.meta_status === 'pending' && t.id" class="gs-btn gs-btn-sm" type="button" @click="$emit('dev-approve', t)">אישור מדומה</button>
        </div>
      </article>
    </div>
    <p class="msg-note grey" style="margin-top: 14px">
      התבניות המוכנות כבר מאושרות ע״י Meta. אפשר לערוך כל תבנית — נוסח שונה נשלח לאישור Meta (בדרך כלל דקות) והשליחה מחכה לו אוטומטית.
    </p>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { MessagingTemplate } from "@/helpers/messaging/types";
import { CATEGORY_LABEL, META_STATUS, STAGES } from "@/helpers/messaging/labels";

export default defineComponent({
  name: "MessagingTemplatesPanel",
  props: {
    templates: { type: Array as PropType<MessagingTemplate[]>, required: true },
    devTools: { type: Boolean, default: false },
  },
  emits: ["use", "dev-approve"],
  data() {
    return { stage: "all", categoryLabel: CATEGORY_LABEL };
  },
  computed: {
    stagesWithAll(): Record<string, string> {
      return { all: "הכל", ...STAGES, mine: "הנוסחים שלי" };
    },
    shown(): MessagingTemplate[] {
      if (this.stage === "all") return this.templates;
      if (this.stage === "mine") return this.templates.filter((t) => !t.is_system);
      return this.templates.filter((t) => t.is_system && t.stage === this.stage);
    },
  },
  methods: {
    meta(t: MessagingTemplate) {
      return META_STATUS[t.meta_status] || META_STATUS.draft;
    },
  },
});
</script>
