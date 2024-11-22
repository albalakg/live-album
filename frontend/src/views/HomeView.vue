<template>
  <div class="home">
    <div class="overlay"></div>
    <div class="content-wrapper">
      <h1 class="title">Amit & Gal
        <br>
        Wedding 25.11.2024</h1>
      <button class="upload-button" :disabled="isUploading" @click="uploadFile">
        <span v-if="isUploading">מעלה...</span>
        <span v-else>תעלו ותשתפו</span>
      </button>
      <div :class="{
        'hidden': !showNotification
      }" class="notification">
        <span v-if="uploadSuccess">הקובץ עלה בהצלחה!</span>
        <span v-else>נכשל לעלות את הקובץ</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'HomeView',
  setup() {
    const store = useStore();

    const isUploading = ref(false);
    const uploadSuccess = ref(false);
    const uploadFailed = ref(false);

    const showNotification = computed(() => uploadSuccess.value || uploadFailed.value);

    // Function to detect if the device is mobile
    const isMobileDevice = () => {
      return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    };

    const uploadFile = () => {
      alert('starting');
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,video/*';
      
      if (!isMobileDevice()) {
        input.removeAttribute('capture');
      }
      
      input.onchange = async (event: Event) => {
        alert('File uploaded');
        const target = event.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          alert('Has file');
          isUploading.value = true;
          uploadFailed.value = false;
          uploadSuccess.value = false;
          try {
            alert(target.files[0].name + ' ||| ' + target.files[0].type + ' ||| ' + target.files[0].size);
            const response = await store.dispatch("event/uploadFile", target.files[0]);
            console.log('response from vue', response);
            uploadSuccess.value = true;
            setTimeout(() => {
              uploadSuccess.value = false;
            }, 5000);
          } catch (error: any) {
            console.log(error);
            alert(error);
            alert(error?.response);
            alert(error?.response?.message);
            uploadFailed.value = true;
            setTimeout(() => {
              uploadFailed.value = false;
            }, 5000);
            console.error('Upload failed', error);
          } finally {
            isUploading.value = false;
          }
        } else {
          alert('No file:  -  ' + JSON.stringify(target.files));
        }
      };

      input.click();
    };

    return {
      isUploading,
      uploadSuccess,
      uploadFailed,
      showNotification,
      uploadFile
    };
  },
});
</script>

<style lang="scss">
.home {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url('@/assets/Save-the-Date.jpeg') no-repeat center center;
  background-size: cover;
  position: relative;
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
  position: relative;
  z-index: 2;
  padding: 20px;
}

.title {
  font-family: 'Updock', cursive;
  font-size: 3.5rem;
  margin-bottom: 30px;
  color: #fff;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.6);
}

.upload-button {
  font-size: 2rem;
  padding: 25px 50px;
  width: 100%;
  max-width: 400px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #ff7f50, #ff4500);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(255, 69, 0, 0.3);
  transition: all 0.3s ease;
  font-family: system-ui, sans-serif;
}

.upload-button:disabled {
  opacity: .9;
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
  width: calc(100% - 30px);
  color: #fffc;
  margin-top: 20px;
  padding: 10px 15px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: opacity 0.3s ease;
}

span {
  font-family: system-ui, sans-serif;
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
