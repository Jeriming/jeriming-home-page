<template>
  <!-- WebGL核心概念：gl_Position和gl_FragColor的计算 -->
  <!-- 即：顶点坐标的计算和片元颜色的计算，前者决定物体的形状和远近（摄像机），后者决定物体的颜色（包括光照反应） -->
  <div id="container"></div>
</template>
<script>
/*eslint-disable*/
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise";
import waterVertexShader from "../glsl/waterVertexShader";
import heightmapFragmentShader from "../glsl/heightmapFragmentShader";

// Texture width for simulation
const WIDTH = 128;

// Water size in system units
const BOUNDS = 512;

let container;
let camera, scene, renderer;
let mouseMoved = false;
const mouseCoords = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

let waterMesh;
let meshRay;
let gpuCompute;
let heightmapVariable;
let waterUniforms;

const simplex = new SimplexNoise();

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );
  camera.position.set(0, 200, 350);
  camera.lookAt(0, 0, 0);

  scene = new THREE.Scene();

  const sun = new THREE.DirectionalLight(0xffffff, 1.0);
  sun.position.set(300, 400, 175);
  scene.add(sun);

  const sun2 = new THREE.DirectionalLight(0x40a040, 0.6);
  sun2.position.set(-100, 350, -200);
  scene.add(sun2);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  container.style.touchAction = "none";
  container.addEventListener("mousedown", onPointerDown);

  document.addEventListener("keydown", function (event) {
    // 切换是否开启网格
    if (event.keyCode === 87) {
      waterMesh.material.wireframe = !waterMesh.material.wireframe;
      waterMesh.material.needsUpdate = true;
    }
  });

  window.addEventListener("resize", onWindowResize);

  const effectController = {
    mouseSize: 20.0,
    viscosity: 0.98,
  };

  const valuesChanger = function () {
    heightmapVariable.material.uniforms["mouseSize"].value =
      effectController.mouseSize;
    heightmapVariable.material.uniforms["viscosityConstant"].value =
      effectController.viscosity;
  };

  initWater();

  valuesChanger();
}

function initWater() {
  const materialColor = 0x0040c0;

  const geometry = new THREE.PlaneGeometry(
    BOUNDS,
    BOUNDS,
    WIDTH - 1,
    WIDTH - 1
  );

  // material: make a THREE.ShaderMaterial clone of THREE.MeshPhongMaterial, with customized vertex shader
  const material = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([
      THREE.ShaderLib["phong"].uniforms,
      {
        heightmap: { value: null },
      },
    ]),
    vertexShader: waterVertexShader,
    fragmentShader: THREE.ShaderChunk["meshphong_frag"],
  });

  material.lights = true;

  // Material attributes from THREE.MeshPhongMaterial
  material.color = new THREE.Color(materialColor);
  material.specular = new THREE.Color(0x111111);
  material.shininess = 50;

  // Sets the uniforms with the material values
  material.uniforms["diffuse"].value = material.color;
  material.uniforms["specular"].value = material.specular;
  material.uniforms["shininess"].value = Math.max(material.shininess, 1e-4);
  material.uniforms["opacity"].value = material.opacity;

  // Defines
  material.defines.WIDTH = WIDTH.toFixed(1);
  material.defines.BOUNDS = BOUNDS.toFixed(1);

  waterUniforms = material.uniforms;

  waterMesh = new THREE.Mesh(geometry, material);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.matrixAutoUpdate = false;
  waterMesh.updateMatrix();

  scene.add(waterMesh);

  // THREE.Mesh just for mouse raycasting
  const geometryRay = new THREE.PlaneGeometry(BOUNDS, BOUNDS, 1, 1);
  meshRay = new THREE.Mesh(
    geometryRay,
    new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false })
  );
  meshRay.rotation.x = -Math.PI / 2;
  meshRay.matrixAutoUpdate = false;
  meshRay.updateMatrix();
  scene.add(meshRay);

  gpuCompute = new GPUComputationRenderer(WIDTH, WIDTH, renderer);

  const heightmap0 = gpuCompute.createTexture();

  fillTexture(heightmap0);

  heightmapVariable = gpuCompute.addVariable(
    "heightmap",
    heightmapFragmentShader,
    heightmap0
  );

  gpuCompute.setVariableDependencies(heightmapVariable, [heightmapVariable]);

  heightmapVariable.material.uniforms["mousePos"] = {
    value: new THREE.Vector2(10000, 10000),
  };
  heightmapVariable.material.uniforms["mouseSize"] = { value: 20.0 };
  heightmapVariable.material.uniforms["viscosityConstant"] = { value: 0.98 };
  heightmapVariable.material.uniforms["heightCompensation"] = { value: 0 };
  heightmapVariable.material.defines.BOUNDS = BOUNDS.toFixed(1);

  const error = gpuCompute.init();
  if (error !== null) {
    console.error(error);
  }
}

function fillTexture(texture) {
  const waterMaxHeight = 10;

  function noise(x, y) {
    let multR = waterMaxHeight;
    let mult = 0.025;
    let r = 0;
    for (let i = 0; i < 15; i++) {
      r += multR * simplex.noise(x * mult, y * mult);
      multR *= 0.53 + 0.025 * i;
      mult *= 1.25;
    }

    return r;
  }

  const pixels = texture.image.data;

  let p = 0;
  for (let j = 0; j < WIDTH; j++) {
    for (let i = 0; i < WIDTH; i++) {
      const x = (i * 128) / WIDTH;
      const y = (j * 128) / WIDTH;

      pixels[p + 0] = noise(x, y);
      pixels[p + 1] = pixels[p + 0];
      pixels[p + 2] = 0;
      pixels[p + 3] = 1;

      p += 4;
    }
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function setMouseCoords(x, y) {
  mouseCoords.set(
    (x / renderer.domElement.clientWidth) * 2 - 1,
    -(y / renderer.domElement.clientHeight) * 2 + 1
  );
  mouseMoved = true;
}

function onPointerDown(event) {
  if (event.isPrimary === false) return;

  setMouseCoords(event.clientX, event.clientY);
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  // Set uniforms: mouse interaction
  const uniforms = heightmapVariable.material.uniforms;
  if (mouseMoved) {
    raycaster.setFromCamera(mouseCoords, camera);

    const intersects = raycaster.intersectObject(meshRay);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      uniforms["mousePos"].value.set(point.x, point.z);
    } else {
      uniforms["mousePos"].value.set(10000, 10000);
    }

    mouseMoved = false;
  } else {
    uniforms["mousePos"].value.set(10000, 10000);
  }

  // Do the gpu computation
  gpuCompute.compute();

  // Get compute output in custom uniform
  waterUniforms["heightmap"].value =
    gpuCompute.getCurrentRenderTarget(heightmapVariable).texture;

  // Render
  renderer.render(scene, camera);
}

export default {
  data() {
    return {};
  },
  mounted() {
    init();
    animate();
  },
};
</script>

<style scoped>
#container {
  width: 100%;
  height: 100%;
}
</style>
