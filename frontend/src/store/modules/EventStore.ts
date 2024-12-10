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

    getEventPath(state: IEventStoreState): string | null {
      return state.event?.path;
    },

    isEventReady(state: IEventStoreState): boolean {
      return state.event?.status === StatusEnum.READY;
    },

    getEventDate(state: IEventStoreState): string | null {
      return Time.extractDate(state.event?.starts_at ?? "");
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
      return process.env.VUE_APP_SERVER_BASE_URL + "/" + state.event?.image;
    },

    hasActiveEvent(state: IEventStoreState): boolean {
      return state.event && state.event.status !== StatusEnum.INACTIVE;
    },
  },

  mutations: {
    SET_EVENT(state: IEventStoreState, event: IEvent) {
      console.log('SET_EVENT', event);
      
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

    ADD_FILE(state: IEventStoreState, image: IEventAsset) {
      image.path =
        process.env.VUE_APP_SERVER_BASE_URL + "/assets/" + image.path;
      state.event.assets ? state.event.assets.push(image) : state.event.assets = [image];
    },

    SET_FILES(state: IEventStoreState, assets: IEventAsset[]) {
      if(!state.event.assets) {
        return state.event.assets = [];
      }
      
      assets.forEach((image) => {
        image.path =
          process.env.VUE_APP_SERVER_BASE_URL + "/assets/" + image.path;
        if (
          !state.event.assets.map((image) => image.path).includes(image.path)
        ) {
          state.event.assets.push(image);
        }
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
            console.warn("getBaseEvent: ", err);
            resolve(null);
          });
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
            context.commit("UPDATE_EVENT", res.data.data);
            resolve(res.data);
          })
          .catch((err) => {
            console.warn("update: ", err);
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
            context.commit("UPDATE_EVENT_STATUS", StatusEnum.READY);
            resolve(res.data);
          })
          .catch((err) => {
            console.warn("setReady: ", err);
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
            context.commit("UPDATE_EVENT_STATUS", StatusEnum.PENDING);
            resolve(res.data);
          })
          .catch((err) => {
            console.warn("setPending: ", err);
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
            console.warn("uploadFile: ", err);
            reject(err);
          });
      });
    },
  },

  modules: {},
};

export default EventStore;
