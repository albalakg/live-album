<template>
  <div class="upload-page">
    <header class="page-head">
      <p class="kicker">אורחים</p>
      <h1>עמוד העלאה לאורחים</h1>
      <p class="lede">תצוגה בעמוד ההעלאות, הרשאות אורחים, וקישור לשיתוף.</p>
    </header>

    <section class="links-card">
      <h2>קישור לעמוד העלאות</h2>
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
          צפייה בעמוד
        </router-link>
      </div>
      <p class="hint" v-if="isEventInProgress">העמוד פעיל לאורחים כעת</p>
      <p class="hint" v-else-if="isEventActive">העמוד כבר אינו זמין יותר</p>
      <p class="hint" v-else>העמוד יהיה פעיל לאורחים רק לאחר שהאירוע יתחיל</p>
    </section>

    <form class="settings-form" @submit.prevent="submit">
      <EventSwitchPanel
        title="תצוגה בעמוד העלאות"
        :items="displaySwitches"
        :values="config"
        @toggle="toggle"
      />
      <EventSwitchPanel
        title="הרשאות אורחים"
        :items="permissionSwitches"
        :values="config"
        @toggle="toggle"
      />
      <div class="form-actions">
        <MainButton :loading="loading" text="שמור" />
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainButton from "@/components/library/buttons/MainButton.vue";
import MainIcon from "@/components/library/general/MainIcon.vue";
import EventSwitchPanel, {
  SwitchItem,
} from "@/components/event/EventSwitchPanel.vue";
import { IEvent } from "@/helpers/interfaces";

type ConfigKey =
  | "preview_site_display_image"
  | "preview_site_display_name"
  | "preview_site_display_date"
  | "video_upload_enabled"
  | "preview_link_to_album_page_from_upload_page";

export default defineComponent({
  name: "EventUploadPageView",

  components: { MainButton, MainIcon, EventSwitchPanel },

  data() {
    return {
      loading: false,
      textCopied: false,
      config: {
        preview_site_display_image: false,
        preview_site_display_name: false,
        preview_site_display_date: false,
        video_upload_enabled: true,
        preview_link_to_album_page_from_upload_page: false,
      } as Record<ConfigKey, boolean>,
      displaySwitches: [
        {
          key: "preview_site_display_image",
          title: "הצגת תמונת האירוע",
          hint: "להציג את תמונת הכיסוי בעמוד העלאות",
        },
        {
          key: "preview_site_display_name",
          title: "הצגת שם האירוע",
          hint: "להציג את שם האירוע בעמוד העלאות",
        },
        {
          key: "preview_site_display_date",
          title: "הצגת תאריך האירוע",
          hint: "להציג את תאריך האירוע בעמוד העלאות",
        },
      ] as SwitchItem[],
      permissionSwitches: [
        {
          key: "video_upload_enabled",
          title: "העלאת סרטונים",
          hint: "לאפשר לאורחים ולבעלי האירוע להעלות סרטונים",
        },
        {
          key: "preview_link_to_album_page_from_upload_page",
          title: "קישור לאלבום מעמוד העלאות",
          hint: "להציג כפתור מעבר מעמוד ההעלאות לעמוד האלבום",
        },
      ] as SwitchItem[],
    };
  },

  computed: {
    event(): IEvent {
      return this.$store.getters["event/getEvent"];
    },
    eventPath(): string {
      return this.$store.getters["event/getEventPath"];
    },
    isEventActive(): boolean {
      return this.$store.getters["event/isEventActive"];
    },
    isEventInProgress(): boolean {
      return this.$store.getters["event/isEventInProgress"];
    },
    copyUploadText(): string {
      return this.textCopied ? "הקישור הועתק" : "לחצו להעתקת הקישור";
    },
  },

  watch: {
    event: {
      immediate: true,
      handler() {
        this.syncFromEvent();
      },
    },
  },

  methods: {
    syncFromEvent() {
      const cfg = this.event?.config;
      this.config.preview_site_display_image =
        cfg?.preview_site_display_image ?? false;
      this.config.preview_site_display_name =
        cfg?.preview_site_display_name ?? false;
      this.config.preview_site_display_date =
        cfg?.preview_site_display_date ?? false;
      this.config.video_upload_enabled = cfg?.video_upload_enabled ?? true;
      this.config.preview_link_to_album_page_from_upload_page =
        cfg?.preview_link_to_album_page_from_upload_page ?? false;
    },

    toggle(key: string) {
      const k = key as ConfigKey;
      this.config[k] = !this.config[k];
    },

    async submit() {
      this.loading = true;
      await this.$store.dispatch("event/update", { config: { ...this.config } });
      this.loading = false;
    },

    copyUrl(url: string) {
      const full = window.location.origin + url;
      const done = () => {
        this.textCopied = true;
        setTimeout(() => {
          this.textCopied = false;
        }, 2000);
      };
      if (!navigator.clipboard) {
        const area = document.createElement("textarea");
        area.value = full;
        area.style.position = "fixed";
        area.style.left = "0";
        area.style.top = "0";
        document.body.appendChild(area);
        area.focus();
        area.select();
        try {
          if (document.execCommand("copy")) done();
        } finally {
          document.body.removeChild(area);
        }
        return;
      }
      navigator.clipboard.writeText(full).then(done).catch(() => {
        /* ignore */
      });
    },
  },
});
</script>

<style lang="scss" scoped>
.upload-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-head .kicker {
  color: var(--rose, #dc5b66);
  font-weight: 800;
  margin: 0;
}

.page-head h1 {
  margin: 4px 0 0;
  font-weight: 900;
  font-size: clamp(1.55rem, 2.4vw, 2rem);
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.lede {
  margin: 8px 0 0;
  color: var(--muted, #5e564e);
  font-size: 0.95rem;
  line-height: 1.45;
  max-width: 52ch;
}

.links-card,
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.links-card {
  background: rgba(22, 19, 16, 0.02);
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 18px;
  padding: 18px;
}

.links-card h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
}

.link-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
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
  gap: 8px;
  border: 1.5px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 999px;
  padding: 14px 28px;
  text-decoration: none;
  background: transparent;
  color: var(--ink, #161310);
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  white-space: nowrap;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.2s ease;
}

.ghost-btn:hover {
  border-color: var(--ink, #161310);
}

.hint {
  margin: 0;
  color: var(--muted, #5e564e);
  font-size: 0.85rem;
}

.form-actions {
  max-width: 280px;
  margin-inline-start: auto;
  width: 100%;
}
</style>
