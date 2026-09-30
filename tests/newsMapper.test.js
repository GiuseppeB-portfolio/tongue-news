import { describe, it, expect } from 'vitest';
import { getPageSlice, formatDate, getDomain, normalizeItem } from '../js/utils/newsMapper.js';

describe('getPageSlice', () => {
  const ids = [1, 2, 3, 4, 5, 6, 7];

  it('restituisce la prima pagina', () => {
    expect(getPageSlice(ids, 0, 3)).toEqual([1, 2, 3]);
  });

  it('restituisce la pagina successiva partendo dal cursore', () => {
    expect(getPageSlice(ids, 3, 3)).toEqual([4, 5, 6]);
  });

  it('restituisce meno elementi nell\'ultima pagina', () => {
    expect(getPageSlice(ids, 6, 3)).toEqual([7]);
  });

  it('restituisce un array vuoto oltre la fine', () => {
    expect(getPageSlice(ids, 10, 3)).toEqual([]);
  });

  it('non modifica l\'array originale', () => {
    getPageSlice(ids, 0, 3);
    expect(ids).toHaveLength(7);
  });
});

describe('formatDate', () => {
  it('formatta un timestamp Unix in italiano', () => {
    // 1627500000 = 28 luglio 2021, 19:20 UTC
    const result = formatDate(1627500000, { timeZone: 'UTC' });
    expect(result).toContain('2021');
    expect(result).toContain('19:20');
  });

  it('restituisce stringa vuota se il valore non è un numero', () => {
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('abc')).toBe('');
    expect(formatDate(NaN)).toBe('');
  });
});

describe('getDomain', () => {
  it('estrae il dominio e rimuove www.', () => {
    expect(getDomain('https://www.example.com/articolo?id=1')).toBe('example.com');
  });

  it('mantiene i sottodomini', () => {
    expect(getDomain('https://blog.example.com/post')).toBe('blog.example.com');
  });

  it('restituisce stringa vuota per URL non validi', () => {
    expect(getDomain('non-un-url')).toBe('');
  });
});

describe('normalizeItem', () => {
  const raw = {
    id: 27933223,
    title: '  Un titolo di prova  ',
    url: 'https://www.example.com/news',
    time: 1627500000,
    by: 'someone',
    type: 'story',
  };

  it('mappa i campi richiesti (titolo, link, data)', () => {
    const result = normalizeItem(raw);
    expect(result).toMatchObject({
      id: 27933223,
      title: 'Un titolo di prova',
      url: 'https://www.example.com/news',
      domain: 'example.com',
      time: 1627500000,
    });
    expect(result.date).not.toBe('');
  });

  it('usa la pagina di discussione HN quando manca l\'url (Ask HN)', () => {
    const { url, domain } = normalizeItem({ ...raw, url: undefined });
    expect(url).toBe('https://news.ycombinator.com/item?id=27933223');
    expect(domain).toBe('news.ycombinator.com');
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['deleted', { ...raw, deleted: true }],
    ['dead', { ...raw, dead: true }],
    ['senza titolo', { ...raw, title: '' }],
    ['senza id', { ...raw, id: undefined }],
  ])('restituisce null per un elemento %s', (_label, input) => {
    expect(normalizeItem(input)).toBeNull();
  });
});
