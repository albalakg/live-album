<template>
  <div
    class="pricing-card"
    :class="[
      cardClass,
      `pricing-card--${variant}`,
      { 'pricing-card--selected': selected },
    ]"
    :role="selectable ? 'button' : undefined"
    :tabindex="selectable ? 0 : undefined"
    @click="onCardClick"
    @keydown.enter.prevent="onCardClick"
    @keydown.space.prevent="onCardClick"
  >
    <template v-if="variant === 'compact'">
      <div class="pricing-card-compact__icon" v-html="icon"></div>
      <div class="pricing-card-compact__body">
        <h3 class="pricing-card-compact__title">{{ title }}</h3>
        <div class="pricing-card-compact__price">
          <span v-if="showStrikePrice" class="pricing-launch-sale-tag pricing-launch-sale-tag--compact">
            {{ launchSaleLabel }}
          </span>
          <span v-if="showStrikePrice" class="pricing-price-original text--dark">
            {{ strikePrice }} ₪
          </span>
          <span class="pricing-card-compact__amount">{{ displayPrice }} ₪</span>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="pricing-card-header">
        <h3 class="title--large">{{ title }}</h3>
        <div class="icon" v-html="icon"></div>
      </div>
      <div class="pricing-card-footer">
        <div>
          <p class="text--white" v-html="description"></p>
          <div class="pricing-price-block">
            <span v-if="showStrikePrice" class="pricing-launch-sale-tag">
              {{ launchSaleLabel }}
            </span>
            <div v-if="showStrikePrice" class="pricing-price-row">
              <p class="pricing-price-original text--white">{{ strikePrice }} ₪</p>
              <h4 class="text--white title--large pricing-price-sale">
                {{ displayPrice }} ₪
              </h4>
            </div>
            <h4 v-else class="text--white title--large pricing-price-sale">
              {{ displayPrice }} ₪
            </h4>
            <slot name="footer" />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { SUBSCRIPTION_LAUNCH_SALE_LABEL } from "@/helpers/subscriptionPricing";
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "SubscriptionPlanCard",

  props: {
    slug: { type: String, required: true },
    title: { type: String, required: true },
    displayPrice: { type: Number, required: true },
    strikePrice: { type: Number, required: true },
    showStrikePrice: { type: Boolean, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    cardClass: { type: String, default: "" },
    selected: { type: Boolean, default: false },
    selectable: { type: Boolean, default: true },
    launchSaleLabel: {
      type: String as PropType<string>,
      default: SUBSCRIPTION_LAUNCH_SALE_LABEL,
    },
    variant: {
      type: String as PropType<"full" | "compact">,
      default: "full",
    },
  },

  emits: ["select"],

  methods: {
    onCardClick() {
      if (!this.selectable) {
        return;
      }
      this.$emit("select", this.slug);
    },
  },
});
</script>

<style lang="scss" scoped>
.pricing-price-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.pricing-launch-sale-tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ffd700, #ff8c00);
  color: #222;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  line-height: 1.2;
}

.pricing-price-row {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px 12px;
}

.pricing-price-original {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  opacity: 0.65;
  text-decoration: line-through;
  line-height: 1.2;
}

.pricing-price-sale {
  margin: 0 0 5px;
  line-height: 1.2;
}

.pricing-card {
  border-radius: 2px;
  background-color: #fffc;
  box-shadow: 0 3px 5px #0005;
  backdrop-filter: blur(20px);
  height: 415px;
  width: 300px;
  text-align: center;
  min-height: fit-content;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &.pricing-card--selected {
    box-shadow: 0 0 0 3px var(--green), 0 6px 16px #0006;
    transform: translateY(-4px);
  }

  &[role="button"] {
    cursor: pointer;
  }

  .pricing-card-header {
    height: 50%;
  }

  .pricing-card-footer {
    background-color: #222;
    padding: 5%;
    height: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pricing-card-footer > div {
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: space-between;
    gap: 15px;
  }

  .icon {
    width: 35%;
    height: 35%;
    margin: auto;
    svg {
      width: 100%;
      height: 100%;
    }
  }

  h3 {
    margin: 5%;
    color: #383838;
  }
}

.premium-card {
  .pricing-card-header {
    background: linear-gradient(#fff, #f0e68caa, #ffd700aa);
  }
}

.classic-card {
  background: linear-gradient(#fff, #a3d18daa, #a3d18daa);
}

.pricing-card--compact {
  width: 100%;
  height: auto;
  min-height: 72px;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  text-align: start;

  &.pricing-card--selected {
    transform: none;
  }

  &.classic-card {
    background: linear-gradient(90deg, #fff 0%, #a3d18d55 100%);
  }

  &.premium-card .pricing-card-compact__icon {
    background: linear-gradient(135deg, #fff8, #ffd70055);
    border-radius: 8px;
  }
}

.pricing-card-compact__icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  color: #383838;

  svg {
    width: 100%;
    height: 100%;
  }
}

.pricing-card-compact__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pricing-card-compact__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #383838;
  line-height: 1.2;
}

.pricing-card-compact__price {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 8px;
}

.pricing-card-compact__amount {
  font-size: 1.15rem;
  font-weight: 700;
  color: #222;
}

.pricing-launch-sale-tag--compact {
  font-size: 0.65rem;
  padding: 2px 8px;
}

.pricing-card--compact .pricing-price-original {
  font-size: 0.9rem;
  color: #555;
}

@media only screen and (max-width: 600px) {
  .pricing-card {
    width: 80%;
    margin: 10px auto;
  }
}
</style>
