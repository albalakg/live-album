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

    <div
      class="order-content height--full display--flex flex--wrap justify--space-around margin--auto"
    >
      <template v-if="hasPaymentLink">
        <iframe
          frameBorder="0"
          :src="orderResponse?.payment_page_link"
          title="עמוד תשלום"
        ></iframe>
      </template>
      <template v-else>
        <div
          class="order-info shadow--small brs--medium bg--pink padding--small"
        >
          <div
            class="order-info-content bg--light-pink brs--small display--flex direction--column justify--space-between"
          >
            <div>
              <h2 class="title--large text--white">הזמנת אלבום לאירוע</h2>
              <MainLine
                color="white"
                right="15px"
                width="xxx-large"
                height="x-small"
              />
              <p class="text--dark">
                אלבום דיגיטלי חי בזמן האירוע
                <br />
                כל קבצי האלבום להורדה
                <br />
                כרטיס הזמנה עם QR המוביל לעמוד ייחודי להעלאת הקבצים
              </p>
            </div>
            <div
              class="display--flex justify--space-between order-info-actions"
            >
              <div
                class="width--half padding--medium"
                v-for="subscription in subscriptions"
                :key="subscription.value + currentSubscription?.id"
              >
                <router-link :to="`/order?subscription=${subscription.value}`">
                  <BaseButton
                    @onClick="setSubscription(subscription.value)"
                    :text="subscription.name"
                    :color="
                      currentSubscription?.value === subscription.value
                        ? 'green'
                        : 'white'
                    "
                    :text-color="
                      currentSubscription?.value === subscription.value ? 'white' : 'dark'
                    "
                  />
                </router-link>
              </div>
            </div>
          </div>
        </div>
        <div
          class="order-details shadow--small brs--medium bg--white width--corner padding--large position--relative display--flex direction--column justify--space-between"
        >
          <div>
            <h3 class="text--center title--large">סיכום הזמנה</h3>
            <br />
            <div class="display--flex justify--space-between">
              <span class="title--small text--dark">מחיר ההזמנה</span>
              <span class="title--small text--dark"
                >₪{{ currentSubscription?.price }}</span
              >
            </div>
            <br />
            <div class="separator bg--dark"></div>
          </div>
          <div>
            <MainButton
              v-if="isDemo"
              color="pink"
              @onClick="submitDemo()"
              :loading="loading"
              text="נסה עכשיו"
            />
            <MainButton v-else color="pink" readonly text="רכישה בקרוב" />
            <br />
            <br />
            <router-link to="/contact-us" v-if="!isDemo">
              <p class="text--center">
                ניתן כרגע <strong>ליצור קשר</strong> איתנו ונעדכן אתכם
              </p>
            </router-link>
            <!-- <MainButton text="לתשלום" @onClick="submit()" /> -->
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import BaseButton from "@/components/library/buttons/BaseButton.vue";
import MainButton from "@/components/library/buttons/MainButton.vue";
import MainCube from "@/components/library/background/MainCube.vue";
import MainLine from "@/components/library/background/MainLine.vue";
import { defineComponent } from "vue";
import { SubscriptionTypesEnum } from "@/helpers/enums";
import { IOrderResponse } from "@/helpers/interfaces";

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
      orderResponse: null as IOrderResponse | null,
      loading: false as boolean,
      subscriptions: [
        {
          name: "נסיון",
          value: "demo",
          price: 0,
        },
        {
          name: "קלאסי",
          value: "classic",
          price: 200,
        },
        {
          name: "פרמיום",
          value: "premium",
          price: 300,
        },
      ] as Record<string, any>[],
      form: {
        subscription: "classic" as string,
      },
    };
  },

  mounted() {
    const foundSubscription = this.subscriptions.find(
      (subscription) => (subscription.value === this.$route.query.subscription)
    );

    this.form.subscription = foundSubscription?.value ?? "classic";
  },

  computed: {
    hasPaymentLink(): boolean {
      return !!this.orderResponse?.payment_page_link;
    },

    isLogged(): boolean {
      return this.$store.getters["user/isLoggedIn"];
    },

    currentSubscription(): Record<string, any> | null {
      return (
        this.subscriptions.find(
          (subscription) => subscription.value === this.form.subscription
        ) ?? null
      );
    },

    userSubscriptionName(): string | null {
      return this.$store.getters["user/getSubscriptionName"];
    },

    isDemo(): boolean {
      return this.currentSubscription?.name === SubscriptionTypesEnum.DEMO;
    },
  },

  watch: {
    userSubscriptionName: {
      immediate: true,
      handler(newValue: string | null) {
        if (newValue) {
          this.$router.push("/event");
        }
    }
    },
  },

  methods: {
    async submit() {
      if (!this.isLogged) {
        this.$router.push("/login?redirect=/order");
        return;
      }

      this.loading = true;
      this.orderResponse = await this.$store.dispatch("store/order", this.form);
      this.loading = false;
    },

    async submitDemo() {
      if (!this.isLogged) {
        this.$router.push("/login?redirect=/order");
        this.$notify({
          text: "צריך להתחבר בשביל בשביל המסלול נסיון",
          type: "success",
          duration: 5000,
        });
        return;
      }

      this.loading = true;
      this.orderResponse = await this.$store.dispatch("store/orderDemo", {
        subscription: this.currentSubscription?.name,
      });
      
      if(this.orderResponse) {
        await this.$store.dispatch('user/getProfile');
        this.$notify({
          text: "הזמנת הנסיון בוצעה בהצלחה! יכול לשחק עם זה עכשיו.",
          type: "success",
          duration: 7000,
        });
      }
      
      this.loading = false;
    },

    setSubscription(subscription: string) {
      console.log({subscription});
      
      this.form.subscription = subscription;
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
  width: 75%;

  .order-info {
    width: 40%;
    height: calc(40% - 16px);
    min-height: fit-content;

    @media only screen and (max-width: 600px) {
      width: 100%;
    }

    .order-info-content {
      width: calc(97% - 30px);
      height: calc(96% - 30px);
      min-height: fit-content;
      padding: 15px;
      position: relative;
      top: 2%;
      margin: auto;

      .title--large {
        font-size: 2.6em;
        margin-bottom: 10px;
      }

      p {
        margin-top: 30px;
      }

      .order-info-actions {
        margin-top: 10px;
      }
    }
  }

  .order-details {
    height: calc(40% - 40px);
    min-height: 225px;
    width: 20%;

    @media only screen and (max-width: 600px) {
      width: 100%;
      min-height: 250px;
      margin-top: 20px;
    }

    .separator {
      height: 2px;
      width: 100%;
      margin: auto;
      margin-top: 10px;
      opacity: 0.7;
    }
  }
}

@media only screen and (max-width: 600px) {
  .order-content {
    flex-wrap: wrap;
    width: 90%;

    > div {
      width: 100%;
    }
  }
}
</style>
