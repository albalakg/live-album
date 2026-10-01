<template>
  <span>
    <template v-for="(part, index) in parts" :key="index">
      <strong v-if="part.type === 'strong'">{{ part.text }}</strong>
      <router-link v-else-if="part.type === 'link'" :to="part.href || '/'">{{
        part.text
      }}</router-link>
      <template v-else>{{ part.text }}</template>
    </template>
  </span>
</template>

<script lang="ts">
import { parseInline, type InlinePart } from "@/content/landingPages";
import { defineComponent } from "vue";

export default defineComponent({
  name: "InlineRichText",

  props: {
    text: {
      type: String,
      required: true,
    },
  },

  computed: {
    parts(): InlinePart[] {
      return parseInline(this.text);
    },
  },
});
</script>
