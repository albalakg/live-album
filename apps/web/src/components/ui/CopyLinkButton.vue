<template>
  <span class="copy-link-root" ref="root">
    <button
      type="button"
      class="copy-link-btn"
      :aria-label="label"
      :title="label"
      @click="copy"
    >
      <svg
        class="copy-link-ico"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <rect fill="none" x="8" y="8" width="12" height="12" rx="2" />
        <path fill="none" d="M6 16H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
    <Teleport to="body">
      <div
        v-show="tipVisible"
        class="copy-link-tip"
        role="status"
        aria-live="polite"
        :style="tipStyle"
      >
        הקישור הועתק ✓
      </div>
    </Teleport>
  </span>
</template>

<script lang="ts">
import { defineComponent } from "vue";

const TIP_MS = 1800;
const EDGE = 8;

export default defineComponent({
  name: "CopyLinkButton",

  props: {
    text: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: "העתקת קישור",
    },
  },

  data() {
    return {
      tipVisible: false,
      tipStyle: {
        top: "0px",
        left: "0px",
      } as Record<string, string>,
      tipTimer: null as ReturnType<typeof setTimeout> | null,
    };
  },

  beforeUnmount() {
    if (this.tipTimer) clearTimeout(this.tipTimer);
  },

  methods: {
    fallbackCopy(text: string): boolean {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "0";
      area.style.left = "0";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.focus();
      area.select();
      let ok = false;
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      document.body.removeChild(area);
      return ok;
    },

    async copy() {
      const value = String(this.text || "");
      if (!value) return;

      let ok = false;
      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(value);
          ok = true;
        } else {
          ok = this.fallbackCopy(value);
        }
      } catch {
        ok = this.fallbackCopy(value);
      }

      if (ok) this.showTip();
    },

    showTip() {
      this.positionTip();
      this.tipVisible = true;
      if (this.tipTimer) clearTimeout(this.tipTimer);
      this.tipTimer = setTimeout(() => {
        this.tipVisible = false;
      }, TIP_MS);
    },

    positionTip() {
      const root = this.$refs.root as HTMLElement | undefined;
      const btn = root?.querySelector(".copy-link-btn") as HTMLElement | null;
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const vw = window.innerWidth || document.documentElement.clientWidth;
      const tipHalf = 90;
      let left = rect.left + rect.width / 2;
      left = Math.max(EDGE + tipHalf, Math.min(vw - EDGE - tipHalf, left));

      const top = Math.max(EDGE + 36, rect.top - 8);
      this.tipStyle = {
        top: `${top}px`,
        left: `${left}px`,
      };
    },
  },
});
</script>

<style lang="scss" scoped>
.copy-link-root {
  position: relative;
  display: inline-flex;
  flex: none;
  vertical-align: middle;
}

.copy-link-btn {
  width: 40px;
  height: 40px;
  border: 1px solid var(--line, rgba(22, 19, 16, 0.16));
  border-radius: 12px;
  background: #fffcfa;
  color: var(--ink, #161310);
  display: grid;
  place-items: center;
  cursor: pointer;
  padding: 0;
  font-family: var(--font, Heebo, "Segoe UI", Tahoma, sans-serif);
  transition: border-color 0.2s ease, background 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.copy-link-btn:hover {
  border-color: var(--ink, #161310);
}

.copy-link-btn:focus-visible {
  outline: 2px solid var(--rose, #dc5b66);
  outline-offset: 2px;
}

.copy-link-ico {
  width: 18px;
  height: 18px;
  display: block;
  fill: none;
  stroke: currentColor;
}
</style>

<style lang="scss">
.copy-link-tip {
  position: fixed;
  z-index: 10000;
  pointer-events: none;
  max-width: calc(100vw - 16px);
  padding: 8px 12px;
  border-radius: 12px;
  background: var(--ink, #161310);
  color: #fffcfa;
  font-family: var(--font, Heebo, "Segoe UI", Tahoma, sans-serif);
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.3;
  white-space: nowrap;
  box-shadow: 0 10px 28px rgba(18, 16, 14, 0.22);
  transform: translate(-50%, -100%);
  animation: copy-link-tip-fade 1.8s ease forwards;
}

@keyframes copy-link-tip-fade {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
