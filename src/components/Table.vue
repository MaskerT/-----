<template>
  <div class="com-container">
    <div class="com-chart" ref="table_ref"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chartInstane: null,
      allData: null // 从服务器中获取的所有数据
    }
  },
  mounted() {
    this.initChart()
    this.getData()
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
  },
  methods: {
    initChart() {
      this.chartInstane = this.$echarts.init(this.$refs.table_ref, 'chalk')
      const initOption = {}
      this.chartInstane.setOption(initOption)
    },
    async getData() {
      // await this.$http.get()
      // 对allData进行赋值
      const { data: ret } = await this.$http.get('trend')
      this.allData = ret
      this.updateChart()
    },
    updateChart() {
      const dataOption = {}
      this.chartInstane.setOption(dataOption)
    },
    screenAdapter() {
      // this.titleFontSize = this.$refs.table_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        // legend: {
        //   itemWidth: this.titleFontSize,
        //   itemHeight: this.titleFontSize,
        //   itemGap: this.titleFontSize,
        //   textStyle: {
        //     fontSize: this.titleFontSize / 2
        //   }
        // }
      }
      this.chartInstane.setOption(adapterOption)
      this.chartInstane.resize()
    }
  }
}
</script>

<style lang="less" scoped>

</style>
