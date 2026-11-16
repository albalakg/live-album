<template>
  <div class="epb-wizard epb-wizard--page" dir="rtl" lang="he">
    <div v-if="loadState === 'loading'" class="epb-state" role="status">טוען את דף האירוע…</div>

    <div v-else-if="loadState === 'error' || !state" class="epb-state" role="alert">
      <h2>לא הצלחנו לטעון את דף האירוע</h2>
      <p>{{ loadError }}</p>
      <button type="button" class="btn btn-primary" @click="load">נסו שוב</button>
    </div>

    <template v-else>
      <!-- Page head -->
      <div v-if="view === 'wizard'" class="phead with-steps">
        <div class="ph-t"><h1>דף האירוע</h1></div>
        <BuilderStepper :step="step" :max-step="maxStep" @go="go" />
        <SaveIndicator :status="saveStatus" :published="state.is_published" @retry="retrySave" />
      </div>
      <div v-else class="phead">
        <div class="ph-t">
          <h1>דף האירוע</h1>
          <p>עמוד אחד ויפה לאורחים: כל הפרטים, וגם הקישור להעלאת תמונות.</p>
        </div>
      </div>

      <div v-if="backendOutdated" class="epb-banner" role="alert">
        <p v-for="(line, i) in backendOutdatedLines" :key="i">{{ line }}</p>
      </div>
      <div v-else-if="saveStatus === 'error' && saveErrorText" class="epb-banner" role="alert">
        <p>{{ saveErrorText }}</p>
      </div>

      <!-- Published / hidden summary -->
      <PublishedSummary
        v-if="view === 'published' && previewConfig"
        :live="state.is_published"
        :slug="serverSlug || effectiveSlug"
        :title-text="titleText"
        :template-name="templateName"
        :section-count="sectionCount"
        :published-at="publishedAt"
        :template-id="state.template_id"
        :hub-config="previewConfig"
        :busy="publishing"
        @edit="editFromSummary"
        @hide="onHide"
        @republish="onRepublish"
      />

      <!-- Step 1: choose a design -->
      <template v-else-if="step === 1">
        <TemplatePicker
          :event-type="state.event.type"
          :selected-id="state.template_id"
          :filter="filter"
          @select="pickTemplate"
          @preview="openTemplatePreview"
          @filter="filter = $event"
        />
        <BuilderActionBar
          info-prefix="העיצוב שבחרתם:"
          :info-strong="templateName"
          primary-label="המשך"
          @primary="next(2)"
        />
      </template>

      <!-- Step 2: details -->
      <template v-else-if="step === 2">
        <div class="split">
          <div class="fcol">
            <DetailsForm
              :event="state.event"
              :error="essentialsError"
              @update="onEventField"
              @focus-hero="scrollPreviewTo('hero')"
            />
            <SectionCardList
              v-model:reorder="reorder"
              :kinds="orderedKinds"
              :sections="state.sections"
              :content="state.content"
              :event="state.event"
              :event-id="eventId"
              :template-id="state.template_id"
              :asset-urls="assetUrls"
              :errors="kindErrors"
              :open-kinds="openKinds"
              :flash-kind="flashKind"
              @toggle="onToggleKind"
              @toggle-open="onToggleOpen"
              @content="onContent"
              @focus-kind="scrollPreviewTo"
              @reorder="onReorder"
            />
            <AdvancedDesignCard
              v-model:open="advOpen"
              :theme="state.theme"
              :title-text="titleText"
              :template-font-id="templateFontId"
              @palette="onPalette"
              @font="onFont"
            />
          </div>
          <div v-if="previewConfig" class="pcol">
            <LivePreviewPane
              v-model:device="device"
              :template-id="state.template_id"
              :hub-config="previewConfig"
              :url-text="urlText"
              :scroll-section="scrollTarget.id"
              :scroll-tick="scrollTarget.tick"
            />
          </div>
        </div>
        <button type="button" class="fab" @click="sheetOpen = true">
          <BuilderIcon name="eye" />תצוגה מקדימה
        </button>
        <BuilderActionBar
          back-label="חזרה לבחירת עיצוב"
          :primary-label="state.is_published ? 'סיום' : 'המשך לפרסום'"
          @back="go(1)"
          @primary="state.is_published ? finishEditing() : next(3)"
        />
      </template>

      <!-- Step 3: address + publish -->
      <template v-else>
        <div class="split">
          <div class="fcol">
            <PublishStep
              :slug="state.slug"
              :slug-touched="state.slugTouched"
              :status="slugStatus"
              :suggestions="slugSuggestions"
              :prefix="prefix"
              :template-name="templateName"
              :title-text="titleText"
              :date-text="dateText"
              :time-text="state.event.time"
              :section-count="sectionCount"
              @update:slug="onSlugInput"
              @blur="onSlugBlur"
              @suggest="onSuggest"
              @go="go"
            />
          </div>
          <div v-if="previewConfig" class="pcol">
            <LivePreviewPane
              v-model:device="device"
              :template-id="state.template_id"
              :hub-config="previewConfig"
              :url-text="urlText"
            />
          </div>
        </div>
        <button type="button" class="fab" @click="sheetOpen = true">
          <BuilderIcon name="eye" />תצוגה מקדימה
        </button>
        <BuilderActionBar
          back-label="חזרה לפרטים"
          primary-kind="publish"
          :primary-label="state.is_published ? 'עדכון הכתובת' : 'פרסום העמוד'"
          busy-label="מפרסמים…"
          :busy="publishing"
          :disabled="slugStatus !== 'free'"
          :arrow="false"
          @back="go(2)"
          @primary="onPublish"
        />
      </template>
    </template>

    <!-- Overlays -->
    <TemplatePreviewModal
      v-if="previewTpl && previewTplConfig"
      :template="previewTpl"
      :hub-config="previewTplConfig"
      :selected="previewTpl.id === state?.template_id"
      :device="previewDevice"
      :type-label="typeLabel(previewTpl.type)"
      :url-text="urlText"
      @update:device="previewDevice = $event"
      @pick="onPickFromPreview"
      @close="previewTplId = ''"
    />
    <BuilderPreviewSheet
      v-if="sheetOpen && state && previewConfig"
      v-model:device="device"
      :template-id="state.template_id"
      :hub-config="previewConfig"
      :url-text="urlText"
      :scroll-section="scrollTarget.id"
      :scroll-tick="scrollTarget.tick"
      @close="sheetOpen = false"
    />
    <PublishSuccessDialog
      v-if="showSuccess && state"
      :slug="serverSlug || effectiveSlug"
      :title-text="titleText"
      @close="onSuccessDone"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
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
import type { HubBlock, HubConfig, TemplateMeta } from "../types";
import "./builderWizard.css";
import "./builderWizardExtra.css";
import { isHttpsUrl } from "./builderFields";
import type { PreviewDevice, SaveStatus, ScrollTarget, SlugUiStatus } from "./builderTypes";
import {
  CATEGORIES,
  baseKind,
  dateHe,
  defaultContent,
  ensureGiftBlock,
  fromHubConfig,
  isKindOnByDefault,
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
import AdvancedDesignCard from "./AdvancedDesignCard.vue";
import BuilderActionBar from "./BuilderActionBar.vue";
import BuilderIcon from "./BuilderIcon.vue";
import BuilderPreviewSheet from "./BuilderPreviewSheet.vue";
import BuilderStepper from "./BuilderStepper.vue";
import DetailsForm from "./DetailsForm.vue";
import LivePreviewPane from "./LivePreviewPane.vue";
import PublishedSummary from "./PublishedSummary.vue";
import PublishStep from "./PublishStep.vue";
import PublishSuccessDialog from "./PublishSuccessDialog.vue";
import SaveIndicator from "./SaveIndicator.vue";
import SectionCardList from "./SectionCardList.vue";
import TemplatePicker from "./TemplatePicker.vue";
import TemplatePreviewModal from "./TemplatePreviewModal.vue";

const DEBOUNCE_MS = 800;
const RETRY_MS = [5000, 15000, 30000];
const SLUG_DEBOUNCE_MS = 400;

const FONT_BY_FAMILY: Record<string, string> = {
  "Frank Ruhl Libre": "classic",
  Heebo: "clean",
  "Varela Round": "soft",
  Rubik: "clean",
  "Secular One": "soft",
};

type AssetUrls = Record<string, { url: string; thumb_url?: string }>;

function isNarrow(): boolean {
  return typeof window !== "undefined" && window.innerWidth <= 900;
}

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
    /* private mode: ignore */
  }
}

/** Event row start time ("2027/06/10 19:00:00" or ISO) -> "2027-06-10T19:00:00". */
function normalizeStart(raw: unknown): string {
  const s = String(raw || "").trim();
  const m = /^(\d{4})[-/](\d{2})[-/](\d{2})(?:[T ](\d{2}):(\d{2}))?/.exec(s);
  if (!m) return "";
  return `${m[1]}-${m[2]}-${m[3]}T${m[4] || "19"}:${m[5] || "00"}:00`;
}

/**
 * The «דף אירוע» tab: a three-step wizard (design, details, publish) that saves itself.
 * The wizard state lives per section kind; the draft hub_config is projected from it for the
 * live preview and for autosave. The event row is only read (prefill), never written.
 */
export default defineComponent({
  name: "EventPageBuilderTab",
  components: {
    AdvancedDesignCard,
    BuilderActionBar,
    BuilderIcon,
    BuilderPreviewSheet,
    BuilderStepper,
    DetailsForm,
    LivePreviewPane,
    PublishedSummary,
    PublishStep,
    PublishSuccessDialog,
    SaveIndicator,
    SectionCardList,
    TemplatePicker,
    TemplatePreviewModal,
  },
  setup() {
    const store = useStore();

    /* ---------------- core state ---------------- */
    const loadState = ref<"loading" | "ready" | "error">("loading");
    const loadError = ref("");
    const state = ref<WizardState | null>(null);
    const view = ref<"wizard" | "published">("wizard");
    const step = ref(1);
    const maxStep = ref(1);
    const filter = ref("all");
    const device = ref<PreviewDevice>(isNarrow() ? "phone" : "desktop");
    const serverSlug = ref<string | null>(null);
    const savedTemplateId = ref("");
    const publishedAt = ref<string | null>(null);
    const assetUrls = ref<AssetUrls>({});

    const reorder = ref(false);
    const advOpen = ref(false);
    const openKinds = ref<string[]>([]);
    const flashKind = ref("");
    const sheetOpen = ref(false);
    const scrollTarget = ref<ScrollTarget>({ id: "", tick: 0 });
    const previewTplId = ref("");
    const previewDevice = ref<PreviewDevice>(device.value);
    const showSuccess = ref(false);
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

    const backendOutdatedLines = computed(() =>
      backendOutdatedMessage().split("\n").filter(Boolean)
    );

    /* ---------------- derived: template + draft ---------------- */
    const defaults = computed<HubConfig | null>(() =>
      state.value ? getDefaultHubConfig(state.value.template_id) : null
    );
    const templateMeta = computed<TemplateMeta | null>(() =>
      state.value ? getTemplate(state.value.template_id) : null
    );
    const templateName = computed(() => templateMeta.value?.name_he || "");
    const templateFontId = computed(
      () => FONT_BY_FAMILY[templateMeta.value?.default_font || ""] || "classic"
    );

    /** Wizard cards for the chosen template (gift included for the types that get one). */
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
    const kindBlockIds = computed(() => {
      const map: Record<string, string> = {};
      for (const p of allKinds.value) map[p.kind] = p.block.id;
      const hero = defaults.value?.blocks.find((b) => b.type === "HERO_COUNTDOWN");
      map.hero = hero?.id || "hero";
      return map;
    });

    function kindOn(kind: string): boolean {
      const v = state.value?.sections[kind];
      return v !== undefined ? !!v : isKindOnByDefault(kind);
    }
    const sectionCount = computed(() => orderedKinds.value.filter(kindOn).length + 1);

    function buildConfig(st: WizardState): HubConfig | null {
      const d = getDefaultHubConfig(st.template_id);
      if (!d) return null;
      return toHubConfig(st, sortedBlocks(d.blocks), d.theme);
    }

    const draftConfig = computed<HubConfig | null>(() =>
      state.value ? buildConfig(state.value) : null
    );

    /** Host photos need a url for the preview (the saved config keeps only asset_id). */
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

    /** Another design previewed with the host's own content (template modal). */
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

    const previewTpl = computed<TemplateMeta | null>(() =>
      previewTplId.value ? getTemplate(previewTplId.value) : null
    );
    const previewTplConfig = computed<HubConfig | null>(() => {
      const st = state.value;
      if (!st || !previewTplId.value) return null;
      const cfg = buildConfig({
        ...st,
        template_id: previewTplId.value,
        order: [],
        theme: { palette_id: "original", font_id: null },
        content: mergedContentFor(st, previewTplId.value),
      });
      return cfg ? withAssetUrls(cfg) : null;
    });

    const titleText = computed(() => (state.value ? titleOf(state.value.event) : ""));
    const dateText = computed(() => (state.value ? dateHe(state.value.event.date) : ""));
    const effectiveSlug = computed(() => normalizeSlug(state.value?.slug || ""));
    const urlText = computed(() => hubDisplayUrl(effectiveSlug.value || "…"));
    const prefix = hubPrefix();

    function typeLabel(type: string): string {
      return CATEGORIES.find((c) => c.id === type)?.he || "";
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

    /** Any host edit: show "שומר…" now, save 800ms after the last change. */
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
      // The preview shows what was typed; the server only gets valid links.
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
        saveErrorText.value = backendOutdatedLines.value[0] || "";
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
          dirty = true; // keep the local draft; the preview keeps working
          onSaveError(err, payload);
        } finally {
          inFlight = null;
        }
        // Edits that arrived while this request was in flight: one more save.
        if (dirty && !debounceT && !retryT && saveStatus.value !== "error") {
          await runSave();
        }
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
        return; // same content would fail again: wait for the next edit or a manual retry
      }
      if (cls.kind === "unauthorized" || cls.kind === "forbidden") return;
      if (attempt < RETRY_MS.length) {
        retryT = setTimeout(() => {
          retryT = null;
          void runSave();
        }, RETRY_MS[attempt++]);
      }
    }

    /** 422 `hub_config.blocks.N.data.X` -> the matching section card (opened) with the message. */
    function showFieldErrors(err: unknown, blocks: HubBlock[]) {
      const mapped = mapAxiosValidationErrors(err, blocks);
      if (!mapped.length) return;
      const kinds = templateKinds(blocks);
      const byId = new Map(kinds.map((p) => [p.block.id, p.kind]));
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
        } else if (!essentials) {
          saveErrorText.value = m.message;
        }
      }
      kindErrors.value = next;
      essentialsError.value = essentials;
      if (firstKind) {
        if (view.value === "published") view.value = "wizard";
        if (step.value !== 2) step.value = 2;
        if (!openKinds.value.includes(firstKind)) openKinds.value = [...openKinds.value, firstKind];
        nextTick(() => {
          document
            .querySelector(`.epb-wizard .sec[data-kind="${firstKind}"]`)
            ?.scrollIntoView({ block: "center", behavior: "smooth" });
        });
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
    function onBeforeUnload() {
      void flush();
    }

    /* ---------------- load / hydrate ---------------- */
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

    function storageKey(): string {
      return `snapshare.hub.maxStep.${eventId.value}`;
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
          // Fresh hub: start from the design that matches the event type, prefilled from the event
          // (first load only, and only inside the page: the event row is never written).
          config = applyTemplateConfig(defaultTemplateFor(String(prefill.event_type || "")), {
            event: prefill,
          }) as HubConfig;
        }
        const hydrated = fromHubConfig(config, prefill, eventId.value, {
          slug: hub.slug,
          is_published: Boolean(hub.is_published),
        });
        if (!saved) {
          // Sample venue from the design is not the host's venue.
          hydrated.event.venue = "";
          hydrated.event.city = "";
        }
        state.value = hydrated;
        serverSlug.value = hub.slug || null;
        savedTemplateId.value = saved ? config.template_id : "";
        publishedAt.value = hub.updated_at || null;
        freeSlug.value = "";
        slugStatus.value = "idle";
        slugSuggestions.value = [];
        saveStatus.value = "saved";
        saveErrorText.value = "";
        kindErrors.value = {};
        essentialsError.value = "";
        openKinds.value = [];
        reorder.value = false;
        filter.value = CATEGORIES.some((c) => c.id === hydrated.event.type) ? hydrated.event.type : "all";

        // Default route
        const stored = Number(lsGet(storageKey()));
        const wasPublished = lsGet(`snapshare.hub.published.${eventId.value}`) === "1";
        if (hub.is_published || (wasPublished && hub.slug && saved)) {
          view.value = "published";
          maxStep.value = 3;
          step.value = 3;
        } else {
          view.value = "wizard";
          const start = stored >= 1 && stored <= 3 ? stored : saved ? 2 : 1;
          maxStep.value = start;
          step.value = start;
        }
        loadState.value = "ready";
        void probeBackend();
        void ensureAssetUrls();
        if (step.value === 3) scheduleSlugCheck(true);
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
        if ((err as { response?: { status?: number } })?.response?.status === 404) {
          backendOutdated.value = true;
        }
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
      () =>
        (state.value?.content.gallery?.images || [])
          .map((i) => i.asset_id ?? "")
          .join(","),
      () => void ensureAssetUrls()
    );

    /* ---------------- navigation ---------------- */
    function persistStep() {
      lsSet(storageKey(), String(maxStep.value));
    }

    function go(n: number) {
      if (!state.value) return;
      if (n < 1 || n > 3 || n > maxStep.value) return;
      if (view.value === "wizard" && n === step.value) return;
      leaveStep();
      view.value = "wizard";
      step.value = n;
    }

    function next(n: number) {
      if (!state.value) return;
      maxStep.value = Math.max(maxStep.value, n);
      persistStep();
      go(n);
    }

    /** Leaving a step flushes the pending save; a design picked on step 1 is always persisted. */
    function leaveStep() {
      if (state.value && !savedTemplateId.value) touch();
      void flush();
      sheetOpen.value = false;
    }

    function finishEditing() {
      leaveStep();
      view.value = "published";
    }

    function editFromSummary() {
      view.value = "wizard";
      step.value = 2;
      maxStep.value = 3;
    }

    watch(step, (n) => {
      window.scrollTo({ top: 0 });
      if (n === 3) scheduleSlugCheck(true);
    });
    watch(view, () => window.scrollTo({ top: 0 }));

    /* ---------------- step 1: design ---------------- */
    function pickTemplate(id: string) {
      const st = state.value;
      if (!st || id === st.template_id) return;
      st.content = mergedContentFor(st, id);
      st.template_id = id;
      st.order = [];
      st.theme.font_id = null;
      openKinds.value = [];
      kindErrors.value = {};
      touch();
    }

    function openTemplatePreview(id: string) {
      previewDevice.value = device.value;
      previewTplId.value = id;
    }

    function onPickFromPreview(id: string) {
      pickTemplate(id);
      previewTplId.value = "";
    }

    /* ---------------- step 2: details ---------------- */
    function scrollPreviewTo(kind: string) {
      const id = kindBlockIds.value[kind];
      if (!id) return;
      scrollTarget.value = { id, tick: scrollTarget.value.tick + 1 };
    }

    function onEventField(field: keyof WizardEvent, value: string) {
      const st = state.value;
      if (!st) return;
      (st.event as unknown as Record<string, string>)[field] = value;
      if (!st.slugTouched) st.slug = suggestSlug(st.event);
      if (essentialsError.value) essentialsError.value = "";
      touch();
    }

    function addOpen(kind: string) {
      if (!openKinds.value.includes(kind)) openKinds.value = [...openKinds.value, kind];
    }

    function onToggleKind(kind: string, on: boolean) {
      const st = state.value;
      if (!st) return;
      st.sections = { ...st.sections, [kind]: on };
      if (on && kindMeta(kind).fields.length) addOpen(kind);
      else openKinds.value = openKinds.value.filter((k) => k !== kind);
      touch();
      if (on) {
        flashKind.value = kind;
        window.setTimeout(() => {
          if (flashKind.value === kind) flashKind.value = "";
        }, 1300);
        window.setTimeout(() => scrollPreviewTo(kind), 150);
      }
    }

    function onToggleOpen(kind: string) {
      if (openKinds.value.includes(kind)) {
        openKinds.value = openKinds.value.filter((k) => k !== kind);
      } else {
        addOpen(kind);
        scrollPreviewTo(kind);
      }
    }

    function onContent(base: string, content: KindContent) {
      const st = state.value;
      if (!st) return;
      st.content = { ...st.content, [base]: content };
      if (Object.keys(kindErrors.value).length) {
        const next = { ...kindErrors.value };
        for (const k of Object.keys(next)) if (baseKind(k) === base) delete next[k];
        kindErrors.value = next;
      }
      touch();
    }

    function onReorder(order: string[]) {
      if (!state.value) return;
      state.value.order = order;
      touch();
    }

    function onPalette(id: string) {
      if (!state.value) return;
      state.value.theme = { ...state.value.theme, palette_id: id };
      touch();
    }

    function onFont(id: string) {
      if (!state.value) return;
      state.value.theme = {
        ...state.value.theme,
        font_id: id === templateFontId.value ? null : id,
      };
      touch();
    }

    /* ---------------- step 3: address ---------------- */
    const slugCache = new Map<string, "free" | "taken" | "reserved" | "invalid">();
    let slugT: ReturnType<typeof setTimeout> | null = null;
    let slugReq = 0;

    function statusFromReason(reason: string | null): SlugUiStatus {
      switch (reason) {
        case "reserved":
          return "reserved";
        case "too_short":
          return "short";
        case "too_long":
          return "long";
        case "invalid":
          return "invalid";
        default:
          return "taken";
      }
    }

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
          // The address is saved together with the page, but only once it is known to be free.
          if (state.value && !state.value.is_published && s !== serverSlug.value) touch();
        } else {
          slugStatus.value = result === "invalid" ? "invalid" : result;
          await loadSuggestions(s, req);
        }
      } catch (err) {
        if (req !== slugReq) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) backendOutdated.value = true;
        else if (status === 422) slugStatus.value = statusFromReason("invalid");
        else slugStatus.value = "error";
      }
    }

    function onSlugInput(value: string) {
      if (!state.value) return;
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
      state.value.slug = slug;
      state.value.slugTouched = true;
      slugStatus.value = "free";
      freeSlug.value = slug;
      slugSuggestions.value = [];
      slugReq++;
      if (!state.value.is_published) touch();
    }

    watch(
      () => state.value?.slug,
      () => {
        // Names edited on step 2 change the suggestion; the check runs when step 3 opens.
        if (step.value === 3 && view.value === "wizard" && !state.value?.slugTouched) scheduleSlugCheck();
      }
    );

    /* ---------------- publish / hide ---------------- */
    function rememberPublished() {
      lsSet(`snapshare.hub.published.${eventId.value}`, "1");
    }

    function httpStatus(err: unknown): number | undefined {
      return (err as { response?: { status?: number } })?.response?.status;
    }

    async function onPublish() {
      const st = state.value;
      if (!st || publishing.value || slugStatus.value !== "free") return;
      publishing.value = true;
      try {
        const ok = await flush();
        if (!ok) {
          notify({ text: "לא הצלחנו לשמור את השינויים. נסו שוב.", type: "error", duration: 4000 });
          return;
        }
        const slug = effectiveSlug.value;
        const res = await publishHub(eventId.value, { is_published: true, slug });
        st.is_published = Boolean(res.is_published);
        serverSlug.value = res.slug || slug;
        publishedAt.value = res.updated_at || new Date().toISOString();
        rememberPublished();
        showSuccess.value = true;
      } catch (err) {
        const cls = classifyHubError(err, { usesTemplate: true });
        const code = httpStatus(err);
        if (cls.kind === "backend_outdated") {
          backendOutdated.value = true;
        } else if (code === 409 || (code === 422 && !hasHubConfigErrors(err))) {
          // Taken while the host was typing: back to the taken state with suggestions.
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

    function hasHubConfigErrors(err: unknown): boolean {
      const errors = (err as { response?: { data?: { errors?: Record<string, unknown> } } })?.response
        ?.data?.errors;
      return !!errors && Object.keys(errors).some((k) => k.startsWith("hub_config"));
    }

    function onSuccessDone() {
      showSuccess.value = false;
      view.value = "published";
      maxStep.value = 3;
      persistStep();
    }

    async function onHide() {
      const st = state.value;
      if (!st || publishing.value) return;
      publishing.value = true;
      try {
        await flush();
        const res = await publishHub(eventId.value, { is_published: false });
        st.is_published = Boolean(res.is_published);
        publishedAt.value = res.updated_at || publishedAt.value;
      } catch (err) {
        const cls = classifyHubError(err, { usesTemplate: true });
        if (cls.kind === "backend_outdated") backendOutdated.value = true;
        notify({ text: cls.message.split("\n")[0], type: "error", duration: 4500 });
      } finally {
        publishing.value = false;
      }
    }

    async function onRepublish() {
      const st = state.value;
      if (!st || publishing.value) return;
      publishing.value = true;
      try {
        await flush();
        const res = await publishHub(eventId.value, {
          is_published: true,
          slug: serverSlug.value || effectiveSlug.value,
        });
        st.is_published = Boolean(res.is_published);
        serverSlug.value = res.slug || serverSlug.value;
        publishedAt.value = res.updated_at || new Date().toISOString();
        notify({ text: "העמוד חזר לאוויר", type: "success", duration: 3000 });
      } catch (err) {
        const cls = classifyHubError(err, { usesTemplate: true });
        if (cls.kind === "backend_outdated") backendOutdated.value = true;
        notify({ text: cls.message.split("\n")[0], type: "error", duration: 4500 });
      } finally {
        publishing.value = false;
      }
    }

    /* ---------------- lifecycle ---------------- */
    let mq: MediaQueryList | null = null;
    function onMq() {
      // Phone is the default on small screens; the host's own choice persists after that.
      if (isNarrow() && device.value === "desktop") device.value = "phone";
    }

    function attachShotHook() {
      if (typeof window === "undefined") return;
      if (!new URLSearchParams(window.location.search).has("shot")) return;
      (window as unknown as { __epb?: Record<string, unknown> }).__epb = {
        forceStep(n: number) {
          const s = Math.min(3, Math.max(1, n));
          // For shots: maxStep == current so future steps stay disabled (not ✓).
          maxStep.value = s;
          view.value = "wizard";
          step.value = s;
          if (state.value) {
            state.value = { ...state.value, is_published: false };
          }
          saveStatus.value = "saved";
        },
        forceMaxStep(n: number) {
          maxStep.value = Math.min(3, Math.max(1, n));
        },
        forceView(v: "wizard" | "published") {
          view.value = v;
          if (v === "published") {
            maxStep.value = 3;
            step.value = 3;
          }
        },
        forcePublished(live: boolean) {
          if (!state.value) return;
          state.value = { ...state.value, is_published: live };
          view.value = "published";
          maxStep.value = 3;
          step.value = 3;
          if (live) lsSet(`snapshare.hub.published.${eventId.value}`, "1");
        },
        resetDemoEvent() {
          if (!state.value) return;
          state.value = {
            ...state.value,
            is_published: false,
            event: {
              ...state.value.event,
              type: "wedding",
              name1: "עמית",
              name2: "גל",
              title: "עמית וגל",
              date: "2027-06-10",
              time: "19:00",
              venue: "אולם הדוגמה",
              city: "השרון",
            },
            slug: "amit-and-gal",
            slugTouched: false,
          };
          saveStatus.value = "saved";
        },
        forceSave(s: SaveStatus) {
          saveStatus.value = s;
        },
        forceSlug(status: SlugUiStatus, suggestions: string[] = []) {
          slugStatus.value = status;
          slugSuggestions.value = suggestions;
        },
        forceFilter(f: string) {
          filter.value = f;
        },
        forceDevice(d: PreviewDevice) {
          device.value = d;
        },
        forceOpenKinds(kinds: string[]) {
          openKinds.value = kinds;
        },
        forceAdv(open: boolean) {
          advOpen.value = open;
        },
        forceReorder(on: boolean) {
          reorder.value = on;
        },
        forceSheet(on: boolean) {
          sheetOpen.value = on;
        },
        forceSuccess(on: boolean) {
          showSuccess.value = on;
        },
        getState: () => state.value,
        setGiftOn() {
          if (!state.value) return;
          state.value = {
            ...state.value,
            sections: { ...state.value.sections, gift: true },
            content: {
              ...state.value.content,
              gift: {
                ...(state.value.content.gift || {}),
                text: state.value.content.gift?.text || "למתנה",
                url: state.value.content.gift?.url || "https://pay.example/gift",
              },
            },
          };
          openKinds.value = Array.from(new Set([...openKinds.value, "gift"]));
        },
        setPalette(id: string) {
          onPalette(id);
        },
      };
    }

    onMounted(() => {
      void load().then(() => attachShotHook());
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("beforeunload", onBeforeUnload);
      if (typeof window.matchMedia === "function") {
        mq = window.matchMedia("(max-width: 900px)");
        mq.addEventListener?.("change", onMq);
      }
    });

    onBeforeUnmount(() => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
      mq?.removeEventListener?.("change", onMq);
      if (slugT) clearTimeout(slugT);
      if (typeof window !== "undefined") {
        delete (window as unknown as { __epb?: unknown }).__epb;
      }
      void flush();
    });

    watch(eventId, (id, prev) => {
      if (id && id !== prev) void load();
    });

    return {
      // state
      loadState,
      loadError,
      state,
      view,
      step,
      maxStep,
      filter,
      device,
      eventId,
      serverSlug,
      publishedAt,
      assetUrls,
      reorder,
      advOpen,
      openKinds,
      flashKind,
      sheetOpen,
      scrollTarget,
      previewTplId,
      previewTpl,
      previewTplConfig,
      previewDevice,
      showSuccess,
      publishing,
      saveStatus,
      saveErrorText,
      backendOutdated,
      backendOutdatedLines,
      kindErrors,
      essentialsError,
      slugStatus,
      slugSuggestions,
      // derived
      previewConfig,
      templateName,
      templateFontId,
      orderedKinds,
      sectionCount,
      titleText,
      dateText,
      effectiveSlug,
      urlText,
      prefix,
      // actions
      load,
      go,
      next,
      finishEditing,
      editFromSummary,
      retrySave,
      pickTemplate,
      openTemplatePreview,
      onPickFromPreview,
      scrollPreviewTo,
      onEventField,
      onToggleKind,
      onToggleOpen,
      onContent,
      onReorder,
      onPalette,
      onFont,
      onSlugInput,
      onSlugBlur,
      onSuggest,
      onPublish,
      onSuccessDone,
      onHide,
      onRepublish,
      typeLabel,
      // used by EventPageBuilderView
      flush,
      dirty: computed(() => false),
    };
  },
});
</script>
