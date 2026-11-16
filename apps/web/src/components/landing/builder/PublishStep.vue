<template>
  <div class="pstep">
    <section class="card fcard">
      <h2 class="h2">כמעט מוכן! בוחרים כתובת ומפרסמים</h2>
      <p class="lede" style="margin-bottom: 20px">
        את הקישור הזה שולחים לאורחים, למשל בוואטסאפ או בהזמנה.
      </p>

      <label class="lbl" for="slug-in">הכתובת של העמוד</label>
      <div class="slug" :class="boxClass" style="margin-top: 8px">
        <span class="slug-pre">{{ prefix }}</span>
        <input
          id="slug-in"
          :value="slug"
          maxlength="40"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          aria-describedby="slug-st"
          @input="onInput"
          @blur="$emit('blur')"
        />
      </div>

      <div id="slug-st" role="status">
        <div v-if="status === 'checking' || status === 'idle'" class="slug-st wait">
          בודקים אם הכתובת פנויה…
        </div>
        <div v-else-if="status === 'free'" class="slug-st ok">
          <BuilderIcon name="check" />הכתובת פנויה
        </div>
        <template v-else>
          <div class="slug-st bad"><BuilderIcon name="x" />{{ message }}</div>
          <div v-if="suggestions.length" class="sugg">
            <button v-for="s in suggestions" :key="s" type="button" @click="$emit('suggest', s)">{{ s }}</button>
          </div>
        </template>
      </div>

      <p class="help" style="margin-top: 8px">
        {{ slugTouched ? "אותיות באנגלית, מספרים ומקף." : "הצענו כתובת לפי השמות שלכם. אפשר לשנות, באנגלית." }}
      </p>

      <ul class="checklist">
        <li>
          <span class="ck"><BuilderIcon name="check" /></span>
          <span>עיצוב: <b>{{ templateName }}</b></span>
          <button type="button" @click="$emit('go', 1)">שינוי</button>
        </li>
        <li>
          <span class="ck"><BuilderIcon name="check" /></span>
          <span>
            <b>{{ titleText }}</b>
            <template v-if="dateText"> · {{ dateText }}</template>
            <template v-if="timeText"> בשעה <bdi>{{ timeText }}</bdi></template>
          </span>
          <button type="button" @click="$emit('go', 2)">עריכה</button>
        </li>
        <li>
          <span class="ck"><BuilderIcon name="check" /></span>
          <span><b>{{ sectionCount }} חלקים</b> בעמוד</span>
          <button type="button" @click="$emit('go', 2)">עריכה</button>
        </li>
      </ul>

      <p class="help"><BuilderIcon name="info" /> אפשר לערוך את העמוד גם אחרי הפרסום, והשינויים יתעדכנו מיד.</p>
    </section>

    <div class="note" style="margin-top: 20px">
      <BuilderIcon name="qr" />
      <span>
        <b>כרטיס ה־QR לא משתנה.</b>
        הוא ממשיך להוביל את האורחים ישר להעלאת תמונות. את דף האירוע שולחים בקישור.
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, type PropType } from "vue";
import type { SlugUiStatus } from "./builderTypes";
import BuilderIcon from "./BuilderIcon.vue";
import { sanitizeSlugInput } from "./hubWizardModel";

const MESSAGES: Partial<Record<SlugUiStatus, string>> = {
  taken: "הכתובת תפוסה. אולי אחת מאלה?",
  reserved: "הכתובת הזאת שמורה. אולי אחת מאלה?",
  short: "צריך לפחות 3 תווים",
  long: "עד 40 תווים",
  invalid: "רק אותיות באנגלית, מספרים ומקף",
  empty: "כתבו כתובת קצרה באנגלית",
  error: "לא הצלחנו לבדוק את הכתובת. נסו שוב בעוד רגע.",
};

/** Step 3: address (LTR), live availability, review list. */
export default defineComponent({
  name: "PublishStep",
  components: { BuilderIcon },
  props: {
    slug: { type: String, default: "" },
    slugTouched: { type: Boolean, default: false },
    status: { type: String as PropType<SlugUiStatus>, default: "idle" },
    suggestions: { type: Array as PropType<string[]>, default: () => [] },
    prefix: { type: String, default: "snapshare-live.com/h/" },
    templateName: { type: String, default: "" },
    titleText: { type: String, default: "" },
    dateText: { type: String, default: "" },
    timeText: { type: String, default: "" },
    sectionCount: { type: Number, default: 0 },
  },
  emits: ["update:slug", "suggest", "go", "blur"],
  setup(props, { emit }) {
    const boxClass = computed(() => {
      if (props.status === "free") return "ok";
      if (props.status === "checking" || props.status === "idle") return "";
      return "bad";
    });
    const message = computed(() => MESSAGES[props.status] || "");

    function onInput(e: Event) {
      const el = e.target as HTMLInputElement;
      const clean = sanitizeSlugInput(el.value);
      if (clean !== el.value) el.value = clean;
      emit("update:slug", clean);
    }

    return { boxClass, message, onInput };
  },
});
</script>
