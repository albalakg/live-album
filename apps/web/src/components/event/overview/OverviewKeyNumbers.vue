<template>
  <section class="ov-keys" aria-label="מספרים חשובים">
    <article v-for="item in items" :key="item.label" class="ov-key">
      <strong class="ov-key__value">{{ item.value }}</strong>
      <span class="ov-key__label">{{ item.label }}</span>
      <small v-if="item.hint" class="ov-key__hint">{{ item.hint }}</small>
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { OverviewKeyNumberItem } from "@/helpers/overviewUiTypes";

export default defineComponent({
  name: "OverviewKeyNumbers",

  props: {
    items: {
      type: Array as PropType<OverviewKeyNumberItem[]>,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.ov-keys {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.ov-key {
  background: #fff;
  border-radius: 20px;
  padding: 18px 16px;
  box-shadow: 0 6px 20px rgba(18, 16, 14, 0.06);
  border: 1px solid rgba(22, 19, 16, 0.05);
  min-width: 0;
}

.ov-key__value {
  display: block;
  font-size: clamp(1.55rem, 2.4vw, 2rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.ov-key__label {
  display: block;
  margin-top: 6px;
  font-weight: 700;
  font-size: 0.92rem;
}

.ov-key__hint {
  display: block;
  margin-top: 4px;
  color: #8a8278;
  font-size: 0.8rem;
}

@media (max-width: 1024px) {
  .ov-keys {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .ov-keys {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .ov-key {
    padding: 14px 12px;
  }
  .ov-key__value {
    font-size: 1.45rem;
  }
}
</style>
