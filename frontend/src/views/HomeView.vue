<template>
  <div class="home">
    <!-- Header Section -->
    <section class="home-page-section header-section width--page-size margin--auto" id="header">
      <h1 class="title--x-large">
        {{ t('home.header.welcome') }}
        <strong class="text--pink">SnapShare</strong>
      </h1>
      <p>
        {{ t('home.header.subtitle') }}
        <br>
        {{ t('home.header.description') }}
      </p>
      <br>
      <br>
      <div class="width--corner">
        <router-link to="/order">
          <MainButton animation :text="t('home.header.orderButton')" />
        </router-link>
      </div>
      <img class="header-image-gallery" src="/assets/home-gallery.png" alt="header-gallery-image">
      <div class="social-media display--flex direction--column justify--space-between">
        <div>
          <router-link to="/" target="_blank">
            <img src="/assets/icons/facebook-icon.png" alt="facebook">
          </router-link>
        </div>
        <div>
          <router-link to="/" target="_blank">
            <img src="/assets/icons/instagram-icon.png" alt="instagram">
          </router-link>
        </div>
      </div>

      <div>
        <MainCube top="-22%" left="0" width="large" height="large" />
        <MainCube top="-15%" left="3.5%" color="pink" width="large" height="large" />
        <MainCube top="-28%" left="25%" width="large" height="large" />
        <MainCube top="45%" right="25%" width="xxx-large" height="large" />
        <MainCube top="50%" right="30%" color="pink" width="large" height="xx-large" />
        <MainCube top="52%" right="-5%" color="pink" width="large" height="large" />
        <MainCube top="58%" right="-8%" width="large" height="x-large" />
        <MainCube top="-7%" right="-12%" color="pink" width="large" height="x-large" />
        <MainCube top="-6%" right="0%" width="medium" height="medium" />
        <MainCube top="-4%" right="2%" width="small" height="small" />
      </div>
    </section>

    <!-- What You Get Section -->
    <section class="home-page-section what-you-get-section bg--pink" id="features">
      <MainLine top="0" left="25%" color="white" width="x-large" />
      <MainLine top="0" left="calc(25% + 45px)" color="white" width="small" />
      <MainLine top="0" left="calc(25% + 56px)" color="white" width="medium" />
      <MainLine top="0" left="calc(25% + 71px)" color="white" width="xxx-large" />
      <MainLine top="0" left="calc(25% + 166px)" color="white" width="medium" />
      <MainLine top="0" left="calc(25% + 181px)" color="white" width="small" />
      <MainLine top="0" left="calc(25% + 192px)" color="white" width="x-large" />
      <div class="home-page-content width--page-size margin--auto height--full">
        <h2 class="text--white title--x-large">
          {{ t('home.features.title') }}
        </h2>

        <div class="display--flex justify--space-between height--full width--page-size margin--auto">
          <div class="what-you-get-card width--corner brs--medium shadow--small padding--large">
            <h3 class="text--white title--large">
              {{ t('home.features.liveAlbum.title') }}
            </h3>
            <p>{{ t('home.features.liveAlbum.description') }}</p>
          </div>
          <div class="what-you-get-card width--corner brs--medium shadow--small padding--large">
            <h3 class="text--white title--large">
              {{ t('home.features.downloads.title') }}
            </h3>
            <p>{{ t('home.features.downloads.description') }}</p>
          </div>
          <div class="what-you-get-card width--corner brs--medium shadow--small padding--large">
            <h3 class="text--white title--large">
              {{ t('home.features.qrCard.title') }}
            </h3>
            <p>{{ t('home.features.qrCard.description') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="home-page-section how-it-work-section" id="how-it-works">
      <MainCube left="10%" top="10%" width="xxxx-large" height="large" />
      <MainCube color="pink" left="29%" top="4%" width="large" height="large" />
      <MainCube left="25%" bottom="10%" width="large" height="large" />
      <MainCube left="55%" bottom="10%" width="xxxx-large" height="large" />
      <MainCube color="pink" left="75%" bottom="7%" width="large" height="xx-large" />
      <div class="how-it-work-content text--center">
        <h2 class="text--green title--x-large">
          {{ t('home.howItWorks.title') }}
        </h2>
        <p class="title--medium text--dark">
          {{ t('home.howItWorks.description') }}
        </p>
        <div class="width--corner margin--auto">
          <router-link to="/signup">
            <MainButton animation color="pink" :text="t('home.howItWorks.joinButton')" size="small" />
          </router-link>
        </div>
      </div>
    </section>

    <!-- How It Looks Section -->
    <section class="home-page-section how-it-looks-section" id="how-it-looks">
      <MainCube left="20%" top="15%" width="xxxx-large" height="large" />
      <MainCube color="pink" left="10%" top="10%" width="large" height="x-large" />
      <MainCube left="8%" top="3%" width="large" height="large" />
      <MainCube left="11%" top="6%" width="medium" height="medium" />
      <MainCube left="60%" top="3%" width="large" height="large" />
      <MainCube color="pink" left="63%" top="10%" width="medium" height="medium" />
      <MainCube color="pink" left="30%" top="73%" width="large" height="large" />
      <MainCube color="pink" left="33%" top="71%" width="large" height="medium" />
      <MainCube color="pink" left="72%" top="80%" width="xx-large" height="large" />
      <MainCube rounded color="pink" left="30%" top="10%" width="xxxxx-large" height="xxxxx-large" />
      <MainCube rounded color="pink" left="45%" top="30%" width="xxxxx-large" height="xxxxx-large" />
      <div class="how-it-looks-content width--page-size margin--auto">
        <h2 class="text--pink title--x-large">
          {{ t('home.howItLooks.title') }}
        </h2>
      </div>

      <DisplayAssetCard width="small" height="x-large" right="5%" :title="t('home.howItLooks.uploadPage')" />
      <DisplayAssetCard width="medium" height="large" bottom="10%" right="27%" :title="t('home.howItLooks.eventManagement')" />
      <DisplayAssetCard width="large" height="x-large" bottom="35%" right="60%" :title="t('home.howItLooks.liveAlbum')" />
    </section>

    <!-- Pricing Section -->
    <section class="home-page-section pricing-section" id="pricing">
      <MainCube left="5%" top="5%" width="large" height="large" />
      <MainCube left="8%" top="8%" width="medium" height="medium" />
      <MainCube color="pink" left="7%" top="12%" width="medium" height="x-large" />
      <MainCube color="pink" left="75%" top="5%" width="medium" height="medium" />
      <MainCube color="pink" left="85%" top="55%" width="xx-large" height="large" />
      <MainCube left="82%" top="59%" width="xx-large" height="large" />
      <MainCube left="12%" top="79%" width="large" height="xx-large" />
      <MainCube color="pink" left="6%" top="77%" width="xxx-large" height="medium" />
      <div class="pricing-section-content">
        <MainLine top="13%" left="0" color="white" height="small" width="full" />
        <MainLine top="15%" left="0" color="white" height="xx-large" width="full" />
        <MainLine top="28%" left="0" color="white" height="small" width="full" />
        <MainLine top="58%" left="0" color="white" height="medium" width="full" />
        <MainLine top="61%" left="0" color="white" height="large" width="full" />
        <MainLine top="66%" left="0" color="white" height="medium" width="full" />
        <MainLine top="69%" left="0" color="white" height="small" width="full" />
        <MainLine top="71%" left="0" color="white" height="medium" width="full" />
        <MainLine top="73.5%" left="0" color="white" height="large" width="full" />
        <MainLine top="78.5%" left="0" color="white" height="small" width="full" />
        <h2 class="text--pink title--x-large">
          {{ t('home.pricing.title') }}
        </h2>

        <div class="pricing-cards display--flex justify--space-between margin--auto">
          <div class="pricing-card bg--white height--full shadow--small brs--medium">
            <h3 class="text--dark title--medium">
              {{ t('home.pricing.basic.title') }}
            </h3>
            <p>{{ t('home.pricing.basic.limit') }}</p>
            <p>{{ t('home.pricing.basic.deletion') }}</p>
            <div class="pricing-card-action">
              <h4 class="title--large">
                {{ t('home.pricing.basic.price') }}
              </h4>
              <router-link to="/order?subscription=basic">
                <MainButton animation :text="t('home.pricing.basic.button')" size="x-small" />
              </router-link>
            </div>
          </div>
          <div class="pricing-card bg--white height--full shadow--small brs--medium">
            <h3 class="text--dark title--medium">
              {{ t('home.pricing.premium.title') }}
            </h3>
            <p>{{ t('home.pricing.premium.limit') }}</p>
            <p>{{ t('home.pricing.premium.deletion') }}</p>
            <div class="pricing-card-action">
              <h4 class="title--large">
                {{ t('home.pricing.premium.price') }}
              </h4>
              <router-link to="/order?subscription=premium">
                <MainButton animation :text="t('home.pricing.premium.button')" size="x-small" />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import MainCube from '../components/library/background/MainCube.vue';
import MainLine from '../components/library/background/MainLine.vue';
import MainButton from '../components/library/buttons/MainButton.vue';
import DisplayAssetCard from '../components/library/cards/DisplayAssetCard.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    MainButton,
    MainCube,
    MainLine,
    DisplayAssetCard,
  },
  setup() {
    const { t } = useI18n();
    return { t };
  }
});
</script>

<style lang="scss" scoped>
.home {
  direction: inherit;
}

.home-page-section {
  height: calc(100vh - 99px);
  position: relative;
  direction: inherit;

  h2 {
    font-weight: 700;
  }
}

.header-section {
  h1 {
    margin-top: 10%;
    font-weight: 700;
    letter-spacing: 3px;

    strong {
      margin-inline-start: 20px;
    }
  }

  p {
    font-size: 1.3em;
    letter-spacing: 2px;
  }

  .header-image-gallery {
    width: 35%;
    position: absolute;
    inset-inline-start: 0;
    bottom: 25%;
    border-radius: 60px 120px 60px 120px;
  }

  .social-media {
    position: absolute;
    height: 100px;
    inset-inline-end: -70px;
    top: 20%;

    img {
      width: 35px;
    }
  }
}

.what-you-get-section {
  padding-top: 6%;
  height: calc(94vh - 99px);

  .home-page-content {
    z-index: 10;
    position: relative;
    direction: inherit;

    h2 {
      margin-bottom: 5%;
    }

    p {
      font-weight: 500;
    }

    .what-you-get-card {
      background-color: #F2A6A8CC;
      height: 50%;
      text-align: center;

      h3 {
        margin-bottom: 10%;
      }
    }
  }
}

.how-it-work-content {
  background-color: #79AE6044;
  height: 70%;
  width: 100%;
  top: 15%;
  position: relative;
  direction: inherit;

  h2 {
    padding-top: 3%;
    margin-bottom: 2%;
  }

  p {
    margin-bottom: 2%;
  }
}

.how-it-looks-content {
  position: relative;
  direction: inherit;

  h2 {
    padding-top: 8%;
    margin-bottom: 2%;
  }

  p {
    margin-bottom: 2%;
  }
}

.pricing-section-content {
  width: 55%;
  height: 70vh;
  background-color: #79AE6088;
  margin: auto;
  top: 10%;
  position: relative;
  border-radius: 50px 350px;
  text-align: center;
  direction: inherit;

  h2 {
    position: relative;
    top: 15%;
  }

  .pricing-cards {
    margin-top: 14%;
    height: 60%;
    min-height: fit-content;
    width: 80%;
    direction: inherit;

    .pricing-card {
      width: calc(35% - 60px);
      padding: 0 30px;
      position: relative;
      direction: inherit;

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
</style>
