<template>
  <div class="dlg-back on" @click.self="$emit('close')">
    <div ref="dlgEl" class="dlg" :class="{ done: mode === 'done' }" role="dialog" aria-modal="true" aria-labelledby="wsdlg-title">
      <template v-if="mode === 'publish'">
        <div class="dlg-h">
          <h2 id="wsdlg-title">פרסום העמוד</h2>
          <button type="button" class="icon-btn" aria-label="סגירה" @click="$emit('close')"><BuilderIcon name="x" /></button>
        </div>
        <p class="dlg-sub">האורחים ייכנסו מהקישור או מסריקת ה־QR. אפשר להמשיך לערוך גם אחרי הפרסום.</p>
        <p v-if="warning" class="dlg-warn" role="alert">{{ warning }}</p>
        <WorkspaceSlugField
          :slug="slug"
          :status="slugStatus"
          :suggestions="suggestions"
          :prefix="prefix"
          compact
          @input="$emit('slug', $event)"
          @blur="$emit('slug-blur')"
          @suggest="$emit('suggest', $event)"
        />
        <ul v-if="!hideChecks" class="check">
          <li :class="basicsOk ? 'ok' : 'warn'">
            <BuilderIcon :name="basicsOk ? 'check' : 'info'" /><span>{{
              basicsOk ? "הפרטים הבסיסיים מלאים" : "חסרים שם או תאריך בפרטים הבסיסיים"
            }}</span>
          </li>
          <li class="ok"><BuilderIcon name="check" /><span>{{ sectionCount }} חלקים בעמוד</span></li>
          <li v-if="samples.length" class="warn">
            <BuilderIcon name="info" /><span>עוד טקסט לדוגמה ב: {{ samples.join(", ") }}. אפשר לפרסם בכל זאת.</span>
          </li>
        </ul>
        <ul v-else class="check">
          <li :class="basicsOk ? 'ok' : 'warn'">
            <BuilderIcon :name="basicsOk ? 'check' : 'info'" /><span>{{
              basicsOk ? "השם והתאריך מלאים" : "חסרים שם או תאריך"
            }}</span>
          </li>
        </ul>
        <div class="dlg-f">
          <button type="button" class="btn btn-dark btn-lg" :disabled="slugStatus !== 'free' || busy" @click="$emit('publish')">
            <BuilderIcon name="globe" />{{ busy ? "מפרסמים…" : "פרסום עכשיו" }}
          </button>
          <button type="button" class="btn btn-line btn-lg" @click="$emit('close')">עוד לא</button>
        </div>
      </template>
      <template v-else>
        <div class="dlg-h">
          <h2 id="wsdlg-title"><span class="live-dot"></span>{{ live ? "העמוד באוויר" : "העמוד מוסתר כרגע" }}</h2>
          <button type="button" class="icon-btn" aria-label="סגירה" @click="$emit('close')"><BuilderIcon name="x" /></button>
        </div>
        <p class="dlg-sub">
          שלחו את הקישור לאורחים, או הדפיסו את ה־QR לשולחנות. שינויים שתעשו מעכשיו יעלו לעמוד אוטומטית.
        </p>
        <div class="link-box" dir="ltr">
          <span>{{ displayUrl }}</span>
          <button type="button" class="btn btn-dark btn-sm" @click="copy">
            <BuilderIcon :name="copied ? 'check' : 'copy'" />{{ copied ? "הועתק" : "העתקת הקישור" }}
          </button>
        </div>
        <div class="share">
          <div ref="qrEl" class="qr" aria-label="QR לעמוד"><QrcodeVue :value="fullUrl" :size="160" level="M" render-as="svg" /></div>
          <div class="share-r">
            <a class="btn btn-wa" :href="waUrl" target="_blank" rel="noopener"><BuilderIcon name="wa" />שליחה בוואטסאפ</a>
            <button type="button" class="btn btn-line" @click="downloadQr"><BuilderIcon name="download" />הורדת ה־QR</button>
            <a class="link open-l" :href="fullUrl" target="_blank" rel="noopener"
              ><BuilderIcon name="open" />פתיחת העמוד בלשונית חדשה</a
            >
          </div>
        </div>
        <div class="dlg-f"><button type="button" class="btn btn-dark btn-lg" @click="$emit('close')">סיום</button></div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, type PropType } from "vue";
import QrcodeVue from "qrcode.vue";
import BuilderIcon from "./BuilderIcon.vue";
import type { SlugUiStatus } from "./builderTypes";
import { hubDisplayUrl, hubFullUrl, whatsappShareUrl } from "./hubPublicUrl";
import WorkspaceSlugField from "./WorkspaceSlugField.vue";

/** Publish dialog (slug check + readiness list) and the «העמוד באוויר» share screen. */
export default defineComponent({
  name: "WorkspacePublishDialog",
  components: { BuilderIcon, QrcodeVue, WorkspaceSlugField },
  props: {
    mode: { type: String as PropType<"publish" | "done">, required: true },
    slug: { type: String, required: true },
    slugStatus: { type: String as PropType<SlugUiStatus>, required: true },
    suggestions: { type: Array as PropType<string[]>, default: () => [] },
    prefix: { type: String, required: true },
    basicsOk: { type: Boolean, default: true },
    sectionCount: { type: Number, default: 0 },
    samples: { type: Array as PropType<string[]>, default: () => [] },
    busy: { type: Boolean, default: false },
    live: { type: Boolean, default: true },
    titleText: { type: String, default: "" },
    /** Optional alert, e.g. the event landing is already live at this slug. */
    warning: { type: String, default: "" },
    /** Hide landing section/sample checks (Save the Date publish). Default off. */
    hideChecks: { type: Boolean, default: false },
  },
  emits: ["close", "publish", "slug", "slug-blur", "suggest"],
  setup(props, { emit }) {
    const dlgEl = ref<HTMLElement | null>(null);
    const qrEl = ref<HTMLElement | null>(null);
    const copied = ref(false);
    const fullUrl = computed(() => hubFullUrl(props.slug));
    const displayUrl = computed(() => hubDisplayUrl(props.slug));
    const waUrl = computed(() => whatsappShareUrl(props.titleText || "האירוע", props.slug));
    let copyT: ReturnType<typeof setTimeout> | null = null;

    async function copy() {
      try {
        await navigator.clipboard.writeText(fullUrl.value);
      } catch {
        /* clipboard blocked: the link is visible to copy by hand */
      }
      copied.value = true;
      if (copyT) clearTimeout(copyT);
      copyT = setTimeout(() => (copied.value = false), 1800);
    }
    function downloadQr() {
      const svg = qrEl.value?.querySelector("svg");
      if (!svg) return;
      const xml = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([xml], { type: "image/svg+xml" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `qr-${props.slug || "event"}.svg`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") emit("close");
    }
    onMounted(() => {
      document.addEventListener("keydown", onKey);
      setTimeout(() => {
        const f = dlgEl.value?.querySelector<HTMLElement>(".slug-in input, .link-box .btn");
        f?.focus({ preventScroll: true });
      }, 30);
    });
    onBeforeUnmount(() => {
      document.removeEventListener("keydown", onKey);
      if (copyT) clearTimeout(copyT);
    });
    return { dlgEl, qrEl, copied, fullUrl, displayUrl, waUrl, copy, downloadQr };
  },
});
</script>

<style scoped>
.dlg-warn {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fff4e5;
  color: #6a3b00;
  font-size: 0.92rem;
  line-height: 1.45;
}
</style>
