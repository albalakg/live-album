import { createStore } from 'vuex'
import EventStore from './modules/EventStore'

// Create Vuex store
const store = createStore({
  modules: {
    event: EventStore,
  },
})

export default store