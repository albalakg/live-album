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

    verifyDiscountCode(_context: unknown, code: string) {
      return new Promise<{ valid: boolean; code?: string; percent?: number }>(
        (resolve) => {
          axios
            .post("store/discount-code/verify", { code })
            .then((res) => {
              const data = res.data?.data ?? {};
              if (data.valid && data.code && data.percent) {
                resolve({
                  valid: true,
                  code: String(data.code),
                  percent: Number(data.percent),
                });
                return;
              }
              resolve({ valid: false });
            })
            .catch(() => {
              resolve({ valid: false });
            });
        }
      );
    },

    order(
      _context: unknown,
      payload: { subscription: string; discount_code?: string }
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
            if (
              raw &&
              typeof raw === "object" &&
              (raw as { confirmed?: unknown }).confirmed === true
            ) {
              resolve({ confirmed: true });
              return;
            }
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
