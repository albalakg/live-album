<script lang="ts">
import { buildHeadInput } from "@/seo/meta";
import { useHead } from "@unhead/vue";
import { computed, defineComponent } from "vue";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "SeoHead",

  setup() {
    const route = useRoute();
    useHead(computed(() => buildHeadInput(route)));
    return {};
  },

  render() {
    return null;
  },
});
</script>
