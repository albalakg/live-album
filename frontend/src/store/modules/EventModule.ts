import axios from "axios";
import type { AxiosProgressEvent } from "axios";
import { serialize } from "object-to-formdata";
import Time from "@/helpers/time";
import {
  IEventModuleState,
  IEventAsset,
  UpdateEventRequest,
  IEvent,
  IEventDownloadAssetsProcess,
  IUpdateQrCardSettingsRequest,
  EventGalleryAudience,
} from "@/helpers/interfaces";
import {
  AssetModerationStatusEnum,
  getAssetModerationStatus,
  StatusEnum,
  SubscriptionTypesEnum,
} from "@/helpers/enums";
import {
  EventAssetsManagementModesType,
  EventGalleryType,
} from "@/helpers/types";
import ErrorsHandler from "@/helpers/errorsHandler";
import { notify } from "@kyvg/vue3-notification";

function asAssetArray(assets: unknown): IEventAsset[] {
  if (Array.isArray(assets)) {
    return assets.map(normalizeEventAsset);
  }
  return [];
}

function normalizeEventAsset(asset: IEventAsset): IEventAsset {
  const moderationStatus = getAssetModerationStatus(asset);
  return {
    ...asset,
    status: moderationStatus,
    moderation_status: moderationStatus,
  };
}

function extractAssetsPayload(payload: unknown): unknown {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload == null || typeof payload !== "object") {
    return payload;
  }

  const data = payload as Record<string, unknown>;
  const primaryAssets = data.assets ?? data.displayed_assets;
  const blockedAssets = data.blocked_assets;

  if (Array.isArray(primaryAssets) && Array.isArray(blockedAssets)) {
    return [...primaryAssets, ...blockedAssets];
  }

  if (primaryAssets != null) {
    return primaryAssets;
  }

  return payload;
}

function filterAssetsByModeration(
  assets: unknown,
  statuses: AssetModerationStatusEnum[]
): IEventAsset[] {
  return asAssetArray(assets).filter((asset) =>
    statuses.includes(getAssetModerationStatus(asset))
  );
}

interface IUploadFilePayload {
  file: File;
  isAuth: boolean;
  onUploadProgress?: (event: AxiosProgressEvent) => void;
  signal?: AbortSignal;
}

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
      showBlockedAssets: false,
    },
    galleryAudience: "owner",
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

    isEventPending(state: IEventModuleState): boolean {
      return state.event?.status === StatusEnum.PENDING;
    },

    isEventInProgress(state: IEventModuleState): boolean {
      return state.event?.status === StatusEnum.IN_PROGRESS;
    },

    isEventActive(state: IEventModuleState): boolean {
      return state.event?.status === StatusEnum.ACTIVE;
    },

    isEventInactive(state: IEventModuleState): boolean {
      return state.event?.status === StatusEnum.INACTIVE;
    },

    isEventAvailable(state: IEventModuleState): boolean {
      return [StatusEnum.IN_PROGRESS, StatusEnum.ACTIVE].includes(
        state.event?.status
      );
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
      const assets = state.event?.assets ?? [];
      return filterAssetsByModeration(assets, [
        AssetModerationStatusEnum.ACTIVE,
        AssetModerationStatusEnum.PENDING,
      ]).length;
    },

    getAssets(state: IEventModuleState): IEventAsset[] {
      return asAssetArray(state.event?.assets);
    },

    getGalleryAssets(state: IEventModuleState): IEventAsset[] {
      return state.gallery.assets ?? [];
    },

    getActiveGalleryAssets(state: IEventModuleState): IEventAsset[] {
      return filterAssetsByModeration(state.gallery.assets ?? [], [
        AssetModerationStatusEnum.ACTIVE,
      ]);
    },

    getDisplayGalleryAssets(
      state: IEventModuleState,
      getters: { getActiveGalleryAssets: IEventAsset[]; getBlockedAssets: IEventAsset[] }
    ): IEventAsset[] {
      const activeAssets = getters.getActiveGalleryAssets;
      if (!state.gallery.showBlockedAssets) {
        return activeAssets;
      }

      return [...activeAssets, ...getters.getBlockedAssets];
    },

    showBlockedGalleryAssets(state: IEventModuleState): boolean {
      return state.gallery.showBlockedAssets;
    },

    getOwnerVisibleAssets(state: IEventModuleState): IEventAsset[] {
      return filterAssetsByModeration(state.event?.assets ?? [], [
        AssetModerationStatusEnum.ACTIVE,
        AssetModerationStatusEnum.PENDING,
      ]);
    },

    getBlockedAssets(state: IEventModuleState): IEventAsset[] {
      return filterAssetsByModeration(state.event?.assets ?? [], [
        AssetModerationStatusEnum.BLOCKED,
      ]);
    },

    hasBlockedAssets(state: IEventModuleState): boolean {
      return filterAssetsByModeration(state.event?.assets ?? [], [
        AssetModerationStatusEnum.BLOCKED,
      ]).length > 0;
    },

    hasPendingAssets(state: IEventModuleState): boolean {
      return filterAssetsByModeration(state.event?.assets ?? [], [
        AssetModerationStatusEnum.PENDING,
      ]).length > 0;
    },

    getActiveGuestAssets(state: IEventModuleState): IEventAsset[] {
      return filterAssetsByModeration(state.event?.assets ?? [], [
        AssetModerationStatusEnum.ACTIVE,
      ]);
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

    showTrialGalleryWatermark(
      state: IEventModuleState,
      _getters: unknown,
      _rootState: unknown,
      rootGetters: { "user/getSubscriptionName"?: SubscriptionTypesEnum | null }
    ): boolean {
      const eventSubscription = state.event?.subscription_name;
      if (eventSubscription === SubscriptionTypesEnum.DEMO) {
        return true;
      }
      if (state.galleryAudience === "guest") {
        return false;
      }
      return (
        rootGetters["user/getSubscriptionName"] === SubscriptionTypesEnum.DEMO
      );
    },
  },

  mutations: {
    SET_GALLERY_AUDIENCE(
      state: IEventModuleState,
      audience: EventGalleryAudience
    ) {
      state.galleryAudience = audience;
    },

    SET_EVENT(state: IEventModuleState, event: IEvent | null) {
      if (!event) {
        state.event = null as unknown as IEvent;
        return;
      }

      if (event.assets != null) {
        event.assets = asAssetArray(event.assets);
      }
      const raw = event as IEvent & {
        subscription?: { name?: SubscriptionTypesEnum | string };
        subscription_name?: SubscriptionTypesEnum | string | null;
      };
      if (!raw.subscription_name && raw.subscription?.name) {
        raw.subscription_name = raw.subscription.name;
      }
      state.event = raw;
    },

    UPDATE_EVENT_STATUS(state: IEventModuleState, status: StatusEnum) {
      state.event.status = status;
    },

    UPDATE_GALLERY_SETTINGS(
      state: IEventModuleState,
      settings: { selectedAlbum: EventGalleryType }
    ) {
      state.event.config.displayed_gallery = settings.selectedAlbum;
    },

    UPDATE_QR_CARD_SETTINGS(
      state: IEventModuleState,
      settings: IUpdateQrCardSettingsRequest
    ) {
      state.event.config.qr_card_design = settings.design;
      state.event.config.qr_card_text = settings.text;
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

      console.log({ event });

      if (event?.config) {
        state.event.config = event?.config;
      }
    },

    SET_DOWNLOAD_ASSET_PROCESS(
      state: IEventModuleState,
      eventDownloadAssetsProcess: IEventDownloadAssetsProcess
    ) {
      state.event.active_download_process = eventDownloadAssetsProcess;
    },

    ADD_FILE(state: IEventModuleState, asset: IEventAsset) {
      const normalizedAsset = normalizeEventAsset({
        ...asset,
        path:
          process.env.VUE_APP_STORAGE_BASE_URL + "/assets/" + asset.path,
        status:
          asset.status ??
          asset.moderation_status ??
          AssetModerationStatusEnum.PENDING,
      });
      state.event.assets
        ? state.event.assets.push(normalizedAsset)
        : (state.event.assets = [normalizedAsset]);
    },

    SET_FILES(state: IEventModuleState, assets: unknown) {
      if (!state.event) {
        return;
      }

      state.event.assets = asAssetArray(assets);
    },

    SET_GALLERY_FILES(state: IEventModuleState, assets: unknown) {
      state.gallery.assets = asAssetArray(assets);
    },

    SET_SHOW_BLOCKED_GALLERY_ASSETS(
      state: IEventModuleState,
      showBlockedAssets: boolean
    ) {
      state.gallery.showBlockedAssets = showBlockedAssets;
    },

    UNBLOCK_FILES(state: IEventModuleState, unblockedAssets: number[]) {
      if (!state.event?.assets) {
        return;
      }

      unblockedAssets.forEach((assetId: number) => {
        const asset = state.event.assets.find(
          (item: IEventAsset) => item.id === assetId
        );
        if (!asset) {
          return;
        }

        asset.moderation_status = AssetModerationStatusEnum.ACTIVE;
        asset.status = AssetModerationStatusEnum.ACTIVE;
        asset.moderation_labels = null;
        asset.moderation_source = undefined;
        asset.is_blocked = 0;
      });
    },

    BLOCK_FILES(state: IEventModuleState, blockedAssets: number[]) {
      if (!state.event?.assets) {
        return;
      }

      blockedAssets.forEach((assetId: number) => {
        const asset = state.event.assets.find(
          (item: IEventAsset) => item.id === assetId
        );
        if (!asset) {
          return;
        }

        asset.moderation_status = AssetModerationStatusEnum.BLOCKED;
        asset.status = AssetModerationStatusEnum.BLOCKED;
        asset.moderation_labels = null;
        asset.moderation_source = "manual";
        asset.is_blocked = 1;
      });
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
        const manageable = filterAssetsByModeration(state.event?.assets ?? [], [
          AssetModerationStatusEnum.ACTIVE,
          AssetModerationStatusEnum.PENDING,
        ]);
        state.assetsManagement.assetsIds = manageable.map(
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
        commit: (mutation: string, payload?: unknown) => void;
      },
      path: string
    ) {
      return new Promise((resolve) => {
        axios
          .get(`events/${path}/base-info`)
          .then((res) => {
            context.commit("SET_GALLERY_AUDIENCE", "owner");
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
        commit: (mutation: string, payload?: unknown) => void;
      },
      path: string
    ) {
      return new Promise((resolve) => {
        axios
          .get(`events/${path}/base-assets`)
          .then((res) => {
            res.data.data.assets = asAssetArray(res.data.data.displayed_assets);
            context.commit("SET_GALLERY_AUDIENCE", "guest");
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
        if (!context.state.event?.id) {
          resolve(null);
          return;
        }

        axios
          .get(`events/${context.state.event.id}/assets`)
          .then((res) => {
            context.commit(
              "SET_FILES",
              extractAssetsPayload(res.data?.data ?? res.data)
            );
            resolve(res.data);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(
                err,
                "מצטערים אך הייתה תקלה בטעינת הקבצים"
              ),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          });
      });
    },

    getEventGalleryAssets(
      context: {
        state: IEventModuleState;
        commit: (arg0: string, arg1: any) => void;
      },
      guestToken: string | null = null
    ) {
      return new Promise((resolve) => {
        const queryString = guestToken ? "?token=" + guestToken : "";
        const url = queryString
          ? `events/${context.state.event.id}/gallery-guests-assets${queryString}`
          : `events/${context.state.event.id}/gallery-assets`;
        console.log("URL:", url);
        axios
          .get(url)
          .then((res) => {
            context.commit(
              "SET_GALLERY_FILES",
              extractAssetsPayload(res.data?.data ?? res.data)
            );
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

    unblockAssets(
      context: {
        state: IEventModuleState;
        commit: (arg0: string, arg1: any) => void;
        dispatch: (arg0: string) => Promise<unknown>;
      },
      assetIds: number[]
    ) {
      return new Promise((resolve) => {
        axios
          .post(`events/${context.state.event.id}/assets/unblock`, {
            assets: assetIds,
          })
          .then(async (res) => {
            notify({
              text: "החסימה הוסרה והקובץ יוצג שוב באלבום",
              type: "success",
              duration: 5000,
            });
            context.commit("UNBLOCK_FILES", assetIds);
            await context.dispatch("getEventGalleryAssets");
            resolve(res.data);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(
                err,
                "מצטערים אך הייתה תקלה בביטול החסימה"
              ),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          });
      });
    },

    blockAssets(
      context: {
        state: IEventModuleState;
        commit: (arg0: string, arg1: any) => void;
        dispatch: (arg0: string) => Promise<unknown>;
      },
      assetIds?: number[]
    ) {
      const ids =
        assetIds && assetIds.length
          ? assetIds
          : context.state.assetsManagement.assetsIds;

      return new Promise((resolve) => {
        if (!ids.length) {
          resolve(null);
          return;
        }

        axios
          .post(`events/${context.state.event.id}/assets/block`, {
            assets: ids,
          })
          .then(async (res) => {
            notify({
              text:
                ids.length === 1
                  ? "הקובץ נחסם ולא יוצג באלבום החי"
                  : "הקבצים נחסמו ולא יוצגו באלבום החי",
              type: "success",
              duration: 5000,
            });
            context.commit("BLOCK_FILES", ids);
            context.commit("TOGGLE_ALL_ASSETS_IN_ASSETS_MANAGEMENT", false);
            await context.dispatch("getEventGalleryAssets");
            resolve(res.data);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(
                err,
                "מצטערים אך הייתה תקלה בחסימת הקבצים"
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
      event: IEvent | null
    ) {
      if (event) {
        event.starts_at = event.starts_at
          ? Time.convertToLocalTime(event.starts_at)
          : "";
        event.finished_at = event.finished_at
          ? Time.convertToLocalTime(event.finished_at)
          : "";
      }
      context.commit("SET_GALLERY_AUDIENCE", "owner");
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

    updateGallerySettings(
      context: {
        state: IEventModuleState;
        commit: (arg0: string, arg1: any) => void;
      },
      data: { selectedAlbum: EventGalleryType }
    ) {
      return new Promise((resolve) => {
        axios
          .post(`events/${context.state.event.id}/gallery/settings`, data)
          .then((res) => {
            context.commit("UPDATE_GALLERY_SETTINGS", data);
            notify({
              text: "הגדרות גלריית התמונות עודכנו בהצלחה",
              type: "success",
              duration: 5000,
            });
            resolve(res.data);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(
                err,
                "מצטערים אך הייתה תקלה בעדכון הגדרות גלריית התמונות"
              ),
              type: "error",
              duration: 5000,
            });
            resolve(null);
          });
      });
    },

    updateQrCardSettings(
      context: {
        state: IEventModuleState;
        commit: (arg0: string, arg1: any) => void;
      },
      data: IUpdateQrCardSettingsRequest
    ) {
      return new Promise((resolve) => {
        axios
          .post(`events/${context.state.event.id}/qr-card/settings`, data)
          .then((res) => {
            context.commit("UPDATE_QR_CARD_SETTINGS", data);
            notify({
              text: "הגדרות כרטיס ה-QR נשמרו בהצלחה",
              type: "success",
              duration: 5000,
            });
            resolve(res.data);
          })
          .catch((err) => {
            notify({
              text: ErrorsHandler.getErrorMessage(
                err,
                "מצטערים אך הייתה תקלה בשמירת הגדרות כרטיס ה-QR"
              ),
              type: "error",
              duration: 5000,
            });
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
        commit: (arg0: string, arg1: IEventAsset) => void;
      },
      data: IUploadFilePayload
    ) {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        const file = data.file;
        const fileName = file.name || `upload_${Date.now()}.png`;
        // Many backends expect "file"; some expect "image". Try "file" first.
        formData.append("file", file, fileName);
        const url = `events/${context.state.event.id}/${
          data.isAuth ? "auth/" : ""
        }upload`;
        axios
          .post(url, formData, {
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            onUploadProgress: data.onUploadProgress,
            signal: data.signal,
          })
          .then((res) => {
            context.commit("ADD_FILE", res.data.data);
            resolve(res.data);
          })
          .catch((err) => {
            if (axios.isCancel(err)) {
              reject(err);
              return;
            }
            if (process.env.NODE_ENV !== "production" && err.response?.data) {
              console.error("Upload response:", err.response.data);
            }
            const msg = err.response?.data?.message;
            const text =
              msg && String(msg).toLowerCase().includes("not authorized")
                ? "אין הרשאה להעלות לאירוע זה. ייתכן שהאירוע לא פעיל להעלאות כרגע."
                : "מצטערים, אך יש כרגע שגיאה בהעלאת הקבצים, נסה שוב בקרוב";
            notify({
              text,
              type: "error",
              duration: 5000,
            });
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

    setShowBlockedGalleryAssets(
      context: { commit: (arg0: string, arg1: boolean) => void },
      showBlockedAssets: boolean
    ) {
      context.commit("SET_SHOW_BLOCKED_GALLERY_ASSETS", showBlockedAssets);
    },
  },

  modules: {},
};

export default EventModule;
