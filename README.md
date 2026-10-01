# Catálogo Interdimensional — Rick and Morty

Projeto acadêmico "API Hunters": consome a [Rick and Morty API](https://rickandmortyapi.com)
e exibe os personagens em cards, com busca por nome, filtro por status e paginação.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (por padrão `http://localhost:5173`).

## Build de produção

```bash
npm run build
npm run preview
```

## Estrutura

- `index.html` — marcação da página e dos estados (carregando/erro/vazio)
- `src/main.js` — busca assíncrona na API, renderização dos cards, busca e filtros
- `src/style.css` — identidade visual (catálogo científico interdimensional)
