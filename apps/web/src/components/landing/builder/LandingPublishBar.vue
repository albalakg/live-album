<template>
  <div class="lpb" dir="rtl">
    <div class="lpb-top">
      <span class="pill" :class="isPublished ? 'live' : 'draft'">
        {{ isPublished ? "מפורסם" : "טיוטה" }}
      </span>
      <div class="lpb-actions">
        <button
          v-if="!isPublished"
          type="button"
          class="btn primary"
          :disabled="busy || !canPublish"
          @click="$emit('publish')"
        >פרסום העמוד</button>
        <button
          v-else
          type="button"
          class="btn"
          :disabled="busy"
          @click="$emit('unpublish')"
        >הסרת פרסום</button>
      </div>
    </div>

    <p v-if="!canPublish && !isPublished" class="lpb-hint">
      לשמירה ופרסום נדרשים עיצוב שמור וכתובת פנויה.
    </p>

    <div v-if="isPublished && publicUrl" class="lpb-link">
      <a class="url" :href="publicUrl" target="_blank" rel="noopener" dir="ltr">{{ publicUrl }}</a>
      <div class="lpb-link-actions">
        <button type="button" class="btn" @click="copy">העתקת קישור</button>
        <a class="btn" :href="publicUrl" target="_blank" rel="noopener">פתיחת העמוד</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { notify } from "@/helpers/notify";

export default defineComponent({
  name: "LandingPublishBar",
  props: {
    isPublished: { type: Boolean, default: false },
    publicUrl: { type: String, default: "" },
    canPublish: { type: Boolean, default: false },
    busy: { type: Boolean, default: false },
  },
  emits: ["publish", "unpublish"],
  setup(props) {
    async function copy() {
      try {
        await navigator.clipboard.writeText(props.publicUrl);
        notify({ text: "הקישור הועתק", type: "success", duration: 2500 });
      } catch (e) {
        console.error(e);
        notify({ text: "לא הצלחנו להעתיק", type: "error", duration: 3000 });
      }
    }
    return { copy };
  },
});
</script>

<style lang="scss" scoped>
.lpb {
  display: grid;
  gap: 10px;
  padding: 12px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(22, 19, 16, 0.08);
}
.lpb-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 6px 12px;
  font-weight: 800;
  font-size: 0.85rem;
}
.pill.live {
  background: rgba(47, 122, 69, 0.14);
  color: #2f7a45;
}
.pill.draft {
  background: rgba(22, 19, 16, 0.08);
  color: #5e564e;
}
.lpb-actions {
  display: flex;
  gap: 8px;
}
.btn {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  background: rgba(22, 19, 16, 0.08);
  color: inherit;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.btn.primary {
  color: #fff;
  background: linear-gradient(135deg, var(--accent-2, #dc5b66), var(--accent, #c9a36a));
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.lpb-hint {
  margin: 0;
  color: #5e564e;
  font-size: 0.88rem;
}
.lpb-link {
  display: grid;
  gap: 8px;
}
.url {
  font-size: 0.88rem;
  color: #3a342e;
  word-break: break-all;
}
.lpb-link-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
