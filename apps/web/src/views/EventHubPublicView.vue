<template>
  <div class="event-hub-public">
    <LandingLoadingSkeleton v-if="status === 'loading'" />
    <LandingNotFoundState v-else-if="status === 'not_found'" />
    <LandingErrorState v-else-if="status === 'error'" @retry="load" />
    <LandingRenderer
      v-else-if="status === 'ready' && normalized"
      :template-id="normalized.templateId"
      :hub-config="normalized.hubConfig"
      :event-meta="normalized.eventMeta"
      :cover-image="normalized.coverResolved"
      mode="public"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { getPublicHub } from "@/api/eventHub";
import LandingRenderer from "@/components/landing/LandingRenderer.vue";
import LandingLoadingSkeleton from "@/components/landing/LandingLoadingSkeleton.vue";
import LandingNotFoundState from "@/components/landing/LandingNotFoundState.vue";
import LandingErrorState from "@/components/landing/LandingErrorState.vue";
import {
  normalizePublicHub,
  type NormalizedPublicHub,
} from "@/components/landing/publicHubNormalize";
import { trackEvent } from "@/helpers/deviceAnalytics";

export default defineComponent({
  name: "EventHubPublicView",
  components: {
    LandingRenderer,
    LandingLoadingSkeleton,
    LandingNotFoundState,
    LandingErrorState,
  },
  setup() {
    const route = useRoute();
    const status = ref<"loading" | "ready" | "not_found" | "error">("loading");
    const normalized = ref<NormalizedPublicHub | null>(null);

    const slug = computed(() => String(route.params.slug || "").trim());

    let prevTitle = "";
    let prevLang = "";
    let prevDir = "";
    let metaDescEl: HTMLMetaElement | null = null;
    let createdMeta = false;

    function trimText(s: string, max = 160): string {
      const t = s.replace(/\s+/g, " ").trim();
      if (t.length <= max) return t;
      return `${t.slice(0, max - 1).trim()}…`;
    }

    function applyMeta(n: NormalizedPublicHub) {
      prevTitle = document.title;
      prevLang = document.documentElement.getAttribute("lang") || "";
      prevDir = document.documentElement.getAttribute("dir") || "";

      const title =
        n.eventMeta.event_name ||
        String(n.hubConfig.blocks.find((b) => b.type === "HERO_COUNTDOWN")?.data?.title || "אירוע");
      document.title = `${title} · SnapShare`;
      document.documentElement.setAttribute("lang", "he");
      document.documentElement.setAttribute("dir", "rtl");

      const welcome = String(
        n.hubConfig.blocks.find((b) => b.type === "HERO_COUNTDOWN")?.data?.welcome || ""
      );
      const desc = trimText(welcome || `${title} ב־SnapShare`);
      metaDescEl = document.querySelector('meta[name="description"]');
      if (!metaDescEl) {
        metaDescEl = document.createElement("meta");
        metaDescEl.setAttribute("name", "description");
        document.head.appendChild(metaDescEl);
        createdMeta = true;
      }
      metaDescEl.setAttribute("data-landing-prev", metaDescEl.getAttribute("content") || "");
      metaDescEl.setAttribute("content", desc);
    }

    function restoreMeta() {
      if (prevTitle) document.title = prevTitle;
      if (prevLang) document.documentElement.setAttribute("lang", prevLang);
      else document.documentElement.removeAttribute("lang");
      if (prevDir) document.documentElement.setAttribute("dir", prevDir);
      else document.documentElement.removeAttribute("dir");
      if (metaDescEl) {
        const prev = metaDescEl.getAttribute("data-landing-prev");
        metaDescEl.removeAttribute("data-landing-prev");
        if (createdMeta) {
          metaDescEl.remove();
        } else if (prev != null) {
          metaDescEl.setAttribute("content", prev);
        }
      }
      metaDescEl = null;
      createdMeta = false;
    }

    async function load() {
      restoreMeta();
      const s = slug.value;
      status.value = "loading";
      normalized.value = null;
      if (!s) {
        status.value = "not_found";
        return;
      }
      const result = await getPublicHub(s);
      if (!result.ok) {
        if (result.kind === "not_found") {
          status.value = "not_found";
          return;
        }
        console.error("[EventHubPublicView] public hub fetch failed", result.error);
        status.value = "error";
        return;
      }
      try {
        const n = normalizePublicHub(result.data, s);
        normalized.value = n;
        status.value = "ready";
        applyMeta(n);
        const eventPath =
          result.data.event_path ||
          result.data.integrations?.gallery_path ||
          n.eventMeta.event_path ||
          "";
        if (eventPath) {
          trackEvent(String(eventPath), "landing_view");
        }
      } catch (err) {
        console.error("[EventHubPublicView] normalize failed", err);
        status.value = "error";
      }
    }

    watch(slug, () => load(), { immediate: true });

    onBeforeUnmount(() => {
      restoreMeta();
    });

    return { status, normalized, load };
  },
});
</script>

<style scoped>
.event-hub-public {
  min-height: 100vh;
  width: 100%;
  overflow-x: clip;
}
</style>
