<template>
  <Teleport to="body">
    <div class="epb-wizard epb-portal" dir="rtl" lang="he">
      <div class="modal-back" @click.self="$emit('close')">
        <div
          ref="dialogEl"
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="succ-h"
        >
          <div class="succ">
            <div v-if="confetti.length" class="confetti" aria-hidden="true">
              <i v-for="(c, i) in confetti" :key="i" :style="c" />
            </div>
            <button type="button" class="mclose" aria-label="סגירה" @click="$emit('close')">
              <BuilderIcon name="x" />
            </button>
            <div class="burst"><BuilderIcon name="check" /></div>
            <h2 id="succ-h">העמוד באוויר!</h2>
            <p>עכשיו שולחים את הקישור לאורחים.</p>
            <HubLinkBox :slug="slug" />
            <div class="succ-actions">
              <a class="btn btn-wa" :href="waUrl" target="_blank" rel="noopener">
                <BuilderIcon name="wa" />שליחה בוואטסאפ
              </a>
              <a class="btn btn-ghost" :href="fullUrl" target="_blank" rel="noopener">
                <BuilderIcon name="open" />פתיחת העמוד
              </a>
            </div>
            <div class="note">
              <BuilderIcon name="qr" />
              <span>כרטיס ה־QR על השולחנות ממשיך להוביל ישר להעלאת תמונות, כמו קודם.</span>
            </div>
            <button ref="doneEl" type="button" class="btn btn-primary btn-block succ-done" @click="$emit('close')">
              סיום
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from "vue";
import BuilderIcon from "./BuilderIcon.vue";
import HubLinkBox from "./HubLinkBox.vue";
import { hubFullUrl, whatsappShareUrl } from "./hubPublicUrl";
import { useBuilderDialog } from "./useBuilderDialog";

const COLORS = ["#DC5B66", "#C9A36A", "#F0B9A8", "#241B15", "#E9C46A", "#8FB996"];

function buildConfetti(): Array<Record<string, string>> {
  if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
    return [];
  }
  const out: Array<Record<string, string>> = [];
  for (let i = 0; i < 34; i++) {
    const rnd = (n: number) => {
      const v = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
      return v - Math.floor(v);
    };
    const style: Record<string, string> = {
      left: `${Math.round(rnd(1) * 96 + 2)}%`,
      background: COLORS[i % COLORS.length],
      "--y": `${Math.round(10 + rnd(2) * 110)}px`,
      "--r": `${Math.round(rnd(3) * 360)}deg`,
      animationDelay: `${(i % 7) * 0.08}s`,
    };
    if (i % 3 === 0) {
      style.borderRadius = "50%";
      style.width = "9px";
      style.height = "9px";
    }
    out.push(style);
  }
  return out;
}

export default defineComponent({
  name: "PublishSuccessDialog",
  components: { BuilderIcon, HubLinkBox },
  props: {
    slug: { type: String, required: true },
    titleText: { type: String, default: "" },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const dialogEl = ref<HTMLElement | null>(null);
    const doneEl = ref<HTMLElement | null>(null);
    const confetti = buildConfetti();
    const fullUrl = computed(() => hubFullUrl(props.slug));
    const waUrl = computed(() => whatsappShareUrl(props.titleText, props.slug));
    useBuilderDialog(
      dialogEl,
      () => emit("close"),
      () => doneEl.value
    );
    return { dialogEl, doneEl, confetti, fullUrl, waUrl };
  },
});
</script>
