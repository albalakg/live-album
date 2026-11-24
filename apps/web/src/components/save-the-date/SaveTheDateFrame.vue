<template>
  <div ref="hostEl" class="save-the-date-frame"></div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref, watch, type PropType } from "vue";
import type { StdCfg } from "./saveTheDateCatalog";
import { render, wire } from "./saveTheDateRender";
import "./saveTheDate.css";

export default defineComponent({
  name: "SaveTheDateFrame",
  props: {
    cfg: { type: Object as PropType<StdCfg>, required: true },
    mode: { type: String as PropType<"public" | "builder" | "thumb">, default: "public" },
    state: { type: String, default: "" },
    still: { type: Boolean, default: false },
    builder: { type: Boolean, default: false },
  },
  setup(props) {
    const hostEl = ref<HTMLElement | null>(null);
    let unwire: (() => void) | null = null;

    function paint() {
      const host = hostEl.value;
      if (!host) return;
      if (unwire) {
        unwire();
        unwire = null;
      }
      host.innerHTML = render(props.cfg, {
        mode: props.mode,
        state: props.state,
        still: props.still,
      });
      unwire = wire(host, props.cfg, { builder: props.builder, still: props.still }) || null;
    }

    watch(
      () => [props.cfg, props.mode, props.state, props.still, props.builder],
      () => paint(),
      { deep: true, flush: "post" }
    );

    watch(hostEl, (el) => {
      if (el) paint();
    });

    onBeforeUnmount(() => {
      if (unwire) unwire();
      unwire = null;
    });

    return { hostEl };
  },
});
</script>

<style scoped>
.save-the-date-frame {
  width: 100%;
  height: 100%;
}
.save-the-date-frame :deep(.std) {
  width: 100%;
  height: 100%;
}
</style>
