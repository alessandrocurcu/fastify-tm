# Canonical Logs — cosa significa "fatti bene"Canonical Logs — cosa significa "fatti bene"
Il concetto chiave è: un singolo log event per ogni operazione significativa, con tutto il contesto rilevante dentro.

## Il problema dei log "normali"

Il pattern tipico è questo:

```txt
INFO  User lookup started userId=42
INFO  User found email=foo@bar.com
INFO  Permission check passed role=admin
INFO  Request completed status=200 duration=143ms
```

Quattro righe separate. Per ricostruire cosa è successo devi:
- correlarle tramite timestamp (fragile)
- o tramite un correlation ID che qualcuno ha ricordato di loggare
- o sperare che non ci siano altre richieste interleaved nel mezzo

## Il pattern canonical log
Un singolo evento emesso al termine dell'operazione, con tutto il contesto accumulato durante l'esecuzione:
```json
{
  "level": "info",
  "event": "http_request",
  "duration_ms": 143,
  "status": 200,
  "method": "GET",
  "path": "/companies/:slug",
  "user_id": "42",
  "user_role": "admin",
  "company_id": "varco-123",
  "db_queries": 3,
  "db_duration_ms": 87,
  "cache_hit": false,
  "request_id": "req_abc123"
}
```

Un evento. Tutto dentro. Queryabile su qualsiasi dimensione.