<template>
  <div
    class="event-details display--flex flex--wrap justify--space-between width--full"
  >
    <div
      class="event-right padding--medium display--flex direction--column justify--space-between"
    >
      <EventDetailsForm />
      <div class="upload-page-wrapper padding--medium bg--white brs--medium">
        <div
          class="display--flex flex--wrap justify--space-between align--center"
        >
          <div class="display--flex align--center width--full-mobile">
            <div class="icon-wrapper">
              <MainIcon
                clickable
                icon="content_copy"
                @onClick="copyUrl(`/event/uploads/${eventPath}`, 'uploadPage')"
              />
            </div>
            <small>{{ copyUploadText }}</small>
          </div>
          <div class="width--full-mobile upload-page-link">
            <router-link target="_blank" :to="`/event/uploads/${eventPath}`">
              <BaseButton text="צפייה בעמוד העלאות" />
            </router-link>
          </div>
        </div>
        <div>
          <small class="hint" v-if="isEventInProgress"
            >העמוד פעיל לאורחים כעת</small
          >
          <small class="hint" v-else-if="isEventActive"
            >העמוד כבר אינו זמין יותר</small
          >
          <small class="hint" v-else>
            העמוד יהיה פעיל לאורחים רק לאחר שהאירוע יתחיל</small
          >
        </div>
        <div
          class="display--flex flex--wrap justify--space-between align--center margin--top-medium"
        >
          <div class="display--flex align--center width--full-mobile">
            <div class="icon-wrapper">
              <MainIcon
                clickable
                icon="content_copy"
                @onClick="copyUrl(`/event/open-gallery/${eventPath}`, 'galleryPage')"
              />
            </div>
            <small>{{ copyGalleryText }}</small>
          </div>
          <div class="width--full-mobile upload-page-link">
            <router-link
              target="_blank"
              :to="`/event/open-gallery/${eventPath}`"
            >
              <BaseButton text="עמוד האלבום לאורחים" />
            </router-link>
          </div>
        </div>
        <div>
          <small class="hint" v-if="isEventAvailable"
            >העמוד פעיל לאורחים כעת</small
          >
          <small class="hint" v-else>
            העמוד יהיה פעיל לאורחים רק לאחר שהאירוע יתחיל</small
          >
        </div>
      </div>
    </div>
    <div
      class="event-left padding--medium brs--medium display--flex direction--column justify--space-between"
    >
      <EventInfoCard />
      <EventSubscriptionCard />
    </div>
  </div>
</template>

<script lang="ts">
import EventDetailsForm from "@/components/event/EventDetailsForm.vue";
import EventInfoCard from "@/components/event/EventInfoCard.vue";
import EventSubscriptionCard from "@/components/event/EventSubscriptionCard.vue";
import BaseButton from "@/components/library/buttons/BaseButton.vue";
import MainIcon from "@/components/library/general/MainIcon.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "EventDetailsView",

  components: {
    EventDetailsForm,
    EventInfoCard,
    EventSubscriptionCard,
    BaseButton,
    MainIcon,
  },

  data() {
    return {
      textCopied: {
        uploadPage: false,
        galleryPage: false,
      } as Record<string, boolean>,
    };
  },

  computed: {
    eventPath(): string {
      return this.$store.getters["event/getEventPath"];
    },

    isEventAvailable(): string {
      return this.$store.getters["event/isEventAvailable"];
    },

    isEventActive(): string {
      return this.$store.getters["event/isEventActive"];
    },

    isEventInProgress(): string {
      return this.$store.getters["event/isEventInProgress"];
    },

    copyUploadText(): string {
      return this.textCopied.uploadPage ? "הקישור הועתק" : "לחצו להעתקת הקישור";
    },

    copyGalleryText(): string {
      return this.textCopied.galleryPage ? "הקישור הועתק" : "לחצו להעתקת הקישור";
    },
  },

  methods: {
    copyUrl(url: string, pageType: string) {
      this.copyTextToClipboard(window.location.origin + url, pageType);
    },

    fallbackCopyTextToClipboard(text: string, pageType: string) {
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
          this.textCopied[pageType] = true;
          setTimeout(() => {
            this.textCopied[pageType] = false;
          }, 2000);
        }
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
      }

      document.body.removeChild(textArea);
    },

    copyTextToClipboard(text: string, pageType: string) {
      if (!navigator.clipboard) {
        this.fallbackCopyTextToClipboard(text, pageType);
        return;
      }

      navigator.clipboard.writeText(text).then(
        () => {
          this.textCopied[pageType] = true;
          setTimeout(() => {
            this.textCopied[pageType] = false;
          }, 2000);
        },
        (err) => {
          console.error("Async: Could not copy text: ", err);
          this.fallbackCopyTextToClipboard(text, pageType);
        }
      );
    },
  },
});
</script>

<style lang="scss" scoped>
.event-details {
  .icon-wrapper {
    width: 30px;
    height: 30px;
    margin-inline-end: 5px;
  }

  .event-right {
    width: 30%;
    min-height: 40%;

    @media only screen and (max-width: 1600px) {
      width: 40%;
    }

    @media only screen and (max-width: 600px) {
      width: 100%;

      .upload-page-wrapper {
        margin-top: 20px;

        .upload-page-link {
          margin-top: 10px;
        }
      }
    }
  }

  .event-left {
    width: 40%;
    min-height: 40%;

    @media only screen and (max-width: 600px) {
      width: 100%;
      margin-top: 30px;
    }

    & > div {
      height: calc(50% - 40px);

      @media only screen and (max-width: 600px) {
        height: fit-content;
      }
    }
  }
}
</style>
