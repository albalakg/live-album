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
          <CopyLinkButton :text="guestAlbumUrl" />
          <div>
            <strong>עמוד האלבום לאורחים</strong>
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
import CopyLinkButton from "@/components/ui/CopyLinkButton.vue";

export default defineComponent({
  name: "EventAlbumView",

  components: { CopyLinkButton },

  computed: {
    eventPath(): string {
      return this.$store.getters["event/getEventPath"];
    },
    isEventAvailable(): boolean {
      return this.$store.getters["event/isEventAvailable"];
    },
    guestAlbumUrl(): string {
      return `${window.location.origin}/event/open-gallery/${this.eventPath}`;
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

.ghost-btn,
.primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  padding: 14px 28px;
  text-decoration: none;
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  white-space: nowrap;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease,
    background 0.2s ease;
}

.ghost-btn {
  border: 1.5px solid var(--line, rgba(22, 19, 16, 0.11));
  background: transparent;
  color: var(--ink, #161310);
}

.ghost-btn:hover {
  border-color: var(--ink, #161310);
}

.primary-link {
  background: linear-gradient(
    135deg,
    var(--accent-2, #dc5b66),
    var(--accent, #c9a36a)
  );
  color: #fff !important;
  border: 0;
  width: fit-content;
  box-shadow: 0 10px 28px var(--glow, rgba(201, 163, 106, 0.45));
}

.primary-link:hover {
  transform: translateY(-2px);
}

.hint {
  margin: 10px 0 0;
  color: var(--muted, #5e564e);
  font-size: 0.85rem;
}
</style>
