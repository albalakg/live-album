<template>
  <section
    class="home-page-section pricing-section display--flex align--center"
    id="pricing"
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
    <div class="pricing-section-content">
      <div class="width--full">
        <h2 class="text--white title--x-large">המסלולים שלנו</h2>
        <div
          class="display--flex justify--space-between width--two-thirds margin--auto flex--wrap-mobile pricing-cards"
        >
          <div class="pricing-card">
            <div>
              <h3 class="title--large">{{ cards[0].title }}</h3>
              <div class="icon" v-html="cards[0].icon"></div>
            </div>
            <div class="pricing-card-footer">
              <div>
                <p class="text--white" v-html="cards[0].description"></p>
                <router-link to="/order?subscription=basic">
                  <MainButton color="pink" text="הצטרפו עכשיו" />
                </router-link>
              </div>
            </div>
          </div>
          <div class="pricing-card premium-card">
            <div class="premium-card-header">
              <h3 class="title--large">{{ cards[1].title }}</h3>
              <div class="icon" v-html="cards[1].icon"></div>
            </div>
            <div class="pricing-card-footer">
              <div>
                <p class="text--white" v-html="cards[1].description"></p>
                <div
                  v-if="cards[1].isPremium"
                  class="premium-card-footer-line"
                ></div>
                <router-link to="/order?subscription=premium">
                  <MainButton color="pink" text="הצטרפו עכשיו" />
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import MainCube from "@/components/library/background/MainCube.vue";
import { StatusEnum, SubscriptionTypesEnum } from "@/helpers/enums";
import { defineComponent } from "vue";
import MainButton from "../library/buttons/MainButton.vue";

export default defineComponent({
  name: "PricingSection",

  components: {
    MainCube,
    MainButton,
  },

  data() {
    return {
      cards: [
        {
          title: "מסלול בסיסי",
          isPremium: false,
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect x="12" y="16" width="40" height="32" rx="7"
        stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M12 24h40"
        stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M22 38l6 6 14-14"
        stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M54 28h-2.5c-1.4 0-2.5 1.1-2.5 2.5v3c0 1.4 1.1 2.5 2.5 2.5H54"
        stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
          `,
          description: `המסלול הבסיסי מוגבל עד 1000 קבצים.
          <br>
          הקבצים נמחקים לאחר 6 חודשים מתחילת האירוע.`,
        },
        {
          title: "מסלול פרמיום",
          isPremium: true,
          icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <path d="M14 26l10 8 8-14 8 14 10-8 2 22H12l2-22z"
        stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18 48h28"
        stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
  <circle cx="24" cy="34" r="2.2" stroke="currentColor" stroke-width="2.2"/>
  <circle cx="32" cy="30" r="2.2" stroke="currentColor" stroke-width="2.2"/>
  <circle cx="40" cy="34" r="2.2" stroke="currentColor" stroke-width="2.2"/>
  <path d="M10 18h4M12 16v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M50 16h4M52 14v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
</svg>
          `,
          description: `המסלול הבסיסי מוגבל עד 5000 קבצים.
          <br>
          הקבצים נמחקים לאחר 12 חודשים מתחילת האירוע.`,
        },
      ],
    };
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
        this.subscriptionName === SubscriptionTypesEnum.BASIC
      );
    },

    event(): boolean {
      return this.$store.getters["event/getEvent"];
    },
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

.pricing-section-content {
  width: 100%;
  height: 75vh;
  background-color: #79ae6088;
  margin: auto;
  position: relative;
  // border-radius: 50px 350px;
  text-align: center;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;

  h2 {
    position: relative;
    margin-bottom: 20px;
  }
}

.pricing-cards {
  gap: 30px;
  width: 650px;
  max-width: 50%;
}

.pricing-card {
  border-radius: 2px;
  //   border: 1px solid #0008;
  background-color: #fff8;
  box-shadow: 0 3px 5px #0005;
  backdrop-filter: blur(20px);
  height: 360px;
  width: 300px;
  text-align: center;
  min-height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;

  .pricing-card-footer {
    background-color: #222;
    padding: 5%;
    height: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pricing-card-footer > div {
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
    gap: 15px;
  }

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
    margin: 5%;
    color: #383838;
  }
}

.premium-card {
  // background-color: #f0e68c;
  // box-shadow: inset 0 -5px 15px 2px #ffd70055;

  .premium-card-header {
    background: linear-gradient(#fff, #f0e68caa, #ffd700aa);
  }

  .premium-card-footer-line {
    width: 50%;
    height: 2px;
    background: linear-gradient(to right, #ffd700, #ff8c00);
    box-shadow: 0 0 8px #ffd70066;
    margin: 30px auto 0 auto;
    border-radius: 2px;
  }
}

@media only screen and (max-width: 600px) {
  .pricing-section-content {
    border-radius: 50px;
    min-height: fit-content;
    padding-bottom: 15px;
    width: 90%;

    .pricing-cards {
      flex-wrap: wrap;
      margin-top: 30%;

      .pricing-card {
        width: 80%;
        margin-top: 20px;
      }
    }
  }

  .pricing-card {
    margin: 10px 0;
  }
}
</style>
