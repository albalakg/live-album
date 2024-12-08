<template>
  <div class="event-details display--flex justify--space-between height--full width--full">
    <div class="event-right padding--medium display--flex direction--column justify--space-between">
      <EventDetailsForm />
      <div class="display--flex justify--space-between align--center">
        <div class="display--flex align--center">
          <div class="icon-wrapper">
            <MainIcon clickable icon="content_copy" />
          </div>
          <small>לחצו להעתקת הקישור</small>
        </div>
        <div>
          <router-link :to="`/event/uploads/${eventPath}`">
            <BaseButton text="צפייה בעמוד העלאות" />
          </router-link>
        </div>
      </div>
    </div>
    <div class="event-left padding--medium brs--medium display--flex direction--column justify--space-between">
      <EventInfoCard />
      <EventSubscriptionCard />
    </div>
  </div>
</template>

<script lang="ts">
import EventDetailsForm from '@/components/event/EventDetailsForm.vue';
import EventInfoCard from '@/components/event/EventInfoCard.vue';
import EventSubscriptionCard from '@/components/event/EventSubscriptionCard.vue';
import BaseButton from '@/components/library/buttons/BaseButton.vue';
import MainIcon from '@/components/library/general/MainIcon.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EventDetailsView',

  components: {
    EventDetailsForm,
    EventInfoCard,
    EventSubscriptionCard,
    BaseButton,
    MainIcon,
  },

  computed: {
    eventPath(): string {
      return this.$store.getters['event/getEventPath']
    }
  },

  methods: {

  }
});
</script>

<style lang="scss" scoped>
.event-details {

  .icon-wrapper {
    width: 30px;
    height: 30px;
  }

  .event-right {
    width: 30%;
    min-height: 40%;
  }

  .event-left {
    width: 40%;
    min-height: 40%;

    &>div {
      height: calc(50% - 40px);
    }
  }
}
</style>
