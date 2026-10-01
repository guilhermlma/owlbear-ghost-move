# 👻 Ghost Move

**Extensão para [Owlbear Rodeo](https://owlbear.app)** — move tokens pelo mapa sem exibir o contorno colorido de seleção nem a etiqueta com o nome do jogador.

---

## 🎯 O que faz?

No Owlbear Rodeo nativo, quando você arrasta um token com a ferramenta **Select**:
- O token recebe um **contorno com a cor do jogador** visível para todos.
- Um **label com o nome do jogador** flutua sobre o token.

O **Ghost Move** adiciona uma ferramenta com ícone 👻 na barra lateral que:
- Arrasta o token **sem entrar na seleção nativa** → sem contorno, sem nome.
- Mantém o ponto de pegada e **encaixa na grade** ao soltar.
- Não move itens bloqueados nem itens da camada `MAP`.

---

## 🚀 Como instalar (via GitHub Pages)

A extensão é servida diretamente pelo GitHub Pages. URL do manifesto:

```
https://guilhermlma.github.io/owlbear-ghost-move/manifest.json
```

1. Abra sua sala no [Owlbear Rodeo](https://owlbear.app).
2. Clique em **Configurações → Extensões → Adicionar**.
3. Cole a URL acima e clique em **Instalar**.

> **Para ativar o GitHub Pages:** vá em `Settings → Pages → Source → Deploy from branch → main / (root)`.

---

## 🛠️ Testar localmente

```bash
# Qualquer servidor HTTP serve — exemplo com Python:
python -m http.server 5173
```

Depois adicione no OBR:
```
http://localhost:5173/manifest.json
```

---

## 📁 Estrutura

```
ghost-move/
├── manifest.json       # Configuração da extensão
├── background.html     # Ponto de entrada (iframe background)
├── icon.svg            # Ícone fantasma
└── src/
    ├── background.js   # Lógica principal (tool + mode)
    └── obr-sdk.js      # SDK bundlado do Owlbear Rodeo
```

---

## 📝 Licença

MIT — use, modifique e distribua à vontade.
