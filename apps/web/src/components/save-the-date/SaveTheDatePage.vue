<template>
  <div class="save-the-date-page" :class="{ shot: still }">
    <SaveTheDateFrame :cfg="cfg" mode="public" :state="state" :still="still" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, watch, type PropType } from "vue";
import SaveTheDateFrame from "./SaveTheDateFrame.vue";
import { styleById, type StdCfg } from "./saveTheDateCatalog";
import { googleFontsHref } from "./saveTheDateModel";
import { titleOf } from "./saveTheDateRender";

export default defineComponent({
  name: "SaveTheDatePage",
  components: { SaveTheDateFrame },
  props: {
    cfg: { type: Object as PropType<StdCfg>, required: true },
    state: { type: String, default: "" },
    still: { type: Boolean, default: false },
  },
  setup(props) {
    let linkEl: HTMLLinkElement | null = null;
    let prevTitle = "";

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

    function lockViewport() {
      document.documentElement.classList.add("save-the-date-lock");
      if (props.still) document.documentElement.classList.add("shot");
      else document.documentElement.classList.remove("shot");
    }

    onMounted(() => {
      prevTitle = document.title;
      document.title = `שמרו את התאריך · ${titleOf(props.cfg.content)}`;
      document.documentElement.setAttribute("lang", "he");
      document.documentElement.setAttribute("dir", "rtl");
      lockViewport();
      ensureFonts();
    });

    watch(
      () => [props.cfg.style, props.cfg.content, props.still],
      () => {
        document.title = `שמרו את התאריך · ${titleOf(props.cfg.content)}`;
        lockViewport();
        ensureFonts();
      },
      { deep: true }
    );

    onBeforeUnmount(() => {
      if (prevTitle) document.title = prevTitle;
      if (linkEl) {
        linkEl.remove();
        linkEl = null;
      }
      document.documentElement.classList.remove("shot");
      document.documentElement.classList.remove("save-the-date-lock");
    });

    return {};
  },
});
</script>

<style scoped>
.save-the-date-page {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  height: 100dvh;
  overflow: hidden;
  overscroll-behavior: none;
}
</style>
