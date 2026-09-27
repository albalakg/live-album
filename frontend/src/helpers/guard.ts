import store from "@/store/index";
import Auth from "@/helpers/Auth";
import { RouteLocationNormalized, NavigationGuardNext } from "vue-router";

function isAuthenticated(): boolean {
  return Auth.isLogged() || store.getters["user/isLoggedIn"];
}

class Guard {
  user(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void {
    isAuthenticated() ? next() : next("/");
  }

  guest(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext): void {
    if (!isAuthenticated()) {
      next();
      return;
    }

    if (to.name === "googleAuthCallback") {
      next();
      return;
    }

    next("/");
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
