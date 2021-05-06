import { createStore } from 'vuex';

export default createStore({
  state: {
    captureImages: [],
  },
  mutations: {
    pushImage(state, payload) {
      state.captureImages.push(payload);
    },
  },
  actions: {},
  modules: {},
  getters: {
    // ...
    captureImages: state => state.captureImages,
  },
});
