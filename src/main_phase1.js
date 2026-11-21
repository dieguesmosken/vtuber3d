// Fase 1: só rastreamento. Em index.html troque o script para /src/main_phase1.js
import { startCamera, createFaceLandmarker, createTrackingLoop } from './tracking/faceTracker.js';
import { matrixToEuler } from './tracking/headPose.js';
import { createDebugPanel } from './ui/debugPanel.js';

const deg = (r) => (r * 180 / Math.PI).toFixed(1);
const video = document.getElementById('video');
const panel = createDebugPanel(document.getElementById('panel'));

await startCamera(video);
const landmarker = await createFaceLandmarker();
createTrackingLoop(video, landmarker, (data, ms) => {
  let pose = '';
  if (data.matrix) {
    const p = matrixToEuler(data.matrix);
    pose = `| yaw ${deg(p.yaw)}° pitch ${deg(p.pitch)}° roll ${deg(p.roll)}°`;
  }
  panel(data, ms, pose);
});
