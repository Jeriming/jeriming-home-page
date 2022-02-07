import { createRouter, createWebHashHistory } from "vue-router";
import Home from "@/components/Home";

const routes = [
  {
    path: "/",
    component: Home,
  },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
});
