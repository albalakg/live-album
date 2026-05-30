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
        <h2 class="title--x-large">המסלולים שלנו</h2>
        <div
          class="display--flex justify--space-between width--two-thirds margin--auto flex--wrap-mobile pricing-cards"
        >
          <div
            v-for="card in displayCards"
            :key="card.slug"
            class="pricing-card"
            :class="card.cardClass"
          >
            <div class="pricing-card-header">
              <h3 class="title--large">{{ card.title }}</h3>
              <div class="icon" v-html="card.icon"></div>
            </div>
            <div class="pricing-card-footer">
              <div>
                <p class="text--white" v-html="card.description"></p>
                <div class="pricing-price-block">
                  <span
                    v-if="card.showStrikePrice"
                    class="pricing-launch-sale-tag"
                  >
                    {{ launchSaleLabel }}
                  </span>
                  <div
                    v-if="card.showStrikePrice"
                    class="pricing-price-row"
                  >
                    <p class="pricing-price-original text--white">
                      {{ card.strikePrice }} ₪
                    </p>
                    <h4 class="text--white title--large pricing-price-sale">
                      {{ card.displayPrice }} ₪
                    </h4>
                  </div>
                  <h4
                    v-else
                    class="text--white title--large pricing-price-sale"
                  >
                    {{ card.displayPrice }} ₪
                  </h4>
                  <template v-if="card.slug === 'premium'">
                    <router-link
                      v-if="canUpgradeSubscription"
                      :to="`/order?subscription=${card.slug}`"
                    >
                      <MainButton animation text="שדרגו עכשיו" size="x-small" />
                    </router-link>
                    <router-link
                      v-else-if="!hasActiveEvent"
                      :to="`/order?subscription=${card.slug}`"
                    >
                      <MainButton animation text="רכוש תוכנית" size="x-small" />
                    </router-link>
                    <MainButton
                      v-else
                      disabled
                      animation
                      text="כבר במסלול פרמיום"
                      size="x-small"
                    />
                  </template>
                  <template v-else>
                    <router-link
                      v-if="!hasActiveEvent"
                      :to="`/order?subscription=${card.slug}`"
                    >
                      <MainButton
                        animation
                        :text="
                          card.slug === 'demo' ? 'הצטרפו עכשיו' : 'רכוש תוכנית'
                        "
                        size="x-small"
                      />
                    </router-link>
                    <MainButton
                      v-else
                      disabled
                      animation
                      text="כבר יש לכם אירוע"
                      size="x-small"
                    />
                  </template>
                </div>
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
import { ISubscriptionPlan } from "@/helpers/interfaces";
import {
  SUBSCRIPTION_LAUNCH_SALE_LABEL,
  showSubscriptionStrikePrice,
  subscriptionPlanDescription,
  subscriptionStrikePrice,
} from "@/helpers/subscriptionPricing";
import { defineComponent } from "vue";
import MainButton from "../library/buttons/MainButton.vue";

const SLUG_ORDER = ["demo", "classic", "premium"] as const;

const ICON_BY_SLUG: Record<string, string> = {
  demo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect x="12" y="16" width="40" height="32" rx="7"
        stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M12 24h40"
        stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M22 38l6 6 14-14"
        stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M54 28h-2.5c-1.4 0-2.5 1.1-2.5 2.5v3c0 1.4 1.1 2.5 2.5 2.5H54"
        stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  classic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect x="12" y="16" width="40" height="32" rx="7"
        stroke="currentColor" stroke-width="2.8" stroke-linejoin="round"/>
  <path d="M12 24h40"
        stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M22 38l6 6 14-14"
        stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M54 28h-2.5c-1.4 0-2.5 1.1-2.5 2.5v3c0 1.4 1.1 2.5 2.5 2.5H54"
        stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
  premium: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <path d="M14 26l10 8 8-14 8 14 10-8 2 22H12l2-22z"
        stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M18 48h28"
        stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>
  <circle cx="24" cy="34" r="2.2" stroke="currentColor" stroke-width="2.2"/>
  <circle cx="32" cy="30" r="2.2" stroke="currentColor" stroke-width="2.2"/>
  <circle cx="40" cy="34" r="2.2" stroke="currentColor" stroke-width="2.2"/>
  <path d="M10 18h4M12 16v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M50 16h4M52 14v4" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
</svg>`,
};

type DisplayCard = {
  slug: string;
  title: string;
  displayPrice: number;
  strikePrice: number;
  showStrikePrice: boolean;
  description: string;
  icon: string;
  cardClass: string;
};

export default defineComponent({
  name: "PricingSection",

  components: {
    MainCube,
    MainButton,
  },

  data() {
    return {
      launchSaleLabel: SUBSCRIPTION_LAUNCH_SALE_LABEL,
    };
  },

  computed: {
    plans(): ISubscriptionPlan[] {
      return this.$store.getters["subscriptions/plans"] as ISubscriptionPlan[];
    },

    displayCards(): DisplayCard[] {
      const bySlug = Object.fromEntries(this.plans.map((p) => [p.slug, p]));
      const out: DisplayCard[] = [];
      for (const slug of SLUG_ORDER) {
        const plan = bySlug[slug];
        if (!plan) continue;
        const cardClass =
          slug === "classic"
            ? "classic-card"
            : slug === "premium"
              ? "premium-card"
              : "";
        out.push({
          slug,
          title: `מסלול ${plan.name}`,
          displayPrice: plan.price,
          strikePrice: subscriptionStrikePrice(plan.price),
          showStrikePrice: showSubscriptionStrikePrice(plan.price),
          description: subscriptionPlanDescription(plan),
          icon: ICON_BY_SLUG[slug] ?? ICON_BY_SLUG.classic,
          cardClass,
        });
      }
      return out;
    },

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

  mounted() {
    if (!this.$store.getters["subscriptions/plansLoaded"]) {
      void this.$store.dispatch("subscriptions/fetchPlans");
    }
  },
});
</script>

<style lang="scss" scoped>
.home-page-section {
  min-height: calc(100vh - 99px);
  position: relative;
  // background-color: #79ae6088;
  // background-color: #79ae6044;

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
    margin-bottom: 30px;
  }

  h4 {
    margin-bottom: 5px;
  }
}

.pricing-price-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.pricing-launch-sale-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #222;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  line-height: 1.2;
}

.pricing-price-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.pricing-price-original {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  opacity: 0.65;
  text-decoration: line-through;
  line-height: 1.2;
}

.pricing-price-sale {
  margin: 0 0 5px;
  line-height: 1.2;
}

.pricing-cards {
  gap: 30px;
  width: 950px;
  max-width: 80%;

  @media only screen and (max-width: 600px) {
    max-width: 100%;
    margin: auto;
  }
}

.pricing-card {
  border-radius: 2px;
  //   border: 1px solid #0008;
  background-color: #fffc;
  box-shadow: 0 3px 5px #0005;
  backdrop-filter: blur(20px);
  height: 415px;
  width: 300px;
  text-align: center;
  min-height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;

  .pricing-card-header {
    height: 50%;
  }

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

  .pricing-card-header {
    background: linear-gradient(#fff, #f0e68caa, #ffd700aa);
  }

  .premium-card-footer-line {
    width: 50%;
    height: 2px;
    background: linear-gradient(to right, #ffd700, #ff8c00);
    box-shadow: 0 0 8px #ffd70066;
    margin: 20px auto 0 auto;
    border-radius: 2px;
  }
}

.classic-card {
  background: linear-gradient(#fff, #a3d18daa, #a3d18daa);
}

@media only screen and (max-width: 600px) {
  .pricing-section-content {
    border-radius: 50px;
    min-height: fit-content;
    padding-bottom: 15px;
    width: 90%;

    .pricing-cards {
      flex-wrap: wrap;
      margin-top: 5%;

      .pricing-card {
        width: 80%;
        margin-top: 20px;
      }
    }
  }

  .pricing-card {
    margin: 10px auto;
  }
}
</style>
