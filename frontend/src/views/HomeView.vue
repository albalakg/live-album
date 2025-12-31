<template>
  <div class="home">
    <!-- Header Section -->
    <section
      class="home-page-section header-section width--page-size margin--auto"
      id="header"
    >
      <h1 class="title--x-large text--center-mobile">
        ברוכים הבאים ל
        <strong class="text--pink">SnapShare</strong>
      </h1>
      <p>
        שתפו רגעים חיים באירוע שלכם!
        <br />
        האורחים מעלים את הרגעים שלהם בזמן אמת וכמובן אתכם
        <br />
        וכל מה שנשאר זה להנות מהחוויות והזכרונות
      </p>
      <br />
      <!-- <div class="width--corner width--full-mobile">
        <router-link v-if="canUpgradeSubscription" to="/order?subscription=premium">
          <MainButton animation text="שדרג את המסלול שלך" />
        </router-link>
        <router-link v-else-if="!hasActiveEvent" to="/order">
          <MainButton animation text="הזמן את האלבום החי שלך" />
        </router-link>
          <MainButton v-else disabled animation text="הזמן את האלבום החי שלך" />
      </div> -->
      <div class="width--corner width--full-mobile">
        <MainButton disabled animation text="הזמן את האלבום החי שלך (בקרוב)" />
      </div>
      <img
        class="header-image-gallery"
        src="/assets/home-gallery.png"
        alt="header-gallery-image"
      />
      <div
        class="social-media display--flex direction--column justify--space-between"
      >
        <div>
          <a
            href="https://www.facebook.com/share/1By1U5frDi/?mibextid=wwXIfr"
            target="_blank"
          >
            <img src="/assets/icons/facebook-icon.png" alt="facebook" />
          </a>
        </div>
        <div>
          <a
            href="https://www.instagram.com/snapshare_live?igsh=MXpudTBjMWhxeWw%3D&utm_source=qr"
            target="_blank"
          >
            <img src="/assets/icons/instagram-icon.png" alt="instagram" />
          </a>
        </div>
      </div>

      <div>
        <MainCube top="-22%" left="0" width="large" height="large" />
        <MainCube
          top="-15%"
          left="3.5%"
          color="pink"
          width="large"
          height="large"
        />
        <MainCube top="-28%" left="25%" width="large" height="large" />
        <MainCube top="45%" right="25%" width="xxx-large" height="large" />
        <MainCube
          top="50%"
          right="30%"
          color="pink"
          width="large"
          height="xx-large"
        />
        <MainCube
          top="52%"
          right="-5%"
          color="pink"
          width="large"
          height="large"
        />
        <MainCube top="58%" right="-8%" width="large" height="x-large" />
        <MainCube
          top="-7%"
          right="-12%"
          color="pink"
          width="large"
          height="x-large"
        />
        <MainCube top="-6%" right="0%" width="medium" height="medium" />
        <MainCube top="-4%" right="2%" width="small" height="small" />
      </div>
    </section>

    <Features />

    <HowItLooks />

    <Clients />

    <!-- Pricing Section -->
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
      <MainCube
        color="pink"
        left="75%"
        top="5%"
        width="medium"
        height="medium"
      />
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
        <template v-if="$bp.isMediumAndUp">
          <MainLine
            top="13%"
            left="0"
            color="white"
            height="small"
            width="full"
          />
          <MainLine
            top="15%"
            left="0"
            color="white"
            height="xx-large"
            width="full"
          />
          <MainLine
            top="28%"
            left="0"
            color="white"
            height="small"
            width="full"
          />
        </template>
        <template v-else>
          <MainLine
            top="6%"
            left="0"
            color="white"
            height="small"
            width="full"
          />
          <MainLine
            top="8%"
            left="0"
            color="white"
            height="xx-large"
            width="full"
          />
          <MainLine
            top="17.5%"
            left="0"
            color="white"
            height="small"
            width="full"
          />
        </template>
        <MainLine
          top="58%"
          left="0"
          color="white"
          height="medium"
          width="full"
        />
        <MainLine
          top="61%"
          left="0"
          color="white"
          height="large"
          width="full"
        />
        <MainLine
          top="66%"
          left="0"
          color="white"
          height="medium"
          width="full"
        />
        <MainLine
          top="69%"
          left="0"
          color="white"
          height="small"
          width="full"
        />
        <MainLine
          top="71%"
          left="0"
          color="white"
          height="medium"
          width="full"
        />
        <MainLine
          top="73.5%"
          left="0"
          color="white"
          height="large"
          width="full"
        />
        <MainLine
          top="78.5%"
          left="0"
          color="white"
          height="small"
          width="full"
        />
        <h2 class="text--pink title--x-large">המסלולים שלנו</h2>

        <div
          class="pricing-cards display--flex justify--space-between margin--auto"
        >
          <div
            class="pricing-card bg--white height--full shadow--small brs--medium"
          >
            <h3 class="text--dark title--medium">מסלול הבסיסי</h3>
            <p>המסלול הבסיסי מוגבל עד 300 קבצים</p>
            <p>הקבצים נמחקים לאחר 6 חודשים מתחילת האירוע</p>
            <div class="pricing-card-action">
              <h4 class="title--large">200</h4>
              <router-link
                v-if="!hasActiveEvent"
                to="/order?subscription=basic"
              >
                <MainButton animation text="הצטרפו עכשיו" size="x-small" />
              </router-link>
              <MainButton
                v-else
                disabled
                animation
                text="כבר יש לכם אירוע"
                size="x-small"
              />
            </div>
          </div>
          <div
            class="pricing-card premimum-card height--full shadow--small brs--medium"
          >
            <h3 class="text--dark title--medium">מסלול פרימיום</h3>

            <p>המסלול פרימיום אינו מוגבל בכמות קבצים</p>
            <p>הקבצים נמחקים לאחר 12 חודשים מתחילת האירוע</p>
            <div class="pricing-card-action">
              <h4 class="title--large">₪300</h4>
               <router-link v-if="canUpgradeSubscription" to="/order?subscription=premium">
                <MainButton animation text="שדרגו עכשיו" size="x-small" />
              </router-link>
              <router-link
                v-else-if="!hasActiveEvent"
                to="/order?subscription=premium"
              >
                <MainButton animation text="הצטרפו עכשיו" size="x-small" />
              </router-link>
              <MainButton
                v-else
                disabled
                animation
                text="כבר יש לכם אירוע"
                size="x-small"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Features from "@/components/home/features.vue";
import HowItLooks from "@/components/home/howItLooks.vue";
import Clients from "@/components/home/clients.vue";
import MainCube from "@/components/library/background/MainCube.vue";
import MainLine from "@/components/library/background/MainLine.vue";
import MainButton from "@/components/library/buttons/MainButton.vue";
import { StatusEnum, SubscriptionTypesEnum } from "@/helpers/enums";
import { IUserInfo } from "@/helpers/interfaces";
import { defineComponent } from "vue";

export default defineComponent({
  name: "HomeView",

  components: {
    MainButton,
    MainCube,
    MainLine,
    Features,
    HowItLooks,
    Clients,
  },

  computed: {
    user(): IUserInfo | null {
      return this.$store.getters["user/getUser"];
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

.header-section {
  h1 {
    margin-top: 10%;
    font-weight: 700;
    letter-spacing: 3px;

    @media only screen and (min-width: 600px) {
      strong {
        margin-inline-start: 20px;
      }
    }
  }

  p {
    font-size: 1.3em;
    letter-spacing: 0.8px;
  }

  .header-image-gallery {
    width: 35%;
    position: absolute;
    left: 0;
    bottom: 25%;
    border-radius: 60px 120px 60px 120px;
    z-index: 2;

    @media only screen and (max-width: 600px) {
      width: 92%;
      bottom: -55px;
      right: 0;
      margin: auto;
    }
  }

  .social-media {
    position: absolute;
    height: 100px;
    right: -70px;
    top: 20%;

    img {
      width: 35px;
    }
  }

  .cube {
    position: absolute;
  }

  .cube-1 {
    left: 0;
    top: -180px;
  }

  .cube-2 {
    left: 50px;
    top: -130px;
  }
}


.pricing-section-content {
  width: 55%;
  height: 75vh;
  background-color: #79ae6088;
  margin: auto;
  position: relative;
  border-radius: 50px 350px;
  text-align: center;
  z-index: 3;

  h2 {
    position: relative;
    top: 15%;
  }

  .pricing-cards {
    margin-top: 14%;
    height: 60%;
    min-height: fit-content;
    width: 80%;

    .premimum-card {
      background: linear-gradient(white, white, #dbce8b);
    }

    .pricing-card {
      width: calc(35% - 60px);
      padding: 0 30px;
      position: relative;

      h3 {
        margin-top: 10%;
        margin-bottom: 15%;
      }

      p {
        margin-bottom: 10px;
      }

      h4 {
        margin-bottom: 5%;
      }

      .pricing-card-action {
        position: absolute;
        bottom: 20px;
        width: 80%;
      }
    }
  }
}

ul li {
  margin-bottom: 10px;
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
}
</style>
