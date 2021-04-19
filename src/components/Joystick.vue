<template>
  <div id="joystick">
  </div>
</template>

<script>
import nipplejs from 'nipplejs';
export default {
  name: "Joystick",
  props: {
  },
  mounted(){
      var radius = 100;

      var sampleJoystick = {
          mode: 'static',
          position: {
            left: '50%',
            top: '50%'
          },
          size: radius*2,
          color: 'black',
          zone: document.getElementById('joystick'),
      };

      var joystick;
      // var position = 1;
      joystick = nipplejs.create(sampleJoystick);
      joystick.on('start end', function(evt, data) {
        console.log(evt,data)
        // position = data;
      }).on('move', function(evt, data) {
        console.log(evt,data)
        // position = data;
      }).on('dir:up plain:up dir:left plain:left dir:down' +
            'plain:down dir:right plain:right',
            function(evt, data) {
        console.log(evt,data)
        //position=data;
      }
          ).on('pressure', function(evt, data) {
        // position=data;
        console.log(evt,data)
      });
      
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  #joystick{ 
    width:500px;
    height:500px;
    background-color: pink;
    position:relative;
  }
</style>
