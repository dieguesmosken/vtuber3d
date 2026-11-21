// Docs: developers.google.com/edge/mediapipe/solutions/vision/face_landmarker/web_js
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';

export async function startCamera(video, { width = 640, height = 480, fps = 30 } = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: width }, height: { ideal: height }, frameRate: { ideal: fps } },
    audio: false,
  });
  video.srcObject = stream;
  await video.play();
  return stream;
}

export async function createFaceLandmarker({
  wasmPath = '/mediapipe/wasm',
  modelPath = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  delegate = 'GPU',
} = {}) {
  const fileset = await FilesetResolver.forVisionTasks(wasmPath);
  const options = (d) => ({
    baseOptions: { modelAssetPath: modelPath, delegate: d },
    runningMode: 'VIDEO',
    numFaces: 1,
    outputFaceBlendshapes: true,
    outputFacialTransformationMatrixes: true,
  });
  try {
    return await FaceLandmarker.createFromOptions(fileset, options(delegate));
  } catch (err) {
    console.warn('Delegate GPU falhou; usando CPU.', err);
    return FaceLandmarker.createFromOptions(fileset, options('CPU'));
  }
}

export function parseResult(res) {
  const out = { found: false, blend: {}, matrix: null };
  if (!res?.faceBlendshapes?.length) return out;
  out.found = true;
  for (const c of res.faceBlendshapes[0].categories) out.blend[c.categoryName] = c.score;
  if (res.facialTransformationMatrixes?.length) out.matrix = res.facialTransformationMatrixes[0].data;
  return out;
}

// Só processa quando chega um quadro novo da webcam (economiza GPU/CPU).
// handsCtl (opcional): { landmarker, enabled(): boolean, onHands(res), every }
export function createTrackingLoop(video, landmarker, onResult, handsCtl = null) {
  let lastVideoTime = -1;
  let running = true;
  let frame = 0, lastHandTs = 0;
  const tick = () => {
    if (!running) return;
    if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      const t0 = performance.now();
      const res = landmarker.detectForVideo(video, t0);
      onResult(parseResult(res), performance.now() - t0);
      frame++;
      if (handsCtl?.landmarker && handsCtl.enabled() && frame % (handsCtl.every ?? 1) === 0) {
        const ts = Math.max(performance.now(), lastHandTs + 1); // timestamps estritamente crescentes
        lastHandTs = ts;
        handsCtl.onHands(handsCtl.landmarker.detectForVideo(video, ts));
      }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return () => { running = false; };
}
