import { getPageSlice, normalizeItem } from '../utils/newsMapper.js';

/**
 * Pattern: Repository con dependency injection.
 *
 * Il repository è l'unico punto che conosce il flusso "lista ID -> dettaglio
 * per ogni ID" e lo stato della paginazione. La UI chiede solo "dammi la
 * prossima pagina"; l'API è iniettata, quindi nei test si sostituisce con
 * un finto oggetto senza toccare la rete.
 *
 * @param {object} options
 * @param {{fetchNewStoryIds: Function, fetchItem: Function}} options.api
 * @param {number} [options.pageSize=10]
 */
export function createNewsRepository({ api, pageSize = 10 }) {
  let ids = null; // null = lista non ancora scaricata
  let cursor = 0; // posizione del prossimo ID da caricare

  async function ensureIds() {
    // Se la chiamata fallisce, ids resta null e al prossimo tentativo si riprova.
    if (ids === null) {
      ids = await api.fetchNewStoryIds();
    }
  }

  return {
    /**
     * Carica la pagina successiva di notizie.
     * @returns {Promise<{news: object[], hasMore: boolean}>}
     */
    async loadNextPage() {
      await ensureIds();

      const pageIds = getPageSlice(ids, cursor, pageSize);

      // allSettled: se il dettaglio di una notizia fallisce, le altre si vedono comunque.
      const results = await Promise.allSettled(pageIds.map((id) => api.fetchItem(id)));

      // Il cursore avanza solo dopo che la pagina è stata elaborata.
      cursor += pageIds.length;

      const news = results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => normalizeItem(result.value))
        .filter(Boolean);

      return { news, hasMore: cursor < ids.length };
    },
  };
}
