# Preparando o seu modelo

O app carrega **VRM** (0.x e 1.0) e **GLB**. O caminho mais simples é o VRM, porque o three-vrm já cuida de expressões, olhar, spring bones e ossos normalizados.

## O jeito mais rápido

1. Crie um avatar no [VRoid Studio](https://vroid.com/en/studio) (gratuito) e exporte como VRM.
2. Abra o app e arraste o arquivo.

Esse modelo usa os **presets do VRM** (piscar, `aa`, `happy`…). O app converte os blendshapes do rosto para esses presets automaticamente.

## Personagem próprio (Blender)

Fluxo geral, em ordem:

1. **Limpeza:** aplique as transformações, escala em metros, personagem de frente para **−Y** (vista Frontal do Blender), em T-pose ou A-pose.
2. **Retopologia:** modelos gerados por IA costumam ser densos e sem loops de aresta. Para animar rosto, são necessários loops em volta dos olhos e da boca. Ferramentas gratuitas: QuadriFlow e Remesh (nativos do Blender), [Instant Meshes](https://github.com/wjakob/instant-meshes) e retopologia manual (Poly Build + Snap to Face) na cabeça.
3. **UV e textura:** desdobre de novo e faça o bake da textura do modelo denso para o leve. **Atenção:** se os dois olhos compartilharem a mesma ilha de UV (por espelhamento), cores diferentes por olho (heterocromia) não funcionam. Use materiais separados.
4. **Rig:** armature simples com os ossos humanoides do VRM. Para VRM 1.0, os 15 ossos obrigatórios são: hips, spine, head e, dos dois lados, upperArm, lowerArm, hand, upperLeg, lowerLeg, foot. Neck, chest, olhos e jaw são opcionais, mas recomendados.
5. **Shape keys:** veja os nomes abaixo.
6. **Exportar:** com o [VRM Add-on for Blender](https://github.com/saturday06/VRM-Addon-for-Blender) (MIT ou GPL-3.0). Configure Humanoid, Expressions, LookAt, Spring Bone e MToon.

### Orçamento de polígonos

| Enquadramento | Triângulos |
|---|---|
| Busto | cerca de 20 mil |
| Corpo inteiro | 20 a 40 mil |

Concentre a densidade nos olhos, na boca e nas orelhas. Uma textura 2048² costuma bastar.

## Expressões

O app aceita dois conjuntos de nomes, e usa o que o modelo tiver.

**Nomes ARKit (recomendado para qualidade).** Se o seu VRM tiver expressões personalizadas (custom expressions) com estes nomes, ou o GLB tiver morph targets com eles, o app as aciona diretamente:

`eyeBlinkLeft`, `eyeBlinkRight`, `jawOpen`, `mouthSmileLeft`, `mouthSmileRight`, `mouthFrownLeft`, `mouthFrownRight`, `mouthFunnel`, `mouthPucker`, `browInnerUp`, `browDownLeft`, `browDownRight`

Esse é um conjunto mínimo viável. Os 52 nomes ARKit completos também funcionam se existirem no modelo.

**Presets VRM (fallback automático).** Sem expressões ARKit, o app usa: `blinkLeft`, `blinkRight`, `aa` (a partir de `jawOpen`), `ou` (a partir de pucker/funnel), `happy`, `angry` e `surprised`.

> A especificação do VRM 1.0 deixa todos os presets opcionais e permite expressões custom (que não podem repetir nomes de preset). Por isso personagens não humanos funcionam, desde que tenham as expressões.

### Dica: jawOpen sem esculpir à mão

Pose o osso da mandíbula aberto, e no modificador Armature use **Apply as Shape Key** (ou Save as Shape Key). Renomeie para `jawOpen`. Expressões do VRM não acionam ossos, então a abertura da boca precisa existir como shape key.

## Esquerda e direita (importante)

- `eyeBlinkLeft` fecha o olho **esquerdo do personagem**, que aparece à **direita** da tela quando ele olha para a câmera.
- No Blender, o sufixo `.L` fica no lado **+X**, que é o lado esquerdo do personagem.
- O MediaPipe indica o lado do **sujeito**, não do espectador. Por isso, no modo padrão (câmera), o seu olho esquerdo fecha o olho esquerdo do personagem.

**Teste de aceitação:** feche só o seu olho esquerdo. O olho que fecha no personagem deve ser o dele esquerdo (à direita da tela). Se estiver invertido, use o botão **Espelho**.

## Física (orelhas, cauda, cabelo)

No VRM, configure **Spring Bones** com colliders na cabeça, no peito e nos quadris para a cauda não atravessar o corpo. Eles rodam automaticamente.

## Olhar

Configure **LookAt** do tipo osso (olhos como ossos) ou do tipo expressão. O app define o alvo a partir dos blendshapes `eyeLook*`.

## Licença do modelo

Preencha os metadados do VRM (autor, permissões de uso). Se você carregar um modelo de outra pessoa, respeite a licença dele.

## Checklist rápido

- [ ] Modelo abre sem erro no app
- [ ] Cabeça acompanha sem tremer, depois de **Calibrar**
- [ ] Olho esquerdo seu = olho esquerdo do personagem (à direita da tela)
- [ ] Boca abre com `jawOpen` (ou `aa`)
- [ ] Orelhas, cauda e cabelo balançam (spring bones)
