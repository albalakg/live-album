<template>
  <div
    class="home"
    :class="{
      'event-image': event,
    }"
    :style="`background: url('${eventImage}') no-repeat center center;`"
  >
    <MediaEditorModal
      :open="editorOpen"
      :file="selectedFile"
      @cancel="closeEditor"
      @confirm="onEditorConfirm"
    />
    <template v-if="loading">
      <div class="text--center">
        <MainCube left="20%" top="15%" width="xxxx-large" height="large" />
        <MainCube
          color="pink"
          left="10%"
          top="10%"
          width="large"
          height="x-large"
        />
        <MainCube left="8%" top="3%" width="large" height="large" />
        <MainCube left="11%" top="6%" width="medium" height="medium" />
        <MainCube left="60%" top="3%" width="large" height="large" />
        <MainCube
          color="pink"
          left="63%"
          top="10%"
          width="medium"
          height="medium"
        />
        <MainCube
          color="pink"
          left="30%"
          top="73%"
          width="large"
          height="large"
        />
        <MainCube
          color="pink"
          left="33%"
          top="71%"
          width="large"
          height="medium"
        />
        <MainCube
          color="pink"
          left="72%"
          top="80%"
          width="xx-large"
          height="large"
        />
        <h1>
          רק רגע,<br />
          מסיים לטעון...
        </h1>
        <br />
        <span class="title--x-large text--pink"> SnapShare </span>
      </div>
    </template>
    <template v-else>
      <template v-if="canShow && event">
        <div class="overlay" v-if="displayDate || displayName"></div>
        <div
          class="content-wrapper height--full display--flex direction--column justify--space-between align-top"
        >
          <h1
            class="title text--white width--two-thirds margin--top-medium event-name"
          >
            <span v-if="displayName">
              {{ event.name }}
            </span>
            <!-- <br>Wedding 25.11.2024   -->
          </h1>

          <div class="display--flex align--end">
            <div>
              <button
                class="upload-button"
                :class="{ 'upload-button--uploading': isUploading }"
                :disabled="isUploading"
                @click="triggerFileUpload"
              >
                <span
                  class="upload-button-progress"
                  :style="{ width: `${uploadProgress}%` }"
                  aria-hidden="true"
                ></span>
                <span class="upload-button-text" v-if="isUploading">
                  מעלה... {{ uploadProgress }}%
                </span>
                <span class="upload-button-text" v-else>תעלו ותשתפו</span>
              </button>
              <router-link
                v-if="showAlbumPageLink"
                class="album-link-button"
                :to="albumPagePath"
              >
                צפו באלבום
              </router-link>
              <input
                type="file"
                ref="fileInput"
                :accept="acceptFileTypes"
                @change="handleFileChange"
                style="display: none"
              />
              <div :class="{ hidden: !showNotification }" class="notification">
                <span v-if="uploadSuccess"> הקובץ עלה בהצלחה </span>
                <span v-else>נכשל לעלות את הקובץ</span>
              </div>
              <h2 class="event-date text--white">
                <span
                  v-if="displayDate"
                  class="instrument-serif-regular title--large"
                >
                  {{ eventDate }}
                </span>
              </h2>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="upload-not-available text--center">
        <MainCube left="20%" top="15%" width="xxxx-large" height="large" />
        <MainCube
          color="pink"
          left="10%"
          top="10%"
          width="large"
          height="x-large"
        />
        <MainCube left="8%" top="3%" width="large" height="large" />
        <MainCube left="11%" top="6%" width="medium" height="medium" />
        <MainCube left="60%" top="3%" width="large" height="large" />
        <MainCube
          color="pink"
          left="63%"
          top="10%"
          width="medium"
          height="medium"
        />
        <MainCube
          color="pink"
          left="30%"
          top="73%"
          width="large"
          height="large"
        />
        <MainCube
          color="pink"
          left="33%"
          top="71%"
          width="large"
          height="medium"
        />
        <MainCube
          color="pink"
          left="72%"
          top="80%"
          width="xx-large"
          height="large"
        />
        <div class="not-available">
          <h1>מצטערים, אך האירוע אינו פעיל כרגע</h1>
          <br />
          <span class="title--x-large text--pink"> SnapShare </span>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { IUserInfo, IEvent } from "@/helpers/interfaces";
import { defineComponent, ref, computed } from "vue";
import { useStore } from "vuex";
import MainCube from "@/components/library/background/MainCube.vue";
import { StatusEnum } from "@/helpers/enums";
import Auth from "@/helpers/Auth";
import MediaEditorModal from "@/components/event/MediaEditorModal.vue";
import { notify } from "@kyvg/vue3-notification";
import { validateUploadFile } from "@/helpers/uploadValidation";

export default defineComponent({
  name: "EventUploadsView",

  components: {
    MainCube,
    MediaEditorModal,
  },

  setup() {
    const store = useStore();
    const fileInput = ref<HTMLInputElement | null>(null);

    const isUploading = ref(false);
    const uploadSuccess = ref(false);
    const uploadFailed = ref(false);
    const uploadProgress = ref(0);

    const showNotification = computed(
      () => uploadSuccess.value || uploadFailed.value,
    );

    const videoUploadEnabled = computed(() => {
      const event = store.getters["event/getEvent"] as IEvent | null;
      return event?.config?.video_upload_enabled ?? true;
    });

    const acceptFileTypes = computed(() =>
      videoUploadEnabled.value ? "image/*,video/*" : "image/*",
    );

    const triggerFileUpload = () => {
      if (fileInput.value) {
        fileInput.value.click();
      }
    };

    // const handleFileChange = async (event: Event) => {
    //   const target = event.target as HTMLInputElement;
    //   if (target.files && target.files[0]) {
    //     isUploading.value = true;
    //     uploadFailed.value = false;
    //     uploadSuccess.value = false;

    //     try {
    //       await store.dispatch("event/uploadFile", {
    //         file: target.files[0],
    //         isAuth: Auth.isLogged(),
    //       });
    //       uploadSuccess.value = true;
    //       setTimeout(() => {
    //         uploadSuccess.value = false;
    //       }, 5000);
    //     } catch (error: any) {
    //       console.error("Upload failed", error);
    //       uploadFailed.value = true;
    //       setTimeout(() => {
    //         uploadFailed.value = false;
    //       }, 5000);
    //     } finally {
    //       isUploading.value = false;
    //     }
    //   }
    // };

    // const handleFileChange = async (e: Event) => {
    //   const input = e.target as HTMLInputElement;
    //   const file = input.files?.[0];
    //   if (!file) return;

    //   // 1) אם זו תמונה - לפתוח עורך
    //   if (file.type.startsWith("image/")) {
    //     const editedBlob = await openImageEditorAndGetBlob(file); // מודאל אצלך
    //     const editedFile = new File(
    //       [editedBlob],
    //       `snapshare_${Date.now()}.png`,
    //       { type: "image/png" }
    //     );

    //     await uploadFile(editedFile);
    //     return;
    //   }

    //   // 2) וידאו - נפרט בהמשך
    //   await uploadFile(file);
    // };

    // async function uploadFile(file: File) {
    //   isUploading.value = true;
    //   uploadFailed.value = false;
    //   uploadSuccess.value = false;

    //   try {
    //     await store.dispatch("event/uploadFile", {
    //       file,
    //       isAuth: Auth.isLogged(),
    //     });
    //     uploadSuccess.value = true;
    //     setTimeout(() => (uploadSuccess.value = false), 5000);
    //   } catch (err) {
    //     uploadFailed.value = true;
    //     setTimeout(() => (uploadFailed.value = false), 5000);
    //   } finally {
    //     isUploading.value = false;
    //   }
    // }

    const editorOpen = ref(false);
    const selectedFile = ref<File | null>(null);

    const handleFileChange = async (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      // reset input כדי שאפשר יהיה לבחור שוב אותו קובץ
      target.value = "";

      const validation = validateUploadFile(file, {
        videoUploadEnabled: videoUploadEnabled.value,
      });
      if (!validation.valid) {
        notify({
          text: validation.error,
          type: "error",
          duration: 5000,
        });
        return;
      }

      // אם וידאו - מעלה רגיל (בלי עורך)
      if (file.type.startsWith("video/")) {
        await uploadOriginalOnly(file);
        return;
      }

      // אם תמונה - פותח עורך
      selectedFile.value = file;
      editorOpen.value = true;
    };

    const closeEditor = () => {
      editorOpen.value = false;
      selectedFile.value = null;
    };

    const updateUploadProgress = (event: ProgressEvent) => {
      if (!event.total) return;

      uploadProgress.value = Math.min(
        100,
        Math.round((event.loaded * 100) / event.total),
      );
    };

    const uploadFileWithProgress = async (file: File) => {
      isUploading.value = true;
      uploadFailed.value = false;
      uploadSuccess.value = false;
      uploadProgress.value = 0;

      try {
        await store.dispatch("event/uploadFile", {
          file,
          isAuth: Auth.isLogged(),
          onUploadProgress: updateUploadProgress,
        });

        uploadProgress.value = 100;
        uploadSuccess.value = true;
        setTimeout(() => (uploadSuccess.value = false), 5000);
      } catch (e) {
        uploadFailed.value = true;
        setTimeout(() => (uploadFailed.value = false), 5000);
      } finally {
        isUploading.value = false;
        setTimeout(() => {
          uploadProgress.value = 0;
        }, 300);
      }
    };

    const uploadOriginalOnly = uploadFileWithProgress;

    // תמונה ערוכה: מעלה קובץ אחד (התמונה הסופית מהעורך)
    const onEditorConfirm = async (payload: { file: File }) => {
      closeEditor();
      await uploadFileWithProgress(payload.file);
    };

    return {
      isUploading,
      uploadSuccess,
      uploadFailed,
      uploadProgress,
      showNotification,
      acceptFileTypes,
      triggerFileUpload,
      handleFileChange,
      fileInput,
      editorOpen,
      selectedFile,
      closeEditor,
      onEditorConfirm,
      // uploadFile,
    };
  },

  data() {
    return {
      loading: true as boolean,
    };
  },

  computed: {
    canShow(): boolean {
      if (this.loading) {
        return false;
      }

      if (this.event?.status === StatusEnum.IN_PROGRESS) {
        return true;
      }

      if (
        this.event?.status !== StatusEnum.IN_PROGRESS &&
        this.event?.user_id === this.user?.id
      ) {
        return true;
      }

      return false;
    },

    eventImage(): string {
      if (this.loading) {
        return "";
      }

      return this.canShow && this.displayImage
        ? this.$store.getters["event/getEventImage"]
        : "/assets/upload-default-image.png";
    },

    event(): IEvent | null {
      return this.$store.getters["event/getEvent"];
    },

    displayName(): boolean {
      return this.event?.config.preview_site_display_name ?? false;
    },

    displayImage(): boolean {
      return this.event?.config.preview_site_display_image ?? false;
    },

    displayDate(): boolean {
      return this.event?.config.preview_site_display_date ?? false;
    },

    showAlbumPageLink(): boolean {
      return this.event?.config?.preview_link_to_album_page_from_upload_page ?? false;
    },

    albumPagePath(): string {
      const eventPath = this.event?.path ?? this.$route.params.event_path;
      return `/event/open-gallery/${eventPath}`;
    },

    user(): IUserInfo | null {
      return this.$store.getters["user/getUser"];
    },

    eventDate(): string {
      return this.$store.getters["event/getEventDate"].replaceAll("/", ".");
    },
  },

  created() {
    this.getEventDetails();
  },

  methods: {
    async getEventDetails() {
      await this.$store.dispatch(
        "event/getEventBaseInfo",
        this.$route.params.event_path,
      );
      this.loading = false;
    },
  },
});
</script>

<style lang="scss">
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
  background-size: cover !important;
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

.event-name {
  margin-left: auto;
  margin-right: auto;
}

.event-date {
  margin-bottom: 20px;

  span {
    font-weight: 500;
  }
}

.upload-button {
  position: relative;
  overflow: hidden;
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

.upload-button-progress {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  width: 0;
  background: rgba(255, 255, 255, 0.28);
  transition: width 0.2s ease;
}

.upload-button-text {
  position: relative;
  z-index: 1;
}

.upload-button--uploading {
  background: linear-gradient(135deg, #e63e00, #b33000);
}

.upload-button:disabled {
  opacity: 0.9;
  cursor: not-allowed;
}

.upload-button:hover:enabled {
  background: linear-gradient(135deg, #e63e00, #b33000);
  box-shadow: 0 10px 25px rgba(230, 62, 0, 0.4);
  transform: translateY(-5px);
}

.album-link-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  padding: 8px 18px;
  width: fit-content;
  max-width: none;
  margin: 10px auto 0;
  border: 1px solid rgba(255, 255, 255, 0.75);
  border-radius: 50px;
  background: rgba(0, 0, 0, 0.2);
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  opacity: 0.9;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  font-family: system-ui, sans-serif;
}

.album-link-button:hover {
  background: rgba(255, 255, 255, 0.12);
  opacity: 1;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.24);
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

.not-available {
  position: absolute;
  bottom: 5%;
  left: 0;
  right: 0;
  margin: auto;
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

  .album-link-button {
    font-size: 1rem;
    padding: 10px 22px;
  }
}
</style>
