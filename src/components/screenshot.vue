<template>
  <div class="wrapper">
    <Accordion>
      <AccordionTab header="截圖">
        <div class="screenshot">
          <div class="p-grid">
            <div class="p-col-6 p-md-3" v-for="(url, i) in captureImages" :key="i">
              <img :src="url" />
            </div>
          </div>
        </div>
      </AccordionTab>
    </Accordion>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'screenshot',
  components: {},
  props: {},
  //data內為定義變數的地方(但定義之變數僅限用於grid.vue檔內)
  data() {
    return {};
  },

  //將數據帶入表格
  computed: {
    ...mapGetters(['captureImages']),
  },

  //Lifecycle of vue
  mounted() {},
  methods: {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.wrapper {
  position: relative;
}
/* scoped scss 在動態產生沒有 data-v 指定的元素上要設定css 要前面加 /deep/ */
/deep/ .p-accordion-header-link {
  background: #f1d7d5 !important;
}
</style>
