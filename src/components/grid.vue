<template>
  <table>
      <tr>
        <th>車子狀況</th>
        <th>溫度</th>
        <th>濕度</th>
      </tr>
      <tr>
        <td>正常/翻車/撞牆</td>
        <td>°C</td>
        <td></td>
      </tr>
    </table>
</template>



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
