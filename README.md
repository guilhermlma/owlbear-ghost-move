# 👻 Ghost Move (Movimento Furtivo)

Extensão minimalista para o **Owlbear Rodeo** que permite mover tokens pelo mapa sem exibir o contorno de seleção colorido nem a etiqueta com o nome do jogador.

---

## 🎯 O que ela faz?

No Owlbear Rodeo nativo, quando qualquer jogador clica e arrasta um token usando a ferramenta padrão de seleção (**Select**):
1. O token recebe um **contorno com a cor do jogador** (highlight).
2. Uma **etiqueta com o nome do jogador** aparece flutuando sobre o token para todos na sala.
3. Se você estiver mestrando ou controlando monstros/NPCs em emboscadas ou movimentos sutis, todos veem imediatamente quem está mexendo no token.

### Como o Ghost Move resolve isso:
O **Ghost Move** adiciona uma nova ferramenta na barra de ferramentas com um ícone de fantasma (👻):
- **Movimento sem Seleção:** Ao arrastar um token com o Ghost Move, o token **nunca entra na lista de seleção nativa do jogador**.
- **Sem Highlight nem Nome:** Como não há seleção nativa do Owlbear, o sistema **não desenha a caixa colorida nem o nome do jogador**.
- **Arrasto Suave e Alinhamento:** O token se move mantendo o ponto de pegada e se alinha à grade ao soltar.
- **Proteção do Mapa:** Itens bloqueados ou pertencentes à camada do mapa (`MAP`) não são movidos por engano.

---

## 🚀 Como testar localmente

### 1. Inicie o servidor local
No terminal, execute na raiz do projeto:
```bash
python serve.py
```
O servidor ficará rodando em `http://localhost:5173`.

### 2. Adicione no Owlbear Rodeo
1. Abra sua sala no [Owlbear Rodeo](https://owlbear.app).
2. Clique no ícone de **Extensões** (lado esquerdo inferior ou menu de perfil).
3. Clique em **+** (Add Extension).
4. Insira a URL do manifesto do Ghost Move:
   ```text
   http://localhost:5173/Ghost%20Move/manifest.json
   ```
5. Clique em **Install** e ative-a na sala.

### 3. Como validar o efeito "Fantasma"
1. Na barra de ferramentas lateral do Owlbear, clique no ícone do **Ghost Move (Fantasma)**.
2. Coloque um token no mapa e arraste-o usando a ferramenta.
3. **Para confirmar que outros jogadores não veem seu nome:**
   - Abra uma **janela anônima** no navegador.
   - Entre no link da mesma sala como um jogador convidado.
   - Na janela principal, arraste o token usando o **Ghost Move**.
   - Observe na janela anônima: o token se deslocará pelo mapa sem mostrar seu anel colorido e sem a etiqueta com seu nome!
