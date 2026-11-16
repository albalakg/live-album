<template>
  <section class="ov-share" aria-labelledby="ov-share-title">
    <h2 id="ov-share-title">קישורי שיתוף</h2>
    <div class="ov-share__list">
      <div v-for="link in links" :key="link.path" class="ov-share__row">
        <div class="ov-share__meta">
          <strong>{{ link.label }}</strong>
          <small dir="ltr">{{ origin }}{{ link.path }}</small>
        </div>
        <CopyLinkButton :text="`${origin}${link.path}`" />
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import CopyLinkButton from "@/components/ui/CopyLinkButton.vue";

export default defineComponent({
  name: "OverviewShareLinks",

  components: { CopyLinkButton },

  props: {
    origin: { type: String, required: true },
    links: {
      type: Array as PropType<Array<{ label: string; path: string }>>,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.ov-share {
  background: #fff;
  border-radius: 22px;
  padding: 20px 22px;
  box-shadow: 0 6px 20px rgba(18, 16, 14, 0.06);
  border: 1px solid rgba(22, 19, 16, 0.05);
}

.ov-share h2 {
  margin: 0 0 12px;
  font-size: 1.12rem;
  font-weight: 800;
}

.ov-share__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-top: 1px solid rgba(22, 19, 16, 0.08);
}

.ov-share__row:first-of-type {
  border-top: 0;
  padding-top: 0;
}

.ov-share__meta {
  flex: 1;
  min-width: 0;
  text-align: start;
}

.ov-share__meta strong {
  display: block;
  font-weight: 800;
}

.ov-share__meta small {
  display: block;
  color: #8a8278;
  direction: ltr;
  unicode-bidi: isolate;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .ov-share {
    padding: 16px;
  }
  .ov-share__row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
