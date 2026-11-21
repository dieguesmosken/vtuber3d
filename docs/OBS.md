# Usar o vtuber3d no OBS

## Modo A (recomendado): Fonte de Navegador

Dá **transparência real**, sem chroma key.

1. No OBS: **Fontes → + → Navegador**.
2. URL: `https://SEU-SITE/app/?mode=obs` (ou `http://localhost:5173/app/?mode=obs` rodando local).
3. Largura e altura iguais à área que o personagem ocupa (ex.: 1080×1080 para busto).
4. Deixe ligada a opção **Habilitar aceleração por hardware da fonte de navegador** (mantém o WebGL na GPU).
5. Não adicione a webcam real como fonte ao mesmo tempo: no Windows ela costuma ser exclusiva de um processo, e a página pode receber `NotReadableError`.

### Acesso à webcam na Browser Source

Para uma página dentro do OBS pedir a câmera, relatos de usuários (fóruns e issues do OBS, versões 26 e 27) indicam que o OBS precisa ser iniciado com a flag `--enable-media-stream`, às vezes junto com `--use-fake-ui-for-media-stream`. **Não há documentação oficial disso para as versões atuais do OBS: teste na sua versão.**

Crie um atalho do Windows com este destino:

```text
"C:\Program Files\obs-studio\bin\64bit\obs64.exe" --enable-media-stream --use-fake-ui-for-media-stream
```

> `--use-fake-ui-for-media-stream` **aceita automaticamente** os pedidos de câmera e microfone de *todas* as Browser Sources. Use só se você controla as páginas carregadas no OBS, ou tente primeiro apenas `--enable-media-stream`.

A página precisa ser servida por **HTTPS** (o site publicado) ou por **localhost**. `file://` não funciona para a câmera.

### Escolher o modelo na Browser Source

O app lembra o último modelo carregado **neste navegador** (IndexedDB). Para escolher o modelo dentro do OBS:

1. Clique com o botão direito na fonte → **Interagir**.
2. Remova `?mode=obs` temporariamente para ver os botões, carregue o `.vrm`, e volte para `?mode=obs`.

Também é possível usar `?model=URL` com um arquivo hospedado em um endereço que permita CORS.

## Modo B (fallback): captura de janela + Chroma Key

1. Abra o app no Chrome, aperte **G** (fundo verde).
2. No OBS: **Captura de Janela** do Chrome + filtro **Chroma Key**.

Ressalvas:

- A captura de janela **não preserva transparência**.
- O Chrome desacelera `requestAnimationFrame` em janelas minimizadas ou ocultas, o que congela o avatar. Deixe a janela visível.
- Escolha uma cor de chroma que não apareça no personagem (cuidado com olhos e detalhes verdes).

## Atalhos

Hoje, os atalhos (`C`, `M`, `G`, `T`, `K`, `H`) só funcionam com a página em foco. Para trocar expressões durante o jogo, o plano é um controle remoto por WebSocket (ver Roadmap no README).

## Desempenho

- Webcam em 640×480 e 30 fps.
- `handsEvery: 2` em `src/config/defaults.js` reduz o custo das mãos.
- Use o tamanho exato da Browser Source necessário.
