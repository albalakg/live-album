<template>
  <nav class="lsn" :class="{ dark }" aria-label="ניווט בעמוד">
    <!-- Desktop (>= 768px of the page's own viewport): small floating pill -->
    <div class="lsn-pill">
      <a
        v-for="n in pillItems"
        :key="'p-' + n.id"
        :href="'#sec-' + n.id"
        class="lsn-link"
        :class="{ on: active === n.id }"
        :aria-current="active === n.id ? 'true' : undefined"
        :data-sec="n.id"
        @click.prevent="go(n.id)"
      >{{ n.label }}</a>
      <button
        v-if="pillMore.length"
        type="button"
        class="lsn-link lsn-more-btn"
        :class="{ on: moreActive(pillMore) }"
        :aria-expanded="moreOpen ? 'true' : 'false'"
        @click="moreOpen = !moreOpen"
      >עוד</button>
    </div>

    <!-- Mobile (< 768px): app-style tab bar fixed to the bottom -->
    <div class="lsn-tabs">
      <a
        v-for="n in tabItems"
        :key="'t-' + n.id"
        :href="'#sec-' + n.id"
        class="lsn-tab"
        :class="{ on: active === n.id }"
        :aria-current="active === n.id ? 'true' : undefined"
        :data-sec="n.id"
        @click.prevent="go(n.id)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="n.icon" /></svg>
        <span>{{ n.label }}</span>
      </a>
      <button
        v-if="tabMore.length"
        type="button"
        class="lsn-tab lsn-more-btn"
        :class="{ on: moreActive(tabMore) }"
        :aria-expanded="moreOpen ? 'true' : 'false'"
        @click="moreOpen = !moreOpen"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="moreIcon" /></svg>
        <span>עוד</span>
      </button>
    </div>

    <div v-if="moreOpen" class="lsn-more-back" @click="moreOpen = false" />
    <div v-if="moreOpen" class="lsn-more" role="menu">
      <a
        v-for="n in moreList"
        :key="'m-' + n.id"
        :href="'#sec-' + n.id"
        role="menuitem"
        class="lsn-more-item"
        :class="{ on: active === n.id }"
        @click.prevent="go(n.id)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="n.icon" /></svg>
        <span>{{ n.label }}</span>
      </a>
    </div>
  </nav>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref, type PropType } from "vue";

export interface SectionNavItem {
  id: string;
  label: string;
  icon: string;
}

/** Keep the first item when two sections share a visible label (e.g. STEPS + SNAPSHARE_CTA both "העלאה"). */
export function uniqueNavItems(items: SectionNavItem[]): SectionNavItem[] {
  const seen = new Set<string>();
  const out: SectionNavItem[] = [];
  for (const n of items) {
    const key = String(n.label || "").trim();
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    out.push(n);
  }
  return out;
}

/** Tab bar holds at most 5 slots: 4 sections + "עוד" when there are more. */
const TAB_SLOTS = 5;
/** Desktop pill holds up to 7 links before the rest go under "עוד". */
const PILL_SLOTS = 7;

export default defineComponent({
  name: "LandingSectionNav",
  props: {
    items: { type: Array as PropType<SectionNavItem[]>, required: true },
    active: { type: String, default: "" },
    dark: { type: Boolean, default: false },
  },
  emits: ["go"],
  setup(props, { emit }) {
    const moreOpen = ref(false);
    const isMobile = ref(false);
    let mq: MediaQueryList | null = null;

    const items = computed(() => uniqueNavItems(props.items));
    const split = (slots: number) => {
      const all = items.value;
      if (all.length <= slots) return { main: all, more: [] as SectionNavItem[] };
      return { main: all.slice(0, slots - 1), more: all.slice(slots - 1) };
    };
    const tabItems = computed(() => split(TAB_SLOTS).main);
    const tabMore = computed(() => split(TAB_SLOTS).more);
    const pillItems = computed(() => split(PILL_SLOTS).main);
    const pillMore = computed(() => split(PILL_SLOTS).more);
    const moreList = computed(() => (isMobile.value ? tabMore.value : pillMore.value));
    const moreIcon = "M5 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm7 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z";

    function moreActive(list: SectionNavItem[]) {
      return list.some((n) => n.id === props.active);
    }
    function go(id: string) {
      moreOpen.value = false;
      emit("go", id);
    }
    function onMq() {
      isMobile.value = Boolean(mq?.matches);
      moreOpen.value = false;
    }
    onMounted(() => {
      if (typeof window.matchMedia !== "function") return;
      mq = window.matchMedia("(max-width: 767.98px)");
      onMq();
      mq.addEventListener?.("change", onMq);
    });
    onBeforeUnmount(() => {
      mq?.removeEventListener?.("change", onMq);
    });

    return { moreOpen, tabItems, tabMore, pillItems, pillMore, moreList, moreIcon, moreActive, go };
  },
});
</script>

<style>
/* Global (not scoped) so the page shell can read --lsn-h for its bottom padding. */
.landing-root {
  --lsn-tab-h: 62px;
}
</style>

<style scoped>
.lsn {
  --lsn-bg: var(--nav-bg, rgba(247, 241, 232, 0.9));
  --lsn-ink: var(--ink, #161310);
  --lsn-muted: var(--muted, #5e564e);
  --lsn-on-bg: var(--nav-on-bg, var(--accent, #161310));
  --lsn-on-ink: var(--nav-on-ink, #fff);
  font-family: var(--font-body, var(--font));
  color: var(--lsn-ink);
}
.lsn svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex: none;
}

/* ---------- Desktop pill ---------- */
.lsn-pill {
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 5px;
  max-width: calc(100% - 32px);
  border-radius: 999px;
  background: var(--lsn-bg);
  backdrop-filter: blur(14px) saturate(1.2);
  -webkit-backdrop-filter: blur(14px) saturate(1.2);
  border: 1px solid var(--line, rgba(22, 19, 16, 0.1));
  box-shadow: 0 10px 30px rgba(18, 16, 14, 0.14);
  white-space: nowrap;
}
.lsn-link {
  display: inline-flex;
  align-items: center;
  height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--lsn-muted);
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
}
.lsn-link:hover {
  color: var(--lsn-ink);
}
.lsn-link.on {
  background: var(--lsn-on-bg);
  color: var(--lsn-on-ink);
}

/* ---------- Mobile bottom tab bar ---------- */
.lsn-tabs {
  display: none;
}
@media (max-width: 767.98px) {
  .lsn-pill {
    display: none;
  }
  .lsn-tabs {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 60;
    display: flex;
    align-items: stretch;
    justify-content: space-around;
    height: calc(var(--lsn-tab-h) + env(safe-area-inset-bottom, 0px));
    padding: 0 6px env(safe-area-inset-bottom, 0px);
    background: var(--lsn-bg);
    backdrop-filter: blur(16px) saturate(1.2);
    -webkit-backdrop-filter: blur(16px) saturate(1.2);
    border-top: 1px solid var(--line, rgba(22, 19, 16, 0.1));
    box-shadow: 0 -6px 24px rgba(18, 16, 14, 0.08);
  }
}
.lsn-tab {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  color: var(--lsn-muted);
  font-size: 0.68rem;
  font-weight: 700;
  text-decoration: none;
  position: relative;
}
.lsn-tab span {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lsn-tab svg {
  padding: 3px 14px;
  width: 52px;
  height: 30px;
  border-radius: 999px;
  transition: background-color 0.2s, color 0.2s;
}
.lsn-tab.on {
  color: var(--lsn-ink);
}
.lsn-tab.on svg {
  background: var(--lsn-on-bg);
  color: var(--lsn-on-ink);
}

/* ---------- "עוד" menu ---------- */
.lsn-more-back {
  position: fixed;
  inset: 0;
  z-index: 61;
  background: rgba(10, 8, 6, 0.28);
}
.lsn-more {
  position: fixed;
  z-index: 62;
  top: 64px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 220px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 8px;
  border-radius: 18px;
  background: var(--bg, #f3eee6);
  color: var(--ink, #161310);
  box-shadow: 0 18px 44px rgba(18, 16, 14, 0.22);
  display: grid;
  gap: 2px;
}
@media (max-width: 767.98px) {
  .lsn-more {
    top: auto;
    left: 0;
    right: 0;
    transform: none;
    bottom: calc(var(--lsn-tab-h) + env(safe-area-inset-bottom, 0px));
    border-radius: 20px 20px 0 0;
    padding: 12px 12px 8px;
  }
}
.lsn-more-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 46px;
  padding: 0 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  color: inherit;
}
.lsn-more-item.on {
  background: var(--nav-on-bg, var(--accent));
  color: var(--nav-on-ink, #fff);
}
@media (prefers-reduced-motion: reduce) {
  .lsn-link,
  .lsn-tab svg {
    transition: none;
  }
}
</style>
