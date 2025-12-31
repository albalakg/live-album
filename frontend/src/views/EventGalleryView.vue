<template>
  <div class="event-gallery">
    <div class="gallery-top display--flex justify--space-between align--center">
      <div class="display--flex align--center" v-if="$bp.isMediumAndUp">
        <div class="width--full-mobile">
          <router-link to="/event/gallery/full-screen">
            <MainButton text="צפה בגלרייה" class="gallery-button" />
          </router-link>
        </div>
        <div class="display--flex align--center width--full-mobile">
          <div class="icon-wrapper">
            <MainIcon clickable icon="content_copy" @onClick="copyUrl()" />
          </div>
          <small>{{ copyText }}</small>
        </div>
      </div>
      <template v-else>
        <div class="width--full-mobile margin--top-large">
          <div class="width--full-mobile">
            <router-link to="/event/gallery/full-screen">
              <MainButton text="צפה בגלרייה" class="gallery-button" />
            </router-link>
          </div>
          <div class="display--flex align--center width--full-mobile margin--top-small">
            <div class="icon-wrapper">
              <MainIcon clickable icon="content_copy" @onClick="copyUrl()" />
            </div>
            <small>{{ copyText }}</small>
          </div>
        </div>
      </template>
      <span v-if="$bp.isMediumAndUp" class="title--small"
        >סה"כ {{ totalAssets }} קבצים</span
      >
    </div>
    <div class="gallery-content brs--medium bg--dark">
      <EventGallery rounded hideMenu />
    </div>
  </div>
</template>

<script lang="ts">
import MainButton from "@/components/library/buttons/MainButton.vue";
import EventGallery from "@/components/event/EventGallery.vue";
import MainIcon from "@/components/library/general/MainIcon.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "EventGalleryView",

  components: {
    MainButton,
    EventGallery,
    MainIcon,
  },

  data() {
    return {
      textCopied: false as boolean,
    };
  },

  created() {
    this.$store.dispatch("event/getEventGalleryAssets");
  },

  computed: {
    totalAssets(): number {
      return this.$store.getters["event/getTotalAssets"];
    },

    copyText(): string {
      return this.textCopied ? "הקישור הועתק" : "לחצו להעתקת הקישור לאלבום החי";
    },

    eventPath(): string {
      return this.$store.getters["event/getEventPath"];
    },
  },

  methods: {
    copyUrl() {
      this.copyTextToClipboard(
        window.location.origin + `/event/open-album/${this.eventPath}`
      );
    },

    fallbackCopyTextToClipboard(text: string) {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          this.textCopied = true;
          setTimeout(() => {
            this.textCopied = false;
          }, 2000);
        }
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
      }

      document.body.removeChild(textArea);
    },

    copyTextToClipboard(text: string) {
      if (!navigator.clipboard) {
        this.fallbackCopyTextToClipboard(text);
        return;
      }

      navigator.clipboard.writeText(text).then(
        () => {
          this.textCopied = true;
          setTimeout(() => {
            this.textCopied = false;
          }, 2000);
        },
        (err) => {
          console.error("Async: Could not copy text: ", err);
          this.fallbackCopyTextToClipboard(text);
        }
      );
    },
  },
});
</script>

<style lang="scss" scoped>
.event-gallery {
  height: 60vh;
  width: 100%;

  @media only screen and (max-width: 600px) {
    // height: 100%;
    margin: 10px;
    min-height: fit-content;
  }
}

.gallery-top {
  height: 50px;
  margin-bottom: 20px;
  width: calc(100% - 20px);

  .icon-wrapper {
    margin-inline-start: 10px;
  }
}

.gallery-content {
  height: 100%;
  min-height: fit-content;
  margin-top: 30px;
  width: calc(100% - 20px);
}
</style>
