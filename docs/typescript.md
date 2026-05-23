## Naming conventions
- Use camelCase for variables and parameters
- Use human-readable names like `userName` or `shoppingCart,` make them descriptive and concise. Examples of bad names are `data` and `value`.
- Don't repeat object context in property names. Instead of `employee.employeeName`, use `employee.name`
- Define and use consistent terminology across the code and docs. Avoid synonyms in code (e.g., don’t mix `user`, `account`, `member` if they refer to the same thing). If a site visitor is called a “user” then we should name related variables `currentUser` or `newUser` instead of `currentVisitor` or `newManInTown`.
- A good name should reflects behavior or role (e.g., `getUser`), higher-level intent/context (e.g., `relocateDeviceAccurately`) and usage expectations (e.g., `isUser` for booleans)
- Avoid Hungarian notation unless it communicates clear DOM-related intent (`elHeader`, `$header`)
- Standardize function names using specific verbs
  - `get`: synchronous data access (`getFullName`)
  - `set`: assigning values (`setUser`)
  - `reset`: restore defaults (`resetCounter`)
  - `fetch`: async retrieval (`fetchData`)
  - `remove`: temporary removal (`removeItem`)
  - `delete`: permanent deletion (`deleteUser`)
  - `handle`: event handlers (`handleClick`)
- **Avoid overly long names**: aim for a balance between clarity and conciseness

## General Rules
- Always use ES modules syntax, not CommonJS.
- Prefer `interface extends` over `type` with `&` (intersection) for extending types where appropriate.
- Prefer the `readonly T[]` syntax over `ReadonlyArray<T>` for readonly arrays.
- Avoid `any` and instead use `unknown` whenever possible.
- Use `node:` prefix when working with the built-in modules in Node.
- Prefer functional style over object oriented style.
  - Prefer pure functions with narrow contracts.
  - Functions should have a single responsibility: do one thing and do it well.
  - Functions should read like prose, with if/else/while blocks containing just one or two lines (often function calls). Indent levels should rarely exceed one or two.
  - Avoid chaining more than 1 level deep (a.b().c() is suspicious), provide explicit service/helper methods instead.
