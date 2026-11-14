<template>
  <section :id="'sec-' + sectionId" :class="['block', 'story', alt && 'alt']">
    <div class="wrap split">
      <div>
        <p v-if="data.kicker" class="sec-kicker">{{ data.kicker }}</p>
        <h2 v-if="data.heading" class="sec-title">{{ data.heading }}</h2>
        <div class="chapters">
          <article v-for="(c, i) in (data.chapters || [])" :key="i">
            <h3>{{ c.title }}</h3>
            <p>{{ c.body }}</p>
          </article>
        </div>
      </div>
      <figure
        v-if="image"
        class="about-fig"
        :style="{ backgroundImage: `url('${image.url}')` }"
      >
        <figcaption>{{ data.image_caption || image.alt }}</figcaption>
      </figure>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useLandingImage } from "../useLandingImage";

export default defineComponent({
  name: "LandingStory",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const { resolve } = useLandingImage();
    const image = computed(() => resolve(props.data.image as never));
    return { image };
  },
});
</script>
