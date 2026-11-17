<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
      <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
      <p v-if="data.note" class="media-note" style="margin-bottom:22px">{{ data.note }}</p>
      <ul class="speakers people">
        <li v-for="(s, i) in (data.items || [])" :key="i">
          <div class="mono" aria-hidden="true">{{ s.initials }}</div>
          <div>
            <div class="nm">{{ s.name }}</div>
            <div class="rl">{{ s.role }}</div>
          </div>
        </li>
      </ul>
      <div v-if="photos.length" class="people-photos">
        <figure v-for="(ph, i) in photos" :key="i" class="g-item">
          <img :src="ph.thumb || ph.url" :alt="ph.alt || ph.caption" loading="lazy" />
          <figcaption v-if="ph.caption">{{ ph.caption }}</figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useLandingImage } from "../useLandingImage";
import { accessibleAlt, isStockImageRef, visibleCaption } from "../sampleCaption";

export default defineComponent({
  name: "LandingPeople",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const { resolve } = useLandingImage();
    const photos = computed(() =>
      (props.data.photos || [])
        .map((ph: { image?: unknown; caption?: string }) => {
          const img = resolve(ph.image as never, ph.caption || "");
          if (!img) return null;
          const isSample = isStockImageRef(ph.image);
          return {
            url: img.url,
            thumb: img.thumb_url || img.url,
            alt: accessibleAlt(ph.caption, img.alt, isSample),
            caption: visibleCaption(ph.caption, img.alt, isSample),
          };
        })
        .filter(Boolean)
    );
    return { photos };
  },
});
</script>
