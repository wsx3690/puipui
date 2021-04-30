<template>
  <div class="wrapper">
    <DataTable class="dashboard" :value="tableData" responsiveLayout="scroll">
      <!-- <template #header>
        <div class="table-header">
          Products
          <Button icon="pi pi-refresh" />
        </div>
      </template> -->
      <Column field="situation" header="車子狀況"></Column>
      <Column field="light" header="光敏"></Column>
      <Column field="humidity" header="濕度"></Column>
      <!-- <template #footer>
        {{ tableData }}
      </template> -->
    </DataTable>
    <div class="camera">
      <div>
        <img src="http://172.20.10.2:81/stream" />
      </div>
    </div>
    <div class="screenshot">
      <button @click="capture()">拍照</button>
      <div v-for="(url, i) in captureImages" :key="i">
        <img :src="url" />
      </div>
    </div>
  </div>
</template>

<script>
import mqtt from 'mqtt';

export default {
  name: 'sensor',
  components: {},
  props: {
    topicHumidity: {
      type: String,
      default: () => 'sensor_humidity',
    },
    topicLight: {
      type: String,
      default: () => 'sensor_Light',
    },
  },
  //data內為定義變數的區塊
  data() {
    return {
      client: null,
      sensorDetail: {
        situation: null,
        light: null,
        humidity: null,
      },
      captureImages: [],
      error: '',
    };
  },

  //將數據帶入表格
  computed: {
    tableData() {
      return [
        {
          situation: this.sensorDetail.situation,
          light: this.sensorDetail.light,
          humidity: this.sensorDetail.humidity,
        },
      ];
    },
  },

  //Lifecycle of vue
  mounted() {
    // 設定 client 物件為 mqtt 用戶端
    //tells the client which broker to connect to.
    //使用try...catch,忽略web socket傳出的錯誤
    try {
      // this.client = mqtt.connect('mqtt://192.168.1.101:8080', { clear: true });
      this.client = mqtt.connect('mqtt://test.mosquitto.org:8080', { clear: true });
    } catch (e) {
      this.error = e.toString();
    }

    //綁定連線成功的事件處理到用戶端
    this.client.on('connect', this.onConnected);
    //綁定接收到訊息的事件處理到用戶端
    this.client.on('message', this.onMessaged);
  },
  methods: {
    //截圖
    capture() {
      var url = `http://172.20.10.2/capture?${new Date() * 1}`;
      this.captureImages.push(url);
    },
    //接收broker傳送的資料(讀取感測器數據)
    onMessaged(t, message) {
      //Let’s also add a message event handler that will log the messages that our subscriber client receives on the topic.
      // message is Buffer
      // console.log(message.toString()); //print the direction on console
      if (t == this.topicHumidity) {
        this.sensorDetail.humidity = message.toString();
      }

      if (t == this.topicLight) {
        this.sensorDetail.light = message.toString();
      }
    },
    //連線成功時的訂閱溫度溼度等資訊
    onConnected() {
      this.client.subscribe(this.topicHumidity, (err, res) => {
        //add a connection event handler that will subscribe the client to a topic. Since our publisher client is publishing messages to the topic, let’s subscribe to the topic so that we can get the messages it sends.
        console.log('Error:', err);
        console.log('Topic:', this.topicHumidity);
        this.subscribeSuccess = true;
        //顯示土壤濕度感測器數值
        console.log('Subscribe to topics res', res);
      });

      this.client.subscribe(this.topicLight, (err, res) => {
        //add a connection event handler that will subscribe the client to a topic. Since our publisher client is publishing messages to the topic, let’s subscribe to the topic so that we can get the messages it sends.
        console.log('Error:', err);
        console.log('Topic:', this.topicLight);
        this.subscribeSuccess = true;
        //顯示光敏感測器數值
        console.log('Subscribe to topics res', res);
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.wrapper {
  position: relative;
  height: 45vh;
}
.dashboard {
  height: 30%;
}
.screenshot {
  height: 40%;
  overflow: auto;
}
.camera {
  height: 30%;
}
</style>
