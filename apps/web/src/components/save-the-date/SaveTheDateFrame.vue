<template>
  <div ref="hostEl" class="save-the-date-frame"></div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref, watch, type PropType } from "vue";
import { styleById, type StdCfg } from "./saveTheDateCatalog";
import { googleFontsHref } from "./saveTheDateModel";
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
    replayTick: { type: Number, default: 0 },
  },
  setup(props) {
    const hostEl = ref<HTMLElement | null>(null);
    let unwire: (() => void) | null = null;
    let linkEl: HTMLLinkElement | null = null;

    function ensureFonts() {
      const href = googleFontsHref(styleById(props.cfg.style).fonts);
      if (linkEl && linkEl.getAttribute("href") === href) return;
      if (linkEl) linkEl.remove();
      linkEl = document.createElement("link");
      linkEl.rel = "stylesheet";
      linkEl.href = href;
      linkEl.setAttribute("data-std-fonts", "1");
      document.head.appendChild(linkEl);
    }

    function paint() {
      const host = hostEl.value;
      if (!host) return;
      if (unwire) {
        unwire();
        unwire = null;
      }
      ensureFonts();
      host.innerHTML = render(props.cfg, {
        mode: props.mode,
        state: props.state,
        still: props.still,
      });
      unwire = wire(host, props.cfg, { builder: props.builder, still: props.still }) || null;
    }

    function replay() {
      const root = hostEl.value?.querySelector(".std") as (HTMLElement & { _replay?: () => void }) | null;
      if (root && typeof root._replay === "function") root._replay();
    }

    watch(
      () => [props.cfg, props.mode, props.state, props.still, props.builder],
      () => paint(),
      { deep: true, flush: "post" }
    );

    watch(
      () => props.replayTick,
      (n, prev) => {
        if (n && n !== prev) replay();
      }
    );

    watch(hostEl, (el) => {
      if (el) paint();
    });

    onBeforeUnmount(() => {
      if (unwire) unwire();
      unwire = null;
      if (linkEl) {
        linkEl.remove();
        linkEl = null;
      }
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
