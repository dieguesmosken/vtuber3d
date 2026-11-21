# vtuber3d 🐺

**VTuber 3D aberto e gratuito, direto no navegador.** Carregue o seu personagem (`.vrm` ou `.glb`), deixe a webcam animar o rosto, a cabeça e as mãos, e use na sua live pelo OBS com fundo transparente.

> **Status: alfa.** Funciona, mas ainda está em desenvolvimento e passou por poucos testes. Issues e feedback são muito bem-vindos.

- Site: veja a página do projeto (implantada pela Vercel a partir deste repositório).
- App: `/app/`

## Recursos

- Rastreamento facial com [MediaPipe Face Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker): 52 blendshapes (padrão ARKit) e pose da cabeça.
- Suavização com filtro One Euro, calibração da posição neutra e modo câmera ou espelho.
- Rastreamento de **mãos e gestos** (paz, joinha, punho, mão aberta) que disparam expressões.
- Carrega **VRM** (0.x e 1.0, com expressões, olhar e spring bones via [@pixiv/three-vrm](https://github.com/pixiv/three-vrm)) e **GLB** com morph targets.
- **Traga o seu modelo:** escolha ou arraste o arquivo. O último modelo fica salvo no navegador (IndexedDB), útil para a Browser Source do OBS.
- Saída para OBS: fundo transparente (`?mode=obs`) ou verde para chroma key.
- Privado: o vídeo da webcam e o seu modelo **não são enviados a nenhum servidor**.
- Dois personagens embutidos para testar sem nenhum arquivo: o **Teyo (demo)**, um lobo cartoon simples com heterocromia, e um **crânio em wireframe** para validar sinais e lados.

## Usar agora (sem instalar)

1. Abra o app no **Chrome ou Edge** e permita a webcam.
2. Escolha ou arraste o seu `.vrm` / `.glb`.
3. Fique de frente para a câmera, com o rosto relaxado, e toque em **Calibrar**.
4. Teste os lados: feche só o seu **olho esquerdo**. O olho esquerdo do personagem (que aparece à direita da tela) deve fechar. Se estiver invertido, ative **Espelho**.

### Controles

| Botão / tecla | O que faz |
|---|---|
| Calibrar (`C`) | Grava a pose e a expressão neutras do rosto atual |
| Espelho (`M`) | Troca esquerda/direita (modo espelho) |
| Fundo (`G`) | Alterna entre transparente e verde (`#00ff00`) |
| Teyo (`T`) | Carrega o personagem de demonstração e esquece o modelo salvo |
| Crânio (`K`) | Carrega o crânio de teste e esquece o modelo salvo |
| Mãos (`H`) | Liga/desliga o rastreamento das mãos |
| Roda do mouse / pinça | Zoom do enquadramento |

### Parâmetros de URL

| Parâmetro | Exemplo | Efeito |
|---|---|---|
| `mode=obs` | `/app/?mode=obs` | Esconde painel e botões (para o OBS) |
| `bg` | `?bg=00ff00` ou `?bg=transparent` | Cor de fundo |
| `model` | `?model=https://exemplo.com/avatar.vrm` | Carrega um modelo por URL (precisa permitir CORS). Também aceita `teyo` e `skull` |

## Usar no OBS

Resumo (detalhes em [docs/OBS.md](docs/OBS.md)):

1. Adicione uma **Fonte de Navegador** com `https://SEU-SITE/app/?mode=obs` (ou `http://localhost:5173/app/?mode=obs` rodando local).
2. Para a página acessar a webcam, o OBS pode precisar ser iniciado com `--enable-media-stream`. Isso vem de relatos de usuários em fóruns e issues, não de documentação oficial atual: teste na sua versão.
3. Não adicione a mesma webcam como fonte no OBS ao mesmo tempo: no Windows a câmera costuma ficar exclusiva de um processo.
4. Alternativa: abra o app no Chrome, use o fundo verde (`G`) e capture a janela com Chroma Key.

## Preparar o seu personagem

O formato mais simples é o **VRM**. Veja o guia completo em [docs/MODELOS.md](docs/MODELOS.md): nomes de expressões (ARKit ou presets VRM), orçamento de polígonos, ossos, convenção de esquerda e direita e ferramentas gratuitas (VRoid Studio, Blender + VRM Add-on).

## Rodar localmente

Requisitos: [Node.js](https://nodejs.org) LTS.

```bash
git clone https://github.com/dieguesmosken/vtuber3d.git
cd vtuber3d
npm install
npm run dev
```

Abra `http://localhost:5173/` (site) e `http://localhost:5173/app/` (app). O `localhost` conta como contexto seguro, então a webcam funciona.

Build de produção: `npm run build` (gera `dist/`).

## Estrutura

```text
index.html            site do projeto
app/index.html        o app
src/
  main.js             orquestração
  tracking/           MediaPipe (rosto, mãos), filtro One Euro, pose da cabeça
  avatar/             adaptadores VRM e GLB, Teyo (demo) e crânio de teste; mãos em 3D; mapeamento
  render/scene.js     cena three.js, câmera de busto, zoom
  storage/            persistência do modelo (IndexedDB)
  config/defaults.js  ajustes (sinais da cabeça, filtros, gestos, enquadramento)
docs/                 guias (modelos, OBS)
```

## Ajustes comuns

Em `src/config/defaults.js`:

- `matrixTranspose`: se yaw e pitch parecerem trocados.
- `headSign`: inverte o sentido de cada eixo da cabeça.
- `handsEvery: 2`: processa as mãos em metade dos quadros (menos CPU/GPU).
- `gestureExpressions`: o que cada gesto faz.

## Limitações conhecidas

- O MediaPipe mede rostos humanos. Em personagens não humanos (focinho, bico) as expressões dependem de como o seu modelo traduz os blendshapes.
- A ordem do array da matriz de pose da cabeça não é confirmada na documentação oficial: use `matrixTranspose` se necessário.
- A Browser Source do OBS pode exigir flags para acessar a webcam; ver acima.
- Os limites dos gestos são empíricos e podem precisar de ajuste por pessoa e iluminação.
- Atalhos de teclado só funcionam com a página em foco (planejado: controle remoto por WebSocket).

## Roadmap

- [ ] Atalhos globais e controle remoto (WebSocket / Stream Deck / Twitch)
- [ ] Expressões fixas (feliz, bravo, surpreso, dormindo) e acessórios por atalho
- [ ] Lip sync por áudio do microfone como reforço
- [ ] Perfis de calibração exportáveis (JSON)
- [ ] Braços e dedos do modelo VRM controlados pelas mãos
- [ ] Toon shader com contorno configurável
- [ ] Controles de interface e persistência de ajustes

## Tecnologias e licenças

| Componente | Uso | Licença |
|---|---|---|
| [MediaPipe Tasks Vision](https://www.npmjs.com/package/@mediapipe/tasks-vision) | Rastreamento de rosto e mãos | Apache-2.0 |
| [three.js](https://threejs.org) | Renderização 3D | MIT |
| [@pixiv/three-vrm](https://github.com/pixiv/three-vrm) | Carregar e animar VRM | MIT |
| [Vite](https://vite.dev) | Build | MIT |

Os arquivos de modelo do MediaPipe (`face_landmarker.task`, `hand_landmarker.task`) são baixados dos servidores do Google em tempo de execução, e têm termos próprios no model card de cada um.

O código deste repositório é licenciado sob a [MIT](LICENSE). **Os modelos 3D que você carregar continuam sendo seus (ou de seus autores)**: respeite a licença de cada modelo.

**Sobre o Teyo:** o Teyo é um personagem original de [dieguesmosken](https://github.com/dieguesmosken). O código do Teyo (demo) está sob a licença MIT, mas o design do personagem em si (nome, aparência e identidade) não é liberado para uso por terceiros.

## Contribuir

Issues e pull requests são bem-vindos. Veja [CONTRIBUTING.md](CONTRIBUTING.md).

---

## English (short)

**vtuber3d** is a free, open-source, browser-based 3D VTuber. Load your own `.vrm` / `.glb` avatar, let your webcam drive face, head and hands (MediaPipe + three.js + three-vrm), and capture it in OBS with a transparent background. Video and model never leave your machine. Alpha stage; MIT licensed. Run locally with `npm install && npm run dev`, then open `/app/`.
