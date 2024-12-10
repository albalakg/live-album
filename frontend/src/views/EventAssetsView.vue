<template>
  <div class="event-assets height--full display--flex direction--column justify--space-between">
    <div class="assets-top bg--white brs--medium padding--large display--flex justify--space-between">
      <div class="details display--flex direction--column justify--space-between">
        <div>
          <h1 class="title--large">סה"כ {{ totalAssets }} קבצים</h1>
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
          <strong class="text--pink">
            ממליצים להוריד ישר אחרי האירוע
          </strong>
        </div>
      </div>
      <div class="actions width--fifth display--flex direction--column justify--space-between text--center">
        <div>
          <MainButton text="הורד הכל" />
        </div>
        <div>
          <strong class="text--pink title--medium pointer">מחק הכל</strong>
        </div>
      </div>
    </div>
    <div class="assets-content display--flex flex--wrap brs--medium">
      <div class="gallery-asset-wrapper padding--small" v-for="(item, index) in 20" :key="index">
        <div class="gallery-asset bg--dark height--full width--full brs--medium">

        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MainButton from '@/components/library/buttons/MainButton.vue';
import { StatusEnum } from '@/helpers/enums';
import { defineComponent } from 'vue';
import Time from '@/helpers/time';

export default defineComponent({
  name: 'EventAssetsView',

  components: {
    MainButton,
  },

  data() {
    return {
      counter: '' as string,
      intervalId: null as ReturnType<typeof setInterval> | null,
    };
  },

  computed: {
    totalAssets(): number {
      return this.$store.getters['event/getTotalAssets']
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
    }
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
  }

  .assets-content {
    height: 72%;
    overflow-y: auto;

    .gallery-asset-wrapper {
      height: calc((70vw - 32px) / 5);
      width: calc(20% - 16px);
    }
  }
}
</style>
