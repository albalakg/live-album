<template>
  <div class="order-callback">
    <MainCube color="pink" left="10%" top="15%" width="large" height="xx-large" />
    <MainCube left="12%" top="12%" width="xx-large" height="large" />
    <MainCube right="12%" top="12%" width="large" height="large" />
    <MainCube right="15%" top="15%" width="medium" height="medium" />
    <MainCube right="15%" top="55%" width="xx-large" height="medium" />
    <MainCube color="pink" left="24%" top="85%" width="large" height="xx-large" />
    <MainCube color="pink" left="13%" top="88%" width="xxxx-large" height="medium" />
    <MainCube left="12%" top="85%" width="medium" height="medium" />
    <MainCube left="22%" top="82%" width="large" height="large" />
    <MainCube right="0%" top="67%" width="small" height="large" />

    <div class="order-callback-content margin--auto shadow--small brs--x-large display--flex justify--center flex--wrap bg--white">
      <div class="order-callback-details width--two-thirds height--full bg--green display--flex align--center justify--center width--full-mobile">
        <div class="text--center">
          <h3 class="text--white title--x-large">
            ההזמנה בוצעה בהצלחה
          </h3>
          <h4 class="title--large text--dark">
            תודה שבחרתם אותנו באירוע שלכם
          </h4>
          <br>
          <p class="title--small text--dark callback-status">
            <template v-if="isLoading">
              <span class="loading-dot"></span>
              <span>מאשרים את ההזמנה ומכינים את האירוע שלך, זה יכול לקחת כמה רגעים...</span>
            </template>
            <template v-else>
              <span>
                <router-link to="/event">לחץ כאן</router-link>, למעבר לניהול האירוע שלך
              </span>
            </template>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MainCube from '@/components/library/background/MainCube.vue';
import { IEvent } from '@/helpers/interfaces';
import { defineComponent } from 'vue';

const POLLING_INTERVAL_MS = 7000;
const MAX_POLLING_ATTEMPTS = 50;

export default defineComponent({
  name: 'OrderCallbackSuccess',

  components: {
    MainCube,
  },

  data() {
    return {
      isLoading: true as boolean,
      pollTimer: null as number | null,
      attempts: 0 as number,
    };
  },

  computed: {
    event(): IEvent | null {
      return this.$store.getters['event/getEvent'];
    },

    hasActiveEvent(): boolean {
      return this.$store.getters['event/hasActiveEvent'];
    },
  },

  created() {
    this.checkProfile();
  },

  beforeUnmount() {
    this.stopPolling();
  },

  methods: {
    isEventValid(event: IEvent | null): boolean {
      return Boolean(event && event.id && event.path);
    },

    async checkProfile(): Promise<void> {
      this.attempts += 1;
      try {
        await this.$store.dispatch('user/getProfile');
      } catch (err) {
        console.warn('getProfile failed during polling:', err);
      }

      if (this.isEventValid(this.event) && this.hasActiveEvent) {
        this.isLoading = false;
        this.stopPolling();
        return;
      }

      if (this.attempts >= MAX_POLLING_ATTEMPTS) {
        this.isLoading = false;
        this.stopPolling();
        return;
      }

      this.scheduleNextPoll();
    },

    scheduleNextPoll(): void {
      this.stopPolling();
      this.pollTimer = window.setTimeout(() => {
        this.checkProfile();
      }, POLLING_INTERVAL_MS);
    },

    stopPolling(): void {
      if (this.pollTimer !== null) {
        window.clearTimeout(this.pollTimer);
        this.pollTimer = null;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.order-callback {
  height: 100vh;
  min-height: fit-content;
}

.order-callback-content {
  min-height: fit-content;
  position: relative;
  z-index: 2;
  width: 55%;
  height: 65%;
  margin-top: 5%;

  @media only screen and (max-width: 600px) {
    width: 90%;   
  }

  .order-callback-form {
    padding: 5% 8%;
    width: 34%;
    height: 80%;
    min-height: fit-content;

    @media only screen and (max-width: 600px) {
      height: 350px;
      width: 90%;   
      padding-bottom: 15%;
    }
  }
  
  .order-callback-details {
    height: auto;

    @media only screen and (max-width: 600px) {
      height: 330px;
    }
  }

  a {
    font-weight: 700;
    text-decoration: underline;
  }
}

.callback-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 24px;
}

.loading-dot {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: #222;
  animation: callback-spin 0.8s linear infinite;
}

@keyframes callback-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
