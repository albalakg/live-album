import axios from "axios";

const ContactStore = {
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
            resolve(true);
          })
          .catch((err) => {
            console.warn("get: ", err);
            resolve(false);
          });
      });
    },
  },

  modules: {},
};

export default ContactStore;
