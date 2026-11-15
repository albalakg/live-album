<template>
  <aside class="lbp" dir="rtl" aria-label="תצוגה מקדימה">
    <div class="lbp-toolbar">
      <div class="seg" role="group" aria-label="גודל תצוגה">
        <button type="button" :class="{ on: viewport === 'phone' }" @click="viewport = 'phone'">טלפון</button>
        <button type="button" :class="{ on: viewport === 'desktop' }" @click="viewport = 'desktop'">מחשב</button>
      </div>
      <button type="button" class="mob-open" @click="$emit('open-sheet')">תצוגה מקדימה</button>
    </div>

    <div class="lbp-stage" :class="viewport">
      <div class="lbp-frame" :style="frameStyle">
        <div class="lbp-scale" :style="scaleStyle">
          <LandingRenderer
            v-if="templateId && hubConfig"
            :template-id="templateId"
            :hub-config="hubConfig"
            mode="preview"
          />
        </div>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { computed, defineComponent, ref, type PropType } from "vue";
import LandingRenderer from "../LandingRenderer.vue";
import type { HubConfig } from "../types";

export default defineComponent({
  name: "LandingBuilderPreview",
  components: { LandingRenderer },
  props: {
    templateId: { type: String, required: true },
    hubConfig: { type: Object as PropType<HubConfig>, required: true },
  },
  emits: ["open-sheet"],
  setup() {
    const viewport = ref<"phone" | "desktop">("phone");

    const frameStyle = computed(() => {
      if (viewport.value === "phone") {
        return { width: "390px", height: "760px" };
      }
      return { width: "100%", height: "760px" };
    });

    const scaleStyle = computed(() => {
      if (viewport.value === "phone") {
        return {
          width: "390px",
          transform: "scale(1)",
          transformOrigin: "top center",
        };
      }
      // Show a scaled 1440 desktop inside the available width
      const scale = 0.42;
      return {
        width: "1440px",
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        height: `${760 / scale}px`,
      };
    });

    return { viewport, frameStyle, scaleStyle };
  },
});
</script>

<style lang="scss" scoped>
.lbp {
  display: grid;
  gap: 10px;
  min-width: 0;
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
  display: flex;
  justify-content: center;
  background: rgba(22, 19, 16, 0.04);
  border-radius: 20px;
  padding: 16px;
  overflow: hidden;
}
.lbp-frame {
  border-radius: 28px;
  overflow: auto;
  background: #111;
  box-shadow: 0 18px 40px rgba(22, 19, 16, 0.18);
  border: 8px solid #1c1814;
}
.lbp-stage.desktop .lbp-frame {
  border-radius: 16px;
  border-width: 4px;
}
.lbp-scale {
  pointer-events: none;
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
