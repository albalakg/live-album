import { createApp } from "vue";
import { installAnalytics } from "@snapshare/design/analytics";
import { GA4_MEASUREMENT_ID } from "@snapshare/design/site";
import "@snapshare/design/tokens.css";
import App from "./App.vue";

installAnalytics({
  ga4Id: process.env.VUE_APP_GA4_ID || GA4_MEASUREMENT_ID,
  metaPixelId: process.env.VUE_APP_META_PIXEL_ID || "",
});
import router from "./router";
import store from "./store";
import Auth from "@/helpers/Auth";
import axios from "axios";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'
import Notifications from '@kyvg/vue3-notification'
import { useBreakpoints } from './composables/useBreakpoints';

axios.defaults.baseURL = process.env.VUE_APP_SERVER_BASE_URL + "/api/";

const session = Auth.get();
if (session?.token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${session.token}`;
    store.commit("user/SET_LOGGED_IN", true);
}


const app = createApp(App);
app.component('VueDatePicker', VueDatePicker);
app.config.globalProperties.$bp = useBreakpoints();
app.use(store).use(router).use(Notifications).mount("#app");