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

## Contesto: protezione DDoS di Render

Tutto il traffico verso i web service di Render passa attraverso Cloudflare prima di raggiungere l'app. Questo copre automaticamente, senza configurazione:

- **L3/L4** (SYN flood, UDP flood, ICMP flood) — bloccati a livello di rete da Cloudflare
- **L7 volumetrico** (HTTP flood ovvio) — filtrato con euristiche da Cloudflare

**Non coperto da Cloudflare:** attacchi L7 "intelligenti" che sembrano traffico legittimo — credential stuffing, brute-force su endpoint specifici, API abuse, enumerazione di URL. Per questi serve il rate limiting applicativo.

## Alternatives Considered

### Nessun rate limiting
- Rifiutato: Cloudflare non copre gli attacchi L7 mirati — la superficie applicativa rimane esposta

### Rate limiting solo a livello Cloudflare
- Render non offre rate limiting L7 applicativo nativo
- Cloudflare lo offre (WAF), ma richiede un piano a pagamento e configurazione esterna al codice
- Rifiutato: meglio averlo nel codice, portabile su qualsiasi piattaforma e zero dipendenze esterne

## Consequences

**Positivo:**
- Protezione automatica su tutte le route incluse quelle future
- Valore configurabile senza deploy (`RATE_LIMIT_MAX`)
- Store in-memory di default — nessuna dipendenza esterna (Redis) necessaria per un singolo processo

**Trade-off:**
- Lo store in-memory non è condiviso tra istanze: se Render scala a più istanze, ogni istanza ha il proprio contatore. Un utente potrebbe fare `RATE_LIMIT_MAX * N` richieste su N istanze. Per ovviare servirerebbe uno store Redis condiviso — overkill finché non si scala orizzontalmente.
