<template>
  <div class="chart-container">
    <div class="main"></div>
  </div>
</template>
<script>
import * as echarts from "echarts";
export default {
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const colorList = [
        "#4f81bd",
        "#c0504d",
        "#9bbb59",
        "#604a7b",
        "#948a54",
        "#e46c0b",
      ];
      const data = [
        [10, 16, 3, "A"],
        [16, 18, 15, "B"],
        [18, 26, 12, "C"],
        [26, 32, 22, "D"],
        [32, 56, 7, "E"],
        [56, 62, 17, "F"],
      ].map(function (item, index) {
        return {
          value: item,
          itemStyle: {
            color: colorList[index],
          },
        };
      });
      const option = {
        title: {
          text: "Profit",
          left: "center",
        },
        tooltip: {},
        xAxis: {
          scale: true,
        },
        yAxis: {},
        series: [
          {
            type: "custom",
            renderItem: function (params, api) {
              var yValue = api.value(2);
              var start = api.coord([api.value(0), yValue]);
              var size = api.size([api.value(1) - api.value(0), yValue]);
              console.log("yValue", yValue, "start", start, "size", size);
              var style = api.style();
              return {
                type: "rect",
                shape: {
                  x: start[0],
                  y: start[1],
                  width: size[0],
                  height: size[1],
                },
                style: style,
              };
            },
            label: {
              show: true,
              position: "top",
            },
            dimensions: ["from", "to", "profit"],
            encode: {
              x: [0, 1],
              y: 2,
              tooltip: [0, 1, 2],
              itemName: 3,
            },
            data: data,
          },
        ],
      };

      this.chart = echarts.init(document.querySelector(".main"));
      this.chart.setOption(option);
    },
  },
};
</script>

<style lang="scss" scoped>
.chart-container {
  .main {
    width: 100%;
    height: 500px;
  }
}
</style>
