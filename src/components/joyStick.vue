<template>
  <div class="wrapper">
    <div class="joystick">Control Area</div>
  </div>
</template>

<script>
import nipplejs from 'nipplejs';
import mqtt from 'mqtt';

export default {
  name: 'joystick',
  props: {
    topic: {
      type: String,
      default: () => 'jsd/web', //預設topic名稱
    },
  },
  data() {
    return {
      client: null,
    };
  },
  mounted() {
    //Lifecycle of vue

    const staticGamepad = nipplejs.create({
      //set joystick on web
      zone: document.querySelector('.joystick'),
      // mode: 'static',
      mode: 'dynamic',
      position: { left: '50%', top: '50%' },
      color: 'red',
      threshold: 0.25,
      fadeTime: 400,
      maxNumberOfNipples: 1,
    });

    //tells the client which broker to connect to.
    this.client = mqtt.connect('mqtt://test.mosquitto.org:8080');

    this.client.on('connect', () => {
      this.client.subscribe(this.topic, err => {
        //add a connection event handler that will subscribe the client to a topic. Since our publisher client is publishing messages to the topic, let’s subscribe to the topic so that we can get the messages it sends.
        console.log(err);
      });
    });

    this.client.on('message', (t, message) => {
      //Let’s also add a message event handler that will log the messages that our subscriber client receives on the topic.
      // message is Buffer

      console.log(message.toString()); //print the direction on console
    });
    // staticGamepad.on('move', this.staticGamepadMove);
    staticGamepad
      .on(
        'dir:up dir:left dir:down dir:right',
        this.staticGamepadMove,
      ) /* 綁定搖桿事件處理 事件分別為上 下 左 右，用 this.staticGamepadMove publish 值到 broker。第二個參數就是處理的函數(定義在methods 裡面) */
      .on('end', this.staticGamepadMoveEnd); /* 綁定搖桿事件處理 放開搖桿(end) 用 this.staticGamepadMoveEnd publish 值到 broker */
  },
  methods: {
    staticGamepadMove(evt) {
      //publish the same topic to connect to the broker,use replace to remove "dir" 讓他單純pub出up left down right
      this.client.publish(this.topic, evt.type.replace(/dir[:]/, ''));
    },
    staticGamepadMoveEnd() {
      this.client.publish(this.topic, 'end'); //release joystick,then pub "end"
    },
  },
};
</script>
<style scoped lang="scss">
.joystick {
  width: 100%;
  background-color: #FEEDE5;
  color: #d6d6d6;
  font-size: 80px;
  text-align: center;
  height: 500px;
  line-height: 500px;
  position: relative;
  // height: 100%;
  margin-top: 10px;
  @media screen and(max-width:800px) {
    font-size: 40px;
    height: 30vh;
    line-height: 30vh;
  }
  // box-shadow: 0 0 0 2px black inset;
}
.wrapper {
  position: relative;
  height: 500px;
  @media screen and(max-width:800px) {
    height: 30vh;
  }
}
</style>
