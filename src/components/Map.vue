<template>
  <div class="com-container" @dblclick="revertMap">
    <div class="com-chart" ref="map_ref"></div>
  </div>
</template>

<script>
import axios from 'axios'
import { getProvinceMapInfo } from '@/utils/map_utils'

export default {
  data() {
    return {
      chartInstane: null,
      allData: null, // 从服务器中获取的所有数据
      mapData: {} // 所获取的省份的地图矢量数据
    }
  },
  created() {
    // 在组件创建完成后进行回调函数的注册
    this.$socket.registerCallBack('mapData', this.getData)
  },
  mounted() {
    this.initChart()
    // this.getData()
    this.$socket.send({
      action: 'getData',
      socketType: 'mapData',
      chartName: 'map',
      value: ''
    })
    window.addEventListener('resize', this.screenAdapter)
    this.screenAdapter()
  },
  destroyed() {
    window.removeEventListener('resize', this.screenAdapter)
    this.$socket.unregisterCallBack('mapData')
  },
  methods: {
    async initChart() {
      this.chartInstane = this.$echarts.init(this.$refs.map_ref, 'chalk')
      // 获取中国地图的矢量数据
      const ret = await axios.get('http://localhost:8999/static/map/china.json')
      this.$echarts.registerMap('china', ret.data)
      const initOption = {
        title: {
          text: '▎商家分布',
          left: 20,
          top: 20
        },
        geo: {
          type: 'map',
          map: 'china',
          top: '5%',
          bottom: '5%',
          itemStyle: {
            areaColor: '#2172BF',
            borderColor: '#333'
          }
        },
        legend: {
          left: '5%',
          bottom: '5%',
          orient: 'vertical'
        }
      }
      this.chartInstane.setOption(initOption)
      this.chartInstane.on('click', async arg => {
        const provinceInfo = getProvinceMapInfo(arg.name)
        // 判断当前省份的数据是否已经在缓存当中了
        if (!this.mapData[provinceInfo.key]) {
          const ret = await axios.get(`http://localhost:8999${provinceInfo.path}`)
          this.mapData[provinceInfo.key] = ret.data
          this.$echarts.registerMap(provinceInfo.key, ret.data)
        }
        const changeOption = {
          geo: {
            map: provinceInfo.key
          }
        }
        this.chartInstane.setOption(changeOption)
      })
    },
    getData(ret) {
      // await this.$http.get()
      // 对allData进行赋值
      // const { data: ret } = await this.$http.get('map')
      this.allData = ret
      this.updateChart()
    },
    updateChart() {
      // 图例的数据
      const legendArr = this.allData.map(item => {
        return item.name
      })
      const seriesArr = this.allData.map(item => {
        // return 的对象代表的是一个类别下的所有散点数据
        // 若想在地图中显示散点，我们需要给三点图表增加一个配置coordinateSystem
        return {
          type: 'effectScatter',
          rippleEffect: {
            scale: 5,
            brushType: 'stroke'
          },
          name: item.name,
          data: item.children,
          coordinateSystem: 'geo'
        }
      })
      const dataOption = {
        legend: {
          data: legendArr
        },
        series: seriesArr
      }
      this.chartInstane.setOption(dataOption)
    },
    screenAdapter() {
      const titleFontSize = this.$refs.map_ref.offsetWidth / 100 * 3.6
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }
      }
      this.chartInstane.setOption(adapterOption)
      this.chartInstane.resize()
    },
    revertMap() {
      const revertOption = {
        geo: {
          map: 'china'
        }
      }
      this.chartInstane.setOption(revertOption)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
