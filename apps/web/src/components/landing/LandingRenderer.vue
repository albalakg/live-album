<template>
  <div
    class="landing-root"
    :class="[pageClass, shotHero && 'shot-hero', navItems.length > 1 && 'has-section-nav']"
    :data-scale="scale"
    dir="rtl"
  >
    <a class="skip" href="#sec-hero">דילוג לתוכן</a>

    <div class="page" :class="[templateClass, isDark && 'dark']">
      <component
        :is="sectionComponents.HERO_COUNTDOWN"
        v-if="heroBlock"
        :data="heroBlock.data"
        :section-id="heroBlock.id"
        :hero-style="heroStyle"
      />

      <component
        v-for="(block, i) in bodyBlocks"
        :key="block.id"
        :is="sectionComponents[block.type]"
        v-bind="blockBinds(block, i)"
      />

      <component
        :is="sectionComponents.FOOTER"
        v-if="footerBlock"
        :data="footerBlock.data"
        :section-id="footerBlock.id"
      />
    </div>

    <LandingSectionNav
      v-if="navItems.length > 1"
      :class="templateClass"
      :items="navItems"
      :active="activeSec || (navItems[0] && navItems[0].id) || ''"
      :dark="isDark"
      @go="scrollTo"
    />

    <div class="toast" :class="{ on: !!toastMsg }" role="status" aria-live="polite">{{ toastMsg }}</div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type PropType,
} from "vue";
import { useRoute } from "vue-router";
import "./themes/base.css";
import { LANDING_CTX, type LandingContext } from "./landingContext";
import LandingSectionNav, { type SectionNavItem } from "./LandingSectionNav.vue";
import { sectionComponents } from "./sections/sectionMap";
import {
  getTemplate,
  googleFontsHref,
  loadTemplateTheme,
  navLabelsForTemplate,
} from "./templates/registry";
import type { EventMeta, HubBlock, HubConfig, LandingMode, ResolvedImage } from "./types";

/** Small, decorative-only sections that don't earn a nav slot. */
const NAV_SKIP = new Set(["FOOTER", "QUOTE", "HASHTAG", "MEDIA_STRIP"]);

/** 24x24 stroke icons for the mobile tab bar (lucide-style paths). */
const I = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z",
  heart: "M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z",
  users: "M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.2a3.5 3.5 0 0 1 0 6.6",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2",
  image: "M4 5h16v14H4ZM4 15l4.5-4.5L13 15m-1-1 2.5-2.5L20 17M15.5 9a1 1 0 1 0 0-.01",
  upload: "M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4",
  pin: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  chat: "M20 12a8 8 0 0 1-11.7 7.1L4 20l1-4.1A8 8 0 1 1 20 12Z",
  check: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-4-9 2.8 2.8L16.5 9",
  help: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-2.6-11.5a2.7 2.7 0 0 1 5.2.9c0 1.8-2.6 2.3-2.6 3.9M12 17.2v.01",
  gift: "M4 11h16v9H4ZM3 7h18v4H3Zm9 0v13M12 7S10.5 3 8 3.5 7.2 7 12 7Zm0 0s1.5-4 4-3.5S16.8 7 12 7Z",
  star: "M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.7l5.9-.9Z",
  music: "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm11-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  mic: "M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Zm-6-3a6 6 0 0 0 12 0M12 18v3",
  info: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-10v6m0-9.5v.01",
  link: "M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1",
  flag: "M5 21V4m0 0h11l-1.5 4L16 12H5",
};
const NAV_ICONS: Record<string, string> = {
  DEFAULT: I.info,
  HERO_COUNTDOWN: I.home,
  STORY: I.heart,
  ABOUT: I.info,
  PEOPLE: I.users,
  EVENT_TIMELINE: I.clock,
  CARDS: I.info,
  GALLERY: I.image,
  STEPS: I.upload,
  SNAPSHARE_CTA: I.upload,
  MAP: I.pin,
  SMART_NAVIGATION: I.pin,
  WISHING_WELL: I.chat,
  RICH_TEXT: I.chat,
  RSVP: I.check,
  FAQ: I.help,
  TRIVIA_CTA: I.star,
  GIFT: I.gift,
  MILESTONES: I.flag,
  PLAYLIST: I.music,
  SPEAKERS: I.mic,
  LINEUP: I.music,
  SPONSORS: I.star,
  NETWORKING: I.users,
  BEEN_THERE: I.image,
  GROUNDS: I.pin,
  ZONES: I.pin,
  RULES: I.info,
  LINK_LIST: I.link,
};

export default defineComponent({
  name: "LandingRenderer",
  components: { LandingSectionNav },
  props: {
    templateId: { type: String, required: true },
    hubConfig: { type: Object as PropType<HubConfig>, required: true },
    mode: { type: String as PropType<LandingMode>, default: "preview" },
    resolvedImages: { type: Object as PropType<Record<string, ResolvedImage>>, default: undefined },
    eventMeta: { type: Object as PropType<EventMeta>, default: undefined },
    coverImage: { type: Object as PropType<ResolvedImage | null>, default: null },
  },
  setup(props) {
    const route = useRoute();
    const toastMsg = ref("");
    const activeSec = ref("");
    let toastTimer: ReturnType<typeof setTimeout> | null = null;
    let fontLink: HTMLLinkElement | null = null;
    let observer: IntersectionObserver | null = null;
    let overrideStyle: HTMLStyleElement | null = null;

    const shot = computed(
      () => String(route.query.shot || "") === "1" || String(route.query.shot || "") === "hero"
    );
    const shotHero = computed(() => String(route.query.shot || "") === "hero");
    const preview = computed(() => props.mode === "preview");
    const meta = computed(() => getTemplate(props.templateId));
    const templateClass = computed(() => `t-${props.templateId}`);
    const pageClass = computed(() => ["page-shell", shot.value && "shot"].filter(Boolean));
    const heroStyle = computed(() => meta.value?.heroStyle || "card");
    const isDark = computed(() => {
      const bt = props.hubConfig.theme?.background_type;
      if (bt) return bt === "DARK";
      return Boolean(meta.value?.dark);
    });
    const scale = computed(() => props.hubConfig.theme?.scale || "M");

    // Public payload already filters disabled blocks and omits `enabled`.
    const enabledBlocks = computed(() =>
      [...(props.hubConfig.blocks || [])]
        .filter((b) => b.enabled !== false)
        .sort((a, b) => a.order - b.order)
    );
    const heroBlock = computed(
      () => enabledBlocks.value.find((b) => b.type === "HERO_COUNTDOWN") || null
    );
    const footerBlock = computed(
      () => enabledBlocks.value.find((b) => b.type === "FOOTER") || null
    );
    const bodyBlocks = computed(() =>
      enabledBlocks.value.filter(
        (b) => b.type !== "HERO_COUNTDOWN" && b.type !== "FOOTER" && sectionComponents[b.type]
      )
    );

    const navItems = computed(() => {
      const labels = navLabelsForTemplate(props.templateId);
      const byId = new Map(labels.map((n) => [n.id, n.label]));
      const typeFallback: Record<string, string> = {
        HERO_COUNTDOWN: "ראשי",
        STORY: "הסיפור",
        ABOUT: "אודות",
        QUOTE: "ציטוט",
        PEOPLE: "הזוג",
        EVENT_TIMELINE: "לו״ז",
        CARDS: "מידע",
        GALLERY: "גלריה",
        STEPS: "העלאה",
        MAP: "הגעה",
        WISHING_WELL: "ברכות",
        RSVP: "אישור",
        FAQ: "שאלות",
        TRIVIA_CTA: "טריוויה",
        GIFT: "מתנה",
        MILESTONES: "אבני דרך",
        PLAYLIST: "מוזיקה",
        SPEAKERS: "דוברים",
        SPONSORS: "שותפים",
        NETWORKING: "חיבור",
        HASHTAG: "אשטאג",
        LINEUP: "ליינאפ",
        BEEN_THERE: "הייתי שם",
        GROUNDS: "שטח",
        ZONES: "פינות",
        RULES: "כללים",
        SNAPSHARE_CTA: "העלאה",
        RICH_TEXT: "ברכה",
        SMART_NAVIGATION: "הגעה",
        LINK_LIST: "קישורים",
        MEDIA_STRIP: "אלבום",
      };
      return enabledBlocks.value
        .filter((b) => !NAV_SKIP.has(b.type) && (b.type === "HERO_COUNTDOWN" || sectionComponents[b.type]))
        .map(
          (b): SectionNavItem => ({
            id: b.id,
            label: byId.get(b.id) || typeFallback[b.type] || b.type,
            icon: NAV_ICONS[b.type] || NAV_ICONS.DEFAULT,
          })
        );
    });

    const themeStyleVars = computed(() => {
      const theme = props.hubConfig.theme || ({} as HubConfig["theme"]);
      const palette =
        meta.value?.palettes?.[theme.palette_id] || meta.value?.palettes?.default;
      const colors = theme.colors || {};
      const primary = colors.primary || theme.primary_color || palette?.primary;
      const secondary = colors.secondary || theme.secondary_color || palette?.secondary;
      const accent = colors.accent || secondary || primary;
      const background = colors.background || palette?.background;
      const text = colors.text || palette?.text;
      const font = theme.font_family || meta.value?.default_font || "Heebo";
      return {
        ...(primary ? { "--accent": primary } : {}),
        ...(secondary ? { "--accent-2": secondary } : {}),
        ...(accent ? { "--accent": primary || accent } : {}),
        ...(background ? { "--bg": background } : {}),
        ...(text ? { "--ink": text } : {}),
        "--font-display": `"${font}", serif`,
        "--font-body": `"${font === "Frank Ruhl Libre" ? "Heebo" : font}", sans-serif`,
      } as Record<string, string>;
    });

    function toast(msg: string) {
      toastMsg.value = msg;
      if (toastTimer) clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toastMsg.value = "";
      }, 2400);
    }

    function onUpload() {
      if (preview.value) {
        toast("בתצוגה מקדימה");
        return;
      }
      const url = props.eventMeta?.upload_url;
      if (url) window.location.assign(url);
    }

    function openAlbum() {
      if (preview.value) {
        toast("בתצוגה מקדימה");
        return;
      }
      const url = props.eventMeta?.album_url;
      if (url) window.location.assign(url);
    }

    function openTrivia(title?: string) {
      if (preview.value) {
        toast("בתצוגה מקדימה");
        return;
      }
      const url = props.eventMeta?.trivia_url;
      if (url) window.location.assign(url);
      else if (title) toast(`טריוויה: ${title}`);
    }

    const ctx: LandingContext = {
      mode: props.mode,
      preview: props.mode === "preview",
      templateId: props.templateId,
      resolvedImages: props.resolvedImages,
      eventMeta: props.eventMeta,
      toast,
      openUpload: onUpload,
      openAlbum,
      openTrivia,
      shot: shot.value,
    };
    provide(LANDING_CTX, ctx);

    watch(
      () => [props.mode, props.templateId, props.resolvedImages, props.eventMeta, shot.value],
      () => {
        ctx.mode = props.mode;
        ctx.preview = props.mode === "preview";
        ctx.templateId = props.templateId;
        ctx.resolvedImages = props.resolvedImages;
        ctx.eventMeta = props.eventMeta;
        ctx.shot = shot.value;
      }
    );

    /** Native smooth scroll; the section's scroll-margin-top clears the floating pill on desktop. */
    function scrollTo(id: string) {
      const el = document.getElementById(`sec-${id}`);
      if (!el) return;
      const reduce =
        typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const behavior = shot.value || reduce ? "auto" : "smooth";
      el.scrollIntoView({ behavior, block: "start" });
      activeSec.value = id;
      lockActive(id);
    }

    // While a click-scroll is in flight keep the clicked item lit, not whatever passes by.
    let activeLock = "";
    let lockTimer: ReturnType<typeof setTimeout> | null = null;
    function lockActive(id: string) {
      activeLock = id;
      if (lockTimer) clearTimeout(lockTimer);
      lockTimer = setTimeout(() => {
        activeLock = "";
        lockTimer = null;
        computeActive();
      }, 900);
    }

    /** IntersectionObserver never fires for the last short section at the very bottom. */
    function syncActiveAtEdges() {
      if (activeLock) return;
      const items = navItems.value;
      if (!items.length) return;
      const doc = document.documentElement;
      if (window.scrollY <= 2) {
        activeSec.value = items[0].id;
      } else if (window.innerHeight + window.scrollY >= doc.scrollHeight - 4) {
        activeSec.value = items[items.length - 1].id;
      }
    }

    function blockBinds(block: HubBlock, i: number) {
      return {
        data: block.data,
        sectionId: block.id,
        alt: i % 2 === 1,
      };
    }

    function ensureFonts() {
      const family = props.hubConfig.theme?.font_family || meta.value?.default_font || "Heebo";
      const href = googleFontsHref([family, "Heebo", "Outfit"]);
      fontLink = document.querySelector("link[data-landing-fonts]") as HTMLLinkElement | null;
      if (!fontLink) {
        fontLink = document.createElement("link");
        fontLink.rel = "stylesheet";
        fontLink.setAttribute("data-landing-fonts", "1");
        document.head.appendChild(fontLink);
      }
      fontLink.href = href;
    }

    /** Active = the last nav section whose top has passed a line 30% down the viewport. */
    const ACTIVE_LINE = 0.3;
    function computeActive() {
      if (activeLock) return;
      const items = navItems.value;
      if (!items.length) return;
      const line = window.innerHeight * ACTIVE_LINE;
      let current = items[0].id;
      for (const n of items) {
        const el = document.getElementById(`sec-${n.id}`);
        if (el && el.getBoundingClientRect().top <= line) current = n.id;
      }
      activeSec.value = current;
      syncActiveAtEdges();
    }

    function observeNav() {
      observer?.disconnect();
      const els = navItems.value
        .map((n) => document.getElementById(`sec-${n.id}`))
        .filter(Boolean) as HTMLElement[];
      if (!els.length) return;
      // A thin band at the 30% line: fires whenever a section edge crosses it. root=document keeps
      // the band on THIS page's viewport even inside the builder's preview iframe (the implicit
      // root would be the top-level window there).
      const opts = { rootMargin: "-30% 0px -69% 0px", threshold: 0 };
      try {
        observer = new IntersectionObserver(() => computeActive(), { ...opts, root: document });
      } catch {
        observer = new IntersectionObserver(() => computeActive(), opts);
      }
      els.forEach((el) => observer?.observe(el));
      computeActive();
    }

    let scrollRaf = 0;
    /** Scroll fallback (rAF-throttled) so the highlight never lags if an IO edge is missed. */
    function onPageScroll() {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0;
        computeActive();
      });
    }

    /**
     * Host-chosen palette / font. The template classes (.t-*) re-declare the same custom
     * properties on .page and the section nav, so root-level inline vars never win there.
     * Scoped rules with higher specificity do. Only explicit overrides are emitted, so
     * untouched templates render exactly as before.
     */
    function buildOverrideCss(): string {
      const theme = props.hubConfig.theme;
      const id = props.templateId;
      if (!theme || !id || id === "legacy") return "";
      const dark = isDark.value;
      const sel = `.landing-root .page.t-${id}, .landing-root .lsn.t-${id}`;
      let css = "";
      const a = theme.primary_color;
      const b = theme.secondary_color;
      if (a && b) {
        const strong = dark ? a : b;
        css +=
          `${sel}{--accent:${a};--accent-2:${a};--count-ink:${strong};--cta-bg:${strong};--cta-ink:#fff;` +
          `--nav-on-bg:${strong};--nav-on-ink:#fff;}`;
        if (!dark) {
          css += `.landing-root .page.t-${id} .enames,.landing-root .page.t-${id} .sec-title{color:${b};}`;
        }
      }
      if (!dark && a && b) {
        css += `.landing-root .lsn.t-${id}{--nav-on-bg:${b};--nav-on-ink:#fff;}`;
      }
      const font = theme.font_family;
      if (font && font !== meta.value?.default_font) {
        const f = `"${font}", serif`;
        const body = `"${font === "Frank Ruhl Libre" ? "Heebo" : font}", sans-serif`;
        css +=
          `${sel}{--font-display:${f};--font-body:${body};}` +
          `.landing-root .page.t-${id} .enames,.landing-root .page.t-${id} .sec-title,` +
          `.landing-root .page.t-${id} .welcome .body{font-family:${f} !important;}`;
      }
      return css;
    }

    function applyOverrideCss() {
      const css = buildOverrideCss();
      if (!css) {
        overrideStyle?.remove();
        overrideStyle = null;
        return;
      }
      if (!overrideStyle) {
        overrideStyle = document.createElement("style");
        overrideStyle.setAttribute("data-landing-overrides", "1");
        document.head.appendChild(overrideStyle);
      }
      overrideStyle.textContent = css;
    }

    function applyThemeVars() {
      const root = document.querySelector(".landing-root") as HTMLElement | null;
      if (!root) return;
      applyOverrideCss();
      const vars = themeStyleVars.value;
      Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
      const coverUrl = props.coverImage?.url;
      if (coverUrl) {
        root.style.setProperty("--hero-art", `url("${coverUrl}")`);
      }
    }

    function scrollToHash() {
      const hash = String(route.hash || window.location.hash || "").replace(/^#/, "");
      if (!hash) return;
      const id = hash.startsWith("sec-") ? hash.slice(4) : hash;
      scrollTo(id);
    }

    onMounted(async () => {
      ensureFonts();
      if (props.templateId && props.templateId !== "legacy") {
        await loadTemplateTheme(props.templateId);
      }
      document.body.classList.add("landing-active");
      if (isDark.value) document.body.classList.add("dark");
      await nextTick();
      applyThemeVars();
      observeNav();
      window.addEventListener("scroll", onPageScroll, { passive: true });
      // Deep link #<section-id> after sections paint
      requestAnimationFrame(() => scrollToHash());
    });

    watch(
      () => props.templateId,
      async (id) => {
        await loadTemplateTheme(id);
        ensureFonts();
        await nextTick();
        applyThemeVars();
        observeNav();
      }
    );

    watch(
      () => props.hubConfig,
      async () => {
        await nextTick();
        applyThemeVars();
        observeNav();
      },
      { deep: true }
    );

    watch(
      () => props.coverImage?.url,
      () => applyThemeVars()
    );

    onBeforeUnmount(() => {
      observer?.disconnect();
      overrideStyle?.remove();
      overrideStyle = null;
      window.removeEventListener("scroll", onPageScroll);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      if (lockTimer) clearTimeout(lockTimer);
      document.body.classList.remove("landing-active", "dark");
      if (toastTimer) clearTimeout(toastTimer);
    });

    return {
      sectionComponents,
      toastMsg,
      activeSec,
      shot,
      shotHero,
      preview,
      templateClass,
      pageClass,
      heroStyle,
      isDark,
      scale,
      heroBlock,
      footerBlock,
      bodyBlocks,
      navItems,
      onUpload,
      scrollTo,
      blockBinds,
    };
  },
});
</script>

<style>
body.landing-active {
  background: transparent;
}
.landing-root .about.right .about-copy,
.landing-root .about.right .body {
  text-align: right;
  margin-inline-start: auto;
}
.landing-root .about.right .wrap {
  display: flex;
  justify-content: flex-end;
}
/* Neutral theme for legacy hubs (no template_id) */
.landing-root .t-legacy {
  --accent: #3d6a80;
  --accent-2: #8aa0ac;
  --bg: #f4f1ec;
  --ink: #1a2830;
  --font-display: "Heebo", sans-serif;
  --font-body: "Heebo", sans-serif;
}
</style>
