## Zod

- [Basic usage](./Basic-usage.md): Creating schemas, parsing data, and using inferred types. Punto di partenza.
- [Defining schemas](./Defining-schemas.md): Riferimento completo dell'API — primitivi, oggetti, array, union, refinements, transforms e tutto il resto.
- [Customizing errors](./Customizing-errors.md): Come personalizzare i messaggi di errore a livello globale, per-schema e per-parse.
- [Formatting errors](./Formatting-errors.md): Utilità per convertire `ZodError` in formati leggibili (`flatten`, `format`, `prettify`, `treeify`).
- [JSON Schema](./JSON-Schema.md): Conversione bidirezionale tra schemi Zod e JSON Schema — utile per OpenAPI e Fastify.
- [Metadata and registries](./Metadata-and-registries.md): Associare metadati agli schemi tramite registry — documentazione, code generation, structured outputs AI.
- [Codecs](./Codecs-Zod.md): Trasformazioni bidirezionali (encoding/decoding) composabili — `stringToNumber`, `isoDatetimeToDate`, `jsonCodec` e altri. Introdotto in `zod@4.1`.
