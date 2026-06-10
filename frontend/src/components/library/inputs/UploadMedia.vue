<template>
  <div class="upload-media mt-4 text-right">
    <label class="font-semibold block mb-2">
      {{
        isDisabled
          ? "העלאת מדיה אינה זמינה כעת, האירוע נגמר"
          : videoUploadEnabled
            ? "העלו תמונות או סרטונים (עד 20MB כל אחד)"
            : "העלו תמונות (עד 20MB כל אחד)"
      }}
    </label>

    <!-- Dropzone -->
    <div
      class="dropzone"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFilePicker"
      :class="{ dragging: isDragging, disabled: isDisabled }"
    >
      <p class="text-gray-600">
        גרור ושחרר קבצים כאן<br />
        <span class="text-sm text-gray-500">או לחץ לבחירה מהמחשב</span>
      </p>
      <input
        ref="fileInput"
        type="file"
        multiple
        :accept="acceptFileTypes"
        class="display--none"
        :disabled="isDisabled"
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
              <span class="file-name" :title="u.name">{{
                friendlyName(u.name)
              }}</span>
            </div>
            <div class="file-bar">
              <div
                class="progress"
                :class="{
                  done: u.done,
                  error: u.error,
                  current: uploads.indexOf(u) === currentIndex,
                }"
                :style="{ width: fileProgressWidth(u) + '%' }"
              ></div>
            </div>
          </li>
        </ul>
        <div class="width--50">
          <BaseButton
            :text="
              uploads.length === progress.completed ? 'סגור' : 'בטל העלאות'
            "
            @onClick="cancelUpload()"
            color="pink"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import Auth from "@/helpers/Auth";
import { defineComponent } from "vue";
import BaseButton from "@/components/library/buttons/BaseButton.vue";
import {
  MAX_UPLOAD_SIZE_MB,
  validateUploadFile,
} from "@/helpers/uploadValidation";

interface UploadItem {
  name: string;
  done: boolean;
  file: File;
  progress: number;
  error: boolean;
}

export default defineComponent({
  name: "UploadMedia",

  components: {
    BaseButton,
  },

  data() {
    return {
      isDragging: false,
      MAX_SIZE_MB: MAX_UPLOAD_SIZE_MB,
      uploads: [] as UploadItem[],
      progress: {
        total: 0,
        completed: 0,
      },
      currentIndex: -1,
      cancelled: false,
      activeAbortController: null as AbortController | null,
    };
  },

  computed: {
    overallProgress(): number {
      if (!this.uploads.length) return 0;
      const total = this.uploads.reduce(
        (sum, upload) => sum + (upload.done ? 100 : upload.progress),
        0
      );
      return Math.round(total / this.uploads.length);
    },

    isDisabled(): boolean {
      return this.isEventActive || this.isEventInactive;
    },

    isEventActive() {
      return this.$store.getters["event/isEventActive"];
    },

    isEventInactive() {
      return this.$store.getters["event/isEventInactive"];
    },

    videoUploadEnabled(): boolean {
      return this.$store.getters["event/getEvent"]?.config?.video_upload_enabled ?? true;
    },

    acceptFileTypes(): string {
      return this.videoUploadEnabled ? "image/*,video/*" : "image/*";
    },
  },

  methods: {
    fileProgressWidth(upload: UploadItem): number {
      if (upload.done) return 100;
      if (upload.error) return upload.progress || 0;
      return upload.progress;
    },

    onDragOver() {
      if (this.isDisabled) return;
      this.isDragging = true;
    },

    triggerFilePicker() {
      if (this.isDisabled) return;
      (this.$refs.fileInput as HTMLInputElement).click();
    },

    async handleFileChange(event: Event) {
      if (this.isDisabled) return;
      const input = event.target as HTMLInputElement;
      if (!input.files) return;
      await this.processFiles(input.files);
      input.value = "";
    },

    async handleDrop(event: DragEvent) {
      this.isDragging = false;
      if (this.isDisabled || !event.dataTransfer?.files) return;
      await this.processFiles(event.dataTransfer.files);
    },

    async processFiles(files: FileList) {
      if (this.isDisabled) return;

      this.cancelled = false;
      const newUploads: UploadItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const validation = validateUploadFile(file, {
          videoUploadEnabled: this.videoUploadEnabled,
        });

        if (!validation.valid) {
          this.$notify({
            text: validation.error,
            type: "error",
            duration: 5000,
          });
          continue;
        }

        newUploads.push({
          name: file.name,
          done: false,
          file,
          progress: 0,
          error: false,
        });
      }

      if (!newUploads.length) return;

      this.uploads.push(...newUploads);
      this.progress.total = this.uploads.length;

      for (const upload of newUploads) {
        if (this.cancelled) break;

        this.currentIndex = this.uploads.indexOf(upload);
        const controller = new AbortController();
        this.activeAbortController = controller;

        try {
          await this.$store.dispatch("event/uploadFile", {
            file: upload.file,
            isAuth: Auth.isLogged(),
            signal: controller.signal,
            onUploadProgress: (event: ProgressEvent) => {
              if (!event.total) return;
              upload.progress = Math.min(
                100,
                Math.round((event.loaded * 100) / event.total)
              );
            },
          });

          upload.done = true;
          upload.progress = 100;
          this.progress.completed += 1;
        } catch (error) {
          if (axios.isCancel(error) || this.cancelled) {
            break;
          }
          upload.error = true;
          console.error("שגיאה בהעלאה", error);
        } finally {
          this.activeAbortController = null;
          this.currentIndex = -1;
        }
      }

      if (
        !this.cancelled &&
        this.progress.completed === this.uploads.length &&
        this.uploads.length > 0
      ) {
        this.$notify({
          text: "הקבצים התקבלו ונמצאים בבדיקת תוכן. יופיעו באלבום לאחר אישור.",
          type: "success",
          duration: 5000,
        });
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
      this.cancelled = true;
      this.activeAbortController?.abort();
      this.activeAbortController = null;
      this.uploads = [];
      this.progress = { total: 0, completed: 0 };
      this.currentIndex = -1;
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

.dropzone.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
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
  transition: width 0.2s ease;
}
.file-bar .progress.done {
  background: #79ae60;
}
.file-bar .progress.error {
  background: #e74c3c;
}
.file-bar .progress.current {
  background: #f68589;
}
</style>
