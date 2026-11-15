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
        <figcaption>{{ data.image_caption || image.alt || 'עיטור · דוגמה' }}</figcaption>
      </figure>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useLandingImage } from "../useLandingImage";

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
    return { layout, image };
  },
});
</script>
