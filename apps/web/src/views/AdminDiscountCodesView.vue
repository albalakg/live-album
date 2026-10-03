<template>
  <div class="discount-admin">
    <div class="discount-admin__content width--page-size margin--auto">
      <h1 class="title--x-large">קודי הנחה</h1>

      <form class="discount-admin__card bg--white brs--medium" @submit.prevent="createCode">
        <h2 class="title--medium text--dark">קוד חדש</h2>
        <label class="discount-admin__label" for="new-code">קוד</label>
        <input
          id="new-code"
          v-model="form.code"
          class="discount-admin__input"
          type="text"
          maxlength="32"
          autocomplete="off"
          placeholder="SAVE20"
        />
        <label class="discount-admin__label" for="new-percent">אחוז הנחה</label>
        <input
          id="new-percent"
          v-model.number="form.percent"
          class="discount-admin__input"
          type="number"
          min="1"
          max="100"
        />
        <label class="discount-admin__label" for="new-status">סטטוס</label>
        <select id="new-status" v-model.number="form.status" class="discount-admin__input">
          <option :value="statusActive">פעיל</option>
          <option :value="statusInactive">לא פעיל</option>
        </select>
        <p v-if="formError" class="discount-admin__error">{{ formError }}</p>
        <div class="discount-admin__submit">
          <MainButton color="green" text="הוספת קוד" :loading="creating" @onClick="createCode" />
        </div>
      </form>

      <div class="discount-admin__card bg--white brs--medium">
        <h2 class="title--medium text--dark">קודים קיימים</h2>
        <p v-if="loading" class="text--dark">טוען...</p>
        <p v-else-if="!codes.length" class="text--dark">אין קודי הנחה עדיין</p>
        <ul v-else class="discount-admin__list">
          <li v-for="code in codes" :key="code.id" class="discount-admin__item">
            <div>
              <p class="discount-admin__code">{{ code.code }}</p>
              <p class="text--dark">{{ code.percent }}% · {{ statusLabel(code.status) }}</p>
            </div>
            <button
              type="button"
              class="discount-admin__toggle"
              :disabled="updatingId === code.id"
              @click="toggleStatus(code)"
            >
              {{ code.status === statusActive ? "השבת" : "הפעל" }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import MainButton from "@/components/library/buttons/MainButton.vue";
import { StatusEnum } from "@/helpers/enums";
import ErrorsHandler from "@/helpers/errorsHandler";
import axios from "axios";
import { defineComponent } from "vue";

type DiscountCodeRow = {
  id: number;
  code: string;
  percent: number;
  status: number;
};

export default defineComponent({
  name: "AdminDiscountCodesView",

  components: {
    MainButton,
  },

  data() {
    return {
      statusActive: StatusEnum.ACTIVE,
      statusInactive: StatusEnum.INACTIVE,
      codes: [] as DiscountCodeRow[],
      loading: false,
      creating: false,
      updatingId: 0,
      formError: "",
      form: {
        code: "",
        percent: 10,
        status: StatusEnum.ACTIVE as number,
      },
    };
  },

  async mounted() {
    await this.loadCodes();
  },

  methods: {
    statusLabel(status: number): string {
      return status === StatusEnum.ACTIVE ? "פעיל" : "לא פעיל";
    },

    async loadCodes() {
      this.loading = true;
      try {
        const res = await axios.get("discount-codes");
        this.codes = (res.data?.data ?? []) as DiscountCodeRow[];
      } catch (err) {
        this.$notify({
          text: ErrorsHandler.getErrorMessage(err),
          type: "error",
          duration: 5000,
        });
      } finally {
        this.loading = false;
      }
    },

    async createCode() {
      if (this.creating) return;
      const code = this.form.code.trim();
      const percent = Number(this.form.percent);
      if (!code || !Number.isInteger(percent) || percent < 1 || percent > 100) {
        this.formError = "הזינו קוד ואחוז בין 1 ל-100";
        return;
      }

      this.creating = true;
      this.formError = "";
      try {
        await axios.post("discount-codes", {
          code,
          percent,
          status: this.form.status,
        });
        this.form.code = "";
        this.form.percent = 10;
        this.form.status = StatusEnum.ACTIVE;
        this.$notify({
          text: "קוד ההנחה נוסף",
          type: "success",
          duration: 4000,
        });
        await this.loadCodes();
      } catch (err) {
        this.formError = ErrorsHandler.getErrorMessage(err);
      } finally {
        this.creating = false;
      }
    },

    async toggleStatus(code: DiscountCodeRow) {
      if (this.updatingId) return;
      this.updatingId = code.id;
      const nextStatus =
        code.status === StatusEnum.ACTIVE ? StatusEnum.INACTIVE : StatusEnum.ACTIVE;
      try {
        await axios.patch(`discount-codes/${code.id}`, { status: nextStatus });
        code.status = nextStatus;
      } catch (err) {
        this.$notify({
          text: ErrorsHandler.getErrorMessage(err),
          type: "error",
          duration: 5000,
        });
      } finally {
        this.updatingId = 0;
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.discount-admin {
  min-height: 100vh;
  padding: 32px 0 48px;
}

.discount-admin__content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.discount-admin__card {
  padding: 20px;
  max-width: 640px;
}

.discount-admin__label {
  display: block;
  margin: 12px 0 6px;
  font-weight: 700;
}

.discount-admin__input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #eadfdf;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 16px;
  background: #fff;
}

.discount-admin__submit {
  max-width: 220px;
  margin-top: 16px;
}

.discount-admin__error {
  margin: 10px 0 0;
  color: #c0392b;
  font-weight: 700;
}

.discount-admin__list {
  list-style: none;
  margin: 12px 0 0;
  padding: 0;
}

.discount-admin__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #f3ecec;
}

.discount-admin__code {
  margin: 0 0 4px;
  font-weight: 800;
  letter-spacing: 0.4px;
}

.discount-admin__item p {
  margin: 0;
}

.discount-admin__toggle {
  border: 0;
  border-radius: 999px;
  background: var(--pink);
  color: #fff;
  font-weight: 700;
  padding: 8px 16px;
  cursor: pointer;
}

.discount-admin__toggle:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
