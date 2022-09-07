<template>
  <div class="lottery-container">
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
    };
  },
  computed: {
    result() {
      return this.redBalls.concat(this.blueBalls);
    },
  },
  created() {
    this.initResult();
  },
  methods: {
    clearTick() {
      this.index = -1;
      this.initResult();
    },
    onTick() {
      this.initAllBalls();
      this.index = 0;
      this.getOneBall();
    },
    onNext() {
      this.index++;
      this.getOneBall();
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
