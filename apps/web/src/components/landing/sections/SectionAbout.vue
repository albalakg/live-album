<template>
  <section :id="'sec-' + sectionId" :class="['block', 'about', layout, alt && 'alt']">
    <div :class="['wrap', layout === 'split' && image ? 'split' : '']">
      <div class="about-copy">
        <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
        <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
        <p class="body">{{ data.body }}</p>
      </div>
      <figure
        v-if="image && layout === 'split'"
        class="about-fig"
        :style="{ backgroundImage: `url('${image.url}')` }"
      >
        <figcaption v-if="caption">{{ caption }}</figcaption>
      </figure>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useLandingImage } from "../useLandingImage";
import { isStockImageRef, visibleCaption } from "../sampleCaption";

export default defineComponent({
  name: "LandingAbout",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const { resolve } = useLandingImage();
    const layout = computed(() => String(props.data.layout || "center").toLowerCase());
    const image = computed(() => resolve(props.data.image as never));
    const caption = computed(() =>
      visibleCaption(String(props.data.image_caption || ""), image.value?.alt, isStockImageRef(props.data.image))
    );
    return { layout, image, caption };
  },
});
</script>
