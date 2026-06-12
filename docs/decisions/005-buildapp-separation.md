# ADR-005: Separare la costruzione dell'app dal suo avvio

## Status
Accepted

## Date
2026-06-12

## Context
In origine tutto il codice del server risiedeva in `src/index.ts`: creazione dell'istanza Fastify, registrazione di plugin e route, e chiamata a `app.listen()` — tutto eseguito al top-level all'import del modulo.

Questo rende il codice non testabile senza aprire una porta TCP reale: importare `src/index.ts` in un test significa avviare il server su una porta fissa, con tutti i problemi che ne derivano (conflitti di porta, impossibilità di parallelizzare i test, dipendenza dallo stato di rete).

## Decision
Separare la responsabilità in due file:

- **`src/app.ts`** — esporta `buildApp()`, che costruisce e configura l'istanza Fastify (plugin, route, hook) e la restituisce senza chiamare `listen()`.
- **`src/index.ts`** — entrypoint che chiama `buildApp()`, registra `close-with-grace` e chiama `app.listen()`.

I test importano solo `buildApp()` e usano `app.inject()` per simulare richieste HTTP interamente in memoria, senza aprire porte.

## Consequences

**Positivo:**
- I test possono costruire istanze Fastify isolate con `buildApp()` e usare `app.inject()` — nessuna porta TCP, nessun conflitto, esecuzione in parallelo possibile
- `src/index.ts` resta minimale: solo bootstrap e shutdown
- Il pattern è idiomatico nell'ecosistema Fastify e riconoscibile da chi è abituato al framework

**Trade-off:**
- Due file invece di uno: chi legge il progetto per la prima volta deve capire che `index.ts` è il punto d'ingresso e `app.ts` è il cuore della configurazione
