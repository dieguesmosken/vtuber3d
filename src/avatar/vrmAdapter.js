import * as THREE from 'three';
import { VRMUtils } from '@pixiv/three-vrm';

const _v = new THREE.Vector3();

export class VrmAdapter {
  constructor(vrm, cfg) {
    this.vrm = vrm; this.root = vrm.scene; this.cfg = cfg;
    const h = vrm.humanoid;
    this.bones = {
      spine: h.getNormalizedBoneNode('upperChest') ?? h.getNormalizedBoneNode('chest') ?? h.getNormalizedBoneNode('spine'),
      neck: h.getNormalizedBoneNode('neck'),
      head: h.getNormalizedBoneNode('head'),
    };
    this.names = new Set((vrm.expressionManager?.expressions ?? []).map((e) => e.expressionName));
    this.hasArkit = this.names.has('jawOpen') && this.names.has('eyeBlinkLeft');
    this.lookTarget = new THREE.Object3D();
    if (vrm.lookAt) vrm.lookAt.target = this.lookTarget;
  }

  setHead({ yaw, pitch, roll }) {
    const w = this.cfg.headWeights;
    const neckW = this.bones.neck ? w.neck : 0;
    const headW = this.bones.neck ? w.head : w.head + w.neck; // neck é opcional no VRM 1.0
    for (const [bone, k] of [[this.bones.spine, w.spine], [this.bones.neck, neckW], [this.bones.head, headW]]) {
      if (bone) bone.rotation.set(pitch * k, yaw * k, roll * k, 'YXZ');
    }
  }

  setExpressions(map) {
    const em = this.vrm.expressionManager;
    if (!em) return;
    for (const [name, v] of Object.entries(map)) if (this.names.has(name)) em.setValue(name, v);
  }

  setGaze(yawDeg, pitchDeg) {
    if (!this.vrm.lookAt || !this.bones.head) return;
    this.bones.head.getWorldPosition(_v);
    const y = THREE.MathUtils.degToRad(yawDeg), p = THREE.MathUtils.degToRad(pitchDeg);
    this.lookTarget.position.set(_v.x + Math.sin(y), _v.y + Math.sin(p), _v.z + 1); // modelo olha para +Z
    this.lookTarget.updateMatrixWorld();
  }

  update(dt) { this.vrm.update(dt); } // expressões, lookAt, spring bones, constraints
  dispose() { VRMUtils.deepDispose(this.root); }
}
