<template>
  <div class="wrapper">
    <div class="p-grid">
      <div class="p-col-12 p-p-0">
        <DataTable style="text-align: center" class="dashboard" :value="tableData" responsiveLayout="hidden">
          <template #header>
            <div class="table-header">現在時間 :{{ sensorDetail.time }}</div>
          </template>
          <Column field="situation" header="車子狀況"></Column>
          <Column field="light" header="光照強度">
            <template #body="slotProps">
              <Gauge v-if="slotProps.data.light.value !== null" :value="slotProps.data.light.value" :min="0" :max="1023"> </Gauge>
              <i style="font-size: 20px" class="pi pi-sun"></i>
              {{ slotProps.data.humidity.value }} <br />
              {{ lightDescription(slotProps.data.humidity.value) }}
            </template>
          </Column>
          <Column field="humidity" header="土壤濕度">
            <template #body="slotProps">
              <Gauge v-if="slotProps.data.light.value !== null" :value="slotProps.data.humidity.value" :min="0" :max="100"> </Gauge>
              <img style="width: 20px" src="../assets/humidity.svg" />
              <template v-if="slotProps.data.humidity.value !== null">{{ percent(slotProps.data.humidity.value) }} </template>
              <br />
              {{ humidityDescription(slotProps.data.humidity.value) }}
            </template>
          </Column>
          <!-- <template #footer>
        {{ tableData }}
      </template> -->
        </DataTable>
      </div>
    </div>

    <div class="camera p-py-2">
      <div>
        <div class="p-grid p-ai-center">
          <div class="p-col-6 p-md-4 p-md-offset-4">
            <img v-show="streamSuccess" style="width: 100%" @load="streamSuccess = true" :src="streamUrl" />
            <!-- <img src="http://192.168.43.147:81/stream" /> -->
            <img v-show="!streamSuccess" style="width: 100%" :src="defaultPicture" />
          </div>
          <div class="p-col-6 p-md-12">
            <Button style="background: #e5cecf" class="p-button-raised p-button-secondary p-button-lg" @click="capture()"
              >拍照 &nbsp; <i class="pi pi-camera"></i
            ></Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import mqtt from 'mqtt';
import Gauge from '../components/Gauge';
import { mapMutations } from 'vuex';

export default {
  name: 'sensor',
  components: { Gauge },
  props: {
    topic: {
      type: String,
      default: () => 'jsd/web', //預設topic名稱
    },
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
        light: { value: null },
        humidity: { value: null },
        time: null,
      },
      error: '',
      streamUrl: 'http://192.168.43.147:81/stream',
      defaultPicture: require('../assets/camera.png'),
      streamSuccess: false,
    };
  },

  //將數據帶入表格
  computed: {
    tableData() {
      //定義光敏數據描述 小於 500 :太暗， 500 以上:正常
      return [
        {
          situation: this.sensorDetail.situation,
          light: this.sensorDetail.light,
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
    ...mapMutations(['pushImage']),
    //截圖
    capture() {
      const url = `http://192.168.1.10/capture?${new Date() * 1}`;
      // const url = `${this.defaultPicture}?${new Date() * 1}`;
      this.pushImage({ url });
    },
    //接收broker傳送的資料(讀取感測器數據)
    onMessaged(t, message) {
      //Let’s also add a message event handler that will log the messages that our subscriber client receives on the topic.
      // message is Buffer
      if (t == this.topicUltrasound) {
        var alert;
        alert = message.toString();
        if (alert == 'D') {
          alert = '即將撞到障礙物';
          this.client.publish(this.topic, 'end');
        } else if (alert == 'N') {
          alert = '正常';
        }
        this.sensorDetail.situation = alert;
      }

      if (t == this.topicHumidity) {
        this.sensorDetail.humidity = {
          value: Number(message.toString()),
        };
        //this.sensorDetail.humidity = message.toString();
      }

      if (t == this.topicLight) {
        this.sensorDetail.light = {
          value: Number(message.toString()),
        };
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

    percent(val) {
      return `${Math.round((val / 1023) * 100)}%`;
    },
    lightDescription(val) {
      if (val === null) {
        return 'N/A';
      }
      if (val > 500 && val <= 1023) {
        return '光照充足';
      } else if (val < 500 && val > 200) {
        return '光照正常';
      } else if (val < 200 && val >= 0) {
        return '光照缺乏';
      }
    },
    humidityDescription(val) {
      if (val === null) {
        return 'N/A';
      }
      const per = Math.round((val / 1023) * 100);
      if (per > 75 && per <= 100) {
        return '土壤濕潤';
      } else if (per > 50) {
        return '土壤濕度正常';
      } else if (per < 50 && per >= 0) {
        return '土壤乾燥';
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.wrapper {
  position: relative;

  @media screen and(max-width:800px) {
    // height: 60vh;
  }
}
.dashboard {
  font-size: 24px;
  @media screen and(max-width:800px) {
    width: 100%;
    font-size: 13px;
  }
}
.camera {
  @media screen and(max-width:800px) {
    height: 30%;
  }
}
</style>
<style lang="scss">
.p-datatable-tbody [role='cell'],
.p-column-header-content {
  font-size: 24px;
  justify-content: center;
  text-align: center;
  @media screen and(max-width:800px) {
    font-size: 16px;
  }
}
.p-datatable .p-datatable-header {
  background: #f1d7d5 !important;
}
.p-datatable .p-datatable-thead > tr > th {
  background: #feede5 !important;
}
.p-datatable .p-datatable-tbody > tr > td {
  background: #faf2f0 !important;
  text-align: center !important;
}
.p-accordion .p-accordion-tab:last-child .p-accordion-content {
  background: #ffe7e3 !important;
}

.gauge {
  transform: scale(0.35);
  height: 5em;
}
</style>
