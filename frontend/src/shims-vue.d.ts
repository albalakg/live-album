/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

import { useBreakpoints } from '@/composables/useBreakpoints';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $bp: ReturnType<typeof useBreakpoints>;
  }
}