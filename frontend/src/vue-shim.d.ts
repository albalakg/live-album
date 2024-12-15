import { ComponentCustomProperties } from 'vue';
import { Store } from 'vuex';
import Notifications from '@kyvg/vue3-notification'
import { Router, RouteLocation } from 'vue-router';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<State>;
    $router: Router; 
    $route: RouteLocation;
    $notify: Notifications;
  }
}