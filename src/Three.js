import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./index.css";
import gsap from "gsap";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import VertexShader from "./shaders/Vertex.glsl";
import fragmentShader from "./shaders/Fragment.glsl";
import { Text } from "troika-three-text";
import TextVertexShader from "./shaders/TextVertexShader.glsl";
/**
 * Base
 *
 *
 */
const loadingManager = new THREE.LoadingManager();
const textureLoader = new THREE.TextureLoader(loadingManager);
const rgbeLoader = new RGBELoader(loadingManager);

const blobs = [
  {
    name: "Color Fusion",
    background: "#9D73F7",
    config: {
      uPositionFrequency: 1,
      uPositionStrength: 0.3,
      uSmallWavePositionFrequency: 0.5,
      uSmallWavePositionStrength: 0.7,
      roughness: 1,
      metalness: 0,
      envMapIntensity: 0.5,
      clearcoat: 0,
      clearcoatRoughness: 0,
      transmission: 0,
      flatShading: false,
      wireframe: false,
      map: "cosmic-fusion",
    },
  },
  {
    name: "Purple Mirror",
    background: "#5300B1",
    config: {
      uPositionFrequency: 0.58,
      uPositionStrength: 0.27,
      uSmallWavePositionFrequency: 0.89,
      uSmallWavePositionStrength: 0.6,
      roughness: 0,
      metalness: 1,
      envMapIntensity: 2,
      clearcoat: 0,
      clearcoatRoughness: 0,
      transmission: 0,
      flatShading: false,
      wireframe: false,
      map: "foil",
    },
  },
  {
    name: "Alien Goo",
    background: "#45ACD8",
    config: {
      uPositionFrequency: 1.022,
      uPositionStrength: 0.99,
      uSmallWavePositionFrequency: 0.378,
      uSmallWavePositionStrength: 0.341,
      roughness: 0.292,
      metalness: 0.73,
      envMapIntensity: 0.86,
      clearcoat: 1,
      clearcoatRoughness: 0,
      transmission: 0,
      flatShading: false,
      wireframe: false,
      map: "lucky-day",
    },
  },
  {
    name: "Fomosphere",
    background: "#1c1c1c",
    config: {
      uPositionFrequency: 2.022,
      uPositionStrength: 0.99,
      uSmallWavePositionFrequency: .378,
      uSmallWavePositionStrength: .41,
      roughness: 0.292,
      metalness: 0.73,
      envMapIntensity: 0.86,
      clearcoat: 1,
      clearcoatRoughness: 0,
      transmission: 0,
      flatShading: false,
      wireframe: false,
      map: "white.png",
    },
  },
];

let isAnimating = false;
let currentIndex = 0;
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#9D73F7");

/**
 * Materials
 */
const uniforms = {
  uTime: { value: 0 },
  uPositionFrequency: { value: blobs[currentIndex].config.uPositionFrequency },
  uPositionStrength: { value: blobs[currentIndex].config.uPositionStrength },
  uTimeFrequency: { value: 0.3 },
  uSmallWavePositionFrequency: {
    value: blobs[currentIndex].config.uSmallWavePositionFrequency,
  },
  uSmallWavePositionStrength: {
    value: blobs[currentIndex].config.uSmallWavePositionStrength,
  },
  uSmallWaveTimeFrequency: { value: 0.3 },
};

const material = new CustomShaderMaterial({
  baseMaterial: THREE.MeshPhysicalMaterial,
  vertexShader: VertexShader,
  map: textureLoader.load(`./gradients/${blobs[currentIndex].config.map}.png`),
  metalness: blobs[currentIndex].config.metalness,
  roughness: blobs[currentIndex].config.roughness,
  envMapIntensity: blobs[currentIndex].config.envMapIntensity,
  clearcoat: blobs[currentIndex].config.clearcoat,
  clearcoatRoughness: blobs[currentIndex].config.clearcoatRoughness,
  transmission: blobs[currentIndex].config.transmission,
  flatShading: blobs[currentIndex].config.flatShading,
  wireframe: blobs[currentIndex].config.wireframe,
  uniforms,
});
//actually when we create a material it creates with a triangle so the material is not that smooth
// for make it smooth we create tangent
//it help to crate tangent on material
const mergedGeometry = mergeVertices(new THREE.IcosahedronGeometry(1, 70));
mergedGeometry.computeTangents();

const sphere = new THREE.Mesh(mergedGeometry, material);
scene.add(sphere);

// const rebloader = new RGBELoader();
rgbeLoader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/studio_small_08_1k.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
  }
);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 3;
scene.add(camera);

// Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

/**
 * Animate
 */
const clock = new THREE.Clock();

// texture material
const Textmaterial = new THREE.ShaderMaterial({
  vertexShader: TextVertexShader,
  fragmentShader: `void main(){ gl_FragColor= vec4(1.);}`,
  side: THREE.DoubleSide,
  uniforms: {
    progress: { value: 0.0 },
    direction: { value: 1 },
  },
});

const texts = blobs.map((blob, index) => {
  const myText = new Text();
  myText.text = blob.name;
  myText.font = `./aften_screen.woff`;
  myText.anchorX = "center";
  myText.anchorY = "middle";
  myText.material = Textmaterial;
  myText.position.set(0, 0, 2);
  if (index !== 0) myText.scale.set(0, 0, 0);
  myText.letterSpacing = -0.08;
  myText.fontSize = window.innerWidth / 3000;
  myText.glyphGeometryDetail = 20;
  myText.sync();
  scene.add(myText);
  return myText;
});

window.addEventListener("wheel", (e) => {
  if (isAnimating) return;
  isAnimating = true;
  let direction = Math.sign(e.deltaY);
  let next = (currentIndex + direction + blobs.length) % blobs.length;

  texts[next].scale.set(1, 1, 1);
  texts[next].position.x = direction * 3.5;

  gsap.to(Textmaterial.uniforms.progress, {
    value: 0.5,
    duration: 1,
    ease: "linear",
    onComplete: () => {
      currentIndex = next;
      isAnimating = false;
      Textmaterial.uniforms.progress.value = 0;
    },
  });

  gsap.to(texts[currentIndex].position, {
    x: -direction * 3,
    duration: 1,
    ease: "power2.inOut",
  });

  setTimeout(() => {
    gsap.to(texts[next].position, {
      x: 0,
      duration: 1,
      ease: "power2.inOut",
    });
  }, 200);

  gsap.to(sphere.rotation, {
    y: sphere.rotation.y + Math.PI * 4 * -direction,
    duration: 1,
    ease: "power2.inOut",
  });

  const bg = new THREE.Color(blobs[next].background);
  gsap.to(scene.background, {
    r: bg.r,
    g: bg.g,
    b: bg.b,
    duration: 1,
    ease: "linear",
  });

  updateBlob(blobs[next].config);
});

function updateBlob(config) {
  if (config.uPositionFrequency !== undefined)
    gsap.to(material.uniforms.uPositionFrequency, {
      value: config.uPositionFrequency,
      duration: 1,
      ease: "power2.inOut",
    });
  if (config.uPositionStrength !== undefined)
    gsap.to(material.uniforms.uPositionStrength, {
      value: config.uPositionStrength,
      duration: 1,
      ease: "power2.inOut",
    });
  if (config.uSmallWavePositionFrequency !== undefined)
    gsap.to(material.uniforms.uSmallWavePositionFrequency, {
      value: config.uSmallWavePositionFrequency,
      duration: 1,
      ease: "power2.inOut",
    });
  if (config.uSmallWavePositionStrength !== undefined)
    gsap.to(material.uniforms.uSmallWavePositionStrength, {
      value: config.uSmallWavePositionStrength,
      duration: 1,
      ease: "power2.inOut",
    });
  if (config.uSmallWaveTimeFrequency !== undefined)
    gsap.to(material.uniforms.uSmallWaveTimeFrequency, {
      value: config.uSmallWaveTimeFrequency,
      duration: 1,
      ease: "power2.inOut",
    });
  if (config.map !== undefined) {
    setTimeout(() => {
      material.map = textureLoader.load(`./gradients/${config.map}.png`);
    }, 400);
  }
  if (config.roughness !== undefined)
    gsap.to(material, {
      roughness: config.roughness,
      duration: 1,
      ease: "power2.inOut",
    });
  if (config.metalness !== undefined)
    gsap.to(material, {
      metalness: config.metalness,
      duration: 1,
      ease: "power2.inOut",
    });
  if (config.envMapIntensity !== undefined)
    gsap.to(material, {
      envMapIntensity: config.envMapIntensity,
      duration: 1,
      ease: "power2.inOut",
    });
  if (config.clearcoat !== undefined)
    gsap.to(material, {
      clearcoat: config.clearcoat,
      duration: 1,
      ease: "power2.inOut",
    });
  if (config.clearcoatRoughness !== undefined)
    gsap.to(material, {
      clearcoatRoughness: config.clearcoatRoughness,
      duration: 1,
      ease: "power2.inOut",
    });
  if (config.transmission !== undefined)
    gsap.to(material, {
      transmission: config.transmission,
      duration: 1,
      ease: "power2.inOut",
    });
  if (config.flatShading !== undefined)
    gsap.to(material, {
      flatShading: config.flatShading,
      duration: 1,
      ease: "power2.inOut",
    });
  if (config.wireframe !== undefined)
    gsap.to(material, {
      wireframe: config.wireframe,
      duration: 1,
      ease: "power2.inOut",
    });
}

const mouse = new THREE.Vector2();
window.addEventListener("mousemove", (event) => {
  // Normalize mouse coordinates to the range [-1, 1]
  mouse.x = (event.clientX / sizes.width) * 2 - 1;
  mouse.y = -(event.clientY / sizes.height) * 2 + 1;
});

loadingManager.onLoad = () => {
  function animate() {
    requestAnimationFrame(animate);
    uniforms.uTime.value = clock.getElapsedTime();
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  const bg = new THREE.Color(blobs[currentIndex].background);
  gsap.to(scene.background, {
    r: bg.r,
    g: bg.g,
    b: bg.b,
    duration: 1,
    ease: "linear",
  });
  animate();
};
