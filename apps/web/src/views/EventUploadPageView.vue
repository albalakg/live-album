<template>
  <div class="upload-page">
    <header class="page-head">
      <div>
        <h1>עמוד העלאה לאורחים</h1>
        <p class="lede">הגדרות תצוגה עם תצוגה מקדימה חיה בטלפון.</p>
      </div>
    </header>

    <div class="layout">
      <form class="settings" @submit.prevent="submit">
        <EventSwitchPanel
          title="תצוגה בעמוד העלאות"
          :items="displaySwitches"
          :values="config"
          @toggle="toggle"
        />

        <div class="field welcome">
          <span>
            טקסט ברכה
            <em class="neu">הצעה חדשה</em>
          </span>
          <textarea v-model="welcomeText" rows="3" maxlength="255"></textarea>
        </div>

        <details class="more">
          <summary>הגדרות נוספות</summary>
          <EventSwitchPanel
            title="הרשאות אורחים"
            :items="permissionSwitches"
            :values="config"
            @toggle="toggle"
          />
        </details>

        <div class="form-actions">
          <MainButton :loading="loading" text="שמור" />
        </div>

        <section class="links-card">
          <h2>קישור לעמוד העלאות</h2>
          <div class="link-row">
            <button
              type="button"
              class="icon-btn"
              aria-label="העתקת קישור עמוד העלאות"
              @click="copyUrl(`/event/uploads/${eventPath}`)"
            >
              <MainIcon icon="content_copy" />
            </button>
            <div>
              <strong>עמוד העלאות</strong>
              <small>{{ copyUploadText }}</small>
            </div>
          </div>
        </section>
      </form>

      <aside class="phone-wrap" aria-label="תצוגה מקדימה">
        <div class="phone">
          <div
            class="phone-bg"
            :style="phoneBgStyle"
          ></div>
          <div class="phone-content">
            <h3 v-if="config.preview_site_display_name">{{ eventName }}</h3>
            <p v-if="config.preview_site_display_date" class="date">{{ eventDate }}</p>
            <p class="welcome-preview">{{ welcomeText || "תעלו ותשתפו" }}</p>
            <button type="button" class="phone-cta">העלאה</button>
            <button
              v-if="config.preview_link_to_album_page_from_upload_page"
              type="button"
              class="phone-link"
            >
              צפו באלבום
            </button>
            <small v-if="config.video_upload_enabled">אפשר גם סרטון</small>
          </div>
        </div>
      </aside>
    </div>
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
import { notify } from "@/helpers/notify";

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
      welcomeText: "",
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
          title: "תמונת כיסוי ברקע",
          hint: "כרקע של עמוד ההעלאה",
        },
        {
          key: "preview_site_display_name",
          title: "שם האירוע",
          hint: "בראש העמוד",
        },
        {
          key: "preview_site_display_date",
          title: "התאריך",
          hint: "ליד שם האירוע",
        },
      ] as SwitchItem[],
      permissionSwitches: [
        {
          key: "video_upload_enabled",
          title: "אפשרות להעלות סרטון",
          hint: "כבוי — רק תמונות",
        },
        {
          key: "preview_link_to_album_page_from_upload_page",
          title: "כפתור «צפו באלבום»",
          hint: "קישור לאלבום מעמוד ההעלאה",
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
    eventName(): string {
      return this.$store.getters["event/getEventName"] || "";
    },
    eventDate(): string {
      return this.$store.getters["event/getEventDate"] || "";
    },
    eventImage(): string {
      return this.$store.getters["event/getEventImage"] || "";
    },
    phoneBgStyle(): Record<string, string> {
      if (this.config.preview_site_display_image && this.eventImage) {
        return {
          backgroundImage: `url(${this.eventImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        };
      }
      return { background: "#12100e" };
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
      this.welcomeText = cfg?.welcome_text || "";
    },

    toggle(key: string) {
      const k = key as ConfigKey;
      this.config[k] = !this.config[k];
    },

    async submit() {
      this.loading = true;
      const configPayload: Record<string, string> = {};
      (Object.keys(this.config) as ConfigKey[]).forEach((key) => {
        configPayload[key] = this.config[key] ? "true" : "false";
      });
      configPayload.welcome_text = this.welcomeText;
      await this.$store.dispatch("event/update", { config: configPayload });
      this.loading = false;
      notify({ text: "ההגדרות נשמרו", type: "success" });
    },

    async copyUrl(url: string) {
      try {
        await navigator.clipboard.writeText(window.location.origin + url);
        this.textCopied = true;
        notify({ text: "הקישור הועתק", type: "success" });
        setTimeout(() => {
          this.textCopied = false;
        }, 2000);
      } catch (e) {
        console.error(e);
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.page-head h1 {
  margin: 0;
  font-size: clamp(1.9rem, 3vw, 2.55rem);
  font-weight: 900;
  letter-spacing: -0.04em;
}
.lede {
  margin: 8px 0 0;
  color: #5e564e;
}
.layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 28px;
  margin-top: 18px;
  align-items: start;
}
.settings {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #fff;
  border-radius: 22px;
  padding: 18px 20px;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
}
.field > span {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-weight: 800;
  color: #8a8278;
}
.neu {
  display: inline-block;
  margin-inline-start: 8px;
  background: #fff4f4;
  color: #9a3036;
  border-radius: 999px;
  padding: 2px 8px;
  font-style: normal;
  font-size: 0.72rem;
  letter-spacing: 0;
  text-transform: none;
}
textarea {
  border: 1.5px solid rgba(22, 19, 16, 0.11);
  border-radius: 14px;
  padding: 12px 14px;
  font: inherit;
  resize: vertical;
  background: #fffcfa;
}
.more summary {
  cursor: pointer;
  font-weight: 800;
  color: #5e564e;
  margin-bottom: 10px;
}
.links-card {
  background: #fff;
  border-radius: 22px;
  padding: 18px 20px;
  box-shadow: 0 8px 24px rgba(18, 16, 14, 0.08);
}
.links-card h2 {
  margin: 0 0 10px;
  font-size: 1.1rem;
}
.link-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.icon-btn {
  border: 0;
  background: #f3eee6;
  border-radius: 12px;
  width: 42px;
  height: 42px;
  cursor: pointer;
}
.phone-wrap {
  position: sticky;
  top: 88px;
}
.phone {
  position: relative;
  width: 280px;
  height: 560px;
  margin-inline: auto;
  border-radius: 36px;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(18, 16, 14, 0.2);
  border: 10px solid #12100e;
}
.phone-bg {
  position: absolute;
  inset: 0;
}
.phone-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 28px 18px 36px;
  background: linear-gradient(180deg, transparent 20%, rgba(18, 16, 14, 0.72));
  color: #fff;
  text-align: center;
}
.phone-content h3 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 900;
}
.date,
.welcome-preview {
  margin: 0;
  opacity: 0.92;
}
.phone-cta,
.phone-link {
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 800;
  font-family: inherit;
}
.phone-cta {
  background: linear-gradient(135deg, #dc5b66, #c9a36a);
  color: #fff;
  width: 100%;
}
.phone-link {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  width: 100%;
}
@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .phone-wrap {
    order: -1;
    position: static;
  }
}
</style>
