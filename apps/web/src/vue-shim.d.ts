import { ComponentCustomProperties } from 'vue';
import { Store } from 'vuex';
import { Router } from 'vue-router';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<any>;
    $router: Router;
    $route: {
      path: string;
      name?: string | symbol | null;
      params: Record<string, string | string[]>;
      query: Record<string, string | string[]>;
      hash: string;
      fullPath: string;
    };
    $bp: {
      isMobile: boolean;
      isMedium: boolean;
      isLarge: boolean;
      isXLarge: boolean;
      isMediumAndUp: boolean;
      isMediumAndDown: boolean;
      isLargeAndUp: boolean;
      isLargeAndDown: boolean;
    };
    $notify: (options: { text?: string; type?: string; duration?: number }) => void;
  }
}