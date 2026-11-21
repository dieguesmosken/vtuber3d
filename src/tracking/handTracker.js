// Docs: developers.google.com/edge/mediapipe/solutions/vision/hand_landmarker/web_js
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

export async function createHandLandmarker({
  wasmPath = '/mediapipe/wasm',
  modelPath = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
  delegate = 'GPU',
  numHands = 2,
} = {}) {
  const fileset = await FilesetResolver.forVisionTasks(wasmPath);
  const options = (d) => ({
    baseOptions: { modelAssetPath: modelPath, delegate: d },
    runningMode: 'VIDEO',
    numHands,
  });
  try {
    return await HandLandmarker.createFromOptions(fileset, options(delegate));
  } catch (err) {
    console.warn('Mãos: delegate GPU falhou; usando CPU.', err);
    return HandLandmarker.createFromOptions(fileset, options('CPU'));
  }
}

// Resultado -> lista de mãos { lm: [{x,y,z} x21] } (coordenadas normalizadas da imagem crua da câmera).
export function parseHands(res) {
  return (res?.landmarks ?? []).map((lm) => ({ lm: lm.map((p) => ({ x: p.x, y: p.y, z: p.z })) }));
}

const d3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z - b.z) * 0.5);

// Gestos simples por extensão dos dedos. Índices: 0 punho; polegar 1-4; indicador 5-8;
// médio 9-12; anelar 13-16; mindinho 17-20.
export function classifyGesture(lm) {
  const wrist = lm[0];
  const ext = (tip, pip) => d3(lm[tip], wrist) > d3(lm[pip], wrist) * 1.12;
  const index = ext(8, 6), middle = ext(12, 10), ring = ext(16, 14), pinky = ext(20, 18);
  const thumb = d3(lm[4], lm[5]) > d3(lm[3], lm[5]) * 1.05 && d3(lm[4], lm[17]) > d3(lm[2], lm[17]);
  const n = [index, middle, ring, pinky].filter(Boolean).length;
  if (n === 4 && thumb) return 'open';
  if (n === 0 && thumb && lm[4].y < lm[3].y - 0.02 && lm[4].y < wrist.y) return 'thumbs_up';
  if (index && middle && !ring && !pinky) return 'peace';
  if (index && n === 1) return 'point';
  if (n === 0) return 'fist';
  return 'other';
}
