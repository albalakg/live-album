import axios from "axios";
import { serialize } from "object-to-formdata";
import Time from "@/helpers/time";
import {
  IEventModuleState,
  IEventAsset,
  UpdateEventRequest,
  IEvent,
  IEventDownloadAssetsProcess,
} from "@/helpers/interfaces";
import { StatusEnum } from "@/helpers/enums";
import { EventAssetsManagementModesType } from "@/helpers/types";
import ErrorsHandler from "@/helpers/errorsHandler";
import { notify } from "@kyvg/vue3-notification";

const EventModule = {
  namespaced: true,

  state: {
    event: null as IEvent | null,
    assetsManagement: {
      mode: null,
      assetsIds: [],
    },
    gallery: {
      assets: [],
    },
  } as IEventModuleState,

  getters: {
    getFiles(state: IEventModuleState): IEventAsset[] | null {
      return state.event?.assets ?? null;
    },

    getEventStatus(state: IEventModuleState): number | null {
      return state.event?.status ?? null;
    },

    getEventName(state: IEventModuleState): string | null {
      return state.event?.name ?? null;
    },

    getEventPath(state: IEventModuleState): string | null {
      return state.event?.path ?? null;
    },

    isEventReady(state: IEventModuleState): boolean {
      return state.event?.status === StatusEnum.READY;
    },

    isEventRending(state: IEventModuleState): boolean {
      return state.event?.status === StatusEnum.PENDING;
    },

    isEventInProgress(state: IEventModuleState): boolean {
      return state.event?.status === StatusEnum.IN_PROGRESS;
    },

    isEventAvailable(state: IEventModuleState): boolean {
      return [StatusEnum.IN_PROGRESS, StatusEnum.ACTIVE].includes(state.event?.status);
    },

    getEventDate(state: IEventModuleState): string | null {
      return state.event?.starts_at
        ? Time.extractDate(state.event?.starts_at ?? "")
        : "";
    },

    getEventStartTime(state: IEventModuleState): string | null {
      return state.event?.starts_at;
    },

    getEventFinishTime(state: IEventModuleState): string | null {
      return state.event?.finished_at;
    },

    getEvent(state: IEventModuleState): IEvent | null {
      return state.event;
    },

    getTotalAssets(state: IEventModuleState): number {
      return state.event?.assets?.length ?? 0;
    },

    getAssets(state: IEventModuleState): IEventAsset[] {
      return state.event?.assets ?? [];
    },

    getGalleryAssets(state: IEventModuleState): IEventAsset[] {
      return state.gallery.assets ?? [];
    },

    getEventImage(state: IEventModuleState): string {
      return state.event?.fullPath ?? "";
    },

    hasActiveEvent(state: IEventModuleState): boolean {
      return state.event && state.event.status !== StatusEnum.INACTIVE;
    },

    getManagedAssetsMode(
      state: IEventModuleState
    ): EventAssetsManagementModesType | null {
      return state.assetsManagement.mode;
    },

    getManagedAssetsIds(state: IEventModuleState): number[] {
      return state.assetsManagement.assetsIds;
    },

    getTotalManagedAssetsIds(state: IEventModuleState): number {
      return state.assetsManagement.assetsIds.length;
    },

    getDownloadAssetsProcess(
      state: IEventModuleState
    ): null | IEventDownloadAssetsProcess {
      return state?.event?.active_download_process ?? null;
    },

    getEventProcessFileName(state: IEventModuleState): string {
      return (state?.event?.name ?? "קבצי האלבום") + ".zip";
    },
  },

  mutations: {
    SET_EVENT(state: IEventModuleState, event: IEvent) {
      state.event = event;
    },

    UPDATE_EVENT_STATUS(state: IEventModuleState, status: StatusEnum) {
      state.event.status = status;
    },

    UPDATE_EVENT(state: IEventModuleState, event: any) {
      state.event.name = event?.name ?? "";
      state.event.starts_at = event.starts_at
        ? Time.convertToLocalTime(event.starts_at)
        : "";
      state.event.finished_at = event.finished_at
        ? Time.convertToLocalTime(event.finished_at)
        : "";
      state.event.image = event?.image ?? "";
      state.event.fullPath = event?.fullPath ?? "";
    },

    SET_DOWNLOAD_ASSET_PROCESS(
      state: IEventModuleState,
      eventDownloadAssetsProcess: IEventDownloadAssetsProcess
    ) {
      state.event.active_download_process = eventDownloadAssetsProcess;
    },

    ADD_FILE(state: IEventModuleState, asset: IEventAsset) {
      asset.path =
        process.env.VUE_APP_STORAGE_BASE_URL + "/assets/" + asset.path;
      state.event.assets
        ? state.event.assets.push(asset)
        : (state.event.assets = [asset]);
    },

    SET_FILES(state: IEventModuleState, assets: IEventAsset[]) {
      if (!state.event.assets) {
        return (state.event.assets = []);
      }

      state.event.assets = assets;
    },

    SET_GALLERY_FILES(state: IEventModuleState, assets: IEventAsset[]) {
      state.gallery.assets = assets;
    },

    DELETE_FILES(state: IEventModuleState, deletedAssets: number[]) {
      if (!state.event.assets) {
        return (state.event.assets = []);
      }

      deletedAssets.forEach((deletedAsset: number) => {
        const foundIndex = state.event.assets.findIndex(
          (asset: IEventAsset) => asset.id === deletedAsset
        );
        if (foundIndex >= 0) {
          state.event.assets.splice(foundIndex, 1);
        }
      });
    },

    HIDE_FILES(state: IEventModuleState, hideAssets: number[]) {
      if (!state.event.assets) {
        return (state.event.assets = []);
      }

      hideAssets.forEach((hideAsset: number) => {
        state.event.assets.map((asset: IEventAsset) => {
          if (asset.id === hideAsset) {
            asset.is_displayed = asset.is_displayed ? 0 : 1;
          }
        });
      });
    },

    ADD_ASSET_FOR_ASSETS_MANAGEMENT(state: IEventModuleState, assetId: number) {
      if (!state.assetsManagement.assetsIds.includes(assetId)) {
        state.assetsManagement.assetsIds.push(assetId);
      }
    },

    REMOVE_ASSET_FOR_ASSETS_MANAGEMENT(
      state: IEventModuleState,
      assetId: number
    ) {
      const index = state.assetsManagement.assetsIds.findIndex(
        (item: number) => item === assetId
      );
      if (index !== -1) {
        state.assetsManagement.assetsIds.splice(index, 1);
      }
    },

    TOGGLE_ALL_ASSETS_IN_ASSETS_MANAGEMENT(
      state: IEventModuleState,
      mode: boolean
    ) {
      if (mode) {
        state.assetsManagement.assetsIds = state.event.assets.map(
          (asset: IEventAsset) => asset.id
        );
      } else {
        state.assetsManagement.assetsIds = [];
      }
    },

    SET_MODE_FOR_ASSETS_MANAGEMENT(
      state: IEventModuleState,
      mode: EventAssetsManagementModesType | null
    ) {
      state.assetsManagement.mode = mode;
    },
  },

  actions: {
    getEventBaseInfo(
      context: {
        state: IEventModuleState;
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

    getEventGuestGallery(
      context: {
        state: IEventModuleState;
        commit: (arg0: string, arg1: any) => void;
      },
      path: string
    ) {
      return new Promise((resolve) => {
        axios
          .get(`events/${path}/base-assets`)
          .then((res) => {
            res.data.data.assets = res.data.data.displayed_assets;
            context.commit("SET_EVENT", res.data.data);
            resolve(res.data);
          })
          .catch((err) => {
            resolve(null);
          });
      });
    },

    downloadAsset(
      context: {
        state: IEventModuleState;
      },
      data: { assetId: number; fileName: string }
    ) {
      return new Promise((resolve) => {
        axios
          .get(`events/${context.state.event.id}/${data.assetId}/download`, {
            responseType: "blob",
          })
          .then((res) => {
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement("a");
            link.href = url;
            const fileExtension = res.headers["content-type"].split("/")[1];
            link.setAttribute("download", data.fileName);
            document.body.appendChild(link);
            link.click();
            resolve(true);
          })
          .catch((err) => {
            resolve(false);
          });
      });
    },

    getEventAssets(context: {
      state: IEventModuleState;
      commit: (arg0: string, arg1: any) => void;
    }) {
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

    getEventGalleryAssets(context: {
      state: IEventModuleState;
      commit: (arg0: string, arg1: any) => void;
    }) {
      return new Promise((resolve) => {
        axios
          .get(`events/${context.state.event.id}/gallery-assets`)
          .then((res) => {
            context.commit("SET_GALLERY_FILES", res.data.data);
            resolve(res.data);
          })
          .catch((err) => {
            resolve(null);
          });
      });
    },

    deleteAssets(context: {
      state: IEventModuleState;
      commit: (arg0: string, arg1: any) => void;
    }) {
      return new Promise((resolve) => {
        axios
          .post(`events/${context.state.event.id}/assets/delete`, {
            assets: context.state.assetsManagement.assetsIds,
          })
          .then((res) => {
            notify({
              text: "הקבצים נמחקו בהצלחה",
              type: "success",
              duration: 5000,
            });
            context.commit(
              "DELETE_FILES",
              context.state.assetsManagement.assetsIds
            );
            context.commit("TOGGLE_ALL_ASSETS_IN_ASSETS_MANAGEMENT", false);
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

    hideAssets(context: {
      state: IEventModuleState;
      commit: (arg0: string, arg1: any) => void;
    }) {
      return new Promise((resolve) => {
        axios
          .post(`events/${context.state.event.id}/assets/hide`, {
            assets: context.state.assetsManagement.assetsIds,
          })
          .then((res) => {
            notify({
              text: "הקבצים נמחקו בהצלחה",
              type: "success",
              duration: 5000,
            });
            context.commit(
              "HIDE_FILES",
              context.state.assetsManagement.assetsIds
            );
            context.commit("TOGGLE_ALL_ASSETS_IN_ASSETS_MANAGEMENT", false);
            resolve(res.data);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(
                err,
                "מצטערים אך הייתה תקלה בהסתרת הקבצים"
              ),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          });
      });
    },

    downloadAssets(context: {
      state: IEventModuleState;
      commit: (arg0: string, arg1: any) => void;
    }) {
      return new Promise((resolve) => {
        axios
          .post(`events/${context.state.event.id}/assets/download`, {
            assets: context.state.assetsManagement.assetsIds,
          })
          .then((res) => {
            context.commit("SET_DOWNLOAD_ASSET_PROCESS", res.data.data);
            resolve(true);
          })
          .catch((err) => {
            resolve(false);
          });
      });
    },

    getDownloadAssetsProcess(context: {
      state: IEventModuleState;
      commit: (arg0: string, arg1: any) => void;
    }) {
      return new Promise((resolve) => {
        axios
          .get(`events/${context.state.event.id}/assets/download/status`)
          .then((res) => {
            context.commit("SET_DOWNLOAD_ASSET_PROCESS", res.data.data);
            resolve(res.data.data);
          })
          .catch((err) => {
            resolve(null);
          });
      });
    },

    setEvent(
      context: { commit: (arg0: string, arg1: any) => void },
      event: IEvent
    ) {
      if (event) {
        event.starts_at = event.starts_at
          ? Time.convertToLocalTime(event.starts_at)
          : "";
        event.finished_at = event.finished_at
          ? Time.convertToLocalTime(event.finished_at)
          : "";
      }
      context.commit("SET_EVENT", event);
    },

    update(
      context: {
        state: IEventModuleState;
        commit: (arg0: string, arg1: any) => void;
      },
      data: UpdateEventRequest
    ) {
      return new Promise((resolve) => {
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
              text: ErrorsHandler.getErrorMessage(
                err,
                "מצטערים אך עדכון האירוע נכשל, נסה שוב בקרוב"
              ),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          });
      });
    },

    setReady(context: {
      state: IEventModuleState;
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
      state: IEventModuleState;
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
        state: IEventModuleState;
        commit: (arg0: string, arg1: any) => void;
      },
      data: any
    ) {
      return new Promise((resolve, reject) => {
        const packageToSend = serialize({ file: data.file }, { indices: true });
        axios
          .post(
            `events/${context.state.event.id}/${
              data.isAuth ? "auth/" : ""
            }upload`,
            packageToSend,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          )
          .then((res) => {
            context.commit("ADD_FILE", res.data.data);
            resolve(res.data);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },

    addAssetForAssetsManagement(
      context: {
        state: IEventModuleState;
        commit: (arg0: string, arg1: number) => void;
      },
      assetId: number
    ) {
      context.commit("ADD_ASSET_FOR_ASSETS_MANAGEMENT", assetId);
    },

    removeAssetFromAssetsManagement(
      context: {
        state: IEventModuleState;
        commit: (arg0: string, arg1: number) => void;
      },
      assetId: number
    ) {
      context.commit("REMOVE_ASSET_FOR_ASSETS_MANAGEMENT", assetId);
    },

    toggleAllAssetsInAssetsManagement(
      context: {
        state: IEventModuleState;
        commit: (arg0: string, arg1: boolean) => void;
      },
      mode: boolean
    ) {
      context.commit("TOGGLE_ALL_ASSETS_IN_ASSETS_MANAGEMENT", mode);
    },

    setModeForAssetsManagement(
      context: {
        state: IEventModuleState;
        commit: (
          arg0: string,
          arg1: EventAssetsManagementModesType | null
        ) => void;
      },
      mode: EventAssetsManagementModesType | null
    ) {
      context.commit("SET_MODE_FOR_ASSETS_MANAGEMENT", mode);
    },
  },

  modules: {},
};

export default EventModule;
