<template>
  <div class="psum">
    <section class="card pub">
      <div>
        <span v-if="live" class="pub-badge"><i />העמוד באוויר</span>
        <span v-else class="pub-badge hid"><i />העמוד מוסתר</span>
        <h2>דף האירוע של {{ titleText }}</h2>
        <p class="lede">
          {{
            live
              ? "האורחים יכולים לפתוח את העמוד מהקישור. כל שינוי שתעשו יתעדכן בו מיד."
              : "האורחים שנכנסים לקישור יראו שהעמוד לא זמין כרגע. שום דבר לא נמחק."
          }}
        </p>
        <template v-if="live">
          <HubLinkBox :slug="slug" />
          <div class="pub-share">
            <a class="btn btn-wa btn-sm" :href="waUrl" target="_blank" rel="noopener">
              <BuilderIcon name="wa" />שליחה בוואטסאפ
            </a>
            <a class="btn btn-ghost btn-sm" :href="fullUrl" target="_blank" rel="noopener">
              <BuilderIcon name="open" />פתיחת העמוד
            </a>
          </div>
        </template>
        <div class="pub-meta">
          <span>עיצוב: <b>{{ templateName }}</b></span>
          <span><b>{{ sectionCount }}</b> חלקים בעמוד</span>
          <span v-if="whenText">{{ live ? "פורסם" : "עודכן" }} {{ whenText }}</span>
        </div>
        <div class="pub-actions">
          <template v-if="live">
            <button type="button" class="btn btn-primary" @click="$emit('edit')">
              <BuilderIcon name="edit" />עריכת העמוד
            </button>
            <button type="button" class="btn btn-ghost" @click="confirming = true">
              <BuilderIcon name="hide" />הסתרת העמוד
            </button>
          </template>
          <template v-else>
            <button type="button" class="btn btn-publish" :disabled="busy" @click="$emit('republish')">
              {{ busy ? "מפרסמים…" : "פרסום מחדש" }}
            </button>
            <button type="button" class="btn btn-ghost" @click="$emit('edit')">
              <BuilderIcon name="edit" />עריכה
            </button>
          </template>
        </div>
      </div>
      <div class="pub-pv">
        <LivePreviewPane
          :template-id="templateId"
          :hub-config="hubConfig"
          device="phone"
          :bar="false"
          :url-text="urlText"
        />
      </div>
    </section>

    <div class="info-grid">
      <div class="card">
        <span class="sec-ic"><BuilderIcon name="wa" /></span>
        <div>
          <b>איך האורחים מגיעים לעמוד?</b>
          <p>שולחים את הקישור בוואטסאפ או מוסיפים אותו להזמנה.</p>
        </div>
      </div>
      <div class="card">
        <span class="sec-ic"><BuilderIcon name="qr" /></span>
        <div>
          <b>ומה עם כרטיס ה־QR?</b>
          <p>הוא לא משתנה, וממשיך להוביל ישר להעלאת תמונות באירוע.</p>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="confirming" class="epb-wizard epb-portal" dir="rtl" lang="he">
        <div class="modal-back" @click.self="confirming = false">
          <div
            ref="dialogEl"
            class="modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="hide-h"
            aria-describedby="hide-d"
          >
            <div class="confirm">
              <h2 id="hide-h">להסתיר את העמוד?</h2>
              <p id="hide-d">
                האורחים לא יוכלו לפתוח את הקישור עד שתפרסמו שוב. שום דבר לא נמחק, ואפשר להחזיר בלחיצה.
              </p>
              <div class="row">
                <button type="button" class="btn btn-danger" :disabled="busy" @click="confirmHide">הסתרה</button>
                <button ref="cancelEl" type="button" class="btn btn-ghost" @click="confirming = false">ביטול</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, onBeforeUnmount, ref, watch, type PropType } from "vue";
import type { HubConfig } from "../types";
import BuilderIcon from "./BuilderIcon.vue";
import HubLinkBox from "./HubLinkBox.vue";
import LivePreviewPane from "./LivePreviewPane.vue";
import { hubDisplayUrl, hubFullUrl, whatsappShareUrl } from "./hubPublicUrl";

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Where the tab opens once the page is live (or hidden). */
export default defineComponent({
  name: "PublishedSummary",
  components: { BuilderIcon, HubLinkBox, LivePreviewPane },
  props: {
    live: { type: Boolean, default: true },
    slug: { type: String, required: true },
    titleText: { type: String, default: "" },
    templateName: { type: String, default: "" },
    sectionCount: { type: Number, default: 0 },
    /** Real updated_at from the server (ISO). */
    publishedAt: { type: String as PropType<string | null>, default: null },
    templateId: { type: String, required: true },
    hubConfig: { type: Object as PropType<HubConfig>, required: true },
    busy: { type: Boolean, default: false },
  },
  emits: ["edit", "hide", "republish"],
  setup(props, { emit }) {
    const confirming = ref(false);
    const dialogEl = ref<HTMLElement | null>(null);
    const cancelEl = ref<HTMLElement | null>(null);

    const urlText = computed(() => hubDisplayUrl(props.slug));
    const fullUrl = computed(() => hubFullUrl(props.slug));
    const waUrl = computed(() => whatsappShareUrl(props.titleText, props.slug));

    const whenText = computed(() => {
      if (!props.publishedAt) return "";
      const d = new Date(props.publishedAt);
      if (isNaN(d.getTime())) return "";
      if (sameDay(d, new Date())) {
        const t = new Intl.DateTimeFormat("he-IL", { hour: "2-digit", minute: "2-digit" }).format(d);
        return `היום ב־${t}`;
      }
      return `ב־${new Intl.DateTimeFormat("he-IL", { day: "numeric", month: "long", year: "numeric" }).format(d)}`;
    });

    function confirmHide() {
      confirming.value = false;
      emit("hide");
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && confirming.value) {
        e.stopPropagation();
        confirming.value = false;
      }
    }

    watch(confirming, async (v) => {
      if (v) {
        document.addEventListener("keydown", onKey, true);
        await nextTick();
        cancelEl.value?.focus();
      } else {
        document.removeEventListener("keydown", onKey, true);
      }
    });

    onBeforeUnmount(() => document.removeEventListener("keydown", onKey, true));

    return { confirming, dialogEl, cancelEl, urlText, fullUrl, waUrl, whenText, confirmHide };
  },
});
</script>
