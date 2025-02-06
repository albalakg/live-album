<template>
  <div class="event-details display--flex flex--wrap justify--space-between height--full width--full">
    <div class="event-right padding--medium display--flex direction--column justify--space-between">
      <EventDetailsForm />
      <div class="display--flex flex--wrap justify--space-between align--center upload-page-wrapper padding--medium">
        <div class="display--flex align--center width--full-mobile">
          <div class="icon-wrapper">
            <MainIcon clickable icon="content_copy" @onClick="copyUrl()" />
          </div>
          <small>{{ copyText }}</small>
        </div>
        <div class="width--full-mobile upload-page-link">
          <router-link target="_blank" :to="`/event/uploads/${eventPath}`">
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

  data() {
    return {
      textCopied: false as boolean,
    }
  },

  computed: {
    eventPath(): string {
      return this.$store.getters['event/getEventPath']
    },
    
    copyText(): string {
      return this.textCopied ? 'הקישור הועתק' : 'לחצו להעתקת הקישור';
    },
  },

  methods: {
    copyUrl() {      
      this.copyTextToClipboard(window.location.origin + `/event/uploads/${this.eventPath}`);
    },

    fallbackCopyTextToClipboard(text: string) {
      var textArea = document.createElement("textarea");
      textArea.value = text;

      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        if(successful) {
          this.textCopied = true;
          setTimeout(() => {
            this.textCopied = false;
          }, 2000);
        }
        console.log('Fallback: Copying text command was ' + msg);
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
      }

      document.body.removeChild(textArea);
    },

    copyTextToClipboard(text: string) {
      if (!navigator.clipboard) {
        this.fallbackCopyTextToClipboard(text);
        return;
      }
      
      navigator.clipboard.writeText(text).then(() => {
        console.log('Async: Copying to clipboard was successful!');
        this.textCopied = true;
        setTimeout(() => {
          this.textCopied = false;
        }, 2000);
      }, (err) => {
        console.error('Async: Could not copy text: ', err);
        this.fallbackCopyTextToClipboard(text);
      });
    }
  }
});
</script>

<style lang="scss" scoped>
.event-details {

  .icon-wrapper {
    width: 30px;
    height: 30px;
    margin-inline-end: 5px;
  }

  .event-right {
    width: 30%;
    min-height: 40%;
      
    @media only screen and (max-width: 600px) { 
      width: 100%;
  
      .upload-page-wrapper {
        margin-top: 20px;

        .upload-page-link {
          margin-top: 10px;
        }
      }
    }
  }

  .event-left {
    width: 40%;
    min-height: 40%;

    @media only screen and (max-width: 600px) { 
      width: 100%;
      margin-top: 30px;
    }

    &>div {
      height: calc(50% - 40px);
    }
  }
}
</style>
