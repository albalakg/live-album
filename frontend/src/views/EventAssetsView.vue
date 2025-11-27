<template>
  <div
    class="event-assets height--full display--flex direction--column justify--space-between"
  >
    <div
      class="assets-top bg--white brs--medium padding--large display--flex justify--space-between flex--wrap-mobile"
    >
      <div
        class="details display--flex direction--column justify--space-between width--full-mobile"
      >
        <div>
          <h1 class="title--large">
            {{ totalAssets }} קבצים
            <small>נבחרו {{ totalManagedAssetsIds }} קבצים</small>
          </h1>
          <strong class="text--pink"> ממליצים להוריד ישר אחרי האירוע </strong>
          <div class="collapse-container">
            <strong class="pointer" @click="toggleCollapse">
              איך מורידים
              <MainIcon icon="info" size="1.1em" />
            </strong>

            <!-- Content section with smooth transition -->
            <transition name="collapse">
              <div v-if="isOpen">
                <slot>
                  <small>
                    בוחרים את הקבצים שרוצים להורדה, ולוחצים על הכפתור "הכנת
                    קבצים להורדה".
                    <br />
                    לאחר מכן, אנחנו נכין את כל הקבצים להורדה ותוך כמה דקות יהיה
                    מוכן.
                    <br />
                    כאשר מוכן, יופיע כאן למטה, כפתור להורדת הקובץ (זיפ שמכיל את
                    כל התמונות והסרטונים).
                    <br />
                    מוזמנים לחכות בינתיים או שתחזרו לעיסוקכם ואנחנו כבר נדאג
                    לעדכן אתכם.
                  </small>
                </slot>
              </div>
            </transition>
          </div>
          <UploadMedia />
        </div>
        <div>
          <small>
            <template v-if="isEventActive">
              <strong> שימו לב: </strong>
              בעוד <strong>{{ counter }}</strong> כל קבצי האירוע יימחקו ולא יהיה
              ניתן להוריד/לשחזר
            </template>
          </small>
          <br />
        </div>
      </div>
      <div
        class="actions display--flex direction--column align--center justify--space-between width--full-mobile"
      >
        <div
          class="width--full display--flex align--center justify--space-between"
        >
          <div class="action-select-wrapper">
            <MainSelect
              :options="[
                { label: 'הורדת קבצים', value: 'download' },
                { label: 'הסתרת קבצים', value: 'hide' },
                { label: 'מחיקת קבצים', value: 'delete' },
              ]"
              v-model="action"
              ref="actionSelect"
            />
          </div>
          <MainCheckbox
            :disabled="loading || !mode"
            ref="downloadCheckbox"
            @onClick="toggleAllAssets()"
            title="לחצו בשביל לבחור את כולם"
            :value="pickedAll"
          />
        </div>
        <div class="download-button-wrapper width--full">
          <BaseButton
            :loading="loading"
            :disabled="!canSubmit"
            text="בצע פעולה"
            @onClick="submit()"
          />
        </div>
        <div class="download-button-wrapper width--full">
          <a
            :href="downloadProcess.fullPath"
            :download="processFileName"
            v-if="isDownloadProcessFinished"
          >
            <BaseButton :loading="loading" text="הורדת הקבצים" color="green" />
          </a>
        </div>
      </div>
    </div>
    <div class="assets-content display--flex flex--wrap brs--medium">
      <template v-for="(asset, index) in assets" :key="index">
        <EventAssetCard :loading="loading" :assetIndex="index" :asset="asset" />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { EventAssetsManagementModesEnum, StatusEnum } from "@/helpers/enums";
import { IEventAsset, IEventDownloadAssetsProcess } from "@/helpers/interfaces";
import { defineComponent } from "vue";
import Time from "@/helpers/time";
import MainCheckbox from "@/components/library/inputs/MainCheckbox.vue";
import BaseButton from "@/components/library/buttons/BaseButton.vue";
import EventAssetCard from "@/components/event/EventAssetCard.vue";
import { EventAssetsManagementModesType } from "@/helpers/types";
import MainIcon from "@/components/library/general/MainIcon.vue";
import UploadMedia from "@/components/library/inputs/UploadMedia.vue";
import MainSelect from "@/components/library/inputs/MainSelect.vue";

export default defineComponent({
  name: "EventAssetsView",

  components: {
    BaseButton,
    MainCheckbox,
    EventAssetCard,
    MainIcon,
    UploadMedia,
    MainSelect,
  },

  data() {
    return {
      counter: "" as string,
      action: "" as string,
      intervalId: null as ReturnType<typeof setInterval> | null,
      processPollingId: undefined as ReturnType<typeof setInterval> | undefined,
      pickedAll: false as boolean,
      loading: false as boolean,
      isOpen: false as boolean,
      pollingCounter: 0 as number,
    };
  },

  created() {
    this.$store.dispatch("event/getEventAssets");
  },

  watch: {
    totalManagedAssetsIds() {
      this.pickedAll = this.totalManagedAssetsIds === this.totalAssets;
    },

    action() {
      this.$store.dispatch("event/setModeForAssetsManagement", this.action);
    },

    mode() {
      if (!this.mode) {
        this.pickedAll = false;
        this.$store.dispatch("event/toggleAllAssetsInAssetsManagement", false);
      }
    },

    isDownloadProcessFinished() {
      if (this.isDownloadProcessFinished && this.processPollingId) {
        this.stopPollingProcessStatus();
      }
    },
  },

  computed: {
    assetToggleColor(): string {
      return this.canDelete ? "pink" : "green";
    },

    totalAssets(): number {
      return this.$store.getters["event/getTotalAssets"];
    },

    assets(): IEventAsset[] {
      return this.$store.getters["event/getAssets"];
    },

    isEventActive(): boolean {
      return this.$store.getters["event/getEventStatus"] === StatusEnum.ACTIVE;
    },

    canSubmit(): boolean {
      return (
        this.$store.getters["event/getTotalManagedAssetsIds"] && this.action
      );
    },

    mode(): EventAssetsManagementModesType | null {
      return this.$store.getters["event/getManagedAssetsMode"];
    },

    isDownloadMode(): boolean {
      return this.mode === EventAssetsManagementModesEnum.DOWNLOAD;
    },

    isDeleteMode(): boolean {
      return this.mode === EventAssetsManagementModesEnum.DELETE;
    },

    totalManagedAssetsIds(): number {
      return this.$store.getters["event/getTotalManagedAssetsIds"];
    },

    managedAssetsIds(): number[] {
      return this.$store.getters["event/getManagedAssetsIds"];
    },

    downloadProcess(): IEventDownloadAssetsProcess {
      return this.$store.getters["event/getDownloadAssetsProcess"];
    },

    isDownloadProcessFinished(): boolean {
      return (
        this.downloadProcess?.status === StatusEnum.ACTIVE &&
        !!this.downloadProcess?.fullPath
      );
    },

    isDownloadProcessPreparing(): boolean {
      return (
        this.downloadProcess &&
        [StatusEnum.PENDING, StatusEnum.IN_PROGRESS].includes(
          this.downloadProcess.status
        )
      );
    },

    canDownload(): boolean {
      return this.isDownloadMode && this.managedAssetsIds.length > 0;
    },

    canDelete(): boolean {
      return this.isDeleteMode && this.managedAssetsIds.length > 0;
    },

    processFileName(): string {
      return this.$store.getters["event/getEventProcessFileName"];
    },

    disabledTime(): string {
      return this.$store.getters["event/getEventFinishTime"]
        ? Time.addDays(
            this.$store.getters["event/getEventFinishTime"],
            this.$store.getters["user/getSubscriptionFilesStorageTime"]
          )
        : "";
    },
  },

  methods: {
    toggleCollapse() {
      this.isOpen = !this.isOpen;
    },

    updateCounter() {
      this.counter = Time.countdownTimer(this.disabledTime);
      if (this.counter === "00:00:00:00" && this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },

    async submit() {
      console.log(
        { action: this.action, mode: this.mode },
        EventAssetsManagementModesEnum.DOWNLOAD
      );

      switch (this.mode) {
        case EventAssetsManagementModesEnum.DOWNLOAD:
          await this.startDownloadFilesProcess();
          break;
        case EventAssetsManagementModesEnum.DELETE:
          await this.deleteAssets();
          break;
        case EventAssetsManagementModesEnum.HIDE:
          await this.hideAssets();
          break;
        default:
          break;
      }
    },

    toggleAllAssets(val = null as boolean | null) {
      this.pickedAll = val !== null ? val : !this.pickedAll;
      this.$store.dispatch(
        "event/toggleAllAssetsInAssetsManagement",
        this.pickedAll
      );
    },

    startPollingProcessStatus() {
      this.processPollingId = setInterval(async () => {
        console.log("this.pollingCounter", this.pollingCounter);

        if (this.pollingCounter >= 30) {
          // Stop after 30 attempts (7.5 minutes)
          this.stopPollingProcessStatus();
          return;
        }
        await this.$store.dispatch("event/getDownloadAssetsProcess");
        this.pollingCounter++;
      }, 15000); // Poll every 15 seconds
    },

    stopPollingProcessStatus() {
      if (this.processPollingId) {
        clearInterval(this.processPollingId);
      }
    },

    async startDownloadFilesProcess() {
      this.loading = true;
      const success = await this.$store.dispatch("event/downloadAssets");
      if (success) {
        this.resetPolling();
        this.startPollingProcessStatus();
      }
      this.loading = false;
    },

    async deleteAssets() {
      this.loading = true;
      await this.$store.dispatch("event/deleteAssets");
      this.loading = false;
    },

    async hideAssets() {
      this.loading = true;
      await this.$store.dispatch("event/hideAssets");
      this.loading = false;
    },

    resetPolling() {
      this.startPollingProcessStatus();
      this.pollingCounter = 0;
    },
  },

  mounted() {
    this.updateCounter();
    this.intervalId = setInterval(this.updateCounter, 1000);
    // If there's an active download process, start polling
    if (this.isDownloadProcessPreparing) {
      this.startPollingProcessStatus();
    }
    this.action = this.mode as string;

    if (this.action) {
      this.$refs.actionSelect &&
        (this.$refs.actionSelect as any).setValue(this.action);
    }
  },

  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.stopPollingProcessStatus();
  },
});
</script>

<style lang="scss" scoped>
.event-assets {
  h1 small {
    font-size: 0.5em;
  }

  .assets-top {
    min-height: fit-content;
  }

  .assets-content {
    margin-top: 20px;
    height: 72%;
    max-height: 75vh;
    overflow-y: auto;
  }

  .choose-all-text {
    margin-inline-start: 10px;
  }

  .download-button-wrapper {
    margin: 10px 0;
  }

  .actions {
    margin-inline-end: 10px;
    max-height: fit-content;
    width: 30%;

    .action-select-wrapper {
      width: 100%;
      margin-left: 10px;
    }

    @media only screen and (max-width: 600px) {
      width: 100%;
      margin-top: 10px;
      margin-inline-end: 0;

      .action-button-wrapper {
        margin-right: 10px;
      }
    }
  }
}

.collapse-container {
  border-radius: 4px;
  overflow: hidden;
  max-width: 500px;
  margin-bottom: 5px;
}

.collapse-button {
  width: 100%;
  background-color: #f7f7f7;
  color: #333;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  outline: none;
  text-align: center;
}

.collapse-button:hover {
  background-color: #eaeaea;
}

/* Smooth transition */
.collapse-enter-active,
.collapse-leave-active {
  transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 200px;
  /* Adjust as needed for content */
  opacity: 1;
}
</style>
