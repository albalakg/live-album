<template>
  <div class="design-landing-page">
    <div v-if="!shot" class="mockbar">
      <router-link to="/design/landing">← כל הטמפלטים</router-link>
      <span class="mid">{{ meta?.name_he }} · {{ meta?.type_he || meta?.type }}</span>
      <span class="slug">/design/landing/{{ templateId }}</span>
    </div>
    <LandingRenderer
      v-if="hubConfig"
      :template-id="templateId"
      :hub-config="hubConfig"
      mode="preview"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import LandingRenderer from "@/components/landing/LandingRenderer.vue";
import { landingFixtures } from "@/components/landing/fixtures";
import { getTemplate } from "@/components/landing/templates/registry";

export default defineComponent({
  name: "DesignLandingView",
  components: { LandingRenderer },
  setup() {
    const route = useRoute();
    const templateId = computed(() => String(route.params.id || ""));
    const hubConfig = computed(() => landingFixtures[templateId.value] || null);
    const meta = computed(() => getTemplate(templateId.value));
    const shot = computed(() => Boolean(route.query.shot));

    function syncMockbarClass() {
      if (typeof document === "undefined") return;
      document.body.classList.toggle("has-mockbar", !shot.value);
    }
    onMounted(syncMockbarClass);
    watch(shot, syncMockbarClass);
    onBeforeUnmount(() => {
      document.body.classList.remove("has-mockbar");
    });

    return { templateId, hubConfig, meta, shot };
  },
});
</script>

<style scoped>
.mockbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 18px;
  background: #12100E;
  color: #F3EEE6;
  font-size: 0.88rem;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 40;
}
.mockbar a { color: #F3EEE6; text-decoration: none; }
.mockbar .mid { opacity: 0.85; }
.mockbar .slug { opacity: 0.55; font-family: Outfit, Heebo, sans-serif; font-size: 0.8rem; }
@media (max-width: 720px) {
  .mockbar .slug { display: none; }
}
</style>
