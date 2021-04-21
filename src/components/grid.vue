<template>
  <table>
      <tr>
        <th>車子狀況</th>
        <th>溫度</th>
        <th>濕度</th>
      </tr>
      <tr>
        <td>正常/翻車/撞牆</td>
        <td class="temperature_sensor">°C</td>
        <td></td>
      </tr>
    </table>
</template>

<script>
import mqtt from 'mqtt';

export default {
  name: 'temperature_sensor',
  data(){
    return {
      topic: 'temp',    
      client: null
    };
  },
  mounted () {              //Lifecycle of vue   

    this.client  = mqtt.connect('mqtt://test.mosquitto.org:8080');    //tells the client which broker to connect to.

    this.client.on('connect',  ()=> {
      this.client.subscribe(this.topic,  (err)=> {    //add a connection event handler that will subscribe the client to a topic. Since our publisher client is publishing messages to the topic, let’s subscribe to the topic so that we can get the messages it sends.
      console.log(err)
      })
    })

    this.client.on('message',  (t, message)=> {     //Let’s also add a message event handler that will log the messages that our subscriber client receives on the topic.
      // message is Buffer
      console.log(message.toString())     //print the direction on console
    })
    
    
    this.client.publish(this.topic, 'I am connected!');
    setInterval(function() {
      this.client.publish(this.topic, Math.random().toString()); // published message must be a string
        }, 5000); // every 5 seconds
  },

};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
  table
      {
        width: 60%;
        font-size: 30px;
        margin: auto;
        border-collapse: collapse;
        text-align: center;
      }

      tr:nth-child(odd)
      {
        color: brown;
        /* background-color: orange; */
      }
      tr:nth-child(even)
      {
        color: green;
        /* background-color: pink; */
      }
      th,td
      {
        border:2px solid blue;
      }
</style>
