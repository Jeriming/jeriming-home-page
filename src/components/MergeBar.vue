<template>
  <div>
    <div class="list">
      总开关：
      <div
        class="item"
        v-for="(item, index) in arr"
        :key="index"
        :class="{ isSelected: item.isSelect }"
        @click="filter(item)"
      >
        <div
          class="item-chunk"
          :style="{ background: `${!item.isSelect ? item.color : '#999'}` }"
        ></div>
        <div class="item-title">{{ item.title }}</div>
      </div>
    </div>
    <div id="main" style="width: 1200px; height: 600px"></div>
  </div>
</template>

<script>
import * as echarts from "echarts";
export default {
  name: "echartsBar",
  data() {
    return {
      myChart: null,
      arr: [
        {
          color: "#5470c6",
          title: "Direct",
          content: ["Direct"],
          isSelect: false,
        },
        {
          color: "#91cc75",
          title: "Ad",
          content: ["Email", "Union Ads", "Video Ads"],
          isSelect: false,
        },
        {
          color: "#73c0de",
          title: "Search Engine",
          content: ["Baidu", "Google", "Bing", "Others"],
          isSelect: false,
        },
      ],
      legend: [
        "Direct",
        "Email",
        "Union Ads",
        "Video Ads",
        "Baidu",
        "Google",
        "Bing",
        "Others",
      ],
    };
  },
  methods: {
    filter(code) {
      const targets = [
        { key: "Direct", data: ["Direct"] },
        { key: "Ad", data: ["Email", "Union Ads", "Video Ads"] },
        { key: "Search Engine", data: ["Baidu", "Google", "Bing", "Others"] },
      ];
      code.isSelect = !code.isSelect;
      var options = this.myChart.getOption();
      var selectLegend = options.legend[0];
      for (let i = 0; i < targets.length; i++) {
        if (code.isSelect && targets[i].key === code.title) {
          const opData = targets[i].data;
          this.changeLegend(selectLegend, opData, false);
        } else if (!code.isSelect && targets[i].key === code.title) {
          const opData = targets[i].data;
          this.changeLegend(selectLegend, opData, true);
        }
      }
      this.myChart.setOption(options, true); // 重新渲染该图片
    },
    changeLegend(selectLegend, data, flag) {
      data.forEach((i) => {
        selectLegend.selected[i] = flag;
      });
    },
    initEchart() {
      this.myChart = echarts.init(document.getElementById("main"));
      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: function (params) {
            let str = "";
            for (let i = 0; i < params.length; i++) {
              const item = params[i];
              if (["Direct", "Email", "Baidu"].includes(item.seriesName)) {
                str += item.marker + item.seriesName + ":" + item.data;
                if (item.seriesName === "Direct") str += "<br>";
              } else {
                str +=
                  "," +
                  item.seriesName +
                  ":" +
                  item.data +
                  (item.seriesName === "Video Ads" ||
                  item.seriesName === "Others"
                    ? "<br>"
                    : "");
              }
            }

            return str;
          },
        },
        legend: {
          data: this.legend,
          selected: {
            Direct: true,
            Email: true,
            "Union Ads": true,
            "Video Ads": true,
            Baidu: true,
            Google: true,
            Bing: true,
            Others: true,
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
        series: [
          {
            name: "Direct",
            type: "bar",
            emphasis: {
              focus: "series",
            },
            data: [320, 332, 301, 334, 390, 330, 320],
          },
          {
            name: "Email",
            type: "bar",
            stack: "Ad",
            emphasis: {
              focus: "series",
            },
            data: [120, 132, 101, 134, 90, 230, 210],
          },
          {
            name: "Union Ads",
            type: "bar",
            stack: "Ad",
            emphasis: {
              focus: "series",
            },
            data: [220, 182, 191, 234, 290, 330, 310],
          },
          {
            name: "Video Ads",
            type: "bar",
            stack: "Ad",
            emphasis: {
              focus: "series",
            },
            data: [150, 232, 201, 154, 190, 330, 410],
          },
          {
            name: "Baidu",
            type: "bar",
            stack: "Search Engine",
            emphasis: {
              focus: "series",
            },
            data: [620, 732, 701, 734, 1090, 1130, 1120],
          },
          {
            name: "Google",
            type: "bar",
            stack: "Search Engine",
            emphasis: {
              focus: "series",
            },
            data: [120, 132, 101, 134, 290, 230, 220],
          },
          {
            name: "Bing",
            type: "bar",
            stack: "Search Engine",
            emphasis: {
              focus: "series",
            },
            data: [60, 72, 71, 74, 190, 130, 110],
          },
          {
            name: "Others",
            type: "bar",
            stack: "Search Engine",
            emphasis: {
              focus: "series",
            },
            data: [62, 82, 91, 84, 109, 110, 120],
          },
        ],
      };
      this.myChart.setOption(option);
    },
  },
  mounted() {
    this.initEchart();
  },
};
</script>

<style scoped lang="scss">
.list {
  display: flex;
  width: 620px;
  margin: 30px auto;
  font-size: 14px;
  .isSelected {
    color: #999;
  }
  .item {
    display: flex;
    margin: 0 10px;
    cursor: pointer;
  }
  .item-title {
    margin-left: 3px;
  }
  .item-chunk {
    height: 13px;
    width: 26px;
    margin-top: 3px;
  }
}
</style>
