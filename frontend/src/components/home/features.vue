<template>
  <section
    class="home-page-section what-you-get-section"
    :style="`background-image: url('/assets/features_bg.png')`"
    id="features"
  >
    <template v-if="$bp.isMediumAndUp">
      <MainLine
        :opacity="'0.7'"
        top="0"
        left="25%"
        color="white"
        width="x-large"
      />
      <MainLine
        :opacity="'0.7'"
        top="0"
        left="calc(25% + 45px)"
        color="white"
        width="small"
      />
      <MainLine
        :opacity="'0.7'"
        top="0"
        left="calc(25% + 56px)"
        color="white"
        width="medium"
      />
      <MainLine
        :opacity="'0.7'"
        top="0"
        left="calc(25% + 71px)"
        color="white"
        width="xxx-large"
      />
      <MainLine
        :opacity="'0.7'"
        top="0"
        left="calc(25% + 166px)"
        color="white"
        width="medium"
      />
      <MainLine
        :opacity="'0.7'"
        top="0"
        left="calc(25% + 181px)"
        color="white"
        width="small"
      />
      <MainLine
        :opacity="'0.7'"
        top="0"
        left="calc(25% + 192px)"
        color="white"
        width="x-large"
      />
    </template>
    <div class="home-page-content width--page-size margin--auto height--full">
      <h2 class="text--dark title--x-large text--center-mobile">
        החבילת מוצרים שתקבלו
      </h2>

      <div
        class="display--flex justify--space-between height--full width--two-thirds margin--auto flex--wrap-mobile"
      >
        <div
          v-for="card in cards"
          :key="card.title"
          class="what-you-get-card"
        >
          <h3 class="title--large">{{ card.title }}</h3>
          <div class="what-you-get-card-footer">
            <div class="icon" v-html="card.icon">
            </div>
            <p class="text--white">
              {{ card.description }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import MainLine from "@/components/library/background/MainLine.vue";
import { defineComponent } from "vue";

export default defineComponent({
  name: "FeaturesSection",

  components: {
    MainLine,
  },

  data() {
    return {
      cards: [
        {
          title: "אלבום דיגיטלי חי בזמן האירוע",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
            <rect x="14" y="14" width="36" height="36" rx="6"
                  stroke="#1a1a1a" stroke-width="2.8"/>
            <path d="M14 22H50"
                  stroke="#1a1a1a" stroke-width="2.4"/>
            <path d="M18 36H24L28 30L32 40L36 34H42"
                  stroke="#1a1a1a" stroke-width="2.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"/>
          </svg>
          `,
          description:
            "האלבום יציג את רצף התמונות והסרטונים בסדר אקראי, ומומלץ להקרין על מסך גדול במהלך האירוע. כמובן בסוף האירוע כל הקבצים ניתנים להורדה",
        },
        {
          title: "גלריית תמונות לשיתוף",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
            <rect x="12" y="18" width="18" height="18" rx="3"
                  stroke="#1a1a1a" stroke-width="2.6"/>
            <rect x="28" y="26" width="24" height="24" rx="4"
                  stroke="#1a1a1a" stroke-width="2.6"/>
            <path d="M34 22L44 12"
                  stroke="#1a1a1a" stroke-width="2.6"
                  stroke-linecap="round"/>
            <path d="M38 12H44V18"
                  stroke="#1a1a1a" stroke-width="2.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"/>
          </svg>
          `,
          description:
            "גלריית תמונות ייחודית לכל אירוע, המאפשרת לאורחים לצפות ולהוריד את התמונות מהאירוע.",
        },
        {
          title: "כרטיס הזמנה דיגיטלי עם קוד QR",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
            <rect x="20" y="10" width="24" height="44" rx="6"
                  stroke="#1a1a1a" stroke-width="2.8"/>
            <rect x="26" y="16" width="12" height="12" rx="2"
                  stroke="#1a1a1a" stroke-width="2.4"/>
            <rect x="26" y="32" width="12" height="12" rx="2"
                  stroke="#1a1a1a" stroke-width="2.4"/>
            <circle cx="32" cy="50" r="2"
                  stroke="#1a1a1a" stroke-width="2.4"/>
          </svg>
          `,
          description:
            "כל אירוע מקבל קישור ייחודי לעמוד שיתוף שיהיה ניתן לגשת אליו עם QR שניצור עבורכם שמגיע עם כרטיס מעוצב.",
        },
      ],
    };
  },
});
</script>

<style lang="scss" scoped>
.home-page-section {
  min-height: calc(100vh - 99px);
  position: relative;

  @media only screen and (max-width: 600px) {
    margin: 40px auto;
  }

  h2 {
    font-weight: 700;
  }
}

.what-you-get-section {
  height: fit-content;
  min-height: calc(94vh - 99px);
  background-size: cover;

  @media only screen and (max-width: 600px) {
    padding: 10px 0;

    .what-you-get-card {
      margin: 10px 0;
    }
  }

  .home-page-content {
    z-index: 10;
    position: relative;

    @media only screen and (max-width: 1600px) {
      width: 100%;
    }

    h2 {
      margin-bottom: 5%;
    }

    p {
      font-weight: 500;
    }

    .what-you-get-card {
      border-radius: 25px;
      //   border: 1px solid #0008;
      background-color: #fff8;
      box-shadow: 0 2px 6px #0005;
      backdrop-filter: blur(20px);
      height: 250px;
      width: 300px;
      text-align: center;
      min-height: 350px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;

      .what-you-get-card-footer {
        background-color: #f68589cc;
        padding: 0 5%;
        border-radius: 0 0 23px 23px;
        height: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .icon {
        width: 35%;
        height: 35%;
        position: absolute;
        inset: 0;
        margin: auto;

        svg {
          width: 100%;
          height: 100%;
        }
      }

      h3 {
        margin: 5%;
        color: #383838;
      }
    }
  }
}
</style>
