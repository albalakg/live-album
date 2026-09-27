import { LocationQuery } from "vue-router";
import { Store } from "vuex";

interface PostLoginUser {
  subscription_name?: string;
  order?: {
    subscription?: {
      name?: string;
    };
  };
}

function getPostLoginRedirectQuery(query: LocationQuery): string | null {
  const postLoginRedirect = query.post_login_redirect;
  if (typeof postLoginRedirect === "string" && postLoginRedirect) {
    return postLoginRedirect;
  }

  const redirect = query.redirect;
  if (typeof redirect === "string" && redirect) {
    return redirect;
  }

  return null;
}

export function resolvePostLoginRoute(
  user: PostLoginUser,
  query: LocationQuery,
  store: Store<unknown>
): string {
  const redirect = getPostLoginRedirectQuery(query);
  if (redirect) {
    return redirect;
  }

  const hasEvent = Boolean(store.getters["event/getEvent"]);
  const subscriptionName =
    user.subscription_name ?? user.order?.subscription?.name;

  if (subscriptionName && hasEvent) {
    return "/event";
  }

  return "/";
}
