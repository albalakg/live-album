import { createStore } from 'vuex'
import EventStore from './modules/EventModule'
import UserStore from './modules/UserModule'
import ContactStore from './modules/ContactModule'
import OrderStore from './modules/StoreModule'

// Create Vuex store
const store = createStore({
  modules: {
    event: EventStore,
    user: UserStore,
    contact: ContactStore,
    store: OrderStore,
  },
})

export default store