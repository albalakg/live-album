<template>
  <div>
    Guests Gallery View
  </div>
</template>

<script lang="ts">
import { IUserInfo, IEvent } from "@/helpers/interfaces";
import { defineComponent, ref, computed } from "vue";
import { useStore } from "vuex";
import { StatusEnum } from "@/helpers/enums";
import Auth from "@/helpers/Auth";

export default defineComponent({
  name: "EventGuestGalleryView",

  components: {
  },

  setup() {
    return {
    };
  },

  data() {
    return {
      loading: true as boolean,
    };
  },

  computed: {
   
  },

  created() {
    this.getEventDetails();
  },

  methods: {
    async getEventDetails() {
      await this.$store.dispatch(
        "event/getEventBaseInfo",
        this.$route.params.event_path
      );
      await this.$store.dispatch(
        "event/getEventGuestGallery",
        this.$route.params.event_path
      );
      this.loading = false;
    },
  },
});
</script>

<style lang="scss">
.upload-not-available {
}

.home {
  position: absolute;
  z-index: 1000;
  top: 0;
  right: 0;
  left: 0;
  height: 100dvh;
  width: 100vw;
  max-width: 500px;
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  direction: rtl;
}

.event-image {
  background-size: cover !important;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.content-wrapper {
  text-align: center;
  max-width: 600px;
  width: 100%;
  z-index: 2;
}

.title {
  // position: absolute;
  // left: 0;
  // right: 0;
  // margin: auto;
  // top: 10px;
  // margin-bottom: 30px;
  font-size: 2.5rem;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.6);
}

.event-date {
  margin-bottom: 20px;
}

.upload-button {
  font-size: 2rem;
  padding: 25px 50px;
  width: calc(100% - 40px);
  max-width: 400px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #ff7f50, #ff4500);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(255, 69, 0, 0.3);
  transition: all 0.3s ease;
  font-family: system-ui, sans-serif;
  margin: 0 20px;
}

.upload-button:disabled {
  opacity: 0.9;
  cursor: not-allowed;
}

.upload-button:hover:enabled {
  background: linear-gradient(135deg, #e63e00, #b33000);
  box-shadow: 0 10px 25px rgba(230, 62, 0, 0.4);
  transform: translateY(-5px);
}

.notification {
  font-family: serif;
  font-size: 1.5rem;
  width: calc(100% - 70px);
  margin: 0 20px;
  color: #fff;
  margin-top: 15px;
  margin-bottom: 10px;
  padding: 10px 15px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 25px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: opacity 0.3s ease;
}

span {
  font-family: system-ui, sans-serif;
  color: #fff;
}

.hidden {
  opacity: 0;
}

@media (min-width: 768px) {
  .home {
    background-position: center;
    background-size: contain;
  }

  .title {
    font-size: 4rem;
  }

  .upload-button {
    font-size: 2.2rem;
    padding: 30px 60px;
  }
}
</style>
