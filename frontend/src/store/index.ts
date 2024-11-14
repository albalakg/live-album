import { createStore } from 'vuex'
import EventStore from './modules/EventStore'
import UserStore from './modules/UserStore'
import NotificationStore from './modules/NotificationStore'
import ContactStore from './modules/ContactStore'

// Create Vuex store
const store = createStore({
  modules: {
    event: EventStore,
    user: UserStore,
    notification: NotificationStore,
    contact: ContactStore,
  },
})

export default store