<template>
  <div class="profile">
    <!-- <MainLine color="light-green" top="250px" width="full" height="x-large" />
    <MainLine color="green" top="300px" width="full" height="large" />
    <MainLine color="light-green" top="335px" width="full" height="medium" />
    <MainLine color="green" top="350px" width="full" height="xx-large" />
    <MainLine color="light-green" top="430px" width="full" height="medium" />
    <MainLine color="green" top="455px" width="full" height="large" />
    <MainLine color="light-green" top="485px" width="full" height="x-large" />
 -->

    <MainCube color="pink" left="27%" top="72%" width="small" height="small" />
    <MainCube color="pink" left="23%" top="73%" width="medium" height="medium" />
    <MainCube color="pink" left="26%" top="76%" width="large" height="large" />
    <MainCube color="green" left="30%" top="13%" width="large" height="xxx-large" />
    <MainCube color="pink" left="10%" top="8%" width="medium" height="x-large" />
    <MainCube color="green" left="11%" top="13%" width="medium" height="medium" />
    <MainCube color="green" left="5%" top="10%" width="large" height="large" />
    <MainCube color="green" right="0" top="22%" width="xx-large" height="medium" />
    <MainCube color="pink" right="32%" top="80%" width="xx-large" height="large" />
    <MainCube color="green" right="31%" top="84%" width="medium" height="xxx-large" />

    <div
      class="profile-content bg--gray margin--auto brs--medium padding--medium shadow--small display--flex justify--space-between">
      <div class="profile-right padding--large display--flex justify--space-between direction--column">
        <div>
          <h2 class="title--large">עריכת פרטי משתמש</h2>
          <div class="profile-form">
            <MainInput size="medium" title="כתובת מייל" />
            <br>
            <MainInput size="medium" title="שם פרטי" />
            <br>
            <MainInput size="medium" title="שם משפחה" />
            <br>
            <MainButton class="form-button" text="עדכן משתמש" />
          </div>
        </div>
        <br>
        <br>
        <div>
          <span>
            <strong>שימו לב:</strong> מחיקת המשתמש תמחק את כל פרטי המשתמש
            והאירוע כולל קבצי האלבום, לא יהיה ניתן לשחזור.
          </span>
          <br>
          <br>
          <div class="display--flex justify--end">
            <div class="width--third">
              <BaseButton textColor="white" color="pink" text="מחיקת משתמש" />
            </div>
          </div>
        </div>
      </div>
      <div class="profile-left padding--large display--flex direction--column justify--space-between">
        <div
          class="general-info brs--medium padding--x-large bg--white display--flex direction--column justify--space-between">
          <div class="padding--x-small display--flex justify--space-between">
            <span class="text--dark title--small">סטטוס</span>
            <span class="text--green title--small">פעיל</span>
          </div>
          <div class="padding--x-small display--flex justify--space-between" v-for="(item, index) in items"
            :key="index">
            <span class="text--dark title--small">{{ item.text }}</span>
            <span class="text--dark">{{ item.value }}</span>
          </div>
          <div class="display--flex justify--end">
            <div class="width--half">
              <MainButton color="pink" text="שדרג מנוי" />
            </div>
          </div>
        </div>
        <div class="change-password bg--white brs--medium padding--x-large">
          <div class="display--flex justify--space-between align--center">
            <div class="width--half">
              <h3 class="title--medium">
                החלפת סיסמה
              </h3>
            </div>
            <div class="width--half text--left">
              <MainIcon icon="visibility" />
            </div>
          </div>
          <div>
            <br>
            <MainInput size="medium" type="password" title="סיסמה ישנה" />
            <br>
            <MainInput size="medium" type="password" title="סיסמה חדשה" />
            <br>
            <MainButton class="form-button" text="איפוס סיסמה" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MainCube from '@/components/library/background/MainCube.vue';
import MainLine from '@/components/library/background/MainLine.vue';
import BaseButton from '@/components/library/buttons/BaseButton.vue';
import MainButton from '@/components/library/buttons/MainButton.vue';
import MainIcon from '@/components/library/general/MainIcon.vue';
import MainInput from '@/components/library/inputs/MainInput.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ProfileView',

  components: {
    MainCube,
    // MainLine,
    MainInput,
    BaseButton,
    MainButton,
    MainIcon,
  },

  data() {
    return {
    };
  },

  computed: {
    items(): Array<any> {
      return [
        {
          text: 'פרטי מנוי',
          value: 'מנוי בסיסי',
        },
        {
          text: 'תאריך רכישה',
          value: '20/11/2024',
        },
      ];
    }
  },

  methods: {

  }
});
</script>

<style lang="scss" scoped>
.profile {
  height: 100vh;

  .profile-content {
    height: calc(94% - 100px);
    width: 65%;
    min-height: 500px;
    position: relative;
    top: 0%;
    min-height: fit-content;

    .profile-right {
      width: 35%;
      min-height: fit-content;
    }
    
    .profile-left {
      width: 40%;
      height: 100%;
      min-height: fit-content;
      
      .general-info {
        height: calc(40% - 80px);
        margin-bottom: 20px;
      }
      
      .change-password {
        min-height: fit-content;
        height: calc(55% - 80px);
      }
    }

    .profile-form {
      position: relative;
      z-index: 1;
      min-height: fit-content;
      height: calc(100% - 80px);
      margin-top: 20px;

    }
    
    .form-button {
      margin-top: 15px;
    }
  }
}
</style>
