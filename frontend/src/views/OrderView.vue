<template>
  <div class="order">
    <MainCube
      color="pink"
      left="20%"
      top="12%"
      width="large"
      height="xx-large"
    />
    <MainCube
      color="green"
      left="10%"
      top="15%"
      width="xxxx-large"
      height="large"
    />
    <MainCube
      color="green"
      left="14%"
      top="83%"
      width="medium"
      height="medium"
    />
    <MainCube color="green" left="15%" top="85%" width="large" height="large" />
    <MainCube color="green" left="75%" top="43%" width="large" height="large" />
    <MainCube
      color="green"
      left="78%"
      top="45%"
      width="medium"
      height="medium"
    />
    <MainCube
      color="green"
      right="0%"
      top="25%"
      width="small"
      height="xx-large"
    />
    <MainCube
      color="pink"
      right="0%"
      top="28%"
      width="xxx-large"
      height="medium"
    />
    <MainCube
      color="pink"
      right="12%"
      top="84%"
      width="xxx-large"
      height="large"
    />
    <MainCube
      color="green"
      right="10%"
      top="88%"
      width="large"
      height="xxx-large"
    />

    <MainLine color="light-green" left="600px" width="xx-large" height="full" />
    <MainLine color="light-green" left="665px" width="small" height="full" />
    <MainLine color="light-green" left="675px" width="medium" height="full" />
    <MainLine color="light-green" left="690px" width="small" height="full" />
    <MainLine
      color="light-green"
      left="700px"
      width="xxx-large"
      height="full"
    />
    <MainLine color="light-green" left="795px" width="small" height="full" />
    <MainLine color="light-green" left="805px" width="medium" height="full" />
    <MainLine color="light-green" left="820px" width="small" height="full" />
    <MainLine color="light-green" left="830px" width="xx-large" height="full" />

    <div class="order-content margin--auto">
      <div class="order-layout">
        <div class="order-column order-column--panel">
          <div
            class="order-info shadow--small brs--medium bg--pink padding--small"
          >
            <div
              class="order-info-content bg--light-pink brs--small display--flex direction--column"
            >
              <div>
                <h2 class="title--large text--white">הזמנת אלבום לאירוע</h2>
                <MainLine
                  color="white"
                  right="15px"
                  width="xxx-large"
                  height="x-small"
                />
                <p
                  class="text--dark"
                  v-html="currentPlanDescription"
                ></p>
              </div>

              <div class="order-checkout-box brs--small bg--white shadow--small">
                <span
                  v-if="showOrderStrikePrice"
                  class="order-launch-sale-tag"
                  >{{ launchSaleLabel }}</span
                >
                <div class="order-price-row display--flex justify--center align--center">
                  <div class="order-price-block display--flex flex--column align--center">
                    <span
                      v-if="showOrderStrikePrice"
                      class="order-price-original text--dark"
                      >₪{{ orderStrikePrice }}</span
                    >
                    <span class="title--large text--dark order-price-sale"
                      >₪{{ currentPrice }}</span
                    >
                  </div>
                </div>
                <div
                  class="order-plan-switcher display--flex flex--wrap justify--center"
                  role="tablist"
                  aria-label="בחירת מסלול"
                >
                  <div
                    v-for="plan in subscriptionPlans"
                    :key="plan.slug + String(plan.id)"
                    class="order-plan-switcher__item"
                  >
                    <BaseButton
                      @onClick="selectPlan(plan.slug)"
                      :text="plan.name"
                      :color="
                        currentPlan?.slug === plan.slug ? 'green' : 'white'
                      "
                      :text-color="
                        currentPlan?.slug === plan.slug ? 'white' : 'dark'
                      "
                    />
                  </div>
                </div>
                <div v-if="isDemo" class="order-demo-cta">
                  <MainButton
                    color="pink"
                    @onClick="submitDemo()"
                    :loading="demoLoading"
                    text="נסה עכשיו"
                  />
                </div>
                <div v-else class="order-demo-cta">
                  <MainButton
                    color="green"
                    @onClick="submitOrder()"
                    :loading="paymentLoading"
                    text="רכוש עכשיו"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-if="showCheckoutPanel"
          class="order-column order-column--pay"
        >
          <div
            class="order-pay-card brs--medium bg--white shadow--small position--relative"
          >
            <template v-if="isDemo">
              <p class="order-pay-placeholder text--dark text--center title--small">
                מסלול הניסיון ללא תשלום — לחצו על &quot;נסה עכשיו&quot; בכרטיס
                ליד.
              </p>
            </template>
            <template v-else-if="!isLogged">
              <div
                class="order-pay-guest display--flex direction--column align--center justify--center"
              >
                <p class="text--dark text--center title--small margin--bottom-small">
                  התחברו כדי לטעון את עמוד התשלום
                </p>
                <router-link class="order-pay-guest__link" :to="guestLoginTo">
                  <MainButton color="pink" text="התחברות" />
                </router-link>
              </div>
            </template>
            <template v-else>
              <p
                v-if="!paymentRequested"
                class="order-pay-placeholder text--dark text--center title--small"
              >
                לחצו על &quot;רכוש עכשיו&quot; בכרטיס ליד כדי לטעון את עמוד התשלום.
              </p>
              <template v-else>
                <p
                  v-if="paymentLoading"
                  class="text--dark title--small text--center order-pay-state"
                >
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
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import BaseButton from "@/components/library/buttons/BaseButton.vue";
import MainButton from "@/components/library/buttons/MainButton.vue";
import MainCube from "@/components/library/background/MainCube.vue";
import MainLine from "@/components/library/background/MainLine.vue";
import { defineComponent } from "vue";
import { IStoreOrderResult, ISubscriptionPlan } from "@/helpers/interfaces";
import { SubscriptionTypesEnum } from "@/helpers/enums";
import {
  SUBSCRIPTION_LAUNCH_SALE_LABEL,
  showSubscriptionStrikePrice,
  subscriptionPlanDescription,
  subscriptionStrikePrice,
} from "@/helpers/subscriptionPricing";

export default defineComponent({
  name: "OrderView",

  components: {
    MainCube,
    MainLine,
    BaseButton,
    MainButton,
  },

  data() {
    return {
      launchSaleLabel: SUBSCRIPTION_LAUNCH_SALE_LABEL,
      demoLoading: false as boolean,
      paymentLoading: false as boolean,
      paymentSrc: "" as string,
      loadError: "" as string,
      /** Shown only after "רכוש עכשיו"; reset when switching plan. */
      paymentRequested: false as boolean,
      /** Bumps iframe key so switching plan + purchase remounts cleanly. */
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
      if(this.userIsDemo) {
        return plans.filter((p) => p.slug !== "demo");
      }

      if(this.userIsClassic) {
        return plans.filter((p) => p.slug === "premium");
      }

      return plans;
    },

    userIsClassic(): boolean {
      return SubscriptionTypesEnum.CLASSIC === this.userSubscriptionName;
    },
    
    userIsDemo (): boolean {
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

    isDemo(): boolean {
      return this.currentPlan?.slug === "demo";
    },

    guestLoginTo(): string {
      const path = `/order?subscription=${encodeURIComponent(
        this.form.subscription
      )}`;
      return `/login?redirect=${encodeURIComponent(path)}`;
    },

    /** Pay column: after “רכוש עכשיו”, or when an iframe URL is already loaded. */
    showCheckoutPanel(): boolean {
      return (
        !this.isDemo &&
        this.isLogged &&
        (this.paymentRequested || Boolean(this.paymentSrc))
      );
    },

    currentPrice(): number {
      if(this.isDemo) {
        return 0;
      }

      const price = this.currentPlan?.price ?? 0;
      
      if(this.userSubscriptionName) {
        return price - this.userSubscriptionPrice;
      }

      return price;
    },

    orderStrikePrice(): number {
      return subscriptionStrikePrice(this.currentPrice);
    },

    showOrderStrikePrice(): boolean {
      return showSubscriptionStrikePrice(this.currentPrice);
    },

    currentPlanDescription(): string {
      return subscriptionPlanDescription(this.currentPlan);
    },
  },

  watch: {
    "$route.query.subscription": {
      handler() {
        this.applyQuerySubscription();
        this.resetPaymentUi();
      },
      immediate: true,
    },
    isLogged(newVal: boolean) {
      if (!newVal) {
        this.resetPaymentUi();
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
    resetPaymentUi() {
      this.paymentRequested = false;
      this.paymentSrc = "";
      this.loadError = "";
      this.paymentLoading = false;
      this.paymentIframeReady = false;
    },

    onPaymentIframeLoad() {
      this.paymentIframeReady = true;
    },

    applyQuerySubscription() {
      const q = this.$route.query.subscription as string | undefined;
      const plans = this.subscriptionPlans;
      const byQuery = q ? plans.find((p) => p.slug === q) : undefined;
      console.log("byQuery", byQuery, q, plans);
      const fallback =
        plans.find((p) => p.slug === "classic") ?? plans[0] ?? null;
      this.form.subscription = (byQuery ?? fallback)?.slug ?? "classic";
    },

    selectPlan(slug: string) {
      if (slug === this.form.subscription) {
        return;
      }
      void this.$router.replace({
        path: "/order",
        query: { subscription: slug },
      });
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

      if (this.form.subscription === "demo" || this.isDemo) {
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

    async submitOrder() {
      if (!this.isLogged) {
        const path = `/order?subscription=${encodeURIComponent(
          this.form.subscription
        )}`;
        this.$router.push(`/login?redirect=${encodeURIComponent(path)}`);
        return;
      }
      if (this.isDemo) {
        return;
      }
      if (this.paymentLoading) {
        return;
      }
      this.paymentRequested = true;
      await this.loadPaymentSrc();
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
  height: fit-content;
  min-height: 100vh;

  @media only screen and (max-width: 600px) {
    margin-top: 30px;
  }

  .line-height-full {
    height: 130vh;
  }
}

.order-content {
  position: relative;
  z-index: 2;
  padding-top: 5%;
  padding-bottom: 48px;
  width: 92%;
  max-width: 1200px;
}

.order-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.08fr);
  gap: 28px;
  align-items: start;

  @media only screen and (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 22px;
    width: 95%;
  }
}

.order-column--panel {
  min-width: 0;
}

.order-column--pay {
  min-width: 0;
}

.order-info {
  width: 100%;
  min-height: fit-content;

  .order-info-content {
    width: calc(97% - 30px);
    min-height: fit-content;
    padding: 15px;
    position: relative;
    top: 2%;
    margin: auto;
    gap: 20px;

    .title--large {
      font-size: 2.6em;
      margin-bottom: 10px;
    }

    p {
      margin-top: 30px;
    }
  }
}

.order-checkout-box {
  margin-top: 8px;
  text-align: center;
  padding: 18px 16px 20px;
}

.order-price-row {
  padding-bottom: 14px;
  margin-bottom: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.order-price-block {
  gap: 6px;
}

.order-launch-sale-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #222;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}

.order-price-original {
  font-size: 1.35rem;
  font-weight: 700;
  opacity: 0.65;
  text-decoration: line-through;
}

.order-price-sale {
  line-height: 1.2;
}

.order-plan-switcher {
  gap: 10px;

  &__item {
    flex: 1 1 auto;
    min-width: 88px;
    max-width: 140px;
  }
}

.order-demo-cta {
  margin-top: 18px;
}

.order-pay-card {
  min-height: 200px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.order-pay-placeholder,
.order-pay-state {
  margin: auto;
  padding: 24px 12px;
  max-width: 320px;
  line-height: 1.5;
}

.order-pay-guest {
  min-height: 280px;
  gap: 16px;
  padding: 16px;

  &__link {
    text-decoration: none;
  }
}

.order-pay-error {
  gap: 16px;
  padding: 24px 12px;
  margin: auto;
}

.order-pay-iframe-wrap {
  width: 100%;
  flex: 1;
  min-height: 720px;
}

.order-pay-iframe-loading {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: #fff;
  border-radius: 4px;
  padding: 24px 12px;
}

.order-pay-iframe {
  width: 100%;
  min-height: 720px;
  border: 0;
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  flex: 1;
}

.order-pay-iframe--invisible {
  opacity: 0;
  pointer-events: none;
}

@media only screen and (max-width: 600px) {
  .order-pay-iframe {
    min-height: 600px;
  }

  .order-plan-switcher__item {
    max-width: none;
  }
}
</style>
