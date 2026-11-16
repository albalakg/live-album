<template>
  <section class="ov-next" aria-labelledby="ov-next-title">
    <div class="ov-next__copy">
      <p class="ov-next__eyebrow">הצעד הבא</p>
      <h2 id="ov-next-title" class="ov-next__title">{{ step.title }}</h2>
      <p class="ov-next__body">{{ step.body }}</p>
    </div>
    <router-link class="ov-next__cta" :to="step.to">{{ step.cta }}</router-link>
  </section>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { OverviewNextStep } from "@/helpers/overviewNextStep";

export default defineComponent({
  name: "OverviewNextStepCard",

  props: {
    step: {
      type: Object as PropType<OverviewNextStep>,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.ov-next {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
  background: linear-gradient(135deg, #f7f2ea 0%, #fff 55%, #f3eee6 100%);
  border-radius: 22px;
  padding: 22px 24px;
  border: 1px solid rgba(22, 19, 16, 0.06);
  box-shadow: 0 6px 20px rgba(18, 16, 14, 0.05);
}

.ov-next__eyebrow {
  margin: 0 0 4px;
  font-size: 0.78rem;
  font-weight: 800;
  color: #8a8278;
}

.ov-next__title {
  margin: 0;
  font-size: clamp(1.15rem, 2vw, 1.35rem);
  font-weight: 900;
  letter-spacing: -0.02em;
}

.ov-next__body {
  margin: 8px 0 0;
  color: #5e564e;
  font-weight: 500;
  max-width: 42rem;
  line-height: 1.45;
}

.ov-next__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 12px 22px;
  border-radius: 999px;
  background: #12100e;
  color: #fff;
  text-decoration: none;
  font-weight: 800;
  white-space: nowrap;
  flex-shrink: 0;
}

.ov-next__cta:focus-visible {
  outline: 2px solid #c9a36a;
  outline-offset: 3px;
}

@media (max-width: 600px) {
  .ov-next {
    padding: 18px 16px;
    align-items: stretch;
  }
  .ov-next__cta {
    width: 100%;
  }
}
</style>
