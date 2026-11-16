<template>
  <Teleport to="body">
    <div class="epb-wizard epb-portal" dir="rtl" lang="he">
      <div class="modal-back" @click="$emit('close')" />
      <div
        ref="dialogEl"
        class="tpm"
        role="dialog"
        aria-modal="true"
        :aria-label="`תצוגה של ${template.name_he}`"
      >
        <div class="tpm-h">
          <div class="ttl">
            <b>{{ template.name_he }}</b>
            <small>{{ typeLabel }} · עם השמות והתאריך שלכם</small>
          </div>
          <DeviceToggle :model-value="device" @update:model-value="$emit('update:device', $event)" />
          <button
            ref="pickEl"
            type="button"
            class="btn btn-primary btn-sm pick"
            @click="$emit('pick', template.id)"
          >{{ selected ? "זה העיצוב שלנו" : "בוחרים בעיצוב הזה" }}</button>
          <button type="button" class="mclose" aria-label="סגירה" @click="$emit('close')">
            <BuilderIcon name="x" />
          </button>
        </div>
        <div class="tpm-body">
          <LivePreviewPane
            :template-id="template.id"
            :hub-config="hubConfig"
            :device="device"
            :bar="false"
            :url-text="urlText"
            @update:device="$emit('update:device', $event)"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from "vue";
import type { HubConfig, TemplateMeta } from "../types";
import type { PreviewDevice } from "./builderTypes";
import BuilderIcon from "./BuilderIcon.vue";
import DeviceToggle from "./DeviceToggle.vue";
import LivePreviewPane from "./LivePreviewPane.vue";
import { useBuilderDialog } from "./useBuilderDialog";

export default defineComponent({
  name: "TemplatePreviewModal",
  components: { BuilderIcon, DeviceToggle, LivePreviewPane },
  props: {
    template: { type: Object as PropType<TemplateMeta>, required: true },
    /** Config rendered for THIS template with the host's own content. */
    hubConfig: { type: Object as PropType<HubConfig>, required: true },
    selected: { type: Boolean, default: false },
    device: { type: String as PropType<PreviewDevice>, default: "desktop" },
    typeLabel: { type: String, default: "" },
    urlText: { type: String, default: "" },
  },
  emits: ["pick", "close", "update:device"],
  setup(_props, { emit }) {
    const dialogEl = ref<HTMLElement | null>(null);
    const pickEl = ref<HTMLElement | null>(null);
    useBuilderDialog(
      dialogEl,
      () => emit("close"),
      () => pickEl.value
    );
    return { dialogEl, pickEl };
  },
});
</script>
