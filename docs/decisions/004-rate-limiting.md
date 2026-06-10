# ADR-004: Rate limiting con @fastify/rate-limit

## Status
Accepted

## Date
2026-06-10

## Context
L'applicazione espone route HTTP pubbliche senza alcun meccanismo di throttling. Senza rate limiting, un attaccante può:
- Fare scraping massivo delle risorse
- Tentare bruteforce su endpoint che accettano input (es. login, ricerca)
- Enumerare URL tramite 404 a costo zero

## Decision
Registrare `@fastify/rate-limit` globalmente con limite configurabile via variabile d'ambiente `RATE_LIMIT_MAX` (default: 100 richieste/minuto per IP).

Tre scelte specifiche:

**1. Limite globale per IP**
Applicato a tutte le route tramite `global: true` (default). Ogni nuova route è protetta automaticamente senza doverlo ricordare.

**2. `trustProxy: true` su Fastify**
Necessario perché Render è un reverse proxy: senza questa opzione `request.ip` sarebbe l'IP del proxy e il rate limit si applicherebbe a tutti gli utenti come se fossero uno solo.

**3. Rate limit anche sul `setNotFoundHandler`**
Il 404 handler ha il proprio `preHandler: app.rateLimit()` perché senza di esso un attaccante potrebbe enumerare URL inesistenti senza essere throttlato — il limite globale non copre automaticamente i not-found handler.

**4. `RATE_LIMIT_MAX` come env var**
Il valore è esternalizzato in `RATE_LIMIT_MAX` per poter essere regolato per ambiente (es. più restrittivo in produzione, più permissivo in staging) senza modificare il codice.

## Alternatives Considered

### Nessun rate limiting
- Rifiutato: superficie di attacco non accettabile per un'app pubblica

### Rate limiting a livello infrastrutturale (Render / CDN)
- Render non offre rate limiting applicativo nativo sul piano base
- Un CDN (Cloudflare) potrebbe farlo, ma aggiungerebbe una dipendenza esterna non necessaria per questo template
- Rifiutato: meglio averlo nel codice, portabile su qualsiasi piattaforma

## Consequences

**Positivo:**
- Protezione automatica su tutte le route incluse quelle future
- Valore configurabile senza deploy (`RATE_LIMIT_MAX`)
- Store in-memory di default — nessuna dipendenza esterna (Redis) necessaria per un singolo processo

**Trade-off:**
- Lo store in-memory non è condiviso tra istanze: se Render scala a più istanze, ogni istanza ha il proprio contatore. Un utente potrebbe fare `RATE_LIMIT_MAX * N` richieste su N istanze. Per ovviare servirerebbe uno store Redis condiviso — overkill finché non si scala orizzontalmente.
