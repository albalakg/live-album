<template>
  <p class="title--small">
    {{ title }}
  </p>
  <div class="custom-select" @click="toggleDropdown">
    <div class="selected">
      <span>{{ selectedLabel }}</span>
      <span class="arrow" :class="{ open: isOpen }">▾</span>
    </div>

    <transition name="fade">
      <ul v-if="isOpen" class="options">
        <li
          v-for="opt in options"
          :key="opt.value"
          @click.stop="selectOption(opt)"
        >
          {{ opt.label }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "CustomSelect",
  props: {
    options: {
      type: Array as () => { label: string; value: string | number }[],
      required: true,
    },
    modelValue: [String, Number],
    placeholder: {
      type: String,
      default: "בחר פעולה",
    },
    title: {
      type: String,
      default: "",
    },
  },
  data() {
    return { isOpen: false };
  },
  computed: {
    selectedLabel(): string {
      const selected = this.options.find((o) => o.value === this.modelValue);
      return selected ? selected.label : this.placeholder;
    },
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    selectOption(opt: any) {
      this.$emit("update:modelValue", opt.value);
      this.isOpen = false;
    },
    setValue(value: string | number) {
      this.$emit("update:modelValue", value);
      this.isOpen = false;
    },
  },
});
</script>

<style scoped>
.custom-select {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px 12px;
  background: #fff;
  cursor: pointer;
  position: relative;
  user-select: none;
  z-index: 10;
}

.selected {
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: right;
}

.arrow {
  transition: transform 0.2s ease;
}
.arrow.open {
  transform: rotate(180deg);
}

.options {
  list-style: none;
  margin: 6px 0 0 0;
  padding: 0;
  border: 1px solid #eee;
  border-radius: 6px;
  background: #fff;
  position: absolute;
  width: 100%;
  top: 100%;
  right: 0;
  z-index: 10;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.options li {
  padding: 8px 12px;
  cursor: pointer;
  text-align: right;
  transition: background 0.15s ease;
}
.options li + li {
  border-top: 1px solid #f0f0f0;
}
.options li:hover {
  background: #f68589;
  color: #fff;
}

/* אנימציה לפתיחה */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
