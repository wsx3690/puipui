<template>
  <div class="wrapper">
    <table>
      <tr>
        <th>車子狀況</th>
        <th>溫度</th>
        <th>濕度</th>
      </tr>
      <tr>
        <td>正常/翻車/撞牆</td>
        <td class="temperature_sensor">{{ sensorDetail.temperature }} °C</td>
        <td>{{ sensorDetail.humidity }}</td>
      </tr>
    </table>
  </div>
</template>

<script>
import mqtt from 'mqtt';

export default {
  name: 'temperature_sensor',
  props: {
    topic: {
      type: String,
      default: () => 'sensor',
    },
  },
  data() {
    return {
      client: null,
      sensorDetail: {
        temperature: null,
        humidity: null,
      },
      connected: null,
    };
  },
  watch: {
    'sensorDetail.humidity'() {
      // console.log('sensorDetail', this.sensorDetail);
    },
  },
  //Lifecycle of vue
  mounted() {
    // 設定 client 物件為 mqtt 用戶端
    this.client = mqtt.connect('mqtt://test.mosquitto.org:8080'); //tells the client which broker to connect to.
    //綁定連線成功的事件處理到用戶端
    this.client.on('connect', this.onConnected);
    //綁定接收到訊息的事件處理到用戶端
    this.client.on('message', this.onMessaged);

    //5秒傳送一次隨機產生的資料給broker
    setInterval(this.fakePublic, 5000); // every 5 seconds
  },
  methods: {
    //傳送隨機資料給broker
    fakePublic() {
      const fakeResult = {
        temperature: 20 + Math.random() * 5,
        humidity: 40 + 10 * Math.random(),
        // 產生資料時紀錄時間
        timeStamp: new Date() * 1,
      };
      // console.log(fakeResult);
      const strFake = this.stringify(fakeResult);
      //透過用戶端傳送隨機產生的資料
      // console.log('strFake', strFake);
      this.client.publish(this.topic, strFake); // published message must be a string
    },
    //接收broker傳送的資料
    onMessaged(t, message) {
      //Let’s also add a message event handler that will log the messages that our subscriber client receives on the topic.
      // message is Buffer
      // console.log(message.toString()); //print the direction on console
      const recieved = this.parse(message.toString());
      if (recieved.timeStamp > this.connected) {
        this.sensorDetail = recieved;
      } else {
        console.log('過期資料', recieved);
      }
    },
    //連線成功時的訂閱溫度溼度等資訊
    onConnected() {
      this.client.subscribe(this.topic, err => {
        //add a connection event handler that will subscribe the client to a topic. Since our publisher client is publishing messages to the topic, let’s subscribe to the topic so that we can get the messages it sends.
        console.log(err);
        // 連線成功之後紀錄時間
        this.connected = new Date() * 1;
      });
    },
    //將obj物件轉為json格式的字串
    stringify(obj) {
      return JSON.stringify(obj);
    },
    //將json格式的str字串轉為物件
    parse(str) {
      return JSON.parse(str);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
table {
  width: 100%;
  font-size: 30px;
  margin: auto;
  border-collapse: collapse;
  text-align: center;
}

tr:nth-child(odd) {
  color: brown;
  /* background-color: orange; */
}
tr:nth-child(even) {
  color: green;
  /* background-color: pink; */
}
th,
td {
  border: 2px solid blue;
}
</style>
