<template>
  <div v-if="open" class="delete-modal-backdrop" @click.self="onCancel">
    <div class="delete-modal bg--white brs--medium padding--large">
      <header class="delete-modal-header margin--bottom-medium">
        <h3 class="title--medium delete-modal-title">{{ title }}</h3>
        <MainIcon
          class="delete-modal-close"
          clickable
          icon="close"
          @onClick="onCancel"
        />
      </header>

      <p class="delete-modal-message">{{ message }}</p>

      <div class="delete-modal-actions display--flex justify--space-between margin--top-medium">
        <BaseButton
          text="ביטול"
          color="gray"
          textColor="dark-gray"
          :disabled="deleting"
          @onClick="onCancel"
        />
        <BaseButton
          text="מחיקה"
          color="pink"
          :loading="deleting"
          @onClick="onConfirm"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import MainIcon from "@/components/library/general/MainIcon.vue";
import BaseButton from "@/components/library/buttons/BaseButton.vue";

export default defineComponent({
  name: "WhatsAppGuestDeleteModal",

  components: {
    MainIcon,
    BaseButton,
  },

  props: {
    open: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "מחיקת אורח",
    },
    message: {
      type: String,
      default: "",
    },
    deleting: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["confirm", "cancel"],

  methods: {
    onConfirm() {
      this.$emit("confirm");
    },

    onCancel() {
      if (this.deleting) return;
      this.$emit("cancel");
    },
  },
});
</script>

<style lang="scss" scoped>
.delete-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}

.delete-modal {
  width: 100%;
  max-width: 420px;
}

.delete-modal-header {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
}

.delete-modal-title {
  white-space: nowrap;
  min-width: 0;
  text-align: right;
}

.delete-modal-close {
  :deep(.main-icon) {
    width: auto;
    height: auto;
    display: inline-flex;
  }
}

.delete-modal-message {
  color: var(--dark-gray);
  line-height: 1.5;
  margin: 0;
}

.delete-modal-actions {
  gap: 12px;

  > * {
    flex: 1;
  }
}
</style>
