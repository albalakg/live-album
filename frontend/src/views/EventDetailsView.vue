<template>
  <div class="event-details display--flex justify--space-between height--full width--full">
    <div class="event-right padding--medium">
      <EventDetailsForm />
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
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EventDetailsView',

  components: {
    EventDetailsForm,
    EventInfoCard,
    EventSubscriptionCard,
  },

  data() {
    return {
      
    };
  },

  methods: {

  }
});
</script>

<style lang="scss" scoped>
.event-details {
  
  .event-right {
    width: 30%;
    min-height: 40%;
  }
  
  .event-left {
    width: 40%;
    min-height: 40%;

    & > div {
      height: calc(50% - 40px);
    }
  }
}

</style>
