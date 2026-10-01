<template>
  <article v-if="page" class="landing width--page-size margin--auto">
    <nav class="landing-breadcrumb" aria-label="פירורי לחם">
      <router-link to="/">דף הבית</router-link>
      <span aria-hidden="true">‹</span>
      <span>{{ page.breadcrumbLabel }}</span>
    </nav>

    <h1 class="title--large text--dark">{{ page.h1 }}</h1>

    <router-link class="landing-cta" :to="page.ctaTarget">
      <MainButton animation :text="ctaText" />
    </router-link>

    <section
      v-for="(section, index) in visibleSections"
      :key="index"
      class="landing-section"
    >
      <h2 v-if="section.level === 2 && section.heading" class="title--medium text--dark">
        {{ section.heading }}
      </h2>
      <h3 v-else-if="section.level === 3 && section.heading" class="landing-h3 text--dark">
        {{ section.heading }}
      </h3>
      <p v-for="(paragraph, pIndex) in section.paragraphs" :key="'p' + pIndex">
        <InlineRichText :text="paragraph" />
      </p>
      <ul v-if="section.bullets && section.bullets.length">
        <li v-for="(bullet, bIndex) in section.bullets" :key="'b' + bIndex">
          <InlineRichText :text="bullet" />
        </li>
      </ul>
    </section>

    <section v-if="extraLinks.length" class="landing-section" aria-label="עוד באתר">
      <h2 class="title--medium text--dark">עוד באתר</h2>
      <ul>
        <li v-for="link in extraLinks" :key="link.slug">
          <router-link :to="link.slug">{{ link.anchor }}</router-link>
        </li>
      </ul>
    </section>

    <section class="landing-faq" aria-labelledby="landing-faq-heading">
      <h2 id="landing-faq-heading" class="title--medium text--dark">שאלות נפוצות</h2>
      <div v-for="item in faqItems" :key="item.q" class="landing-faq-item">
        <h3>{{ item.q }}</h3>
        <p>{{ item.a }}</p>
      </div>
    </section>
  </article>
</template>

<script lang="ts">
import InlineRichText from "@/components/landing/InlineRichText.vue";
import MainButton from "@/components/library/buttons/MainButton.vue";
import {
  ctaLabel,
  findLandingPage,
  supplementalLinks,
  visibleCopy,
  visibleFaq,
  type LandingFaq,
  type LandingLink,
  type LandingPage,
  type LandingSection,
} from "@/content/landingPages";
import { defineComponent } from "vue";

export default defineComponent({
  name: "LandingPageView",

  components: {
    InlineRichText,
    MainButton,
  },

  computed: {
    page(): LandingPage | undefined {
      return findLandingPage(this.$route.path);
    },

    ctaText(): string {
      return this.page ? ctaLabel(this.page) : "";
    },

    visibleSections(): LandingSection[] {
      if (!this.page) return [];
      return this.page.sections
        .map((section) => ({
          level: section.level,
          heading: section.heading,
          paragraphs: (section.paragraphs || [])
            .map((paragraph) => visibleCopy(paragraph))
            .filter((paragraph): paragraph is string => Boolean(paragraph)),
          bullets: (section.bullets || [])
            .map((bullet) => visibleCopy(bullet))
            .filter((bullet): bullet is string => Boolean(bullet)),
        }))
        .filter(
          (section) =>
            section.heading ||
            section.paragraphs.length > 0 ||
            section.bullets.length > 0
        );
    },

    extraLinks(): LandingLink[] {
      return this.page ? supplementalLinks(this.page) : [];
    },

    faqItems(): LandingFaq[] {
      return this.page ? visibleFaq(this.page) : [];
    },
  },
});
</script>

<style lang="scss" scoped>
.landing {
  padding: 24px 0 72px;
  max-width: 820px;

  h1 {
    margin: 12px 0 20px;
    line-height: 1.35;
    font-size: 2.2rem;

    @media only screen and (max-width: 600px) {
      font-size: 1.7rem;
    }
  }

  p {
    font-size: 1.12rem;
    line-height: 1.75;
    margin: 0 0 14px;
  }

  a {
    color: #3d6b32;
    font-weight: 600;
    text-decoration: underline;
  }
}

.landing-breadcrumb {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.landing-cta {
  display: inline-block;
  text-decoration: none !important;
  margin-bottom: 28px;
}

.landing-section {
  margin-bottom: 8px;

  h2 {
    margin: 28px 0 12px;
  }
}

.landing-h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 18px 0 8px;
}

ul {
  margin: 0 0 16px;
  padding: 0 1.2rem 0 0;
  list-style: disc;

  li {
    font-size: 1.12rem;
    line-height: 1.7;
    margin-bottom: 8px;
  }
}

.landing-faq {
  margin-top: 36px;
  padding-top: 12px;
}

.landing-faq-item {
  background: #fff;
  border: 1px solid rgba(246, 133, 137, 0.45);
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 12px;

  h3 {
    font-size: 1.15rem;
    margin-bottom: 8px;
  }

  p {
    margin: 0;
  }
}
</style>
