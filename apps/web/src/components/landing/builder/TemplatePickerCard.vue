<template>
  <div
    class="tcard"
    role="radio"
    tabindex="0"
    :aria-checked="selected ? 'true' : 'false'"
    :aria-label="template.name_he"
    @click="$emit('select', template.id)"
    @keydown.enter.self.prevent="$emit('select', template.id)"
    @keydown.space.self.prevent="$emit('select', template.id)"
  >
    <div class="tthumb">
      <img :src="thumb" alt="" loading="lazy" />
      <span class="tsel"><BuilderIcon name="check" />נבחר</span>
    </div>
    <div class="tmeta">
      <div>
        <h3>{{ template.name_he }}</h3>
        <small>{{ typeLabel }}</small>
      </div>
      <button type="button" class="btn-view" @click.stop="$emit('preview', template.id)">
        <BuilderIcon name="eye" />צפייה
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from "vue";
import type { TemplateMeta } from "../types";
import BuilderIcon from "./BuilderIcon.vue";
import { thumbFor } from "./templateThumbs";

export default defineComponent({
  name: "TemplatePickerCard",
  components: { BuilderIcon },
  props: {
    template: { type: Object as PropType<TemplateMeta>, required: true },
    selected: { type: Boolean, default: false },
    typeLabel: { type: String, default: "" },
  },
  emits: ["select", "preview"],
  setup(props) {
    const thumb = computed(() => thumbFor(props.template.id));
    return { thumb };
  },
});
</script>
