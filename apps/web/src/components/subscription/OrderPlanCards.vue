<template>
  <div class="plans order-plans">
    <article
      v-for="card in cards"
      :id="`plan-${card.slug}`"
      :key="card.slug"
      class="plan"
      :class="{
        featured: card.featured,
        'plan--selected': card.selected,
        'plan--recommended': card.featured,
      }"
      :data-slug="card.slug"
    >
      <span v-if="card.featured && card.badge" class="plan-badge">{{ card.badge }}</span>
      <h3>{{ card.title }}</h3>
      <div class="price">
        <template v-if="card.priceLabel">{{ card.priceLabel }}</template>
        <template v-else>₪{{ formatPrice(card.displayPrice) }}</template>
      </div>
      <p class="price-sub">{{ card.priceSub }}</p>
      <ul>
        <li v-for="(feature, index) in card.features" :key="`${card.slug}-${index}`">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12.5l5 5L20 7.5"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <span>{{ feature }}</span>
        </li>
      </ul>
      <button
        type="button"
        class="btn"
        :class="card.featured ? 'btn-primary' : 'btn-ghost'"
        :disabled="card.loading"
        @click="$emit('select', card.slug)"
      >
        {{ card.loading ? "רגע…" : card.cta }}
      </button>
    </article>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export type OrderPlanCardModel = {
  slug: string;
  title: string;
  displayPrice: number;
  priceLabel: string | null;
  priceSub: string;
  features: string[];
  cta: string;
  featured: boolean;
  badge?: string;
  selected: boolean;
  loading: boolean;
};

export default defineComponent({
  name: "OrderPlanCards",

  props: {
    cards: {
      type: Array as PropType<OrderPlanCardModel[]>,
      required: true,
    },
  },

  emits: ["select"],

  methods: {
    formatPrice(value: number): string {
      if (!Number.isFinite(value)) return "0";
      return Number.isInteger(value) ? String(value) : value.toFixed(2);
    },
  },
});
</script>

<style lang="scss" scoped>
.order-plans {
  margin-top: 8px;
  width: 100%;
}

.plan--selected {
  box-shadow: var(--shadow), 0 0 0 2px color-mix(in srgb, var(--accent-2) 55%, transparent);
  border-color: var(--accent-2);
}

.plan .btn:disabled {
  opacity: 0.7;
  cursor: wait;
}

@media (max-width: 640px) {
  .order-plans .plan[data-slug="classic"] {
    order: -1;
  }
}
</style>
