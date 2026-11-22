// Copia o runtime WASM do MediaPipe para public/ (roda antes do dev e do build; funciona no Windows e na Vercel).
import { cpSync, mkdirSync, copyFileSync } from 'node:fs';
mkdirSync('public/mediapipe/wasm', { recursive: true });
cpSync('node_modules/@mediapipe/tasks-vision/wasm', 'public/mediapipe/wasm', { recursive: true });
console.log('WASM do MediaPipe copiado para public/mediapipe/wasm');
copyFileSync('THIRD_PARTY_NOTICES.md', 'public/THIRD_PARTY_NOTICES.txt');
copyFileSync('NOTICE', 'public/NOTICE.txt');
