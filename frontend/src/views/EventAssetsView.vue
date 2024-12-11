<template>
  <div class="event-assets height--full display--flex direction--column justify--space-between">
    <div class="assets-top bg--white brs--medium padding--large display--flex justify--space-between">
      <div class="details display--flex direction--column justify--space-between">
        <div>
          <h1 class="title--large">סה"כ {{ totalAssets }} קבצים</h1>
          <strong class="text--pink">
            ממליצים להוריד ישר אחרי האירוע
          </strong>
        </div>
        <div>
          <small>
            <template v-if="isEventActive">
              <strong>
                שימו לב:
              </strong>
              בעוד <strong>{{ counter }}</strong> כל קבצי האירוע יימחקו ולא יהיה ניתן להוריד/לשחזר
            </template>
          </small>
          <br>

        </div>
      </div>
      <div class="actions width--fifth display--flex direction--column justify--space-between text--center">
        <div class="display--flex justify--space-between align--center">
          <MainCheckbox :disabled="loading" ref="downloadCheckbox" @onClick="toggleDownloadCheck()" title="לחצו בשביל לאפשר הורדה" />
          <div class="width--half">
            <BaseButton :loading="loading" :disabled="!canDownload || !pickedAssets.length" text="הורד קבצים" color="green"
              @onClick="downloadFiles()" />
          </div>
        </div>
        <div class="display--flex justify--space-between align--center">
          <MainCheckbox :disabled="loading" color="pink" ref="deleteCheckbox" @onClick="toggleDeleteCheck()"
            title="לחצו בשביל לאפשר מחיקה" />
          <div class="width--half">
            <BaseButton :loading="loading" :disabled="!canDelete || !pickedAssets.length" text="מחק קבצים" color="pink"
              @onClick="deleteFiles()" />
          </div>
        </div>
        <div class="display--flex align--center" :class="{
          'disabled': !canDelete && !canDownload
        }">
          <MainCheckbox :disabled="loading" ref="chooseAllCheckbox" title="לחצו בשביל לבחור את כולם" @onClick="toggleAllAssets()" />
          <small class="choose-all-text">
            בחר את כולם
          </small>
        </div>
      </div>
    </div>
    <div class="assets-content display--flex flex--wrap brs--medium">
      <div class="gallery-asset-wrapper padding--small" v-for="(asset, index) in assets" :key="index">
        <div class="gallery-asset position--relative bg--dark height--full width--full brs--medium">
          <div class="gallery-asset-chip padding--x-small brs--large" v-show="canDelete || canDownload">
            <MainCheckbox :disabled="loading" :ref="`asset-checkbox-${asset.id}`" :color="assetToggleColor"
              @onClick="addToPickedAssets(asset.id)" title="לחצו בשביל לסמן למחיקה" />
          </div>
          <template v-if="asset.type === 'image'">
            <img :src="asset.fullPath" alt="image" class="album-asset brs--medium" />
          </template>
          <template v-else-if="asset.type === 'video'">
            <video :src="asset.fullPath" class="album-asset" autoplay muted loop></video>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- TODO: Update the download to 2 parts: 1. create zip and store in S3. 2. download from s3 with a download link -->
<script lang="ts">
import { StatusEnum } from '@/helpers/enums';
import { IEventAsset } from '@/helpers/interfaces';
import { defineComponent } from 'vue';
import Time from '@/helpers/time';
import MainCheckbox from '@/components/library/inputs/MainCheckbox.vue';
import BaseButton from '@/components/library/buttons/BaseButton.vue';

export default defineComponent({
  name: 'EventAssetsView',

  components: {
    BaseButton,
    MainCheckbox,
  },

  data() {
    return {
      counter: '' as string,
      intervalId: null as ReturnType<typeof setInterval> | null,
      canDelete: false as boolean,
      canDownload: false as boolean,
      pickedAll: false as boolean,
      loading: false as boolean,
      pickedAssets: [] as number[],
    };
  },

  computed: {
    assetToggleColor(): string {
      return this.canDelete ? 'pink' : 'green';
    },

    totalAssets(): number {
      return this.$store.getters['event/getTotalAssets']
    },

    assets(): IEventAsset[] {
      return this.$store.getters['event/getAssets']
    },

    isEventActive(): boolean {
      return this.$store.getters['event/getEventStatus'] === StatusEnum.ACTIVE;
    },
  },

  methods: {
    updateCounter() {
      this.counter = Time.countdownTimer(this.$store.getters['event/getEventFinishTime']);
      if (this.counter === "00:00:00:00" && this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    },

    toggleDownloadCheck() {
      this.pickedAssets = [];
      this.canDownload = !this.canDownload;
      if (this.canDownload) {
        if (this.canDelete) {
          (this.$refs.deleteCheckbox as any).toggle()
        }
        this.canDelete = false;
      }

      if (this.pickedAll) {
        (this.$refs.chooseAllCheckbox as any).toggle()
      }
    },

    toggleDeleteCheck() {
      this.pickedAssets = [];
      this.canDelete = !this.canDelete;
      if (this.canDelete) {
        if (this.canDownload) {
          (this.$refs.downloadCheckbox as any).toggle()
        }
        this.canDownload = false;
      }

      if (this.pickedAll) {
        (this.$refs.chooseAllCheckbox as any).toggle()
      }
    },

    toggleAllAssets() {
      this.pickedAll = !this.pickedAll;

      this.assets.forEach(asset => {
        if (!this.pickedAssets.includes(asset.id)) {
          (this.$refs[`asset-checkbox-${asset.id}`] as any)[0].toggle()
          this.pickedAssets.push(asset.id)
        }

        if (!this.pickedAll) {
          if (this.pickedAssets.includes(asset.id)) {
            (this.$refs[`asset-checkbox-${asset.id}`] as any)[0].toggle()
          }
        }
      })

      if (!this.pickedAll) {
        this.pickedAssets = [];
      }
    },

    addToPickedAssets(assetId: number) {
      this.pickedAssets.push(assetId);
      (this.$refs[`asset-checkbox-${assetId}`] as any)[0].toggle()
    },

    async downloadFiles() {
      this.loading = true;
      const response = await this.$store.dispatch("event/downloadAssets", this.pickedAssets);
      this.loading = false;
      if (response) {
        this.pickedAssets = [];
      }
    },

    async deleteFiles() {
      this.loading = true;
      const response = await this.$store.dispatch("event/deleteAssets", this.pickedAssets);
      this.loading = false;
      if (response) {
        this.pickedAssets = [];
      }
    },
  },

  mounted() {
    this.updateCounter(); // Initialize the counter immediately
    this.intervalId = setInterval(this.updateCounter, 1000); // Refresh the counter every second
  },

  beforeUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
});
</script>

<style lang="scss" scoped>
.event-assets {


  .assets-top {
    height: 18%;
    min-height: 110px;
  }

  .assets-content {
    height: 72%;
    overflow-y: auto;

    .gallery-asset-wrapper {
      text-align: center;
      height: calc((70vw - 32px) / 5);
      width: calc(20% - 16px);
    }
  }

  .album-asset {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .gallery-asset-chip {
    background-color: #222d;
    position: absolute;
    right: 10px;
    top: 10px;
    z-index: 1;
  }

  .choose-all-text {
    margin-inline-start: 10px;
  }

  .actions {
    margin-inline-end: 10px;
  }
}
</style>
