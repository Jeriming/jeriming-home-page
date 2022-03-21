<template>
  <!-- WebGL核心概念：gl_Position和gl_FragColor的计算 -->
  <!-- 即：顶点坐标的计算和片元颜色的计算，前者决定物体的形状和远近（摄像机），后者决定物体的颜色（包括光照反应） -->
  <div id="container"></div>
</template>
<script>
import * as THREE from "three";

let container;
let camera, scene, renderer, geometry, material, clock;

const worldWidth = 128,
  worldDepth = 128;

export default {
  data() {
    return {};
  },
  mounted() {
    this.init();
    // this.initLightSystem();
    this.animate();
    window.addEventListener("resize", this.onWindowResize);
  },
  methods: {
    init() {
      container = document.getElementById("container");
      clock = new THREE.Clock();

      renderer = new THREE.WebGLRenderer();
      renderer.antialias = true;
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);

      container.appendChild(renderer.domElement);

      camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        1,
        10000
      );
      camera.position.y = 200;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xaaccff);

      geometry = new THREE.PlaneGeometry(
        10000,
        10000,
        worldWidth - 1,
        worldDepth - 1
      );
      geometry.rotateX(-Math.PI / 2);

      const position = geometry.attributes.position;

      for (let i = 0; i < position.count; i++) {
        const y = 30 * Math.cos(i / 2);
        position.setY(i, y);
      }

      const texture = new THREE.TextureLoader().load(
        "textures/waternormals.jpg"
      );
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(5, 5);
      material = new THREE.MeshBasicMaterial({ color: 0x0044ff, map: texture });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
    },
    initLightSystem() {
      scene.add(new THREE.AmbientLight(0x222222));
      const light = new THREE.DirectionalLight(0xffffff, 2.25);
      light.position.set(200, 450, 500);
      scene.add(light);
    },
    onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    renderer() {
      const time = clock.getElapsedTime();
      const position = geometry.attributes.position;

      for (let i = 0; i < position.count; i++) {
        // i / n 决定浪的宽（广度）
        // 55决定浪的高度
        // time决定浪的速度
        const y = 30 * Math.cos(i / 3 + (time * 2 + i) / 2);
        position.setY(i, y);
      }
      position.needsUpdate = true;
      renderer.render(scene, camera);
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.renderer();
    },
  },
};
</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
}
</style>
