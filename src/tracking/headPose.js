import * as THREE from 'three';

const m4 = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();

// transpose: configurável — a ordem (row/column-major) do array do MediaPipe não foi confirmada.
export function matrixToEuler(data, { transpose = false } = {}) {
  m4.fromArray(data);
  if (transpose) m4.transpose();
  q.setFromRotationMatrix(m4);
  e.setFromQuaternion(q, 'YXZ');
  return { pitch: e.x, yaw: e.y, roll: e.z }; // radianos
}
