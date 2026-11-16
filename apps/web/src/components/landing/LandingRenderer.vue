<template>
  <div
    class="landing-root"
    :class="[pageClass, shotHero && 'shot-hero']"
    :data-scale="scale"
    dir="rtl"
  >
    <a class="skip" href="#sec-hero">דילוג לתוכן</a>

    <header class="site-nav" :class="templateClass" id="site-nav">
      <a class="nav-brand" href="#sec-hero" @click.prevent="scrollTo('hero')">
        <span class="nav-event">{{ eventTitle }}</span>
      </a>
      <nav class="nav-links" aria-label="ניווט בעמוד">
        <a
          v-for="(n, i) in navItems"
          :key="n.id"
          :href="'#sec-' + n.id"
          :class="{ on: activeSec === n.id || (!activeSec && i === 0) }"
          @click.prevent="scrollTo(n.id)"
        >{{ n.label }}</a>
      </nav>
      <div class="nav-end">
        <button
          v-if="canUpload"
          type="button"
          class="btn btn-primary nav-cta"
          @click="onUpload"
        >העלו תמונות</button>
        <button
          type="button"
          class="nav-burger"
          :aria-expanded="drawerOpen ? 'true' : 'false'"
          aria-controls="landing-drawer"
          aria-label="פתחו את התפריט"
          @click="drawerOpen = !drawerOpen"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>

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

    <div
      class="drawer-back"
      :class="{ on: drawerOpen }"
      :hidden="!drawerOpen"
      @click="drawerOpen = false"
    />
    <aside
      id="landing-drawer"
      class="drawer"
      :class="{ on: drawerOpen }"
      role="dialog"
      aria-modal="true"
      aria-label="תפריט"
    >
      <div class="drawer-top">
        <strong>{{ eventTitle }}</strong>
        <button type="button" class="drawer-x" aria-label="סגירת התפריט" @click="drawerOpen = false">×</button>
      </div>
      <nav class="drawer-links">
        <a
          v-for="n in navItems"
          :key="'d-' + n.id"
          :href="'#sec-' + n.id"
          @click.prevent="scrollTo(n.id); drawerOpen = false"
        >{{ n.label }}</a>
      </nav>
      <button
        v-if="canUpload"
        type="button"
        class="btn btn-primary"
        @click="onUpload(); drawerOpen = false"
      >העלו תמונות</button>
    </aside>

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
import { sectionComponents } from "./sections/sectionMap";
import {
  getTemplate,
  googleFontsHref,
  loadTemplateTheme,
  navLabelsForTemplate,
} from "./templates/registry";
import type { EventMeta, HubBlock, HubConfig, LandingMode, ResolvedImage } from "./types";

export default defineComponent({
  name: "LandingRenderer",
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
    const drawerOpen = ref(false);
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
    const canUpload = computed(
      () => preview.value || Boolean(props.eventMeta?.upload_url)
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

    const eventTitle = computed(() => {
      const t = heroBlock.value?.data?.title;
      return String(t || props.eventMeta?.event_name || meta.value?.name_he || "אירוע");
    });

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
        .filter((b) => b.type !== "FOOTER")
        .map((b) => ({
          id: b.id,
          label: byId.get(b.id) || typeFallback[b.type] || b.type,
        }));
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

    function scrollTo(id: string) {
      const el = document.getElementById(`sec-${id}`);
      if (!el) return;
      const behavior = shot.value ? "auto" : "smooth";
      el.scrollIntoView({ behavior, block: "start" });
      activeSec.value = id;
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

    function observeNav() {
      observer?.disconnect();
      const els = navItems.value
        .map((n) => document.getElementById(`sec-${n.id}`))
        .filter(Boolean) as HTMLElement[];
      if (!els.length) return;
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
          if (visible?.target?.id) {
            activeSec.value = visible.target.id.replace(/^sec-/, "");
          }
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: [0.1, 0.4] }
      );
      els.forEach((el) => observer?.observe(el));
    }

    /**
     * Host-chosen palette / font. The template classes (.t-*) re-declare the same custom
     * properties on .page and .site-nav, so root-level inline vars never win there.
     * Scoped rules with higher specificity do. Only explicit overrides are emitted, so
     * untouched templates render exactly as before.
     */
    function buildOverrideCss(): string {
      const theme = props.hubConfig.theme;
      const id = props.templateId;
      if (!theme || !id || id === "legacy") return "";
      const dark = isDark.value;
      const sel = `.landing-root .page.t-${id}, .landing-root .site-nav.t-${id}`;
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
      // Dark heroes: transparent sticky nav so it sits over the cover without a beige band
      if (dark) {
        css +=
          `.landing-root .site-nav.t-${id}{--nav-bg:transparent;background:transparent;border-bottom-color:rgba(255,255,255,.12);color:#F7F1E8;}` +
          `.landing-root .site-nav.t-${id} .nav-event,.landing-root .site-nav.t-${id} .nav-links a{color:rgba(247,241,232,.92);}` +
          `.landing-root .site-nav.t-${id} .nav-burger span{background:#F7F1E8;}`;
      } else if (a && b) {
        css +=
          `.landing-root .site-nav.t-${id}{--nav-bg:rgba(247,241,232,.92);}` +
          `.landing-root .site-nav.t-${id} .nav-links a.on{background:${b};color:#fff;}`;
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
      if (drawerOpen.value) document.body.classList.add("drawer-open");
      // Deep link #<section-id> after sections paint
      requestAnimationFrame(() => scrollToHash());
    });

    watch(drawerOpen, (v) => {
      document.body.classList.toggle("drawer-open", v);
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
      document.body.classList.remove("landing-active", "dark", "drawer-open");
      if (toastTimer) clearTimeout(toastTimer);
    });

    return {
      sectionComponents,
      drawerOpen,
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
      eventTitle,
      navItems,
      canUpload,
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
body.landing-active.drawer-open {
  overflow: hidden;
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
