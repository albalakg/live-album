<template>
  <div class="lip-back" role="presentation" @click.self="$emit('close')">
    <div
      class="lip"
      role="dialog"
      aria-modal="true"
      aria-label="בחירת תמונה"
      dir="rtl"
      @keydown.esc.prevent="$emit('close')"
    >
      <header class="lip-head">
        <h3>בחירת תמונה</h3>
        <button type="button" class="lip-x" aria-label="סגירה" @click="$emit('close')">×</button>
      </header>

      <div class="lip-tabs" role="tablist">
        <button
          type="button"
          class="lip-tab"
          role="tab"
          :class="{ on: tab === 'event' }"
          :aria-selected="tab === 'event'"
          @click="tab = 'event'"
        >תמונות מהאירוע</button>
        <button
          type="button"
          class="lip-tab"
          role="tab"
          :class="{ on: tab === 'stock' }"
          :aria-selected="tab === 'stock'"
          @click="tab = 'stock'"
        >תמונות העיצוב</button>
      </div>

      <div v-if="tab === 'event'" class="lip-body">
        <p v-if="loading" class="lip-muted">טוען תמונות…</p>
        <p v-else-if="loadError" class="lip-error">{{ loadError }}</p>
        <p v-else-if="!assets.length" class="lip-muted">אין עדיין תמונות גלויות באלבום.</p>
        <div v-else class="lip-grid">
          <button
            v-for="a in assets"
            :key="a.id"
            type="button"
            class="lip-cell"
            :aria-label="`בחירת תמונה ${a.id}`"
            @click="pickAsset(a.id)"
          >
            <img :src="a.thumb_url || a.url" alt="" loading="lazy" />
          </button>
        </div>
        <button
          v-if="page < lastPage"
          type="button"
          class="lip-more"
          :disabled="loading"
          @click="loadMore"
        >עוד תמונות</button>
      </div>

      <div v-else class="lip-body">
        <p v-if="!stockEntries.length" class="lip-muted">אין תמונות עיצוב לתבנית הזו.</p>
        <div v-else class="lip-grid">
          <button
            v-for="s in stockEntries"
            :key="s.key"
            type="button"
            class="lip-cell"
            :aria-label="s.alt || s.key"
            @click="pickStock(s.key)"
          >
            <img :src="s.url" :alt="s.alt" loading="lazy" />
          </button>
        </div>
      </div>

      <footer class="lip-foot">
        <button v-if="allowClear" type="button" class="lip-clear" @click="clear">הסרת תמונה</button>
      </footer>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
import { getHubAssets, type HubAssetItem } from "@/api/eventHub";
import { stockMapForTemplate } from "../templates/registry";
import type { ImageRef } from "../types";

export default defineComponent({
  name: "LandingImagePicker",
  props: {
    eventId: { type: Number, required: true },
    templateId: { type: String, required: true },
    allowClear: { type: Boolean, default: true },
  },
  emits: ["close", "pick"],
  setup(props, { emit }) {
    const tab = ref<"event" | "stock">("event");
    const assets = ref<HubAssetItem[]>([]);
    const page = ref(1);
    const lastPage = ref(1);
    const loading = ref(false);
    const loadError = ref("");

    const stockEntries = computed(() => {
      const map = stockMapForTemplate(props.templateId);
      return Object.entries(map)
        .filter(([key]) => !/album-\d{2}/i.test(key) && !/^art\/album-/i.test(key))
        .map(([key, v]) => ({ key, url: v.url, alt: v.alt }));
    });

    async function loadPage(p: number, append: boolean) {
      loading.value = true;
      loadError.value = "";
      try {
        const res = await getHubAssets(props.eventId, p, 24);
        page.value = res.current_page;
        lastPage.value = res.last_page;
        assets.value = append ? [...assets.value, ...res.data] : res.data;
      } catch (e) {
        console.error(e);
        loadError.value = "לא הצלחנו לטעון תמונות מהאירוע.";
      } finally {
        loading.value = false;
      }
    }

    function loadMore() {
      if (page.value < lastPage.value) loadPage(page.value + 1, true);
    }

    function pickAsset(id: number) {
      const ref: ImageRef = { asset_id: id };
      emit("pick", ref);
    }

    function pickStock(key: string) {
      const ref: ImageRef = { stock: key };
      emit("pick", ref);
    }

    function clear() {
      emit("pick", null);
    }

    onMounted(() => loadPage(1, false));

    return {
      tab,
      assets,
      page,
      lastPage,
      loading,
      loadError,
      stockEntries,
      loadMore,
      pickAsset,
      pickStock,
      clear,
    };
  },
});
</script>

<style lang="scss" scoped>
.lip-back {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(22, 19, 16, 0.45);
  display: grid;
  place-items: center;
  padding: 16px;
}
.lip {
  width: min(720px, 100%);
  max-height: min(860px, 92vh);
  overflow: auto;
  background: #f7f2ea;
  border-radius: 20px;
  padding: 16px 16px 12px;
  display: grid;
  gap: 12px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}
.lip-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.lip-head h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 900;
}
.lip-x {
  border: 0;
  background: transparent;
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  color: #5e564e;
}
.lip-tabs {
  display: flex;
  gap: 8px;
}
.lip-tab {
  border: 0;
  background: rgba(22, 19, 16, 0.06);
  border-radius: 999px;
  padding: 8px 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.lip-tab.on {
  background: rgba(220, 91, 102, 0.16);
}
.lip-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 8px;
}
.lip-cell {
  aspect-ratio: 1;
  border: 0;
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #ddd;
}
.lip-cell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.lip-muted {
  color: #5e564e;
  margin: 8px 0;
}
.lip-error {
  color: #a33;
  margin: 8px 0;
}
.lip-more,
.lip-clear {
  border: 0;
  background: rgba(22, 19, 16, 0.08);
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}
.lip-foot {
  display: flex;
  justify-content: flex-start;
}
</style>
