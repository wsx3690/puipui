<template>
  <div>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="situation" label="車子狀況" width="180"> </el-table-column>
      <el-table-column prop="light" label="光敏" width="180"> </el-table-column>
      <el-table-column prop="humidity" label="濕度"> </el-table-column>
    </el-table>
    <DataTable :value="tableData" responsiveLayout="scroll">
      <template #header>
        <div class="table-header">
          Products
          <Button icon="pi pi-refresh" />
        </div>
      </template>
      <Column field="situation" header="車子狀況"></Column>
      <Column field="light" header="光敏"></Column>
      <Column field="humidity" header="濕度"></Column>
      <template #footer> In total there are {{ products ? products.length : 0 }} products. </template>
    </DataTable>
  </div>
</template>

 <template>
   <div class="wrapper">
     <table>
       <tr>
         <th>車子狀況</th>
         <th>光敏</th>
         <th>濕度</th>
       </tr>
       <tr>
         <td>正常/翻車/撞牆</td>
         <td>{{ sensorDetail.light }}</td>
         <td>{{ sensorDetail.humidity }}</td>
       </tr>
     </table>
   </div>
   <br />
   <img src="http://172.20.10.2:81/stream" />
   <button @click="capture()">拍照</button>
   <div v-for="(url, i) in captureImages" :key="i">
     <img :src="url" />
   </div>
   <br />
   <br />
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

  data() {
    return {
      client: null,
      sensorDetail: {
        light: null,
        humidity: ' ',
      },
      connected: null,
      captureImages: [],
      error: '',
    };
  },
  //  computed: {
  //    tableData() {
  //      return [
  //        {
  //          situation: ' ',
  //          light: this.sensorDetail.light,
  //          humidity: this.sensorDetail.humidity,
  //        },
  //      ];
  //    },
  //  }, 

  watch: {
    'sensorDetail.humidity'() {
      // console.log('sensorDetail', this.sensorDetail);
    },
    'sensorDetail.light'() {},
  },
  //Lifecycle of vue
  mounted() {
    // 設定 client 物件為 mqtt 用戶端
    //tells the client which broker to connect to.
    //使用try...catch,忽略web socket傳出的錯誤
    try {
      this.client = mqtt.connect('mqtt://192.168.1.101:9001', { clear: true });
    } catch (e) {
      this.error = e;
    }

    //綁定連線成功的事件處理到用戶端
    this.client.on('connect', this.onConnected);
    //綁定接收到訊息的事件處理到用戶端
    this.client.on('message', this.onMessaged);

    //5秒傳送一次隨機產生的資料給broker
    //setInterval(this.fakePublic, 1000); // every 1 seconds
  },
  methods: {
    //截圖
    capture() {
      // var img = document.createElement('img');
      // var ims = document.querySelectorAll('img');
      // var cap = ims[1];
      var url = 'http://172.20.10.2/capture';
      this.captureImages.push(url);

      // img.src = `${url}?${new Date() * 1}`;
      // document.querySelectorAll('body')[0].appendChild(img);
    },
    //傳送隨機資料給broker
    // fakePublic() {
    //   const fakeResult = {
    //     temperature: 20 + Math.random() * 5,
    //     humidity: 40 + 10 * Math.random(),
    //     // 產生資料時紀錄時間
    //     timeStamp: new Date() * 1,
    //   };
    //   // console.log(fakeResult);
    //   const strFake = this.stringify(fakeResult);
    //   //透過用戶端傳送隨機產生的資料
    //   // console.log('strFake', strFake);
    //   this.client.publish(this.topic, strFake); // published message must be a string
    // },
    //接收broker傳送的資料
    onMessaged(t, message) {
      //Let’s also add a message event handler that will log the messages that our subscriber client receives on the topic.
      // message is Buffer
      // console.log(message.toString()); //print the direction on console
      if(t == this.topicHumidity){
        this.sensorDetail.humidity = message.toString();
      }
      
      if(t == this.topicLight){
        this.sensorDetail.light = message.toString();
      }
      
      /*
      const recieved = this.parse(message.toString());
      if (recieved.timeStamp > this.connected) {
        this.sensorDetail = recieved;
      } else {
        console.log('過期資料', recieved);
      }
      */
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
        // 連線成功之後紀錄時間
        this.connected = new Date() * 1;
      });

      this.client.subscribe(this.topicLight, (err, res) => {
        //add a connection event handler that will subscribe the client to a topic. Since our publisher client is publishing messages to the topic, let’s subscribe to the topic so that we can get the messages it sends.
        console.log('Error:', err);
        console.log('Topic:', this.topicLight);
        this.subscribeSuccess = true;
        //顯示土壤濕度感測器數值
        console.log('Subscribe to topics res', res);
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
