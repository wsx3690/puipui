<template>
  <div class="home">
    <!-- <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" /> -->
    <grid />
    <joyStick />
    <screenshot />
  </div>
</template>

<script>
// @ is an alias to /src
import grid from '@/components/grid.vue';
import joyStick from '@/components/joyStick.vue';
import screenshot from '@/components/screenshot.vue';

export default {
  name: 'Home',
  components: {
    grid,
    joyStick,
    screenshot,
  },
};
</script>
