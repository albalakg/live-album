<template>
  <div class="upload-media mt-4 text-right">
    <label class="font-semibold block mb-2">
      העלה תמונות או סרטונים (עד 250MB כל אחד)
    </label>

    <!-- Dropzone -->
    <div
      class="dropzone"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFilePicker"
      :class="{ dragging: isDragging }"
    >
      <p class="text-gray-600">
        גרור ושחרר קבצים כאן<br />
        <span class="text-sm text-gray-500">או לחץ לבחירה מהמחשב</span>
      </p>
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/*,video/*"
        class="display--none"
        @change="handleFileChange"
      />
    </div>

    <!-- כרטיס צף -->
    <transition name="slide-up">
      <div v-if="uploads.length" class="upload-card shadow-lg">
        <div class="upload-header">
          <strong>העלאות</strong>
          <span>
            {{ progress.completed }} / {{ uploads.length }} קבצים הושלמו
          </span>
        </div>
        <div class="overall-bar">
          <div class="progress" :style="{ width: overallProgress + '%' }"></div>
        </div>
        <ul class="upload-list">
          <li v-for="u in uploads" :key="u.name">
            <div class="file-info">
              <span class="file-icon">{{ fileIcon(u.name) }}</span>
              <span class="file-name" :title="u.name">{{ friendlyName(u.name) }}</span>
            </div>
            <div class="file-bar">
              <div
                class="progress"
                :class="u.done ? 'done' : ''"
                :style="{ width: u.done ? '100%' : '100%' }"
              ></div>
            </div>
          </li>
        </ul>
        <div class="width--50">
          <BaseButton
            :loading="loading"
            :text="uploads.length === progress.completed ? 'סגור' : 'בטל העלאות'"
            @onClick="cancelUpload()"
            color="pink"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import Auth from "@/helpers/Auth";
import { defineComponent } from "vue";
import BaseButton from "@/components/library/buttons/BaseButton.vue";

interface UploadItem {
  name: string;
  done: boolean;
}

export default defineComponent({
  name: "UploadMedia",

  components: {
    BaseButton,
  },

  data() {
    return {
      isDragging: false,
      MAX_SIZE_MB: 250,
      uploads: [] as UploadItem[],
      progress: {
        total: 0,
        completed: 0,
      }
    };
  },

  computed: {
    overallProgress(): number {
      if (!this.uploads.length) return 0;
      return Math.round((this.progress.completed / this.uploads.length) * 100);
    },
  },

  methods: {
    triggerFilePicker() {
      (this.$refs.fileInput as HTMLInputElement).click();
    },

    async handleFileChange(event: Event) {
      const input = event.target as HTMLInputElement;
      if (!input.files) return;
      await this.processFiles(input.files);
      input.value = "";
    },

    async handleDrop(event: DragEvent) {
      this.isDragging = false;
      if (!event.dataTransfer?.files) return;
      await this.processFiles(event.dataTransfer.files);
    },

    async processFiles(files: FileList) {
      this.progress.total = files.length;
      const newUploads: UploadItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileSizeMB = file.size / (1024 * 1024);

        if (fileSizeMB > this.MAX_SIZE_MB) {
          alert(`"${file.name}" חורג מהמגבלה של ${this.MAX_SIZE_MB}MB`);
          continue;
        }

        newUploads.push({
          name: file.name,
          done: false,
        });
      }
      this.uploads.push(...newUploads);

      for (const upload of newUploads) {
        try {
          if(this.uploads.length === 0) break; // אם המשתמש ביטל את כל ההעלאות באמצע
          await this.$store.dispatch("event/uploadFile", {
            file: files[Array.from(newUploads).indexOf(upload)],
            isAuth: Auth.isLogged(),
          });
          upload.done = true;
          if(this.progress.completed !== this.uploads.length) {
            this.progress.completed += 1;
          }
        } catch (e) {
          console.error("שגיאה בהעלאה", e);
        }
      }

      // אפשרות לסגור כרטיס אחרי סיום
      if (this.progress.completed === this.uploads.length) {
        setTimeout(() => {
          this.uploads = [];
          this.progress = { total: 0, completed: 0 };
        }, 3000);
      }
    },

    friendlyName(name: string): string {
      if (name.length <= 20) return name;
      const ext = name.split(".").pop();
      return name.substring(0, 12) + "..." + ext;
    },

    fileIcon(name: string): string {
      if (name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return "📷";
      if (name.match(/\.(mp4|mov|avi|mkv)$/i)) return "🎥";
      return "📄";
    },

    cancelUpload() {
      this.uploads = [];
      this.progress = { total: 0, completed: 0 };
    },
  },
});
</script>

<style scoped>
.upload-media {
  max-width: 500px;
}

.dropzone {
  border: 2px dashed #bbb;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fafafa;
}

.dropzone:hover {
  border-color: #f68589;
  background: #fff;
}

.dropzone.dragging {
  border-color: #f68589;
  background: #ffeef0;
}

.upload-card {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 340px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #eee;
  z-index: 1000;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.95em;
  font-weight: bold;
  margin-bottom: 8px;
  color: #333;
}

.overall-bar {
  background: #f1f1f1;
  border-radius: 6px;
  height: 6px;
  margin-bottom: 12px;
}
.overall-bar .progress {
  background: #79ae60;
  height: 100%;
  border-radius: 6px;
  transition: width 0.3s ease;
}

.upload-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
}

.upload-list li {
  margin-bottom: 10px;
}

.file-info {
  display: flex;
  align-items: center;
  font-size: 0.85em;
  margin-bottom: 4px;
  color: #444;
}

.file-name {
  flex: 1;
  margin: 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-icon {
  font-size: 1.2em;
}

.file-bar {
  background: #ddd;
  border-radius: 6px;
  height: 6px;
}
.file-bar .progress {
  background: #bbb;
  height: 100%;
  border-radius: 6px;
}
.file-bar .progress.done {
  background: #79ae60; /* ירוק לסיום */
}
</style>
