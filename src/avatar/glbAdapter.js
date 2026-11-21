// GLB com morph targets ARKit e ossos nomeados (sem spring bones)
import * as THREE from 'three';

export class GlbAdapter {
  constructor(gltf, cfg) {
    this.root = gltf.scene; this.cfg = cfg; this.hasArkit = true;
    this.meshes = [];
    this.root.traverse((o) => { if (o.isMesh && o.morphTargetDictionary) this.meshes.push(o); });
    this.head = this.root.getObjectByName(cfg.glbBones.head);
    this.neck = this.root.getObjectByName(cfg.glbBones.neck);
    this.rest = new Map([this.head, this.neck].filter(Boolean).map((b) => [b, b.quaternion.clone()]));
    this._q = new THREE.Quaternion(); this._e = new THREE.Euler();
  }
  setHead({ yaw, pitch, roll }) {
    // Rotação local relativa à pose de descanso. Os eixos dependem do "roll" dos ossos no Blender —
    // é exatamente o problema que os ossos normalizados do VRM resolvem.
    for (const [bone, k] of [[this.neck, 0.4], [this.head, 0.6]]) {
      if (!bone) continue;
      this._e.set(pitch * k, yaw * k, roll * k, 'YXZ');
      bone.quaternion.copy(this.rest.get(bone)).multiply(this._q.setFromEuler(this._e));
    }
  }
  setExpressions(map) {
    for (const m of this.meshes) {
      for (const [name, v] of Object.entries(map)) {
        const i = m.morphTargetDictionary[name];
        if (i !== undefined) m.morphTargetInfluences[i] = v;
      }
    }
  }
  setGaze() {}
  update() {}
  dispose() {}
}
