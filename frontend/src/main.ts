import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from "axios";

axios.defaults.baseURL = process.env.VUE_APP_SERVER_BASE_URL + '/api/';

const app = createApp(App);
app.use(store).use(router).mount('#app');