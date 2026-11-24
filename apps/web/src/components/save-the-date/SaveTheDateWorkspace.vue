<template>
  <div
    class="bw3 app"
    :class="{ full, 'sheet-open': sheet && isMobile, 'dev-desktop': device === 'desktop' && !isMobile, shot: shotMode }"
    dir="rtl"
    lang="he"
  >
    <header class="tb">
      <div class="tb-start">
        <button type="button" class="icon-btn back" aria-label="חזרה ללוח האירוע" title="חזרה ללוח האירוע" @click="goBack">
          <BuilderIcon name="arrowR" />
        </button>
        <span class="logo-mark" aria-hidden="true"
          ><svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="7.2" stroke="#C9A36A" stroke-width="1.8" />
            <circle cx="12" cy="12" r="2.6" fill="#DC5B66" /></svg
        ></span>
        <div class="tb-title"><b>Save the Date</b><span>{{ titleText || "האירוע" }}</span></div>
        <button
          v-if="saveStatus === 'error'"
          type="button"
          class="save"
          data-s="error"
          :title="saveErrorText"
          @click="retrySave"
        >
          <span class="dot"></span>לא נשמר · לנסות שוב
        </button>
        <span v-else class="save" :data-s="saveStatus" role="status" aria-live="polite"
          ><span class="dot"></span
          >{{ saveStatus === "saving" ? "שומר…" : stdLive ? "נשמר ועודכן באתר ✓" : "נשמר ✓" }}</span
        >
      </div>
      <div class="tb-mid">
        <div class="seg" role="group" aria-label="גודל מסך בתצוגה">
          <button type="button" :aria-pressed="device === 'phone' ? 'true' : 'false'" @click="device = 'phone'">
            <BuilderIcon name="phone" />טלפון
          </button>
          <button type="button" :aria-pressed="device === 'desktop' ? 'true' : 'false'" @click="device = 'desktop'">
            <BuilderIcon name="desk" />מחשב
          </button>
        </div>
        <div class="undo">
          <button type="button" class="icon-btn" aria-label="ביטול פעולה" title="ביטול (Ctrl+Z)" :disabled="!canUndo" @click="undo">
            <BuilderIcon name="undo" />
          </button>
          <button type="button" class="icon-btn" aria-label="ביצוע שוב" title="ביצוע שוב (Ctrl+Shift+Z)" :disabled="!canRedo" @click="redo">
            <BuilderIcon name="redo" />
          </button>
        </div>
      </div>
      <div class="tb-end">
        <button type="button" class="btn btn-line" @click="setFull(true)"><BuilderIcon name="eye" /><span>תצוגה מלאה</span></button>
        <button v-if="stdLive" type="button" class="btn btn-live" @click="openDlg('done')">
          <BuilderIcon name="send" /><span>שיתוף</span><small>באוויר</small>
        </button>
        <button v-else-if="ready" type="button" class="btn btn-dark" @click="openDlg('publish')">
          <BuilderIcon name="globe" /><span>פרסום</span>
        </button>
      </div>
      <div class="tb-mob">
        <button type="button" class="icon-btn" aria-label="ביטול פעולה" :disabled="!canUndo" @click="undo"><BuilderIcon name="undo" /></button>
      </div>
    </header>

    <main class="ws">
      <div v-if="loadState !== 'ready' || !slice" class="ws-state" :role="loadState === 'error' ? 'alert' : 'status'">
        <template v-if="loadState === 'error'">
          <h2>לא הצלחנו לטעון את Save the Date</h2>
          <p>{{ loadError }}</p>
          <button type="button" class="btn btn-dark" @click="load">נסו שוב</button>
        </template>
        <template v-else>טוען את Save the Date…</template>
      </div>
      <template v-else>
        <aside class="panel" aria-label="עריכת Save the Date">
          <div class="sheet-head">
            <span class="grab" aria-hidden="true"></span>
            <button type="button" class="icon-btn sheet-x" aria-label="סגירה" @click="sheet = false"><BuilderIcon name="x" /></button>
          </div>
          <div class="ptabs" role="tablist">
            <button
              v-for="t in tabs"
              :key="t.id"
              type="button"
              role="tab"
              :aria-selected="tab === t.id ? 'true' : 'false'"
              @click="setTab(t.id)"
            >
              <BuilderIcon :name="t.icon" />{{ t.he }}
            </button>
          </div>
          <div ref="pbodyEl" class="pbody">
            <div v-if="backendOutdated || (saveStatus === 'error' && saveErrorText)" class="ws-banner" role="alert">
              <p v-for="(line, i) in bannerLines" :key="i">{{ line }}</p>
            </div>
            <SaveTheDateStyleTab
              v-if="tab === 'style'"
              :slice="slice"
              :slug="effectiveSlug"
              @style="onStyle"
              @opt="onOpt"
              @replay="replayTick += 1"
            />
            <SaveTheDateContentTab
              v-else-if="tab === 'content'"
              :slice="slice"
              :event-id="eventId"
              :template-id="pickerTemplateId"
              :asset-urls="assetUrls"
              :stock-urls="stockUrls"
              @content="onContent"
              @show="onShow"
              @photo="onPhoto"
              @focus-field="beginTyping"
            />
            <WorkspaceSettingsTab
              v-else
              :slug="slug"
              :slug-status="slugStatus"
              :suggestions="slugSuggestions"
              :prefix="prefix"
              :published="stdLive"
              :ever-published="stdEverPublished && !landingLive"
              :busy="publishing"
              show-graduate
              @slug="onSlugInput"
              @slug-blur="onSlugBlur"
              @suggest="onSuggest"
              @visible="onVisible"
              @publish="openDlg('publish')"
              @share="openDlg('done')"
              @reset="onReset"
              @graduate="onGraduate"
            />
          </div>
        </aside>
        <WorkspaceStage
          v-if="previewConfig"
          :template-id="pickerTemplateId"
          :hub-config="previewConfig"
          :device="device"
          :mobile="isMobile"
          :full="full"
          :labels="previewLabels"
          :url-text="urlText"
          :show-hint="false"
          @pick="onPick"
          @exit-full="setFull(false)"
          @escape="onEscape"
        />
      </template>
    </main>

    <nav class="mbar" aria-label="עריכה">
      <button
        v-for="m in mbar"
        :key="m.id"
        type="button"
        :class="{ on: sheet && tab === m.id, pub: m.id === 'publish' }"
        @click="onMbar(m.id)"
      >
        <BuilderIcon :name="m.icon" /><span>{{ m.he }}</span>
      </button>
    </nav>

    <WorkspacePublishDialog
      v-if="dlg && slice"
      :mode="dlg"
      :slug="dlg === 'done' ? serverSlug || effectiveSlug : slug"
      :slug-status="slugStatus"
      :suggestions="slugSuggestions"
      :prefix="prefix"
      :basics-ok="basicsOk"
      hide-checks
      :busy="publishing"
      :live="stdLive"
      :title-text="titleText"
      :warning="publishWarning"
      @close="dlg = ''"
      @publish="onPublish"
      @slug="onSlugInput"
      @slug-blur="onSlugBlur"
      @suggest="onSuggest"
    />

    <div class="toast" :class="{ on: !!toast.msg }" role="status" aria-live="polite">
      <span>{{ toast.msg }}</span>
      <button v-if="toast.undo" type="button" @click="toastUndo">ביטול</button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  backendOutdatedMessage,
  checkHubSlug,
  classifyHubError,
  getAdminHub,
  getHubAssets,
  updateHub,
  type UpdateHubPayload,
} from "@/api/eventHub";
import { notify } from "@/helpers/notify";
import { stockMapForTemplate } from "@/components/landing/templates/registry";
import type { HubBlock, HubConfig, HubPresentation, HubTheme, ImageRef } from "@/components/landing/types";
import "@/components/landing/builder/builderWorkspace.css";
import "@/components/landing/builder/builderWorkspaceExtra.css";
import type { PreviewDevice, SaveStatus, SlugUiStatus } from "@/components/landing/builder/builderTypes";
import { localSlugStatus, normalizeSlug, slugCandidates, suggestSlug } from "@/components/landing/builder/hubWizardModel";
import { cloneHubConfig } from "@/components/landing/builder/hubBuilderUtils";
import { hubDisplayUrl, hubPrefix } from "@/components/landing/builder/hubPublicUrl";
import BuilderIcon from "@/components/landing/builder/BuilderIcon.vue";
import WorkspacePublishDialog from "@/components/landing/builder/WorkspacePublishDialog.vue";
import WorkspaceSettingsTab from "@/components/landing/builder/WorkspaceSettingsTab.vue";
import WorkspaceStage from "@/components/landing/builder/WorkspaceStage.vue";
import { type StyleId } from "./saveTheDateCatalog";
import {
  isSliceEmpty,
  patchContent,
  patchShow,
  resolvePhotoSrc,
  seedSlice,
  setStyle,
  setStyleOpt,
  sliceTitle,
  type SaveTheDateSlice,
} from "./saveTheDateModel";
import SaveTheDateContentTab from "./SaveTheDateContentTab.vue";
import SaveTheDateStyleTab from "./SaveTheDateStyleTab.vue";

const DEBOUNCE_MS = 800;
const RETRY_MS = [5000, 15000, 30000];
const SLUG_DEBOUNCE_MS = 400;
const HISTORY_MAX = 80;
const STD_PUB_KEY = (id: number) => `snapshare.std.published.${id}`;

type Tab = "style" | "content" | "settings";
const mobileNow = () => typeof window !== "undefined" && window.innerWidth < 760;

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}
function lsGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode */
  }
}

/**
 * Sibling of EventPageWorkspace: same .bw3 chrome, Settings / Stage / PublishDialog reused.
 * Autosave never flips presentation or is_published. Publish and graduate are explicit.
 */
export default defineComponent({
  name: "SaveTheDateWorkspace",
  components: {
    BuilderIcon,
    WorkspacePublishDialog,
    WorkspaceSettingsTab,
    WorkspaceStage,
    SaveTheDateStyleTab,
    SaveTheDateContentTab,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const q = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const shotMode = q.has("shot");

    const loadState = ref<"loading" | "ready" | "error">("loading");
    const loadError = ref("");
    const slice = ref<SaveTheDateSlice | null>(null);
    const landingConfig = ref<HubConfig | null>(null);
    const serverPresentation = ref<HubPresentation>("landing");
    const serverPublished = ref(false);
    const serverSlug = ref<string | null>(null);
    const slug = ref("");
    const stdEverPublished = ref(false);
    const replayTick = ref(0);

    const tab = ref<Tab>((["style", "content", "settings"] as Tab[]).includes(q.get("tab") as Tab) ? (q.get("tab") as Tab) : "style");
    const device = ref<PreviewDevice>(q.get("device") === "desktop" ? "desktop" : "phone");
    const full = ref(false);
    const sheet = ref(q.get("sheet") === "1");
    const dlg = ref<"" | "publish" | "done">((q.get("dlg") === "publish" || q.get("dlg") === "done" ? q.get("dlg") : "") as "" | "publish" | "done");
    const isMobile = ref(mobileNow());
    const toast = reactive<{ msg: string; undo: boolean }>({ msg: "", undo: false });
    const pbodyEl = ref<HTMLElement | null>(null);
    const publishing = ref(false);

    const saveStatus = ref<SaveStatus>("saved");
    const saveErrorText = ref("");
    const backendOutdated = ref(false);
    const slugStatus = ref<SlugUiStatus>("idle");
    const slugSuggestions = ref<string[]>([]);
    const freeSlug = ref("");
    const assetUrls = ref<Record<string, { url: string; thumb_url?: string }>>({});

    const event = computed(() => store.getters["event/getEvent"]);
    const eventId = computed(() => Number(event.value?.id || 0));
    const ready = computed(() => loadState.value === "ready" && !!slice.value);
    const stdLive = computed(() => serverPublished.value && serverPresentation.value === "save_the_date");
    const landingLive = computed(() => serverPublished.value && serverPresentation.value === "landing" && !!serverSlug.value);
    const prefix = hubPrefix();
    const effectiveSlug = computed(() => normalizeSlug(slug.value || ""));
    const urlText = computed(() => hubDisplayUrl(effectiveSlug.value || "…"));
    const pickerTemplateId = computed(() => String(landingConfig.value?.template_id || "wedding-1"));
    const stockUrls = computed(() => {
      const map = stockMapForTemplate(pickerTemplateId.value);
      const out: Record<string, string> = {};
      Object.entries(map).forEach(([k, v]) => {
        if (v && v.url) out[k] = v.url;
      });
      return out;
    });
    const titleText = computed(() => sliceTitle(slice.value));
    const basicsOk = computed(() => {
      const c = slice.value?.content;
      if (!c || !c.date) return false;
      if (c.kind === "wedding") return !!(c.a || c.b);
      return !!c.title;
    });
    const publishWarning = computed(() =>
      landingLive.value
        ? "דף האירוע כבר באוויר בכתובת הזו. פרסום ה-Save the Date יחליף אותו בקישור הזה. אפשר לחזור לדף האירוע המלא מאוחר יותר, בלי לדרוס את כותרת הגיבור."
        : ""
    );
    const previewLabels = {
      names: "שמות",
      date: "תאריך",
      venue: "מקום",
      line: "שורה",
      countdown: "ספירה",
      calendar: "יומן",
      whatsapp: "וואטסאפ",
    };
    const bannerLines = computed(() =>
      backendOutdated.value
        ? backendOutdatedMessage().split("\n").filter(Boolean)
        : saveErrorText.value
          ? [saveErrorText.value]
          : []
    );

    const tabs: Array<{ id: Tab; icon: string; he: string }> = [
      { id: "style", icon: "palette", he: "סגנון" },
      { id: "content", icon: "layers", he: "תוכן" },
      { id: "settings", icon: "gear", he: "הגדרות" },
    ];
    const mbar = computed(() => [
      { id: "style", icon: "palette", he: "סגנון" },
      { id: "content", icon: "layers", he: "תוכן" },
      { id: "view", icon: "eye", he: "תצוגה" },
      { id: "publish", icon: "globe", he: stdLive.value ? "שיתוף" : "פרסום" },
    ]);

    const previewConfig = computed<HubConfig | null>(() => {
      if (!slice.value || !landingConfig.value) return null;
      const base = cloneHubConfig(landingConfig.value);
      base.presentation = "save_the_date";
      const previewSlice = clone(slice.value);
      const src = resolvePhotoSrc(previewSlice.content && previewSlice.content.photo, {
        assetUrls: assetUrls.value,
        stockUrls: stockUrls.value,
      });
      if (src && previewSlice.content) previewSlice.content.photo = src;
      base.save_the_date = previewSlice;
      const extra = base as HubConfig & { slug?: string; std_replay_tick?: number };
      extra.slug = effectiveSlug.value;
      extra.std_replay_tick = replayTick.value;
      return base;
    });

    /* ---------------- undo ---------------- */
    const past = ref<string[]>([]);
    const future = ref<string[]>([]);
    const canUndo = computed(() => past.value.length > 0);
    const canRedo = computed(() => future.value.length > 0);
    let typingSnap: string | null = null;

    function snap(): string {
      return JSON.stringify({ slice: slice.value, slug: slug.value });
    }
    function remember() {
      typingSnap = null;
      past.value = [...past.value.slice(-(HISTORY_MAX - 1)), snap()];
      future.value = [];
    }
    function beginTyping() {
      typingSnap = snap();
    }
    function rememberTyping() {
      if (typingSnap === null) return;
      past.value = [...past.value.slice(-(HISTORY_MAX - 1)), typingSnap];
      future.value = [];
      typingSnap = null;
    }
    function restore(json: string) {
      const next = JSON.parse(json) as { slice: SaveTheDateSlice; slug: string };
      slice.value = next.slice;
      slug.value = next.slug;
      typingSnap = null;
      touch();
      if (tab.value === "settings" || dlg.value === "publish") scheduleSlugCheck(true);
    }
    function undo() {
      if (!past.value.length || !slice.value) return;
      const prev = past.value[past.value.length - 1];
      future.value = [...future.value, snap()];
      past.value = past.value.slice(0, -1);
      restore(prev);
    }
    function redo() {
      if (!future.value.length || !slice.value) return;
      const nxt = future.value[future.value.length - 1];
      past.value = [...past.value, snap()];
      future.value = future.value.slice(0, -1);
      restore(nxt);
    }

    let toastT: ReturnType<typeof setTimeout> | null = null;
    function showToast(msg: string, withUndo = false) {
      toast.msg = msg;
      toast.undo = withUndo;
      if (toastT) clearTimeout(toastT);
      toastT = setTimeout(() => (toast.msg = ""), shotMode ? 600000 : 4200);
    }
    function toastUndo() {
      undo();
      toast.msg = "";
    }

    /* ---------------- autosave: never flips presentation or is_published ---------------- */
    let debounceT: ReturnType<typeof setTimeout> | null = null;
    let retryT: ReturnType<typeof setTimeout> | null = null;
    let inFlight: Promise<void> | null = null;
    let dirty = false;
    let attempt = 0;

    function clearTimers() {
      if (debounceT) clearTimeout(debounceT);
      if (retryT) clearTimeout(retryT);
      debounceT = null;
      retryT = null;
    }
    function touch() {
      if (!slice.value) return;
      dirty = true;
      saveStatus.value = "saving";
      if (retryT) {
        clearTimeout(retryT);
        retryT = null;
      }
      if (debounceT) clearTimeout(debounceT);
      debounceT = setTimeout(() => {
        debounceT = null;
        void runSave();
      }, DEBOUNCE_MS);
    }
    function landingPayloadConfig(): HubConfig | null {
      const landing = landingConfig.value;
      const sl = slice.value;
      if (!landing || !sl) return null;
      const out = cloneHubConfig(landing);
      out.presentation = serverPresentation.value;
      out.save_the_date = clone(sl);
      return out;
    }
    function buildPayload(override?: { presentation?: HubPresentation; is_published?: boolean }): UpdateHubPayload | null {
      const cfg = landingPayloadConfig();
      if (!cfg || !slice.value) return null;
      if (override?.presentation) cfg.presentation = override.presentation;
      const published = override?.is_published ?? serverPublished.value;
      const slugVal = published
        ? serverSlug.value
        : freeSlug.value && freeSlug.value === effectiveSlug.value
          ? freeSlug.value
          : serverSlug.value;
      return { slug: slugVal, is_published: published, hub_config: cfg };
    }
    function runSave(): Promise<void> {
      if (inFlight) return inFlight;
      if (!dirty || !slice.value || !eventId.value) return Promise.resolve();
      if (backendOutdated.value) {
        saveStatus.value = "error";
        return Promise.resolve();
      }
      const payload = buildPayload();
      if (!payload) return Promise.resolve();
      dirty = false;
      saveStatus.value = "saving";
      inFlight = (async () => {
        try {
          await updateHub(eventId.value, payload);
          attempt = 0;
          if (payload.slug) serverSlug.value = payload.slug;
          saveErrorText.value = "";
          if (!dirty) saveStatus.value = "saved";
        } catch (err) {
          dirty = true;
          onSaveError(err);
        } finally {
          inFlight = null;
        }
        if (dirty && !debounceT && !retryT && saveStatus.value !== "error") await runSave();
      })();
      return inFlight;
    }
    function onSaveError(err: unknown) {
      const cls = classifyHubError(err, { usesTemplate: !!landingConfig.value?.template_id });
      saveStatus.value = "error";
      saveErrorText.value = cls.message.split("\n")[0];
      if (cls.kind === "backend_outdated") {
        backendOutdated.value = true;
        return;
      }
      if (cls.kind === "unauthorized" || cls.kind === "forbidden" || cls.kind === "validation") return;
      if (attempt < RETRY_MS.length) {
        retryT = setTimeout(() => {
          retryT = null;
          void runSave();
        }, RETRY_MS[attempt++]);
      }
    }
    function retrySave() {
      attempt = 0;
      if (retryT) clearTimeout(retryT);
      retryT = null;
      dirty = true;
      void runSave();
    }
    async function flush(): Promise<boolean> {
      if (debounceT) {
        clearTimeout(debounceT);
        debounceT = null;
      }
      if (retryT) {
        clearTimeout(retryT);
        retryT = null;
      }
      for (let i = 0; i < 5; i++) {
        if (inFlight) await inFlight;
        if (!dirty) return saveStatus.value !== "error";
        await runSave();
        if (saveStatus.value === "error") return false;
      }
      return !dirty;
    }
    function onVisibility() {
      if (document.visibilityState === "hidden") void flush();
    }

    /* ---------------- load + seed ---------------- */
    async function loadAssets() {
      if (!eventId.value) return;
      try {
        const res = await getHubAssets(eventId.value, 1, 48);
        const map: Record<string, { url: string; thumb_url?: string }> = {};
        (res.data || []).forEach((a) => {
          map[String(a.id)] = { url: a.url, thumb_url: a.thumb_url };
        });
        assetUrls.value = map;
      } catch {
        /* picker will retry on open */
      }
    }

    async function load() {
      if (!eventId.value) {
        loadState.value = "error";
        loadError.value = "לא נמצא אירוע פעיל.";
        return;
      }
      loadState.value = "loading";
      loadError.value = "";
      backendOutdated.value = false;
      clearTimers();
      dirty = false;
      try {
        const hub = await getAdminHub(eventId.value);
        const raw = (hub.hub_config || {}) as Partial<HubConfig>;
        const landing: HubConfig = {
          template_id: String(raw.template_id || ""),
          theme: (raw.theme || { palette_id: "default" }) as HubTheme,
          blocks: Array.isArray(raw.blocks) ? (raw.blocks as HubBlock[]) : [],
        };
        landingConfig.value = landing;
        serverPresentation.value = raw.presentation === "save_the_date" ? "save_the_date" : "landing";
        serverPublished.value = Boolean(hub.is_published);
        serverSlug.value = hub.slug || null;
        slug.value = hub.slug || "";
        stdEverPublished.value = serverPresentation.value === "save_the_date" || lsGet(STD_PUB_KEY(eventId.value)) === "1";

        let next = raw.save_the_date ? clone(raw.save_the_date) : null;
        let seeded = false;
        if (isSliceEmpty(next)) {
          next = seedSlice(
            {
              name: event.value?.name,
              starts_at: event.value?.starts_at,
              event_type: event.value?.event_type,
              image: event.value?.image,
            },
            landing.blocks
          );
          seeded = true;
        }
        slice.value = next;
        loadState.value = "ready";
        saveStatus.value = "saved";
        scheduleSlugCheck(true);
        void loadAssets();
        if (seeded) touch();
      } catch (err) {
        const cls = classifyHubError(err, { usesTemplate: false });
        loadState.value = "error";
        loadError.value = cls.message.split("\n")[0] || "טעינה נכשלה.";
      }
    }

    /* ---------------- edits ---------------- */
    function onStyle(id: StyleId) {
      if (!slice.value) return;
      remember();
      slice.value = setStyle(slice.value, id);
      touch();
    }
    function onOpt(key: string, value: string | boolean) {
      if (!slice.value) return;
      remember();
      slice.value = setStyleOpt(slice.value, key, value);
      touch();
    }
    function onContent(patch: Record<string, unknown>) {
      if (!slice.value) return;
      rememberTyping();
      slice.value = patchContent(slice.value, patch);
      touch();
    }
    function onShow(patch: Record<string, boolean>) {
      if (!slice.value) return;
      remember();
      slice.value = patchShow(slice.value, patch);
      touch();
    }
    function onPhoto(ref: ImageRef | null) {
      if (!slice.value) return;
      remember();
      slice.value = patchContent(slice.value, { photo: ref });
      touch();
    }
    function onReset() {
      if (!slice.value) return;
      remember();
      slice.value = seedSlice(
        {
          name: event.value?.name,
          starts_at: event.value?.starts_at,
          event_type: event.value?.event_type,
          image: event.value?.image,
        },
        landingConfig.value?.blocks
      );
      touch();
      showToast("חזרנו לברירת המחדל לפי סוג האירוע", true);
    }
    function onPick(sectionId: string) {
      tab.value = "content";
      sheet.value = true;
      const map: Record<string, string> = { names: "a", date: "date", venue: "venue", line: "line" };
      const sel = map[sectionId] || sectionId;
      requestAnimationFrame(() => {
        const el = pbodyEl.value?.querySelector<HTMLElement>(`[data-field="${sel}"], input[type="${sel === "date" ? "date" : "text"}"]`);
        el?.focus();
      });
    }
    function setTab(id: Tab) {
      tab.value = id;
      sheet.value = true;
    }
    function setFull(v: boolean) {
      full.value = v;
    }
    function onMbar(id: string) {
      if (id === "view") {
        if (isMobile.value) {
          sheet.value = false;
        } else {
          setFull(true);
        }
        return;
      }
      if (id === "publish") {
        openDlg(stdLive.value ? "done" : "publish");
        return;
      }
      setTab(id as Tab);
    }
    function openDlg(mode: "publish" | "done") {
      dlg.value = mode;
      if (mode === "publish") scheduleSlugCheck(true);
    }
    function goBack() {
      void flush().finally(() => router.push("/event"));
    }

    /* ---------------- slug ---------------- */
    const slugCache = new Map<string, SlugUiStatus>();
    let slugT: ReturnType<typeof setTimeout> | null = null;
    let slugReq = 0;
    function slugEvent() {
      const c = slice.value?.content;
      return {
        type: (c?.kind === "wedding" ? "wedding" : "other") as "wedding" | "other",
        name1: c?.a || "",
        name2: c?.b || "",
        title: c?.title || titleText.value,
        date: c?.date || "",
        id: eventId.value,
      };
    }
    async function checkOne(s: string): Promise<SlugUiStatus> {
      const hit = slugCache.get(s);
      if (hit) return hit;
      const res = await checkHubSlug(eventId.value, s);
      const out = res.available
        ? "free"
        : res.reason === "reserved"
          ? "reserved"
          : res.reason === "invalid"
            ? "invalid"
            : "taken";
      slugCache.set(s, out);
      return out as SlugUiStatus;
    }
    async function loadSuggestions(s: string, req: number) {
      const cands = slugCandidates(s, slugEvent()).slice(0, 6);
      const results = await Promise.all(cands.map((c) => checkOne(c).then((r) => (r === "free" ? c : "")).catch(() => "")));
      if (req !== slugReq) return;
      slugSuggestions.value = results.filter(Boolean).slice(0, 3);
    }
    function scheduleSlugCheck(immediate = false) {
      if (slugT) clearTimeout(slugT);
      slugT = null;
      const s = effectiveSlug.value;
      const local = localSlugStatus(s);
      if (local !== "ok") {
        slugReq++;
        slugStatus.value = local as SlugUiStatus;
        slugSuggestions.value = [];
        if (local !== "empty") void loadSuggestions(s || suggestSlug(slugEvent()), slugReq);
        return;
      }
      if (s === serverSlug.value) {
        slugReq++;
        slugStatus.value = "free";
        slugSuggestions.value = [];
        freeSlug.value = s;
        return;
      }
      slugStatus.value = "checking";
      slugSuggestions.value = [];
      slugT = setTimeout(() => void runSlugCheck(s), immediate ? 0 : SLUG_DEBOUNCE_MS);
    }
    async function runSlugCheck(s: string) {
      const req = ++slugReq;
      try {
        const result = await checkOne(s);
        if (req !== slugReq || s !== effectiveSlug.value) return;
        if (result === "free") {
          slugStatus.value = "free";
          freeSlug.value = s;
          slugSuggestions.value = [];
          if (!serverPublished.value && s !== serverSlug.value) touch();
        } else {
          slugStatus.value = result;
          await loadSuggestions(s, req);
        }
      } catch (err) {
        if (req !== slugReq) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) backendOutdated.value = true;
        else if (status === 422) slugStatus.value = "invalid";
        else slugStatus.value = "error";
      }
    }
    function onSlugInput(value: string) {
      rememberTyping();
      slug.value = value;
      scheduleSlugCheck();
    }
    function onSlugBlur() {
      const n = normalizeSlug(slug.value);
      if (n !== slug.value) {
        slug.value = n;
        scheduleSlugCheck();
      }
    }
    function onSuggest(s: string) {
      remember();
      slug.value = s;
      slugStatus.value = "free";
      freeSlug.value = s;
      slugSuggestions.value = [];
      slugReq++;
      if (!serverPublished.value) touch();
    }

    /* ---------------- publish / hide / graduate ---------------- */
    async function onPublish() {
      if (!slice.value || publishing.value || slugStatus.value !== "free") return;
      publishing.value = true;
      try {
        const ok = await flush();
        if (!ok) {
          notify({ text: "לא הצלחנו לשמור את השינויים. נסו שוב.", type: "error", duration: 4000 });
          return;
        }
        const wantSlug = effectiveSlug.value || freeSlug.value;
        const payload = buildPayload({ presentation: "save_the_date", is_published: true });
        if (!payload) return;
        payload.slug = wantSlug;
        await updateHub(eventId.value, payload);
        serverPresentation.value = "save_the_date";
        serverPublished.value = true;
        serverSlug.value = wantSlug;
        stdEverPublished.value = true;
        lsSet(STD_PUB_KEY(eventId.value), "1");
        dlg.value = "done";
      } catch (err) {
        const cls = classifyHubError(err, { usesTemplate: !!landingConfig.value?.template_id });
        notify({ text: cls.message.split("\n")[0], type: "error", duration: 4500 });
      } finally {
        publishing.value = false;
      }
    }
    async function onVisible(show: boolean) {
      if (!slice.value || publishing.value) return;
      publishing.value = true;
      try {
        await flush();
        const payload = buildPayload({
          presentation: "save_the_date",
          is_published: show,
        });
        if (!payload) return;
        if (show) payload.slug = serverSlug.value || effectiveSlug.value;
        await updateHub(eventId.value, payload);
        serverPublished.value = show;
        serverPresentation.value = "save_the_date";
        showToast(show ? "העמוד חזר לאוויר" : "העמוד מוסתר מהאורחים");
      } catch (err) {
        const cls = classifyHubError(err, { usesTemplate: false });
        notify({ text: cls.message.split("\n")[0], type: "error", duration: 4500 });
      } finally {
        publishing.value = false;
      }
    }
    async function onGraduate() {
      if (!slice.value || publishing.value) return;
      publishing.value = true;
      try {
        const ok = await flush();
        if (!ok) {
          notify({ text: "לא הצלחנו לשמור. נסו שוב לפני המעבר לדף האירוע.", type: "error", duration: 4000 });
          return;
        }
        const payload = buildPayload({ presentation: "landing", is_published: serverPublished.value });
        if (!payload) return;
        await updateHub(eventId.value, payload);
        serverPresentation.value = "landing";
        await router.push("/event/page");
      } catch (err) {
        const cls = classifyHubError(err, { usesTemplate: false });
        notify({ text: cls.message.split("\n")[0], type: "error", duration: 4500 });
      } finally {
        publishing.value = false;
      }
    }

    function onEscape() {
      if (dlg.value) dlg.value = "";
      else if (sheet.value) sheet.value = false;
      else if (full.value) setFull(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !dlg.value) onEscape();
      const tgt = e.target as HTMLElement | null;
      const typing = !!tgt && /INPUT|TEXTAREA|SELECT/.test(tgt.tagName);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !typing) {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    }
    function onResize() {
      isMobile.value = mobileNow();
    }

    onMounted(() => {
      void load();
      window.addEventListener("keydown", onKey);
      window.addEventListener("resize", onResize);
      document.addEventListener("visibilitychange", onVisibility);
    });
    onBeforeUnmount(() => {
      clearTimers();
      if (slugT) clearTimeout(slugT);
      if (toastT) clearTimeout(toastT);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    });

    watch(eventId, (id, prev) => {
      if (id && id !== prev) void load();
    });

    return {
      shotMode,
      loadState,
      loadError,
      slice,
      ready,
      stdLive,
      landingLive,
      tab,
      tabs,
      mbar,
      device,
      full,
      sheet,
      isMobile,
      dlg,
      toast,
      pbodyEl,
      publishing,
      saveStatus,
      saveErrorText,
      backendOutdated,
      bannerLines,
      slug,
      slugStatus,
      slugSuggestions,
      prefix,
      effectiveSlug,
      serverSlug,
      stdEverPublished,
      titleText,
      urlText,
      basicsOk,
      publishWarning,
      previewConfig,
      previewLabels,
      pickerTemplateId,
      eventId,
      assetUrls,
      stockUrls,
      canUndo,
      canRedo,
      replayTick,
      load,
      retrySave,
      goBack,
      setTab,
      setFull,
      onMbar,
      openDlg,
      onStyle,
      onOpt,
      onContent,
      onShow,
      onPhoto,
      onReset,
      onGraduate,
      onVisible,
      onPublish,
      onSlugInput,
      onSlugBlur,
      onSuggest,
      onPick,
      onEscape,
      undo,
      redo,
      toastUndo,
      beginTyping,
      flush,
    };
  },
});
</script>
