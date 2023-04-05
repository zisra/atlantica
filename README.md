# [Atlantica](https://www.npmjs.com/package/atlantica)

Simple and easy-to-use requests in Node.js

## Installation

```sh
npm install atlantica
yarn add atlantica
pnpm add atlantica
```

## Usage

> The following functions should be in an async context

The package returns a function by default. You can use this to initialize a request, and you can specify none, one, or two options.

```ts
import atlantica from 'atlanica';
const request = atlantica('http://httpbin.org', options);
```

You can also use the `Request` class instead

```ts
import { Request } from 'atlanica';
const request = new Request('http://httpbin.org', options);
```

Using the returned value from this function (or class), you can specify options and send your request

### Response types

```ts
request.type('full'); // Returns a full response object
/*
{
    httpResponse, // Raw HTTP response
    headers, // Headers
    statusCode, // Status code
    statusMessage, // Status message
    body, // Response body (Use .text or .blob, etc. on .body)
}
*/
request.response('text');
request.response('json'); // Attempts to parse JSON
request.response('buffer');
request.response('blob');
request.response('arrayBuffer');
request.response('stream'); // Can be used to .pipe() response
```

You can also use the exported `ResponseType` enum to specify the response type

```js
import atlantica, { ResponseType } from 'atlanica';
request.response(ResponseType.TEXT);
request.response(ResponseType.JSON);
```

### More options

```ts
request.url('http://httpbin.org/anything'); // Set URL
request.path('anything'); // Set URL
request.query({ query: 'Node.js' }); // Query parameters
request.method('put'); // Set the HTTP method
request.body('body'); // Set data to the server
request.body('body'); // Send JSON data and the content-type to application/json
request.headers({ query: 'Node.js' }); // Set headers
request.timeout(100); // Request timeout
request.maxRedirects(10); // Maximum redirects to follow (default is 5), (set to 0 to disable redirects)
request.maxSize(); // Set the maximum response size in bytes
request.throwErrors() // Whether to throw an error if the response is not within the 200 range
request.compression(true) // Whether to support compression or not
reguest.rootOptions(); // Set root HTTP//HTTPS options
```

### Send the request

```ts
request.send();
```

The following shortcuts set the method, url or path, options, and send the request all in one go

```ts
request.get('/get', options);
request.get('http://httpbin.org/image/png', options);
request.post('/post', options);
// Supported methods:
// get, head, post, put, delete, connect, options, trace, patch
```

In order to actually read the response data of a request, you must read value returned by the promise. It will come in whatever response type you chose.

```ts
const response = await request.send();
console.log(response);
```

### Options object

```ts
{
    url,
    path,
    query,
    method,
    body,
    headers,
    timeout,
    response,
    maxRedirects,
    maxSize,
    throwErrors,
    compression,
    rootOptions,
}
```

### Errors

```ts
new Error('Invalid response type'); // Thrown when when none of the response types are selected
new Error('Timeout reached'); // Thrown when the timeout exceeds the milliseconds the server took to respond.
new Error('Body over maximum size'); // Thrown when the maximum body size is exceeded
new Error('Server aborted request'); // Server aborted request
new Error('No URL provided to the request'); // No valid is provided
new Error('Invalid query'); // Invalid or falsy query
new Error('Invalid headers'); // Invalid or falsy headers
```

## Contribute

Contributions will be appreciated. Follow these steps to contribute:

1. Clone the repository
2. Make your changes
3. Run `npm test` and make sure all the tests passed
4. Run `npm run format` to automatically format all the code using prettier
5. Run `npm lint` to fix code style errors.
6. Create a PR, and wait for a response

