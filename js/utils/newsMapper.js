import { get } from 'lodash-es';

const HN_ITEM_URL = 'https://news.ycombinator.com/item?id=';

/**
 * Restituisce gli ID della "pagina" richiesta, senza modificare l'array originale.
 * Se start supera la lunghezza, restituisce un array vuoto.
 */
export function getPageSlice(ids, start, size) {
  return ids.slice(start, start + size);
}

/**
 * Converte un timestamp Unix (secondi) in una data leggibile in italiano.
 * timeZone è parametrizzabile per rendere il risultato deterministico nei test.
 */
export function formatDate(unixSeconds, { locale = 'it-IT', timeZone } = {}) {
  if (typeof unixSeconds !== 'number' || Number.isNaN(unixSeconds)) return '';
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(new Date(unixSeconds * 1000));
}

/** Estrae il dominio da un URL (senza "www."). Stringa vuota se non valido. */
export function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Trasforma la risposta grezza di Hacker News nel modello usato dalla UI.
 * Restituisce null per elementi non mostrabili (rimossi, morti, senza titolo).
 *
 * Nota: i post "Ask HN" non hanno un campo url, quindi si usa come
 * ripiego la pagina della discussione su Hacker News.
 */
export function normalizeItem(raw) {
  if (!raw || raw.deleted || raw.dead) return null;

  const id = get(raw, 'id');
  const title = get(raw, 'title', '').trim();
  if (id == null || !title) return null;

  const url = get(raw, 'url') || `${HN_ITEM_URL}${id}`;

  return {
    id,
    title,
    url,
    domain: getDomain(url),
    time: get(raw, 'time'),
    date: formatDate(get(raw, 'time')),
  };
}
