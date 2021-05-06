<template>
  <div class="wrapper">
    <Accordion>
      <AccordionTab header="截圖">
        <div class="screenshot">
          <div class="p-grid">
            <div class="p-col-6 p-md-3" v-for="(image, i) in captureImages" :key="i">
              <img
                @mouseover="image.hover = true"
                @mouseout="image.hover = false"
                :class="{ 'p-shadow-5': image.hover }"
                @click="
                  currentIndex = i;
                  showDetail = true;
                "
                :ref="`image_${i}`"
                @load="getBase64Image(image)"
                :src="image.base64 ? image.base64 : image.url"
                style="width: 100%"
              />
            </div>
          </div>
        </div>
      </AccordionTab>
    </Accordion>

    <Dialog header="大圖" v-model:visible="showDetail" :dismissableMask="true" :ariaCloseLabel="``">
      <div class="wrapper" v-if="currentIndex != null && captureImages[currentIndex] && captureImages[currentIndex].base64">
        <!-- {{ captureImages[currentIndex].base64 }} -->
        <div class="p-grid p-ai-center">
          <div class="p-col-12">
            <img style="width: 100%" :src="captureImages[currentIndex].base64" />
          </div>
          <div class="p-col-12">
            <a
              class="p-button-raised p-button-secondary p-button-lg"
              :download="`capture_${currentIndex + 1}`"
              :href="captureImages[currentIndex].base64"
            >
              下載 &nbsp;<i class="pi pi-download"></i>
            </a>
          </div>
        </div>
      </div>
    </Dialog>
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
    return { showDetail: false, currentIndex: null };
  },

  //將數據帶入表格
  computed: {
    ...mapGetters(['captureImages']),
  },
  watch: {},
  //Lifecycle of vue
  mounted() {},
  methods: {
    getBase64Image(image) {
      if (image.loaded) {
        return;
      }
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const dataURL = canvas.toDataURL('image/png');
        image.base64 = dataURL;
        image.loaded = true;
      };
      img.src = image.url;
    },
  },
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
