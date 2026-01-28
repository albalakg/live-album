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
          <div
            class="display--flex align--center width--full-mobile margin--top-small"
          >
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
    <div class="gallery-content brs--medium">
      <!-- <EventGallery rounded hideMenu /> -->
      <div class="width--three-corner width--full-mobile gallery-wrapper">
        <component :is="form.selectedAlbum"></component>
      </div>
      <div
        class="width--corner bg--white brs--medium padding--medium flex--column align--center justify--center width--full-mobile"
      >
        <h1 class="title--large">אלבום תמונות</h1>
        <br />
        <MainSelect
          :options="albumsSelectOptions"
          v-model="form.selectedAlbum"
          ref="actionSelect"
          placeholder="בחר את האלבום"
          title="בחר את האלבום"
        />
        <br />
        <!-- <MainInput
          v-model="form.imageDisplayTime"
          type="number"
          size="medium"
          title="זמן תצוגת תמונה (שניות)"
        />
        <br />
        <MainInput
          v-model="form.videoDisplayTime"
          type="number"
          size="medium"
          title="זמן תצוגת וידאו (שניות)"
        />
        <br> -->
        <MainButton :loading="loading" text="שמור" @onClick="submit()" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MainButton from "@/components/library/buttons/MainButton.vue";
import EventGallerySingle from "@/components/event/EventGallerySingle.vue";
import EventGallerySplitScreen from "@/components/event/EventGallerySplitScreen.vue";
import EventGalleryRandom from "@/components/event/EventGalleryRandom.vue";
import EventGalleryGrid3X3 from "@/components/event/EventGalleryGrid3X3.vue";

import MainIcon from "@/components/library/general/MainIcon.vue";
import { defineComponent } from "vue";
import MainSelect from "@/components/library/inputs/MainSelect.vue";
import MainInput from "@/components/library/inputs/MainInput.vue";
import { IEvent } from "@/helpers/interfaces";

export default defineComponent({
  name: "EventGalleryView",

  components: {
    MainButton,
    EventGallerySingle,
    MainIcon,
    MainSelect,
    EventGalleryRandom,
    EventGalleryGrid3X3,
    EventGallerySplitScreen,
    MainInput,
  },

  data() {
    return {
      textCopied: false as boolean,
      albumsSelectOptions: [
        { value: "EventGallerySingle", label: "אלבום תמונות רגיל" },
        { value: "EventGalleryRandom", label: "אלבום תמונות קופצות" },
        { value: "EventGallerySplitScreen", label: "אלבום תמונות חלוקה מסך" },
        // { value: "EventGalleryGrid3X3", label: "אלבום תמונות רשת 3x3" },
      ] as { value: string; label: string }[],
      loading: false as boolean,
      form: {
        selectedAlbum: "EventGallerySingle" as string,
        // imageDisplayTime: 3 as number,
        // videoDisplayTime: 8 as number,
      },
    };
  },

  created() {
    this.$store.dispatch("event/getEventGalleryAssets");
    this.setForm();
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
    
    event(): IEvent {
      return this.$store.getters["event/getEvent"];
    },
  },

  methods: {
    setForm() {
      this.form.selectedAlbum = this.event.config.displayed_gallery || "EventGallerySingle";
    },

    async submit() {
      this.loading = true;
      await this.$store.dispatch("event/updateGallerySettings", this.form);
      this.loading = false;
    },

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
  display: flex;
  gap: 20px;

  @media only screen and (max-width: 600px) {
    flex-wrap: wrap;

    .gallery-wrapper {
      height: 200px;
    }
  }
}
</style>
