import axios from "axios";
import { notify } from "@kyvg/vue3-notification";
import ErrorsHandler from "@/helpers/errorsHandler";
import { IStoreOrderResult } from "@/helpers/interfaces";

const StoreModule = {
  namespaced: true,

  state: {},

  getters: {},

  mutations: {},

  actions: {
    orderDemo(
      context: {
        commit: (arg0: string, arg1: null) => void;
      },
      payload: any
    ) {
      return new Promise((resolve) => {
        axios
          .post("store/demo", payload)
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

    order(
      _context: unknown,
      payload: { subscription_id: number }
    ) {
      return new Promise<IStoreOrderResult>((resolve) => {
        axios
          .post("store/order", payload)
          .then((res) => {
            const body = res.data as {
              status?: boolean;
              message?: string;
              data?: unknown;
            };
            if (body && body.status === false) {
              resolve({
                error: ErrorsHandler.getErrorMessage({
                  response: { data: body },
                }),
              });
              return;
            }
            const raw = body?.data;
            const link =
              raw &&
              typeof raw === "object" &&
              typeof (raw as { payment_page_link?: unknown }).payment_page_link ===
                "string"
                ? String(
                    (raw as { payment_page_link: string }).payment_page_link
                  ).trim()
                : "";
            if (link) {
              resolve({ payment_page_link: link });
              return;
            }
            resolve({ error: "לא התקבל קישור תשלום מהשרת" });
          })
          .catch((err) => {
            console.warn("store/order: ", err);
            resolve({
              error: ErrorsHandler.getErrorMessage(err),
            });
          });
      });
    },
  },

  modules: {},
};

export default StoreModule;
