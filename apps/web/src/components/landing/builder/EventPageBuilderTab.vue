<template>
  <div class="epb" dir="rtl" lang="he">
    <div v-if="loadState === 'loading'" class="epb-state" role="status">טוען את דף האירוע…</div>

    <div v-else-if="loadState === 'error'" class="epb-state epb-error" role="alert">
      <h2>לא הצלחנו לטעון את דף האירוע</h2>
      <p>{{ loadError }}</p>
      <button type="button" class="btn primary" @click="load">נסו שוב</button>
    </div>

    <template v-else>
      <header class="epb-head">
        <div>
          <h1>דף אירוע</h1>
          <p class="lede">
            בונים עמוד נחיתה לאורחים: עיצוב, סעיפים, צבעים ופרסום בכתובת ייחודית.
          </p>
          <p class="muted-note">
            כרטיס ה־QR ממשיך להוביל לעמוד ההעלאה — לא לדף האירוע.
          </p>
        </div>
        <div class="epb-head-actions">
          <div class="epb-save-meta">
            <span class="save-status" :class="saveStatusClass">{{ saveStatusLabel }}</span>
            <button
              v-if="saveUi === 'failed'"
              type="button"
              class="btn retry"
              :disabled="saving || backendOutdated"
              @click="save"
            >נסו שוב</button>
          </div>
          <button
            type="button"
            class="btn primary"
            :disabled="saving || !hasTemplate || backendOutdated"
            :title="backendOutdated ? backendOutdatedTooltip : undefined"
            @click="save"
          >{{ saving ? "שומר…" : "שמירה" }}</button>
          <button
            v-if="hasTemplate"
            type="button"
            class="btn"
            @click="showPicker = true"
          >החלפת עיצוב</button>
        </div>
      </header>

      <div
        v-if="backendOutdated"
        class="epb-banner"
        role="alert"
      >
        <p v-for="(line, i) in backendOutdatedLines" :key="i">{{ line }}</p>
      </div>

      <p
        v-else-if="saveUi === 'failed' && saveErrorMessage"
        class="epb-inline-err"
        role="alert"
      >{{ saveErrorMessage }}</p>

      <LandingTemplatePicker
        v-if="!hasTemplate || showPicker"
        :event-type="eventType"
        :heading="hasTemplate ? 'החלפת עיצוב' : 'בחרו עיצוב'"
        :lede="hasTemplate
          ? 'בחירת עיצוב חדש תחליף את תוכן הסעיפים בברירת המחדל. כותרת, תאריך ומקום יישמרו.'
          : 'בחרו עיצוב כדי להתחיל. אפשר לשנות הכל אחר כך.'"
        @select="onPickTemplate"
      />

      <template v-if="hasTemplate && hubConfig && !showPicker">
        <LandingPublishBar
          :is-published="isPublished"
          :public-url="publicUrl"
          :can-publish="canPublish && !backendOutdated"
          :busy="acting"
          @publish="onPublish"
          @unpublish="onUnpublish"
        />

        <div class="epb-slug-wrap">
          <LandingSlugField
            v-model="slug"
            :event-id="eventId"
            @availability="onSlugAvailability"
          />
        </div>

        <div class="epb-layout">
          <div class="epb-editor">
            <div class="epb-panes">
              <button type="button" :class="{ on: pane === 'blocks' }" @click="pane = 'blocks'">סעיפים</button>
              <button type="button" :class="{ on: pane === 'theme' }" @click="pane = 'theme'">עיצוב</button>
            </div>

            <div v-show="pane === 'blocks'" class="epb-blocks">
              <LandingBlockList
                :blocks="hubConfig.blocks"
                :selected-id="selectedBlockId"
                :template-id="templateId"
                @select="selectedBlockId = $event"
                @toggle="onToggle"
                @move="onMove"
              />
              <LandingBlockEditor
                :block="selectedBlock"
                :event-id="eventId"
                :template-id="templateId"
                :errors="fieldErrors"
                @update="onBlockUpdate"
              />
            </div>

            <LandingThemePanel
              v-show="pane === 'theme'"
              :theme="hubConfig.theme"
              :template-id="templateId"
              :event-id="eventId"
              @update="onThemeUpdate"
            />
          </div>

          <LandingBuilderPreview
            :template-id="templateId"
            :hub-config="hubConfig"
            @open-sheet="mobilePreview = true"
          />
        </div>
      </template>
    </template>

    <div
      v-if="mobilePreview && hasTemplate && hubConfig"
      class="epb-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="תצוגה מקדימה"
    >
      <header class="epb-sheet-head">
        <strong>תצוגה מקדימה</strong>
        <button type="button" class="btn" @click="mobilePreview = false">סגירה</button>
      </header>
      <div class="epb-sheet-body">
        <LandingPreviewIframe
          :template-id="templateId"
          :hub-config="hubConfig"
          mode="phone"
          title="תצוגה מקדימה בטלפון"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
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
  publishHub,
  updateHub,
  type SlugCheckReason,
} from "@/api/eventHub";
import { notify } from "@/helpers/notify";
import type { HubBlock, HubConfig, HubTheme } from "../types";
import LandingTemplatePicker from "./LandingTemplatePicker.vue";
import LandingBlockList from "./LandingBlockList.vue";
import LandingBlockEditor from "./LandingBlockEditor.vue";
import LandingThemePanel from "./LandingThemePanel.vue";
import LandingSlugField from "./LandingSlugField.vue";
import LandingPublishBar from "./LandingPublishBar.vue";
import LandingBuilderPreview from "./LandingBuilderPreview.vue";
import LandingPreviewIframe from "./LandingPreviewIframe.vue";
import {
  applyTemplateConfig,
  friendlyHubError,
  hasTemplateId,
  mapAxiosValidationErrors,
  moveBlock,
  setBlockEnabled,
  snapshotHub,
  updateBlockData,
  validateHubConfigClient,
  type FieldError,
} from "./hubBuilderUtils";

type SaveUi = "clean" | "dirty" | "saving" | "saved" | "failed";

export default defineComponent({
  name: "EventPageBuilderTab",
  components: {
    LandingTemplatePicker,
    LandingBlockList,
    LandingBlockEditor,
    LandingThemePanel,
    LandingSlugField,
    LandingPublishBar,
    LandingBuilderPreview,
    LandingPreviewIframe,
  },
  setup() {
    const store = useStore();
    const loadState = ref<"loading" | "ready" | "error">("loading");
    const loadError = ref("");
    const hubConfig = ref<HubConfig | null>(null);
    const slug = ref("");
    const isPublished = ref(false);
    const savedSnap = ref("");
    const selectedBlockId = ref("");
    const pane = ref<"blocks" | "theme">("blocks");
    const showPicker = ref(false);
    const mobilePreview = ref(false);
    const saving = ref(false);
    const acting = ref(false);
    const fieldErrors = ref<FieldError[]>([]);
    const slugAvailable = ref(false);
    const slugReason = ref<SlugCheckReason>(null);
    const backendOutdated = ref(false);
    const saveUi = ref<SaveUi>("clean");
    const savedAtLabel = ref("");
    const saveErrorMessage = ref("");

    const event = computed(() => store.getters["event/getEvent"]);
    const eventId = computed(() => Number(event.value?.id || 0));
    const eventType = computed(() => String(event.value?.event_type || ""));
    const hasTemplate = computed(() => hasTemplateId(hubConfig.value));
    const templateId = computed(() => String(hubConfig.value?.template_id || ""));
    const dirty = computed(() => {
      if (!hubConfig.value) return false;
      return snapshotHub(hubConfig.value, slug.value, isPublished.value) !== savedSnap.value;
    });
    const selectedBlock = computed<HubBlock | null>(() => {
      if (!hubConfig.value) return null;
      return hubConfig.value.blocks.find((b) => b.id === selectedBlockId.value) || null;
    });
    const publicUrl = computed(() => {
      if (!isPublished.value || !slug.value) return "";
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      return `${origin}/h/${slug.value}`;
    });
    const canPublish = computed(
      () => hasTemplate.value && Boolean(slug.value) && slugAvailable.value
    );

    const backendOutdatedLines = computed(() =>
      backendOutdatedMessage().split("\n").filter(Boolean)
    );
    const backendOutdatedTooltip =
      "השרת המחובר לא מכיר עדיין את דף האירוע החדש — לא ניתן לשמור או לפרסם.";

    const saveStatusLabel = computed(() => {
      if (saveUi.value === "saving" || saving.value) return "שומר…";
      if (saveUi.value === "failed") return "השמירה נכשלה";
      if (dirty.value || saveUi.value === "dirty") return "לא נשמר";
      if (savedAtLabel.value) return `נשמר ✓ ${savedAtLabel.value}`;
      return "";
    });

    const saveStatusClass = computed(() => {
      if (saveUi.value === "saving" || saving.value) return "busy";
      if (saveUi.value === "failed") return "bad";
      if (dirty.value || saveUi.value === "dirty") return "dirty";
      if (savedAtLabel.value) return "ok";
      return "";
    });

    function formatClock(d = new Date()): string {
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    }

    function markSaved(fromSave = false) {
      if (!hubConfig.value) return;
      savedSnap.value = snapshotHub(hubConfig.value, slug.value, isPublished.value);
      if (fromSave) {
        savedAtLabel.value = formatClock();
        saveUi.value = "saved";
      } else {
        saveUi.value = "clean";
      }
      saveErrorMessage.value = "";
    }

    function eventPrefill() {
      return {
        name: event.value?.name,
        starts_at: event.value?.starts_at,
        welcome_text: event.value?.config?.welcome_text,
        event_type: event.value?.event_type,
      };
    }

    async function probeBackendCapabilities() {
      if (!eventId.value) return;
      try {
        await checkHubSlug(eventId.value, slug.value || "x-probe");
        backendOutdated.value = false;
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404) {
          backendOutdated.value = true;
        }
        // Other errors (422 invalid slug, network) — do not treat as outdated
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
      try {
        const hub = await getAdminHub(eventId.value);
        const cfg = (hub.hub_config || { theme: {}, blocks: [] }) as HubConfig;
        hubConfig.value = {
          template_id: cfg.template_id || "",
          theme: cfg.theme || ({} as HubTheme),
          blocks: Array.isArray(cfg.blocks) ? cfg.blocks : [],
        };
        slug.value = hub.slug || "";
        isPublished.value = Boolean(hub.is_published);
        selectedBlockId.value =
          hubConfig.value.blocks.find((b) => b.type === "HERO_COUNTDOWN")?.id ||
          hubConfig.value.blocks[0]?.id ||
          "";
        showPicker.value = !hasTemplateId(hubConfig.value);
        markSaved(false);
        loadState.value = "ready";
        await probeBackendCapabilities();
      } catch (err) {
        console.error(err);
        loadState.value = "error";
        loadError.value = friendlyHubError(err, false);
      }
    }

    function onPickTemplate(id: string) {
      if (!hubConfig.value) return;
      const switching = hasTemplateId(hubConfig.value);
      if (switching) {
        const ok = window.confirm(
          "להחליף עיצוב? התוכן של הסעיפים יוחלף בברירת המחדל של העיצוב החדש"
        );
        if (!ok) return;
      }
      const next = applyTemplateConfig(id, {
        event: eventPrefill(),
        previous: hubConfig.value,
        keepHero: switching,
      });
      if (!next) return;
      hubConfig.value = next;
      selectedBlockId.value =
        next.blocks.find((b) => b.type === "HERO_COUNTDOWN")?.id || next.blocks[0]?.id || "";
      showPicker.value = false;
      pane.value = "blocks";
      fieldErrors.value = [];
      saveUi.value = "dirty";
    }

    function onToggle(blockId: string, enabled: boolean) {
      if (!hubConfig.value) return;
      hubConfig.value = {
        ...hubConfig.value,
        blocks: setBlockEnabled(hubConfig.value.blocks, blockId, enabled),
      };
    }

    function onMove(blockId: string, dir: -1 | 1) {
      if (!hubConfig.value) return;
      hubConfig.value = {
        ...hubConfig.value,
        blocks: moveBlock(hubConfig.value.blocks, blockId, dir),
      };
    }

    function onBlockUpdate(data: Record<string, unknown>) {
      if (!hubConfig.value || !selectedBlockId.value) return;
      hubConfig.value = {
        ...hubConfig.value,
        blocks: updateBlockData(hubConfig.value.blocks, selectedBlockId.value, data),
      };
    }

    function onThemeUpdate(theme: HubTheme) {
      if (!hubConfig.value) return;
      hubConfig.value = { ...hubConfig.value, theme };
    }

    function onSlugAvailability(payload: {
      available: boolean;
      reason: Exclude<SlugCheckReason, null> | null;
      slug: string;
    }) {
      slugAvailable.value = payload.available;
      slugReason.value = payload.reason;
    }

    function scrollToFieldError(err: FieldError) {
      const sel = err.listIndex != null && err.listSubKey
        ? `[data-field="${err.blockId}.${err.fieldKey}.${err.listIndex}.${err.listSubKey}"]`
        : `[data-field="${err.blockId}.${err.fieldKey}"]`;
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("epb-flash");
        setTimeout(() => el.classList.remove("epb-flash"), 1600);
      }
      if (err.blockId && !err.blockId.startsWith("__index_")) {
        selectedBlockId.value = err.blockId;
        pane.value = "blocks";
      } else if (err.blockId.startsWith("__index_") && hubConfig.value) {
        const idx = Number(err.blockId.replace("__index_", ""));
        const b = hubConfig.value.blocks[idx];
        if (b) selectedBlockId.value = b.id;
        pane.value = "blocks";
      }
    }

    async function save(): Promise<boolean> {
      if (!hubConfig.value || !eventId.value) return false;
      if (backendOutdated.value) {
        saveUi.value = "failed";
        saveErrorMessage.value = backendOutdatedMessage();
        notify({ text: saveErrorMessage.value.split("\n")[0], type: "error", duration: 5000 });
        return false;
      }
      const clientErrors = validateHubConfigClient(hubConfig.value);
      if (clientErrors.length) {
        fieldErrors.value = clientErrors;
        scrollToFieldError(clientErrors[0]);
        saveUi.value = "failed";
        saveErrorMessage.value = clientErrors[0].message;
        notify({ text: clientErrors[0].message, type: "error", duration: 4000 });
        return false;
      }
      saving.value = true;
      saveUi.value = "saving";
      fieldErrors.value = [];
      saveErrorMessage.value = "";
      try {
        await updateHub(eventId.value, {
          slug: slug.value || null,
          is_published: isPublished.value,
          hub_config: hubConfig.value,
        });
        markSaved(true);
        notify({ text: "העמוד נשמר", type: "success", duration: 3000 });
        return true;
      } catch (err) {
        const classified = classifyHubError(err, { usesTemplate: hasTemplate.value });
        if (classified.kind === "backend_outdated") {
          backendOutdated.value = true;
          saveUi.value = "failed";
          saveErrorMessage.value = classified.message;
          notify({ text: classified.message.split("\n")[0], type: "error", duration: 5500 });
          return false;
        }
        const mapped = mapAxiosValidationErrors(err, hubConfig.value?.blocks);
        if (mapped.length) {
          fieldErrors.value = mapped.map((e) => {
            if (e.blockId.startsWith("__index_") && hubConfig.value) {
              const idx = Number(e.blockId.replace("__index_", ""));
              const b = hubConfig.value.blocks[idx];
              return b ? { ...e, blockId: b.id } : e;
            }
            return e;
          });
          scrollToFieldError(fieldErrors.value[0]);
          saveUi.value = "failed";
          saveErrorMessage.value = fieldErrors.value[0].message;
          notify({ text: fieldErrors.value[0].message, type: "error", duration: 4500 });
        } else {
          saveUi.value = "failed";
          saveErrorMessage.value = classified.message;
          notify({ text: classified.message.split("\n")[0], type: "error", duration: 4500 });
        }
        return false;
      } finally {
        saving.value = false;
      }
    }

    async function onPublish() {
      if (!eventId.value || backendOutdated.value) return;
      if (dirty.value) {
        const ok = window.confirm("יש שינויים שלא נשמרו. לשמור ואז לפרסם?");
        if (!ok) return;
        const saved = await save();
        if (!saved) return;
      }
      if (!slug.value || !slugAvailable.value) {
        notify({ text: "בחרו כתובת פנויה לפני הפרסום", type: "error", duration: 3500 });
        return;
      }
      acting.value = true;
      try {
        const res = await publishHub(eventId.value, {
          is_published: true,
          slug: slug.value,
        });
        isPublished.value = Boolean(res.is_published);
        slug.value = res.slug || slug.value;
        markSaved(true);
        notify({ text: "העמוד פורסם", type: "success", duration: 3000 });
      } catch (err) {
        const classified = classifyHubError(err, { usesTemplate: hasTemplate.value });
        if (classified.kind === "backend_outdated") backendOutdated.value = true;
        notify({
          text: classified.message.split("\n")[0],
          type: "error",
          duration: 4500,
        });
      } finally {
        acting.value = false;
      }
    }

    async function onUnpublish() {
      if (!eventId.value || backendOutdated.value) return;
      acting.value = true;
      try {
        const res = await publishHub(eventId.value, { is_published: false });
        isPublished.value = Boolean(res.is_published);
        markSaved(true);
        notify({ text: "הפרסום הוסר", type: "success", duration: 3000 });
      } catch (err) {
        const classified = classifyHubError(err, { usesTemplate: hasTemplate.value });
        if (classified.kind === "backend_outdated") backendOutdated.value = true;
        notify({
          text: classified.message.split("\n")[0],
          type: "error",
          duration: 4500,
        });
      } finally {
        acting.value = false;
      }
    }

    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (!dirty.value) return;
      e.preventDefault();
      e.returnValue = "";
    }

    function onKeydown(e: KeyboardEvent) {
      const key = e.key?.toLowerCase?.() || "";
      if (!(e.ctrlKey || e.metaKey) || key !== "s") return;
      if (loadState.value !== "ready" || !hasTemplate.value) return;
      e.preventDefault();
      if (!saving.value && !backendOutdated.value) save();
    }

    onMounted(() => {
      load();
      window.addEventListener("beforeunload", onBeforeUnload);
      window.addEventListener("keydown", onKeydown);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.removeEventListener("keydown", onKeydown);
    });

    watch(eventId, (id, prev) => {
      if (id && id !== prev) load();
    });

    watch(dirty, (isDirty) => {
      if (isDirty && saveUi.value !== "saving" && saveUi.value !== "failed") {
        saveUi.value = "dirty";
      }
    });

    return {
      loadState,
      loadError,
      load,
      hubConfig,
      slug,
      isPublished,
      dirty,
      hasTemplate,
      templateId,
      eventId,
      eventType,
      selectedBlockId,
      selectedBlock,
      pane,
      showPicker,
      mobilePreview,
      saving,
      acting,
      fieldErrors,
      publicUrl,
      canPublish,
      backendOutdated,
      backendOutdatedLines,
      backendOutdatedTooltip,
      saveUi,
      saveErrorMessage,
      saveStatusLabel,
      saveStatusClass,
      onPickTemplate,
      onToggle,
      onMove,
      onBlockUpdate,
      onThemeUpdate,
      onSlugAvailability,
      save,
      onPublish,
      onUnpublish,
    };
  },
});
</script>

<style lang="scss" scoped>
.epb {
  display: grid;
  gap: 16px;
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
}
.epb-state {
  padding: 32px 8px;
  color: #5e564e;
}
.epb-error h2 {
  margin: 0 0 8px;
  font-size: 1.4rem;
}
.epb-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-start;
}
.epb-head h1 {
  margin: 0;
  font-size: clamp(1.9rem, 3vw, 2.55rem);
  font-weight: 900;
  letter-spacing: -0.04em;
}
.lede {
  margin: 8px 0 0;
  color: #5e564e;
  font-size: 1.05rem;
  max-width: 42em;
}
.muted-note {
  margin: 8px 0 0;
  color: #8a8278;
  font-size: 0.88rem;
}
.epb-head-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.epb-save-meta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.save-status {
  font-size: 0.85rem;
  font-weight: 700;
  color: #8a8278;
  white-space: nowrap;
}
.save-status.dirty {
  color: #a66a12;
}
.save-status.ok {
  color: #2f7a45;
}
.save-status.bad {
  color: #b42318;
}
.save-status.busy {
  color: #5e564e;
}
.btn.retry {
  padding: 6px 12px;
  font-size: 0.85rem;
}
.epb-banner {
  padding: 12px 14px;
  border-radius: 14px;
  background: #fff4f0;
  border: 1px solid rgba(180, 35, 24, 0.22);
  color: #7a1f16;
  line-height: 1.45;
}
.epb-banner p {
  margin: 0;
}
.epb-banner p + p {
  margin-top: 6px;
  font-size: 0.92rem;
}
.epb-inline-err {
  margin: 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fff4f0;
  border: 1px solid rgba(180, 35, 24, 0.18);
  color: #7a1f16;
  white-space: pre-line;
}
.btn {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
  background: rgba(22, 19, 16, 0.08);
}
.btn.primary {
  color: #fff;
  background: linear-gradient(135deg, var(--accent-2, #dc5b66), var(--accent, #c9a36a));
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.epb-slug-wrap {
  max-width: 520px;
}
.epb-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(380px, 46%);
  gap: 18px;
  align-items: start;
  max-width: 100%;
  width: 100%;
}
.epb-layout > :last-child {
  min-width: 0;
  width: 100%;
}
.epb-editor {
  min-width: 0;
  display: grid;
  gap: 12px;
}
.epb-panes {
  display: inline-flex;
  background: rgba(22, 19, 16, 0.06);
  border-radius: 999px;
  padding: 3px;
  gap: 2px;
}
.epb-panes button {
  border: 0;
  background: transparent;
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 800;
  font-family: inherit;
  cursor: pointer;
}
.epb-panes button.on {
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.epb-blocks {
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
  gap: 14px;
  align-items: start;
}
.epb-sheet {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: #0e0c0a;
  display: grid;
  grid-template-rows: auto 1fr;
}
.epb-sheet-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: #1c1814;
  color: #f3eee6;
}
.epb-sheet-body {
  overflow: hidden;
  background: #1c1814;
  padding: 12px;
  min-height: 0;
}
.epb-sheet-body :deep(.lpi) {
  height: 100%;
}
:deep(.epb-flash) {
  animation: epbFlash 1.4s ease;
}
@keyframes epbFlash {
  0%,
  100% {
    background: transparent;
  }
  30% {
    background: rgba(220, 91, 102, 0.18);
  }
}

@media (max-width: 1100px) {
  .epb-layout {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 720px) {
  .epb-blocks {
    grid-template-columns: 1fr;
  }
  .epb-head-actions {
    width: 100%;
  }
}
</style>
