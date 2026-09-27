<template>
  <div v-if="open" class="guest-modal-backdrop" @click.self="onCancel">
    <div class="guest-modal bg--white brs--medium padding--large">
      <header class="guest-modal-header margin--bottom-medium">
        <h3 class="title--medium guest-modal-title">
          {{ isEdit ? "עריכת אורח" : "הוספת אורח" }}
        </h3>
        <MainIcon
          class="guest-modal-close"
          clickable
          icon="close"
          @onClick="onCancel"
        />
      </header>

      <MainInput
        v-model="form.full_name"
        title="שם מלא"
        :hasError="!!errors.full_name"
      />
      <small v-if="errors.full_name" class="field-error">{{ errors.full_name }}</small>
      <br />
      <MainInput
        v-model="form.phone"
        title="טלפון"
        placeholder="0501234567"
        :hasError="!!errors.phone"
      />
      <small v-if="errors.phone" class="field-error">{{ errors.phone }}</small>
      <small class="hint">יש להזין מספר טלפון עם קידומת, לדוגמה 0501234567 או 972501234567+</small>

      <div class="guest-modal-actions display--flex justify--space-between margin--top-medium">
        <BaseButton text="ביטול" color="gray" textColor="dark-gray" @onClick="onCancel" />
        <BaseButton
          text="שמירה"
          :loading="saving"
          @onClick="onSave"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import MainInput from "@/components/library/inputs/MainInput.vue";
import MainIcon from "@/components/library/general/MainIcon.vue";
import BaseButton from "@/components/library/buttons/BaseButton.vue";
import { IWhatsAppGuest } from "@/helpers/interfaces";

const PHONE_REGEX = /^\+?[0-9]{9,15}$/;

export default defineComponent({
  name: "WhatsAppGuestModal",

  components: {
    MainInput,
    MainIcon,
    BaseButton,
  },

  props: {
    open: {
      type: Boolean,
      default: false,
    },
    guest: {
      type: Object as PropType<IWhatsAppGuest | null>,
      default: null,
    },
    saving: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["save", "cancel"],

  data() {
    return {
      form: {
        full_name: "",
        phone: "",
      },
      errors: {
        full_name: "",
        phone: "",
      },
    };
  },

  computed: {
    isEdit(): boolean {
      return !!this.guest?.id;
    },
  },

  watch: {
    open(isOpen: boolean) {
      if (isOpen) {
        this.resetForm();
      }
    },
  },

  methods: {
    resetForm() {
      this.form = {
        full_name: this.guest?.full_name ?? "",
        phone: this.guest?.phone ?? "",
      };
      this.errors = { full_name: "", phone: "" };
    },

    validate(): boolean {
      this.errors = { full_name: "", phone: "" };
      let valid = true;

      if (!this.form.full_name.trim()) {
        this.errors.full_name = "שדה חובה";
        valid = false;
      }

      const phone = this.form.phone.replace(/[\s-]/g, "");
      if (!phone) {
        this.errors.phone = "שדה חובה";
        valid = false;
      } else if (!PHONE_REGEX.test(phone)) {
        this.errors.phone = "מספר טלפון לא תקין";
        valid = false;
      }

      return valid;
    },

    onSave() {
      if (!this.validate()) return;

      this.$emit("save", {
        id: this.guest?.id,
        full_name: this.form.full_name.trim(),
        phone: this.form.phone.replace(/[\s-]/g, ""),
      });
    },

    onCancel() {
      this.$emit("cancel");
    },
  },
});
</script>

<style lang="scss" scoped>
.guest-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}

.guest-modal {
  width: 100%;
  max-width: 480px;
  min-width: 0;
  overflow-x: hidden;
}

.guest-modal-header {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 12px;
}

.guest-modal-title {
  white-space: nowrap;
  min-width: 0;
  text-align: right;
}

.guest-modal-close {
  :deep(.main-icon) {
    width: auto;
    height: auto;
    display: inline-flex;
  }
}

.hint {
  display: block;
  margin-top: 8px;
  color: var(--dark-gray);
  overflow-wrap: anywhere;
}

.field-error {
  display: block;
  color: var(--pink);
  margin-top: 4px;
}

.guest-modal-actions {
  gap: 12px;

  > * {
    flex: 1;
  }
}
</style>
