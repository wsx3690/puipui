<template>
  <div class="joystick"></div>
</template>


<script>
import nipplejs from 'nipplejs';

export default {
  name: 'joystick',
  mounted () {
    // eslint-disable-next-line no-unused-vars
    const staticGamepad = nipplejs.create({
      zone: document.querySelector('.joystick'),
      mode: 'static',
      position: { left: '50%', top: '50%' },
      color: 'red',
      threshold: 0.25,
      fadeTime: 400,
      maxNumberOfNipples: 1
    });
    staticGamepad.on('move', function(evt, data) {
    console.log(data);
});
  }
};
</script>






<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
