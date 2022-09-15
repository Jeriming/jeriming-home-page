<template>
  <div class="lottery-container">
    <button @click="autoTick">自动计算生成一等奖所需要的次数</button>
    <div>生产随机的7个球（逗号隔开，最后一位蓝球）： {{ randResult }}</div>
    <div>自动计算的次数： {{ count }}</div>
    <div class="result">
      <span class="date">开奖时间：{{ time }}</span>
      <ul class="balls">
        <li v-for="item in result" :key="item.key">
          {{ item.value || "-" }}
        </li>
      </ul>
      <button v-if="index === -1" @click="onTick">开奖</button>
      <button v-else-if="index === 6" @click="clearTick">清空</button>
      <button v-else @click="onNext">下一个</button>
    </div>
  </div>
</template>
<script>
import * as dayjs from "dayjs";
export default {
  data() {
    return {
      redBalls: [],
      blueBalls: [],
      allRedBalls: [],
      allBlueBalls: [],
      time: dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss"),
      index: -1,
      selfReds: [],
      selfBlues: [],
      randResult: "",
      count: 0,
      success: false,
      timer: null,
    };
  },
  computed: {
    result() {
      return this.redBalls.concat(this.blueBalls);
    },
  },
  created() {
    this.initSelfNumber();
    this.initResult();
  },
  methods: {
    autoTick() {
      if (this.success) {
        this.initSelfNumber();
        this.success = false;
      }
      if (this.timer) return;
      this.timer = setInterval(() => {
        if (this.success) {
          clearInterval(this.timer);
          this.timer = null;
          return;
        }
        if (this.index === -1) {
          this.onTick();
        } else if (this.index === 6) {
          this.clearTick();
        } else {
          this.onNext();
        }
      }, 100);
    },
    initSelfNumber() {
      // 生成随机的7个球
      const r1 = this.initArrayByLen(33);
      const r2 = this.initArrayByLen(16);
      const blues = [];
      while (blues.length < 6) {
        blues.push(r1.splice(this.getRandNum(0, r1.length - 1), 1)[0]);
      }
      blues.sort((i, j) => i - j);
      this.selfReds = blues;
      this.selfBlues = [r2[this.getRandNum(0, r2.length - 1)]];
      this.randResult =
        "红：" + this.selfReds.join(",") + "蓝：" + this.selfBlues.join(",");
    },
    clearTick() {
      this.index = -1;
      this.initResult();
      this.count++;
    },
    checkIsSuccess() {
      const red = [...this.redBalls];
      const blue = this.blueBalls[0];

      let rednumber = 0;
      let blueNumber = 0;
      for (let i = 0; i < red.length; i++) {
        if (this.selfReds.includes(red[i])) {
          rednumber++;
        }
      }
      if (this.selfBlues.includes(blue)) {
        blueNumber++;
      }

      if (rednumber === 6 && blueNumber === 1) {
        this.success = true;
        alert("恭喜中了一等奖");
        return true;
      }
      if (rednumber === 6 && blueNumber === 0) {
        this.success = true;
        alert("恭喜中了二等奖");
        return true;
      }
      if (rednumber === 5 && blueNumber === 1) {
        this.success = true;
        alert("恭喜中了三等奖");
        return true;
      }
      if (
        (rednumber === 5 && blueNumber === 0) ||
        (rednumber === 4 && blueNumber === 1)
      ) {
        this.success = true;
        alert("恭喜中了四等奖");
        return true;
      }
      if (rednumber < 3 && blueNumber === 1) {
        this.success = true;
        alert("恭喜中了六等奖");
        return true;
      }
      return false;
    },
    onTick() {
      this.initAllBalls();
      this.index = 0;
      this.getOneBall();
    },
    onNext() {
      this.index++;
      this.getOneBall();
      if (this.index === 6) {
        // 清空前，计算下是否中将
        this.checkIsSuccess();
      }
    },
    getOneBall() {
      if (this.index === 6) {
        this.blueBalls.splice(0, 1, {
          value: this.getRandBallByArr(this.allBlueBalls),
          key: this.uuid(),
        });
      } else {
        this.redBalls.splice(this.index, 1, {
          value: this.getRandBallByArr(this.allRedBalls),
          key: this.uuid(),
        });
      }
    },
    getRandBallByArr(arr) {
      const randIndex = this.getRandNum(0, arr.length - 1);
      return arr.splice(randIndex, 1)[0];
    },
    initResult() {
      this.redBalls = [];
      this.blueBalls = [];
      for (let i = 0; i < 7; i++) {
        if (i === 6) {
          this.blueBalls.push({ value: null, key: this.uuid() });
        } else {
          this.redBalls.push({ value: null, key: this.uuid() });
        }
      }
    },
    initAllBalls() {
      this.allRedBalls = this.initArrayByLen(33);
      this.allBlueBalls = this.initArrayByLen(16);
    },
    initArrayByLen(len) {
      const balls = [],
        randBalls = [];
      for (let i = 0; i < len; i++) {
        balls.push(i + 1);
      }
      while (balls.length > 0) {
        randBalls.push(
          balls.splice(this.getRandNum(0, balls.length - 1), 1)[0]
        );
      }
      return randBalls;
    },
    getRandNum(min, max) {
      if (min > max) {
        throw RangeError("Min number must less than Max number");
      }
      return Math.round(Math.random() * (max - min) + min);
    },
    uuid() {
      var currentTime = new Date().getTime();
      return (
        "undefined" != typeof performance &&
          "function" == typeof performance.now &&
          (currentTime += performance.now()),
        "xxxxxxxxyyyyyyyyxxxxxxxxyyyyyyyy".replace(/[xy]/g, function (t) {
          var n = (currentTime + 16 * Math.random()) % 16 | 0;
          return (
            (currentTime = Math.floor(currentTime / 16)),
            ("x" === t ? n : (3 & n) | 8).toString(16)
          );
        })
      );
    },
  },
};
</script>
<style lang="scss" scoped>
.lottery-container {
  margin: 10px 30px 0;
  .result {
    height: 60px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .date {
      font-weight: bold;
    }
    .balls {
      list-style-type: none;
      & li {
        display: inline-block;
        width: 60px;
        height: 60px;
        border: 1px solid #c2c1c1;
        border-radius: 60px;
        background-color: red;
        margin-right: 10px;
        line-height: 60px;
        text-align: center;
        &:last-of-type {
          background-color: blue;
        }
      }
    }
    button {
      height: 60px;
      width: 100px;
    }
  }
}
</style>
