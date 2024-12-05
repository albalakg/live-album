import axios from "axios";
import { serialize } from "object-to-formdata";
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

const UserStore = {
  namespaced: true,

  state: {
    user: null,
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
      return state.user?.first_name ?? '' + ' ' + state.user?.last_name ?? '';
    },

    getEmail(state: IUserStoreState): string | null {
      return state.user?.email ?? null;
    },

    isLoggedIn(state: IUserStoreState): boolean {
      return !!state.user;
    },

    getSubscriptionName(state: IUserStoreState): SubscriptionType | null {
      return state.user?.order?.subscription?.name ?? null;
    },

    getSubscriptionStartDate(state: IUserStoreState): string | null | undefined {
      return state.user?.order?.created_at;
    },

    getEventStatus(state: IUserStoreState): number | undefined {
      return state.user?.event.status;
    },

    hasActiveSubscription(state: IUserStoreState): boolean {
      return !!state.user?.order?.subscription;
    },
  },

  mutations: {
    SET_USER(state: IUserStoreState, user: IUserInfo | null) {
      state.user = user;
    },

    SET_USER_PROFILE_UPDATED(state: IUserStoreState, user: IUpdateUserRequest) {
      if(state.user) {
        state.user.first_name = user.first_name;
        state.user.last_name = user.last_name;
      }
    },
  },

  actions: {
    login(
      context: {
        commit: (arg0: string, arg1: IUserInfo) => void;
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
            resolve(user);
          })
          .catch((err) => {
            console.warn("get: ", err);
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
            resolve(true);
          })
          .catch((err) => {
            console.warn("get: ", err);
            resolve(false);
          });
      });
    },

    logout(context: { commit: (arg0: string, arg1: null) => void }) {
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
            resolve(true);
          })
          .catch((err) => {
            console.warn("get: ", err);
            resolve(false);
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
            resolve(true);
          })
          .catch((err) => {
            console.warn("get: ", err);
            resolve(false);
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

    getProfile(context: { commit: (arg0: string, arg1: any) => void }) {
      axios
        .get("user/profile")
        .then((res) => {
          context.commit("SET_USER", res.data.data);
        })
        .catch((err) => {
          console.warn("get: ", err);
        });
    },

    updateProfile(context: { commit: (arg0: string, arg1: any) => void }, payload: IUpdateUserRequest) {
      return new Promise((resolve) => {
        axios
        .post("user/profile", payload)
        .then((res) => {
          context.commit("SET_USER_PROFILE_UPDATED", payload);
          resolve(res);
        })
        .catch((err) => {
          console.warn("get: ", err);
        });
      })
    },

    updatePassword(context: { commit: (arg0: string, arg1: any) => void }, payload: IUpdatePasswordRequest) {
      return new Promise((resolve) => {
        axios
        .post("user/password", payload)
        .then((res) => {
          context.commit("SET_USER_PROFILE_UPDATED", payload);
          resolve(res);
        })
        .catch((err) => {
          console.warn("get: ", err);
        });
      })
    },

    setUserAsLoggedIn(
      context: {
        commit: (arg0: string, arg1: IUserInfo) => void;
      },
      data: any
    ) {
      delete data.token;
      delete data.expired_at;
    },
  },

  modules: {},
};

export default UserStore;
