export const DEFAULTS = {
  mirror: false,                           // false = "como câmera" (padrão escolhido)
  matrixTranspose: false,                  // se yaw/pitch parecerem trocados, teste true
  headSign: { yaw: 1, pitch: 1, roll: 1 }, // ajuste empírico (±1)
  headWeights: { spine: 0.1, neck: 0.35, head: 0.55 },
  headFilter: { minCutoff: 1.0, beta: 0.3, dCutoff: 1.0 },   // radianos
  blendFilter: { minCutoff: 3.0, beta: 1.0, dCutoff: 1.0 },
  gazeRangeDeg: { yaw: 25, pitch: 15 },
  background: 'transparent',               // ou '#00ff00' para chroma key
  // Enquadramento de busto (cabeça até o peito). Ajuste com a roda do mouse.
  camera: { fov: 30, distance: 1.7, targetY: 1.3 },
  hands: true,                              // rastreamento de mãos (botão H)
  handsEvery: 1,                            // processa mãos a cada N quadros (2 = metade do custo)
  // Gestos -> expressões (valores ARKit somados por cima do rosto)
  gestureExpressions: {
    peace: { mouthSmileLeft: 0.8, mouthSmileRight: 0.8 },
    thumbs_up: { mouthSmileLeft: 0.6, mouthSmileRight: 0.6, browInnerUp: 0.3 },
    fist: { browDownLeft: 0.8, browDownRight: 0.8 },
    open: { browInnerUp: 0.7, jawOpen: 0.35 },
  },
  glbBones: { head: 'head', neck: 'neck' }, // só para GLB puro
};
