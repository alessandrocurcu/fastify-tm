## Errors[](#errors "Direct link to Errors")

**Table of contents**

-   [Errors](#errors)
    -   [Error Handling In Node.js](#error-handling-in-nodejs)
        -   [Uncaught Errors](#uncaught-errors)
        -   [Catching Errors In Promises](#catching-errors-in-promises)
    -   [Errors In Fastify](#errors-in-fastify)
        -   [Errors In Input Data](#errors-in-input-data)
        -   [Catching Uncaught Errors In Fastify](#catching-uncaught-errors-in-fastify)
    -   [Errors In Fastify Lifecycle Hooks And A Custom Error Handler](#errors-in-fastify-lifecycle-hooks-and-a-custom-error-handler)
    -   [Fastify Error Codes](#fastify-error-codes)
        -   [FST\_ERR\_NOT\_FOUND](#fst_err_not_found)
            
        -   [FST\_ERR\_OPTIONS\_NOT\_OBJ](#fst_err_options_not_obj)
            
        -   [FST\_ERR\_QSP\_NOT\_FN](#fst_err_qsp_not_fn)
            
        -   [FST\_ERR\_SCHEMA\_CONTROLLER\_BUCKET\_OPT\_NOT\_FN](#fst_err_schema_controller_bucket_opt_not_fn)
            
        -   [FST\_ERR\_SCHEMA\_ERROR\_FORMATTER\_NOT\_FN](#fst_err_schema_error_formatter_not_fn)
            
        -   [FST\_ERR\_AJV\_CUSTOM\_OPTIONS\_OPT\_NOT\_OBJ](#fst_err_ajv_custom_options_opt_not_obj)
            
        -   [FST\_ERR\_AJV\_CUSTOM\_OPTIONS\_OPT\_NOT\_ARR](#fst_err_ajv_custom_options_opt_not_arr)
            
        -   [FST\_ERR\_CTP\_ALREADY\_PRESENT](#fst_err_ctp_already_present)
            
        -   [FST\_ERR\_CTP\_INVALID\_TYPE](#fst_err_ctp_invalid_type)
            
        -   [FST\_ERR\_CTP\_EMPTY\_TYPE](#fst_err_ctp_empty_type)
            
        -   [FST\_ERR\_CTP\_INVALID\_HANDLER](#fst_err_ctp_invalid_handler)
            
        -   [FST\_ERR\_CTP\_INVALID\_PARSE\_TYPE](#fst_err_ctp_invalid_parse_type)
            
        -   [FST\_ERR\_CTP\_BODY\_TOO\_LARGE](#fst_err_ctp_body_too_large)
            
        -   [FST\_ERR\_CTP\_INVALID\_MEDIA\_TYPE](#fst_err_ctp_invalid_media_type)
            
        -   [FST\_ERR\_CTP\_INVALID\_CONTENT\_LENGTH](#fst_err_ctp_invalid_content_length)
            
        -   [FST\_ERR\_CTP\_EMPTY\_JSON\_BODY](#fst_err_ctp_empty_json_body)
            
        -   [FST\_ERR\_CTP\_INVALID\_JSON\_BODY](#fst_err_ctp_invalid_json_body)
            
        -   [FST\_ERR\_CTP\_INSTANCE\_ALREADY\_STARTED](#fst_err_ctp_instance_already_started)
            
        -   [FST\_ERR\_INSTANCE\_ALREADY\_LISTENING](#fst_err_instance_already_listening)
            
        -   [FST\_ERR\_DEC\_ALREADY\_PRESENT](#fst_err_dec_already_present)
            
        -   [FST\_ERR\_DEC\_DEPENDENCY\_INVALID\_TYPE](#fst_err_dec_dependency_invalid_type)
            
        -   [FST\_ERR\_DEC\_MISSING\_DEPENDENCY](#fst_err_dec_missing_dependency)
            
        -   [FST\_ERR\_DEC\_AFTER\_START](#fst_err_dec_after_start)
            
        -   [FST\_ERR\_DEC\_REFERENCE\_TYPE](#fst_err_dec_reference_type)
            
        -   [FST\_ERR\_DEC\_UNDECLARED](#fst_err_dec_undeclared)
            
        -   [FST\_ERR\_HOOK\_INVALID\_TYPE](#fst_err_hook_invalid_type)
            
        -   [FST\_ERR\_HOOK\_INVALID\_HANDLER](#fst_err_hook_invalid_handler)
            
        -   [FST\_ERR\_HOOK\_INVALID\_ASYNC\_HANDLER](#fst_err_hook_invalid_async_handler)
            
        -   [FST\_ERR\_HOOK\_NOT\_SUPPORTED](#fst_err_hook_not_supported)
            
        -   [FST\_ERR\_MISSING\_MIDDLEWARE](#fst_err_missing_middleware)
            
        -   [FST\_ERR\_HOOK\_TIMEOUT](#fst_err_hook_timeout)
            
        -   [FST\_ERR\_LOG\_INVALID\_DESTINATION](#fst_err_log_invalid_destination)
            
        -   [FST\_ERR\_LOG\_INVALID\_LOGGER](#fst_err_log_invalid_logger)
            
        -   [FST\_ERR\_LOG\_INVALID\_LOGGER\_INSTANCE](#fst_err_log_invalid_logger_instance)
            
        -   [FST\_ERR\_LOG\_INVALID\_LOGGER\_CONFIG](#fst_err_log_invalid_logger_config)
            
        -   [FST\_ERR\_LOG\_LOGGER\_AND\_LOGGER\_INSTANCE\_PROVIDED](#fst_err_log_logger_and_logger_instance_provided)
            
        -   [FST\_ERR\_REP\_INVALID\_PAYLOAD\_TYPE](#fst_err_rep_invalid_payload_type)
            
        -   [FST\_ERR\_REP\_RESPONSE\_BODY\_CONSUMED](#fst_err_rep_response_body_consumed)
            
        -   [FST\_ERR\_REP\_READABLE\_STREAM\_LOCKED](#fst_err_rep_readable_stream_locked)
            
        -   [FST\_ERR\_REP\_ALREADY\_SENT](#fst_err_rep_already_sent)
            
        -   [FST\_ERR\_REP\_SENT\_VALUE](#fst_err_rep_sent_value)
            
        -   [FST\_ERR\_SEND\_INSIDE\_ONERR](#fst_err_send_inside_onerr)
            
        -   [FST\_ERR\_SEND\_UNDEFINED\_ERR](#fst_err_send_undefined_err)
            
        -   [FST\_ERR\_BAD\_STATUS\_CODE](#fst_err_bad_status_code)
            
        -   [FST\_ERR\_BAD\_TRAILER\_NAME](#fst_err_bad_trailer_name)
            
        -   [FST\_ERR\_BAD\_TRAILER\_VALUE](#fst_err_bad_trailer_value)
            
        -   [FST\_ERR\_FAILED\_ERROR\_SERIALIZATION](#fst_err_failed_error_serialization)
            
        -   [FST\_ERR\_MISSING\_SERIALIZATION\_FN](#fst_err_missing_serialization_fn)
            
        -   [FST\_ERR\_MISSING\_CONTENTTYPE\_SERIALIZATION\_FN](#fst_err_missing_contenttype_serialization_fn)
            
        -   [FST\_ERR\_REQ\_INVALID\_VALIDATION\_INVOCATION](#fst_err_req_invalid_validation_invocation)
            
        -   [FST\_ERR\_SCH\_MISSING\_ID](#fst_err_sch_missing_id)
            
        -   [FST\_ERR\_SCH\_ALREADY\_PRESENT](#fst_err_sch_already_present)
            
        -   [FST\_ERR\_SCH\_CONTENT\_MISSING\_SCHEMA](#fst_err_sch_content_missing_schema)
            
        -   [FST\_ERR\_SCH\_DUPLICATE](#fst_err_sch_duplicate)
            
        -   [FST\_ERR\_SCH\_VALIDATION\_BUILD](#fst_err_sch_validation_build)
            
        -   [FST\_ERR\_SCH\_SERIALIZATION\_BUILD](#fst_err_sch_serialization_build)
            
        -   [FST\_ERR\_SCH\_RESPONSE\_SCHEMA\_NOT\_NESTED\_2XX](#fst_err_sch_response_schema_not_nested_2xx)
            
        -   [FST\_ERR\_INIT\_OPTS\_INVALID](#fst_err_init_opts_invalid)
            
        -   [FST\_ERR\_FORCE\_CLOSE\_CONNECTIONS\_IDLE\_NOT\_AVAILABLE](#fst_err_force_close_connections_idle_not_available)
            
        -   [FST\_ERR\_DUPLICATED\_ROUTE](#fst_err_duplicated_route)
            
        -   [FST\_ERR\_BAD\_URL](#fst_err_bad_url)
            
        -   [FST\_ERR\_ASYNC\_CONSTRAINT](#fst_err_async_constraint)
            
        -   [FST\_ERR\_INVALID\_URL](#fst_err_invalid_url)
            
        -   [FST\_ERR\_ROUTE\_OPTIONS\_NOT\_OBJ](#fst_err_route_options_not_obj)
            
        -   [FST\_ERR\_ROUTE\_DUPLICATED\_HANDLER](#fst_err_route_duplicated_handler)
            
        -   [FST\_ERR\_ROUTE\_HANDLER\_NOT\_FN](#fst_err_route_handler_not_fn)
            
        -   [FST\_ERR\_ROUTE\_MISSING\_HANDLER](#fst_err_route_missing_handler)
            
        -   [FST\_ERR\_ROUTE\_METHOD\_INVALID](#fst_err_route_method_invalid)
            
        -   [FST\_ERR\_ROUTE\_METHOD\_NOT\_SUPPORTED](#fst_err_route_method_not_supported)
            
        -   [FST\_ERR\_ROUTE\_BODY\_VALIDATION\_SCHEMA\_NOT\_SUPPORTED](#fst_err_route_body_validation_schema_not_supported)
            
        -   [FST\_ERR\_ROUTE\_BODY\_LIMIT\_OPTION\_NOT\_INT](#fst_err_route_body_limit_option_not_int)
            
        -   [FST\_ERR\_HANDLER\_TIMEOUT](#fst_err_handler_timeout)
            
        -   [FST\_ERR\_ROUTE\_HANDLER\_TIMEOUT\_OPTION\_NOT\_INT](#fst_err_route_handler_timeout_option_not_int)
            
        -   [FST\_ERR\_ROUTE\_REWRITE\_NOT\_STR](#fst_err_route_rewrite_not_str)
            
        -   [FST\_ERR\_REOPENED\_CLOSE\_SERVER](#fst_err_reopened_close_server)
            
        -   [FST\_ERR\_REOPENED\_SERVER](#fst_err_reopened_server)
            
        -   [FST\_ERR\_PLUGIN\_VERSION\_MISMATCH](#fst_err_plugin_version_mismatch)
            
        -   [FST\_ERR\_PLUGIN\_CALLBACK\_NOT\_FN](#fst_err_plugin_callback_not_fn)
            
        -   [FST\_ERR\_PLUGIN\_NOT\_VALID](#fst_err_plugin_not_valid)
            
        -   [FST\_ERR\_ROOT\_PLG\_BOOTED](#fst_err_root_plg_booted)
            
        -   [FST\_ERR\_PARENT\_PLUGIN\_BOOTED](#fst_err_parent_plugin_booted)
            
        -   [FST\_ERR\_PLUGIN\_TIMEOUT](#fst_err_plugin_timeout)
            
        -   [FST\_ERR\_PLUGIN\_NOT\_PRESENT\_IN\_INSTANCE](#fst_err_plugin_not_present_in_instance)
            
        -   [FST\_ERR\_PLUGIN\_INVALID\_ASYNC\_HANDLER](#fst_err_plugin_invalid_async_handler)
            
        -   [FST\_ERR\_VALIDATION](#fst_err_validation)
            
        -   [FST\_ERR\_LISTEN\_OPTIONS\_INVALID](#fst_err_listen_options_invalid)
            
        -   [FST\_ERR\_ERROR\_HANDLER\_NOT\_FN](#fst_err_error_handler_not_fn)
            
        -   [FST\_ERR\_ERROR\_HANDLER\_ALREADY\_SET](#fst_err_error_handler_already_set)
            

### Error Handling In Node.js[](#error-handling-in-nodejs "Direct link to Error Handling In Node.js")

#### Uncaught Errors[](#uncaught-errors "Direct link to Uncaught Errors")

In Node.js, uncaught errors can cause memory leaks, file descriptor leaks, and other major production issues. [Domains](https://nodejs.org/en/blog/community/domain-postmortem) were a failed attempt to fix this.

Given that it is not possible to process all uncaught errors sensibly, the best way to deal with them is to [crash](https://nodejs.org/api/process.html#warning-using-uncaughtexception-correctly).

#### Catching Errors In Promises[](#catching-errors-in-promises "Direct link to Catching Errors In Promises")

When using promises, attach a `.catch()` handler synchronously.

### Errors In Fastify[](#errors-in-fastify "Direct link to Errors In Fastify")

Fastify follows an all-or-nothing approach and aims to be lean and optimal. The developer is responsible for ensuring errors are handled properly.

#### Errors In Input Data[](#errors-in-input-data "Direct link to Errors In Input Data")

Most errors result from unexpected input data, so it is recommended to [validate input data against a JSON schema](./Validation-and-Serialization.md).

#### Catching Uncaught Errors In Fastify[](#catching-uncaught-errors-in-fastify "Direct link to Catching Uncaught Errors In Fastify")

Fastify tries to catch as many uncaught errors as possible without hindering performance. This includes:

1.  synchronous routes, e.g. `app.get('/', () => { throw new Error('kaboom') })`
2.  `async` routes, e.g. `app.get('/', async () => { throw new Error('kaboom') })`

In both cases, the error will be caught safely and routed to Fastify's default error handler, resulting in a generic `500 Internal Server Error` response.

To customize this behavior, use [`setErrorHandler`](./Server-Fastify.md#seterrorhandler).

### Errors In Fastify Lifecycle Hooks And A Custom Error Handler[](#errors-in-fastify-lifecycle-hooks-and-a-custom-error-handler "Direct link to Errors In Fastify Lifecycle Hooks And A Custom Error Handler")

From the [Hooks documentation](./Hooks-Fastify.md#manage-errors-from-a-hook):

> If you get an error during the execution of your hook, just pass it to `done()` and Fastify will automatically close the request and send the appropriate error code to the user.

When a custom error handler is defined through [`setErrorHandler`](./Server-Fastify.md#seterrorhandler), it will receive the error passed to the `done()` callback or through other supported automatic error handling mechanisms. If `setErrorHandler` is used multiple times, the error will be routed to the most precedent handler within the error [encapsulation context](./Encapsulation.md). Error handlers are fully encapsulated, so a `setErrorHandler` call within a plugin will limit the error handler to that plugin's context.

The root error handler is Fastify's generic error handler. This error handler will use the headers and status code in the `Error` object, if they exist. The headers and status code will not be automatically set if a custom error handler is provided.

The following should be considered when using a custom error handler:

-   `reply.send(data)` behaves as in [regular route handlers](./Reply-Fastify.md#senddata)
    
    -   objects are serialized, triggering the `preSerialization` lifecycle hook if defined
    -   strings, buffers, and streams are sent to the client with appropriate headers (no serialization)
-   Throwing a new error in a custom error handler will call the parent `errorHandler`.
    
    -   The `onError` hook will be triggered once for the first error thrown
    -   An error will not be triggered twice from a lifecycle hook. Fastify internally monitors error invocation to avoid infinite loops for errors thrown in the reply phases of the lifecycle (those after the route handler)

When using Fastify's custom error handling through [`setErrorHandler`](./Server-Fastify.md#seterrorhandler), be aware of how errors are propagated between custom and default error handlers.

If a plugin's error handler re-throws an error that is not an instance of [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error), it will not propagate to the parent context error handler. Instead, it will be caught by the default error handler. This can be seen in the `/bad` route of the example below.

To ensure consistent error handling, throw instances of `Error`. For example, replace `throw 'foo'` with `throw new Error('foo')` in the `/bad` route to ensure errors propagate through the custom error handling chain as intended. This practice helps avoid potential pitfalls when working with custom error handling in Fastify.

For example:

```
const Fastify = require('fastify')

// Instantiate the framework
const fastify = Fastify({
  logger: true
})

// Register parent error handler
fastify.setErrorHandler((error, request, reply) => {
  reply.status(500).send({ ok: false })
})

fastify.register((app, options, next) => {
  // Register child error handler
  fastify.setErrorHandler((error, request, reply) => {
    throw error
  })

  fastify.get('/bad', async () => {
    // Throws a non-Error type, 'bar'
    throw 'foo'
  })

  fastify.get('/good', async () => {
    // Throws an Error instance, 'bar'
    throw new Error('bar')
  })

  next()
})

// Run the server
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is listening at ${address}
})
```

### Fastify Error Codes[](#fastify-error-codes "Direct link to Fastify Error Codes")

You can access `errorCodes` for mapping:

```
// ESM
import { errorCodes } from 'fastify'

// CommonJS
const errorCodes = require('fastify').errorCodes
```

For example:

```
const Fastify = require('fastify')

// Instantiate the framework
const fastify = Fastify({
  logger: true
})

// Declare a route
fastify.get('/', function (request, reply) {
  reply.code('bad status code').send({ hello: 'world' })
})

fastify.setErrorHandler(function (error, request, reply) {
  if (error instanceof Fastify.errorCodes.FST_ERR_BAD_STATUS_CODE) {
    // Log error
    this.log.error(error)
    // Send error response
    reply.status(500).send({ ok: false })
  } else {
    // Fastify will use parent error handler to handle this
    reply.send(error)
  }
})

// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})
```

Below is a table with all the error codes used by Fastify.

|Code|Description|How to solve|Discussion|
|---|---|---|---|
|FST\_ERR\_NOT\_FOUND|404 Not Found|\-|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_OPTIONS\_NOT\_OBJ|Fastify options wrongly specified.|Fastify options should be an object.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_QSP\_NOT\_FN|QueryStringParser wrongly specified.|QueryStringParser option should be a function.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_SCHEMA\_CONTROLLER\_BUCKET\_OPT\_NOT\_FN|SchemaController.bucket wrongly specified.|SchemaController.bucket option should be a function.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_SCHEMA\_ERROR\_FORMATTER\_NOT\_FN|SchemaErrorFormatter option wrongly specified.|SchemaErrorFormatter option should be a non async function.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_AJV\_CUSTOM\_OPTIONS\_OPT\_NOT\_OBJ|ajv.customOptions wrongly specified.|ajv.customOptions option should be an object.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_AJV\_CUSTOM\_OPTIONS\_OPT\_NOT\_ARR|ajv.plugins option wrongly specified.|ajv.plugins option should be an array.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_CTP\_ALREADY\_PRESENT|The parser for this content type was already registered.|Use a different content type or delete the already registered parser.|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_CTP\_INVALID\_TYPE|`Content-Type` wrongly specified|The `Content-Type` should be a string.|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_CTP\_EMPTY\_TYPE|`Content-Type` is an empty string.|`Content-Type` cannot be an empty string.|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_CTP\_INVALID\_HANDLER|Invalid handler for the content type.|Use a different handler.|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_CTP\_INVALID\_PARSE\_TYPE|The provided parse type is not supported.|Accepted values are `string` or `buffer`.|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_CTP\_BODY\_TOO\_LARGE|The request body is larger than the provided limit.|Increase the limit in the Fastify server instance setting: [bodyLimit](./Server-Fastify.md#bodylimit)|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_CTP\_INVALID\_MEDIA\_TYPE|The received media type is not supported (i.e. there is no suitable `Content-Type` parser for it).|Use a different content type.|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_CTP\_INVALID\_CONTENT\_LENGTH|Request body size did not match `Content-Length`.|Check the request body size and the `Content-Length` header.|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_CTP\_EMPTY\_JSON\_BODY|Body is not valid JSON but content-type is set to `application/json`.|Check if the request body is valid JSON.|[#5925](https://github.com/fastify/fastify/pull/5925)|
|FST\_ERR\_CTP\_INVALID\_JSON\_BODY|Body cannot be empty when content-type is set to `application/json`.|Check the request body.|[#1253](https://github.com/fastify/fastify/pull/1253)|
|FST\_ERR\_CTP\_INSTANCE\_ALREADY\_STARTED|Fastify is already started.|\-|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_INSTANCE\_ALREADY\_LISTENING|Fastify instance is already listening.|\-|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_DEC\_ALREADY\_PRESENT|A decorator with the same name is already registered.|Use a different decorator name.|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_DEC\_DEPENDENCY\_INVALID\_TYPE|The dependencies of decorator must be of type `Array`.|Use an array for the dependencies.|[#3090](https://github.com/fastify/fastify/pull/3090)|
|FST\_ERR\_DEC\_MISSING\_DEPENDENCY|The decorator cannot be registered due to a missing dependency.|Register the missing dependency.|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_DEC\_AFTER\_START|The decorator cannot be added after start.|Add the decorator before starting the server.|[#2128](https://github.com/fastify/fastify/pull/2128)|
|FST\_ERR\_DEC\_REFERENCE\_TYPE|The decorator cannot be a reference type.|Define the decorator with a getter/setter interface or an empty decorator with a hook.|[#5462](https://github.com/fastify/fastify/pull/5462)|
|FST\_ERR\_DEC\_UNDECLARED|An attempt was made to access a decorator that has not been declared.|Declare the decorator before using it.|[#5768](https://github.com/fastify/fastify/pull/5768)|
|FST\_ERR\_HOOK\_INVALID\_TYPE|The hook name must be a string.|Use a string for the hook name.|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_HOOK\_INVALID\_HANDLER|The hook callback must be a function.|Use a function for the hook callback.|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_HOOK\_INVALID\_ASYNC\_HANDLER|Async function has too many arguments. Async hooks should not use the `done` argument.|Remove the `done` argument from the async hook.|[#4367](https://github.com/fastify/fastify/pull/4367)|
|FST\_ERR\_HOOK\_NOT\_SUPPORTED|The hook is not supported.|Use a supported hook.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_MISSING\_MIDDLEWARE|You must register a plugin for handling middlewares, visit [`Middleware`](./Middleware.md) for more info.|Register a plugin for handling middlewares.|[#2014](https://github.com/fastify/fastify/pull/2014)|
|FST\_ERR\_HOOK\_TIMEOUT|A callback for a hook timed out.|Increase the timeout for the hook.|[#3106](https://github.com/fastify/fastify/pull/3106)|
|FST\_ERR\_LOG\_INVALID\_DESTINATION|The logger does not accept the specified destination.|Use a `'stream'` or a `'file'` as the destination.|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_LOG\_INVALID\_LOGGER|The logger should have all these methods: `'info'`, `'error'`, `'debug'`, `'fatal'`, `'warn'`, `'trace'`, `'child'`.|Use a logger with all the required methods.|[#4520](https://github.com/fastify/fastify/pull/4520)|
|FST\_ERR\_LOG\_INVALID\_LOGGER\_INSTANCE|The `loggerInstance` only accepts a logger instance, not a configuration object.|To pass a configuration object, use `'logger'` instead.|[#5020](https://github.com/fastify/fastify/pull/5020)|
|FST\_ERR\_LOG\_INVALID\_LOGGER\_CONFIG|The logger option only accepts a configuration object, not a logger instance.|To pass an instance, use `'loggerInstance'` instead.|[#5020](https://github.com/fastify/fastify/pull/5020)|
|FST\_ERR\_LOG\_LOGGER\_AND\_LOGGER\_INSTANCE\_PROVIDED|You cannot provide both `'logger'` and `'loggerInstance'`.|Please provide only one option.|[#5020](https://github.com/fastify/fastify/pull/5020)|
|FST\_ERR\_REP\_INVALID\_PAYLOAD\_TYPE|Reply payload can be either a `string` or a `Buffer`.|Use a `string` or a `Buffer` for the payload.|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_REP\_RESPONSE\_BODY\_CONSUMED|Using `Response` as reply payload, but the body is being consumed.|Make sure you don't consume the `Response.body`|[#5286](https://github.com/fastify/fastify/pull/5286)|
|FST\_ERR\_REP\_READABLE\_STREAM\_LOCKED|Using `ReadableStream` as reply payload, but locked with another reader.|Make sure you don't call the `Readable.getReader` before sending or release lock with `reader.releaseLock()` before sending.|[#5920](https://github.com/fastify/fastify/pull/5920)|
|FST\_ERR\_REP\_ALREADY\_SENT|A response was already sent.|\-|[#1336](https://github.com/fastify/fastify/pull/1336)|
|FST\_ERR\_REP\_SENT\_VALUE|The only possible value for `reply.sent` is `true`.|\-|[#1336](https://github.com/fastify/fastify/pull/1336)|
|FST\_ERR\_SEND\_INSIDE\_ONERR|You cannot use `send` inside the `onError` hook.|\-|[#1348](https://github.com/fastify/fastify/pull/1348)|
|FST\_ERR\_SEND\_UNDEFINED\_ERR|Undefined error has occurred.|\-|[#2074](https://github.com/fastify/fastify/pull/2074)|
|FST\_ERR\_BAD\_STATUS\_CODE|The status code is not valid.|Use a valid status code.|[#2082](https://github.com/fastify/fastify/pull/2082)|
|FST\_ERR\_BAD\_TRAILER\_NAME|Called `reply.trailer` with an invalid header name.|Use a valid header name.|[#3794](https://github.com/fastify/fastify/pull/3794)|
|FST\_ERR\_BAD\_TRAILER\_VALUE|Called `reply.trailer` with an invalid type. Expected a function.|Use a function.|[#3794](https://github.com/fastify/fastify/pull/3794)|
|FST\_ERR\_FAILED\_ERROR\_SERIALIZATION|Failed to serialize an error.|\-|[#4601](https://github.com/fastify/fastify/pull/4601)|
|FST\_ERR\_MISSING\_SERIALIZATION\_FN|Missing serialization function.|Add a serialization function.|[#3970](https://github.com/fastify/fastify/pull/3970)|
|FST\_ERR\_MISSING\_CONTENTTYPE\_SERIALIZATION\_FN|Missing `Content-Type` serialization function.|Add a serialization function.|[#4264](https://github.com/fastify/fastify/pull/4264)|
|FST\_ERR\_REQ\_INVALID\_VALIDATION\_INVOCATION|Invalid validation invocation. Missing validation function for HTTP part nor schema provided.|Add a validation function.|[#3970](https://github.com/fastify/fastify/pull/3970)|
|FST\_ERR\_SCH\_MISSING\_ID|The schema provided does not have `$id` property.|Add a `$id` property.|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_SCH\_ALREADY\_PRESENT|A schema with the same `$id` already exists.|Use a different `$id`.|[#1168](https://github.com/fastify/fastify/pull/1168)|
|FST\_ERR\_SCH\_CONTENT\_MISSING\_SCHEMA|A schema is missing for the corresponding content type.|Add a schema.|[#4264](https://github.com/fastify/fastify/pull/4264)|
|FST\_ERR\_SCH\_DUPLICATE|Schema with the same attribute already present!|Use a different attribute.|[#1954](https://github.com/fastify/fastify/pull/1954)|
|FST\_ERR\_SCH\_VALIDATION\_BUILD|The JSON schema provided for validation to a route is not valid.|Fix the JSON schema.|[#2023](https://github.com/fastify/fastify/pull/2023)|
|FST\_ERR\_SCH\_SERIALIZATION\_BUILD|The JSON schema provided for serialization of a route response is not valid.|Fix the JSON schema.|[#2023](https://github.com/fastify/fastify/pull/2023)|
|FST\_ERR\_SCH\_RESPONSE\_SCHEMA\_NOT\_NESTED\_2XX|Response schemas should be nested under a valid status code (2XX).|Use a valid status code.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_INIT\_OPTS\_INVALID|Invalid initialization options.|Use valid initialization options.|[#1471](https://github.com/fastify/fastify/pull/1471)|
|FST\_ERR\_FORCE\_CLOSE\_CONNECTIONS\_IDLE\_NOT\_AVAILABLE|Cannot set forceCloseConnections to `idle` as your HTTP server does not support `closeIdleConnections` method.|Use a different value for `forceCloseConnections`.|[#3925](https://github.com/fastify/fastify/pull/3925)|
|FST\_ERR\_DUPLICATED\_ROUTE|The HTTP method already has a registered controller for that URL.|Use a different URL or register the controller for another HTTP method.|[#2954](https://github.com/fastify/fastify/pull/2954)|
|FST\_ERR\_BAD\_URL|The router received an invalid URL.|Use a valid URL.|[#2106](https://github.com/fastify/fastify/pull/2106)|
|FST\_ERR\_ASYNC\_CONSTRAINT|The router received an error when using asynchronous constraints.|\-|[#4323](https://github.com/fastify/fastify/pull/4323)|
|FST\_ERR\_INVALID\_URL|URL must be a string.|Use a string for the URL.|[#3653](https://github.com/fastify/fastify/pull/3653)|
|FST\_ERR\_ROUTE\_OPTIONS\_NOT\_OBJ|Options for the route must be an object.|Use an object for the route options.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_ROUTE\_DUPLICATED\_HANDLER|Duplicate handler for the route is not allowed.|Use a different handler.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_ROUTE\_HANDLER\_NOT\_FN|Handler for the route must be a function.|Use a function for the handler.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_ROUTE\_MISSING\_HANDLER|Missing handler function for the route.|Add a handler function.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_ROUTE\_METHOD\_INVALID|Method is not a valid value.|Use a valid value for the method.|[#4750](https://github.com/fastify/fastify/pull/4750)|
|FST\_ERR\_ROUTE\_METHOD\_NOT\_SUPPORTED|Method is not supported for the route.|Use a supported method.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_ROUTE\_BODY\_VALIDATION\_SCHEMA\_NOT\_SUPPORTED|Body validation schema route is not supported.|Use a different different method for the route.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_ROUTE\_BODY\_LIMIT\_OPTION\_NOT\_INT|`bodyLimit` option must be an integer.|Use an integer for the `bodyLimit` option.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_HANDLER\_TIMEOUT|Request timed out.|Increase the `handlerTimeout` option or optimize the handler.|\-|
|FST\_ERR\_ROUTE\_HANDLER\_TIMEOUT\_OPTION\_NOT\_INT|`handlerTimeout` option must be a positive integer.|Use a positive integer for the `handlerTimeout` option.|\-|
|FST\_ERR\_ROUTE\_REWRITE\_NOT\_STR|`rewriteUrl` needs to be of type `string`.|Use a string for the `rewriteUrl`.|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_REOPENED\_CLOSE\_SERVER|Fastify has already been closed and cannot be reopened.|\-|[#2415](https://github.com/fastify/fastify/pull/2415)|
|FST\_ERR\_REOPENED\_SERVER|Fastify is already listening.|\-|[#2415](https://github.com/fastify/fastify/pull/2415)|
|FST\_ERR\_PLUGIN\_VERSION\_MISMATCH|Installed Fastify plugin mismatched expected version.|Use a compatible version of the plugin.|[#2549](https://github.com/fastify/fastify/pull/2549)|
|FST\_ERR\_PLUGIN\_CALLBACK\_NOT\_FN|Callback for a hook is not a function.|Use a function for the callback.|[#3106](https://github.com/fastify/fastify/pull/3106)|
|FST\_ERR\_PLUGIN\_NOT\_VALID|Plugin must be a function or a promise.|Use a function or a promise for the plugin.|[#3106](https://github.com/fastify/fastify/pull/3106)|
|FST\_ERR\_ROOT\_PLG\_BOOTED|Root plugin has already booted.|\-|[#3106](https://github.com/fastify/fastify/pull/3106)|
|FST\_ERR\_PARENT\_PLUGIN\_BOOTED|Impossible to load plugin because the parent (mapped directly from `avvio`)|\-|[#3106](https://github.com/fastify/fastify/pull/3106)|
|FST\_ERR\_PLUGIN\_TIMEOUT|Plugin did not start in time.|Increase the timeout for the plugin.|[#3106](https://github.com/fastify/fastify/pull/3106)|
|FST\_ERR\_PLUGIN\_NOT\_PRESENT\_IN\_INSTANCE|The decorator is not present in the instance.|\-|[#4554](https://github.com/fastify/fastify/pull/4554)|
|FST\_ERR\_PLUGIN\_INVALID\_ASYNC\_HANDLER|The plugin being registered mixes async and callback styles.|\-|[#5141](https://github.com/fastify/fastify/pull/5141)|
|FST\_ERR\_VALIDATION|The Request failed the payload validation.|Check the request payload.|[#4824](https://github.com/fastify/fastify/pull/4824)|
|FST\_ERR\_LISTEN\_OPTIONS\_INVALID|Invalid listen options.|Check the listen options.|[#4886](https://github.com/fastify/fastify/pull/4886)|
|FST\_ERR\_ERROR\_HANDLER\_NOT\_FN|Error Handler must be a function|Provide a function to `setErrorHandler`.|[#5317](https://github.com/fastify/fastify/pull/5317)|