<template>
  <div class="home">
    <!-- Header Section -->
    <section
      class="home-page-section header-section width--page-size margin--auto"
      id="header"
    >
      <h1 class="title--x-large text--center-mobile">
        ברוכים הבאים ל
        <strong class="text--pink">SnapShare</strong>
      </h1>
      <p>
        שתפו רגעים חיים באירוע שלכם!
        <br />
        האורחים מעלים את הרגעים שלהם בזמן אמת וכמובן אתכם
        <br />
        וכל מה שנשאר זה להנות מהחוויות והזכרונות
      </p>
      <!-- <div class="content-protection-callout" role="note">
        
        <span class="content-protection-callout__icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L4 6v6c0 5 3.4 9.7 8 11 4.6-1.3 8-6 8-11V6l-8-4z"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linejoin="round"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
        <p class="content-protection-callout__text">
          <strong class="text--pink">הגנה על תוכן התמונות</strong>
          — כל תמונה שמועלית נבדקת אוטומטית לתוכן לא הולם. סרטונים אינם נבדקים.
          ניתן גם להגביל העלאות לתמונות בלבד.
        </p>
      </div> -->
      <br />
      <div class="width--corner width--full-mobile">
        <router-link v-if="canUpgradeSubscription" to="/order?subscription=premium">
          <MainButton animation text="שדרג את המסלול שלך" />
        </router-link>
        <router-link v-else-if="!hasActiveEvent" to="/order">
          <MainButton animation text="הזמן את האלבום החי שלך" />
        </router-link>
          <MainButton v-else disabled animation text="הזמן את האלבום החי שלך" />
      </div>
      <!-- <div class="width--corner width--full-mobile">
        <MainButton disabled animation text="הזמן את האלבום החי שלך (בקרוב)" />
      </div> -->
      <img
        class="header-image-gallery"
        src="/assets/home-gallery.webp"
        alt="header-gallery-image"
      />
      <div
        class="social-media display--flex direction--column justify--space-between"
      >
        <div>
          <a
            href="https://www.facebook.com/share/1By1U5frDi/?mibextid=wwXIfr"
            target="_blank"
          >
            <img loading="lazy" src="/assets/icons/facebook-icon.webp" alt="facebook" />
          </a>
        </div>
        <div>
          <a
            href="https://www.instagram.com/snapshare_live?igsh=MXpudTBjMWhxeWw%3D&utm_source=qr"
            target="_blank"
          >
            <img loading="lazy" src="/assets/icons/instagram-icon.webp" alt="instagram" />
          </a>
        </div>
      </div>

      <div>
        <MainCube top="-22%" left="0" width="large" height="large" />
        <MainCube
          top="-15%"
          left="3.5%"
          color="pink"
          width="large"
          height="large"
        />
        <MainCube top="-28%" left="25%" width="large" height="large" />
        <MainCube top="45%" right="25%" width="xxx-large" height="large" />
        <MainCube
          top="50%"
          right="30%"
          color="pink"
          width="large"
          height="xx-large"
        />
        <MainCube
          top="52%"
          right="-5%"
          color="pink"
          width="large"
          height="large"
        />
        <MainCube top="58%" right="-8%" width="large" height="x-large" />
        <MainCube
          top="-7%"
          right="-12%"
          color="pink"
          width="large"
          height="x-large"
        />
        <MainCube top="-6%" right="0%" width="medium" height="medium" />
        <MainCube top="-4%" right="2%" width="small" height="small" />
      </div>
    </section>

    <Features />

    <HowItLooks />

    <Clients />

    <Pricing />

    <Faq />
  </div>
</template>

<script lang="ts">
import Features from "@/components/home/features.vue";
import HowItLooks from "@/components/home/howItLooks.vue";
import Clients from "@/components/home/clients.vue";
import Pricing from "@/components/home/pricing.vue";
import MainCube from "@/components/library/background/MainCube.vue";
import MainButton from "@/components/library/buttons/MainButton.vue";
import { StatusEnum, SubscriptionTypesEnum } from "@/helpers/enums";
import { defineComponent } from "vue";
import Faq from "@/components/home/faq.vue";

/** DOM order — must match section `id`s on the home page (desktop topbar links). */
const HOME_SECTION_IDS = [
  "header",
  "features",
  "how-it-looks",
  "who-is-it-for",
  "pricing",
  "faq",
] as const;

export default defineComponent({
  name: "HomeView",

  components: {
    MainButton,
    MainCube,
    Features,
    HowItLooks,
    Clients,
    Pricing,
    Faq,
  },

  data() {
    return {
      scrollRafId: null as number | null,
      boundScroll: null as (() => void) | null,
    };
  },

  mounted() {
    this.boundScroll = () => this.onWindowScroll();
    window.addEventListener("scroll", this.boundScroll, { passive: true });
    this.$nextTick(() => this.updateActiveSection());

    // Scroll to the section by the hash in the URL
    setTimeout(() => {
      const hash = this.$route.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "end" });
        }
        const id = hash.replace(/^#/, "");
        if ((HOME_SECTION_IDS as readonly string[]).includes(id)) {
          this.$store.commit("app/SET_HOME_SCROLL_SECTION", id);
        }
      }
      this.updateActiveSection();
    }, 100);
  },

  beforeUnmount() {
    if (this.boundScroll) {
      window.removeEventListener("scroll", this.boundScroll);
    }
    if (this.scrollRafId !== null) {
      cancelAnimationFrame(this.scrollRafId);
    }
    this.$store.commit("app/SET_HOME_SCROLL_SECTION", "");
  },

  watch: {
    "$route.hash"() {
      if (this.$route.path !== "/") {
        return;
      }
      const h = this.$route.hash;
      if (h.startsWith("#")) {
        const id = h.slice(1);
        if ((HOME_SECTION_IDS as readonly string[]).includes(id)) {
          this.$store.commit("app/SET_HOME_SCROLL_SECTION", id);
          return;
        }
      }
      this.updateActiveSection();
    },
  },

  computed: {
    hasActiveEvent(): boolean {
      return this.$store.getters["event/hasActiveEvent"];
    },

    eventStatus(): number {
      return this.$store.getters["event/getEventStatus"];
    },

    subscriptionName(): string {
      return this.$store.getters["user/getSubscriptionName"];
    },

    canUpgradeSubscription(): boolean {
      return (
        [StatusEnum.READY, StatusEnum.PENDING].includes(this.eventStatus) &&
        this.subscriptionName === SubscriptionTypesEnum.CLASSIC
      );
    },
  },

  methods: {
    onWindowScroll() {
      if (this.scrollRafId !== null) {
        return;
      }
      this.scrollRafId = window.requestAnimationFrame(() => {
        this.scrollRafId = null;
        this.updateActiveSection();
      });
    },

    updateActiveSection() {
      if (this.$route.path !== "/") {
        return;
      }
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const activationLine = scrollY + 120;
      let current: string = HOME_SECTION_IDS[0];
      for (const id of HOME_SECTION_IDS) {
        const el = document.getElementById(id);
        if (!el) {
          continue;
        }
        const top = el.getBoundingClientRect().top + scrollY;
        if (top <= activationLine) {
          current = id;
        }
      }
      const prev = this.$store.getters["app/getHomeScrollSection"] as string;
      if (prev !== current) {
        this.$store.commit("app/SET_HOME_SCROLL_SECTION", current);
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.home-page-section {
  min-height: calc(100vh - 99px);
  position: relative;

  h2 {
    font-weight: 700;
  }
}

.header-section {
  h1 {
    margin-top: 10%;
    font-weight: 700;
    letter-spacing: 3px;

    @media only screen and (min-width: 600px) {
      strong {
        margin-inline-start: 20px;
      }
    }
  }

  p {
    font-size: 1.3em;
    letter-spacing: 0.8px;
  }

  .content-protection-callout {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    max-width: 42rem;
    margin: 1.25rem 0 1.5rem;
    padding: 0.85rem 1.1rem;
    border: 2px solid var(--pink);
    border-radius: 999px;
    background-color: #f6858915;
    box-shadow: 0 2px 8px #0002;

    @media only screen and (max-width: 600px) {
      flex-direction: column;
      align-items: center;
      text-align: center;
      border-radius: 20px;
      margin-inline: auto;
    }
  }

  .content-protection-callout__icon {
    flex-shrink: 0;
    width: 1.75rem;
    height: 1.75rem;
    color: var(--pink);

    svg {
      width: 100%;
      height: 100%;
    }
  }

  .content-protection-callout__text {
    margin: 0;
    font-size: 1rem;
    line-height: 1.45;
    letter-spacing: 0.3px;
  }

  .header-image-gallery {
    width: 35%;
    position: absolute;
    left: 0;
    bottom: 25%;
    border-radius: 60px 120px 60px 120px;
    z-index: 2;

    @media only screen and (max-width: 600px) {
      width: 92%;
      bottom: -55px;
      right: 0;
      margin: auto;
    }
  }

  .social-media {
    position: absolute;
    height: 100px;
    right: -70px;
    top: 20%;

    img {
      width: 35px;
    }
  }

  .cube {
    position: absolute;
  }

  .cube-1 {
    left: 0;
    top: -180px;
  }

  .cube-2 {
    left: 50px;
    top: -130px;
  }
}
</style>
