import axios from 'axios';

const BASE_URL = 'https://hacker-news.firebaseio.com/v0';

const http = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

/**
 * Livello di accesso alla rete: sa SOLO come parlare con Hacker News.
 * Non conosce paginazione, formattazione o DOM.
 */
export const hackerNewsApi = {
  /** Restituisce la lista di ~500 ID delle ultime notizie. */
  async fetchNewStoryIds() {
    const { data } = await http.get('/newstories.json');
    return Array.isArray(data) ? data : [];
  },

  /** Restituisce il dettaglio grezzo di una singola notizia (o null se rimossa). */
  async fetchItem(id) {
    const { data } = await http.get(`/item/${id}.json`);
    return data;
  },
};
