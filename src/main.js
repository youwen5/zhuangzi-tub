import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./styles.css";
import zhuangziPortraitUrl from "./assets/zhuangzi-head.png";
import huiziPortraitUrl from "./assets/huizi-portrait.png";

const canvas = document.querySelector("#scene");
const beatButton = document.querySelector("#beatButton");
const seasonButton = document.querySelector("#seasonButton");
const captionTitle = document.querySelector("#captionTitle");
const captionText = document.querySelector("#captionText");
const storyText = document.querySelector("#storyText");

const armRig = {
  leftX: 0.36,
  leftZ: -0.17,
  leftAngle: 0,
  rightX: -0.49,
  rightZ: -0.86,
  rightAngle: 156,
};

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101827);
scene.fog = new THREE.FogExp2(0x101827, 0.028);

const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 100);
camera.position.set(5.2, 3.1, 7.6);
camera.lookAt(0, 1.1, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0.15, 1.05, 0.05);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.enablePan = false;
controls.minDistance = 4.2;
controls.maxDistance = 11;
controls.minPolarAngle = Math.PI * 0.18;
controls.maxPolarAngle = Math.PI * 0.47;
controls.rotateSpeed = 0.62;
controls.zoomSpeed = 0.72;
controls.update();

const clock = new THREE.Clock();
const group = new THREE.Group();
scene.add(group);
const hallGroup = new THREE.Group();
hallGroup.visible = false;
scene.add(hallGroup);

const seasons = [
  {
    name: "First season",
    story:
      "His wife lies nearby. Zhuangzi answers grief with rhythm: not coldness, but a stubborn little song for transformation.",
    caption:
      "His wife is still visibly here; the dry tub is not denial, just grief learning percussion.",
    sky: 0x101827,
    fog: 0x101827,
    moon: 0xd9ecff,
    leaf: 0x6f8fa3,
    robe: 0x3f6e8c,
    hall: false,
  },
  {
    name: "Second season",
    story:
      "Huizi arrives at the grave expecting tears. Zhuangzi keeps time on the tub, which is either wisdom or extremely bold hosting.",
    caption:
      "Huizi stands beside the gravestone and checks whether this is philosophy or just poor neighbor etiquette.",
    sky: 0x28324a,
    fog: 0x1d2638,
    moon: 0xffd6a2,
    leaf: 0xc6a75c,
    robe: 0x557783,
    hall: false,
  },
  {
    name: "Third season",
    story:
      "The same grave and the same friend remain, but the air has changed: colder light, thinner mist, and a quieter kind of attention.",
    caption:
      "Huizi and the gravestone stay in place while the world shifts around them.",
    sky: 0x4f6d78,
    fog: 0x334852,
    moon: 0xbfe8ff,
    leaf: 0x8fae9d,
    robe: 0x5f8176,
    hall: false,
  },
  {
    name: "Fourth season",
    story:
      "The courtyard falls away. In the great hall of the universe, Huizi's wife floats in the open dark with sparks gathering around her.",
    caption:
      "Huizi's wife hangs weightless among slow pillars of light and ethereal sparks.",
    sky: 0x050713,
    fog: 0x080a18,
    moon: 0xd8c5ff,
    leaf: 0xe7d3ff,
    robe: 0x806aa8,
    hall: true,
  },
];

let seasonIndex = 0;
let beatPulse = 0;
let autoBeatTimer = 0;
let tubAngle = 0;
const particles = [];

const mat = {
  ground: new THREE.MeshStandardMaterial({ color: 0x6e665d, roughness: 0.92 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x8d948f, roughness: 0.88 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x8b5a3b, roughness: 0.8 }),
  tub: new THREE.MeshStandardMaterial({
    color: 0x9b653d,
    roughness: 0.62,
    metalness: 0.08,
  }),
  robe: new THREE.MeshStandardMaterial({
    color: seasons[0].robe,
    roughness: 0.74,
  }),
  skin: new THREE.MeshStandardMaterial({ color: 0xd0a57b, roughness: 0.68 }),
  paper: new THREE.MeshStandardMaterial({ color: 0xf5e2b8, roughness: 0.86 }),
  ink: new THREE.MeshStandardMaterial({ color: 0x202020, roughness: 0.7 }),
  wifeRobe: new THREE.MeshStandardMaterial({ color: 0xe8d7bd, roughness: 0.9 }),
  wifeHair: new THREE.MeshStandardMaterial({ color: 0x191513, roughness: 0.8 }),
  spirit: new THREE.MeshStandardMaterial({
    color: 0xf7d8a6,
    emissive: 0xf7b267,
    emissiveIntensity: 1.2,
    transparent: true,
    opacity: 0.72,
  }),
  leaf: new THREE.MeshStandardMaterial({
    color: seasons[0].leaf,
    roughness: 0.7,
  }),
  tubInterior: new THREE.MeshStandardMaterial({
    color: 0x5f3f2a,
    roughness: 0.86,
  }),
};

const textureLoader = new THREE.TextureLoader();
const zhuangziPortrait = textureLoader.load(zhuangziPortraitUrl);
zhuangziPortrait.colorSpace = THREE.SRGBColorSpace;
const huiziPortrait = textureLoader.load(huiziPortraitUrl);
huiziPortrait.colorSpace = THREE.SRGBColorSpace;

function createRobeTexture({ base, trim, accent, flipped = false }) {
  const textureCanvas = document.createElement("canvas");
  textureCanvas.width = 512;
  textureCanvas.height = 512;
  const ctx = textureCanvas.getContext("2d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  for (let y = 0; y < 512; y += 36) {
    ctx.fillRect(0, y, 512, 3);
  }
  ctx.strokeStyle = trim;
  ctx.lineWidth = 38;
  ctx.beginPath();
  ctx.moveTo(flipped ? 420 : 92, 0);
  ctx.lineTo(flipped ? 250 : 262, 512);
  ctx.stroke();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(flipped ? 392 : 120, 0);
  ctx.lineTo(flipped ? 222 : 290, 512);
  ctx.stroke();
  ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
  ctx.fillRect(0, 416, 512, 64);
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  if (flipped) {
    texture.repeat.x = -1;
    texture.offset.x = 1;
  }
  return texture;
}

function createWifeFaceTexture() {
  const faceCanvas = document.createElement("canvas");
  faceCanvas.width = 512;
  faceCanvas.height = 512;
  const ctx = faceCanvas.getContext("2d");
  ctx.fillStyle = "#d8ad86";
  ctx.fillRect(0, 0, 512, 512);
  const blush = ctx.createRadialGradient(256, 245, 40, 256, 245, 250);
  blush.addColorStop(0, "rgba(255, 225, 200, 0.35)");
  blush.addColorStop(1, "rgba(255, 225, 200, 0)");
  ctx.fillStyle = blush;
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = "#2a1d19";
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(142, 216);
  ctx.quadraticCurveTo(180, 236, 218, 216);
  ctx.moveTo(294, 216);
  ctx.quadraticCurveTo(332, 236, 370, 216);
  ctx.stroke();
  ctx.strokeStyle = "rgba(42, 29, 25, 0.65)";
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(252, 224);
  ctx.quadraticCurveTo(244, 270, 264, 286);
  ctx.stroke();
  ctx.strokeStyle = "#8a4e45";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(214, 334);
  ctx.quadraticCurveTo(256, 352, 298, 334);
  ctx.stroke();
  const texture = new THREE.CanvasTexture(faceCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const zhuangziBodyTexture = createRobeTexture({
  base: "#315f79",
  trim: "#1d2f3a",
  accent: "#c49a63",
});
const huiziBodyTexture = createRobeTexture({
  base: "#4e314f",
  trim: "#251827",
  accent: "#c2a16b",
  flipped: true,
});
const wifeFaceTexture = createWifeFaceTexture();
const zhuangziBodyMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  map: zhuangziBodyTexture,
  roughness: 0.76,
});
const huiziBodyMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  map: huiziBodyTexture,
  roughness: 0.76,
});
const wifeFaceMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  map: wifeFaceTexture,
  roughness: 0.74,
});

function roundedBox(width, height, depth, radius, material) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -depth / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + depth - radius);
  shape.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth);
  shape.lineTo(x + radius, y + depth);
  shape.quadraticCurveTo(x, y + depth, x, y + depth - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
  });
  geometry.rotateX(Math.PI / 2);
  geometry.translate(0, height / 2, 0);
  return new THREE.Mesh(geometry, material);
}

function addMesh(mesh, position, rotation = [0, 0, 0], cast = true) {
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = cast;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function alignCylinderBetween(mesh, start, end) {
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  const direction = end.clone().sub(start);
  mesh.position.copy(midpoint);
  mesh.scale.set(1, direction.length(), 1);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );
}

function localPoint(object, x, y, z) {
  return object.localToWorld(new THREE.Vector3(x, y, z));
}

function tunedArmPoint(side, baseX, y, baseZ) {
  const angle = THREE.MathUtils.degToRad(armRig[`${side}Angle`]);
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = baseX * cos - baseZ * sin + armRig[`${side}X`];
  const z = baseX * sin + baseZ * cos + armRig[`${side}Z`];
  return localPoint(zhuangzi, x, y, z);
}

const hemi = new THREE.HemisphereLight(0xcfd9ff, 0x4b3b2f, 1.4);
scene.add(hemi);

const moonLight = new THREE.DirectionalLight(0xd8e7ff, 2.1);
moonLight.position.set(-4, 7, 3);
moonLight.castShadow = true;
moonLight.shadow.mapSize.set(2048, 2048);
moonLight.shadow.camera.near = 0.5;
moonLight.shadow.camera.far = 30;
scene.add(moonLight);

const warmLight = new THREE.PointLight(0xffba6b, 1.8, 10);
warmLight.position.set(1.6, 1.8, 1.4);
scene.add(warmLight);

const hallLight = new THREE.PointLight(0xd8c5ff, 0, 12);
hallLight.position.set(0, 2.4, 1.8);
scene.add(hallLight);

const floor = addMesh(
  new THREE.Mesh(new THREE.CircleGeometry(7.5, 96), mat.ground),
  [0, -0.02, 0],
  [-Math.PI / 2, 0, 0],
  false,
);
floor.receiveShadow = true;

addMesh(
  roundedBox(5.8, 0.16, 3.6, 0.08, mat.stone),
  [0, 0.02, 0],
  [0, 0.08, 0],
  false,
);
addMesh(
  new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.55, 0.22), mat.wood),
  [0, 0.55, -2.5],
  [0, 0, 0],
  false,
);
addMesh(
  new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.8, 0.28), mat.wood),
  [-3.1, 0.9, -2.5],
  [0, 0, 0],
  false,
);
addMesh(
  new THREE.Mesh(new THREE.BoxGeometry(0.28, 1.8, 0.28), mat.wood),
  [3.1, 0.9, -2.5],
  [0, 0, 0],
  false,
);

const moon = addMesh(
  new THREE.Mesh(
    new THREE.SphereGeometry(0.46, 32, 32),
    new THREE.MeshStandardMaterial({
      color: seasons[0].moon,
      emissive: seasons[0].moon,
      emissiveIntensity: 1.1,
    }),
  ),
  [-3.8, 4.7, -3.8],
  [0, 0, 0],
  false,
);

const tub = new THREE.Group();
const tubShell = new THREE.Mesh(
  new THREE.CylinderGeometry(0.72, 0.9, 0.82, 48, 1, true),
  mat.tub,
);
tubShell.castShadow = true;
tubShell.receiveShadow = true;
const tubRim = new THREE.Mesh(
  new THREE.TorusGeometry(0.72, 0.055, 10, 48),
  mat.wood,
);
tubRim.position.y = 0.42;
tubRim.rotation.x = Math.PI / 2;
const tubBottom = new THREE.Mesh(
  new THREE.CylinderGeometry(0.76, 0.86, 0.08, 48),
  mat.wood,
);
tubBottom.position.y = -0.42;
const dryInterior = new THREE.Mesh(
  new THREE.CircleGeometry(0.58, 48),
  mat.tubInterior,
);
dryInterior.rotation.x = -Math.PI / 2;
dryInterior.position.y = -0.34;
const strikePatch = new THREE.Mesh(
  new THREE.CircleGeometry(0.36, 48),
  new THREE.MeshStandardMaterial({
    color: 0xc09158,
    roughness: 0.82,
    side: THREE.DoubleSide,
  }),
);
strikePatch.rotation.x = -Math.PI / 2;
strikePatch.position.y = 0.44;
const drumSkin = new THREE.Mesh(
  new THREE.CylinderGeometry(0.72, 0.72, 0.035, 48),
  new THREE.MeshStandardMaterial({
    color: 0xb8844f,
    roughness: 0.78,
    side: THREE.DoubleSide,
  }),
);
drumSkin.position.y = 0.4;
tub.add(tubShell, tubRim, tubBottom, dryInterior, drumSkin, strikePatch);
tub.position.set(0.2, 0.52, 0.72);
tub.rotation.z = 0.08;
group.add(tub);

const zhuangzi = new THREE.Group();
const body = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.42, 0.72, 8, 20),
  zhuangziBodyMaterial,
);
body.position.y = 0.98;
body.rotation.z = -0.08;
const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.28, 32, 32),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: zhuangziPortrait,
    roughness: 0.72,
  }),
);
head.position.set(0, 1.73, 0.02);
head.rotation.y = -0.12;
head.scale.set(1.08, 1.18, 0.92);
const beard = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 16), mat.ink);
beard.position.set(0.02, 1.42, 0.2);
beard.rotation.x = -0.5;
const hat = new THREE.Mesh(
  new THREE.CylinderGeometry(0.26, 0.2, 0.12, 24),
  mat.ink,
);
hat.position.set(0, 1.9, 0);
hat.position.y = 2.0;
zhuangzi.add(body, head, beard, hat);
zhuangzi.position.set(-0.72, 0, 0.72);
zhuangzi.rotation.y = -0.36;
group.add(zhuangzi);

const leftArm = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.06, 0.58, 8, 12),
  mat.skin,
);
leftArm.position.set(-0.22, 1.18, 0.3);
leftArm.rotation.set(1.22, -0.1, 0.54);
zhuangzi.add(leftArm);

const rightArm = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.06, 0.72, 8, 12),
  mat.skin,
);
rightArm.position.set(0.24, 1.18, 0.3);
rightArm.rotation.set(1.24, 0.08, -0.58);
zhuangzi.add(rightArm);
leftArm.visible = false;
rightArm.visible = false;

const leftBeater = new THREE.Group();
const leftStick = new THREE.Mesh(
  new THREE.CylinderGeometry(0.03, 0.03, 0.82, 14),
  mat.wood,
);
leftStick.rotation.set(1.3, 0, -0.45);
const leftKnob = new THREE.Mesh(
  new THREE.SphereGeometry(0.07, 16, 16),
  mat.wood,
);
leftKnob.position.set(0.26, -0.26, 0.34);
leftBeater.add(leftStick, leftKnob);
leftBeater.position.set(-0.25, 1.06, 0.38);
leftBeater.rotation.y = -0.1;
zhuangzi.add(leftBeater);

const rightBeater = new THREE.Group();
const rightStick = new THREE.Mesh(
  new THREE.CylinderGeometry(0.03, 0.03, 0.86, 14),
  mat.wood,
);
rightStick.rotation.set(1.3, 0, 0.45);
const rightKnob = new THREE.Mesh(
  new THREE.SphereGeometry(0.07, 16, 16),
  mat.wood,
);
rightKnob.position.set(-0.28, -0.28, 0.36);
rightBeater.add(rightStick, rightKnob);
rightBeater.position.set(0.34, 1.07, 0.38);
rightBeater.rotation.y = 0.1;
zhuangzi.add(rightBeater);
leftBeater.visible = false;
rightBeater.visible = false;

const connectedLeftBeater = new THREE.Mesh(
  new THREE.CylinderGeometry(0.032, 0.032, 1, 14),
  mat.wood,
);
const connectedRightBeater = new THREE.Mesh(
  new THREE.CylinderGeometry(0.032, 0.032, 1, 14),
  mat.wood,
);
const connectedLeftArm = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.065, 1, 8, 14),
  mat.skin,
);
const connectedRightArm = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.065, 1, 8, 14),
  mat.skin,
);
const leftHand = new THREE.Mesh(
  new THREE.SphereGeometry(0.075, 16, 16),
  mat.skin,
);
const rightHand = new THREE.Mesh(
  new THREE.SphereGeometry(0.075, 16, 16),
  mat.skin,
);
const leftMalletHead = new THREE.Mesh(
  new THREE.SphereGeometry(0.07, 16, 16),
  mat.wood,
);
const rightMalletHead = new THREE.Mesh(
  new THREE.SphereGeometry(0.07, 16, 16),
  mat.wood,
);
[
  connectedLeftArm,
  connectedRightArm,
  connectedLeftBeater,
  connectedRightBeater,
  leftHand,
  rightHand,
  leftMalletHead,
  rightMalletHead,
].forEach((mesh) => {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
});

const huishi = new THREE.Group();
const visitorBody = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.34, 0.7, 8, 18),
  huiziBodyMaterial,
);
visitorBody.position.y = 0.92;
const visitorHead = new THREE.Mesh(
  new THREE.SphereGeometry(0.25, 32, 32),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: huiziPortrait,
    roughness: 0.72,
  }),
);
visitorHead.position.y = 1.6;
visitorHead.rotation.y = Math.PI + 0.3;
visitorHead.scale.set(1.08, 1.18, 0.92);
const visitorScroll = new THREE.Mesh(
  new THREE.BoxGeometry(0.42, 0.18, 0.07),
  mat.paper,
);
visitorScroll.position.set(-0.18, 1.13, 0.34);
visitorScroll.rotation.z = -0.18;
huishi.add(visitorBody, visitorHead, visitorScroll);
huishi.position.set(2.1, 0, 1.25);
huishi.rotation.y = -1.0;
group.add(huishi);

const sign = new THREE.Group();
const signBoard = new THREE.Mesh(
  new THREE.BoxGeometry(1.82, 0.36, 0.07),
  mat.paper,
);
const signPost = new THREE.Mesh(
  new THREE.CylinderGeometry(0.04, 0.04, 1.05, 12),
  mat.wood,
);
signBoard.position.y = 0.94;
signPost.position.y = 0.45;
sign.add(signBoard, signPost);
sign.position.set(2.35, 0, -0.3);
sign.rotation.y = -0.72;
group.add(sign);

const grave = new THREE.Group();
const mound = new THREE.Mesh(
  new THREE.SphereGeometry(0.62, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
  mat.stone,
);
mound.scale.set(1.35, 0.36, 0.78);
const tablet = new THREE.Mesh(
  new THREE.BoxGeometry(0.36, 0.72, 0.12),
  mat.stone,
);
tablet.position.set(0, 0.48, -0.18);
grave.add(mound, tablet);
grave.position.set(1.35, 0, -1.15);
grave.rotation.y = -0.25;
group.add(grave);

const wife = new THREE.Group();
const wifeMat = new THREE.Mesh(
  new THREE.BoxGeometry(1.28, 0.08, 0.72),
  mat.paper,
);
wifeMat.position.set(0, 0.08, 0);
const wifeBody = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.2, 0.78, 8, 18),
  mat.wifeRobe,
);
wifeBody.position.set(0, 0.26, 0);
wifeBody.rotation.z = Math.PI / 2;
const wifeHead = new THREE.Mesh(
  new THREE.SphereGeometry(0.17, 24, 24),
  wifeFaceMaterial,
);
wifeHead.position.set(-0.53, 0.28, 0.02);
wifeHead.rotation.y = Math.PI / 2;
wifeHead.scale.set(1.08, 1.05, 0.92);
const wifeHair = new THREE.Mesh(
  new THREE.SphereGeometry(0.18, 24, 12),
  mat.wifeHair,
);
wifeHair.scale.set(1, 0.75, 0.82);
wifeHair.position.set(-0.6, 0.29, -0.02);
const wifeBlanket = new THREE.Mesh(
  new THREE.BoxGeometry(0.72, 0.08, 0.56),
  mat.wifeRobe,
);
wifeBlanket.position.set(0.13, 0.43, 0.01);
wifeBlanket.rotation.z = 0.03;
const wifeFlower = new THREE.Mesh(
  new THREE.ConeGeometry(0.08, 0.18, 6),
  mat.spirit,
);
wifeFlower.position.set(0.5, 0.52, 0.12);
wifeFlower.rotation.x = Math.PI / 2;
wife.add(wifeMat, wifeBody, wifeHead, wifeHair, wifeBlanket, wifeFlower);
wife.position.set(1.1, 0.02, -1.15);
wife.rotation.y = -0.25;
group.add(wife);

const spirit = new THREE.Group();
for (let i = 0; i < 42; i += 1) {
  const p = new THREE.Mesh(
    new THREE.SphereGeometry(0.025 + Math.random() * 0.03, 12, 12),
    mat.spirit,
  );
  const angle = Math.random() * Math.PI * 2;
  const radius = 0.22 + Math.random() * 0.72;
  p.userData = {
    angle,
    radius,
    speed: 0.25 + Math.random() * 0.5,
    y: Math.random() * 1.6,
  };
  spirit.add(p);
  particles.push(p);
}
spirit.position.set(1.15, 0.5, -1.12);
group.add(spirit);

const hallMaterials = {
  floor: new THREE.MeshStandardMaterial({
    color: 0x13172f,
    roughness: 0.58,
    metalness: 0.18,
    transparent: true,
    opacity: 0.88,
  }),
  pillar: new THREE.MeshStandardMaterial({
    color: 0x6f6f9b,
    emissive: 0x1d2556,
    emissiveIntensity: 0.5,
    roughness: 0.36,
    metalness: 0.2,
  }),
  ring: new THREE.MeshBasicMaterial({
    color: 0xd8c5ff,
    transparent: true,
    opacity: 0.46,
  }),
  star: new THREE.MeshBasicMaterial({
    color: 0xffe6b5,
    transparent: true,
    opacity: 0.82,
  }),
  gown: new THREE.MeshStandardMaterial({
    color: 0xcfc0ff,
    emissive: 0x4b3d91,
    emissiveIntensity: 0.48,
    roughness: 0.62,
    transparent: true,
    opacity: 0.86,
  }),
};

const hallFloor = new THREE.Mesh(
  new THREE.CircleGeometry(8.5, 128),
  hallMaterials.floor,
);
hallFloor.rotation.x = -Math.PI / 2;
hallFloor.position.y = -0.45;
hallFloor.receiveShadow = true;
hallGroup.add(hallFloor);

const hallRings = [];
for (let i = 0; i < 4; i += 1) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.6 + i * 0.72, 0.018, 10, 120),
    hallMaterials.ring,
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 1.2 + i * 0.18;
  ring.userData = { speed: 0.08 + i * 0.035, phase: i * 0.9 };
  hallGroup.add(ring);
  hallRings.push(ring);
}

for (let i = 0; i < 10; i += 1) {
  const angle = (i / 10) * Math.PI * 2;
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.14, 4.4, 18),
    hallMaterials.pillar,
  );
  column.position.set(Math.cos(angle) * 4.1, 1.45, Math.sin(angle) * 4.1);
  column.rotation.z = Math.sin(angle) * 0.08;
  column.castShadow = true;
  hallGroup.add(column);
}

const hallWife = new THREE.Group();
const hallWifeBody = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.24, 0.88, 8, 20),
  hallMaterials.gown,
);
hallWifeBody.position.y = 1.28;
const hallWifeHead = new THREE.Mesh(
  new THREE.SphereGeometry(0.18, 28, 28),
  wifeFaceMaterial,
);
hallWifeHead.position.y = 1.9;
hallWifeHead.scale.set(1.04, 1.1, 0.92);
const hallWifeHair = new THREE.Mesh(
  new THREE.SphereGeometry(0.2, 24, 14),
  mat.wifeHair,
);
hallWifeHair.position.set(0, 1.9, -0.05);
hallWifeHair.scale.set(1.04, 0.92, 0.86);
const hallWifeSleeveLeft = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.055, 0.58, 8, 12),
  hallMaterials.gown,
);
hallWifeSleeveLeft.position.set(-0.32, 1.42, 0.03);
hallWifeSleeveLeft.rotation.z = -0.72;
const hallWifeSleeveRight = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.055, 0.58, 8, 12),
  hallMaterials.gown,
);
hallWifeSleeveRight.position.set(0.32, 1.42, 0.03);
hallWifeSleeveRight.rotation.z = 0.72;
const hallWifeTrain = new THREE.Mesh(
  new THREE.ConeGeometry(0.42, 1.15, 36, 1, true),
  hallMaterials.gown,
);
hallWifeTrain.position.y = 0.58;
hallWifeTrain.rotation.x = Math.PI;
hallWife.add(
  hallWifeBody,
  hallWifeHead,
  hallWifeHair,
  hallWifeSleeveLeft,
  hallWifeSleeveRight,
  hallWifeTrain,
);
hallWife.position.set(0, 0.06, -0.12);
hallGroup.add(hallWife);

const hallSparks = [];
for (let i = 0; i < 120; i += 1) {
  const spark = new THREE.Mesh(
    new THREE.SphereGeometry(0.012 + Math.random() * 0.026, 10, 10),
    hallMaterials.star,
  );
  const angle = Math.random() * Math.PI * 2;
  spark.userData = {
    angle,
    radius: 0.45 + Math.random() * 2.6,
    speed: 0.16 + Math.random() * 0.54,
    height: 0.2 + Math.random() * 2.7,
    phase: Math.random() * Math.PI * 2,
  };
  hallGroup.add(spark);
  hallSparks.push(spark);
}

const leafGroup = new THREE.Group();
for (let i = 0; i < 34; i += 1) {
  const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.045), mat.leaf);
  leaf.position.set(
    (Math.random() - 0.5) * 7,
    0.3 + Math.random() * 3.2,
    (Math.random() - 0.5) * 5,
  );
  leaf.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI,
  );
  leaf.userData = {
    speed: 0.25 + Math.random() * 0.45,
    phase: Math.random() * 10,
  };
  leafGroup.add(leaf);
}
group.add(leafGroup);

function createTextTexture(text) {
  const textCanvas = document.createElement("canvas");
  textCanvas.width = 1024;
  textCanvas.height = 256;
  const ctx = textCanvas.getContext("2d");
  ctx.fillStyle = "rgba(245, 226, 184, 0.95)";
  ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);
  ctx.strokeStyle = "rgba(40, 30, 22, 0.95)";
  ctx.lineWidth = 16;
  ctx.strokeRect(8, 8, textCanvas.width - 16, textCanvas.height - 16);
  ctx.fillStyle = "#231b16";
  ctx.font = "700 72px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, textCanvas.width / 2, textCanvas.height / 2);
  return new THREE.CanvasTexture(textCanvas);
}

const signText = new THREE.Mesh(
  new THREE.PlaneGeometry(1.7, 0.3),
  new THREE.MeshBasicMaterial({
    map: createTextTexture("life/death jam"),
    side: THREE.DoubleSide,
  }),
);
signText.position.set(0, 0.94, 0.041);
sign.add(signText);

const rings = [];

function createBeatRing(delay = 0) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.78, 0.015, 8, 64),
    new THREE.MeshBasicMaterial({
      color: 0xffd38a,
      transparent: true,
      opacity: 0,
    }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.copy(tub.position);
  ring.position.y = 1.0;
  ring.userData = { life: delay };
  group.add(ring);
  rings.push(ring);
}

for (let i = 0; i < 4; i += 1) {
  createBeatRing(-i * 0.35);
}

function triggerBeat() {
  beatPulse = 1;
  autoBeatTimer = 0;
  createBeatRing(0);
}

function applySeasonState() {
  const season = seasons[seasonIndex];
  const isHall = season.hall;
  storyText.textContent = season.story;
  captionTitle.textContent = season.name;
  captionText.textContent = season.caption;
  zhuangziBodyMaterial.color.setHex(season.robe);
  mat.leaf.color.setHex(season.leaf);
  moon.material.color.setHex(season.moon);
  moon.material.emissive.setHex(season.moon);

  group.visible = !isHall;
  hallGroup.visible = isHall;
  wife.visible = seasonIndex === 0;
  huishi.visible = !isHall;
  sign.visible = seasonIndex === 1 || seasonIndex === 2;
  grave.visible = seasonIndex === 1 || seasonIndex === 2;
  spirit.visible = false;
  moon.visible = !isHall;
  hallLight.intensity = isHall ? 3.2 : 0;
  warmLight.intensity = isHall ? 0.2 : warmLight.intensity;

  if (isHall) {
    camera.position.set(4.2, 2.7, 5.7);
    controls.target.set(0, 1.25, 0);
  } else {
    camera.position.set(5.2, 3.1, 7.6);
    controls.target.set(0.15, 1.05, 0.05);
  }
  controls.update();
}

function turnSeason() {
  seasonIndex = (seasonIndex + 1) % seasons.length;
  applySeasonState();
}

beatButton.addEventListener("click", triggerBeat);
seasonButton.addEventListener("click", turnSeason);

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  if (width < 720) {
    moon.position.set(3.2, 4.9, -4.2);
  } else {
    moon.position.set(-3.8, 4.7, -3.8);
  }
  controls.update();
}
window.addEventListener("resize", resize);
resize();
applySeasonState();

function animate() {
  const delta = clock.getDelta();
  const elapsed = clock.elapsedTime;
  autoBeatTimer += delta;
  if (autoBeatTimer > 1.45) {
    triggerBeat();
  }

  const target = seasons[seasonIndex];
  scene.background.lerp(new THREE.Color(target.sky), 0.025);
  scene.fog.color.lerp(new THREE.Color(target.fog), 0.025);

  beatPulse = Math.max(0, beatPulse - delta * 2.6);
  const beat = Math.sin(beatPulse * Math.PI);
  leftBeater.rotation.z = -beat * 0.32;
  leftBeater.position.y = 1.06 - beat * 0.17;
  rightBeater.rotation.z = beat * 0.32;
  rightBeater.position.y = 1.07 - beat * 0.17;
  const zhuangziBob = Math.sin(elapsed * 2.7) * 0.025 + beat * 0.035;
  zhuangzi.position.y = zhuangziBob;
  zhuangzi.updateMatrixWorld();
  const leftShoulderPoint = tunedArmPoint("left", -0.08, 1.24, 0.46);
  const rightShoulderPoint = tunedArmPoint("right", -0.08, 1.24, -0.62);
  const leftHandPoint = tunedArmPoint("left", 0.04, 1.03 - beat * 0.08, 0.82);
  const rightHandPoint = tunedArmPoint("right", 0.04, 1.03 - beat * 0.08, -0.36);
  const leftStrikePoint = new THREE.Vector3(0.0, 1.05 - beat * 0.2, 0.78);
  const rightStrikePoint = new THREE.Vector3(0.42, 1.05 - beat * 0.2, 0.38);
  alignCylinderBetween(connectedLeftArm, leftShoulderPoint, leftHandPoint);
  alignCylinderBetween(connectedRightArm, rightShoulderPoint, rightHandPoint);
  alignCylinderBetween(connectedLeftBeater, leftHandPoint, leftStrikePoint);
  alignCylinderBetween(connectedRightBeater, rightHandPoint, rightStrikePoint);
  leftHand.position.copy(leftHandPoint);
  rightHand.position.copy(rightHandPoint);
  leftMalletHead.position.copy(leftStrikePoint);
  rightMalletHead.position.copy(rightStrikePoint);
  tubAngle = 0.08 + beat * 0.08 + Math.sin(elapsed * 2.4) * 0.01;
  tub.rotation.z = tubAngle;
  drumSkin.scale.setScalar(1 + beat * 0.015);
  strikePatch.scale.setScalar(1 + beat * 0.05);
  warmLight.intensity = target.hall
    ? 0.2
    : 1.6 + beat * 1.6 + Math.sin(elapsed * 1.3) * 0.12;
  hallLight.intensity = target.hall
    ? 2.8 + Math.sin(elapsed * 0.9) * 0.45
    : 0;

  huishi.rotation.z = Math.sin(elapsed * 1.7) * 0.035;
  huishi.position.y = Math.sin(elapsed * 1.1) * 0.018;
  wife.position.y = 0.02 + Math.sin(elapsed * 0.7) * 0.008;

  particles.forEach((particle) => {
    const data = particle.userData;
    const angle = data.angle + elapsed * data.speed;
    particle.position.set(
      Math.cos(angle) * data.radius,
      data.y + Math.sin(elapsed * data.speed + data.angle) * 0.08,
      Math.sin(angle) * data.radius,
    );
  });

  hallWife.position.y = 0.06 + Math.sin(elapsed * 0.82) * 0.12;
  hallWife.rotation.y = Math.sin(elapsed * 0.38) * 0.28;
  hallWife.rotation.z = Math.sin(elapsed * 0.52) * 0.045;
  hallRings.forEach((ring) => {
    ring.rotation.z = elapsed * ring.userData.speed + ring.userData.phase;
    ring.position.y = 1.2 + Math.sin(elapsed * 0.5 + ring.userData.phase) * 0.12;
    ring.material.opacity = 0.34 + Math.sin(elapsed * 0.7 + ring.userData.phase) * 0.12;
  });
  hallSparks.forEach((spark) => {
    const data = spark.userData;
    const angle = data.angle + elapsed * data.speed;
    const breathe = Math.sin(elapsed * 0.64 + data.phase) * 0.18;
    spark.position.set(
      Math.cos(angle) * (data.radius + breathe),
      data.height + Math.sin(elapsed * data.speed + data.phase) * 0.18,
      Math.sin(angle) * (data.radius + breathe),
    );
    spark.material.opacity = 0.48 + Math.sin(elapsed * 1.8 + data.phase) * 0.32;
  });

  leafGroup.children.forEach((leaf) => {
    leaf.position.y -= delta * leaf.userData.speed;
    leaf.position.x += Math.sin(elapsed + leaf.userData.phase) * delta * 0.12;
    leaf.rotation.z += delta * 0.9;
    if (leaf.position.y < 0.05) {
      leaf.position.y = 3.5;
    }
  });

  for (let index = rings.length - 1; index >= 0; index -= 1) {
    const ring = rings[index];
    ring.userData.life += delta;
    const life = ring.userData.life;
    if (life >= 0 && life < 1.15) {
      ring.scale.setScalar(1 + life * 2.1);
      ring.material.opacity = Math.max(0, 0.55 - life * 0.48);
    } else if (life < 0) {
      ring.material.opacity = 0;
    } else {
      group.remove(ring);
      ring.geometry.dispose();
      ring.material.dispose();
      rings.splice(index, 1);
    }
  }

  controls.update();

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
