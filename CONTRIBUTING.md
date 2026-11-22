# Contribuindo com o vtuber3d

Obrigado pelo interesse! O projeto é aberto e está em fase alfa, então toda ajuda conta.

## Formas de ajudar

- **Testar** com o seu modelo e a sua webcam, e abrir uma issue com o resultado (navegador, sistema, modelo e o que aconteceu).
- **Relatar bugs** com passos para reproduzir e, se possível, um modelo de teste que possa ser compartilhado.
- **Melhorar a documentação** (`docs/` e README), em português ou inglês.
- **Enviar código** para itens do Roadmap do README.

## Rodando localmente

```bash
npm install
npm run dev     # http://localhost:5173/ (site) e /app/ (app)
npm run build   # confere se compila
```

## Diretrizes

- Mantenha o app **100% no navegador e sem envio de dados**: nada de enviar vídeo ou modelos para servidores.
- Só adicione dependências gratuitas e com licença compatível (MIT, Apache-2.0, BSD…). Informe a licença no pull request.
- Não invente APIs: ao usar MediaPipe, three.js ou three-vrm, confira a documentação oficial.
- Mudanças de comportamento do rastreamento (sinais, filtros) devem ser configuráveis em `src/config/defaults.js`.
- Não inclua modelos 3D de terceiros sem licença que permita redistribuição.

## Pull requests

1. Faça um fork e crie uma branch.
2. Rode `npm run build` antes de enviar.
3. Descreva o que mudou e como testou.

Ao contribuir, você concorda que o seu código seja licenciado sob a [Apache License 2.0](LICENSE) (seção 5 da licença). Não envie código copiado de projetos sem licença ou com licença incompatível.
