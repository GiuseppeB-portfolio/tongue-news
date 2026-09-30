import { hackerNewsApi } from './api/hackerNewsApi.js';
import { createNewsRepository } from './repositories/newsRepository.js';
import { appendNews, setStatus } from './ui/newsList.js';

const PAGE_SIZE = 10;

const listElement = document.querySelector('#news-list');
const statusElement = document.querySelector('#status');
const loadMoreButton = document.querySelector('#load-more');

const repository = createNewsRepository({ api: hackerNewsApi, pageSize: PAGE_SIZE });

let isLoading = false;

async function loadNews() {
  if (isLoading) return;
  isLoading = true;
  loadMoreButton.disabled = true;
  setStatus(statusElement, 'Caricamento in corso…');

  try {
    const { news, hasMore } = await repository.loadNextPage();
    appendNews(listElement, news);
    setStatus(statusElement, '');
    loadMoreButton.hidden = !hasMore;
    if (!hasMore) setStatus(statusElement, 'Hai letto tutte le notizie disponibili.');
  } catch {
    setStatus(statusElement, 'Impossibile caricare le notizie. Controlla la connessione e riprova.', {
      isError: true,
    });
    loadMoreButton.hidden = false;
  } finally {
    isLoading = false;
    loadMoreButton.disabled = false;
  }
}

loadMoreButton.addEventListener('click', loadNews);
loadNews();
