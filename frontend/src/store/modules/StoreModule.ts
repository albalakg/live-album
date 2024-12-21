import axios from "axios";
import { notify } from "@kyvg/vue3-notification";
import ErrorsHandler from "@/helpers/errorsHandler";

const StoreModule = {
  namespaced: true,

  state: {},

  getters: {},

  mutations: {},

  actions: {
    order(
      context: {
        commit: (arg0: string, arg1: null) => void;
      },
      payload: any
    ) {
      return new Promise((resolve) => {
        axios
          .post("store/order", payload)
          .then((res) => {
            resolve(res.data.data);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err),
              type: "error",
              duration: 5000
            });
            console.warn("get: ", err);
            resolve(null);
          });
      });
    },
  },

  modules: {},
};

export default StoreModule;
