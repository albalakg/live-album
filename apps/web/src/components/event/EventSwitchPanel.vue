<template>
  <section class="switch-section">
    <h3 v-if="title">{{ title }}</h3>
    <p v-if="lede" class="switch-lede">{{ lede }}</p>
    <div
      v-for="item in items"
      :key="item.key"
      class="switch-row"
      @click="$emit('toggle', item.key)"
    >
      <div class="switch-copy">
        <strong>{{ item.title }}</strong>
        <small v-if="item.hint">{{ item.hint }}</small>
      </div>
      <MainCheckbox
        :value="Boolean(values[item.key])"
        @onClick.stop="$emit('toggle', item.key)"
      />
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import MainCheckbox from "../library/inputs/MainCheckbox.vue";

export type SwitchItem = {
  key: string;
  title: string;
  hint?: string;
};

export default defineComponent({
  name: "EventSwitchPanel",

  components: { MainCheckbox },

  props: {
    title: { type: String, default: "" },
    lede: { type: String, default: "" },
    items: { type: Array as PropType<SwitchItem[]>, required: true },
    values: { type: Object as PropType<Record<string, boolean>>, required: true },
  },

  emits: ["toggle"],
});
</script>

<style lang="scss" scoped>
.switch-section {
  border: 1px solid var(--line, rgba(22, 19, 16, 0.11));
  border-radius: 18px;
  padding: 14px 16px;
  background: #fffcfa;
}

.switch-section h3 {
  margin: 0 0 6px;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--muted, #5e564e);
  letter-spacing: 0.02em;
}

.switch-lede {
  margin: 0 0 10px;
  color: var(--muted, #5e564e);
  font-size: 0.88rem;
  line-height: 1.4;
}

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-top: 1px solid rgba(22, 19, 16, 0.06);
  cursor: pointer;
}

.switch-row:first-of-type {
  border-top: 0;
  padding-top: 0;
}

.switch-copy {
  min-width: 0;
  flex: 1;
}

.switch-copy strong {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.3;
}

.switch-copy small {
  display: block;
  margin-top: 2px;
  color: var(--muted, #5e564e);
  font-size: 0.82rem;
  line-height: 1.35;
}
</style>
