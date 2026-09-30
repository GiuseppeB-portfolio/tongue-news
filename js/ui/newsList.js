/**
 * Funzioni di rendering. Usano textContent (mai innerHTML) perché i titoli
 * arrivano da utenti esterni: così si evita qualsiasi iniezione di HTML.
 */

export function createNewsItem(news) {
  const li = document.createElement('li');
  li.className = 'news-item';

  const title = document.createElement('h2');
  title.className = 'news-item__title';

  const link = document.createElement('a');
  link.className = 'news-item__link';
  link.href = news.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = news.title;
  title.append(link);

  const meta = document.createElement('p');
  meta.className = 'news-item__meta';

  if (news.domain) {
    const domain = document.createElement('span');
    domain.className = 'news-item__domain';
    domain.textContent = news.domain;
    meta.append(domain, ' – ');
  }

  const time = document.createElement('time');
  time.dateTime = new Date(news.time * 1000).toISOString();
  time.textContent = news.date;
  meta.append(time);

  li.append(title, meta);
  return li;
}

export function appendNews(listElement, newsArray) {
  const fragment = document.createDocumentFragment();
  newsArray.forEach((news) => fragment.append(createNewsItem(news)));
  listElement.append(fragment);
}

export function setStatus(statusElement, message, { isError = false } = {}) {
  statusElement.textContent = message;
  statusElement.hidden = !message;
  statusElement.classList.toggle('status--error', isError);
}
