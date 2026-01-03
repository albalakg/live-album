<template>
  <section
    class="home-page-section who-is-it-for-section"
    id="who-is-it-for"
    :style="`background-image: url('/assets/clients_arrows.png')`"
  >
    <MainCube left="10%" top="10%" width="xxxx-large" height="large" />
    <MainCube
      v-if="$bp.isMediumAndUp"
      color="pink"
      left="29%"
      top="4%"
      width="large"
      height="large"
    />
    <MainCube left="25%" bottom="10%" width="large" height="large" />
    <MainCube left="55%" bottom="10%" width="xxxx-large" height="large" />
    <MainCube
      color="pink"
      left="75%"
      bottom="7%"
      width="large"
      height="xx-large"
    />
    <div
      class="who-is-it-for-content text--center display--flex justify--center align--center"
    >
      <div class="width--full">
        <h2 class="text--white title--x-large">למי זה מתאים</h2>
        <div
          class="who-is-it-for-boxes-wrapper justify--center display--flex flex--wrap"
        >
          <div
            v-for="card in cards"
            :key="card.title"
            class="who-is-it-for-box"
          >
            <div v-html="card.icon" class="icon margin--auto"></div>
            <h3 class="">{{ card.title }}</h3>
          </div>
        </div>
        <div class="width--corner width--two-thirds-mobile margin--auto">
          <router-link v-if="!hasActiveEvent" :to="user ? '/order' : '/signup'">
            <MainButton
              animation
              color="pink"
              text="הצטרפו עכשיו"
              size="small"
            />
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { IUserInfo } from "@/helpers/interfaces";
import { defineComponent } from "vue";

export default defineComponent({
  name: "ClientsSection",

  data() {
    return {
      cards: [
        {
          title: "חתונות ואירוסין",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <circle cx="26" cy="38" r="11" stroke="#1A1A1A" stroke-width="2.6"/>
  <circle cx="38" cy="38" r="11" stroke="#1A1A1A" stroke-width="2.6"/>
  <path d="M32 18c2-2.2 5.2-2.2 7.2 0 2 2.1 2 5.4 0 7.5L32 33l-7.2-7.5c-2-2.1-2-5.4 0-7.5 2-2.2 5.2-2.2 7.2 0z"
        stroke="#1A1A1A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
          `,
          description:
            "האלבום יציג את רצף התמונות והסרטונים בסדר אקראי, ומומלץ להקרין על מסך גדול במהלך האירוע. כמובן בסוף האירוע כל הקבצים ניתנים להורדה",
        },
        {
          title: "בר/בת מצווה",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <path d="M32 10l4.5 8 9 1.2-6.6 6.1 1.8 8.8L32 29.9 23.3 34.1l1.8-8.8-6.6-6.1 9-1.2L32 10z"
        stroke="#1A1A1A" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M22 40c6 5 14 5 20 0"
        stroke="#1A1A1A" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M24 52l8-6 8 6"
        stroke="#1A1A1A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
          `,
          description:
            "גלריית תמונות ייחודית לכל אירוע, המאפשרת לאורחים לצפות ולהוריד את התמונות מהאירוע.",
        },
        {
          title: "אירועי חברה",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <path d="M18 52V18.5C18 16 20 14 22.5 14H41.5C44 14 46 16 46 18.5V52"
        stroke="#1A1A1A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="24" y="20" width="6" height="6" rx="1.6" stroke="#1A1A1A" stroke-width="2.2"/>
  <rect x="34" y="20" width="6" height="6" rx="1.6" stroke="#1A1A1A" stroke-width="2.2"/>
  <rect x="24" y="30" width="6" height="6" rx="1.6" stroke="#1A1A1A" stroke-width="2.2"/>
  <rect x="34" y="30" width="6" height="6" rx="1.6" stroke="#1A1A1A" stroke-width="2.2"/>
  <circle cx="24" cy="48" r="3" stroke="#1A1A1A" stroke-width="2.2"/>
  <circle cx="40" cy="48" r="3" stroke="#1A1A1A" stroke-width="2.2"/>
  <path d="M18 56c1-3 3.2-4.8 6-4.8S29 53 30 56"
        stroke="#1A1A1A" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M34 56c1-3 3.2-4.8 6-4.8S45 53 46 56"
        stroke="#1A1A1A" stroke-width="2.2" stroke-linecap="round"/>
</svg>
          `,
          description:
            "כל אירוע מקבל קישור ייחודי לעמוד שיתוף שיהיה ניתן לגשת אליו עם QR שניצור עבורכם שמגיע עם כרטיס מעוצב.",
        },
        {
          title: "מסיבות סיום",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <path d="M12 26l20-10 20 10-20 10-20-10z"
        stroke="#1A1A1A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M20 30v9c0 3 5.2 5.5 12 5.5S44 42 44 39v-9"
        stroke="#1A1A1A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M52 26v12c0 2-2 4-4 4"
        stroke="#1A1A1A" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="46.8" cy="42" r="2.2" stroke="#1A1A1A" stroke-width="2.2"/>
</svg>
          `,
          description:
            "האלבום יציג את רצף התמונות והסרטונים בסדר אקראי, ומומלץ להקרין על מסך גדול במהלך האירוע. כמובן בסוף האירוע כל הקבצים ניתנים להורדה",
        },
        {
          title: "ברית / בריתה",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="22" r="8.5" stroke="#1A1A1A" stroke-width="2.6"/>
  <path d="M18 50c0-8 7-14 14-14s14 6 14 14"
        stroke="#1A1A1A" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M26 42l6 6 6-6"
        stroke="#1A1A1A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
          `,
          description:
            "גלריית תמונות ייחודית לכל אירוע, המאפשרת לאורחים לצפות ולהוריד את התמונות מהאירוע.",
        },
        {
          title: "כל חגיגה",
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <path d="M32 12c-8 0-14 6.4-14 14.2C18 34 24 39.2 32 39.2S46 34 46 26.2C46 18.4 40 12 32 12z"
        stroke="#1A1A1A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M30 39.2l2 3 2-3"
        stroke="#1A1A1A" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M32 42.2c-2 4 2 7-1 10"
        stroke="#1A1A1A" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M14 22l3 3M50 22l-3 3M12 34h4M48 36h4"
        stroke="#1A1A1A" stroke-width="2.2" stroke-linecap="round"/>
</svg>
          `,
          description:
            "כל אירוע מקבל קישור ייחודי לעמוד שיתוף שיהיה ניתן לגשת אליו עם QR שניצור עבורכם שמגיע עם כרטיס מעוצב.",
        },
      ],
    };
  },

  computed: {
    user(): IUserInfo | null {
      return this.$store.getters["user/getUser"];
    },

    hasActiveEvent(): boolean {
      return this.$store.getters["event/hasActiveEvent"];
    },
  },
});
</script>

<style lang="scss" scoped>
.home-page-section {
  min-height: calc(100vh - 99px);
  position: relative;
  background-color: #79ae6044;

  @media only screen and (max-width: 600px) {
    margin: 40px auto;
  }

  h2 {
    font-weight: 700;
  }
}

.who-is-it-for-section {
  background-repeat: no-repeat;
  background-position: center;
  background-size: 100% 100%;
}

.who-is-it-for-content {
  min-height: 85vh;
  width: calc(100% - 20px);
  position: relative;
  padding: 20px 10px;

  .who-is-it-for-boxes-wrapper {
    margin-bottom: 20px;
    display: grid !important; /* override display--flex */
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 2px;
    justify-items: center; /* מרכז כל כרטיס */
    align-items: stretch;
    width: 800px;
    max-width: 90%;
    margin: auto;

    .who-is-it-for-box {
      width: 75%;
      background-color: #ffffff77;
      backdrop-filter: blur(20px);
      margin: 20px;
      padding: 10px 15px;
      border-radius: 12px;
      box-shadow: 0 4px 3px #2226;
      min-height: 83px;
      position: relative;

      .icon {
        width: 35%;
        height: 35%;
        margin: auto;

        svg {
          width: 100%;
          height: 100%;
        }
      }

      h3 {
        font-weight: 700;
        position: relative;
        top: 30px;
      }
    }

    @media only screen and (max-width: 600px) {
      .who-is-it-for-box {
        width: 75%;
        padding: 15px;
        margin: 5px;
      }
    }
  }

  h2 {
    padding-top: 3%;
    margin-bottom: 2%;
    text-shadow: 0 2px 4px #000;
  }

  p {
    margin-bottom: 2%;
  }
}
</style>
