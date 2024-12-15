import axios from "axios";
import { serialize } from "object-to-formdata";
import Time from "@/helpers/time";
import {
  IEventStoreState,
  IEventAsset,
  UpdateEventRequest,
  IEvent,
} from "@/helpers/interfaces";
import { StatusEnum } from "@/helpers/enums";
import ErrorsHandler from "@/helpers/errorsHandler";
import { notify } from "@kyvg/vue3-notification";

const EventStore = {
  namespaced: true,

  state: {
    event: null as IEvent | null,
  } as IEventStoreState,

  getters: {
    getFiles(state: IEventStoreState): IEventAsset[] {
      return state.event.assets;
    },

    getEventStatus(state: IEventStoreState): number | null {
      return state.event?.status;
    },

    getEventName(state: IEventStoreState): string | null {
      return state.event?.name;
    },

    getEventPath(state: IEventStoreState): string | null {
      return state.event?.path;
    },

    isEventReady(state: IEventStoreState): boolean {
      return state.event?.status === StatusEnum.READY;
    },

    isEventRending(state: IEventStoreState): boolean {
      return state.event?.status === StatusEnum.PENDING;
    },

    getEventDate(state: IEventStoreState): string | null {
      return Time.extractDate(state.event?.starts_at ?? "");
    },

    getEventStartTime(state: IEventStoreState): string | null {
      return state.event?.starts_at;
    },

    getEventFinishTime(state: IEventStoreState): string | null {
      return state.event?.finished_at;
    },

    getEvent(state: IEventStoreState): IEvent | null {
      return state.event;
    },

    getTotalAssets(state: IEventStoreState): number {
      return state.event?.assets?.length ?? 0;
    },

    getAssets(state: IEventStoreState): IEventAsset[] {
      return state.event?.assets ?? [];
    },

    getEventImage(state: IEventStoreState): string {
      return process.env.VUE_APP_STORAGE_BASE_URL + "/" + state.event?.image;
    },

    hasActiveEvent(state: IEventStoreState): boolean {
      return state.event && state.event.status !== StatusEnum.INACTIVE;
    },
  },

  mutations: {
    SET_EVENT(state: IEventStoreState, event: IEvent) {
      console.log("SET_EVENT", event);

      state.event = event;
    },

    UPDATE_EVENT_STATUS(state: IEventStoreState, status: StatusEnum) {
      state.event.status = status;
    },

    UPDATE_EVENT(state: IEventStoreState, event: any) {
      state.event.name = event?.name ?? "";
      state.event.starts_at = event?.starts_at ?? "";
      state.event.image = event?.image ?? "";
    },

    ADD_FILE(state: IEventStoreState, asset: IEventAsset) {
      asset.path =
        process.env.VUE_APP_STORAGE_BASE_URL + "/assets/" + asset.path;
      state.event.assets
        ? state.event.assets.push(asset)
        : (state.event.assets = [asset]);
    },

    SET_FILES(state: IEventStoreState, assets: IEventAsset[]) {
      if (!state.event.assets) {
        return (state.event.assets = []);
      }

      assets.forEach((asset) => {
        if (
          !state.event.assets.map((asset) => asset.path).includes(asset.path)
        ) {
          state.event.assets.push(asset);
        }
      });
    },

    DELETE_FILES(state: IEventStoreState, deletedAssets: number[]) {
      if (!state.event.assets) {
        return (state.event.assets = []);
      }

      deletedAssets.forEach((deletedAsset, index) => {
        const foundIndex = state.event.assets.findIndex(
          (asset) => asset.id === deletedAsset
        );
        if (foundIndex >= 0) {
          state.event.assets.splice(foundIndex, 1);
        }

        // if (
        //   state.event.assets.map((asset) => asset.id).includes(deletedAsset)
        // ) {
        //   state.event.assets.splice(index, 1)
        // }
      });
    },
  },

  actions: {
    getEventBaseInfo(
      context: {
        state: IEventStoreState;
        commit: (arg0: string, arg1: any) => void;
      },
      path: string
    ) {
      return new Promise((resolve) => {
        axios
          .get(`events/${path}/base-info`)
          .then((res) => {
            context.commit("SET_EVENT", res.data.data);
            resolve(res.data);
          })
          .catch((err) => {
            resolve(null);
          });
      });
    },

    getEventAssets(
      context: {
        state: IEventStoreState;
        commit: (arg0: string, arg1: any) => void;
      },
      path: string
    ) {
      return new Promise((resolve) => {
        axios
          .get(`events/${context.state.event.id}/assets`)
          .then((res) => {
            context.commit("SET_FILES", res.data.data);
            resolve(res.data);
          })
          .catch((err) => {
            resolve(null);
          });
      });
    },

    deleteAssets(
      context: {
        state: IEventStoreState;
        commit: (arg0: string, arg1: any) => void;
      },
      assets: number[]
    ) {
      return new Promise((resolve) => {
        axios
          .post(`events/${context.state.event.id}/assets/delete`, { assets })
          .then((res) => {
            notify({
              text: "הקבצים נמחקו בהצלחה",
              type: "success",
              duration: 5000,
            });
            context.commit("DELETE_FILES", assets);
            resolve(res.data);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(
                err,
                "מצטערים אך הייתה תקלה במחיקת הקבצים"
              ),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          });
      });
    },

    downloadAssets(
      context: {
        state: IEventStoreState;
        commit: (arg0: string, arg1: any) => void;
      },
      assets: number[]
    ) {
      // eslint-disable-next-line no-async-promise-executor
      return new Promise(async (resolve) => {
        try {
          // Make a POST request to your backend
          const response = await axios.post(
            `events/${context.state.event.id}/assets/download`,
            {
              assets: assets, // Send the selected assets
            },
            {
              responseType: "blob", // Important: This tells axios to handle the response as binary data
            }
          );

          // Get the filename from Content-Disposition header
          const contentDisposition = response.headers["content-disposition"];
          const fileName = contentDisposition
            ? contentDisposition.split("filename=")[1].replace(/"/g, "")
            : "download.zip";

          // Create a link to download the blob file
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
          resolve(true);
        } catch (error) {
          console.error("Error downloading files:", error);
          alert("An error occurred while downloading the files.");
          resolve(false);
        }
      });
    },

    setEvent(
      context: { commit: (arg0: string, arg1: any) => void },
      event: IEvent
    ) {
      if (event) {
        event.starts_at = Time.convertToLocalTime(event.starts_at ?? "");
        event.finished_at = Time.convertToLocalTime(event.finished_at ?? "");
      }
      context.commit("SET_EVENT", event);
    },

    update(
      context: {
        state: IEventStoreState;
        commit: (arg0: string, arg1: any) => void;
      },
      data: UpdateEventRequest
    ) {
      return new Promise((resolve, reject) => {
        const packageToSend = serialize(data, { indices: true });
        axios
          .post(`events/${context.state.event.id}/update`, packageToSend, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            notify({
              text: "האירוע עודכן בהצלחה",
              type: "success",
              duration: 5000,
            });
            context.commit("UPDATE_EVENT", res.data.data);
            resolve(res.data);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(err, 'מצטערים אך עדכון האירוע נכשל, נסה שוב בקרוב'),
              type: "error",
              duration: 5000
            });
            resolve(null);
          });
      });
    },

    setReady(context: {
      state: IEventStoreState;
      commit: (arg0: string, arg1: any) => void;
    }) {
      return new Promise((resolve, reject) => {
        axios
          .post(`events/${context.state.event.id}/ready`)
          .then((res) => {
            notify({
              text: "האירוע עודכן לסטטוס מוכן (מחכה לתחילת האירוע)",
              type: "success",
              duration: 5000,
            });
            context.commit("UPDATE_EVENT_STATUS", StatusEnum.READY);
            resolve(res.data);
          })
          .catch((err) => {
            resolve(null);
          });
      });
    },

    setPending(context: {
      state: IEventStoreState;
      commit: (arg0: string, arg1: any) => void;
    }) {
      return new Promise((resolve, reject) => {
        axios
          .post(`events/${context.state.event.id}/pending`)
          .then((res) => {
            notify({
              text: "האירוע עודכן לסטטוס ממתין (ניתן לעריכה מלאה)",
              type: "success",
              duration: 5000,
            });
            context.commit("UPDATE_EVENT_STATUS", StatusEnum.PENDING);
            resolve(res.data);
          })
          .catch((err) => {
            resolve(null);
          });
      });
    },

    uploadFile(
      context: {
        state: IEventStoreState;
        commit: (arg0: string, arg1: any) => void;
      },
      file: any
    ) {
      return new Promise((resolve, reject) => {
        const packageToSend = serialize({ file }, { indices: true });
        axios
          .post(`events/${context.state.event.id}/upload`, packageToSend, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          })
          .then((res) => {
            context.commit("ADD_FILE", res.data);
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
  },

  modules: {},
};

export default EventStore;
