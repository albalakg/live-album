<template>
  <section :id="'sec-' + sectionId" :class="['block', alt && 'alt']">
    <div class="wrap">
      <p class="sec-kicker">ברכות</p>
      <h2 class="sec-title">{{ data.title }}</h2>
      <p class="body" style="color:var(--muted);margin-bottom:18px">{{ data.message }}</p>
      <form class="wish-form" @submit.prevent="onSubmit">
        <input v-model="from" type="text" maxlength="40" placeholder="השם שלכם" required :disabled="preview" />
        <textarea v-model="text" maxlength="400" placeholder="הברכה" required :disabled="preview" />
        <div>
          <button type="submit" class="btn btn-primary" :disabled="preview">שלחו ברכה</button>
          <span v-if="preview" class="preview-note">בתצוגה מקדימה</span>
        </div>
      </form>
      <ul class="wishes">
        <li v-for="(w, i) in wishes" :key="i">
          <blockquote>{{ w.text }}</blockquote>
          <cite>
            <span v-if="w.demo" class="demo-tag">דוגמה</span>
            {{ w.from }}
          </cite>
        </li>
      </ul>
      <button
        v-if="showGift"
        type="button"
        class="gift-link"
        @click="onGift"
      >
        {{ data.gift_label }} ←
      </button>
      <p v-if="data.gift_note" class="media-note">{{ data.gift_note }}</p>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, inject, ref } from "vue";
import { LANDING_CTX } from "../landingContext";

export default defineComponent({
  name: "WishingWell",
  props: {
    data: { type: Object, required: true },
    sectionId: { type: String, required: true },
    alt: { type: Boolean, default: false },
  },
  setup(props) {
    const ctx = inject(LANDING_CTX, null);
    const preview = computed(() => ctx?.preview === true);
    const showGift = computed(
      () => Boolean(props.data.gift_label) && (preview.value || Boolean(props.data.payment_link))
    );
    const from = ref("");
    const text = ref("");
    const wishes = ref([
      { from: "דנה", text: "מאחלים לכם ערב מלא אור ואהבה.", demo: true },
    ]);

    function onSubmit() {
      // Display-only: no network / no durable storage (ephemeral local list for UX).
      if (preview.value) {
        ctx?.toast("בתצוגה מקדימה");
        return;
      }
      wishes.value.unshift({ from: from.value, text: text.value, demo: false });
      from.value = "";
      text.value = "";
      ctx?.toast("הברכה נוספה מקומית (תצוגה)");
    }

    function onGift() {
      if (preview.value || !props.data.payment_link) {
        ctx?.toast("קישור המתנה הוא לדוגמה בלבד.");
        return;
      }
      window.open(String(props.data.payment_link), "_blank", "noopener");
    }

    return { preview, showGift, from, text, wishes, onSubmit, onGift };
  },
});
</script>
