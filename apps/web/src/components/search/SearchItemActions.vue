<template>
  <button v-for="b in buttons" :key="b.a" class="btn btn-sm" :class="b.cls" type="button" :data-act="b.a" @click.stop="$emit('act', b.a)">
    {{ b.label }}
  </button>
  <div v-if="menuOpen && item.type === 'guest'" class="menu" style="flex-basis: 100%">
    <button v-for="t in tableOptions" :key="t.key" type="button" :data-set-table="t.key" @click.stop="$emit('act', 'set-table', t.key)">
      {{ t.label }} · {{ t.free }} פנוי
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import type { SearchItem } from "@/helpers/search/engine";
import { ActionButton, actionsFor } from "@/helpers/search/actions";

export default defineComponent({
  name: "SearchItemActions",
  props: {
    item: { type: Object as PropType<SearchItem>, required: true },
    canSeat: { type: Boolean, default: false },
    menuOpen: { type: Boolean, default: false },
    tableOptions: { type: Array as PropType<{ key: string; label: string; free: number }[]>, default: () => [] },
  },
  emits: ["act"],
  computed: {
    buttons(): ActionButton[] {
      return actionsFor(this.item, { canSeat: this.canSeat });
    },
  },
});
</script>
