import { createStore } from 'vuex';

export default createStore({
  state: {
    captureImages: [],
    topics: {
      ultrasound: 'distance',
      light: 'sensor_Light',
      humidity: 'sensor_humidity',
      joystick: 'jsd/web',
    },
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
    topics: state => state.topics,
  },
});
