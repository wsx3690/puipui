<template>
  <div class="wrapper">
    <DataTable class="dashboard" :value="tableData" responsiveLayout="scroll">
      <template #header>
        <div class="table-header">
          <!-- <Button icon="" /> -->
          現在時間 :{{ sensorDetail.time }}
        </div>
      </template>
      <Column field="situation" header="車子狀況"></Column>
      <Column field="light" header="光敏"></Column>
      <Column field="humidity" header="濕度"></Column>
      <!-- <template #footer>
        {{ tableData }}
      </template> -->
    </DataTable>
    <Gauge :value="sensorDetail.light.value" :min="0" :max="100"> </Gauge>
    <div class="camera">
      <div>
        <img src="http://172.20.10.2:81/stream" />
      </div>
    </div>
    <div class="screenshot">
      <!-- <Button @click="capture()" label="拍照" class="p-button-outlined p-button-secondary" /> -->
      <Button class="p-button-raised p-button-secondary p-button-lg" @click="capture()">拍照 &nbsp; <i class="pi pi-camera"></i></Button>
      <!-- <button @click="capture()">拍照</button> -->
      <div v-for="(url, i) in captureImages" :key="i">
        <img :src="url" />
      </div>
    </div>
  </div>
</template>

<script>
import mqtt from 'mqtt';
import Gauge from '../components/Gauge';

export default {
  name: 'sensor',
  components: { Gauge },
  props: {
    topicUltrasound: {
      type: String,
      default: () => 'distance',
    },
    topicHumidity: {
      type: String,
      default: () => 'sensor_humidity',
    },
    topicLight: {
      type: String,
      default: () => 'sensor_Light',
    },
  },
  //data內為定義變數的地方(但定義之變數僅限用於grid.vue檔內)
  data() {
    return {
      client: null,
      sensorDetail: {
        situation: null,
        light: { text: 'N/A', value: 0 },
        humidity: null,
        time: null,
      },
      captureImages: [],
      error: '',
    };
  },

  //將數據帶入表格
  computed: {
    tableData() {
      //定義光敏數據描述 小於 500 :太暗， 500 以上:正常
      // const lightDescription = this.sensorDetail.light < 500 ? '太暗':'正常';
      return [
        {
          situation: this.sensorDetail.situation,
          light: this.sensorDetail.light.value,
          //顯示欄位內容加上描述 null 時 顯示 N/A
          // light: this.sensorDetail.light != null ? `${lightDescription}(${this.sensorDetail.light})` : 'N/A',
          humidity: this.sensorDetail.humidity,
          time: this.sensorDetail.time,
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

    //時間一秒跳一次
    setInterval(this.timeTick, 1000);
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
      if (t == this.topicUltrasound) {
        var alert;
        alert = message.toString();
        if (alert == 'D') {
          alert = '快要撞到了';
        } else if (alert == 'N') {
          alert = '正常';
        }
        this.sensorDetail.situation = alert;
      }

      if (t == this.topicHumidity) {
        var j, h;
        j = message.toString();
        h = message.toString();
        parseInt(j, h); //轉成整數型態
        j = (j / 1023) * 100;
        h = Math.round(j);
        parseInt(h);
        if (j > 75 && j <= 100) {
          j = '土壤乾燥';
        } else if (j > 50) {
          j = '土壤濕度正常';
        } else if (j < 50 && j >= 0) {
          j = '土壤濕潤';
        }
        this.sensorDetail.humidity = h + '%;' + '狀態:' + j;
        //this.sensorDetail.humidity = message.toString();
      }

      if (t == this.topicLight) {
        var i, k;
        i = message.toString();
        k = message.toString();
        parseInt(i);
        //i = i/1023*100;
        if (i > 500 && i <= 1023) {
          i = '光照充足';
        } else if (i < 500 && i > 200) {
          i = '光照正常';
        } else if (i < 200 && i >= 0) {
          i = '光照缺乏';
        }

        this.sensorDetail.light = {
          text: k + ';' + '狀態:' + i,
          value: Number(k),
        };
        //this.sensorDetail.light = message.toString();
      }
    },

    //設定時間
    formatDate(date) {
      //欲顯示的時間格式: 日期 星期 時間，toLocaleDateString/toLocaleTimeString是內建的時間prototype
      return `${date.toLocaleDateString('zh-TW')} ${this.week(date)} ${date.toLocaleTimeString('zh-TW')}`;
    },
    week(date) {
      //回傳星期幾，getDay()是內建的時間prototype，0是周日,1是周一，依此類推
      const weekDay = ['日', '一', '二', '三', '四', '五', '六'];
      return `星期${weekDay[date.getDay()]}`;
    },
    timeTick() {
      this.sensorDetail.time = this.formatDate(new Date());
    },

    //連線成功時的訂閱溫度溼度等資訊
    onConnected() {
      this.client.subscribe(this.topicUltrasound, (err, res) => {
        //add a connection event handler that will subscribe the client to a topic. Since our publisher client is publishing messages to the topic, let’s subscribe to the topic so that we can get the messages it sends.
        console.log('Error:', err);
        console.log('Topic:', this.topicUltrasound);
        this.subscribeSuccess = true;
        //顯示超音波感測器數值
        console.log('Subscribe to topics res', res);
      });

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
  font-size: 28px;
  height: 30%;
  width: 100%;
}
.screenshot {
  height: 40%;
  overflow: auto;
}
.camera {
  height: 30%;
}
</style>
<style lang="scss">
.p-datatable-tbody [role='cell'],
.p-column-header-content {
  font-size: 14px;
  justify-content: center;
  text-align: center;
}
</style>
