<template>
  <div class="tpick">
    <h2 class="h2">איזה עיצוב מתאים לכם?</h2>
    <p class="lede">
      בוחרים עיצוב, ואחר כך ממלאים פרטים. אפשר להחליף עיצוב בכל רגע, ומה שכתבתם נשאר.
    </p>
    <div class="chips" role="group" aria-label="סוג אירוע">
      <button
        v-for="c in categories"
        :key="c.id"
        type="button"
        class="chip"
        :aria-pressed="filter === c.id ? 'true' : 'false'"
        @click="$emit('filter', c.id)"
      >{{ c.he }}</button>
    </div>
    <p class="chip-hint">{{ hint }}</p>
    <div class="tgrid" role="radiogroup" aria-label="עיצובים">
      <TemplatePickerCard
        v-for="t in visible"
        :key="t.id"
        :template="t"
        :selected="t.id === selectedId"
        :type-label="typeLabel(t.type)"
        @select="$emit('select', $event)"
        @preview="$emit('preview', $event)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { listTemplates } from "../templates/registry";
import { CATEGORIES } from "./hubWizardModel";
import TemplatePickerCard from "./TemplatePickerCard.vue";

export default defineComponent({
  name: "TemplatePicker",
  components: { TemplatePickerCard },
  props: {
    /** Wizard event type (wedding, barmitzvah ...). */
    eventType: { type: String, default: "" },
    selectedId: { type: String, default: "" },
    filter: { type: String, default: "all" },
  },
  emits: ["select", "preview", "filter"],
  setup(props) {
    const all = listTemplates();
    const visible = computed(() =>
      props.filter === "all" ? all : all.filter((t) => t.type === props.filter)
    );

    function typeLabel(type: string): string {
      return CATEGORIES.find((c) => c.id === type)?.he || "";
    }

    const hint = computed(() =>
      props.eventType && props.filter === props.eventType
        ? `מציגים עיצובים ל${typeLabel(props.eventType)}, לפי סוג האירוע שלכם.`
        : ""
    );

    return { categories: CATEGORIES, visible, typeLabel, hint };
  },
});
</script>
