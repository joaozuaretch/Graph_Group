# Graph Group

Site do nosso grupo de estudos sobre **Teoria dos Grafos**.

Site estático (HTML + CSS + JS puro), sem etapa de build — pronto para o GitHub Pages.

## Estrutura

```
index.html           → Página inicial
participantes.html   → Membros do grupo
conteudos.html       → Tópicos (Scheinerman) e referências
reunioes.html        → Registro das reuniões
assets/css/style.css → Estilos (tema escuro)
assets/js/main.js    → Animação de grafo na homepage
```

## Publicando no GitHub Pages

1. No GitHub, vá em **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**.
3. Selecione a branch (ex.: `main`) e a pasta `/ (root)` e salve.
4. Em alguns minutos o site estará em `https://<usuario>.github.io/<repositorio>/`.

## Editando

- **Participantes:** em `participantes.html`, copie um bloco `<div class="card member">` e altere nome, iniciais, papel e links.
- **Reuniões:** em `reunioes.html`, copie um bloco `<div class="card topic">` para cada nova reunião.
- **Conteúdos:** em `conteudos.html`, cada tópico é um `<div class="card topic">`. Use a classe `done` ou `current` na tag de status.
- **Cores:** ajuste as variáveis no topo de `assets/css/style.css`.

Para testar localmente: `python3 -m http.server` e abra `http://localhost:8000`.
