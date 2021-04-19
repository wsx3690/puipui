<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
    <Joystick/>

  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import Joystick from "@/components/Joystick.vue";

export default {
  name: "Home",
  components: {
    HelloWorld,
    Joystick,
  },
};
</script>
