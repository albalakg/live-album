<template>
  <section class="card fcard" aria-labelledby="secs-h">
    <div class="fcard-h">
      <div>
        <h3 id="secs-h">מה יהיה בעמוד?</h3>
        <p>מדליקים את מה שמתאים לכם. אפשר לשנות בכל רגע.</p>
      </div>
      <button v-if="!reorder" type="button" class="link" @click="$emit('update:reorder', true)">
        <BuilderIcon name="grip" />סידור מחדש
      </button>
    </div>

    <!-- Reorder mode -->
    <template v-if="reorder">
      <div class="reorder-bar">
        <span>גוררים או משתמשים בחצים כדי לשנות את הסדר.</span>
        <button type="button" class="btn btn-primary btn-sm" @click="$emit('update:reorder', false)">סיום</button>
      </div>
      <div class="secs reorder">
        <div
          v-for="(k, i) in kinds"
          :key="k"
          class="sec"
          :class="[isOn(k) ? 'on' : 'off', { dragging: dragKind === k, over: overKind === k && dragKind !== k }]"
          :data-kind="k"
          draggable="true"
          @dragstart="onDragStart($event, k)"
          @dragover="onDragOver($event, k)"
          @drop="onDrop($event, k)"
          @dragend="onDragEnd"
        >
          <div class="sec-h">
            <span class="grip" aria-hidden="true"><BuilderIcon name="grip" /></span>
            <span class="sec-ic"><BuilderIcon :name="meta(k).icon" /></span>
            <span class="sec-txt">
              <b>{{ meta(k).name }}</b>
              <span v-if="!isOn(k)">כבוי</span>
            </span>
            <button
              type="button"
              class="mv"
              :data-mv="k"
              data-dir="-1"
              :disabled="i === 0"
              :aria-label="`להזיז למעלה: ${meta(k).name}`"
              @click="move(k, -1)"
            >
              <BuilderIcon name="up" />
            </button>
            <button
              type="button"
              class="mv"
              :data-mv="k"
              data-dir="1"
              :disabled="i === kinds.length - 1"
              :aria-label="`להזיז למטה: ${meta(k).name}`"
              @click="move(k, 1)"
            >
              <BuilderIcon name="down" />
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Normal mode -->
    <div v-else class="secs">
      <SectionCard locked />
      <SectionCard
        v-for="k in kinds"
        :key="k"
        :kind="k"
        :on="isOn(k)"
        :open="openKinds.includes(k)"
        :hint="isOn(k) && isSampleContent(k, content[baseOf(k)])"
        :flash="flashKind === k"
        :error="errors[k] || ''"
        @toggle="$emit('toggle', k, $event)"
        @toggle-open="$emit('toggle-open', k)"
        @focus-section="$emit('focus-kind', k)"
      >
        <SectionFields
          :kind="k"
          :content="content[baseOf(k)]"
          :event="event"
          :event-id="eventId"
          :template-id="templateId"
          :asset-urls="assetUrls"
          @change="$emit('content', baseOf(k), $event)"
        />
      </SectionCard>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, nextTick, ref, type PropType } from "vue";
import BuilderIcon from "./BuilderIcon.vue";
import SectionCard from "./SectionCard.vue";
import SectionFields from "./SectionFields.vue";
import { baseKind, isKindOnByDefault, isSampleContent, kindMeta } from "./hubWizardModel";
import type { WizardContent, WizardEvent } from "./hubWizardModel";

export default defineComponent({
  name: "SectionCardList",
  components: { BuilderIcon, SectionCard, SectionFields },
  props: {
    /** Kinds in page order (the cover is not listed). */
    kinds: { type: Array as PropType<string[]>, required: true },
    /** Explicit on / off choices; missing kinds use their default. */
    sections: { type: Object as PropType<Record<string, boolean>>, required: true },
    content: { type: Object as PropType<WizardContent>, required: true },
    event: { type: Object as PropType<WizardEvent>, required: true },
    eventId: { type: Number, default: 0 },
    templateId: { type: String, default: "" },
    assetUrls: {
      type: Object as PropType<Record<string, { url: string; thumb_url?: string }>>,
      default: () => ({}),
    },
    /** Message per kind (server validation mapped to the card). */
    errors: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
    openKinds: { type: Array as PropType<string[]>, default: () => [] },
    reorder: { type: Boolean, default: false },
    flashKind: { type: String, default: "" },
  },
  emits: ["toggle", "toggle-open", "content", "focus-kind", "reorder", "update:reorder"],
  setup(props, { emit }) {
    const dragKind = ref("");
    const overKind = ref("");

    const isOn = (k: string) =>
      props.sections[k] !== undefined ? !!props.sections[k] : isKindOnByDefault(k);
    const meta = (k: string) => kindMeta(k);
    const baseOf = (k: string) => baseKind(k);

    function move(kind: string, dir: -1 | 1) {
      const list = props.kinds.slice();
      const i = list.indexOf(kind);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= list.length) return;
      [list[i], list[j]] = [list[j], list[i]];
      emit("reorder", list);
      nextTick(() => {
        const q = (d: number) =>
          document.querySelector<HTMLButtonElement>(`[data-mv="${kind}"][data-dir="${d}"]`);
        const same = q(dir);
        (same && !same.disabled ? same : q(-dir))?.focus();
      });
    }

    function onDragStart(e: DragEvent, kind: string) {
      dragKind.value = kind;
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", kind);
      }
    }
    function onDragOver(e: DragEvent, kind: string) {
      if (!dragKind.value) return;
      e.preventDefault();
      overKind.value = kind;
    }
    function onDrop(e: DragEvent, kind: string) {
      if (!dragKind.value) return;
      e.preventDefault();
      const el = e.currentTarget as HTMLElement;
      const after = e.offsetY > el.offsetHeight / 2;
      const list = props.kinds.filter((k) => k !== dragKind.value);
      const at = list.indexOf(kind) + (after ? 1 : 0);
      list.splice(at, 0, dragKind.value);
      emit("reorder", list);
      onDragEnd();
    }
    function onDragEnd() {
      dragKind.value = "";
      overKind.value = "";
    }

    return {
      dragKind,
      overKind,
      isOn,
      meta,
      baseOf,
      isSampleContent,
      move,
      onDragStart,
      onDragOver,
      onDrop,
      onDragEnd,
    };
  },
});
</script>
