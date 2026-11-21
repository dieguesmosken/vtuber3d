// Troca *Left <-> *Right (modo espelho). Só mexe nos nomes; a textura dos olhos nunca é tocada.
export function mirrorBlend(b) {
  const o = {};
  for (const [k, v] of Object.entries(b)) {
    const k2 = k.endsWith('Left') ? k.slice(0, -4) + 'Right'
      : k.endsWith('Right') ? k.slice(0, -5) + 'Left' : k;
    o[k2] = v;
  }
  return o;
}

// Fallback para modelos que só têm presets VRM 1.0 (ex.: VRM de teste do VRoid).
export function arkitToVrmPresets(b) {
  const g = (k) => b[k] ?? 0;
  return {
    blinkLeft: g('eyeBlinkLeft'),
    blinkRight: g('eyeBlinkRight'),
    aa: g('jawOpen'),
    ou: Math.max(g('mouthPucker'), g('mouthFunnel')),
    happy: (g('mouthSmileLeft') + g('mouthSmileRight')) / 2,
    angry: (g('browDownLeft') + g('browDownRight')) / 2,
    surprised: Math.max(0, g('browInnerUp') - 0.3) / 0.7,
  };
}

export function gazeFromBlend(b) {
  const g = (k) => b[k] ?? 0;
  const yaw = ((g('eyeLookOutLeft') + g('eyeLookInRight')) - (g('eyeLookInLeft') + g('eyeLookOutRight'))) / 2;
  const pitch = ((g('eyeLookUpLeft') + g('eyeLookUpRight')) - (g('eyeLookDownLeft') + g('eyeLookDownRight'))) / 2;
  return { yaw, pitch }; // -1..1 aproximado
}
