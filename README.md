# Atlantica

Unopinionated JavaScript HTTP client

## Motivation

I built this package because I did not find one that met the following criteria:

-   Extremely unopinionated; minimum assumuptions are made about the user
-   Chainable methods
-   Return data only
-   Lightweight
-   Easy-to-use methods

## Installation

```sh
npm install atlantica
yarn add atlantica
pnpm add atlantica
```

## Usage

> The following functions should be in an async context

The package returns a function by default. You can use this to initialize a request, and you can specify none, two, or two options.

```js
import atlantica from 'atlanica';
const request = atlantica('http://httpbin.org', options);
```

Using the returned value from this function, you can specify options and send your request

### Query parameters

The query function accepts an object or function. You can use the function to add, set, remove, and clear options
```js
request.query({ query: 'Node.js' }); // => ?query=Node%20js
request.query((q) => q.add({ query: 'Node js', value: null })); // => ?query=Node%20js&value
request.query((q) => q.set('enable')); // => ?query=Node%20js&enable
request.query((q) => q.clear());
request.query((q) => q.set('delete-me', true)); // => ?query=Node%20js&delete-me=true
request.query((q) => q.remove('delete-me')); // => ?query=Node%20js
```
### Headers
The headers function accepts an object or function. You can use the function to add, set, remove, and clear options
```js
request.headers({ 'User-agent': 'triton' });
request.headers((q) => q.add({ 'Authorization': 'Password'})); 
request.headers((q) => q.set('X-Data', 'data')); 
request.headers((q) => q.clear());
request.headers((q) => q.set('delete-me', true));
request.headers((q) => q.remove('delete-me'));

```

### Response types
```js
request.type('full') // Returns a full response object
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

### More options
```js
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
reguest.rootOptions(); // Set root HTTP//HTTPS options 
```

### Send the request
```js
request.send();
```
The following shortcuts set the method, url or path, options, and send the request all in one go. 
```js
request.get('/get', options);
request.get('http://httpbin.org/image/png', options);
request.post('/post', options)
// Supported methods:
// get, head, post, put, delete, connect, options, trace, patch
```
In order to actually read the response data of a request, you must read value returned by the promise. It will come in whatever response type you chose. 
```js
const response = await request.send();
console.log(response)
```

### Options object
```js
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
    rootOptions,
}
```
### Errors

```js
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
