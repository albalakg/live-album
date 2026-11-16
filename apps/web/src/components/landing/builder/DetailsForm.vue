<template>
  <section class="card fcard" aria-labelledby="ess-h">
    <div class="fcard-h">
      <div>
        <h3 id="ess-h">הפרטים החשובים</h3>
        <p>מילאנו לפי פרטי האירוע. אפשר לשנות.</p>
      </div>
    </div>

    <div v-if="event.type === 'wedding'" class="row2 keep">
      <div class="fld">
        <label for="f-n1">שם ראשון</label>
        <input
          id="f-n1"
          class="inp"
          :value="event.name1"
          maxlength="30"
          autocomplete="off"
          @input="set('name1', $event)"
          @focus="$emit('focus-hero')"
        />
      </div>
      <div class="fld">
        <label for="f-n2">שם שני</label>
        <input
          id="f-n2"
          class="inp"
          :value="event.name2"
          maxlength="30"
          autocomplete="off"
          @input="set('name2', $event)"
          @focus="$emit('focus-hero')"
        />
      </div>
    </div>
    <div v-else class="fld">
      <label for="f-t">שם האירוע</label>
      <input
        id="f-t"
        class="inp"
        :value="event.title"
        maxlength="60"
        @input="set('title', $event)"
        @focus="$emit('focus-hero')"
      />
    </div>

    <div class="row2 keep">
      <div class="fld">
        <label for="f-d">תאריך</label>
        <input
          id="f-d"
          class="inp"
          type="date"
          :value="event.date"
          @input="set('date', $event)"
          @focus="$emit('focus-hero')"
        />
      </div>
      <div class="fld">
        <label for="f-tm">שעה</label>
        <input
          id="f-tm"
          class="inp"
          type="time"
          :value="event.time"
          @input="set('time', $event)"
          @focus="$emit('focus-hero')"
        />
      </div>
    </div>

    <div class="row2">
      <div class="fld">
        <label for="f-v">שם המקום</label>
        <input
          id="f-v"
          class="inp"
          :value="event.venue"
          maxlength="60"
          @input="set('venue', $event)"
          @focus="$emit('focus-hero')"
        />
      </div>
      <div class="fld">
        <label for="f-c">עיר או כתובת</label>
        <input
          id="f-c"
          class="inp"
          :value="event.city"
          maxlength="80"
          @input="set('city', $event)"
          @focus="$emit('focus-hero')"
        />
      </div>
    </div>
    <p v-if="error" class="fld-err" role="alert" style="margin-top: 12px">{{ error }}</p>
  </section>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import type { WizardEvent } from "./hubWizardModel";

type EventField = "name1" | "name2" | "title" | "date" | "time" | "venue" | "city";

/** The essentials card. Values live in the page's own hub_config; the event row is never written. */
export default defineComponent({
  name: "DetailsForm",
  props: {
    event: { type: Object as PropType<WizardEvent>, required: true },
    error: { type: String, default: "" },
  },
  emits: ["update", "focus-hero"],
  setup(_props, { emit }) {
    function set(field: EventField, e: Event) {
      emit("update", field, (e.target as HTMLInputElement).value);
    }
    return { set };
  },
});
</script>
