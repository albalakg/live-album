<template>

  <span

    class="campaign-status"

    :class="[

      pill ? 'campaign-status--pill' : '',

      `campaign-status--${statusColor}`,

    ]"

  >

    {{ statusText }}

  </span>

</template>



<script lang="ts">

import { defineComponent, PropType } from "vue";

import { WhatsAppCampaignStatusEnum } from "@/helpers/enums";



export default defineComponent({

  name: "WhatsAppCampaignStatus",



  props: {

    status: {

      type: String as PropType<WhatsAppCampaignStatusEnum>,

      required: true,

    },

    pill: {

      type: Boolean,

      default: false,

    },

  },



  computed: {

    statusColor(): string {

      switch (this.status) {

        case WhatsAppCampaignStatusEnum.SENT:

          return "green";

        case WhatsAppCampaignStatusEnum.SCHEDULED:

          return "blue";

        case WhatsAppCampaignStatusEnum.PENDING:

          return "blue";

        case WhatsAppCampaignStatusEnum.SENDING:

          return "light-green";

        case WhatsAppCampaignStatusEnum.FAILED:

          return "pink";

        case WhatsAppCampaignStatusEnum.CANCELLED:

          return "pink";

        default:

          return "gray";

      }

    },



    statusText(): string {

      switch (this.status) {

        case WhatsAppCampaignStatusEnum.SENT:

          return "נשלח";

        case WhatsAppCampaignStatusEnum.SCHEDULED:

          return "מתוזמן";

        case WhatsAppCampaignStatusEnum.PENDING:

          return "ממתין";

        case WhatsAppCampaignStatusEnum.SENDING:

          return "בשליחה";

        case WhatsAppCampaignStatusEnum.FAILED:

          return "נכשל";

        case WhatsAppCampaignStatusEnum.CANCELLED:

          return "בוטל";

        default:

          return this.status;

      }

    },

  },

});

</script>



<style lang="scss" scoped>

.campaign-status {

  font-weight: 600;



  &--pill {

    display: inline-block;

    padding: 2px 10px;

    border-radius: 999px;

    font-size: 0.75em;

    margin-right: 8px;

  }



  &--green {

    color: var(--green);

    &.campaign-status--pill {

      background: #e8f5e9;

    }

  }



  &--blue {

    color: #1565c0;

    &.campaign-status--pill {

      background: #e3f2fd;

    }

  }



  &--light-green {

    color: var(--light-green);

    &.campaign-status--pill {

      background: #f1f8e9;

    }

  }



  &--pink {

    color: var(--pink);

    &.campaign-status--pill {

      background: #fce4ec;

    }

  }



  &--gray {

    color: var(--dark-gray);

    &.campaign-status--pill {

      background: #f5f5f5;

    }

  }

}

</style>

