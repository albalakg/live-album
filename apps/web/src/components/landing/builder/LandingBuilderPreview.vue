<template>
  <aside class="lbp" dir="rtl" aria-label="תצוגה מקדימה">
    <div class="lbp-toolbar">
      <div class="seg" role="group" aria-label="גודל תצוגה">
        <button
          type="button"
          :class="{ on: viewport === 'phone' }"
          @click="setViewport('phone')"
        >טלפון</button>
        <button
          type="button"
          :class="{ on: viewport === 'desktop' }"
          @click="setViewport('desktop')"
        >מחשב</button>
      </div>
      <button type="button" class="mob-open" @click="$emit('open-sheet')">תצוגה מקדימה</button>
    </div>

    <div class="lbp-stage" :class="viewport">
      <div class="lbp-frame" :class="viewport">
        <LandingPreviewIframe
          v-if="templateId && hubConfig"
          :template-id="templateId"
          :hub-config="hubConfig"
          :mode="viewport"
          title="תצוגה מקדימה בדף האירוע"
        />
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, type PropType } from "vue";
import LandingPreviewIframe from "./LandingPreviewIframe.vue";
import type { HubConfig } from "../types";

const STORAGE_KEY = "snapshare-landing-preview-viewport";

function defaultViewport(): "phone" | "desktop" {
  if (typeof window === "undefined") return "phone";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "phone" || saved === "desktop") return saved;
  } catch {
    /* ignore */
  }
  return window.innerWidth >= 1280 ? "desktop" : "phone";
}

export default defineComponent({
  name: "LandingBuilderPreview",
  components: { LandingPreviewIframe },
  props: {
    templateId: { type: String, required: true },
    hubConfig: { type: Object as PropType<HubConfig>, required: true },
  },
  emits: ["open-sheet"],
  setup() {
    const viewport = ref<"phone" | "desktop">("phone");

    function setViewport(next: "phone" | "desktop") {
      viewport.value = next;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
    }

    onMounted(() => {
      viewport.value = defaultViewport();
    });

    return { viewport, setViewport };
  },
});
</script>

<style lang="scss" scoped>
.lbp {
  display: grid;
  gap: 10px;
  width: 100%;
  min-width: 0;
  position: sticky;
  top: 12px;
  align-self: stretch;
  justify-self: stretch;
}
.lbp-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.seg {
  display: inline-flex;
  background: rgba(22, 19, 16, 0.06);
  border-radius: 999px;
  padding: 3px;
}
.seg button,
.mob-open {
  border: 0;
  background: transparent;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
}
.seg button.on {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.mob-open {
  display: none;
  background: rgba(22, 19, 16, 0.08);
}
.lbp-stage {
  display: block;
  width: 100%;
  background: rgba(22, 19, 16, 0.04);
  border-radius: 20px;
  padding: 16px;
  overflow: hidden;
  min-height: 760px;
  height: min(76vh, 820px);
  box-sizing: border-box;
}
.lbp-frame {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  border-radius: 28px;
  overflow: hidden;
  background: #1c1814;
  box-shadow: 0 18px 40px rgba(22, 19, 16, 0.18);
  border: 8px solid #1c1814;
  padding: 10px;
  box-sizing: border-box;
}
.lbp-frame.desktop {
  border-radius: 16px;
  border-width: 4px;
  padding: 8px;
}

@media (max-width: 1100px) {
  .lbp-stage {
    display: none;
  }
  .mob-open {
    display: inline-flex;
  }
  .seg {
    display: none;
  }
}
</style>
