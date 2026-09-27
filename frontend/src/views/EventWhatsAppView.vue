<template>

  <div class="event-whatsapp">

    <header class="page-header bg--white brs--medium padding--large margin--bottom-medium">

      <h1 class="title--large">WhatsApp</h1>

      <p class="page-desc">

        שלחו עד 3 הודעות לאורחי האירוע — כתבו מראש, תזמנו, ועקבו אחר הסטטוס

      </p>

    </header>



    <WhatsAppSendPanel :reset-key="resetKey" @sent="onSent" />

    <WhatsAppGuestPanel @guests-updated="onGuestsUpdated" />

    <WhatsAppHistoryPanel />

  </div>

</template>



<script lang="ts">

import { defineComponent } from "vue";

import WhatsAppGuestPanel from "@/components/event/whatsapp/WhatsAppGuestPanel.vue";

import WhatsAppSendPanel from "@/components/event/whatsapp/WhatsAppSendPanel.vue";

import WhatsAppHistoryPanel from "@/components/event/whatsapp/WhatsAppHistoryPanel.vue";



export default defineComponent({

  name: "EventWhatsAppView",



  components: {

    WhatsAppGuestPanel,

    WhatsAppSendPanel,

    WhatsAppHistoryPanel,

  },



  data() {

    return {

      resetKey: 0,

    };

  },



  mounted() {

    this.loadData();

  },



  methods: {

    loadData() {

      Promise.all([

        this.$store.dispatch("whatsapp/fetchGuests"),

        this.$store.dispatch("whatsapp/fetchQuota"),

        this.$store.dispatch("whatsapp/fetchCampaigns"),

      ]);

    },



    onGuestsUpdated() {
      this.resetKey += 1;
      this.$store.dispatch("whatsapp/fetchGuests");
    },



    onSent() {

      this.$store.dispatch("whatsapp/fetchCampaigns");

      this.$store.dispatch("whatsapp/fetchQuota");

    },

  },

});

</script>



<style lang="scss" scoped>

.event-whatsapp {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}



.page-desc {

  margin: 6px 0 0;

  color: var(--dark-gray);

  font-size: 0.95em;

}

</style>

