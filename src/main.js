import './style.css';

// ============================================================
// Catálogo Interdimensional — consome a Rick and Morty API
// ============================================================

const API_BASE = 'https://rickandmortyapi.com/api/character';

const state = {
  name: '',
  status: '',
  page: 1,
};

// Elementos da UI
const searchInput = document.getElementById('search-input');
const chips = Array.from(document.querySelectorAll('.chip'));
const resultCount = document.getElementById('result-count');

const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const emptyState = document.getElementById('empty-state');
const retryBtn = document.getElementById('retry-btn');

const cardGrid = document.getElementById('card-grid');
const cardTemplate = document.getElementById('card-template');

const pagination = document.getElementById('pagination');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageIndicator = document.getElementById('page-indicator');

const STATUS_LABELS = { alive: 'Vivo', dead: 'Morto', unknown: 'Desconhecido' };

let debounceTimer = null;
let currentRequestId = 0;

function setState(view) {
  loadingState.hidden = view !== 'loading';
  errorState.hidden = view !== 'error';
  emptyState.hidden = view !== 'empty';
  cardGrid.hidden = view !== 'success';
  pagination.hidden = view !== 'success';
}

function buildUrl() {
  const params = new URLSearchParams();
  params.set('page', String(state.page));
  if (state.name) params.set('name', state.name);
  if (state.status) params.set('status', state.status);
  return `${API_BASE}?${params.toString()}`;
}

async function loadCharacters() {
  const requestId = ++currentRequestId;
  setState('loading');
  resultCount.textContent = '';

  try {
    const response = await fetch(buildUrl());

    // A API retorna 404 quando nenhum personagem casa com o filtro.
    if (response.status === 404) {
      if (requestId !== currentRequestId) return;
      renderCards([]);
      pagination.hidden = true;
      setState('empty');
      return;
    }

    if (!response.ok) {
      throw new Error(`A API respondeu com status ${response.status}.`);
    }

    const data = await response.json();
    if (requestId !== currentRequestId) return; // resposta obsoleta, ignore

    renderCards(data.results);
    updatePagination(data.info);
    resultCount.textContent = `${data.info.count} espécime(s) catalogado(s)`;
    setState('success');
  } catch (err) {
    if (requestId !== currentRequestId) return;
    errorMessage.textContent = navigator.onLine
      ? 'O sinal entre dimensões falhou. O servidor pode estar instável.'
      : 'Sem conexão com a internet — verifique sua rede e tente de novo.';
    setState('error');
  }
}

function renderCards(characters) {
  cardGrid.innerHTML = '';
  const fragment = document.createDocumentFragment();

  characters.forEach((character) => {
    const node = cardTemplate.content.cloneNode(true);

    const img = node.querySelector('.card-img');
    img.src = character.image;
    img.alt = character.name;

    const statusText = STATUS_LABELS[character.status] || character.status;
    node.querySelector('.card-status-text').textContent = statusText;
    node.querySelector('.card-status .dot').classList.add(
      character.status === 'alive' ? 'dot-alive' :
      character.status === 'dead' ? 'dot-dead' : 'dot-unknown'
    );

    node.querySelector('.card-name').textContent = character.name;
    node.querySelector('.card-species').textContent = character.species || '—';
    node.querySelector('.card-origin').textContent = character.origin?.name || 'Desconhecida';
    node.querySelector('.card-location').textContent = character.location?.name || 'Desconhecida';

    fragment.appendChild(node);
  });

  cardGrid.appendChild(fragment);
}

function updatePagination(info) {
  pageIndicator.textContent = `Página ${state.page}`;
  prevPageBtn.disabled = !info.prev;
  nextPageBtn.disabled = !info.next;
}

// ------------------------------------------------------------
// Interação: busca (com debounce) e filtros de status
// ------------------------------------------------------------

searchInput.addEventListener('input', (event) => {
  clearTimeout(debounceTimer);
  const value = event.target.value.trim();
  debounceTimer = setTimeout(() => {
    state.name = value;
    state.page = 1;
    loadCharacters();
  }, 400);
});

chips.forEach((chip) => {
  chip.addEventListener('click', () => {
    chips.forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    state.status = chip.dataset.status;
    state.page = 1;
    loadCharacters();
  });
});

prevPageBtn.addEventListener('click', () => {
  if (state.page > 1) {
    state.page -= 1;
    loadCharacters();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

nextPageBtn.addEventListener('click', () => {
  state.page += 1;
  loadCharacters();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

retryBtn.addEventListener('click', loadCharacters);

// Carga inicial
loadCharacters();
