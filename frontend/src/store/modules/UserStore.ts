import axios from "axios";
import {
  IUserStoreState,
  ILoginRequest,
  IUserInfo,
  ISignupRequest,
  IUpdateUserRequest,
  IUpdatePasswordRequest,
  IForgotPasswordRequest,
} from "@/helpers/interfaces";
import { SubscriptionType } from "@/helpers/types";
import Auth from "@/helpers/Auth";
import ErrorsHandler from "@/helpers/errorsHandler";
import { notify } from "@kyvg/vue3-notification";
import router from "@/router";

const UserStore = {
  namespaced: true,

  state: {
    user: null,
    isLoggedIn: false,
  } as IUserStoreState,

  getters: {
    getUser(state: IUserStoreState): IUserInfo | null {
      return state.user;
    },

    getFirstName(state: IUserStoreState): string | null {
      return state.user?.first_name ?? null;
    },

    getLastName(state: IUserStoreState): string | null {
      return state.user?.last_name ?? null;
    },

    getFullName(state: IUserStoreState): string {
      return (state.user?.first_name ?? "") + " " + (state.user?.last_name ?? "");
    },

    getEmail(state: IUserStoreState): string | null {
      return state.user?.email ?? null;
    },

    isLoggedIn(state: IUserStoreState): boolean {
      return state.isLoggedIn;
    },

    getSubscriptionName(state: IUserStoreState): SubscriptionType | null {
      return state.user?.order?.subscription?.name ?? null;
    },

    getSubscriptionFilesAllowed(state: IUserStoreState): number | null {
      return state.user?.order?.subscription?.files_allowed ?? null;
    },

    getSubscriptionFilesStorageTime(state: IUserStoreState): number | null {
      return state.user?.order?.subscription?.storage_time ?? null;
    },

    getSubscriptionStartDate(
      state: IUserStoreState
    ): string | null | undefined {
      return state.user?.order?.created_at;
    },
  },

  mutations: {
    SET_USER(state: IUserStoreState, user: IUserInfo | null) {
      state.user = user;
    },

    SET_LOGGED_IN(state: IUserStoreState, isLoggedIn: boolean) {
      state.isLoggedIn = isLoggedIn;
    },

    SET_USER_PROFILE_UPDATED(state: IUserStoreState, user: IUpdateUserRequest) {
      if (state.user) {
        state.user.first_name = user.first_name;
        state.user.last_name = user.last_name;
      }
    },
  },

  actions: {
    login(
      context: {
        commit: (arg0: string, arg1: IUserInfo | boolean) => void;
      },
      payload: ILoginRequest
    ) {
      return new Promise((resolve) => {
        axios
          .post("auth/login", payload)
          .then((res) => {
            const user = res.data.data.user;
            Auth.login(user);
            delete user.token;
            delete user.expired_at;
            context.commit("SET_USER", user);
            context.commit("SET_LOGGED_IN", true);
            notify({
              text: "התחברת בהצלחה",
              type: "success",
              duration: 5000
            });
            resolve(user);
          })
          .catch((err) => {
            console.warn("get: ", err);
            notify({
              text: "כתובת המייל או הסיסמה אינם תקינים",
              type: "error",
              duration: 5000
            });
            resolve(null);
          });
      });
    },

    signup(
      context: {
        commit: (arg0: string, arg1: IUserInfo) => void;
      },
      payload: ISignupRequest
    ) {
      return new Promise((resolve) => {
        axios
          .post("auth/signup", payload)
          .then((res) => {
            notify({
              text: "נרשמת בהצלחה, ברוכים הבאים! נשלח אליך מייל לאימות",
              type: "success",
              duration: 10000
            });
            resolve(true);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, 'מצטערים אך ההרשמה נכשלה'),
              type: "error",
              duration: 5000
            });
            console.warn("get: ", err);
            resolve(false);
          });
      });
    },

    logout(context: {
      commit: (arg0: string, arg1: null | false) => void;
      dispatch: (arg0: string, arg1: null, arg2: any) => void;
    }) {
      axios
        .post("user/logout")
        .then(() => {
          //
        })
        .catch((err) => {
          console.warn("get: ", err);
        });
        Auth.deleteCookie();
        context.commit("SET_USER", null);
        context.commit("SET_LOGGED_IN", false);
        context.dispatch("event/setEvent", null, { root: true });
    },

    forgotPassword(
      context: {
        commit: (arg0: string, arg1: null) => void;
      },
      payload: IForgotPasswordRequest
    ) {
      return new Promise((resolve) => {
        axios
          .post("auth/forgot-password", payload)
          .then((res) => {
            notify({
              text: "נשלח אימייל לכתובת המייל לאיפוס הסיסמה",
              type: "success",
              duration: 5000
            });
            resolve(true);
          })
          .catch((err) => {
            console.warn("get: ", err);
            resolve(null);
          });
      });
    },

    resetPassword(
      context: {
        commit: (arg0: string, arg1: null) => void;
      },
      payload: any
    ) {
      return new Promise((resolve) => {
        axios
          .post("auth/reset-password", payload)
          .then((res) => {
            notify({
              text: "איפסת את הסיסמה בהצלחה",
              type: "success",
              duration: 5000
            });
            resolve(true);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, 'מצטערים אך האיפוס סיסמה נכשל'),
              type: "error",
              duration: 5000
            });
            console.warn("get: ", err);
            resolve(null);
          });
      });
    },

    confirmEmail(
      context: {
        commit: (arg0: string, arg1: null) => void;
      },
      payload: any
    ) {
      return new Promise((resolve) => {
        axios
          .post("auth/email-confirmation", payload)
          .then((res) => {
            resolve(true);
          })
          .catch((err) => {
            console.warn("get: ", err);
            resolve(false);
          });
      });
    },

    getProfile(context: {
      commit: (arg0: string, arg1: any) => void;
      dispatch: (arg0: string, arg1: any, arg2: any) => void;
    }) {
      axios
        .get("user/profile")
        .then((res) => {
          context.dispatch("event/setEvent", res.data.data.event, {
            root: true,
          });
          delete res.data.data.event;
          context.commit("SET_USER", res.data.data);
        })
        .catch((err) => {
          router.push('/logout')
          console.warn("get: ", err);
        });
    },

    updateProfile(
      context: { commit: (arg0: string, arg1: any) => void },
      payload: IUpdateUserRequest
    ) {
      return new Promise((resolve) => {
        axios
          .post("user/profile", payload)
          .then((res) => {
            notify({
              text: "פרופיל המשתמש נערך בהצלחה",
              type: "success",
              duration: 5000
            });
            context.commit("SET_USER_PROFILE_UPDATED", payload);
            resolve(res);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, 'מצטערים אך עריכת המשתמש נכשלה'),
              type: "error",
              duration: 5000
            });
            console.warn("get: ", err);
            resolve(null);
          });
      });
    },

    updatePassword(
      context: { commit: (arg0: string, arg1: any) => void },
      payload: IUpdatePasswordRequest
    ) {
      return new Promise((resolve) => {
        axios
          .post("user/password", payload)
          .then((res) => {
            notify({
              text: "הסיסמה עודכנה בהצלחה",
              type: "success",
              duration: 5000
            });
            context.commit("SET_USER_PROFILE_UPDATED", payload);
            resolve(res);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, 'מצטערים אך עדכון הסיסמה נכשל'),
              type: "error",
              duration: 5000
            });
            console.warn("get: ", err);
            resolve(null);
          });
      });
    },

    delete(context: { commit: (arg0: string, arg1: any) => void }) {
      return new Promise((resolve) => {
        axios
          .post("user/delete")
          .then((res) => {
            resolve(res);
          })
          .catch((err) => {
            console.warn("get: ", err);
            resolve(null);
          });
      });
    },

    setUserAsLoggedIn(context: {
      commit: (arg0: string, arg1: boolean) => void;
    }) {
      context.commit("SET_LOGGED_IN", true);
    },
  },

  modules: {},
};

export default UserStore;
