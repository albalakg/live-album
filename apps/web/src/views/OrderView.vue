<template>
  <div class="order">
    <div class="order-content wrap">
      <header class="order-head">
        <h1 class="order-page-title">הזמנת אלבום לאירוע</h1>
        <p class="order-page-sub">
          תשלום אחד לאירוע, בלי מנוי. בחרו מסלול והמשיכו הלאה.
        </p>
      </header>

      <ol class="order-steps" :style="{ '--order-steps': String(orderSteps.length) }">
        <li
          v-for="(step, index) in orderSteps"
          :key="step.id"
          class="order-step"
          :class="{ on: viewMode === step.id, done: isStepDone(step.id) }"
        >
          <span class="order-step__num">{{ index + 1 }}</span>
          <span class="order-step__lbl">{{ step.label }}</span>
        </li>
      </ol>

      <div class="order-stage">
        <Transition name="order-fade" mode="out-in">
          <div v-if="viewMode === 'cards'" key="cards" class="order-cards-panel">
            <OrderPlanCards :cards="displayCards" @select="onPlanAction" />

            <div class="order-coupon">
              <template v-if="appliedDiscount">
                <p class="order-coupon__applied">
                  {{ appliedDiscount.code }} — הנחה {{ appliedDiscount.percent }}%
                </p>
                <button
                  type="button"
                  class="order-coupon__remove"
                  @click="clearDiscount"
                >
                  הסרת הקוד
                </button>
              </template>
              <template v-else-if="!couponOpen">
                <button
                  type="button"
                  class="order-coupon__toggle"
                  @click="couponOpen = true"
                >
                  יש לכם קוד הנחה?
                </button>
              </template>
              <form
                v-else
                class="order-coupon__form"
                @submit.prevent="verifyDiscount"
              >
                <label class="order-coupon__label" for="discount-code">
                  קוד הנחה
                </label>
                <div class="order-coupon__row">
                  <input
                    id="discount-code"
                    ref="discountInputEl"
                    v-model="discountInput"
                    class="order-coupon__input"
                    type="text"
                    maxlength="32"
                    autocomplete="off"
                    placeholder="הזינו קוד"
                  />
                  <button
                    type="submit"
                    class="btn btn-ghost order-coupon__submit"
                    :disabled="discountVerifying"
                  >
                    {{ discountVerifying ? "מאמת…" : "אימות" }}
                  </button>
                </div>
                <p v-if="discountError" class="order-coupon__error">
                  {{ discountError }}
                </p>
              </form>
            </div>

            <ul class="order-reassure">
              <li>תשלום אחד לאירוע</li>
              <li>בלי מנוי</li>
              <li>הניסיון בלי כרטיס אשראי</li>
              <li>תשלום מאובטח</li>
            </ul>
          </div>

          <div v-else key="payment" class="order-payment-panel">
            <button
              type="button"
              class="order-back-btn"
              @click="goBackToCards"
            >
              ← חזרה למסלולים
            </button>

            <div class="order-payment-grid">
              <aside class="order-summary">
                <h2 class="order-summary__title">סיכום הזמנה</h2>
                <dl class="order-summary__list">
                  <div class="order-summary__row">
                    <dt>מסלול</dt>
                    <dd>{{ paymentSummary.planLabel }}</dd>
                  </div>
                  <div class="order-summary__row">
                    <dt>מחיר</dt>
                    <dd>{{ formatMoney(paymentSummary.basePrice) }}</dd>
                  </div>
                  <div
                    v-if="paymentSummary.discountPercent > 0"
                    class="order-summary__row"
                  >
                    <dt>הנחה ({{ paymentSummary.discountPercent }}%)</dt>
                    <dd>−{{ formatMoney(paymentSummary.discountAmount) }}</dd>
                  </div>
                  <div class="order-summary__row order-summary__row--total">
                    <dt>לתשלום</dt>
                    <dd>{{ formatMoney(paymentSummary.total) }}</dd>
                  </div>
                </dl>
              </aside>

              <div class="order-pay-panel">
                <template v-if="!isLogged">
                  <div class="order-pay-state">
                    <p>התחברו כדי לטעון את עמוד התשלום</p>
                    <router-link class="order-pay-guest__link" :to="guestLoginTo">
                      <span class="btn btn-primary">התחברות</span>
                    </router-link>
                  </div>
                </template>
                <template v-else>
                  <p v-if="paymentLoading" class="order-pay-state">
                    <span class="order-pay-spinner" aria-hidden="true"></span>
                    טוען את עמוד התשלום…
                  </p>
                  <div v-else-if="loadError" class="order-pay-state order-pay-error">
                    <p>
                      משהו השתבש בטעינת התשלום. נסו שוב או פנו אלינו בוואטסאפ.
                    </p>
                    <button
                      type="button"
                      class="btn btn-primary"
                      @click="loadPaymentSrc"
                    >
                      נסו שוב
                    </button>
                  </div>
                  <div
                    v-else-if="paymentSrc"
                    class="order-pay-iframe-wrap"
                  >
                    <div
                      v-if="!paymentIframeReady"
                      class="order-pay-iframe-loading"
                    >
                      <span class="order-pay-spinner" aria-hidden="true"></span>
                      <p>טוען את עמוד התשלום…</p>
                    </div>
                    <iframe
                      :key="`${form.subscription}-${paymentIframeKey}`"
                      class="order-pay-iframe"
                      :class="{
                        'order-pay-iframe--invisible': !paymentIframeReady,
                      }"
                      frameBorder="0"
                      :src="paymentSrc"
                      title="עמוד תשלום"
                      @load="onPaymentIframeLoad"
                    />
                  </div>
                </template>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import OrderPlanCards, {
  OrderPlanCardModel,
} from "@/components/subscription/OrderPlanCards.vue";
import { defineComponent } from "vue";
import { IStoreOrderResult, ISubscriptionPlan } from "@/helpers/interfaces";
import { SubscriptionTypesEnum } from "@/helpers/enums";
import { discountedAmount } from "@/helpers/subscriptionPricing";
import { PLAN_FACTS, planFactBySlug } from "@snapshare/design/site";

const DISCOUNT_STORAGE_KEY = "snapshareDiscountCode";

type AppliedDiscount = {
  code: string;
  percent: number;
};

type OrderViewMode = "cards" | "payment";

type OrderStep = {
  id: OrderViewMode;
  label: string;
};

export default defineComponent({
  name: "OrderView",

  components: {
    OrderPlanCards,
  },

  data() {
    return {
      viewMode: "cards" as OrderViewMode,
      couponOpen: false as boolean,
      discountInput: "" as string,
      discountError: "" as string,
      discountVerifying: false as boolean,
      appliedDiscount: null as AppliedDiscount | null,
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
    isDevBuild(): boolean {
      return process.env.NODE_ENV === "development";
    },

    orderSteps(): OrderStep[] {
      // Event-details step is omitted until that flow exists on /order.
      return [
        { id: "cards", label: "בחירת מסלול" },
        { id: "payment", label: "תשלום" },
      ];
    },

    subscriptionPlans(): ISubscriptionPlan[] {
      const plans =
        (this.$store.getters["subscriptions/plans"] as ISubscriptionPlan[]) ||
        [];
      const source = plans.length > 0 ? plans : this.fallbackPlans;

      if (this.userIsDemo) {
        return source.filter((p) => p.slug !== "demo");
      }
      if (this.userIsClassic) {
        return source.filter((p) => p.slug === "premium");
      }
      return source;
    },

    fallbackPlans(): ISubscriptionPlan[] {
      return PLAN_FACTS.map((fact, index) => ({
        id: index + 1,
        slug: fact.slug,
        name: fact.nameApi,
        price: fact.price,
        status: 1,
        events_allowed: 1,
        files_allowed: fact.files_allowed,
        storage_time: fact.storage_hours,
      }));
    },

    displayCards(): OrderPlanCardModel[] {
      const bySlug = Object.fromEntries(
        this.subscriptionPlans.map((plan) => [plan.slug, plan])
      );
      const percent = this.appliedDiscount?.percent ?? 0;
      const allowed = new Set(this.subscriptionPlans.map((p) => p.slug));

      return PLAN_FACTS.filter((fact) => allowed.has(fact.slug)).map((fact) => {
        const plan = bySlug[fact.slug];
        const base = this.payableBase(
          plan ?? {
            id: 0,
            slug: fact.slug,
            name: fact.nameApi,
            price: fact.price,
          },
          this.userSubscriptionName,
          this.userSubscriptionPrice
        );
        const displayPrice =
          fact.slug === "demo"
            ? 0
            : percent > 0 && base > 0
              ? discountedAmount(base, percent)
              : base;

        return {
          slug: fact.slug,
          title: fact.nameHe,
          displayPrice,
          priceLabel: fact.slug === "demo" ? fact.priceLabel : null,
          priceSub: fact.priceSub,
          features: [...fact.features],
          cta: fact.cta,
          featured: Boolean(fact.featured),
          badge: fact.badge,
          selected: this.form.subscription === fact.slug,
          loading: this.isCardActionLoading(fact.slug),
        };
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
      )}&pay=1`;
      return `/login?redirect=${encodeURIComponent(path)}`;
    },

    paymentSummary(): {
      planLabel: string;
      basePrice: number;
      discountPercent: number;
      discountAmount: number;
      total: number;
    } {
      const fact = planFactBySlug(this.form.subscription);
      const plan = this.currentPlan;
      const base = plan
        ? this.payableBase(
            plan,
            this.userSubscriptionName,
            this.userSubscriptionPrice
          )
        : fact?.price ?? 0;
      const percent = this.appliedDiscount?.percent ?? 0;
      const total =
        percent > 0 && base > 0 ? discountedAmount(base, percent) : base;
      return {
        planLabel: fact?.nameHe ?? plan?.name ?? this.form.subscription,
        basePrice: base,
        discountPercent: percent > 0 && base > 0 ? percent : 0,
        discountAmount: percent > 0 && base > 0 ? base - total : 0,
        total,
      };
    },
  },

  watch: {
    "$route.query.subscription": {
      handler() {
        this.applyQuerySubscription();
        if (this.viewMode === "payment" && !this.wantsPaymentStep()) {
          this.resetPaymentUi();
          this.viewMode = "cards";
        }
      },
      immediate: true,
    },
    "$route.query.pay"() {
      if (this.wantsPaymentStep() && this.form.subscription !== "demo") {
        this.openPaymentStep(false);
      }
    },
    isLogged(newVal: boolean) {
      if (!newVal && this.viewMode === "payment") {
        this.resetPaymentUi();
      } else if (newVal && this.viewMode === "payment" && this.paymentRequested) {
        this.loadPaymentSrc();
      }
    },
    couponOpen(open: boolean) {
      if (open) {
        this.$nextTick(() => {
          const el = this.$refs.discountInputEl as HTMLInputElement | undefined;
          el?.focus();
        });
      }
    },
  },

  async mounted() {
    this.applyQuerySubscription();
    if (!this.$store.getters["subscriptions/plansLoaded"]) {
      this.$store.dispatch("subscriptions/fetchPlans");
    }
    await this.restoreDiscount();
    if (this.wantsPaymentStep() && this.form.subscription !== "demo") {
      await this.openPaymentStep(false);
    } else {
      await this.scrollToSelectedPlan();
    }
  },

  methods: {
    isStepDone(id: OrderViewMode): boolean {
      return id === "cards" && this.viewMode === "payment";
    },

    wantsPaymentStep(): boolean {
      const pay = this.$route.query.pay;
      return pay === "1" || pay === "true";
    },

    formatMoney(value: number): string {
      if (!Number.isFinite(value) || value <= 0) return "חינם";
      const rounded = Number.isInteger(value) ? String(value) : value.toFixed(2);
      return `₪${rounded}`;
    },

    payableBase(
      plan: ISubscriptionPlan,
      userSub: string | null,
      userPrice: number
    ): number {
      if (plan.slug === "demo") return 0;
      if (userSub) return Math.max(0, Number(plan.price) - userPrice);
      return Number(plan.price);
    },

    readStoredDiscount(): AppliedDiscount | null {
      try {
        const raw = sessionStorage.getItem(DISCOUNT_STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as AppliedDiscount;
        if (!parsed?.code || !Number.isFinite(Number(parsed.percent))) return null;
        return {
          code: String(parsed.code),
          percent: Number(parsed.percent),
        };
      } catch {
        return null;
      }
    },

    storeDiscount(discount: AppliedDiscount) {
      sessionStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(discount));
    },

    clearDiscount() {
      this.appliedDiscount = null;
      this.discountError = "";
      this.discountInput = "";
      this.couponOpen = false;
      sessionStorage.removeItem(DISCOUNT_STORAGE_KEY);
    },

    async restoreDiscount() {
      const stored = this.readStoredDiscount();
      if (!stored) return;
      this.couponOpen = true;
      await this.verifyDiscountCode(stored.code, true);
    },

    async verifyDiscount() {
      const code = this.discountInput.trim();
      if (!code || this.discountVerifying) return;
      await this.verifyDiscountCode(code, false);
    },

    async verifyDiscountCode(code: string, silent: boolean) {
      this.discountVerifying = true;
      this.discountError = "";
      const result = (await this.$store.dispatch(
        "store/verifyDiscountCode",
        code
      )) as { valid: boolean; code?: string; percent?: number };

      this.discountVerifying = false;

      if (!result.valid || !result.code || !result.percent) {
        this.appliedDiscount = null;
        sessionStorage.removeItem(DISCOUNT_STORAGE_KEY);
        if (!silent) {
          this.discountError = "הקוד לא תקין או לא פעיל";
        }
        return;
      }

      const discount = {
        code: result.code,
        percent: result.percent,
      };
      this.appliedDiscount = discount;
      this.discountInput = "";
      this.couponOpen = true;
      this.storeDiscount(discount);
    },

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
      const query = { ...this.$route.query } as Record<string, string | string[]>;
      delete query.pay;
      this.$router.replace({ path: "/order", query });
      this.$nextTick(() => this.scrollToSelectedPlan());
    },

    onPaymentIframeLoad() {
      this.paymentIframeReady = true;
    },

    applyQuerySubscription() {
      const q = this.$route.query.subscription as string | undefined;
      const allowed = ["demo", "classic", "premium"];
      if (q && allowed.includes(q)) {
        const visible = this.subscriptionPlans.some((p) => p.slug === q);
        this.form.subscription = visible ? q : "classic";
        return;
      }
      const fallback =
        this.subscriptionPlans.find((p) => p.slug === "classic") ??
        this.subscriptionPlans[0] ??
        null;
      this.form.subscription = fallback?.slug ?? "classic";
    },

    async scrollToSelectedPlan() {
      await this.$nextTick();
      const slug = this.form.subscription;
      const el = document.getElementById(`plan-${slug}`);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    },

    async setPlanSlug(slug: string, options?: { pay?: boolean }) {
      this.form.subscription = slug;
      const query: Record<string, string> = { subscription: slug };
      if (options?.pay || this.wantsPaymentStep()) query.pay = "1";
      const nextPay = query.pay ?? null;
      const curPay = (this.$route.query.pay as string | undefined) ?? null;
      if (
        this.$route.query.subscription !== slug ||
        nextPay !== curPay
      ) {
        await this.$router.replace({ path: "/order", query });
      }
    },

    async onPlanAction(slug: string) {
      if (this.actionLoadingSlug || this.demoLoading || this.paymentLoading) {
        return;
      }

      this.actionLoadingSlug = slug;

      if (slug === "demo") {
        await this.setPlanSlug(slug);
        await this.submitDemo();
        this.actionLoadingSlug = "";
        return;
      }

      await this.setPlanSlug(slug, { pay: true });
      await this.openPaymentStep(true);
      this.actionLoadingSlug = "";
    },

    async openPaymentStep(requestPayment: boolean) {
      this.viewMode = "payment";
      this.paymentRequested = true;
      if (!this.isLogged) {
        this.paymentLoading = false;
        this.paymentSrc = "";
        this.loadError = "";
        return;
      }
      if (requestPayment || !this.paymentSrc) {
        await this.loadPaymentSrc();
      }
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
        console.error("Order payment: missing paid plan", plan);
        this.loadError = "payment-unavailable";
        this.paymentLoading = false;
        return;
      }

      try {
        const res = (await this.$store.dispatch("store/order", {
          subscription: plan.name,
          ...(this.appliedDiscount
            ? { discount_code: this.appliedDiscount.code }
            : {}),
        })) as IStoreOrderResult;

        if ("error" in res && res.error) {
          console.error("Order payment error:", res.error);
          this.loadError = "payment-unavailable";
          this.$notify({
            text: "משהו השתבש בטעינת התשלום. נסו שוב או פנו אלינו בוואטסאפ.",
            type: "error",
            duration: 7000,
          });
        } else if ("confirmed" in res && res.confirmed) {
          await this.$store.dispatch("user/getProfile");
          this.$router.push("/order/success");
        } else if ("payment_page_link" in res && res.payment_page_link) {
          this.paymentIframeKey += 1;
          this.paymentSrc = res.payment_page_link;
        } else {
          console.error("Order payment: unexpected response", res);
          this.loadError = "payment-unavailable";
        }
      } catch (error) {
        console.error("Order payment exception:", error);
        this.loadError = "payment-unavailable";
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
          text: "צריך להתחבר כדי לפתוח את מסלול הניסיון",
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
  padding: 28px 0 48px;
}

.order-content {
  position: relative;
  z-index: 2;
  padding-bottom: 32px;
}

.order-head {
  text-align: center;
  margin-bottom: 20px;
}

.order-page-title {
  margin: 0 0 8px;
  font-weight: 900;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  letter-spacing: -0.03em;
  color: var(--ink);
}

.order-page-sub {
  margin: 0 auto;
  max-width: 40rem;
  color: var(--muted);
  font-weight: 600;
  font-size: 1.02rem;
  line-height: 1.5;
}

.order-steps {
  --order-steps: 2;
  display: grid;
  grid-template-columns: repeat(var(--order-steps), minmax(0, 1fr));
  gap: 12px;
  list-style: none;
  margin: 0 auto 28px;
  padding: 0;
  max-width: 640px;
}

.order-step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: var(--paper);
  color: var(--muted);
  font-weight: 700;
}

.order-step__num {
  font-family: var(--brand);
  font-weight: 800;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  color: var(--accent);
}

.order-step.on {
  background: color-mix(in srgb, var(--accent) 14%, var(--paper));
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
  color: var(--ink);
}

.order-step.done {
  border-color: color-mix(in srgb, var(--accent) 38%, var(--line));
  background: color-mix(in srgb, var(--rose, #dc5b66) 8%, var(--paper));
  color: var(--ink);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 22%, transparent);
}

.order-step__lbl {
  font-weight: 800;
  font-size: 1.02rem;
  color: inherit;
}

.order-stage {
  position: relative;
  min-height: 420px;
}

.order-coupon {
  margin: 28px auto 0;
  max-width: 420px;
  text-align: center;
}

.order-coupon__toggle,
.order-coupon__remove {
  border: 0;
  background: none;
  cursor: pointer;
  font-weight: 800;
  color: var(--ink);
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: 4px;
}

.order-coupon__toggle:hover,
.order-coupon__remove:hover {
  color: var(--accent-2);
}

.order-coupon__applied {
  margin: 0 0 8px;
  font-weight: 800;
  color: var(--ink);
}

.order-coupon__form {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 22px;
  padding: 16px 18px;
  text-align: right;
  box-shadow: var(--shadow-sm);
}

.order-coupon__label {
  display: block;
  font-weight: 800;
  margin-bottom: 8px;
}

.order-coupon__row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.order-coupon__input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 16px;
  background: #fff;
}

.order-coupon__submit {
  flex-shrink: 0;
  padding: 12px 18px;
}

.order-coupon__error {
  margin: 10px 0 0;
  color: #c0392b;
  font-weight: 700;
}

.order-reassure {
  list-style: none;
  margin: 28px auto 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px 18px;
  max-width: 820px;
  color: var(--muted);
  font-weight: 700;
  font-size: 0.95rem;
}

.order-reassure li {
  position: relative;
  padding-inline-start: 14px;
}

.order-reassure li::before {
  content: "";
  position: absolute;
  inset-inline-start: 0;
  top: 0.55em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--live);
}

.order-fade-enter-active,
.order-fade-leave-active {
  transition: opacity 0.28s ease;
}

.order-fade-enter-from,
.order-fade-leave-to {
  opacity: 0;
}

.order-payment-panel {
  max-width: 1100px;
  margin: 0 auto;
}

.order-back-btn {
  display: inline-flex;
  margin: 0 0 16px;
  padding: 8px 4px;
  border: 0;
  background: none;
  cursor: pointer;
  font-weight: 800;
  color: var(--ink);
}

.order-back-btn:hover {
  color: var(--accent-2);
}

.order-payment-grid {
  display: grid;
  grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.order-summary,
.order-pay-panel {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 24px;
  box-shadow: var(--shadow-sm);
}

.order-summary {
  padding: 22px 20px;
}

.order-summary__title {
  margin: 0 0 16px;
  font-size: 1.15rem;
  font-weight: 900;
}

.order-summary__list {
  margin: 0;
}

.order-summary__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
  font-weight: 700;
}

.order-summary__row dt {
  color: var(--muted);
}

.order-summary__row dd {
  margin: 0;
  color: var(--ink);
}

.order-summary__row--total {
  border-bottom: 0;
  padding-top: 14px;
  font-size: 1.08rem;
}

.order-pay-panel {
  min-height: 420px;
  padding: 18px;
  display: flex;
  flex-direction: column;
}

.order-pay-state,
.order-pay-error {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  text-align: center;
  padding: 24px 12px;
  font-weight: 700;
  color: var(--ink);
}

.order-pay-guest__link {
  text-decoration: none;
}

.sandbox-note {
  max-width: 36rem;
  margin: 0;
  color: var(--muted);
  font-weight: 600;
  font-size: 0.95rem;
}

.order-pay-spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid rgba(0, 0, 0, 0.12);
  border-top-color: var(--live);
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
  min-height: 420px;
  width: 100%;
  position: relative;
}

.order-pay-iframe-loading {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: var(--paper);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-weight: 700;
}

.order-pay-iframe {
  width: 100%;
  height: 100%;
  min-height: 420px;
  border: 0;
  background: #fff;
  border-radius: 16px;
  display: block;
}

.order-pay-iframe--invisible {
  opacity: 0;
  pointer-events: none;
}

@media (max-width: 900px) {
  .order-payment-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .order {
    padding-top: 16px;
    overflow-x: hidden;
  }

  .order-steps {
    gap: 8px;
  }

  .order-step {
    padding: 12px 12px;
  }

  .order-step__lbl {
    font-size: 0.95rem;
  }

  .order-coupon__row {
    flex-direction: column;
    align-items: stretch;
  }

  .order-reassure {
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
}
</style>
