<template>
  <EventModerationSection />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EventModerationSection from "@/components/event/EventModerationSection.vue";

export default defineComponent({
  name: "EventModerationView",
  components: { EventModerationSection },
  async created() {
    if (this.$route.name === "previewModeration") {
      await this.$store.dispatch("event/loadSampleAlbum", "owner");
      return;
    }
    if (!this.$store.getters["event/getEvent"]) return;
    await this.$store.dispatch("event/getEventAssets");
  },
});
</script>
