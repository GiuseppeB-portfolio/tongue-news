# Tongue · Tech news

Applicazione web che mostra le ultime notizie di [Hacker News](https://github.com/HackerNews/API) per il progetto finale del corso JavaScript Advanced. Per ogni notizia si vedono titolo, link e data di pubblicazione. Le notizie si caricano a blocchi di dieci con il pulsante "Load more".

**Prova l'app online:** https://tongue-news-giuseppe.netlify.app/


## Come funziona

All'avvio l'app chiama `newstories.json`, che restituisce circa 500 ID. Prende i primi 10 e, per ciascuno, chiama `item/{id}.json` per ottenere il dettaglio. A ogni click su "Load more" procede con i 10 ID successivi della stessa lista, senza riscaricarla.

## Architettura

Il progetto usa il pattern **Repository** con iniezione delle dipendenze, per separare tre responsabilità:

- `js/api/hackerNewsApi.js` parla con la rete (Axios) e nient'altro.
- `js/repositories/newsRepository.js` conosce il flusso "lista ID, poi dettaglio" e tiene lo stato della paginazione. Riceve l'API dall'esterno, quindi nei test si usa un finto API senza rete.
- `js/ui/newsList.js` e `js/main.js` si occupano solo di DOM ed eventi.

La trasformazione dei dati (formattazione della data, estrazione del dominio, scarto delle notizie rimosse) è in funzioni pure in `js/utils/newsMapper.js`, facili da testare.

```
├── index.html
├── css/style.css
├── img/
├── js/
│   ├── api/
│   ├── repositories/
│   ├── ui/
│   ├── utils/
│   └── main.js
└── tests/
```

## Tecnologie

JavaScript (ES modules), Vite, Vitest, Axios, Lodash (`get`).

## Avvio in locale

```bash
npm install
npm run dev      # server di sviluppo
npm test         # esegue i test con Vitest
npm run build    # build di produzione in dist/
```

## Note di sviluppo

- I titoli arrivano da utenti esterni, quindi nell'interfaccia si usa `textContent` e mai `innerHTML`.
- I post "Ask HN" non hanno un campo `url`: in quel caso il link porta alla discussione su Hacker News.
- Se il dettaglio di una singola notizia fallisce o è stato rimosso, le altre della pagina vengono mostrate comunque (`Promise.allSettled`).
