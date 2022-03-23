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
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
