import { createRouter, createWebHashHistory } from "vue-router";
import Home from "@/components/Home";
import SimpleWater from "@/components/SimpleWater";

const routes = [
  {
    path: "/",
    component: Home,
  },
  {
    path: "/simpler-water",
    component: SimpleWater,
  },
  {
    path: "/water-ripples",
    component: () => import("@/components/WaterRipples.vue"),
  },
  {
    path: "/windows-shutdown",
    component: () => import("@/components/WinShutdown.vue"),
  },
  {
    path: "/lottery",
    component: () => import("@/components/Lottery.vue"),
  },
  {
    path: "/merge-stack",
    component: () => import("@/components/MergeBar.vue"),
  },
  {
    path: "/custom-chart",
    component: () => import("@/components/CustomChart.vue"),
  },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
