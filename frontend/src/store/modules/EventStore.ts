import axios from "axios";
import { serialize } from "object-to-formdata";
import { IEventStoreState, IEventFile } from "@/helpers/interfaces";

const EventStore = {
  namespaced: true,

  state: {
    files: [],
  } as IEventStoreState,

  getters: {
    getFiles(state: IEventStoreState): IEventFile[] {
      return state.files;
    },

    // getSubscriptionStartDate(state: IEventStoreState): string | null {
    //   return state.event?.start_date ?? null;
    // },

    // getSubscriptionEndDate(state: IEventStoreState): string | null {
    //   return state.event?.end_date ?? null;
    // },
    
    // hasActiveEvent(state: IEventStoreState): boolean {
    //   return !!state.event;
    // },
  },

  mutations: {
    ADD_FILE(state: IEventStoreState, image: IEventFile) {
      image.path = process.env.VUE_APP_SERVER_BASE_URL + '/files/' + image.path;
      state.files.push(image);
    },
    
    SET_FILES(state: IEventStoreState, files: IEventFile[]) {
      files.forEach(image => {
        image.path = process.env.VUE_APP_SERVER_BASE_URL + '/files/' + image.path;
        if(!state.files.map(image => image.path).includes(image.path)) {
          state.files.push(image);
        }
      })
    },
  },

  actions: {
    find(context: { commit: (arg0: string, arg1: any) => void }) {
      axios
        .get("events/1")
        .then((res) => {
          context.commit("SET_FILES", res.data);
        })
        .catch((err) => {
          console.warn("get: ", err);
        });
    },

    async uploadFile(
      context: { commit: (arg0: string, arg1: any) => void },
      file: any
    ) {
      return new Promise((resolve, reject) => {
        const packageToSend = serialize({ file }, { indices: true });
        axios
          .post("events/file", packageToSend, {
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
