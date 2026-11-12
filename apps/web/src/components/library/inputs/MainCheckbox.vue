<template>
  <div
    class="snap-switch"
    :class="{ disabled, 'is-on': value }"
    role="switch"
    :aria-checked="value"
    :aria-disabled="disabled"
    @click.stop="submit()"
  >
    <input
      ref="input"
      :id="`switch-${uniqueId}`"
      type="checkbox"
      class="snap-switch__input"
      :checked="value"
      :disabled="disabled"
      tabindex="-1"
      @click.stop.prevent="submit()"
    />
    <span class="snap-switch__track" aria-hidden="true">
      <span class="snap-switch__thumb"></span>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "MainCheckbox",

  props: {
    text: {
      type: String,
    },

    color: {
      type: String,
      default: "rose",
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    value: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      uniqueId: Math.random().toString(36).slice(2, 9),
    };
  },

  methods: {
    submit() {
      if (this.disabled) return;
      this.$emit("onClick");
    },

    toggle() {
      this.submit();
    },
  },
});
</script>

<style lang="scss" scoped>
.snap-switch {
  position: relative;
  display: inline-flex;
  flex: none;
  cursor: pointer;
  touch-action: manipulation;
}

.snap-switch.disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.snap-switch__input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  pointer-events: none;
}

.snap-switch__track {
  position: relative;
  width: 48px;
  height: 28px;
  border-radius: 999px;
  background: rgba(22, 19, 16, 0.14);
  display: inline-block;
  transition: background 0.2s ease;
  box-sizing: border-box;
}

.snap-switch__thumb {
  position: absolute;
  top: 3px;
  inset-inline-start: 3px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(18, 16, 14, 0.28);
  transition: inset-inline-start 0.2s ease;
}

.snap-switch.is-on .snap-switch__track {
  background: linear-gradient(135deg, #dc5b66, #c9a36a);
}

.snap-switch.is-on .snap-switch__thumb {
  inset-inline-start: calc(100% - 25px);
}
</style>
