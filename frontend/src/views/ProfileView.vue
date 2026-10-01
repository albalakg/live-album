<template>
  <div class="profile" v-if="user">
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
      class="profile-content bg--gray margin--auto brs--medium padding--medium shadow--small display--flex justify--space-between flex--wrap">
      <div class="profile-right padding--small-mobile padding--large display--flex justify--space-between direction--column">
        <div>
          <EditProfile :user="user" />
        </div>
        <br>
        <br>
        <DeleteUser v-if="!$bp.isMobile" />
      </div>
      <div class="profile-left padding--small-mobile padding--large display--flex direction--column justify--space-between">
        <ProfileSubscriptionCard />
        <ChangePassword />
      </div>
      <div v-if="$bp.isMobile" class="padding--large-mobile">
        <DeleteUser />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MainCube from '@/components/library/background/MainCube.vue';
import ChangePassword from '@/components/profile/ChangePassword.vue';
import DeleteUser from '@/components/profile/DeleteUser.vue';
import EditProfile from '@/components/profile/EditProfile.vue';
import ProfileSubscriptionCard from '@/components/profile/ProfileSubscriptionCard.vue';
import { IUserInfo } from '@/helpers/interfaces';
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ProfileView',

  components: {
    MainCube,
    DeleteUser,
    ProfileSubscriptionCard,
    EditProfile,
    ChangePassword,
  },

  data() {
    return {
      email: '' as string,
      form: {
        first_name: '' as string,
        last_name: '' as string,
      }
    };
  },

  computed: {
    user(): IUserInfo {
      return this.$store.getters['user/getUser'];
    }
  },
  
  methods: {
    editProfile() {
      // 
    }
  }
});
</script>

<style lang="scss" scoped>
.profile {
  height: 100vh;
  min-height: fit-content;
  z-index: 10;
  position: relative;

  @media only screen and (max-width: 600px) { 
    margin: 30px 0;
  }

  .profile-content {
    height: calc(94% - 100px);
    width: 65%;
    min-height: 500px;
    position: relative;
    top: 0%;
    min-height: fit-content;

    @media only screen and (max-width: 600px) { 
      width: 90%;
      margin: auto;
    }

    .profile-right {
      width: 35%;
      min-height: fit-content;

      @media only screen and (max-width: 600px) { 
        width: 100%;
      }
    }

    .profile-left {
      width: 40%;
      height: 100%;
      min-height: fit-content;
      
      @media only screen and (max-width: 600px) { 
        width: 100%;
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
