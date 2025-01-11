<template>
  <div class="home">

    <!-- Header Section -->
    <section class="home-page-section header-section width--page-size margin--auto" id="header">
      <h1 class="title--x-large text--center-mobile">
        ברוכים הבאים ל
        <strong class="text--pink">SnapShare</strong>
      </h1>
      <p>
        שתפו רגעים חיים באירוע שלכם!
        <br>
        האורחים מעלים את הרגעים שלהם בזמן אמת
        <br>
        וכל מה שנשאר זה להנות מהחוויות והזכרונות
      </p>
      <br>
      <div class="width--corner width--full-mobile">
        <router-link to="/order">
          <MainButton animation text="הזמן עכשיו את האלבום שלך" />
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
      <MainLine :opacity="'0.7'" top="0" left="25%" color="white" width="x-large" />
      <MainLine :opacity="'0.7'" top="0" left="calc(25% + 45px)" color="white" width="small" />
      <MainLine :opacity="'0.7'" top="0" left="calc(25% + 56px)" color="white" width="medium" />
      <MainLine :opacity="'0.7'" top="0" left="calc(25% + 71px)" color="white" width="xxx-large" />
      <MainLine :opacity="'0.7'" top="0" left="calc(25% + 166px)" color="white" width="medium" />
      <MainLine :opacity="'0.7'" top="0" left="calc(25% + 181px)" color="white" width="small" />
      <MainLine :opacity="'0.7'" top="0" left="calc(25% + 192px)" color="white" width="x-large" />
      <div class="home-page-content width--page-size margin--auto height--full">
        <h2 class="text--dark title--x-large text--center-mobile">
          מה מקבלים אתם שואלים?
        </h2>

        <div class="display--flex justify--space-between height--full width--page-size margin--auto flex--wrap-mobile">
          <div class="what-you-get-card width--corner width--full-mobile brs--medium shadow--small padding--large">
            <h3 class="text--white title--large">
              אלבום דיגיטלי חי
              בזמן האירוע
            </h3>
            <p>
              מרגע שהאירוע מתחיל ניתן יהיה לצפות
              באלבום האירוע ולהקרין אותו לכל האורחים.
              <br>
              האלבום יהיה נגיש עד 24 שעות לאחר
              תחילת האירוע.
              <br>
              האלבום רץ על הקבצים שהועלו בסדר אקראי לפי סבבים, ומתאפס ברגע שנגמר.
              <br>
              כאשר מתווספים קבצים
              חדשים הם נכנסים ישירות לסבב הנוכחי.
            </p>
          </div>
          <div class="what-you-get-card width--corner width--full-mobile brs--medium shadow--small padding--large">
            <h3 class="text--white title--large">
              כל קבצי האלבום
              להורדה וצבירת זכרונות
            </h3>
            <p>
              כל התמונות והסרטונים נשמרים במערכת וניתנים להורדה בכל רגע נתון כל עוד האירוע פעיל.
              <br>
              לאחר מספר ימים מאז
              תחילת האירוע, האירוע ייסגר ועם זה יימחקו כל קבצי האירוע.
              <br>
              לא יהיה ניתן לשחזר לאחר שנמחקו.
            </p>
          </div>
          <div class="what-you-get-card width--corner width--full-mobile brs--medium shadow--small padding--large">
            <h3 class="text--white title--large">
              כרטיס הזמנה עם QR
              המוביל לעמוד ייחודי
            </h3>
            <p>
              כל אירוע מקבל קישור ייחודי לעמוד של האירוע שבו יהיה ניתן לאורחים לעלות את התמונות והסרטונים.
              <br>
              אנחנו מספקים בשביל זה כרטיס מעוצב עם QR, שאותו האורחים יוכלו לסרוק בקלות ולהגיע ישירות לעמוד ולשתף את
              הרגעים שלהם איתכם באירוע.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- TODO: Add last decorations -->
    <!-- How It Works Section -->
    <section class="home-page-section how-it-work-section" id="how-it-works">
      <MainCube left="10%" top="10%" width="xxxx-large" height="large" />
      <MainCube color="pink" left="29%" top="4%" width="large" height="large" />
      <MainCube left="25%" bottom="10%" width="large" height="large" />
      <MainCube left="55%" bottom="10%" width="xxxx-large" height="large" />
      <MainCube color="pink" left="75%" bottom="7%" width="large" height="xx-large" />
      <div class="how-it-work-content text--center display--flex justify--center align--center">
        <div>
          <h2 class="text--green title--x-large">
            אז איך זה בעצם עובד?
          </h2>
          <p class="title--medium text--dark">
            נרשמים, מזמינים ועורכים את האירוע שלכם.
            <br>
            תוך מספר דקות והאירוע שלכם מוכן.
            <br>
            ברגע שהאירוע מתחיל, האירוע מופעל אוטומטית, מה שמאפשר צפייה
            <br>
            באלבום והעלאת קבצים לאורחים. לאחר 24 שעות האירוע נחשב שהסתיים אך עדיין זמין לצפייה אישית ולהורדת הקבצים.
            <br>
            לאחר
            מספר ימים בהתאם למסלול, האירוע נסגר ואיתו נמחקים הקבצים.
          </p>
          <div class="width--corner width--two-thirds-mobile margin--auto">
            <router-link to="/signup">
              <MainButton animation color="pink" text="הצטרפו עכשיו" size="small" />
            </router-link>
          </div>
        </div>
      </div>
    </section>


    <!-- How It Looks Section -->
    <section style="display: none" class="home-page-section how-it-looks-section" id="how-it-looks">
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
      <!-- <MainCube left="55%" bottom="10%" width="xxxx-large" height="large" /> -->
      <!-- <MainCube color="pink" left="75%" bottom="7%" width="large" height="xx-large" /> -->
      <div class="how-it-looks-content width--page-size margin--auto">
        <h2 class="text--pink title--x-large">
          בואו נראה איך זה נראה
        </h2>
      </div>

      <!-- <div class="height--full width--full"> -->
      <template v-if="$bp.isMediumAndUp">
        <DisplayAssetCard width="small" height="x-large" right="5%" title="עמוד העלאת קבצים" />
        <DisplayAssetCard width="medium" height="large" bottom="10%" right="27%" title="ניהול האירוע" />
        <DisplayAssetCard width="large" height="x-large" bottom="35%" right="60%" title="האלבום החי" />
      </template>
      <template v-else>
        <DisplayAssetCard width="x-large" height="x-large" title="עמוד העלאת קבצים" />
        <DisplayAssetCard height="x-large" title="ניהול האירוע" />
        <DisplayAssetCard height="x-large" title="האלבום החי" />
      </template>
      <!-- </div> -->
    </section>

    <!-- Pricing Section -->
    <section class="home-page-section pricing-section display--flex align--center" id="pricing">
      <MainCube left="5%" top="5%" width="large" height="large" />
      <MainCube left="8%" top="8%" width="medium" height="medium" />
      <MainCube color="pink" left="7%" top="12%" width="medium" height="x-large" />
      <MainCube color="pink" left="75%" top="5%" width="medium" height="medium" />
      <MainCube color="pink" left="85%" top="55%" width="xx-large" height="large" />
      <MainCube left="82%" top="59%" width="xx-large" height="large" />
      <MainCube left="12%" top="79%" width="large" height="xx-large" />
      <MainCube color="pink" left="6%" top="77%" width="xxx-large" height="medium" />
      <div class="pricing-section-content">
        <template v-if="$bp.isMediumAndUp">
          <MainLine top="13%" left="0" color="white" height="small" width="full" />
          <MainLine top="15%" left="0" color="white" height="xx-large" width="full" />
          <MainLine top="28%" left="0" color="white" height="small" width="full" />
        </template>
        <template v-else>
          <MainLine top="6%" left="0" color="white" height="small" width="full" />
          <MainLine top="8%" left="0" color="white" height="xx-large" width="full" />
          <MainLine top="17.5%" left="0" color="white" height="small" width="full" />
        </template>
        <MainLine top="58%" left="0" color="white" height="medium" width="full" />
        <MainLine top="61%" left="0" color="white" height="large" width="full" />
        <MainLine top="66%" left="0" color="white" height="medium" width="full" />
        <MainLine top="69%" left="0" color="white" height="small" width="full" />
        <MainLine top="71%" left="0" color="white" height="medium" width="full" />
        <MainLine top="73.5%" left="0" color="white" height="large" width="full" />
        <MainLine top="78.5%" left="0" color="white" height="small" width="full" />
        <h2 class="text--pink title--x-large">
          המסלולים שלנו
        </h2>

        <div class="pricing-cards display--flex justify--space-between margin--auto">
          <div class="pricing-card bg--white height--full shadow--small brs--medium">
            <h3 class="text--dark title--medium">
              מסלול הבסיסי
            </h3>
            <p>
              המסלול הבסיסי מוגבל עד 300 קבצים
            </p>
            <p>
              הקבצים נמחקים 14 יום מתחילת האירוע
            </p>
            <div class="pricing-card-action">
              <h4 class="title--large">
                ₪120
              </h4>
              <router-link to="/order?subscription=basic">
                <MainButton animation text="הצטרפו עכשיו" size="x-small" />
              </router-link>
            </div>
          </div>
          <div class="pricing-card premimum-card height--full shadow--small brs--medium">
            <h3 class="text--dark title--medium">
              מסלול פרימיום
            </h3>

            <p>
              המסלול פרימיום אינו מוגבל בכמות קבצים
            </p>
            <p>
              הקבצים נמחקים 30 יום מתחילת האירוע
            </p>
            <div class="pricing-card-action">
              <h4 class="title--large">
                ₪170
              </h4>
              <router-link to="/order?subscription=premium">
                <MainButton animation text="הצטרפו עכשיו" size="x-small" />
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import MainCube from '@/components/library/background/MainCube.vue';
import MainLine from '@/components/library/background/MainLine.vue';
import MainButton from '@/components/library/buttons/MainButton.vue';
import DisplayAssetCard from '@/components/library/cards/DisplayAssetCard.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'HomeView',

  components: {
    MainButton,
    MainCube,
    MainLine,
    DisplayAssetCard,
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
    letter-spacing: 2px;
  }

  .header-image-gallery {
    width: 35%;
    position: absolute;
    left: 0;
    bottom: 25%;
    border-radius: 60px 120px 60px 120px;
    z-index: 2;

    @media only screen and (max-width: 600px) {
      width: 95%;
      bottom: 10px;
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

.what-you-get-section {
  padding-top: 6%;
  height: fit-content;
  min-height: calc(94vh - 99px);
  margin-top: 50px;

  @media only screen and (max-width: 600px) {
    padding: 10px 0;

    .what-you-get-card {
      margin: 10px 0;
    }
  }

  .home-page-content {
    z-index: 10;
    position: relative;

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
  height: 85vh;
  width: calc(100% - 20px);
  position: relative;
  padding: 0 10px;

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
  height: 75vh;
  background-color: #79AE6088;
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
