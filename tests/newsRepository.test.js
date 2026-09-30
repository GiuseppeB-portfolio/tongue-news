import { describe, it, expect, vi } from 'vitest';
import { createNewsRepository } from '../js/repositories/newsRepository.js';

// Costruisce un finto API: ogni ID produce una notizia valida.
function makeFakeApi(idCount) {
  const ids = Array.from({ length: idCount }, (_, i) => 1000 + i);
  return {
    fetchNewStoryIds: vi.fn().mockResolvedValue(ids),
    fetchItem: vi.fn(async (id) => ({
      id,
      title: `News ${id}`,
      url: `https://example.com/${id}`,
      time: 1627500000,
    })),
  };
}

describe('createNewsRepository', () => {
  it('carica solo le prime 10 notizie al primo avvio', async () => {
    const api = makeFakeApi(25);
    const repo = createNewsRepository({ api, pageSize: 10 });

    const { news, hasMore } = await repo.loadNextPage();

    expect(news).toHaveLength(10);
    expect(news[0].id).toBe(1000);
    expect(news[9].id).toBe(1009);
    expect(hasMore).toBe(true);
    expect(api.fetchItem).toHaveBeenCalledTimes(10);
  });

  it('al "Load more" recupera i 10 ID successivi', async () => {
    const api = makeFakeApi(25);
    const repo = createNewsRepository({ api, pageSize: 10 });

    await repo.loadNextPage();
    const { news } = await repo.loadNextPage();

    expect(news.map((n) => n.id)).toEqual(
      Array.from({ length: 10 }, (_, i) => 1010 + i),
    );
  });

  it('scarica la lista degli ID una sola volta', async () => {
    const api = makeFakeApi(25);
    const repo = createNewsRepository({ api, pageSize: 10 });

    await repo.loadNextPage();
    await repo.loadNextPage();

    expect(api.fetchNewStoryIds).toHaveBeenCalledTimes(1);
  });

  it('segnala hasMore = false all\'ultima pagina', async () => {
    const api = makeFakeApi(15);
    const repo = createNewsRepository({ api, pageSize: 10 });

    await repo.loadNextPage();
    const { news, hasMore } = await repo.loadNextPage();

    expect(news).toHaveLength(5);
    expect(hasMore).toBe(false);
  });

  it('ignora le notizie rimosse (null) e quelle fallite, senza bloccare le altre', async () => {
    const api = makeFakeApi(3);
    api.fetchItem = vi.fn(async (id) => {
      if (id === 1000) return null;
      if (id === 1001) throw new Error('errore di rete');
      return { id, title: 'Valida', url: 'https://example.com', time: 1627500000 };
    });
    const repo = createNewsRepository({ api, pageSize: 10 });

    const { news } = await repo.loadNextPage();

    expect(news).toHaveLength(1);
    expect(news[0].id).toBe(1002);
  });

  it('riprova a scaricare la lista ID se la prima chiamata fallisce', async () => {
    const api = makeFakeApi(5);
    api.fetchNewStoryIds
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([1, 2, 3]);
    const repo = createNewsRepository({ api, pageSize: 10 });

    await expect(repo.loadNextPage()).rejects.toThrow('offline');
    const { news } = await repo.loadNextPage();

    expect(news).toHaveLength(3);
    expect(api.fetchNewStoryIds).toHaveBeenCalledTimes(2);
  });
});
