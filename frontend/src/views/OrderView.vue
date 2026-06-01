<template>
  <div class="order">
    <MainCube left="5%" top="5%" width="large" height="large" />
    <MainCube
      color="pink"
      left="7%"
      top="12%"
      width="medium"
      height="x-large"
    />
    <MainCube
      color="pink"
      left="65%"
      top="46%"
      width="large"
      height="x-large"
    />
    <MainCube color="pink" left="85%" top="15%" width="medium" height="medium" />

    <div class="order-content width--page-size margin--auto">
      <h1 class="title--x-large order-page-title">הזמנת אלבום לאירוע</h1>

      <div class="order-stage">
        <Transition name="order-fade" mode="out-in">
          <div
            v-if="viewMode === 'cards'"
            key="cards"
            class="order-cards-panel"
          >
            <div
              class="display--flex justify--space-between width--two-thirds margin--auto flex--wrap-mobile order-plan-cards"
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
                  <MainButton
                    animation
                    size="x-small"
                    :color="card.slug === 'demo' ? 'pink' : 'green'"
                    :text="card.slug === 'demo' ? 'נסה עכשיו' : 'רכוש עכשיו'"
                    :loading="isCardActionLoading(card.slug)"
                    @onClick="onPlanAction(card.slug)"
                  />
                </template>
              </SubscriptionPlanCard>
            </div>
          </div>

          <div
            v-else
            key="payment"
            class="order-payment-panel brs--medium bg--white"
          >
            <button
              type="button"
              class="order-back-btn text--dark title--small"
              @click="goBackToCards"
            >
              ← חזרה למסלולים
            </button>

            <div class="order-payment-panel__body">
              <template v-if="!isLogged">
                <div
                  class="order-pay-guest display--flex direction--column align--center justify--center"
                >
                  <p class="text--dark text--center title--small">
                    התחברו כדי לטעון את עמוד התשלום
                  </p>
                  <router-link class="order-pay-guest__link" :to="guestLoginTo">
                    <MainButton color="pink" text="התחברות" />
                  </router-link>
                </div>
              </template>
              <template v-else>
                <p
                  v-if="paymentLoading"
                  class="text--dark title--small text--center order-pay-state"
                >
                  <span class="order-pay-spinner" aria-hidden="true"></span>
                  טוען את עמוד התשלום…
                </p>
                <div
                  v-else-if="loadError"
                  class="order-pay-error display--flex direction--column align--center"
                >
                  <p class="text--dark text--center">{{ loadError }}</p>
                  <MainButton
                    color="pink"
                    text="נסו שוב"
                    @onClick="loadPaymentSrc"
                  />
                </div>
                <div
                  v-else-if="paymentSrc"
                  class="order-pay-iframe-wrap position--relative"
                >
                  <div
                    v-if="!paymentIframeReady"
                    class="order-pay-iframe-loading display--flex align--center justify--center"
                  >
                    <span class="order-pay-spinner" aria-hidden="true"></span>
                    <p class="text--dark title--small text--center">
                      טוען את עמוד התשלום…
                    </p>
                  </div>
                  <iframe
                    :key="`${form.subscription}-${paymentIframeKey}`"
                    class="order-pay-iframe"
                    :class="{ 'order-pay-iframe--invisible': !paymentIframeReady }"
                    frameBorder="0"
                    :src="paymentSrc"
                    title="עמוד תשלום"
                    @load="onPaymentIframeLoad"
                  />
                </div>
              </template>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MainButton from "@/components/library/buttons/MainButton.vue";
import MainCube from "@/components/library/background/MainCube.vue";
import SubscriptionPlanCard from "@/components/subscription/SubscriptionPlanCard.vue";
import { defineComponent } from "vue";
import { IStoreOrderResult, ISubscriptionPlan } from "@/helpers/interfaces";
import { SubscriptionTypesEnum } from "@/helpers/enums";
import {
  buildPlanDisplayCardsFromPlans,
  PlanDisplayCard,
} from "@/helpers/subscriptionPlanDisplay";
import { SUBSCRIPTION_LAUNCH_SALE_LABEL } from "@/helpers/subscriptionPricing";

type OrderViewMode = "cards" | "payment";

export default defineComponent({
  name: "OrderView",

  components: {
    MainCube,
    MainButton,
    SubscriptionPlanCard,
  },

  data() {
    return {
      launchSaleLabel: SUBSCRIPTION_LAUNCH_SALE_LABEL,
      viewMode: "cards" as OrderViewMode,
      actionLoadingSlug: "" as string,
      demoLoading: false as boolean,
      paymentLoading: false as boolean,
      paymentSrc: "" as string,
      loadError: "" as string,
      paymentRequested: false as boolean,
      paymentIframeKey: 0 as number,
      paymentIframeReady: false as boolean,
      form: {
        subscription: "classic" as string,
      },
    };
  },

  computed: {
    subscriptionPlans(): ISubscriptionPlan[] {
      const plans = this.$store.getters["subscriptions/plans"] as ISubscriptionPlan[];
      if (this.userIsDemo) {
        return plans.filter((p) => p.slug !== "demo");
      }

      if (this.userIsClassic) {
        return plans.filter((p) => p.slug === "premium");
      }

      return plans;
    },

    displayCards(): PlanDisplayCard[] {
      const userSub = this.userSubscriptionName;
      const userPrice = this.userSubscriptionPrice;
      return buildPlanDisplayCardsFromPlans(this.subscriptionPlans, {
        priceOverrideForSlug: (_slug, plan) => {
          if (plan.slug === "demo") return 0;
          if (userSub) return plan.price - userPrice;
          return undefined;
        },
      });
    },

    userIsClassic(): boolean {
      return SubscriptionTypesEnum.CLASSIC === this.userSubscriptionName;
    },

    userIsDemo(): boolean {
      return SubscriptionTypesEnum.DEMO === this.userSubscriptionName;
    },

    isLogged(): boolean {
      return this.$store.getters["user/isLoggedIn"];
    },

    currentPlan(): ISubscriptionPlan | null {
      return (
        this.subscriptionPlans.find(
          (p) => p.slug === this.form.subscription
        ) ?? null
      );
    },

    userSubscriptionName(): string | null {
      return this.$store.getters["user/getSubscriptionName"];
    },

    userSubscriptionPrice(): number {
      return this.$store.getters["user/getSubscriptionPrice"] ?? 0;
    },

    guestLoginTo(): string {
      const path = `/order?subscription=${encodeURIComponent(
        this.form.subscription
      )}`;
      return `/login?redirect=${encodeURIComponent(path)}`;
    },
  },

  watch: {
    "$route.query.subscription": {
      handler() {
        this.applyQuerySubscription();
        if (this.viewMode === "payment") {
          this.resetPaymentUi();
          this.viewMode = "cards";
        }
      },
      immediate: true,
    },
    isLogged(newVal: boolean) {
      if (!newVal) {
        this.resetPaymentUi();
        this.viewMode = "cards";
      }
    },
  },

  async mounted() {
    if (!this.$store.getters["subscriptions/plansLoaded"]) {
      await this.$store.dispatch("subscriptions/fetchPlans");
    }
    this.applyQuerySubscription();
  },

  methods: {
    isCardActionLoading(slug: string): boolean {
      if (slug === "demo") {
        return this.demoLoading;
      }
      return (
        this.form.subscription === slug &&
        (this.paymentLoading || this.actionLoadingSlug === slug)
      );
    },

    resetPaymentUi() {
      this.paymentRequested = false;
      this.paymentSrc = "";
      this.loadError = "";
      this.paymentLoading = false;
      this.paymentIframeReady = false;
      this.actionLoadingSlug = "";
    },

    goBackToCards() {
      this.resetPaymentUi();
      this.viewMode = "cards";
    },

    onPaymentIframeLoad() {
      this.paymentIframeReady = true;
    },

    applyQuerySubscription() {
      const q = this.$route.query.subscription as string | undefined;
      const plans = this.subscriptionPlans;
      const byQuery = q ? plans.find((p) => p.slug === q) : undefined;
      const fallback =
        plans.find((p) => p.slug === "classic") ?? plans[0] ?? null;
      this.form.subscription = (byQuery ?? fallback)?.slug ?? "classic";
    },

    async setPlanSlug(slug: string) {
      this.form.subscription = slug;
      if (this.$route.query.subscription !== slug) {
        await this.$router.replace({
          path: "/order",
          query: { subscription: slug },
        });
      }
    },

    async onPlanAction(slug: string) {
      if (this.actionLoadingSlug || this.demoLoading || this.paymentLoading) {
        return;
      }

      this.actionLoadingSlug = slug;
      await this.setPlanSlug(slug);

      if (slug === "demo") {
        await this.submitDemo();
        this.actionLoadingSlug = "";
        return;
      }

      if (!this.isLogged) {
        const path = `/order?subscription=${encodeURIComponent(slug)}`;
        this.actionLoadingSlug = "";
        this.$router.push(`/login?redirect=${encodeURIComponent(path)}`);
        return;
      }

      this.resetPaymentUi();
      this.viewMode = "payment";
      this.paymentRequested = true;
      await this.loadPaymentSrc();
      this.actionLoadingSlug = "";
    },

    async loadPaymentSrc() {
      this.loadError = "";
      this.paymentSrc = "";
      this.paymentIframeReady = false;
      this.paymentLoading = true;

      if (!this.isLogged) {
        this.paymentLoading = false;
        return;
      }

      const plan = this.currentPlan;
      if (!plan || plan.slug === "demo") {
        this.loadError = "לא נמצא מסלול תשלום.";
        this.paymentLoading = false;
        return;
      }

      try {
        const res = (await this.$store.dispatch("store/order", {
          subscription: plan.name,
        })) as IStoreOrderResult;

        if ("error" in res && res.error) {
          this.loadError = res.error;
          this.$notify({
            text: res.error,
            type: "error",
            duration: 7000,
          });
        } else if ("payment_page_link" in res && res.payment_page_link) {
          this.paymentIframeKey += 1;
          this.paymentSrc = res.payment_page_link;
        } else {
          this.loadError = "לא ניתן לטעון את עמוד התשלום.";
        }
      } finally {
        this.paymentLoading = false;
      }
    },

    async submitDemo() {
      if (!this.isLogged) {
        this.$router.push(
          `/login?redirect=${encodeURIComponent("/order?subscription=demo")}`
        );
        this.$notify({
          text: "צריך להתחבר בשביל בשביל המסלול נסיון",
          type: "success",
          duration: 5000,
        });
        return;
      }

      this.demoLoading = true;
      const orderResponse = await this.$store.dispatch("store/orderDemo", {
        subscription: this.currentPlan?.name,
      });

      if (orderResponse) {
        await this.$store.dispatch("user/getProfile");
        this.$notify({
          text: "הזמנת הנסיון בוצעה בהצלחה! יכול לשחק עם זה עכשיו.",
          type: "success",
          duration: 7000,
        });
      }

      this.demoLoading = false;
    },
  },
});
</script>

<style lang="scss" scoped>
.order {
  min-height: 100vh;
  position: relative;

  @media only screen and (max-width: 600px) {
    margin-top: 24px;
  }
}

.order-content {
  position: relative;
  z-index: 2;
  padding: 24px 0 32px;
}

.order-page-title {
  margin: 0 0 28px;
  font-weight: 700;
  text-align: center;
}

.order-stage {
  position: relative;
  min-height: calc(100vh - 180px);
}

.order-plan-cards {
  gap: 30px;
  width: 950px;
  max-width: 92%;

  @media only screen and (max-width: 600px) {
    max-width: 100%;
    flex-wrap: wrap;

    :deep(.pricing-card) {
      width: 80%;
      margin: 10px auto;
    }
  }
}

.order-fade-enter-active,
.order-fade-leave-active {
  transition: opacity 0.35s ease;
}

.order-fade-enter-from,
.order-fade-leave-to {
  opacity: 0;
}

.order-payment-panel {
  max-width: 1000px;
  margin: 0 auto;
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 180px);

  &__body {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}

.order-back-btn {
  align-self: flex-start;
  margin: 0 0 16px;
  padding: 8px 4px;
  border: 0;
  background: none;
  cursor: pointer;
  font-weight: 700;
  letter-spacing: 0.3px;
  transition: color 0.2s ease;

  &:hover {
    color: var(--pink);
  }
}

.order-pay-guest,
.order-pay-state,
.order-pay-error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 16px;
  text-align: center;
}

.order-pay-guest__link {
  text-decoration: none;
}

.order-pay-spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.12);
  border-top-color: var(--green);
  border-radius: 50%;
  animation: order-spin 0.8s linear infinite;
}

@keyframes order-spin {
  to {
    transform: rotate(360deg);
  }
}

.order-pay-iframe-wrap {
  flex: 1;
  min-height: 0;
  width: 100%;
  position: relative;
}

.order-pay-iframe-loading {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: #fff;
  border-radius: 8px;
  flex-direction: column;
  gap: 12px;
}

.order-pay-iframe {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 260px);
  border: 0;
  background: #fff;
  border-radius: 8px;
  display: block;
}

.order-pay-iframe--invisible {
  opacity: 0;
  pointer-events: none;
}
</style>
