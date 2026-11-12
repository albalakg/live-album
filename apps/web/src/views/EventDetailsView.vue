<template>
  <div class="event-details">
    <header class="details-head">
      <p class="kicker">ניהול אירוע</p>
      <h1>פרטי האירוע</h1>
    </header>

    <div class="stats-row">
      <EventInfoCard />
      <EventSubscriptionCard />
    </div>

    <EventDetailsForm />

    <section class="links-card">
      <h2>קישורים לאורחים</h2>
      <div class="link-row">
        <div class="link-meta">
          <button
            type="button"
            class="icon-btn"
            aria-label="העתקת קישור עמוד העלאות"
            @click="copyUrl(`/event/uploads/${eventPath}`, 'uploadPage')"
          >
            <MainIcon icon="content_copy" />
          </button>
          <div>
            <strong>עמוד העלאות</strong>
            <small>{{ copyUploadText }}</small>
          </div>
        </div>
        <router-link
          class="ghost-btn"
          target="_blank"
          :to="`/event/uploads/${eventPath}`"
        >
          צפייה בעמוד העלאות
        </router-link>
      </div>
      <p class="hint" v-if="isEventInProgress">העמוד פעיל לאורחים כעת</p>
      <p class="hint" v-else-if="isEventActive">העמוד כבר אינו זמין יותר</p>
      <p class="hint" v-else>העמוד יהיה פעיל לאורחים רק לאחר שהאירוע יתחיל</p>

      <div class="link-row">
        <div class="link-meta">
          <button
            type="button"
            class="icon-btn"
            aria-label="העתקת קישור אלבום האורחים"
            @click="copyUrl(`/event/open-gallery/${eventPath}`, 'galleryPage')"
          >
            <MainIcon icon="content_copy" />
          </button>
          <div>
            <strong>אלבום האורחים</strong>
            <small>{{ copyGalleryText }}</small>
          </div>
        </div>
        <router-link
          class="ghost-btn"
          target="_blank"
          :to="`/event/open-gallery/${eventPath}`"
        >
          עמוד האלבום לאורחים
        </router-link>
      </div>
      <p class="hint" v-if="isEventAvailable">העמוד פעיל לאורחים כעת</p>
      <p class="hint" v-else>העמוד יהיה פעיל לאורחים רק לאחר שהאירוע יתחיל</p>
    </section>
  </div>
</template>

<script lang="ts">
import EventDetailsForm from "@/components/event/EventDetailsForm.vue";
import EventInfoCard from "@/components/event/EventInfoCard.vue";
import EventSubscriptionCard from "@/components/event/EventSubscriptionCard.vue";
import MainIcon from "@/components/library/general/MainIcon.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "EventDetailsView",

  components: {
    EventDetailsForm,
    EventInfoCard,
    EventSubscriptionCard,
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

    isEventAvailable(): boolean {
      return this.$store.getters["event/isEventAvailable"];
    },

    isEventActive(): boolean {
      return this.$store.getters["event/isEventActive"];
    },

    isEventInProgress(): boolean {
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
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.details-head .kicker {
  color: var(--rose, #dc5b66);
  font-weight: 800;
  margin: 0;
}

.details-head h1 {
  margin: 4px 0 0;
  font-weight: 900;
  font-size: clamp(1.55rem, 2.4vw, 2rem);
  letter-spacing: -0.03em;
  line-height: 1.15;
  white-space: nowrap;
}

@media (max-width: 420px) {
  .details-head h1 {
    white-space: normal;
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}

.links-card {
  background: rgba(22, 19, 16, 0.02);
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 18px;
  padding: 18px;
}

.links-card h2 {
  margin: 0 0 14px;
  font-size: 1.05rem;
  font-weight: 800;
}

.link-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.link-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.link-meta strong {
  display: block;
  font-size: 0.95rem;
}

.link-meta small {
  color: var(--muted, #5e564e);
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--line, rgba(22, 19, 16, 0.16));
  border-radius: 12px;
  background: #fffcfa;
  display: grid;
  place-items: center;
  cursor: pointer;
  flex: none;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--line, rgba(22, 19, 16, 0.16));
  border-radius: 999px;
  padding: 10px 16px;
  text-decoration: none;
  color: var(--ink, #161310);
  font-weight: 700;
  font-size: 0.92rem;
  white-space: nowrap;
}

.ghost-btn:hover {
  border-color: var(--ink, #161310);
}

.hint {
  margin: 6px 0 12px;
  color: var(--muted, #5e564e);
  font-size: 0.85rem;
}
</style>
