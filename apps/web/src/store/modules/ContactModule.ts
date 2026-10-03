import axios from "axios";
import { notify } from "@kyvg/vue3-notification";
import ErrorsHandler from "@/helpers/errorsHandler";

const ContactModule = {
  namespaced: true,

  state: {},

  getters: {},

  mutations: {},

  actions: {
    send(
      context: {
        commit: (arg0: string, arg1: null) => void;
      },
      payload: any
    ) {
      return new Promise((resolve) => {
        axios
          .post("contact", payload)
          .then((res) => {
            notify({
              text: "הבקשה נשלחה בהצלחה, תודה ונתייחס בקרוב",
              type: "success",
              duration: 5000
            });
            resolve(true);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err),
              type: "error",
              duration: 5000
            });
            console.warn("get: ", err);
            resolve(false);
          });
      });
    },
  },

  modules: {},
};

export default ContactModule;
