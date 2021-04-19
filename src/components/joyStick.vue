<template>
  <div class="joystick"></div>
</template>


<script>
import nipplejs from 'nipplejs';
import mqtt from 'mqtt';

export default {
  name: 'joystick',
  data(){
    return {
      topic: 'jsd',
      client: null
    };
  },
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
    this.client  = mqtt.connect('mqtt://test.mosquitto.org:8080');

    this.client.on('connect',  ()=> {
      this.client.subscribe(this.topic,  (err)=> {
      console.log(err)
      })
    })

    this.client.on('message',  (t, message)=> {
      // message is Buffer
     
      console.log(message.toString())
    })
    // staticGamepad.on('move', this.staticGamepadMove);
    staticGamepad
      .on('dir:up dir:left dir:down dir:right', this.staticGamepadMove)
      .on('end', this.staticGamepadMoveEnd)
  },
  methods:{
    staticGamepadMove(evt) {
      //console.log(evt);
        this.client.publish(this.topic, evt.type.replace(/dir[:]/,''));
      //var client  = mqtt.connect('mqtt://test.mosquitto.org')

    },
    staticGamepadMoveEnd(){
        this.client.publish(this.topic, 'end');
    }
  }
};
</script>






<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
