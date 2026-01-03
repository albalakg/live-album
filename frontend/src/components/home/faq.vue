<template>
  <section
    class="home-page-section faq-section display--flex align--center"
    :style="`background-image: url('/assets/faq_background.svg')`"
    id="faq"
  >
    <MainCube left="5%" top="5%" width="large" height="large" />
    <MainCube left="8%" top="8%" width="medium" height="medium" />
    <MainCube
      color="pink"
      left="7%"
      top="12%"
      width="medium"
      height="x-large"
    />
    <MainCube left="45%" top="25%" width="large" height="large" />
    <MainCube left="48%" top="28%" width="medium" height="medium" />
    <MainCube
      color="pink"
      left="47%"
      top="32%"
      width="medium"
      height="x-large"
    />
    <MainCube left="67%" top="44%" width="large" height="large" />
    <MainCube left="65%" top="44%" width="large" height="small" />
    <MainCube
      color="pink"
      left="65%"
      top="46%"
      width="large"
      height="x-large"
    />
    <MainCube color="pink" left="75%" top="5%" width="medium" height="medium" />
    <MainCube
      color="pink"
      left="85%"
      top="55%"
      width="xx-large"
      height="large"
    />
    <MainCube left="82%" top="59%" width="xx-large" height="large" />
    <MainCube left="12%" top="79%" width="large" height="xx-large" />
    <MainCube
      color="pink"
      left="6%"
      top="77%"
      width="xxx-large"
      height="medium"
    />
    <div class="faq-section-content">
      <div class="width--full">
        <h2 class="text--white title--x-large">שאלות נפוצות</h2>
        <div
          class="display--flex justify--center margin--auto flex--wrap-mobile faq-cards"
          :class="$bp.isMobile ? 'width--full' : 'width--two-thirds'"
        >
          <div class="faq-list">
            <div
              class="faq-card"
              v-for="(item, idx) in items"
              :key="item.question"
              :class="{ open: openIndex === idx }"
            >
              <button class="faq-header" type="button" @click="toggle(idx)">
                <h4 class="title--medium">{{ item.question }}</h4>
                <span class="faq-chevron" aria-hidden="true"></span>
              </button>

              <div
                class="faq-body"
                :style="{
                  maxHeight: openIndex === idx ? item._maxHeight + 'px' : '0px',
                }"
                ref="bodies"
              >
                <p class="text--medium faq-answer">
                  {{ item.answer }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";

type FaqItem = {
  question: string;
  answer: string;
  _maxHeight: number; // internal
};

export default defineComponent({
  name: "FaqSection",

  data() {
    return {
      openIndex: -1,
      items: [
        {
          question: "איך האורחים מעלים תמונות וסרטונים?",
          answer:
            "האורחים סורקים QR או נכנסים לקישור, ובקליק מעלים תמונות/סרטונים ישר לאלבום החי — בלי להתקין אפליקציה.",
          _maxHeight: 0,
        },
        {
          question: "האם צריך להירשם כדי להשתמש?",
          answer:
            "בעלי האירוע נרשמים כדי ליצור אירוע, אבל האורחים נכנסים בקלות דרך קישור/QR בלי הרשמה.",
          _maxHeight: 0,
        },
        {
          question: "אפשר להוריד את כל התמונות בסוף האירוע?",
          answer:
            "כן. בסוף האירוע אפשר להוריד את כל המדיה בצורה מרוכזת, וגם לשמור אותה כזיכרון לשנים קדימה.",
          _maxHeight: 0,
        },
        {
          question: "האם האלבום מתעדכן בזמן אמת?",
          answer:
            "כן. כל העלאה מופיעה באלבום בזמן אמת כך שאפשר להקרין את הגלריה על מסך במהלך האירוע.",
          _maxHeight: 0,
        },
        {
          question: "האם ניתן להשתמש בכל סוג אירוע?",
          answer:
            "בטח — חתונות, אירוסין, בר/בת מצווה, אירועי חברה, מסיבות סיום, ברית/בריתה וכל חגיגה.",
          _maxHeight: 0,
        },
      ] as FaqItem[],
    };
  },

  mounted() {
    this.$nextTick(() => {
      this.measureAll();
      window.addEventListener("resize", this.measureAll, { passive: true });
    });
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.measureAll as any);
  },

  methods: {
    toggle(idx: number) {
      this.openIndex = this.openIndex === idx ? -1 : idx;

      // smooth scroll into view when opening (nice UX)
      this.$nextTick(() => {
        const el = this.$el.querySelectorAll(".faq-card")[idx] as
          | HTMLElement
          | undefined;
        if (el && this.openIndex === idx) {
          el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    },

    measureAll() {
      // bodies refs are an array because v-for
      const bodies = this.$refs.bodies as
        | HTMLElement[]
        | HTMLElement
        | undefined;
      const list = Array.isArray(bodies) ? bodies : bodies ? [bodies] : [];

      list.forEach((bodyEl, i) => {
        // temporarily remove maxHeight to measure real scrollHeight
        const prev = bodyEl.style.maxHeight;
        bodyEl.style.maxHeight = "none";
        const h = bodyEl.scrollHeight;
        bodyEl.style.maxHeight = prev;

        this.items[i]._maxHeight = h;
      });
    },
  },
});
</script>

<style lang="scss" scoped>
.home-page-section {
  min-height: calc(100vh - 99px);
  position: relative;
  // background-color: #79ae6088;
  // background-color: #79ae6044;
  // background-image: linear-gradient(18deg, rgba(206, 206, 206, 0.02) 0%, rgba(206, 206, 206, 0.02) 50%,rgba(21, 21, 21, 0.02) 50%, rgba(21, 21, 21, 0.02) 100%),linear-gradient(294deg, rgba(144, 144, 144, 0) 0%, rgba(144, 144, 144, 0) 50%,rgba(193, 193, 193, 0) 50%, rgba(193, 193, 193, 0) 100%),linear-gradient(212deg, rgba(43, 43, 43, 0.08) 0%, rgba(43, 43, 43, 0.08) 50%,rgba(193, 193, 193, 0.08) 50%, rgba(193, 193, 193, 0.08) 100%),linear-gradient(179deg, rgba(177, 177, 177, 0.04) 0%, rgba(177, 177, 177, 0.04) 50%,rgba(70, 70, 70, 0.04) 50%, rgba(70, 70, 70, 0.04) 100%),linear-gradient(22deg, rgba(149, 149, 149, 0.08) 0%, rgba(149, 149, 149, 0.08) 50%,rgba(123, 123, 123, 0.08) 50%, rgba(123, 123, 123, 0.08) 100%),linear-gradient(67deg, rgba(123, 123, 123, 0.01) 0%, rgba(123, 123, 123, 0.01) 50%,rgba(244, 244, 244, 0.01) 50%, rgba(244, 244, 244, 0.01) 100%),linear-gradient(90deg, rgb(246,133,137),rgb(121,174,96),rgb(163,209,141));
  background-size: cover;
  @media only screen and (max-width: 600px) {
    margin: 40px auto;
  }

  h2 {
    font-weight: 700;
  }
}

.faq-section-content {
  width: 100%;
  height: 75vh;
  padding: 30px 0;
  min-height: fit-content;
  margin: auto;
  position: relative;
  text-align: center;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;

  h2 {
    position: relative;
    margin-bottom: 30px;
  }
}

.faq-list {
  display: grid;
  gap: 14px;
  scroll-behavior: smooth; /* smooth for in-container scroll */

  @media only screen and (max-width: 600px) {
    width: 90%;
    margin: auto;
  }
}

/* Glassmorphism card */
.faq-card {
  border-radius: 16px;
  padding: 14px 16px;
  text-align: right;

  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(255, 255, 255, 0.28);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);

  transition: transform 220ms ease, box-shadow 220ms ease, background 220ms ease;
}

.faq-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.14);
}

.faq-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  text-align: right;
}

.divider {
  height: 1px;
  margin: 10px 0;
  background: rgba(0, 0, 0, 0.12);
}

/* Animated body */
.faq-body {
  overflow: hidden;
  max-height: 0px;
  transition: max-height 320ms ease;
}

.faq-answer {
  margin: 0;
  padding: 6px 0 2px;
  opacity: 0.92;
}

/* Chevron */
.faq-chevron {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: rgba(246, 133, 137, 0.16);
  border: 1px solid rgba(246, 133, 137, 0.25);
  position: relative;
  flex: 0 0 auto;

  transition: transform 240ms ease, background 240ms ease;
}

.faq-chevron::before {
  content: "";
  position: absolute;
  left: 9px;
  top: 8px;
  width: 8px;
  height: 8px;
  border-right: 2.4px solid rgba(0, 0, 0, 0.65);
  border-bottom: 2.4px solid rgba(0, 0, 0, 0.65);
  transform: rotate(45deg);
}

/* Open state */
.faq-card.open {
  background: rgba(255, 255, 255, 0.85);
  border-color: rgba(121, 174, 96, 0.35);
}

.faq-card.open .faq-chevron {
  transform: rotate(180deg);
  background: rgba(121, 174, 96, 0.16);
  border-color: rgba(121, 174, 96, 0.25);
}

/* Global smooth scroll (optional) */
:global(html) {
  scroll-behavior: smooth;
}
</style>
