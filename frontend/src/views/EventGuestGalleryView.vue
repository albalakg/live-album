<template>
  <div>
    <div>
      <h1 class="title--large text--pink text--center">
        {{ event.name }}
      </h1>
    </div>
    <div class="assets-content display--flex flex--wrap brs--medium">
      <template v-for="(asset, index) in assets" :key="index">
        <EventGuestCard :loading="loading" :assetIndex="index" :asset="asset" />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { IEventAsset } from "@/helpers/interfaces";
import EventGuestCard from "@/components/event/EventGuestCard.vue";

export default defineComponent({
  name: "EventGuestGalleryView",

  components: {
    EventGuestCard,
  },

  setup() {
    return {};
  },

  data() {
    return {
      loading: true as boolean,
    };
  },

  computed: {
    assets(): IEventAsset[] {
      return this.$store.getters["event/getAssets"];
    },

    event() {
      return this.$store.getters["event/getEvent"];
    },
  },

  created() {
    this.getEventDetails();
  },

  methods: {
    async getEventDetails() {
      await this.$store.dispatch(
        "event/getEventGuestGallery",
        this.$route.params.event_path
      );
      this.loading = false;
    },
  },
});
</script>

<style lang="scss">
.assets-content {
  margin-top: 20px;
  height: 72%;
  max-height: 75vh;
  overflow-y: auto;
}
</style>
