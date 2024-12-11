import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Auth from "@/helpers/Auth";
import axios from "axios";
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css'

axios.defaults.baseURL = process.env.VUE_APP_SERVER_BASE_URL + "/api/";

if (Auth.token()) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${Auth.token()}`;
}


const app = createApp(App);
app.component('VueDatePicker', VueDatePicker);
app.use(store).use(router).mount("#app");
