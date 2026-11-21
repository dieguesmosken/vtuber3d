// Teyo (demo): personagem embutido, procedural e simples, feito só com as cores e traços do design oficial.
// Serve de exemplo de personagem e de teste. O modelo definitivo do Teyo entra como .vrm/.glb pelo seletor de arquivo.
// Convenção: o personagem olha para +Z; a câmera fica em +Z. +X = direita da tela = lado ESQUERDO do personagem.
//   Olho à esquerda da tela (-X) = ÂMBAR; olho à direita da tela (+X) = VERDE.
import * as THREE from 'three';

const C = {
  fur: 0x393741, light: 0xC5C2C8, purple: 0x762FC2, hood: 0xC92730,
  amber: 0xF2AE2E, green: 0x65A94F, pupil: 0x17161A, nose: 0x17171B,
  ear: 0xD9C5C8, cord: 0xE2DFD8, mouth: 0x3a1418, sclera: 0xF4F2F6, brow: 0x4d4a58,
};

const toon = (c) => new THREE.MeshToonMaterial({ color: c });
const outlineMat = new THREE.MeshBasicMaterial({ color: 0x0d0c10, side: THREE.BackSide });

// Malha com contorno (casco invertido) para o visual de desenho animado.
function part(geo, color, outline = 0.06) {
  const m = new THREE.Mesh(geo, toon(color));
  if (outline) {
    const o = new THREE.Mesh(geo, outlineMat);
    o.scale.setScalar(1 + outline);
    m.add(o);
  }
  return m;
}
const sphere = (r, w = 20, h = 14) => new THREE.SphereGeometry(r, w, h);
const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };

export class TeyoAvatar {
  constructor(cfg) {
    this.cfg = cfg;
    this.hasArkit = true;
    this.root = new THREE.Group();

    // ---------- corpo (moletom vermelho com capuz) — fica fixo, balança de leve com a cabeça ----------
    this.body = new THREE.Group();
    this.root.add(this.body);
    this.body.add(at(part(sphere(0.2, 26, 18), C.hood), 0, 0.96, 0));
    this.body.children[0].scale.set(1.35, 0.95, 0.85);
    const hoodBack = at(part(sphere(0.14, 22, 16), C.hood), 0, 1.09, -0.07);
    hoodBack.scale.set(1.15, 0.8, 0.8);
    this.body.add(hoodBack);
    const collar = at(part(new THREE.TorusGeometry(0.1, 0.028, 10, 26), C.hood), 0, 1.08, 0.02);
    collar.rotation.x = Math.PI / 2.3;
    this.body.add(collar);
    this.body.add(at(part(new THREE.CylinderGeometry(0.075, 0.085, 0.12, 14), C.fur, 0.05), 0, 1.12, 0));
    for (const x of [-0.045, 0.045]) {                       // dois cordões claros
      const cord = at(part(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 8), C.cord, 0), x, 1.0, 0.178);
      cord.rotation.z = x < 0 ? 0.05 : -0.05;
      const bead = at(part(sphere(0.014, 8, 6), C.cord, 0), x * 1.05, 0.93, 0.178);
      this.body.add(cord, bead);
    }

    // ---------- cabeça (pivô no pescoço, mesma escala do crânio de teste) ----------
    this.pivot = new THREE.Group();
    this.pivot.position.set(0, 1.18, 0);
    this.pivot.scale.setScalar(1.8);
    this.root.add(this.pivot);
    const P = this.pivot;

    const head = at(part(sphere(0.11, 26, 20), C.fur), 0, 0.1, 0);
    head.scale.set(1, 0.95, 1.02);
    P.add(head);

    // Focinho curto e claro, bochechas claras, nariz
    const muzzle = at(part(sphere(0.05), C.light), 0, 0.05, 0.135);
    muzzle.scale.set(0.85, 0.62, 1.45);
    P.add(muzzle);
    P.add(at(new THREE.Mesh(sphere(0.012, 10, 8), toon(C.nose)), 0, 0.064, 0.2));
    for (const x of [-0.062, 0.062]) {
      const cheek = at(part(sphere(0.03), C.light, 0.04), x, 0.048, 0.085);
      cheek.scale.set(1, 0.8, 0.7);
      P.add(cheek);
    }

    // Boca: interior escuro fixo + mandíbula que gira
    const mouthIn = at(new THREE.Mesh(sphere(0.04, 14, 10), toon(C.mouth)), 0, 0.02, 0.1);
    mouthIn.scale.set(0.75, 0.28, 1.35);
    P.add(mouthIn);
    this.jaw = new THREE.Group();
    this.jaw.position.set(0, 0.025, 0.05);
    const jawMesh = at(part(sphere(0.04), C.light, 0.05), 0, -0.008, 0.085);
    jawMesh.scale.set(0.8, 0.4, 1.4);
    this.jaw.add(jawMesh);
    P.add(this.jaw);

    // Sorriso pequeno: dois cantos que sobem com mouthSmile*
    this.mouthL = at(new THREE.Mesh(sphere(0.006, 6, 6), toon(C.pupil)), 0.03, 0.03, 0.166);
    this.mouthR = at(new THREE.Mesh(sphere(0.006, 6, 6), toon(C.pupil)), -0.03, 0.03, 0.166);
    P.add(this.mouthL, this.mouthR);

    // Olhos grandes: +X (direita da tela) = VERDE, -X (esquerda da tela) = ÂMBAR
    this.eyeL = this._eye(+0.046, C.green);
    this.eyeR = this._eye(-0.046, C.amber);

    // Sobrancelhas discretas (para as expressões)
    this.browL = this._brow(+0.046);
    this.browR = this._brow(-0.046);

    // Orelhas grandes, erguidas, interior claro
    this.earL = this._ear(+0.066);
    this.earR = this._ear(-0.066);

    // Cabelo: mecha roxa frontal e tufos no topo
    const mecha = at(part(new THREE.ConeGeometry(0.03, 0.1, 8), C.purple, 0.08), 0, 0.195, 0.1);
    mecha.rotation.x = 2.2;
    P.add(mecha);
    for (const [x, z, rz] of [[-0.026, 0.035, 0.28], [0.026, 0.035, -0.28], [0, 0.012, 0]]) {
      const tuft = at(part(new THREE.ConeGeometry(0.02, 0.07, 7), C.purple, 0.08), x, 0.222, z);
      tuft.rotation.set(0.45, 0, rz);
      P.add(tuft);
    }

    this.irisRest = { l: this.eyeL.iris.position.clone(), r: this.eyeR.iris.position.clone() };
  }

  _eye(x, color) {
    const g = new THREE.Group();
    g.position.set(x, 0.105, 0.092);
    const sclera = part(sphere(0.03, 18, 14), C.sclera, 0.03);
    sclera.scale.set(1, 1, 0.55);
    const iris = new THREE.Group();
    const irisMesh = new THREE.Mesh(sphere(0.019, 14, 10), toon(color));
    irisMesh.scale.z = 0.5;
    const pupil = new THREE.Mesh(sphere(0.009, 10, 8), toon(C.pupil));
    pupil.position.z = 0.005;
    iris.add(irisMesh, pupil);
    iris.position.z = 0.012;
    g.add(sclera, iris);
    this.pivot.add(g);
    g.iris = iris;
    return g;
  }
  _brow(x) {
    const m = at(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.007, 0.007), toon(C.brow)), x, 0.145, 0.1);
    this.pivot.add(m);
    return m;
  }
  _ear(x) {
    const g = new THREE.Group();
    g.position.set(x, 0.195, -0.005);
    g.rotation.z = x > 0 ? -0.12 : 0.12;
    const outer = at(part(new THREE.ConeGeometry(0.042, 0.17, 6), C.fur, 0.07), 0, 0.085, 0);
    const inner = at(new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.13, 6), toon(C.ear)), 0, 0.075, 0.016);
    g.add(outer, inner);
    this.pivot.add(g);
    return g;
  }

  setHead({ yaw, pitch, roll }) {
    this.pivot.rotation.set(pitch, yaw, roll, 'YXZ');
    this.body.rotation.set(0, yaw * 0.15, roll * 0.1, 'YXZ'); // o corpo acompanha um pouco
  }

  setExpressions(b) {
    const g = (k) => b[k] ?? 0;
    this.eyeL.scale.y = Math.max(0.08, 1 - g('eyeBlinkLeft') * 0.92);
    this.eyeR.scale.y = Math.max(0.08, 1 - g('eyeBlinkRight') * 0.92);
    this.jaw.rotation.x = g('jawOpen') * 0.55;
    const smileL = g('mouthSmileLeft'), smileR = g('mouthSmileRight');
    this.mouthL.position.y = 0.03 + 0.004 + smileL * 0.018 - g('mouthFrownLeft') * 0.012; // sorriso pequeno em repouso
    this.mouthR.position.y = 0.03 + 0.004 + smileR * 0.018 - g('mouthFrownRight') * 0.012;
    this.mouthL.position.x = 0.03 + smileL * 0.012;
    this.mouthR.position.x = -0.03 - smileR * 0.012;
    const up = g('browInnerUp');
    this.browL.position.y = 0.145 + up * 0.02 - g('browDownLeft') * 0.018;
    this.browR.position.y = 0.145 + up * 0.02 - g('browDownRight') * 0.018;
    const back = up * 0.3 - (g('browDownLeft') + g('browDownRight')) * 0.2;
    this.earL.rotation.x = -back;
    this.earR.rotation.x = -back;
  }

  setGaze(yawDeg, pitchDeg) {
    const y = THREE.MathUtils.degToRad(yawDeg), p = THREE.MathUtils.degToRad(pitchDeg);
    for (const [eye, rest] of [[this.eyeL, this.irisRest.l], [this.eyeR, this.irisRest.r]]) {
      eye.iris.position.x = rest.x + Math.sin(y) * 0.011;
      eye.iris.position.y = rest.y + Math.sin(p) * 0.011;
    }
  }

  update() {}
  dispose() {
    this.root.traverse((o) => { o.geometry?.dispose(); if (o.material !== outlineMat) o.material?.dispose?.(); });
  }
}
