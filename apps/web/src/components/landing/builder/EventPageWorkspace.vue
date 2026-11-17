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
        <div class="tb-title"><b>דף האירוע</b><span>{{ titleText || "האירוע" }}</span></div>
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
          >{{ saveStatus === "saving" ? "שומר…" : state && state.is_published ? "נשמר ועודכן באתר ✓" : "נשמר ✓" }}</span
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
        <button v-if="state && state.is_published" type="button" class="btn btn-live" @click="openDlg('done')">
          <BuilderIcon name="send" /><span>שיתוף</span><small>באוויר</small>
        </button>
        <button v-else-if="state" type="button" class="btn btn-dark" @click="openDlg('publish')">
          <BuilderIcon name="globe" /><span>פרסום</span>
        </button>
      </div>
      <div class="tb-mob">
        <button type="button" class="icon-btn" aria-label="ביטול פעולה" :disabled="!canUndo" @click="undo"><BuilderIcon name="undo" /></button>
      </div>
    </header>

    <main class="ws">
      <div v-if="loadState !== 'ready' || !state" class="ws-state" :role="loadState === 'error' ? 'alert' : 'status'">
        <template v-if="loadState === 'error'">
          <h2>לא הצלחנו לטעון את דף האירוע</h2>
          <p>{{ loadError }}</p>
          <button type="button" class="btn btn-dark" @click="load">נסו שוב</button>
        </template>
        <template v-else>טוען את דף האירוע…</template>
      </div>
      <template v-else>
        <aside class="panel" aria-label="עריכת העמוד">
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
            <WorkspaceDesignTab
              v-if="tab === 'design'"
              v-model:filter="filter"
              v-model:filter-open="filterOpen"
              :template-id="state.template_id"
              :palette-id="state.theme.palette_id"
              :font-id="fontNow"
              :sample-word="state.event.name1 || state.event.title || 'אבג'"
              @template="pickTemplate"
              @palette="onPalette"
              @font="onFont"
            />
            <WorkspaceSettingsTab
              v-else-if="tab === 'settings'"
              :slug="state.slug"
              :slug-status="slugStatus"
              :suggestions="slugSuggestions"
              :prefix="prefix"
              :published="state.is_published"
              :ever-published="everPublished"
              :busy="publishing"
              @slug="onSlugInput"
              @slug-blur="onSlugBlur"
              @suggest="onSuggest"
              @visible="onVisible"
              @publish="openDlg('publish')"
              @share="openDlg('done')"
              @reset="onReset"
            />
            <WorkspaceContentTab
              v-else
              :event="state.event"
              :content="state.content"
              :order="orderedKinds"
              :on="onMap"
              :open-kind="openKind"
              :event-id="eventId"
              :template-id="state.template_id"
              :asset-urls="assetUrls"
              :errors="kindErrors"
              :essentials-error="essentialsError"
              :scroller="pbodyEl"
              @open="openRow"
              @toggle="setOn"
              @move="moveKind"
              @reorder="onReorder"
              @content="onContent"
              @event-field="onEventField"
              @focus-field="beginTyping"
            />
          </div>
        </aside>
        <WorkspaceStage
          v-if="previewConfig"
          :template-id="state.template_id"
          :hub-config="previewConfig"
          :device="device"
          :mobile="isMobile"
          :full="full"
          :labels="labels"
          :selected-id="selectedBlockId"
          :scroll-id="scrollTarget.id"
          :scroll-tick="scrollTarget.tick"
          :url-text="urlText"
          :show-hint="hint && !full"
          @pick="onPick"
          @hint-ok="dismissHint"
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
      v-if="dlg && state"
      :mode="dlg"
      :slug="dlg === 'done' ? serverSlug || effectiveSlug : state.slug"
      :slug-status="slugStatus"
      :suggestions="slugSuggestions"
      :prefix="prefix"
      :basics-ok="basicsOk"
      :section-count="sectionCount"
      :samples="sampleNames"
      :busy="publishing"
      :live="state.is_published"
      :title-text="titleText"
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
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import {
  backendOutdatedMessage,
  checkHubSlug,
  classifyHubError,
  getAdminHub,
  getHubAssets,
  publishHub,
  updateHub,
  type UpdateHubPayload,
} from "@/api/eventHub";
import { notify } from "@/helpers/notify";
import { getDefaultHubConfig, getTemplate, listTemplates } from "../templates/registry";
import type { HubBlock, HubConfig } from "../types";
import "./builderWorkspace.css";
import "./builderWorkspaceExtra.css";
import { isHttpsUrl } from "./builderFields";
import type { PreviewDevice, SaveStatus, ScrollTarget, SlugUiStatus } from "./builderTypes";
import {
  CATEGORIES,
  baseKind,
  defaultContent,
  ensureGiftBlock,
  fromHubConfig,
  isKindOnByDefault,
  isSampleContent,
  kindMeta,
  localSlugStatus,
  normalizeEventType,
  normalizeOrder,
  normalizeSlug,
  slugCandidates,
  suggestSlug,
  templateKinds,
  templateTypeOf,
  titleOf,
  toHubConfig,
} from "./hubWizardModel";
import type { KindContent, WizardContent, WizardEvent, WizardState } from "./hubWizardModel";
import { applyTemplateConfig, hasTemplateId, mapAxiosValidationErrors } from "./hubBuilderUtils";
import { hubDisplayUrl, hubPrefix } from "./hubPublicUrl";
import BuilderIcon from "./BuilderIcon.vue";
import WorkspaceContentTab from "./WorkspaceContentTab.vue";
import WorkspaceDesignTab from "./WorkspaceDesignTab.vue";
import WorkspacePublishDialog from "./WorkspacePublishDialog.vue";
import WorkspaceSettingsTab from "./WorkspaceSettingsTab.vue";
import WorkspaceStage from "./WorkspaceStage.vue";

const DEBOUNCE_MS = 800;
const RETRY_MS = [5000, 15000, 30000];
const SLUG_DEBOUNCE_MS = 400;
const HISTORY_MAX = 80;
const HINT_KEY = "snapshare.hub.ws.hint";

const FONT_BY_FAMILY: Record<string, string> = {
  "Frank Ruhl Libre": "classic",
  Heebo: "clean",
  "Varela Round": "soft",
  Rubik: "clean",
  "Secular One": "soft",
};

type Tab = "design" | "content" | "settings";
type AssetUrls = Record<string, { url: string; thumb_url?: string }>;

function sortedBlocks(blocks: HubBlock[]): HubBlock[] {
  return [...blocks].sort((a, b) => a.order - b.order);
}
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
/** Event row start time ("2027/06/10 19:00:00" or ISO) -> "2027-06-10T19:00:00". */
function normalizeStart(raw: unknown): string {
  const s = String(raw || "").trim();
  const m = /^(\d{4})[-/](\d{2})[-/](\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(s);
  if (!m) return "";
  return `${m[1]}-${m[2]}-${m[3]}T${m[4] || "19"}:${m[5] || "00"}:00`;
}
const mobileNow = () => typeof window !== "undefined" && window.innerWidth < 760;

/**
 * «דף האירוע» builder v3: one full-height workspace (toolbar, side panel with עיצוב / תוכן / הגדרות,
 * live preview of the real renderer). Matches builder-mock-v2, approved by Gal 17.11.
 * State is per section kind (hubWizardModel); hub_config is projected from it for the preview
 * and for autosave (PUT /events/{id}/hub). The event row is only read, never written.
 */
export default defineComponent({
  name: "EventPageWorkspace",
  components: {
    BuilderIcon,
    WorkspaceContentTab,
    WorkspaceDesignTab,
    WorkspacePublishDialog,
    WorkspaceSettingsTab,
    WorkspaceStage,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const shotMode = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("shot");

    /* ---------------- core state ---------------- */
    const loadState = ref<"loading" | "ready" | "error">("loading");
    const loadError = ref("");
    const state = ref<WizardState | null>(null);
    const serverSlug = ref<string | null>(null);
    const savedTemplateId = ref("");
    const everPublished = ref(false);
    const assetUrls = ref<AssetUrls>({});

    /* ---------------- ui state ---------------- */
    const tab = ref<Tab>("content");
    const openKind = ref("");
    const device = ref<PreviewDevice>("phone");
    const full = ref(false);
    const sheet = ref(false);
    const dlg = ref<"" | "publish" | "done">("");
    const hint = ref(false);
    const filter = ref<string[]>([]);
    const filterOpen = ref(false);
    const isMobile = ref(mobileNow());
    const scrollTarget = ref<ScrollTarget>({ id: "", tick: 0 });
    const toast = reactive<{ msg: string; undo: boolean }>({ msg: "", undo: false });
    const pbodyEl = ref<HTMLElement | null>(null);
    const publishing = ref(false);

    const saveStatus = ref<SaveStatus>("saved");
    const saveErrorText = ref("");
    const backendOutdated = ref(false);
    const kindErrors = ref<Record<string, string>>({});
    const essentialsError = ref("");

    const slugStatus = ref<SlugUiStatus>("idle");
    const slugSuggestions = ref<string[]>([]);
    const freeSlug = ref("");

    const event = computed(() => store.getters["event/getEvent"]);
    const eventId = computed(() => Number(event.value?.id || 0));

    const tabs: Array<{ id: Tab; icon: string; he: string }> = [
      { id: "design", icon: "palette", he: "עיצוב" },
      { id: "content", icon: "layers", he: "תוכן" },
      { id: "settings", icon: "gear", he: "הגדרות" },
    ];
    const mbar = computed(() => [
      { id: "design", icon: "palette", he: "עיצוב" },
      { id: "content", icon: "layers", he: "תוכן" },
      { id: "view", icon: "eye", he: "תצוגה" },
      { id: "publish", icon: "globe", he: state.value?.is_published ? "שיתוף" : "פרסום" },
    ]);

    const bannerLines = computed(() =>
      backendOutdated.value
        ? backendOutdatedMessage().split("\n").filter(Boolean)
        : saveErrorText.value
          ? [saveErrorText.value]
          : []
    );

    /* ---------------- derived ---------------- */
    const defaults = computed<HubConfig | null>(() =>
      state.value ? getDefaultHubConfig(state.value.template_id) : null
    );
    const templateMeta = computed(() => (state.value ? getTemplate(state.value.template_id) : null));
    const templateFontId = computed(() => FONT_BY_FAMILY[templateMeta.value?.default_font || ""] || "classic");
    const fontNow = computed(() => state.value?.theme.font_id || templateFontId.value);

    const allKinds = computed(() => {
      const d = defaults.value;
      if (!d || !state.value) return [];
      const blocks = ensureGiftBlock(sortedBlocks(d.blocks), templateTypeOf(state.value.template_id));
      return templateKinds(blocks);
    });
    const orderedKinds = computed(() =>
      normalizeOrder(
        state.value?.order,
        allKinds.value.map((p) => p.kind)
      )
    );
    function kindOn(kind: string): boolean {
      const v = state.value?.sections[kind];
      return v !== undefined ? !!v : isKindOnByDefault(kind);
    }
    const onMap = computed(() => {
      const m: Record<string, boolean> = {};
      for (const k of orderedKinds.value) m[k] = kindOn(k);
      return m;
    });
    const kindBlockIds = computed(() => {
      const map: Record<string, string> = {};
      for (const p of allKinds.value) map[p.kind] = p.block.id;
      const hero = defaults.value?.blocks.find((b) => b.type === "HERO_COUNTDOWN");
      map.hero = hero?.id || "hero";
      return map;
    });
    const labels = computed(() => {
      const out: Record<string, string> = {};
      for (const [kind, id] of Object.entries(kindBlockIds.value)) {
        out[id] = kind === "hero" ? "הפתיחה" : kindMeta(kind).name;
      }
      return out;
    });
    const selectedBlockId = computed(() => (openKind.value ? kindBlockIds.value[openKind.value] || "" : ""));
    /** Visible sections (the opening is always there and not counted, like the «החלקים בעמוד» badge). */
    const sectionCount = computed(() => orderedKinds.value.filter(kindOn).length);
    const sampleNames = computed(() =>
      orderedKinds.value
        .filter((k) => kindOn(k) && isSampleContent(k, state.value?.content[baseKind(k)]))
        .map((k) => kindMeta(k).name)
    );
    const basicsOk = computed(() => {
      const e = state.value?.event;
      if (!e) return false;
      const named = e.type === "wedding" ? !!(e.name1 || e.name2) : !!(e.title || e.name1);
      return named && !!e.date;
    });

    function buildConfig(st: WizardState): HubConfig | null {
      const d = getDefaultHubConfig(st.template_id);
      if (!d) return null;
      return toHubConfig(st, sortedBlocks(d.blocks), d.theme);
    }
    const draftConfig = computed<HubConfig | null>(() => (state.value ? buildConfig(state.value) : null));
    function withAssetUrls(cfg: HubConfig): HubConfig {
      const urls = assetUrls.value;
      const out = clone(cfg);
      for (const b of out.blocks) {
        const imgs = b.data?.images;
        if (!Array.isArray(imgs)) continue;
        for (const item of imgs as Array<Record<string, unknown>>) {
          const ref = item?.image as Record<string, unknown> | undefined;
          const hit = ref && ref.asset_id != null ? urls[String(ref.asset_id)] : undefined;
          if (ref && hit) {
            ref.url = hit.url;
            ref.thumb_url = hit.thumb_url || hit.url;
          }
        }
      }
      return out;
    }
    const previewConfig = computed<HubConfig | null>(() =>
      draftConfig.value ? withAssetUrls(draftConfig.value) : null
    );

    function mergedContentFor(st: WizardState, templateId: string): WizardContent {
      const d = getDefaultHubConfig(templateId);
      if (!d) return st.content;
      const type = templateTypeOf(templateId);
      const blocks = ensureGiftBlock(sortedBlocks(d.blocks), type);
      const fresh = defaultContent(blocks, st.event, type);
      const merged: WizardContent = { ...st.content };
      for (const k of Object.keys(fresh)) if (!merged[k]) merged[k] = fresh[k];
      const imgs = merged.gallery?.images || [];
      if (imgs.length && imgs.every((im) => im.stock && /\/album-\d+$/.test(im.stock))) {
        merged.gallery = fresh.gallery;
      }
      return merged;
    }

    const titleText = computed(() => (state.value ? titleOf(state.value.event) : ""));
    const effectiveSlug = computed(() => normalizeSlug(state.value?.slug || ""));
    const urlText = computed(() => hubDisplayUrl(effectiveSlug.value || "…"));
    const prefix = hubPrefix();

    /* ---------------- undo / redo ---------------- */
    const past = ref<string[]>([]);
    const future = ref<string[]>([]);
    const canUndo = computed(() => past.value.length > 0);
    const canRedo = computed(() => future.value.length > 0);
    let typingSnap: string | null = null;

    function snap(): string {
      return JSON.stringify(state.value);
    }
    /** One undo step: call before mutating. */
    function remember() {
      typingSnap = null;
      past.value = [...past.value.slice(-(HISTORY_MAX - 1)), snap()];
      future.value = [];
    }
    /** Typing in a field = one step: the snapshot taken on focus is pushed on the first change. */
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
      const cur = state.value;
      const next = JSON.parse(json) as WizardState;
      // Publishing is a server action, not an edit: undo never un-publishes.
      if (cur) next.is_published = cur.is_published;
      state.value = next;
      typingSnap = null;
      touch();
      if (tab.value === "settings" || dlg.value === "publish") scheduleSlugCheck(true);
    }
    function undo() {
      if (!past.value.length || !state.value) return;
      const prev = past.value[past.value.length - 1];
      future.value = [...future.value, snap()];
      past.value = past.value.slice(0, -1);
      restore(prev);
    }
    function redo() {
      if (!future.value.length || !state.value) return;
      const nxt = future.value[future.value.length - 1];
      past.value = [...past.value, snap()];
      future.value = future.value.slice(0, -1);
      restore(nxt);
    }

    /* ---------------- toast ---------------- */
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

    /* ---------------- autosave ---------------- */
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
      if (!state.value) return;
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
    function buildPayload(): UpdateHubPayload | null {
      const cfg = draftConfig.value;
      const st = state.value;
      if (!cfg || !st) return null;
      const out = clone(cfg);
      for (const { kind, block } of templateKinds(out.blocks)) {
        const k = baseKind(kind);
        if (k === "gift" && block.data.url && !isHttpsUrl(String(block.data.url))) block.data.url = null;
        if (k === "map" && block.data.waze_url && !isHttpsUrl(String(block.data.waze_url))) {
          block.data.waze_url = null;
        }
      }
      const slug = st.is_published
        ? serverSlug.value
        : freeSlug.value && freeSlug.value === effectiveSlug.value
          ? freeSlug.value
          : serverSlug.value;
      return { slug, is_published: st.is_published, hub_config: out };
    }
    function runSave(): Promise<void> {
      if (inFlight) return inFlight;
      if (!dirty || !state.value || !eventId.value) return Promise.resolve();
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
          savedTemplateId.value = payload.hub_config.template_id;
          kindErrors.value = {};
          essentialsError.value = "";
          saveErrorText.value = "";
          if (!dirty) saveStatus.value = "saved";
        } catch (err) {
          dirty = true;
          onSaveError(err, payload);
        } finally {
          inFlight = null;
        }
        if (dirty && !debounceT && !retryT && saveStatus.value !== "error") await runSave();
      })();
      return inFlight;
    }
    function onSaveError(err: unknown, payload: UpdateHubPayload) {
      const cls = classifyHubError(err, { usesTemplate: true });
      saveStatus.value = "error";
      saveErrorText.value = cls.message.split("\n")[0];
      if (cls.kind === "backend_outdated") {
        backendOutdated.value = true;
        return;
      }
      if (cls.kind === "validation") {
        showFieldErrors(err, payload.hub_config.blocks);
        return;
      }
      if (cls.kind === "unauthorized" || cls.kind === "forbidden") return;
      if (attempt < RETRY_MS.length) {
        retryT = setTimeout(() => {
          retryT = null;
          void runSave();
        }, RETRY_MS[attempt++]);
      }
    }
    function showFieldErrors(err: unknown, blocks: HubBlock[]) {
      const mapped = mapAxiosValidationErrors(err, blocks);
      if (!mapped.length) return;
      const byId = new Map(templateKinds(blocks).map((p) => [p.block.id, p.kind]));
      const heroId = blocks.find((b) => b.type === "HERO_COUNTDOWN")?.id;
      const next: Record<string, string> = {};
      let essentials = "";
      let firstKind = "";
      for (const m of mapped) {
        let id = m.blockId;
        if (id.startsWith("__index_")) id = blocks[Number(id.replace("__index_", ""))]?.id || "";
        const kind = byId.get(id);
        if (kind) {
          next[kind] = next[kind] || m.message;
          firstKind = firstKind || kind;
        } else if (id && id === heroId) {
          essentials = essentials || m.message;
        }
      }
      kindErrors.value = next;
      essentialsError.value = essentials;
      if (firstKind || essentials) {
        tab.value = "content";
        openKind.value = firstKind || "hero";
      }
    }
    function retrySave() {
      attempt = 0;
      if (retryT) clearTimeout(retryT);
      retryT = null;
      dirty = true;
      void runSave();
    }
    /** Save whatever is pending and wait for it. Resolves false when the save failed. */
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

    /* ---------------- load ---------------- */
    function eventPrefill() {
      const e = event.value || {};
      return {
        name: e.name as string | undefined,
        starts_at: normalizeStart(e.starts_at),
        welcome_text: e.config?.welcome_text as string | undefined,
        event_type: e.event_type as string | undefined,
      };
    }
    function defaultTemplateFor(eventType: string): string {
      const type = normalizeEventType(eventType, "wedding");
      const hit = listTemplates().find((t) => t.type === type);
      return (hit || listTemplates()[0])?.id || "wedding-1";
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
        const saved = hasTemplateId(raw as HubConfig);
        const prefill = eventPrefill();
        let config: HubConfig;
        if (saved) {
          config = {
            template_id: String(raw.template_id),
            theme: raw.theme || ({} as HubConfig["theme"]),
            blocks: Array.isArray(raw.blocks) ? raw.blocks : [],
          };
        } else {
          config = applyTemplateConfig(defaultTemplateFor(String(prefill.event_type || "")), {
            event: prefill,
          }) as HubConfig;
        }
        const hydrated = fromHubConfig(config, prefill, eventId.value, {
          slug: hub.slug,
          is_published: Boolean(hub.is_published),
        });
        if (!saved) {
          hydrated.event.venue = "";
          hydrated.event.city = "";
        }
        state.value = hydrated;
        serverSlug.value = hub.slug || null;
        savedTemplateId.value = saved ? config.template_id : "";
        everPublished.value =
          Boolean(hub.is_published) || lsGet(`snapshare.hub.published.${eventId.value}`) === "1";
        freeSlug.value = "";
        slugStatus.value = "idle";
        slugSuggestions.value = [];
        saveStatus.value = "saved";
        saveErrorText.value = "";
        kindErrors.value = {};
        essentialsError.value = "";
        past.value = [];
        future.value = [];
        filter.value = CATEGORIES.some((c) => c.id === hydrated.event.type && c.id !== "all")
          ? [hydrated.event.type]
          : [];
        hint.value = !lsGet(HINT_KEY);
        openKind.value = isMobile.value ? "" : "hero";
        loadState.value = "ready";
        void probeBackend();
        void ensureAssetUrls();
        scheduleSlugCheck(true);
      } catch (err) {
        console.error(err);
        const cls = classifyHubError(err, { usesTemplate: true });
        loadState.value = "error";
        loadError.value = cls.message.split("\n")[0];
        if (cls.kind === "backend_outdated") backendOutdated.value = true;
      }
    }
    async function probeBackend() {
      try {
        await checkHubSlug(eventId.value, serverSlug.value || "probe-slug");
      } catch (err) {
        if ((err as { response?: { status?: number } })?.response?.status === 404) backendOutdated.value = true;
      }
    }

    /* ---------------- host photos ---------------- */
    let assetLoading = false;
    async function ensureAssetUrls() {
      const st = state.value;
      if (!st || !eventId.value || assetLoading) return;
      const need = new Set<string>();
      for (const im of st.content.gallery?.images || []) {
        if (im.asset_id != null && im.asset_id !== "" && !assetUrls.value[String(im.asset_id)]) {
          need.add(String(im.asset_id));
        }
      }
      if (!need.size) return;
      assetLoading = true;
      try {
        for (let page = 1; page <= 6 && need.size; page++) {
          const res = await getHubAssets(eventId.value, page, 60);
          const add: AssetUrls = {};
          for (const a of res.data) {
            add[String(a.id)] = { url: a.url, thumb_url: a.thumb_url };
            need.delete(String(a.id));
          }
          assetUrls.value = { ...assetUrls.value, ...add };
          if (page >= res.last_page) break;
        }
      } catch (err) {
        console.error(err);
      } finally {
        assetLoading = false;
      }
    }
    watch(
      () => (state.value?.content.gallery?.images || []).map((i) => i.asset_id ?? "").join(","),
      () => void ensureAssetUrls()
    );

    /* ---------------- panel / preview ---------------- */
    function scrollPreviewTo(kind: string) {
      const id = kindBlockIds.value[kind];
      if (!id) return;
      scrollTarget.value = { id, tick: scrollTarget.value.tick + 1 };
    }
    function setTab(t: Tab) {
      tab.value = t;
      filterOpen.value = false;
      if (t === "settings") scheduleSlugCheck(true);
    }
    function openRow(kind: string) {
      openKind.value = kind;
      if (kind) {
        scrollPreviewTo(kind);
        setTimeout(() => {
          const row = pbodyEl.value?.querySelector(`[data-row="${kind}"]`);
          row?.scrollIntoView({ block: "nearest" });
        }, 30);
      }
    }
    function onPick(blockId: string) {
      const kind = Object.entries(kindBlockIds.value).find(([, id]) => id === blockId)?.[0];
      if (!kind) return;
      tab.value = "content";
      openKind.value = kind;
      if (isMobile.value) {
        sheet.value = true;
        setTimeout(() => scrollPreviewTo(kind), 80);
      }
      setTimeout(() => {
        const row = pbodyEl.value?.querySelector<HTMLElement>(`[data-row="${kind}"]`);
        row?.scrollIntoView({ block: isMobile.value ? "start" : "nearest" });
        if (!isMobile.value) row?.querySelector<HTMLElement>("input,textarea")?.focus({ preventScroll: true });
      }, 40);
    }
    function setFull(on: boolean) {
      full.value = on;
      sheet.value = false;
    }
    function dismissHint() {
      hint.value = false;
      lsSet(HINT_KEY, "1");
    }
    function onMbar(id: string) {
      if (id === "view") {
        setFull(true);
        return;
      }
      if (id === "publish") {
        sheet.value = false;
        openDlg(state.value?.is_published ? "done" : "publish");
        return;
      }
      if (sheet.value && tab.value === id) sheet.value = false;
      else {
        tab.value = id as Tab;
        sheet.value = true;
      }
    }
    function openDlg(kind: "publish" | "done") {
      dlg.value = kind;
      if (kind === "publish") scheduleSlugCheck(true);
    }
    function goBack() {
      void router.push("/event");
    }

    /* ---------------- edits ---------------- */
    function pickTemplate(id: string) {
      const st = state.value;
      if (!st || id === st.template_id) return;
      remember();
      st.content = mergedContentFor(st, id);
      st.template_id = id;
      st.order = [];
      st.theme.font_id = null;
      kindErrors.value = {};
      if (openKind.value && openKind.value !== "hero" && !allKinds.value.some((p) => p.kind === openKind.value)) {
        openKind.value = "";
      }
      touch();
      showToast(`העיצוב הוחלף ל«${getTemplate(id)?.name_he || ""}»`, true);
      setTimeout(() => scrollPreviewTo("hero"), 120);
    }
    function onPalette(id: string) {
      if (!state.value || state.value.theme.palette_id === id) return;
      remember();
      state.value.theme = { ...state.value.theme, palette_id: id };
      touch();
    }
    function onFont(id: string) {
      if (!state.value) return;
      const next = id === templateFontId.value ? null : id;
      if (state.value.theme.font_id === next) return;
      remember();
      state.value.theme = { ...state.value.theme, font_id: next };
      touch();
    }
    function onEventField(field: keyof WizardEvent, value: string) {
      const st = state.value;
      if (!st) return;
      rememberTyping();
      (st.event as unknown as Record<string, string>)[field] = value;
      if (!st.slugTouched && !st.is_published) {
        st.slug = suggestSlug(st.event);
        scheduleSlugCheck();
      }
      if (essentialsError.value) essentialsError.value = "";
      touch();
    }
    function onContent(base: string, content: KindContent) {
      const st = state.value;
      if (!st) return;
      if (typingSnap !== null) rememberTyping();
      else remember();
      st.content = { ...st.content, [base]: content };
      if (Object.keys(kindErrors.value).length) {
        const next = { ...kindErrors.value };
        for (const k of Object.keys(next)) if (baseKind(k) === base) delete next[k];
        kindErrors.value = next;
      }
      touch();
    }
    function setOn(kind: string, on: boolean) {
      const st = state.value;
      if (!st) return;
      remember();
      st.sections = { ...st.sections, [kind]: on };
      if (on) {
        // Place it right after the last visible section.
        const o = orderedKinds.value.filter((x) => x !== kind);
        const vis = o.filter(kindOn);
        const last = vis[vis.length - 1];
        o.splice(last ? o.indexOf(last) + 1 : 0, 0, kind);
        st.order = o;
        openKind.value = kind;
        setTimeout(() => {
          scrollPreviewTo(kind);
          pbodyEl.value?.querySelector(`[data-row="${kind}"]`)?.scrollIntoView({ block: "nearest" });
        }, 60);
      } else if (openKind.value === kind) {
        openKind.value = "";
      }
      touch();
      const name = kindMeta(kind).name;
      showToast(on ? `«${name}» נוסף לעמוד` : `«${name}» הוסתר מהעמוד`, true);
    }
    function moveKind(kind: string, dir: number) {
      const st = state.value;
      if (!st) return;
      const visible = orderedKinds.value.filter(kindOn);
      const i = visible.indexOf(kind);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= visible.length) return;
      const other = visible[j];
      const o = [...orderedKinds.value];
      const a = o.indexOf(kind);
      const b = o.indexOf(other);
      o[a] = other;
      o[b] = kind;
      remember();
      st.order = o;
      touch();
      scrollPreviewTo(kind);
    }
    function onReorder(order: string[], kind: string) {
      if (!state.value) return;
      remember();
      state.value.order = order;
      touch();
      scrollPreviewTo(kind);
    }
    function onReset() {
      const st = state.value;
      if (!st) return;
      remember();
      const d = getDefaultHubConfig(st.template_id);
      const type = templateTypeOf(st.template_id);
      const blocks = d ? ensureGiftBlock(sortedBlocks(d.blocks), type) : [];
      st.content = defaultContent(blocks, st.event, type);
      st.sections = {};
      st.order = [];
      st.theme = { palette_id: "original", font_id: null };
      openKind.value = "";
      touch();
      showToast("התחלנו מחדש עם העיצוב הזה", true);
    }

    /* ---------------- slug ---------------- */
    const slugCache = new Map<string, "free" | "taken" | "reserved" | "invalid">();
    let slugT: ReturnType<typeof setTimeout> | null = null;
    let slugReq = 0;
    async function checkOne(slug: string): Promise<"free" | "taken" | "reserved" | "invalid"> {
      if (slug === serverSlug.value) return "free";
      const hit = slugCache.get(slug);
      if (hit) return hit;
      const res = await checkHubSlug(eventId.value, slug);
      const out = res.available
        ? "free"
        : res.reason === "reserved"
          ? "reserved"
          : res.reason === "invalid"
            ? "invalid"
            : "taken";
      slugCache.set(slug, out);
      return out;
    }
    async function loadSuggestions(slug: string, req: number) {
      const st = state.value;
      if (!st) return;
      const cands = slugCandidates(slug, st.event).slice(0, 6);
      const results = await Promise.all(
        cands.map((c) => checkOne(c).then((r) => (r === "free" ? c : "")).catch(() => ""))
      );
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
        slugStatus.value = local;
        slugSuggestions.value = [];
        if (local !== "empty" && state.value) void loadSuggestions(s || suggestSlug(state.value.event), slugReq);
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
          if (state.value && !state.value.is_published && s !== serverSlug.value) touch();
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
      if (!state.value) return;
      rememberTyping();
      state.value.slug = value;
      state.value.slugTouched = true;
      scheduleSlugCheck();
    }
    function onSlugBlur() {
      if (!state.value) return;
      const n = normalizeSlug(state.value.slug);
      if (n !== state.value.slug) {
        state.value.slug = n;
        scheduleSlugCheck();
      }
    }
    function onSuggest(slug: string) {
      if (!state.value) return;
      remember();
      state.value.slug = slug;
      state.value.slugTouched = true;
      slugStatus.value = "free";
      freeSlug.value = slug;
      slugSuggestions.value = [];
      slugReq++;
      if (!state.value.is_published) touch();
    }

    /* ---------------- publish / hide ---------------- */
    function httpStatus(err: unknown): number | undefined {
      return (err as { response?: { status?: number } })?.response?.status;
    }
    function hasHubConfigErrors(err: unknown): boolean {
      const errors = (err as { response?: { data?: { errors?: Record<string, unknown> } } })?.response?.data
        ?.errors;
      return !!errors && Object.keys(errors).some((k) => k.startsWith("hub_config"));
    }
    async function onPublish() {
      const st = state.value;
      if (!st || publishing.value || slugStatus.value !== "free") return;
      publishing.value = true;
      try {
        if (!savedTemplateId.value) dirty = true; // a fresh page is saved before it can go live
        const ok = await flush();
        if (!ok) {
          notify({ text: "לא הצלחנו לשמור את השינויים. נסו שוב.", type: "error", duration: 4000 });
          return;
        }
        const slug = effectiveSlug.value;
        const res = await publishHub(eventId.value, { is_published: true, slug });
        st.is_published = Boolean(res.is_published);
        serverSlug.value = res.slug || slug;
        everPublished.value = true;
        lsSet(`snapshare.hub.published.${eventId.value}`, "1");
        dlg.value = "done";
      } catch (err) {
        const cls = classifyHubError(err, { usesTemplate: true });
        const code = httpStatus(err);
        if (cls.kind === "backend_outdated") {
          backendOutdated.value = true;
        } else if (code === 409 || (code === 422 && !hasHubConfigErrors(err))) {
          slugCache.set(effectiveSlug.value, "taken");
          slugStatus.value = "taken";
          const req = ++slugReq;
          await loadSuggestions(effectiveSlug.value, req);
        } else {
          if (cls.kind === "validation") showFieldErrors(err, buildPayload()?.hub_config.blocks || []);
          notify({ text: cls.message.split("\n")[0], type: "error", duration: 4500 });
        }
      } finally {
        publishing.value = false;
      }
    }
    async function onVisible(show: boolean) {
      const st = state.value;
      if (!st || publishing.value) return;
      publishing.value = true;
      try {
        await flush();
        const res = await publishHub(
          eventId.value,
          show ? { is_published: true, slug: serverSlug.value || effectiveSlug.value } : { is_published: false }
        );
        st.is_published = Boolean(res.is_published);
        serverSlug.value = res.slug || serverSlug.value;
        showToast(show ? "העמוד חזר לאוויר" : "העמוד מוסתר מהאורחים");
      } catch (err) {
        const cls = classifyHubError(err, { usesTemplate: true });
        if (cls.kind === "backend_outdated") backendOutdated.value = true;
        notify({ text: cls.message.split("\n")[0], type: "error", duration: 4500 });
      } finally {
        publishing.value = false;
      }
    }

    /* ---------------- keyboard / resize ---------------- */
    function onEscape() {
      if (dlg.value) dlg.value = "";
      else if (filterOpen.value) filterOpen.value = false;
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
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y" && !typing) {
        e.preventDefault();
        redo();
      }
    }
    function onResize() {
      isMobile.value = mobileNow();
    }

    /* ---------------- shots / QA hook (?shot=1 only) ---------------- */
    function attachShotHook() {
      if (!shotMode) return;
      (window as unknown as { __ws?: Record<string, unknown> }).__ws = {
        set(o: Record<string, unknown>) {
          if (o.tab) tab.value = o.tab as Tab;
          if (o.open !== undefined) openKind.value = String(o.open);
          if (o.device) device.value = o.device as PreviewDevice;
          if (o.full !== undefined) full.value = !!o.full;
          if (o.sheet !== undefined) sheet.value = !!o.sheet;
          if (o.dlg !== undefined) dlg.value = o.dlg as "" | "publish" | "done";
          if (o.hint !== undefined) hint.value = !!o.hint;
          if (o.filter) filter.value = o.filter as string[];
          if (o.filterOpen !== undefined) filterOpen.value = !!o.filterOpen;
          if (o.toast !== undefined) toast.msg = "";
        },
        scrollTo: (kind: string) => scrollPreviewTo(kind),
        getState: () => clone(state.value),
        getConfig: () => clone(draftConfig.value),
        saveStatus: () => saveStatus.value,
        slugStatus: () => slugStatus.value,
        history: () => ({ past: past.value.length, future: future.value.length }),
        flush,
      };
    }

    onMounted(() => {
      document.documentElement.classList.add("bw3-lock");
      void load().then(attachShotHook);
      document.addEventListener("visibilitychange", onVisibility);
      document.addEventListener("keydown", onKey);
      window.addEventListener("resize", onResize);
    });
    onBeforeUnmount(() => {
      document.documentElement.classList.remove("bw3-lock");
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      if (slugT) clearTimeout(slugT);
      if (toastT) clearTimeout(toastT);
      delete (window as unknown as { __ws?: unknown }).__ws;
      void flush();
    });
    watch(eventId, (id, prev) => {
      if (id && id !== prev) void load();
    });

    return {
      shotMode,
      loadState,
      loadError,
      state,
      serverSlug,
      everPublished,
      assetUrls,
      tab,
      tabs,
      mbar,
      openKind,
      device,
      full,
      sheet,
      dlg,
      hint,
      filter,
      filterOpen,
      isMobile,
      scrollTarget,
      toast,
      pbodyEl,
      publishing,
      saveStatus,
      saveErrorText,
      backendOutdated,
      bannerLines,
      kindErrors,
      essentialsError,
      slugStatus,
      slugSuggestions,
      eventId,
      fontNow,
      orderedKinds,
      onMap,
      labels,
      selectedBlockId,
      sectionCount,
      sampleNames,
      basicsOk,
      previewConfig,
      titleText,
      effectiveSlug,
      urlText,
      prefix,
      canUndo,
      canRedo,
      undo,
      redo,
      beginTyping,
      toastUndo,
      retrySave,
      flush,
      load,
      setTab,
      openRow,
      onPick,
      setFull,
      dismissHint,
      onMbar,
      openDlg,
      goBack,
      pickTemplate,
      onPalette,
      onFont,
      onEventField,
      onContent,
      setOn,
      moveKind,
      onReorder,
      onReset,
      onSlugInput,
      onSlugBlur,
      onSuggest,
      onPublish,
      onVisible,
      onEscape,
    };
  },
});
</script>
