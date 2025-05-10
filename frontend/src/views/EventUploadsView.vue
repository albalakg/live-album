<template>

  <div class="home" :class="{
    'event-image': event
  }" :style="`background: url('${eventImage}') no-repeat center center`">
    <template v-if="loading">
      <div class="text--center">
        <MainCube left="20%" top="15%" width="xxxx-large" height="large" />
        <MainCube color="pink" left="10%" top="10%" width="large" height="x-large" />
        <MainCube left="8%" top="3%" width="large" height="large" />
        <MainCube left="11%" top="6%" width="medium" height="medium" />
        <MainCube left="60%" top="3%" width="large" height="large" />
        <MainCube color="pink" left="63%" top="10%" width="medium" height="medium" />
        <MainCube color="pink" left="30%" top="73%" width="large" height="large" />
        <MainCube color="pink" left="33%" top="71%" width="large" height="medium" />
        <MainCube color="pink" left="72%" top="80%" width="xx-large" height="large" />
        <h1>
          טוען את העמוד...
        </h1>
        <br>
        <span class="title--x-large text--pink">
          SnapShare
        </span>
      </div>
    </template>
    <template v-else>
      <template v-if="canShow && event">
        <div class="overlay"></div>
        <div class="content-wrapper height--full display--flex direction--column justify--space-between">
          <h1 class="title text--white">
            {{
              event.name
            }}
            <!-- <br>Wedding 25.11.2024   -->
          </h1>

          <div class="display--flex align--end">
            <div>
              <button class="upload-button" :disabled="isUploading" @click="triggerFileUpload">
                <span v-if="isUploading">מעלה...</span>
                <span v-else>תעלו ותשתפו</span>
              </button>
              <input type="file" ref="fileInput" accept="image/*,video/*" @change="handleFileChange"
                style="display:none;" />
              <div :class="{ 'hidden': !showNotification }" class="notification">
                <span v-if="uploadSuccess">הקובץ עלה בהצלחה!</span>
                <span v-else>נכשל לעלות את הקובץ</span>
              </div>
              <h2 class="event-date text--white">
                {{
                  eventDate
                }}
              </h2>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="upload-not-available text--center">
        <MainCube left="20%" top="15%" width="xxxx-large" height="large" />
        <MainCube color="pink" left="10%" top="10%" width="large" height="x-large" />
        <MainCube left="8%" top="3%" width="large" height="large" />
        <MainCube left="11%" top="6%" width="medium" height="medium" />
        <MainCube left="60%" top="3%" width="large" height="large" />
        <MainCube color="pink" left="63%" top="10%" width="medium" height="medium" />
        <MainCube color="pink" left="30%" top="73%" width="large" height="large" />
        <MainCube color="pink" left="33%" top="71%" width="large" height="medium" />
        <MainCube color="pink" left="72%" top="80%" width="xx-large" height="large" />
        <div>
          <h1>
            מצטערים, אך האירוע אינו פעיל כרגע
          </h1>
          <br>
          <span class="title--x-large text--pink">
            SnapShare
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { IUserInfo, IEvent } from '@/helpers/interfaces';
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'vuex';
import MainCube from '@/components/library/background/MainCube.vue';
import { StatusEnum } from "@/helpers/enums";
import Auth from '@/helpers/Auth';

export default defineComponent({
  name: 'EventUploadsView',

  components: {
    MainCube,
  },

  setup() {
    const store = useStore();
    const fileInput = ref<HTMLInputElement | null>(null);

    const isUploading = ref(false);
    const uploadSuccess = ref(false);
    const uploadFailed = ref(false);

    const showNotification = computed(() => uploadSuccess.value || uploadFailed.value);

    const triggerFileUpload = () => {
      if (fileInput.value) {
        fileInput.value.click();
      }
    };

    const handleFileChange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        isUploading.value = true;
        uploadFailed.value = false;
        uploadSuccess.value = false;

        try {
          await store.dispatch("event/uploadFile", {file: target.files[0], isAuth: Auth.isLogged()});
          uploadSuccess.value = true;
          setTimeout(() => {
            uploadSuccess.value = false;
          }, 5000);
        } catch (error: any) {
          console.error('Upload failed', error);
          uploadFailed.value = true;
          setTimeout(() => {
            uploadFailed.value = false;
          }, 5000);
        } finally {
          isUploading.value = false;
        }
      }
    };

    return {
      isUploading,
      uploadSuccess,
      uploadFailed,
      showNotification,
      triggerFileUpload,
      handleFileChange,
      fileInput,
    };
  },

  data() {
    return {
      loading: true as boolean,
    }
  },

  computed: {
    canShow(): boolean {
      if(this.loading) {
        return false;
      }

      if(this.event?.status === StatusEnum.IN_PROGRESS) {
        return true;
      }
      
      if(this.event?.status !== StatusEnum.IN_PROGRESS && this.event?.user_id === this.user?.id) {
        return true;
      }

      return false
    },

    eventImage(): string {
      return this.canShow ? this.imagePath : ''
    },

    event(): IEvent | null {
      return this.$store.getters["event/getEvent"];
    },

    user(): IUserInfo | null {
      return this.$store.getters["user/getUser"];
    },

    imagePath(): string {
      return process.env.VUE_APP_STORAGE_BASE_URL + "/" + this.event?.image;
    },

    eventDate(): string {
      return this.$store.getters["event/getEventDate"];
    },
  },

  created() {
    this.getEventDetails();
  },

  methods: {
    async getEventDetails() {
      await this.$store.dispatch("event/getEventBaseInfo", this.$route.params.event_path)
      this.loading = false;
    }
  }
});
</script>


<style lang="scss">
.upload-not-available {}

.home {
  position: absolute;
  z-index: 1000;
  top: 0;
  right: 0;
  left: 0;
  height: 100dvh;
  width: 100vw;
  max-width: 500px;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  direction: rtl;
}

.event-image {
  background-size: cover;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.content-wrapper {
  text-align: center;
  max-width: 600px;
  width: 100%;
  z-index: 2;
}

.title {
  // position: absolute;
  // left: 0;
  // right: 0;
  // margin: auto;
  // top: 10px;
  // margin-bottom: 30px;
  font-size: 2.5rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.6);
}

// .event-date {
//   position: absolute;
//   bottom: 10px;
//   left: 0;
//   right: 0;
//   margin: auto;
// }

.upload-button {
  font-size: 2rem;
  padding: 25px 50px;
  width: calc(100% - 40px);
  max-width: 400px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #ff7f50, #ff4500);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(255, 69, 0, 0.3);
  transition: all 0.3s ease;
  font-family: system-ui, sans-serif;
  margin: 0 20px;
}

.upload-button:disabled {
  opacity: .9;
  cursor: not-allowed;
}

.upload-button:hover:enabled {
  background: linear-gradient(135deg, #e63e00, #b33000);
  box-shadow: 0 10px 25px rgba(230, 62, 0, 0.4);
  transform: translateY(-5px);
}

.notification {
  font-family: serif;
  font-size: 1.5rem;
  width: calc(100% - 70px);
  margin: 0 20px;
  color: #fff;
  margin-top: 15px;
  margin-bottom: 10px;
  padding: 10px 15px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: opacity 0.3s ease;
}

span {
  font-family: system-ui, sans-serif;
  color: #fff;
}

.hidden {
  opacity: 0;
}

@media (min-width: 768px) {
  .home {
    background-position: center;
    background-size: contain;
  }

  .title {
    font-size: 4rem;
  }

  .upload-button {
    font-size: 2.2rem;
    padding: 30px 60px;
  }
}
</style>
