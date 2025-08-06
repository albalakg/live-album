<template>
  <router-link
    :to="link.url"
  >
    <div class="desktop-link" :class="`text--${link.color} ${isActive ? 'text--shadow text--bold' : ''}`" :style="`${!isActive ? 'font-weight: ' + getFontWeight : ''}`">
      {{ link.text }}
    </div>
  </router-link>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import { IDesktopBarItem } from "@/helpers/interfaces";

export default defineComponent({
  name: "MobileBar",

  props: {
    link: {
      type: Object as PropType<IDesktopBarItem>,
      required: true,
    },
  },

  computed: {
    getFontWeight(): string {
      return this.link.weight ?? "500";
    },

    isActive(): boolean {
      return this.$route.fullPath.includes(this.link.url);
    },
  },
});
</script>

<style lang="scss" scoped>
.desktop-link {
  margin-inline-end: 20px;
  padding: 28.5px 21px;
  &:hover {
    background-color: #ffaeb133;
  }
}
</style>
