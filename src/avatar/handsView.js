// Mãos em 3D (esqueleto) posicionadas no mesmo enquadramento da câmera virtual.
// Mapeia a imagem crua da webcam para a tela: câmera = sem flip; modo espelho = flip em X.
import * as THREE from 'three';
import { OneEuro } from '../tracking/oneEuro.js';

const BONES = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];
const FILTER = { minCutoff: 1.5, beta: 6, dCutoff: 1.0 }; // coordenadas normalizadas (0..1)

class HandSlot {
  constructor(color) {
    this.group = new THREE.Group();
    this.group.visible = false;
    const sph = new THREE.SphereGeometry(0.008, 8, 6);
    this.joints = Array.from({ length: 21 }, () => {
      const m = new THREE.Mesh(sph, new THREE.MeshBasicMaterial({ color }));
      this.group.add(m);
      return m;
    });
    this.pos = new THREE.BufferAttribute(new Float32Array(BONES.length * 6), 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', this.pos);
    this.lines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color }));
    this.lines.frustumCulled = false;
    this.group.add(this.lines);
    this.filters = null;
  }
  hide() { this.group.visible = false; this.filters = null; }
}

export class HandsView {
  constructor() {
    this.root = new THREE.Group();
    this.slots = [new HandSlot(0xC92730), new HandSlot(0x762FC2)];
    this.slots.forEach((s) => this.root.add(s.group));
  }

  // hands: [{lm}], t em segundos, cam: {distance, fov}, aspectVideo, mirror
  update(hands, t, { distance, fov, aspectVideo, mirror }) {
    const z0 = 0.35;                                           // plano das mãos, à frente do rosto
    const Hv = 2 * Math.max(0.2, distance - z0) * Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const Wv = Hv * aspectVideo;
    // Ordena por posição X na imagem para manter cada mão no mesmo slot.
    const sorted = [...hands].sort((a, b) => a.lm[0].x - b.lm[0].x);
    this.slots.forEach((slot, i) => {
      const hand = sorted[i];
      if (!hand) { slot.hide(); return; }
      slot.filters ??= hand.lm.map(() => ({ x: new OneEuro(FILTER), y: new OneEuro(FILTER), z: new OneEuro(FILTER) }));
      const pts = hand.lm.map((p, k) => {
        const f = slot.filters[k];
        const x = f.x.filter(p.x, t), y = f.y.filter(p.y, t), z = f.z.filter(p.z, t);
        const sx = (mirror ? 0.5 - x : x - 0.5) * Wv;
        return new THREE.Vector3(sx, 1.35 - (y - 0.5) * Hv, z0 - z * Wv * 0.8);
      });
      pts.forEach((v, k) => slot.joints[k].position.copy(v));
      BONES.forEach(([a, b], k) => {
        slot.pos.setXYZ(k * 2, pts[a].x, pts[a].y, pts[a].z);
        slot.pos.setXYZ(k * 2 + 1, pts[b].x, pts[b].y, pts[b].z);
      });
      slot.pos.needsUpdate = true;
      slot.group.visible = true;
    });
  }
}
