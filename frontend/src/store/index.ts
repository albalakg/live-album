import { createStore } from 'vuex'
import EventModule from './modules/EventModule'
import UserModule from './modules/UserModule'
import ContactModule from './modules/ContactModule'
import StoreModule from './modules/StoreModule'
import AppModule from './modules/AppModule'

// Create Vuex module
const module = createStore({
  modules: {
    event: EventModule,
    user: UserModule,
    contact: ContactModule,
    store: StoreModule,
    app: AppModule,
  },
})

export default module