<template>
  <HeroCountdown
    v-if="variant === 'legacy'"
    :data="data"
    :section-id="sectionId"
    :hero-style="heroStyle"
    :alt="alt"
  />
  <section
    v-else
    ref="rootEl"
    :id="'sec-' + sectionId"
    class="vx-sec vx-hero"
    :class="['vx-hero--' + variant, isWide && 'is-wide']"
    :data-variant="variant"
  >
    <!-- full: photo across the whole width, text on a dark gradient -->
    <div v-if="variant === 'full'" class="vh-full">
      <img class="vh-bg" :src="image.url" :alt="image.alt" draggable="false" />
      <div class="vh-shade" aria-hidden="true"></div>
      <span v-if="image.isSample" class="ex-tag vh-tag">דוגמה</span>
      <div class="vh-in">
        <p class="vh-kick">{{ data.kicker }}</p>
        <h1 class="vh-title">{{ data.title }}</h1>
        <p v-if="dateLine" class="vh-meta">{{ dateLine }}</p>
        <p v-if="venueLine" class="vh-venue"><VariantIcon name="pin" />{{ venueLine }}</p>
        <div class="vh-ctas">
          <button v-if="canUpload" type="button" class="btn btn-primary vh-btn" @click="onUpload">
            <VariantIcon name="camera" />העלו תמונות
          </button>
          <a class="btn btn-ghost vh-btn" href="#sec-join" @click.prevent="scrollJoin">איך זה עובד</a>
        </div>
      </div>
    </div>

    <!-- split: photo on one half, text + countdown on the other (mobile: photo on top) -->
    <div v-else-if="variant === 'split'" class="vh-split">
      <div class="vh-img">
        <img :src="image.url" :alt="image.alt" draggable="false" />
        <span v-if="image.isSample" class="ex-tag vh-tag">דוגמה</span>
      </div>
      <div class="vh-txt">
        <p class="vh-kick">{{ data.kicker }}</p>
        <h1 class="vh-title">{{ data.title }}</h1>
        <div class="vh-rule" aria-hidden="true"></div>
        <p v-if="dateLine" class="vh-meta">{{ dateLine }}</p>
        <p v-if="venueLine" class="vh-venue"><VariantIcon name="pin" />{{ venueLine }}</p>
        <VariantCountdown :parts="parts" :ended="ended" />
        <div class="vh-ctas">
          <button v-if="canUpload" type="button" class="btn btn-primary vh-btn" @click="onUpload">
            <VariantIcon name="camera" />העלו תמונות
          </button>
          <a class="btn btn-ghost vh-btn" href="#sec-join" @click.prevent="scrollJoin">איך זה עובד</a>
        </div>
      </div>
    </div>

    <!-- arch: photo in an arch frame; centered on mobile, side by side on desktop -->
    <div v-else class="vh-arch">
      <div class="vh-frame">
        <img :src="image.url" :alt="image.alt" draggable="false" />
        <span v-if="image.isSample" class="ex-tag vh-tag">דוגמה</span>
      </div>
      <div class="vh-txt">
        <p class="vh-kick">{{ data.kicker }}</p>
        <h1 class="vh-title">{{ data.title }}</h1>
        <div class="vh-orn" aria-hidden="true"><i></i><VariantIcon name="heart" /><i></i></div>
        <p v-if="dateLine" class="vh-meta">{{ dateLine }}</p>
        <p v-if="venueLine" class="vh-venue"><VariantIcon name="pin" />{{ venueLine }}</p>
        <VariantCountdown :parts="parts" :ended="ended" />
        <div class="vh-ctas">
          <button v-if="canUpload" type="button" class="btn btn-primary vh-btn" @click="onUpload">
            <VariantIcon name="camera" />העלו תמונות
          </button>
          <a class="btn btn-ghost vh-btn" href="#sec-join" @click.prevent="scrollJoin">איך זה עובד</a>
        </div>
      </div>
    </div>
    <p v-if="preview" class="preview-note vh-note">בתצוגה מקדימה</p>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from "vue";
import HeroCountdown from "../HeroCountdown.vue";
import { useLandingImage } from "../../useLandingImage";
import { isStockImageRef } from "../../sampleCaption";
import { resolveStock } from "../../templates/registry";
import VariantIcon from "./VariantIcon.vue";
import VariantCountdown from "./VariantCountdown.vue";
import { ensureGen2Fonts, useCountdown, useVariantBlock, useWideSection } from "./useVariantBlock";
import "./variantSections.css";

/**
 * HERO_COUNTDOWN for gen-2 templates: full / split / arch.
 * Old templates (variant "legacy") render the original HeroCountdown unchanged.
 * Image: the host's own cover; until there is one, the template's sample photo with a «דוגמה» badge.
 */
export default defineComponent({
  name: "VariantHeroSection",
  components: { HeroCountdown, VariantIcon, VariantCountdown },
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, default: "hero" },
    heroStyle: { type: String, default: "card" },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const { ctx, templateId, variant, preview } = useVariantBlock("HERO_COUNTDOWN", () => props.data);
    const { resolve } = useLandingImage();
    const rootEl = ref<HTMLElement | null>(null);
    const { isWide } = useWideSection(rootEl);
    const { parts, ended } = useCountdown(
      () => props.data.event_date,
      () => Boolean(ctx?.shot)
    );

    watch(
      () => (variant.value === "legacy" ? "" : templateId.value),
      (id) => id && ensureGen2Fonts(id),
      { immediate: true }
    );

    const image = computed(() => {
      for (const ref of [props.data.cover, props.data.__cover]) {
        if (ref && !isStockImageRef(ref)) {
          const own = resolve(ref as never, "תמונת הפתיחה");
          if (own) return { url: own.url, alt: own.alt || "תמונת הפתיחה", isSample: false };
        }
      }
      const sample = resolveStock(`${templateId.value}/hero`);
      return { url: sample?.url || "", alt: "תמונת פתיחה לדוגמה", isSample: true };
    });

    const canUpload = computed(() => preview.value || Boolean(ctx?.eventMeta?.upload_url));
    const dateLine = computed(() => {
      const d = String(props.data.date_he || "");
      const t = String(props.data.time_he || "");
      return t && d ? `${d} · ${t}` : d || t;
    });
    const venueLine = computed(() => [props.data.venue, props.data.city].filter(Boolean).join(", "));

    function onUpload() {
      if (preview.value) {
        ctx?.toast("בתצוגה מקדימה");
        return;
      }
      ctx?.openUpload();
    }
    function scrollJoin() {
      document.getElementById("sec-join")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    return { variant, rootEl, isWide, image, parts, ended, canUpload, dateLine, venueLine, preview, onUpload, scrollJoin };
  },
});
</script>
