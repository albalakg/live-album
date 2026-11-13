<template>
  <div class="upload-media">
    <p class="upload-label">
      {{
        isDisabled
          ? "העלאת מדיה אינה זמינה כעת, האירוע נגמר"
          : videoUploadEnabled
            ? `העלו תמונות או סרטונים (עד ${MAX_SIZE_MB}MB כל אחד)`
            : `העלו תמונות (עד ${MAX_SIZE_MB}MB כל אחד)`
      }}
    </p>

    <div
      class="dropzone"
      :class="{ dragging: isDragging, disabled: isDisabled }"
      role="button"
      tabindex="0"
      @dragover.prevent="onDragOver"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFilePicker"
      @keydown.enter.prevent="triggerFilePicker"
      @keydown.space.prevent="triggerFilePicker"
    >
      <span class="material-symbols-outlined dropzone-icon" aria-hidden="true">
        cloud_upload
      </span>
      <strong>גררו קבצים לכאן</strong>
      <span>או לחצו לבחירה מהמחשב</span>
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

    <transition name="slide-up">
      <div
        v-if="uploads.length"
        class="upload-card"
        role="status"
        aria-live="polite"
      >
        <div class="upload-header">
          <div class="upload-title-row">
            <strong>העלאות</strong>
            <span class="upload-count">
              {{ progress.completed }} / {{ uploads.length }} הושלמו
            </span>
          </div>
          <div class="overall-bar" :aria-valuenow="overallProgress" aria-valuemin="0" aria-valuemax="100">
            <div class="progress" :style="{ width: overallProgress + '%' }"></div>
          </div>
          <small class="overall-pct">{{ overallProgress }}%</small>
        </div>

        <ul class="upload-list">
          <li
            v-for="u in uploads"
            :key="u.name"
            :class="{
              'is-done': u.done,
              'is-error': u.error,
              'is-current': uploads.indexOf(u) === currentIndex,
            }"
          >
            <div class="file-row">
              <span
                class="material-symbols-outlined file-icon"
                aria-hidden="true"
              >
                {{ fileIcon(u) }}
              </span>
              <div class="file-meta">
                <span class="file-name" :title="u.name">{{
                  friendlyName(u.name)
                }}</span>
                <span class="file-status">{{ fileStatus(u) }}</span>
              </div>
              <span class="file-pct">{{ fileProgressWidth(u) }}%</span>
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

        <button
          type="button"
          class="upload-action"
          :class="isComplete ? 'upload-action--primary' : 'upload-action--ghost'"
          @click="cancelUpload()"
        >
          {{ isComplete ? "סגור" : "בטל העלאות" }}
        </button>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import axios from "axios";
import Auth from "@/helpers/Auth";
import { defineComponent } from "vue";
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

    isComplete(): boolean {
      return (
        this.uploads.length > 0 &&
        this.progress.completed === this.uploads.length
      );
    },

    isDisabled(): boolean {
      return this.isEventActive || this.isEventInactive;
    },

    isEventActive(): boolean {
      return this.$store.getters["event/isEventActive"];
    },

    isEventInactive(): boolean {
      return this.$store.getters["event/isEventInactive"];
    },

    videoUploadEnabled(): boolean {
      return (
        this.$store.getters["event/getEvent"]?.config?.video_upload_enabled ??
        true
      );
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

    fileStatus(upload: UploadItem): string {
      if (upload.done) return "הושלם";
      if (upload.error) return "שגיאה";
      if (this.uploads.indexOf(upload) === this.currentIndex) return "מעלה…";
      return "ממתין";
    },

    fileIcon(upload: UploadItem): string {
      if (upload.done) return "check_circle";
      if (upload.error) return "error";
      if (this.uploads.indexOf(upload) === this.currentIndex) return "progress_activity";
      if (upload.name.match(/\.(mp4|mov|avi|mkv)$/i)) return "movie";
      if (upload.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return "image";
      return "draft";
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
      if (name.length <= 22) return name;
      const ext = name.split(".").pop();
      return name.substring(0, 14) + "…" + ext;
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

<style lang="scss" scoped>
.upload-media {
  max-width: 520px;
  margin-top: 16px;
  text-align: right;
  font-family: var(--font, Heebo, sans-serif);
  color: var(--ink, #161310);
}

.upload-label {
  margin: 0 0 10px;
  font-weight: 700;
  font-size: 0.95rem;
}

.dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 120px;
  padding: 22px 18px;
  border: 1.5px dashed rgba(22, 19, 16, 0.22);
  border-radius: 18px;
  background: rgba(22, 19, 16, 0.02);
  cursor: pointer;
  text-align: center;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.dropzone:hover,
.dropzone:focus-visible {
  border-color: #8a7040;
  box-shadow: 0 0 0 3px rgba(201, 163, 106, 0.28);
  background: rgba(201, 163, 106, 0.08);
  outline: none;
}

.dropzone.dragging {
  border-color: #8a7040;
  box-shadow: 0 0 0 3px rgba(201, 163, 106, 0.35);
  background: rgba(201, 163, 106, 0.12);
}

.dropzone.disabled {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}

.dropzone-icon {
  color: #8a7040;
  font-size: 1.7rem;
  margin-bottom: 2px;
}

.dropzone strong {
  font-size: 1rem;
  font-weight: 800;
}

.dropzone span:not(.material-symbols-outlined) {
  color: var(--muted, #5e564e);
  font-size: 0.88rem;
}

.upload-card {
  position: fixed;
  bottom: 24px;
  inset-inline-end: 24px;
  z-index: 1000;
  width: min(360px, calc(100vw - 32px));
  padding: 18px;
  background: var(--paper, #fffcfa);
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 18px;
  box-shadow: var(--shadow, 0 24px 60px rgba(18, 16, 14, 0.16));
}

.upload-header {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 14px;
}

.upload-title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.upload-title-row strong {
  font-size: 1.05rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.upload-count {
  color: var(--muted, #5e564e);
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
}

.overall-bar,
.file-bar {
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: rgba(22, 19, 16, 0.08);
  overflow: hidden;
}

.overall-bar .progress,
.file-bar .progress {
  height: 100%;
  border-radius: 999px;
  transition: width 0.25s ease;
}

.overall-bar .progress {
  background: linear-gradient(90deg, var(--accent, #c9a36a), var(--live, #2fbe6a));
}

.overall-pct {
  color: var(--muted, #5e564e);
  font-size: 0.78rem;
  font-weight: 700;
}

.upload-list {
  list-style: none;
  margin: 0 0 16px;
  padding: 0;
  max-height: 220px;
  overflow-y: auto;
  border-top: 1px solid var(--line, rgba(22, 19, 16, 0.11));
}

.upload-list li {
  padding: 12px 0;
  border-bottom: 1px solid var(--line, rgba(22, 19, 16, 0.11));
}

.file-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.file-icon {
  flex-shrink: 0;
  font-size: 1.25rem;
  color: var(--muted, #5e564e);
}

.is-current .file-icon {
  color: var(--accent, #c9a36a);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.is-done .file-icon {
  color: var(--live, #2fbe6a);
}

.is-error .file-icon {
  color: var(--rose, #dc5b66);
}

.file-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 700;
}

.file-status {
  color: var(--muted, #5e564e);
  font-size: 0.75rem;
  font-weight: 600;
}

.file-pct {
  flex-shrink: 0;
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--ink, #161310);
  font-variant-numeric: tabular-nums;
}

.file-bar .progress {
  background: rgba(22, 19, 16, 0.18);
}

.file-bar .progress.current {
  background: var(--accent, #c9a36a);
}

.file-bar .progress.done {
  background: var(--live, #2fbe6a);
}

.file-bar .progress.error {
  background: var(--rose, #dc5b66);
}

.upload-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border: 0;
  cursor: pointer;
  font-family: inherit;
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: -0.01em;
  border-radius: 999px;
  padding: 12px 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease,
    color 0.2s ease, border-color 0.2s ease;
}

.upload-action--ghost {
  background: transparent;
  color: var(--ink, #161310);
  border: 1.5px solid var(--line, rgba(22, 19, 16, 0.11));
}

.upload-action--ghost:hover {
  border-color: var(--rose, #dc5b66);
  color: #8a2f35;
  background: rgba(220, 91, 102, 0.06);
}

.upload-action--primary {
  background: linear-gradient(
    135deg,
    var(--accent-2, #dc5b66) 0%,
    var(--accent, #c9a36a) 100%
  );
  color: #fff;
  box-shadow: 0 10px 28px rgba(220, 91, 102, 0.28);
}

.upload-action--primary:hover {
  transform: translateY(-2px);
}

.upload-action:active {
  transform: translateY(0);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.28s ease, opacity 0.28s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(16px);
  opacity: 0;
}

@media (max-width: 520px) {
  .upload-card {
    bottom: 16px;
    inset-inline-end: 16px;
    inset-inline-start: 16px;
    width: auto;
  }
}
</style>
