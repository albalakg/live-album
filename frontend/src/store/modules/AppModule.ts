import axios from "axios";
import { notify } from "@kyvg/vue3-notification";
import ErrorsHandler from "@/helpers/errorsHandler";
import { IAppModuleState } from "@/helpers/interfaces"

const AppModule = {
  namespaced: true,

  state: {
    menuState: false as boolean
  },

  getters: {
    getMenuState(state: IAppModuleState): boolean {
      return state.menuState;
    }
  },

  mutations: {
    TOGGLE_MENU(state: IAppModuleState) {
      state.menuState = !state.menuState;
    }
  },

  actions: {
    toggleMenu(
      context: {
        commit: (arg0: string) => void;
      },
    ) {
      context.commit("TOGGLE_MENU")
    },
  },

  modules: {},
};

export default AppModule;
