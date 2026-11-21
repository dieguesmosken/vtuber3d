// Copia o runtime WASM do MediaPipe para public/ (roda antes do dev e do build; funciona no Windows e na Vercel).
import { cpSync, mkdirSync } from 'node:fs';
mkdirSync('public/mediapipe/wasm', { recursive: true });
cpSync('node_modules/@mediapipe/tasks-vision/wasm', 'public/mediapipe/wasm', { recursive: true });
console.log('WASM do MediaPipe copiado para public/mediapipe/wasm');
