<template>
  <section ref="stageEl" class="stage" :class="{ loaded: frameReady }" aria-label="תצוגה מקדימה">
    <div class="stage-hint" :class="{ on: showHint }">
      <div v-if="showHint" class="hint-card" role="note">
        <b><BuilderIcon name="sparkle" />ככה בונים את העמוד</b>
        <ol>
          <li><strong>לחצו על כל חלק</strong> בתצוגה כדי לערוך אותו.</li>
          <li>מימין: <strong>עיצוב</strong>, <strong>תוכן</strong> והגדרות.</li>
          <li>הכל <strong>נשמר לבד</strong>. כשמוכנים, «פרסום».</li>
        </ol>
        <button type="button" class="btn btn-dark btn-sm" @click="$emit('hint-ok')">הבנתי</button>
      </div>
    </div>
    <div class="devwrap" :style="wrapStyle">
      <div class="dev" :class="devClass" :style="devStyle">
        <div class="chrome"><i></i><i></i><i></i><div class="url" dir="ltr">{{ urlText }}</div></div>
        <div class="screen">
          <iframe
            ref="frameEl"
            title="תצוגה מקדימה של דף האירוע"
            src="/h-preview"
            :style="frameStyle"
            @load="onLoad"
          />
        </div>
      </div>
    </div>
    <div class="stage-foot">
      <span>{{ zoomText }}</span><span class="sep">·</span
      ><span><BuilderIcon name="edit" /> לחצו על חלק בעמוד כדי לערוך אותו</span>
    </div>
    <button type="button" class="btn btn-dark exit-full" @click="$emit('exit-full')">
      <BuilderIcon name="edit" />חזרה לעריכה
    </button>
  </section>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from "vue";
import type { HubConfig } from "../types";
import BuilderIcon from "./BuilderIcon.vue";

const MSG_TYPE = "snapshare:landing-preview";
const READY_TYPE = "snapshare:landing-preview-ready";
const PING_TYPE = "snapshare:landing-preview-ping";
const SCROLL_TYPE = "snapshare:landing-preview-scroll";
const KEY_TYPE = "snapshare:landing-preview-key";
const EDIT_TYPE = "snapshare:landing-preview-edit";
const SELECT_TYPE = "snapshare:landing-preview-select";
const PICK_TYPE = "snapshare:landing-preview-pick";

/**
 * The workspace stage: the real public renderer (/h-preview) in an iframe, scaled to fit.
 * Phone = 390x844 in a bezel, desktop = 1440 wide x stage height, mobile = a bare 390 card.
 * Same maths as the approved mock (builder-mock-v2 layoutPreview).
 */
export default defineComponent({
  name: "WorkspaceStage",
  components: { BuilderIcon },
  props: {
    templateId: { type: String, required: true },
    hubConfig: { type: Object as PropType<HubConfig>, required: true },
    device: { type: String as PropType<"phone" | "desktop">, required: true },
    mobile: { type: Boolean, default: false },
    full: { type: Boolean, default: false },
    editOn: { type: Boolean, default: true },
    /** block id -> section name, for the «עריכה · …» chip; only these are clickable. */
    labels: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
    selectedId: { type: String, default: "" },
    scrollId: { type: String, default: "" },
    scrollTick: { type: Number, default: 0 },
    urlText: { type: String, default: "" },
    showHint: { type: Boolean, default: false },
  },
  emits: ["pick", "hint-ok", "exit-full", "escape"],
  setup(props, { emit }) {
    const stageEl = ref<HTMLElement | null>(null);
    const frameEl = ref<HTMLIFrameElement | null>(null);
    const frameReady = ref(false);
    const box = ref({ w: 0, h: 0 });
    let ro: ResizeObserver | null = null;
    let pingT: ReturnType<typeof setInterval> | null = null;
    let postT: ReturnType<typeof setTimeout> | null = null;

    const layout = computed(() => {
      const mob = props.mobile;
      const padX = mob ? 12 : 28;
      const padTop = mob ? 10 : 20;
      const padBot = mob ? 10 : props.full || props.device === "desktop" ? 20 : 34;
      const W = Math.max(0, box.value.w - padX * 2);
      const H = Math.max(0, box.value.h - padTop - padBot);
      let s: number, iw: number, ih: number, ow: number, oh: number, cls: string;
      if (mob) {
        iw = 390;
        s = Math.min(1, W / iw) || 1;
        ih = Math.round(H / s);
        ow = iw;
        oh = ih;
        cls = "bare";
      } else if (props.device === "phone") {
        iw = 390;
        ih = 844;
        const bz = 11;
        ow = iw + bz * 2;
        oh = ih + bz * 2;
        s = Math.min(H / oh, W / ow, 1) || 1;
        cls = "phone";
      } else {
        iw = 1440;
        const chrome = 38;
        s = Math.min(W / iw, 1) || 1;
        ih = Math.round(H / s - chrome);
        ow = iw;
        oh = ih + chrome;
        cls = "desk";
      }
      return { s, iw, ih, ow, oh, cls, padTop, padBot };
    });

    const devClass = computed(() => layout.value.cls);
    const devStyle = computed(() => ({
      width: `${layout.value.ow}px`,
      height: `${layout.value.oh}px`,
      transform: `scale(${layout.value.s})`,
    }));
    const wrapStyle = computed(() => ({
      width: `${Math.round(layout.value.ow * layout.value.s)}px`,
      height: `${Math.round(layout.value.oh * layout.value.s)}px`,
    }));
    const frameStyle = computed(() => ({ width: `${layout.value.iw}px`, height: `${layout.value.ih}px` }));
    const zoomText = computed(
      () =>
        `${props.device === "phone" || props.mobile ? "טלפון" : "מחשב"} · ${Math.round(layout.value.s * 100)}%`
    );

    function measure() {
      const el = stageEl.value;
      if (!el) return;
      box.value = { w: el.clientWidth, h: el.clientHeight };
      el.style.paddingBottom = `${layout.value.padBot - layout.value.padTop}px`;
    }

    function win(): Window | null {
      return frameEl.value?.contentWindow || null;
    }
    function post(msg: Record<string, unknown>) {
      const w = win();
      if (w && frameReady.value) w.postMessage(msg, window.location.origin);
    }
    function postConfig() {
      post({
        type: MSG_TYPE,
        templateId: props.templateId,
        hubConfig: JSON.parse(JSON.stringify(props.hubConfig)),
      });
    }
    function postEdit() {
      post({ type: EDIT_TYPE, on: props.editOn && !props.full, labels: { ...props.labels } });
      post({ type: SELECT_TYPE, sectionId: props.full ? "" : props.selectedId });
    }
    function schedulePost() {
      if (postT) clearTimeout(postT);
      postT = setTimeout(() => {
        postT = null;
        postConfig();
      }, 60);
    }

    function onMessage(ev: MessageEvent) {
      if (ev.origin !== window.location.origin || ev.source !== win()) return;
      const d = ev.data;
      if (!d || typeof d !== "object") return;
      if (d.type === READY_TYPE) {
        const first = !frameReady.value;
        frameReady.value = true;
        if (pingT) {
          clearInterval(pingT);
          pingT = null;
        }
        postConfig();
        postEdit();
        if (first && props.scrollId) {
          setTimeout(() => post({ type: SCROLL_TYPE, sectionId: props.scrollId, instant: true }), 150);
        }
      } else if (d.type === PICK_TYPE && typeof d.sectionId === "string") {
        emit("pick", d.sectionId);
      } else if (d.type === KEY_TYPE && d.key === "Escape") {
        emit("escape");
      }
    }

    function onLoad() {
      frameReady.value = false;
      if (pingT) clearInterval(pingT);
      let n = 0;
      pingT = setInterval(() => {
        win()?.postMessage({ type: PING_TYPE }, window.location.origin);
        if (++n > 40 && pingT) {
          clearInterval(pingT);
          pingT = null;
        }
      }, 150);
    }

    watch(() => [props.hubConfig, props.templateId], schedulePost, { deep: true });
    watch(() => [props.editOn, props.full, props.selectedId, props.labels], postEdit, { deep: true });
    watch(
      () => props.scrollTick,
      () => {
        if (props.scrollId) post({ type: SCROLL_TYPE, sectionId: props.scrollId, instant: false });
      }
    );
    watch(layout, () => {
      const el = stageEl.value;
      if (el) el.style.paddingBottom = `${layout.value.padBot - layout.value.padTop}px`;
    });

    onMounted(() => {
      window.addEventListener("message", onMessage);
      measure();
      if (typeof ResizeObserver !== "undefined" && stageEl.value) {
        ro = new ResizeObserver(measure);
        ro.observe(stageEl.value);
      }
    });
    onBeforeUnmount(() => {
      window.removeEventListener("message", onMessage);
      ro?.disconnect();
      if (pingT) clearInterval(pingT);
      if (postT) clearTimeout(postT);
    });

    return {
      stageEl,
      frameEl,
      frameReady,
      devClass,
      devStyle,
      wrapStyle,
      frameStyle,
      zoomText,
      onLoad,
    };
  },
});
</script>
