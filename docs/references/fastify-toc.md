## Core Documents
- [Server](./fastify-docs/Server-Fastify.md): Documents the core Fastify API. Includes documentation for the factory function and the object returned by the factory function.
- [Lifecycle](./fastify-docs/Lifecycle-Fastify.md): Explains the Fastify request lifecycle and illustrates where Hooks are available for integrating with it.
- [Routes](./fastify-docs/Routes-Fastify.md): Details how to register routes with Fastify and how Fastify builds and evaluates the routing trie.
- [Request](./fastify-docs/Request-Fastify.md): Details Fastify's request object that is passed into each request handler.
- [Reply](./fastify-docs/Reply-Fastify.md): Details Fastify's response object available to each request handler.
- [Validation and Serialization](./fastify-docs/Validation-and-Serialization.md): Details Fastify's support for validating incoming data and how Fastify serializes data for responses.
- [Plugins](./fastify-docs/Plugins-Fastify.md): Explains Fastify's plugin architecture and API.
- [Encapsulation](./fastify-docs/Encapsulation.md): Explains a core concept upon which all Fastify plugins are built.
- [Decorators](./fastify-docs/Decorators.md): Explains the server, request, and response decorator APIs.
- [Hooks](./fastify-docs/Hooks-Fastify.md): Details the API by which Fastify plugins can inject themselves into Fastify's handling of the request lifecycle.

## Other documents
- [Content Type Parser](./fastify-docs/ContentTypeParser.md): Documents Fastify's default content type parser and how to add support for new content types.
- [Errors](./fastify-docs/Errors-Fastify.md): Details how Fastify handles errors and lists the standard set of errors Fastify generates.
- [Logging](./fastify-docs/Logging-Fastify.md): Details Fastify's included logging and how to customize it.
- [Middleware](./fastify-docs/Middleware.md): Details Fastify's support for Express.js style middleware.
- [TypeScript](./fastify-docs/TypeScript.md): Documents Fastify's TypeScript support and provides recommendations for writing applications in TypeScript that utilize Fastify.
- [Warnings](./fastify-docs/Warnings-Fastify.md): Details the warnings Fastify emits and how to solve them.

## Guides
- [Database](./fastify-guide/Database-Fastify.md): A guide on connecting Fastify to various database engines using official and community plugins.
- [Delay Accepting Requests](./fastify-guide/Delay-Accepting-Requests.md): A practical guide on how to delay serving requests to specific routes until some condition is met in your application. This guide focuses on solving the problem using Hooks, Decorators, and Plugins.
- [Detecting When Clients Abort](./fastify-guide/Detecting-When-Clients-Abort.md): A practical guide on detecting if and when a client aborts a request.
- [Ecosystem](./fastify-guide/Ecosystem-Fastify.md): Lists all core plugins and many known community plugins.
- [Getting Started](./fastify-guide/Getting-Started.md): Introduction tutorial for Fastify. This is where beginners should start.
- [Plugins Guide](./fastify-guide/The-hitchhikers-guide-to-plugins.md): An informal introduction to writing Fastify plugins.
- [Prototype Poisoning](./fastify-guide/Prototype-Poisoning.md): A description of how the prototype poisoning attack works and is mitigated.
- [Recommendations](./fastify-guide/Recommendations.md): Recommendations for how to deploy Fastify into production environments.
- [Serverless](./fastify-guide/Serverless.md): Details on how to deploy Fastify applications in various Function as a Service (FaaS) environments.
- [Testing](./fastify-guide/Testing-Fastify.md): Explains how to write unit tests for Fastify applications.
- [Write Plugin](./fastify-guide/How-to-write-a-good-plugin.md): A set of guidelines for what the Fastify team considers good practices for writing a Fastify plugin.