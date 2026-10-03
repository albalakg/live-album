import axios from "axios";
import { notify } from "@kyvg/vue3-notification";
import ErrorsHandler from "@/helpers/errorsHandler";
import Time from "@/helpers/time";
import {
  IWhatsAppCampaign,
  IWhatsAppGuest,
  IWhatsAppModuleState,
  IWhatsAppQuota,
  IWhatsAppRecipientStatus,
} from "@/helpers/interfaces";

function getEventId(rootState: { event: { event: { id?: number } | null } }): number | null {
  return rootState.event.event?.id ?? null;
}

function extractData<T>(res: { data: { data?: T } | T }): T {
  const payload = res.data as { data?: T };
  return (payload.data ?? res.data) as T;
}

function extractList<T>(
  res: { data: unknown },
  listKey: string
): T[] {
  const raw = res.data;

  if (Array.isArray(raw)) {
    return raw as T[];
  }

  if (!raw || typeof raw !== "object") {
    return [];
  }

  const obj = raw as Record<string, unknown>;

  if (Array.isArray(obj[listKey])) {
    return obj[listKey] as T[];
  }

  const inner = obj.data ?? raw;

  if (Array.isArray(inner)) {
    return inner as T[];
  }

  if (inner && typeof inner === "object") {
    const innerObj = inner as Record<string, unknown>;

    if (Array.isArray(innerObj[listKey])) {
      return innerObj[listKey] as T[];
    }

    if (Array.isArray(innerObj.data)) {
      return innerObj.data as T[];
    }
  }

  return [];
}

const WhatsAppModule = {
  namespaced: true,

  state: {
    guests: [],
    quota: null,
    campaigns: [],
    campaignDetail: null,
    loading: false,
  } as IWhatsAppModuleState,

  getters: {
    getGuests(state: IWhatsAppModuleState): IWhatsAppGuest[] {
      return state.guests;
    },

    getQuota(state: IWhatsAppModuleState): IWhatsAppQuota | null {
      return state.quota;
    },

    getCampaigns(state: IWhatsAppModuleState): IWhatsAppCampaign[] {
      return state.campaigns;
    },

    getCampaignDetail(state: IWhatsAppModuleState) {
      return state.campaignDetail;
    },

    isLoading(state: IWhatsAppModuleState): boolean {
      return state.loading;
    },
  },

  mutations: {
    SET_GUESTS(state: IWhatsAppModuleState, guests: IWhatsAppGuest[]) {
      state.guests = guests;
    },

    SET_QUOTA(state: IWhatsAppModuleState, quota: IWhatsAppQuota | null) {
      state.quota = quota;
    },

    SET_CAMPAIGNS(state: IWhatsAppModuleState, campaigns: IWhatsAppCampaign[]) {
      state.campaigns = campaigns;
    },

    SET_CAMPAIGN_DETAIL(
      state: IWhatsAppModuleState,
      detail: IWhatsAppModuleState["campaignDetail"]
    ) {
      state.campaignDetail = detail;
    },

    SET_LOADING(state: IWhatsAppModuleState, loading: boolean) {
      state.loading = loading;
    },
  },

  actions: {
    fetchGuests(
      context: {
        commit: (key: string, value: unknown) => void;
        rootState: { event: { event: { id?: number } | null } };
      }
    ) {
      const eventId = getEventId(context.rootState);
      if (!eventId) return Promise.resolve(null);

      context.commit("SET_LOADING", true);
      return new Promise((resolve) => {
        axios
          .get(`events/${eventId}/whatsapp/guests`)
          .then((res) => {
            const guests = extractList<IWhatsAppGuest>(res, "guests");
            context.commit("SET_GUESTS", guests);
            resolve(guests);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, "שגיאה בטעינת רשימת האורחים"),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          })
          .finally(() => {
            context.commit("SET_LOADING", false);
          });
      });
    },

    createGuest(
      context: {
        commit: (key: string, value: unknown) => void;
        dispatch: (key: string) => Promise<unknown>;
        rootState: { event: { event: { id?: number } | null } };
      },
      payload: { full_name: string; phone: string }
    ) {
      const eventId = getEventId(context.rootState);
      if (!eventId) return Promise.resolve(null);

      return new Promise((resolve) => {
        axios
          .post(`events/${eventId}/whatsapp/guests`, payload)
          .then(() => {
            notify({
              text: "האורח נוסף בהצלחה",
              type: "success",
              duration: 5000,
            });
            context.dispatch("fetchGuests");
            resolve(true);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, "שגיאה בהוספת אורח"),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          });
      });
    },

    updateGuest(
      context: {
        dispatch: (key: string) => Promise<unknown>;
        rootState: { event: { event: { id?: number } | null } };
      },
      payload: { id: number; full_name: string; phone: string }
    ) {
      const eventId = getEventId(context.rootState);
      if (!eventId) return Promise.resolve(null);

      return new Promise((resolve) => {
        axios
          .put(`events/${eventId}/whatsapp/guests/${payload.id}`, {
            full_name: payload.full_name,
            phone: payload.phone,
          })
          .then(() => {
            notify({
              text: "פרטי האורח עודכנו בהצלחה",
              type: "success",
              duration: 5000,
            });
            context.dispatch("fetchGuests");
            resolve(true);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, "שגיאה בעדכון אורח"),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          });
      });
    },

    deleteGuests(
      context: {
        dispatch: (key: string) => Promise<unknown>;
        rootState: { event: { event: { id?: number } | null } };
      },
      guestIds: number[]
    ) {
      const eventId = getEventId(context.rootState);
      if (!eventId || !guestIds.length) return Promise.resolve(null);

      const count = guestIds.length;

      return new Promise((resolve) => {
        axios
          .delete(`events/${eventId}/whatsapp/guests`, {
            data: { guest_ids: guestIds },
          })
          .then(() => {
            notify({
              text:
                count === 1
                  ? "האורח נמחק בהצלחה"
                  : `${count} אורחים נמחקו בהצלחה`,
              type: "success",
              duration: 5000,
            });
            context.dispatch("fetchGuests");
            resolve(true);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, "שגיאה במחיקת אורחים"),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          });
      });
    },

    importGuests(
      context: {
        dispatch: (key: string) => Promise<unknown>;
        rootState: { event: { event: { id?: number } | null } };
      },
      file: File
    ) {
      const eventId = getEventId(context.rootState);
      if (!eventId) return Promise.resolve(null);

      const formData = new FormData();
      formData.append("file", file);

      return new Promise((resolve) => {
        axios
          .post(`events/${eventId}/whatsapp/guests/import`, formData, {
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
          })
          .then(() => {
            notify({
              text: "הקובץ יובא בהצלחה",
              type: "success",
              duration: 5000,
            });
            context.dispatch("fetchGuests");
            resolve(true);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, "שגיאה בייבוא הקובץ"),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          });
      });
    },

    downloadTemplate(context: {
      rootState: { event: { event: { id?: number } | null } };
    }) {
      const eventId = getEventId(context.rootState);
      if (!eventId) return Promise.resolve(null);

      return new Promise((resolve) => {
        axios
          .get(`events/${eventId}/whatsapp/guests/template`, {
            responseType: "blob",
          })
          .then((res) => {
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "guests_template.csv");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            resolve(true);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, "שגיאה בהורדת התבנית"),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          });
      });
    },

    fetchQuota(
      context: {
        commit: (key: string, value: unknown) => void;
        rootState: { event: { event: { id?: number } | null } };
      }
    ) {
      const eventId = getEventId(context.rootState);
      if (!eventId) return Promise.resolve(null);

      return new Promise((resolve) => {
        axios
          .get(`events/${eventId}/whatsapp/quota`)
          .then((res) => {
            const quota = extractData<IWhatsAppQuota>(res);
            context.commit("SET_QUOTA", quota);
            resolve(quota);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, "שגיאה בטעינת מכסת ההודעות"),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          });
      });
    },

    sendCampaign(
      context: {
        dispatch: (key: string) => Promise<unknown>;
        rootState: { event: { event: { id?: number } | null } };
      },
      payload: {
        message: string;
        guest_ids: number[];
        send_mode: "immediate" | "scheduled";
        scheduled_at?: Date | string | null;
      }
    ) {
      const eventId = getEventId(context.rootState);
      if (!eventId) return Promise.resolve(null);

      const body: {
        message: string;
        guest_ids: number[];
        send_mode: "immediate" | "scheduled";
        scheduled_at?: string;
      } = {
        message: payload.message,
        guest_ids: payload.guest_ids,
        send_mode: payload.send_mode,
      };

      if (payload.scheduled_at) {
        body.scheduled_at = Time.toUTC(payload.scheduled_at);
      }

      return new Promise((resolve) => {
        axios
          .post(`events/${eventId}/whatsapp/campaigns`, body)
          .then(() => {
            notify({
              text: payload.send_mode === "scheduled"
                ? "ההודעה תוזמנה בהצלחה"
                : "ההודעה נשלחה בהצלחה",
              type: "success",
              duration: 5000,
            });
            context.dispatch("fetchQuota");
            context.dispatch("fetchCampaigns");
            resolve(true);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, "שגיאה בשליחת ההודעה"),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          });
      });
    },

    fetchCampaigns(
      context: {
        commit: (key: string, value: unknown) => void;
        rootState: { event: { event: { id?: number } | null } };
      }
    ) {
      const eventId = getEventId(context.rootState);
      if (!eventId) return Promise.resolve(null);

      return new Promise((resolve) => {
        axios
          .get(`events/${eventId}/whatsapp/campaigns`)
          .then((res) => {
            const campaigns = extractList<IWhatsAppCampaign>(res, "campaigns");
            context.commit("SET_CAMPAIGNS", campaigns);
            resolve(campaigns);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, "שגיאה בטעינת היסטוריית שליחות"),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          });
      });
    },

    fetchCampaignDetail(
      context: {
        commit: (key: string, value: unknown) => void;
        rootState: { event: { event: { id?: number } | null } };
      },
      campaignId: number
    ) {
      const eventId = getEventId(context.rootState);
      if (!eventId) return Promise.resolve(null);

      context.commit("SET_LOADING", true);
      return new Promise((resolve) => {
        axios
          .get(`events/${eventId}/whatsapp/campaigns/${campaignId}`)
          .then((res) => {
            const detail = extractData<{
              campaign: IWhatsAppCampaign;
              recipients: IWhatsAppRecipientStatus[];
            }>(res);
            context.commit("SET_CAMPAIGN_DETAIL", detail);
            resolve(detail);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, "שגיאה בטעינת פרטי השליחה"),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          })
          .finally(() => {
            context.commit("SET_LOADING", false);
          });
      });
    },

    clearCampaignDetail(context: {
      commit: (key: string, value: unknown) => void;
    }) {
      context.commit("SET_CAMPAIGN_DETAIL", null);
    },

    cancelCampaign(
      context: {
        dispatch: (key: string) => Promise<unknown>;
        rootState: { event: { event: { id?: number } | null } };
      },
      campaignId: number
    ) {
      const eventId = getEventId(context.rootState);
      if (!eventId) return Promise.resolve(null);

      return new Promise((resolve) => {
        axios
          .post(`events/${eventId}/whatsapp/campaigns/${campaignId}/cancel`)
          .then(() => {
            notify({
              text: "השליחה בוטלה בהצלחה",
              type: "success",
              duration: 5000,
            });
            context.dispatch("fetchCampaigns");
            context.dispatch("fetchQuota");
            resolve(true);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, "שגיאה בביטול השליחה"),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          });
      });
    },
  },
};

export default WhatsAppModule;
