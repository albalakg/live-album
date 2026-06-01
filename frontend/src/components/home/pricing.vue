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
          <SubscriptionPlanCard
            v-for="card in displayCards"
            :key="card.slug"
            :slug="card.slug"
            :title="card.title"
            :display-price="card.displayPrice"
            :strike-price="card.strikePrice"
            :show-strike-price="card.showStrikePrice"
            :description="card.description"
            :icon="card.icon"
            :card-class="card.cardClass"
            :selectable="false"
            :launch-sale-label="launchSaleLabel"
          >
            <template #footer>
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
            </template>
          </SubscriptionPlanCard>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import MainCube from "@/components/library/background/MainCube.vue";
import SubscriptionPlanCard from "@/components/subscription/SubscriptionPlanCard.vue";
import { StatusEnum, SubscriptionTypesEnum } from "@/helpers/enums";
import { ISubscriptionPlan } from "@/helpers/interfaces";
import {
  buildPlanDisplayCardsFromPlans,
  PlanDisplayCard,
} from "@/helpers/subscriptionPlanDisplay";
import { SUBSCRIPTION_LAUNCH_SALE_LABEL } from "@/helpers/subscriptionPricing";
import { defineComponent } from "vue";
import MainButton from "../library/buttons/MainButton.vue";

export default defineComponent({
  name: "PricingSection",

  components: {
    MainCube,
    MainButton,
    SubscriptionPlanCard,
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

    displayCards(): PlanDisplayCard[] {
      return buildPlanDisplayCardsFromPlans(this.plans);
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

.pricing-cards {
  gap: 30px;
  width: 950px;
  max-width: 80%;

  @media only screen and (max-width: 600px) {
    max-width: 100%;
    margin: auto;
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
      margin-top: 5%;
    }
  }
}
</style>
