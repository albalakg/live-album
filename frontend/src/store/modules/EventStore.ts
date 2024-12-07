import axios from "axios";
import { serialize } from "object-to-formdata";
import {
  IEventStoreState,
  IEventFile,
  UpdateEventRequest,
  IEvent,
} from "@/helpers/interfaces";
import {
  StatusEnum
} from "@/helpers/enums";

const EventStore = {
  namespaced: true,

  state: {
    event: null as IEvent | null,
    files: [],
  } as IEventStoreState,

  getters: {
    getFiles(state: IEventStoreState): IEventFile[] {
      return state.files;
    },

    getEventStatus(state: IEventStoreState): number {
      return state.event?.status;
    },

    getEvent(state: IEventStoreState): IEvent | null {
      return state.event;
    },

    getEventImage(state: IEventStoreState): string {
      return process.env.VUE_APP_SERVER_BASE_URL + '/' + state.event?.image;
    },

    hasActiveEvent(state: IEventStoreState): boolean {
      return state.event && state.event.status !== StatusEnum.INACTIVE;
    },
  },

  mutations: {
    SET_EVENT(state: IEventStoreState, event: IEvent) {
      state.event = event;
    },

    UPDATE_EVENT(state: IEventStoreState, event: any) {
      state.event.name = event?.name ?? "";
      state.event.starts_at = event?.starts_at ?? "";
      state.event.image = event?.image ?? "";
    },

    ADD_FILE(state: IEventStoreState, image: IEventFile) {
      image.path = process.env.VUE_APP_SERVER_BASE_URL + "/files/" + image.path;
      state.files.push(image);
    },

    SET_FILES(state: IEventStoreState, files: IEventFile[]) {
      files.forEach((image) => {
        image.path =
          process.env.VUE_APP_SERVER_BASE_URL + "/files/" + image.path;
        if (!state.files.map((image) => image.path).includes(image.path)) {
          state.files.push(image);
        }
      });
    },
  },

  actions: {
    setEvent(
      context: { commit: (arg0: string, arg1: any) => void },
      event: IEvent
    ) {
      if(event) {
        const utcStartDate = new Date(event.starts_at + "Z");
        event.starts_at = utcStartDate.toLocaleString();
        const utcFinishDate = new Date(event.finished_at + "Z");
        event.finished_at = utcFinishDate.toLocaleString();
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

    uploadFile(
      context: { commit: (arg0: string, arg1: any) => void },
      file: any
    ) {
      return new Promise((resolve, reject) => {
        const packageToSend = serialize({ file }, { indices: true });
        axios
          .post("event/file", packageToSend, {
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
