import { createStore } from 'vuex'
import EventModule from './modules/EventModule'
import UserModule from './modules/UserModule'
import ContactModule from './modules/ContactModule'
import StoreModule from './modules/StoreModule'
import SubscriptionsModule from './modules/SubscriptionsModule'
import AppModule from './modules/AppModule'
import WhatsAppModule from './modules/WhatsAppModule'

// Create Vuex module
const module = createStore({
  modules: {
    event: EventModule,
    user: UserModule,
    contact: ContactModule,
    store: StoreModule,
    subscriptions: SubscriptionsModule,
    app: AppModule,
    whatsapp: WhatsAppModule,
  },
})

export default module