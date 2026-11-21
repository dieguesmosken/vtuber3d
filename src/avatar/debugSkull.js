// Avatar de teste procedural: "crânio" de lobo em wireframe. Não precisa de modelo nenhum.
// Serve para validar: sinais da cabeça, lado das piscadas (heterocromia) e espelhamento.
// Convenção: o personagem olha para +Z; a câmera fica em +Z olhando para -Z.
//   -> eixo +X aparece à DIREITA da tela = lado ESQUERDO do personagem = olho VERDE (eyeBlinkLeft)
//   -> eixo -X aparece à ESQUERDA da tela = lado DIREITO do personagem = olho ÂMBAR (eyeBlinkRight)
import * as THREE from 'three';

const wire = (color) => new THREE.MeshBasicMaterial({ color, wireframe: true });
const solid = (color) => new THREE.MeshBasicMaterial({ color });

export class DebugSkull {
  constructor(cfg) {
    this.cfg = cfg;
    this.hasArkit = true;
    this.root = new THREE.Group();
    const S = 1.8; // escala para o enquadramento de busto

    this.pivot = new THREE.Group();            // pivô do pescoço
    this.pivot.position.set(0, 1.18, 0);
    this.pivot.scale.setScalar(S);
    this.root.add(this.pivot);

    // Crânio
    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 14), wire(0xC5C2C8));
    cranium.scale.set(1, 1.1, 1.05);
    cranium.position.y = 0.1;
    this.pivot.add(cranium);

    // Focinho (cone apontando para +Z)
    const snout = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 10, 4, true), wire(0xC5C2C8));
    snout.rotation.x = Math.PI / 2;            // ponta do cone para +Z
    snout.position.set(0, 0.06, 0.15);
    this.pivot.add(snout);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 6), solid(0x111111));
    nose.position.set(0, 0.06, 0.235);
    this.pivot.add(nose);

    // Mandíbula (pivô na dobradiça, perto das orelhas)
    this.jaw = new THREE.Group();
    this.jaw.position.set(0, 0.02, 0.04);
    const jawMesh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.025, 0.14, 4, 1, 6), wire(0xC5C2C8));
    jawMesh.position.set(0, -0.02, 0.08);
    this.jaw.add(jawMesh);
    this.pivot.add(this.jaw);

    // Olhos: +X (direita da tela) = esquerda do personagem = VERDE; -X = ÂMBAR
    this.eyeL = this._eye(+0.045, 0x65A94F);
    this.eyeR = this._eye(-0.045, 0xF2AE2E);

    // Sobrancelhas
    this.browL = this._brow(+0.045);
    this.browR = this._brow(-0.045);

    // Orelhas erguidas
    this.earL = this._ear(+0.07);
    this.earR = this._ear(-0.07);

    // Cantos da boca
    this.mouthL = this._corner(+0.035);
    this.mouthR = this._corner(-0.035);

    // Mecha roxa na testa
    const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 6), solid(0x762FC2));
    tuft.position.set(0, 0.23, 0.07);
    tuft.rotation.x = 0.5;
    this.pivot.add(tuft);

    this.gaze = { yaw: 0, pitch: 0 };
    this.eyeRest = { l: this.eyeL.position.clone(), r: this.eyeR.position.clone() };
  }

  _eye(x, color) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 10), solid(color));
    m.position.set(x, 0.1, 0.1);
    this.pivot.add(m);
    return m;
  }
  _brow(x) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.006, 0.006), solid(0x393741));
    m.position.set(x, 0.14, 0.105);
    this.pivot.add(m);
    return m;
  }
  _ear(x) {
    const g = new THREE.Group();
    g.position.set(x, 0.19, -0.01);
    const m = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.14, 4), wire(0x393741));
    m.position.y = 0.07;
    g.add(m);
    this.pivot.add(g);
    return g;
  }
  _corner(x) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 6), solid(0xC92730));
    m.position.set(x, 0.03, 0.17);
    this.pivot.add(m);
    return m;
  }

  setHead({ yaw, pitch, roll }) {
    this.pivot.rotation.set(pitch, yaw, roll, 'YXZ');
  }

  // map: blendshapes ARKit (0..1), já calibrados/filtrados e já espelhados se M estiver ativo
  setExpressions(b) {
    const g = (k) => b[k] ?? 0;
    this.eyeL.scale.y = Math.max(0.08, 1 - g('eyeBlinkLeft') * 0.92);
    this.eyeR.scale.y = Math.max(0.08, 1 - g('eyeBlinkRight') * 0.92);
    this.jaw.rotation.x = g('jawOpen') * 0.55;
    const smileL = g('mouthSmileLeft'), smileR = g('mouthSmileRight');
    this.mouthL.position.y = 0.03 + smileL * 0.02 - g('mouthFrownLeft') * 0.015;
    this.mouthR.position.y = 0.03 + smileR * 0.02 - g('mouthFrownRight') * 0.015;
    this.mouthL.position.x = 0.035 + smileL * 0.012;
    this.mouthR.position.x = -0.035 - smileR * 0.012;
    const up = g('browInnerUp');
    this.browL.position.y = 0.14 + up * 0.02 - g('browDownLeft') * 0.02;
    this.browR.position.y = 0.14 + up * 0.02 - g('browDownRight') * 0.02;
    const back = up * 0.35 - (g('browDownLeft') + g('browDownRight')) * 0.2;
    this.earL.rotation.x = -back;
    this.earR.rotation.x = -back;
  }

  setGaze(yawDeg, pitchDeg) {
    const y = THREE.MathUtils.degToRad(yawDeg), p = THREE.MathUtils.degToRad(pitchDeg);
    for (const [eye, rest] of [[this.eyeL, this.eyeRest.l], [this.eyeR, this.eyeRest.r]]) {
      eye.position.x = rest.x + Math.sin(y) * 0.008;
      eye.position.y = rest.y + Math.sin(p) * 0.008;
    }
  }

  update() {}
  dispose() {
    this.root.traverse((o) => { o.geometry?.dispose(); o.material?.dispose?.(); });
  }
}
