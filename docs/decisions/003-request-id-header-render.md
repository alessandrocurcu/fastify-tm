# ADR-003: Use Render's Rndr-Id as Fastify request ID

## Status
Accepted

## Date
2026-06-10

## Context
L'applicazione viene deployata su Render.com. Render inietta l'header `Rndr-Id` in ogni richiesta HTTP pubblica e usa lo stesso valore nei propri HTTP request logs (visibili nel dashboard sotto la voce `requestID`).

Fastify genera di default un `req.id` sequenziale (`req-1`, `req-2`, …) e lo aggiunge a ogni log prodotto da pino. Senza un collegamento esplicito, i log applicativi e i log HTTP di Render usano ID diversi, rendendo impossibile correlare i due flussi.

## Decision
Configurare Fastify con:

```ts
requestIdHeader: 'Rndr-Id'
```

Fastify legge il valore dell'header `Rndr-Id` dalla request in ingresso e lo usa come `req.id`. Tutti i log pino emessi durante quella richiesta porteranno `reqId` uguale al `requestID` nei log di Render.

## Header aggiuntivo: CF-Ray

Render forwarda anche l'header `CF-Ray` di Cloudflare su ogni richiesta pubblica. Viene bindato al child logger di pino in un hook `onRequest`:

```ts
app.addHook('onRequest', async (request) => {
  const cfRay = request.headers['cf-ray'];
  if (cfRay) {
    request.log = request.log.child({ cfRay });
  }
});
```

Questo aggiunge `cfRay` a tutti i log di quella request, permettendo di correlare i log applicativi con i report Cloudflare durante un attacco o un'anomalia. In sviluppo locale l'header non è presente e il guard `if (cfRay)` evita log spurii.

## Consequences

**Positivo:**
- `Rndr-Id` correla log applicativi pino e HTTP request logs di Render
- `CF-Ray` correla i log applicativi con i report Cloudflare — utile per diagnosticare attacchi L7
- In sviluppo locale entrambi i meccanismi fallback gracefully: ID sequenziali, nessun `cfRay`
- Nessuna dipendenza aggiuntiva

**Trade-off:**
- Se l'applicazione viene deployata su una piattaforma diversa da Render che non inietta `Rndr-Id`, il collegamento non funziona — ma il fallback a ID sequenziali garantisce comunque log funzionanti
