<template>
  <Teleport to="body">
    <div class="epb-wizard epb-portal" dir="rtl" lang="he">
      <div class="sheet-back" @click="$emit('close')" />
      <div ref="dialogEl" class="sheet" role="dialog" aria-modal="true" aria-label="תצוגה מקדימה">
        <div class="sheet-grab" />
        <div class="sheet-h">
          <b>תצוגה מקדימה</b>
          <DeviceToggle :model-value="device" @update:model-value="$emit('update:device', $event)" />
          <button
            ref="closeEl"
            type="button"
            class="mclose"
            style="position: static"
            aria-label="סגירה"
            @click="$emit('close')"
          >
            <BuilderIcon name="x" />
          </button>
        </div>
        <div class="sheet-body">
          <LivePreviewPane
            :template-id="templateId"
            :hub-config="hubConfig"
            :device="device"
            :bar="false"
            :url-text="urlText"
            :scroll-section="scrollSection"
            :scroll-tick="scrollTick"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from "vue";
import type { HubConfig } from "../types";
import type { PreviewDevice } from "./builderTypes";
import BuilderIcon from "./BuilderIcon.vue";
import DeviceToggle from "./DeviceToggle.vue";
import LivePreviewPane from "./LivePreviewPane.vue";
import { useBuilderDialog } from "./useBuilderDialog";

/** Mobile: preview as a bottom sheet (90dvh) instead of the side column. */
export default defineComponent({
  name: "BuilderPreviewSheet",
  components: { BuilderIcon, DeviceToggle, LivePreviewPane },
  props: {
    templateId: { type: String, required: true },
    hubConfig: { type: Object as PropType<HubConfig>, required: true },
    device: { type: String as PropType<PreviewDevice>, default: "phone" },
    urlText: { type: String, default: "" },
    scrollSection: { type: String, default: "" },
    scrollTick: { type: Number, default: 0 },
  },
  emits: ["close", "update:device"],
  setup(_props, { emit }) {
    const dialogEl = ref<HTMLElement | null>(null);
    const closeEl = ref<HTMLElement | null>(null);
    useBuilderDialog(
      dialogEl,
      () => emit("close"),
      () => closeEl.value
    );
    return { dialogEl, closeEl };
  },
});
</script>
