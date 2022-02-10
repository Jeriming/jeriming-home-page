<template>
  <div id="container"></div>
</template>

<script>
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { MD2CharacterComplex } from "three/examples/jsm/misc/MD2CharacterComplex.js";
let container;
let camera, scene, renderer;
let controls, water, sun, character, clock;
const controlsBody = {
  moveForward: false,
  moveBackward: false,
  moveLeft: false,
  moveRight: false,
};
export default {
  mounted() {
    this.init();
    this.animate();
  },
  methods: {
    init() {
      container = document.getElementById("container");

      renderer = new THREE.WebGLRenderer();
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

      clock = new THREE.Clock();
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        1,
        20000
      );
      camera.position.set(0, 150, 1300);

      this.initWater();

      this.initSun();

      this.initOgro();

      this.initLightSystem();

      this.initCameraControls();

      window.addEventListener("resize", this.onWindowResize);
      document.addEventListener("keydown", this.onKeyDown);
      document.addEventListener("keyup", this.onKeyUp);
    },
    initCameraControls() {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.maxPolarAngle = Math.PI * 0.495;
      controls.target.set(0, 50, 0);
      controls.minDistance = 40.0;
      controls.maxDistance = 200.0;
      controls.update();
    },
    initWater() {
      // Water
      const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

      water = new Water(waterGeometry, {
        textureWidth: 1024,
        textureHeight: 1024,
        waterNormals: new THREE.TextureLoader().load(
          "textures/waternormals.jpg",
          function (texture) {
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
          }
        ),
        sunDirection: new THREE.Vector3(),
        sunColor: 0xffffff,
        waterColor: 0x001e0f,
        distortionScale: 3.7,
        fog: scene.fog !== undefined,
      });

      water.rotation.x = -Math.PI / 2;
      scene.add(water);
    },
    initSun() {
      // Skybox
      const sky = new Sky();
      sun = new THREE.Vector3();
      sky.scale.setScalar(10000);
      scene.add(sky);

      const skyUniforms = sky.material.uniforms;

      skyUniforms["turbidity"].value = 10;
      skyUniforms["rayleigh"].value = 2;
      skyUniforms["mieCoefficient"].value = 0.005;
      skyUniforms["mieDirectionalG"].value = 0.8;

      const parameters = {
        elevation: 2,
        azimuth: 180,
      };

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      function updateSun() {
        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms["sunPosition"].value.copy(sun);
        water.material.uniforms["sunDirection"].value.copy(sun).normalize();

        scene.environment = pmremGenerator.fromScene(sky).texture;
      }

      updateSun();
    },
    initLightSystem() {
      scene.add(new THREE.AmbientLight(0x222222));

      const light = new THREE.DirectionalLight(0xffffff, 2.25);
      light.position.set(200, 450, 500);

      scene.add(light);
    },
    initOgro() {
      const configOgro = {
        baseUrl: "textures/ogro/",

        body: "ogro.md2",
        skins: ["grok.jpg"],
        weapons: [["weapon.md2", "weapon.jpg"]],
        animations: {
          move: "run",
          idle: "stand",
          jump: "jump",
          attack: "attack",
          crouchMove: "cwalk",
          crouchIdle: "cstand",
          crouchAttach: "crattack",
        },

        walkSpeed: 200,
        crouchSpeed: 175,
      };

      character = new MD2CharacterComplex();
      character.scale = 2;
      character.controls = controlsBody;

      const baseCharacter = new MD2CharacterComplex();
      baseCharacter.scale = 2;

      baseCharacter.onLoadComplete = function () {
        character.shareParts(baseCharacter);

        // cast and receive shadows
        character.enableShadows(true);

        character.setWeapon(0);
        character.setSkin(0);
        scene.add(character.root);
      };
      baseCharacter.loadParts(configOgro);
    },
    onKeyDown(event) {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          controlsBody.moveForward = true;
          break;

        case "ArrowDown":
        case "KeyS":
          controlsBody.moveBackward = true;
          break;

        case "ArrowLeft":
        case "KeyA":
          controlsBody.moveLeft = true;
          break;

        case "ArrowRight":
        case "KeyD":
          controlsBody.moveRight = true;
          break;

        case "KeyC":
          controlsBody.crouch = true;
          break;
        case "Space":
          controlsBody.jump = true;
          break;
        case "ControlLeft":
        case "ControlRight":
          controlsBody.attack = true;
          break;
      }
    },
    onKeyUp(event) {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          controlsBody.moveForward = false;
          break;

        case "ArrowDown":
        case "KeyS":
          controlsBody.moveBackward = false;
          break;

        case "ArrowLeft":
        case "KeyA":
          controlsBody.moveLeft = false;
          break;

        case "ArrowRight":
        case "KeyD":
          controlsBody.moveRight = false;
          break;

        case "KeyC":
          controlsBody.crouch = false;
          break;
        case "Space":
          controlsBody.jump = false;
          break;
        case "ControlLeft":
        case "ControlRight":
          controlsBody.attack = false;
          break;
      }
    },
    onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.renderThree();
    },
    renderThree() {
      water.material.uniforms["time"].value += 1.0 / 60.0;

      const delta = clock.getDelta();
      character.update(delta);

      renderer.render(scene, camera);
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
