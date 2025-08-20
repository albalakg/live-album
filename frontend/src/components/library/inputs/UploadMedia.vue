<template>
  <div class="upload-media mt-4 text-right">
    <label class="font-semibold block mb-2">
      העלה תמונות או סרטונים (עד 100MB כל אחד)
    </label>

    <input
      type="file"
      multiple
      accept="image/*,video/*"
      @change="handleFileChange"
      class="border p-2 w-full rounded"
    />

    <ul v-if="errors.length" class="text-red-600 mt-2 text-sm">
      <li v-for="(err, index) in errors" :key="index">{{ err }}</li>
    </ul>
    <ul v-if="success.length" class="text-green-600 mt-2 text-sm">
      <li v-for="(msg, index) in success" :key="index">{{ msg }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import Auth from "@/helpers/Auth";
import { defineComponent } from 'vue'

export default defineComponent({
  name: "UploadMedia",

  data() {
    return {
      errors: [] as string[],
      success: [] as string[],
      MAX_SIZE_MB: 100,
    };
  },

  methods: {
    async handleFileChange(event: any) {
      this.errors = [];
      this.success = [];

      const input = event.target;
      const files = input.files as FileList;

      if (!files) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > this.MAX_SIZE_MB) {
          this.errors.push(`"${file.name}" חורג מהמגבלה של 100MB`);
          continue;
        }

        try {
          await this.$store.dispatch("event/uploadFile", {
            file,
            isAuth: Auth.isLogged(),
          });
          this.success.push(`"${file.name}" הועלה בהצלחה`);
        } catch (e) {
          this.errors.push(`נכשל בהעלאת "${file.name}"`);
        }
      }

      // Reset input
      input.value = "";
    },
  },
});
</script>

<style scoped>
.upload-media {
  max-width: 400px;
}
</style>
