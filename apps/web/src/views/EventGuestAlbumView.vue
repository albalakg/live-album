<template>
  <EventGalleryFullScreenView v-if="ready" />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EventGalleryFullScreenView from "@/views/EventGalleryFullScreenView.vue";

export default defineComponent({
  name: "EventGuestAlbumView",
  components: { EventGalleryFullScreenView },
  data() {
    return { ready: false };
  },
  async created() {
    const eventPath = this.$route.params.event_path;
    if (eventPath === "preview") {
      await this.$store.dispatch("event/loadSampleAlbum", "guest");
    } else {
      await this.$store.dispatch("event/getEventGuestGallery", eventPath);
    }
    this.ready = true;
  },
});
</script>
