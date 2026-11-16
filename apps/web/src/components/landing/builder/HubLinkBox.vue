<template>
  <div class="linkbox">
    <span class="url"><bdi>{{ displayUrl }}</bdi></span>
    <button type="button" class="copy" @click="copy">
      <BuilderIcon name="copy" />העתקה
      <span class="tip" :class="{ on: copied }" role="status">{{ copied ? "הקישור הועתק" : "" }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, ref } from "vue";
import BuilderIcon from "./BuilderIcon.vue";
import { hubDisplayUrl, hubFullUrl } from "./hubPublicUrl";

export default defineComponent({
  name: "HubLinkBox",
  components: { BuilderIcon },
  props: {
    slug: { type: String, required: true },
  },
  setup(props) {
    const copied = ref(false);
    let timer: ReturnType<typeof setTimeout> | null = null;
    const displayUrl = computed(() => hubDisplayUrl(props.slug));

    async function copy() {
      const text = hubFullUrl(props.slug);
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
        } catch {
          /* ignore */
        }
        ta.remove();
      }
      copied.value = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        copied.value = false;
      }, 2000);
    }

    onBeforeUnmount(() => {
      if (timer) clearTimeout(timer);
    });

    return { copied, displayUrl, copy };
  },
});
</script>
