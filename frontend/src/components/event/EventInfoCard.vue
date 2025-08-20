<template>
  <div
    class="event-info brs--medium padding--medium bg--white display--flex direction--column justify--space-between"
  >
    <div>
      <div class="padding--x-small display--flex justify--space-between">
        <span class="text--dark title--small">סטטוס</span>
        <SubscriptionStatus :status="status" />
      </div>
      <template v-for="(item, index) in items" :key="index">
        <div v-if="item.isVisible" class="padding--x-small display--flex justify--space-between">
          <span class="text--dark title--small">{{ item.text }}</span>
          <span class="text--dark">{{ item.value }}</span>
        </div>
      </template>
    </div>
    <small class="padding--x-small">
      <strong>שימו לב:</strong>
      האירוע אינו יתחיל עד שתעדכנו את הסטטוס למוכן, במידה ומוכן והגיע הזמן תחילת
      האירוע, יהפוך לסטטוס פעיל אוטומטית.
      <br />
      ניתן לעדכן את תאריך האירוע רק בסטטוס ממתין.
    </small>
    <div class="display--flex justify--end">
      <div class="width--half width--full-mobile">
        <MainButton
          v-if="isReady"
          :loading="loading"
          color="pink"
          text="החזר להמתנה"
          @onClick="submit()"
        />
        <MainButton
          v-else
          :disabled="!canUpdateToReady"
          :loading="loading"
          text="האירוע מוכן"
          @onClick="submit()"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainButton from "../library/buttons/MainButton.vue";
import SubscriptionStatus from "../profile/SubscriptionStatus.vue";
import Time from "@/helpers/time";

export default defineComponent({
  name: "EventInfoCard",

  components: {
    MainButton,
    SubscriptionStatus,
  },

  data() {
    return {
      startsAtCounter: "" as string,
      loading: false as boolean,
      intervalId: null as ReturnType<typeof setInterval> | null,
    };
  },

  computed: {
    items(): Array<any> {
      return [
        {
          text: "שעון לאירוע",
          value: this.startsAtCounter, // Updated to use the reactive counter
          isVisible: true,
        },
        {
          text: "סיום האירוע",
          value: this.$store.getters["event/getEventFinishTime"],
          isVisible: this.isReady || this.isPending,
        },
        {
          text: "תאריך מחיקת הקבצים",
          value: this.disabledTime,
          isVisible: !this.isReady && !this.isPending,
        },
        {
          text: 'סה"כ קבצים',
          value: this.$store.getters["event/getTotalAssets"],
          isVisible: true,
        },
      ];
    },

    status(): number {
      return this.$store.getters["event/getEventStatus"];
    },

    isReady(): boolean {
      return this.$store.getters["event/isEventReady"];
    },

    canUpdateToReady(): boolean {
      return this.isPending && this.$store.getters["event/getEventName"] && this.$store.getters["event/getEventDate"];
    },

    isPending(): boolean {
      return this.$store.getters["event/isEventRending"];
    },

    isInProgress(): boolean {
      return this.$store.getters["event/isEventInProgress"];
    },

    eventStartTime(): string {
      return this.$store.getters["event/getEventStartTime"];
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

  watch: {
    eventStartTime() {
      if(!this.intervalId) {
        this.intervalId = setInterval(this.updateCounter, 1000);
      }
    }
  },

  methods: {
    async submit() {
      this.loading = true;
      this.isReady
        ? await this.$store.dispatch("event/setPending")
        : await this.$store.dispatch("event/setReady");
      this.loading = false;
    },

    updateCounter() {
      if (!this.eventStartTime) {
        return;
      }

      this.startsAtCounter = Time.countdownTimer(this.eventStartTime);
      if (this.startsAtCounter === "00:00:00:00" && this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
        if(this.isReady) {
          this.checkForStatusUpdate();
        }
      }
    },

    clearCounter() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
    },
    
    async checkForStatusUpdate() {
      for(let index = 0; index < 3; index++) {
        if(this.isInProgress) {
          return;
        }

        await this.$store.dispatch('user/getProfile');
      }
    }
  },

  mounted() {
    this.updateCounter(); // Initialize the counter immediately
    this.intervalId = setInterval(this.updateCounter, 1000); // Refresh the counter every second
  },

  beforeUnmount() {
    this.clearCounter();
  },
});
</script>

<style lang="scss" scoped>
.event-info {
  min-height: fit-content;
}
</style>
