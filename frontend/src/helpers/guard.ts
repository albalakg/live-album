import store from "@/store/index";
import { RouteLocationNormalized, NavigationGuardNext } from "vue-router";

class Guard {
  user(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void {
    store.getters["user/isLoggedIn"] ? next() : next("/");
  }

  guest(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void {
    !store.getters["user/isLoggedIn"] ? next() : next("/");
  }

  local(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void {
    process.env.VUE_APP_ENV === 'local' ? next() : next("/");
  }

  hasEvent(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void {
    store.getters["event/hasActiveEvent"] ? next() : next("/");
  }

  hasNoEvent(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void {
    !store.getters["event/hasActiveEvent"] ? next() : next("/");
  }
}

export default new Guard();