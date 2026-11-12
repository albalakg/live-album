<template>
  <div class="album-page">
    <header class="page-head">
      <p class="kicker">לאורחים</p>
      <h1>האלבום</h1>
      <p class="lede">
        קישור לאלבום האורחים. ניהול והורדת כל הקבצים נמצאים בכרטיסיית
        <router-link to="/event/assets">כל הקבצים</router-link>.
      </p>
    </header>

    <section class="links-card">
      <h2>אלבום האורחים</h2>
      <div class="link-row">
        <div class="link-meta">
          <button
            type="button"
            class="icon-btn"
            aria-label="העתקת קישור אלבום האורחים"
            @click="copyUrl(`/event/open-gallery/${eventPath}`)"
          >
            <MainIcon icon="content_copy" />
          </button>
          <div>
            <strong>עמוד האלבום לאורחים</strong>
            <small>{{ copyText }}</small>
          </div>
        </div>
        <router-link
          class="ghost-btn"
          target="_blank"
          :to="`/event/open-gallery/${eventPath}`"
        >
          פתיחת האלבום
        </router-link>
      </div>
      <p class="hint" v-if="isEventAvailable">העמוד פעיל לאורחים כעת</p>
      <p class="hint" v-else>העמוד יהיה פעיל לאורחים רק לאחר שהאירוע יתחיל</p>
    </section>

    <section class="hint-card">
      <h2>הורדת קבצים</h2>
      <p>
        לבחירה, הסתרה והורדה של כל קבצי האירוע עברו ל
        <router-link to="/event/assets">כל הקבצים</router-link>.
      </p>
      <router-link class="primary-link" to="/event/assets">לכל הקבצים</router-link>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainIcon from "@/components/library/general/MainIcon.vue";

export default defineComponent({
  name: "EventAlbumView",

  components: { MainIcon },

  data() {
    return { textCopied: false };
  },

  computed: {
    eventPath(): string {
      return this.$store.getters["event/getEventPath"];
    },
    isEventAvailable(): boolean {
      return this.$store.getters["event/isEventAvailable"];
    },
    copyText(): string {
      return this.textCopied ? "הקישור הועתק" : "לחצו להעתקת הקישור";
    },
  },

  methods: {
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
.album-page {
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

.lede a,
.hint-card a {
  color: var(--ink, #161310);
  font-weight: 700;
}

.links-card,
.hint-card {
  background: rgba(22, 19, 16, 0.02);
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 18px;
  padding: 18px;
}

.links-card h2,
.hint-card h2 {
  margin: 0 0 12px;
  font-size: 1.05rem;
  font-weight: 800;
}

.hint-card p {
  margin: 0 0 14px;
  color: var(--muted, #5e564e);
  line-height: 1.45;
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

.ghost-btn,
.primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 10px 16px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.92rem;
  white-space: nowrap;
}

.ghost-btn {
  border: 1.5px solid var(--line, rgba(22, 19, 16, 0.16));
  color: var(--ink, #161310);
}

.primary-link {
  background: linear-gradient(135deg, #dc5b66, #c9a36a);
  color: #fff !important;
  border: 0;
  width: fit-content;
}

.hint {
  margin: 10px 0 0;
  color: var(--muted, #5e564e);
  font-size: 0.85rem;
}
</style>
