# vtuber3d — instruções para o Claude

Projeto aberto de VTuber 3D no navegador (MediaPipe + three.js + three-vrm). Responda em **português do Brasil**.

## Comandos
- `npm install` · `npm run dev` (site em `/`, app em `/app/`) · `npm run build` (rode antes de commitar)
- O `predev`/`prebuild` copia o WASM do MediaPipe para `public/mediapipe/` (ignorado pelo git).

## Estrutura
- `index.html` site · `app/index.html` app · `src/` código · `docs/` guias
- Avatares seguem a interface: `root`, `hasArkit`, `setHead`, `setExpressions`, `setGaze`, `update`, `dispose`
  (`vrmAdapter`, `glbAdapter`, `teyoAvatar`, `debugSkull`).

## Regras
- Tudo roda no navegador; **nunca** enviar vídeo ou modelos a servidores.
- Só dependências gratuitas e com licença permissiva (MIT, Apache-2.0, BSD). Informe a licença.
- **Não invente APIs** (MediaPipe, three.js, three-vrm): confira a documentação oficial ou os tipos instalados em `node_modules`.
- Esquerda/direita: o MediaPipe usa o lado do **sujeito**. `eyeBlinkLeft` fecha o olho **esquerdo do personagem** (+X, à direita da tela).
  No Teyo, o olho à esquerda da tela é âmbar e o da direita é verde. Nunca espelhar texturas por engano.
- Ajustes de rastreamento (sinais, filtros, gestos, enquadramento) ficam em `src/config/defaults.js`.
- Sem modelos 3D de terceiros sem licença de redistribuição. O design do Teyo é do autor (ver README).
- Diga claramente o que foi testado e o que não foi (câmera, OBS e gestos dependem de teste manual).
