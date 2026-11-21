import * as THREE from 'three';
import { startCamera, createFaceLandmarker, createTrackingLoop } from './tracking/faceTracker.js';
import { OneEuro } from './tracking/oneEuro.js';
import { matrixToEuler } from './tracking/headPose.js';
import { createScene, setBackground } from './render/scene.js';
import { loadAvatar } from './avatar/loadAvatar.js';
import { DebugSkull } from './avatar/debugSkull.js';
import { mirrorBlend, arkitToVrmPresets, gazeFromBlend } from './avatar/mapping.js';
import { DEFAULTS } from './config/defaults.js';
import { createDebugPanel } from './ui/debugPanel.js';
import { createHandLandmarker, parseHands, classifyGesture } from './tracking/handTracker.js';
import { HandsView } from './avatar/handsView.js';
import { saveModel, loadSavedModel, clearSavedModel } from './storage/modelStore.js';

const params = new URLSearchParams(location.search);
const saved = JSON.parse(localStorage.getItem('teyo:cfg') ?? '{}');
const cfg = structuredClone({ ...DEFAULTS, ...saved });
cfg.camera = { ...DEFAULTS.camera, ...JSON.parse(localStorage.getItem('teyo:camera') ?? '{}') };
if (params.get('mode') === 'obs') document.body.classList.add('obs');
if (params.get('bg')) cfg.background = params.get('bg') === 'transparent' ? 'transparent' : '#' + params.get('bg');

const { renderer, scene, camera } = createScene(document.getElementById('c'), cfg);
const handsView = new HandsView();
scene.add(handsView.root);
let hands = [], gestures = [];
let handsOn = (saved.hands ?? DEFAULTS.hands);
const panel = createDebugPanel(document.getElementById('panel'));
const video = document.getElementById('video');

let avatar = null, modelKey = 'default';
let latest = { found: false, blend: {}, matrix: null }, lastSeen = 0;
let calib = { head: { yaw: 0, pitch: 0, roll: 0 }, neutral: {} };
const headF = { yaw: new OneEuro(cfg.headFilter), pitch: new OneEuro(cfg.headFilter), roll: new OneEuro(cfg.headFilter) };
const blendF = {};

async function setAvatar(url, key) {
  if (avatar) { scene.remove(avatar.root); avatar.dispose(); }
  avatar = url === 'skull' ? new DebugSkull(cfg) : await loadAvatar(url, cfg);
  scene.add(avatar.root);
  modelKey = key;
  calib = JSON.parse(localStorage.getItem('teyo:calib:' + key) ?? 'null') ?? calib;
}

async function openModelFile(f) {
  if (!f || !/\.(vrm|glb)$/i.test(f.name)) return;
  try {
    await setAvatar(URL.createObjectURL(f), f.name);
    saveModel(f); // lembra o modelo neste navegador (ex.: Browser Source do OBS)
  } catch (e) {
    console.error('Falha ao carregar o modelo', e);
    alert('Não consegui carregar esse arquivo. Use um .vrm ou .glb válido.');
  }
}
document.getElementById('file').addEventListener('change', (ev) => openModelFile(ev.target.files[0]));
// Arrastar e soltar o arquivo na página
addEventListener('dragover', (ev) => ev.preventDefault());
addEventListener('drop', (ev) => { ev.preventDefault(); openModelFile(ev.dataTransfer?.files?.[0]); });

addEventListener('keydown', (ev) => {
  if (ev.key === 'c' && latest.found && latest.matrix) {           // calibrar pose neutra
    calib = { head: matrixToEuler(latest.matrix, { transpose: cfg.matrixTranspose }), neutral: { ...latest.blend } };
    localStorage.setItem('teyo:calib:' + modelKey, JSON.stringify(calib));
  }
  if (ev.key === 'm') cfg.mirror = !cfg.mirror;
  if (ev.key === 'k') { clearSavedModel(); setAvatar('skull', 'skull'); }
  if (ev.key === 'h') { handsOn = !handsOn; if (!handsOn) { hands = []; gestures = []; } }                  // volta ao crânio de teste
  if (ev.key === 'g') { cfg.background = cfg.background === 'transparent' ? '#00ff00' : 'transparent'; setBackground(renderer, cfg.background); }
  localStorage.setItem('teyo:cfg', JSON.stringify({ mirror: cfg.mirror, background: cfg.background, hands: handsOn }));
});

// Padrão: crânio de teste (sem arquivo). Use ?model=/avatars/test.vrm ou o seletor de arquivo para um modelo real.
// Modelo inicial: ?model=URL  ->  último modelo salvo neste navegador  ->  crânio de teste.
{
  const url = params.get('model');
  const stored = url ? null : await loadSavedModel();
  try {
    if (url) await setAvatar(url, url);
    else if (stored) await setAvatar(URL.createObjectURL(stored.blob), stored.name);
    else await setAvatar('skull', 'skull');
  } catch (e) {
    console.warn('Modelo inicial indisponível; usando o crânio de teste.', e);
    await setAvatar('skull', 'skull');
  }
}
await startCamera(video);
const landmarker = await createFaceLandmarker();
let handLm = null;
createHandLandmarker().then((h) => { handLm = h; }).catch((e) => console.warn('Mãos indisponíveis', e));
createTrackingLoop(video, landmarker, (data, ms) => {
  if (data.found) { latest = data; lastSeen = performance.now(); }
  panel(data, ms, gestures.length ? `| mãos: ${gestures.join(', ')}` : '');
}, {
  get landmarker() { return handLm; },
  enabled: () => handsOn,
  every: cfg.handsEvery,
  onHands: (res) => {
    hands = parseHands(res);
    gestures = hands.map((h) => classifyGesture(h.lm));
  },
});

const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = clock.getDelta();
  const t = performance.now() / 1000;
  const lost = performance.now() - lastSeen > 500; // rosto perdido: volta suave ao neutro

  if (avatar) {
    // Cabeça
    const pose = { yaw: 0, pitch: 0, roll: 0 };
    if (!lost && latest.matrix) {
      const raw = matrixToEuler(latest.matrix, { transpose: cfg.matrixTranspose });
      for (const k of ['yaw', 'pitch', 'roll']) pose[k] = (raw[k] - calib.head[k]) * cfg.headSign[k];
      if (cfg.mirror) { pose.yaw = -pose.yaw; pose.roll = -pose.roll; }
    }
    for (const k of ['yaw', 'pitch', 'roll']) pose[k] = headF[k].filter(pose[k], t);
    avatar.setHead(pose);

    // Blendshapes: espelho opcional -> calibração -> filtro
    const src = lost ? {} : (cfg.mirror ? mirrorBlend(latest.blend) : latest.blend);
    const b = {};
    for (const [k, v] of Object.entries(src)) {
      const n = calib.neutral[k] ?? 0;
      const x = Math.min(1, Math.max(0, (v - n) / Math.max(0.1, 1 - n)));
      b[k] = (blendF[k] ??= new OneEuro(cfg.blendFilter)).filter(x, t);
    }
    for (const g of gestures) {
      for (const [k, v] of Object.entries(cfg.gestureExpressions[g] ?? {})) b[k] = Math.max(b[k] ?? 0, v);
    }
    avatar.setExpressions(avatar.hasArkit ? b : arkitToVrmPresets(b));

    const gz = gazeFromBlend(b);
    avatar.setGaze(gz.yaw * cfg.gazeRangeDeg.yaw, gz.pitch * cfg.gazeRangeDeg.pitch);
    avatar.update(dt);
  }
  handsView.update(handsOn ? hands : [], t, {
    distance: cfg.camera.distance, fov: cfg.camera.fov,
    aspectVideo: (video.videoWidth || 4) / (video.videoHeight || 3), mirror: cfg.mirror,
  });
  renderer.render(scene, camera);
});
