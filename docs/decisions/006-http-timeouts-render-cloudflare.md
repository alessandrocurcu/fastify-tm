# ADR-006: Timeout HTTP calibrati su Render e Cloudflare

## Status
Accepted

## Date
2026-06-12

## Context
Render instrada tutto il traffico attraverso Cloudflare prima di raggiungere l'applicazione. Questo introduce una catena di proxy con timeout propri che devono essere considerati quando si configurano i timeout del server Node.js/Fastify.

Il problema principale riguarda `keepAliveTimeout`: Node.js ha un default di **5 secondi**, mentre Cloudflare mantiene connessioni TCP verso l'origin aperte fino a **900 secondi** (proxy idle timeout). Quando Cloudflare tenta di riutilizzare una connessione keep-alive già chiusa da Node, ottiene un connection-reset e risponde al client con un **502**. Questo causa 502 intermittenti apparentemente casuali, difficili da diagnosticare perché non lasciano traccia nei log applicativi.

Render documenta esplicitamente questo comportamento nella sezione troubleshooting dei propri docs e raccomanda di portare `keepAliveTimeout` a 120 secondi.

## Decision

Configurare Fastify con:

```ts
keepAliveTimeout: 120_000,  // 120s > timeout LB Render (raccomandato da Render docs)
http: {
  headersTimeout: 121_000,  // deve essere strettamente > keepAliveTimeout per Node.js
},
```

`connectionTimeout` e `requestTimeout` non vengono impostati (restano a `0`, disabilitati) perché:
- Cloudflare gestisce già il TCP connection timeout (19 secondi)
- Render supporta richieste fino a **100 minuti** — impostare un `requestTimeout` applicativo più basso interferirebbe con endpoint legittimamente lenti (report, AI inference, export)

## Valori di riferimento della catena Render/Cloudflare

| Layer | Timeout | Valore |
|---|---|---|
| Cloudflare → Origin | TCP connection | 19 s |
| Cloudflare → Origin | Proxy idle (keep-alive) | **900 s** |
| Cloudflare → Origin | Proxy read (default) | 120 s |
| Render | Request timeout massimo | 100 minuti |
| Node.js | `keepAliveTimeout` default | **5 s** ← causa dei 502 |

## Alternatives Considered

### Timeout applicativo su `requestTimeout`
- Protegge da richieste bloccate, ma interferisce con Render che supporta 100 minuti
- Rifiutato: Cloudflare gestisce già questo layer; un timeout applicativo basso causerebbe 5xx su endpoint lenti legittimi

## Consequences

**Positivo:**
- Elimina i 502 intermittenti causati dal mismatch tra keepalive Node.js e Cloudflare
- Allineato alle raccomandazioni ufficiali di Render

**Trade-off:**
- Connessioni idle restano aperte fino a 120 secondi — consumo di file descriptor leggermente più alto rispetto al default
- Se l'app viene deployata su una piattaforma diversa da Render con un proxy idle timeout più basso, i valori potrebbero essere sovradimensionati (ma non causano problemi funzionali)
