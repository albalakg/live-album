<template>
  <div ref="root" class="qr-ms" :class="{ open, active: modelValue.length > 0 }">
    <button
      ref="trigger"
      type="button"
      class="qr-ms-btn"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="panelId"
      @click="toggle"
    >
      <span class="qr-ms-label">{{ label }}</span>
      <span v-if="modelValue.length" class="qr-ms-count">· {{ modelValue.length }}</span>
      <svg class="qr-ms-caret" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <Teleport to="body" :disabled="!isMobile">
      <div v-if="open && isMobile" class="qr-ms-backdrop" @click="close" />
      <div
        v-if="open"
        :id="panelId"
        ref="panel"
        class="qr-ms-panel"
        :class="{ sheet: isMobile }"
        role="listbox"
        aria-multiselectable="true"
        :aria-label="label"
        dir="rtl"
        @keydown.esc.stop.prevent="close(true)"
      >
        <div v-if="isMobile" class="qr-ms-grip" aria-hidden="true" />
        <div class="qr-ms-head">
          <b>{{ label }}</b>
          <button type="button" class="qr-ms-clear" :disabled="!modelValue.length" @click="clear">
            ניקוי
          </button>
        </div>
        <div class="qr-ms-list">
          <label
            v-for="opt in options"
            :key="opt.id"
            class="qr-ms-opt"
            :class="{ on: modelValue.includes(opt.id) }"
            role="option"
            :aria-selected="modelValue.includes(opt.id)"
          >
            <input
              type="checkbox"
              :value="opt.id"
              :checked="modelValue.includes(opt.id)"
              @change="toggleValue(opt.id)"
            />
            <span class="qr-ms-box" aria-hidden="true">
              <svg viewBox="0 0 12 12"><path d="M2.5 6.2 5 8.6l4.5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
            <span class="qr-ms-text">{{ opt.label }}</span>
          </label>
        </div>
        <div v-if="isMobile" class="qr-ms-foot">
          <button type="button" class="qr-ms-done" @click="close(true)">
            {{ modelValue.length ? `הצגת תוצאות · ${modelValue.length}` : "סגירה" }}
          </button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";

let uid = 0;

export default defineComponent({
  name: "QrFilterMultiSelect",
  props: {
    label: { type: String, required: true },
    options: {
      type: Array as PropType<ReadonlyArray<{ id: string; label: string }>>,
      required: true,
    },
    modelValue: { type: Array as PropType<string[]>, default: () => [] },
  },
  emits: ["update:modelValue", "open"],
  data() {
    uid += 1;
    return {
      open: false,
      isMobile: false,
      panelId: `qr-ms-${uid}`,
      mq: null as MediaQueryList | null,
    };
  },
  mounted() {
    if (typeof window !== "undefined" && window.matchMedia) {
      this.mq = window.matchMedia("(max-width: 767.98px)");
      this.isMobile = this.mq.matches;
      this.mq.addEventListener("change", this.onMq);
    }
    document.addEventListener("pointerdown", this.onOutside, true);
    document.addEventListener("keydown", this.onDocKey);
  },
  beforeUnmount() {
    this.mq?.removeEventListener("change", this.onMq);
    document.removeEventListener("pointerdown", this.onOutside, true);
    document.removeEventListener("keydown", this.onDocKey);
    this.lockScroll(false);
  },
  methods: {
    onMq(e: MediaQueryListEvent) {
      this.isMobile = e.matches;
      if (this.open) this.lockScroll(this.isMobile);
    },
    toggle() {
      if (this.open) this.close();
      else this.show();
    },
    show() {
      this.open = true;
      this.$emit("open");
      this.lockScroll(this.isMobile);
      this.$nextTick(() => {
        const first = (this.$refs.panel as HTMLElement | undefined)?.querySelector<HTMLInputElement>("input");
        first?.focus({ preventScroll: true });
      });
    },
    close(refocus = false) {
      if (!this.open) return;
      this.open = false;
      this.lockScroll(false);
      if (refocus === true) (this.$refs.trigger as HTMLElement | undefined)?.focus();
    },
    clear() {
      this.$emit("update:modelValue", []);
    },
    toggleValue(id: string) {
      const next = this.modelValue.includes(id)
        ? this.modelValue.filter((v) => v !== id)
        : [...this.modelValue, id];
      this.$emit("update:modelValue", next);
    },
    onOutside(e: Event) {
      if (!this.open) return;
      const t = e.target as Node | null;
      const root = this.$refs.root as HTMLElement | undefined;
      const panel = this.$refs.panel as HTMLElement | undefined;
      if (t && (root?.contains(t) || panel?.contains(t))) return;
      this.close();
    },
    onDocKey(e: KeyboardEvent) {
      if (e.key === "Escape" && this.open) {
        e.preventDefault();
        this.close(true);
      }
    },
    lockScroll(on: boolean) {
      if (typeof document === "undefined") return;
      document.documentElement.classList.toggle("qr-ms-lock", on);
    },
  },
});
</script>

<style lang="scss" scoped>
.qr-ms { position: relative; flex: none; }

.qr-ms-btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 40px; padding: 0 14px;
  border-radius: 999px; border: 1px solid var(--line, rgba(22, 19, 16, 0.11)); background: var(--paper, #fffcfa);
  color: var(--ink, #161310); font: inherit; font-size: 0.88rem; font-weight: 700;
  cursor: pointer; white-space: nowrap;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.qr-ms-btn:hover { border-color: var(--gold, #c9a36a); }
.qr-ms-btn:focus-visible { outline: 2px solid var(--gold, #c9a36a); outline-offset: 2px; }
.qr-ms.active .qr-ms-btn { background: var(--espresso, #12100e); color: var(--on-dark, #f3eee6); border-color: var(--espresso, #12100e); }
.qr-ms-count { font-weight: 800; }
.qr-ms-caret { width: 12px; height: 12px; transition: transform 0.15s ease; }
.qr-ms.open .qr-ms-caret { transform: rotate(180deg); }

.qr-ms-panel {
  position: absolute; top: calc(100% + 6px); inset-inline-start: 0; z-index: 60;
  width: 260px; max-height: min(420px, 70vh);
  display: flex; flex-direction: column;
  background: var(--paper, #fffcfa); border: 1px solid var(--line, rgba(22, 19, 16, 0.11)); border-radius: 16px;
  box-shadow: 0 18px 44px rgba(18, 16, 14, 0.16);
  overflow: hidden;
  font-family: var(--font, Heebo, sans-serif);
  color: var(--ink, #161310);
}
.qr-ms-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px 8px; font-size: 0.9rem;
}
.qr-ms-clear {
  border: 0; background: none; color: var(--gold-ink, #6e5228); font: inherit; font-size: 0.82rem;
  font-weight: 700; cursor: pointer; padding: 4px 6px; border-radius: 8px;
}
.qr-ms-clear:disabled { color: var(--muted, #5e564e); opacity: 0.7; cursor: default; }
.qr-ms-list { overflow-y: auto; padding: 2px 6px 8px; overscroll-behavior: contain; }
.qr-ms-opt {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 10px; border-radius: 10px; cursor: pointer;
  font-size: 0.9rem; font-weight: 600;
}
.qr-ms-opt:hover { background: var(--bg-2, #e8e0d4); }
.qr-ms-opt input { position: absolute; opacity: 0; width: 1px; height: 1px; pointer-events: none; }
.qr-ms-box {
  width: 18px; height: 18px; flex: none; border-radius: 5px;
  border: 1.5px solid var(--line, rgba(22, 19, 16, 0.28)); display: grid; place-items: center; color: transparent;
  background: var(--paper, #fffcfa);
}
.qr-ms-box svg { width: 12px; height: 12px; }
.qr-ms-opt.on .qr-ms-box { background: var(--espresso, #12100e); border-color: var(--espresso, #12100e); color: var(--on-dark, #f3eee6); }
.qr-ms-opt:focus-within { outline: 2px solid var(--gold, #c9a36a); outline-offset: -2px; }

/* Mobile bottom sheet (teleported to body) */
.qr-ms-backdrop {
  position: fixed; inset: 0; z-index: 10060; background: rgba(18, 16, 14, 0.42);
  animation: qr-ms-fade 0.18s ease both;
}
.qr-ms-panel.sheet {
  position: fixed; top: auto; bottom: 0; left: 0; right: 0; inset-inline-start: 0;
  z-index: 10061; width: 100%; max-height: 72vh;
  border-radius: 22px 22px 0 0; border: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  animation: qr-ms-up 0.22s ease both;
}
.qr-ms-grip { width: 40px; height: 4px; border-radius: 4px; background: var(--bg-2, #e8e0d4); margin: 10px auto 2px; }
.sheet .qr-ms-head { padding: 8px 18px 10px; font-size: 1rem; }
.sheet .qr-ms-list { padding: 0 10px 8px; }
.sheet .qr-ms-opt { padding: 13px 10px; font-size: 1rem; }
.qr-ms-foot { padding: 10px 16px 14px; border-top: 1px solid var(--line, rgba(22, 19, 16, 0.11)); }
.qr-ms-done {
  width: 100%; height: 48px; border: 0; border-radius: 14px;
  background: var(--espresso, #12100e); color: var(--on-dark, #f3eee6); font: inherit; font-weight: 800; font-size: 0.98rem; cursor: pointer;
}

@keyframes qr-ms-up { from { transform: translateY(100%); } to { transform: none; } }
@keyframes qr-ms-fade { from { opacity: 0; } to { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .qr-ms-panel.sheet, .qr-ms-backdrop { animation: none; }
}
</style>

<style>
html.qr-ms-lock, html.qr-ms-lock body { overflow: hidden; }
</style>
