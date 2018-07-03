# Nock Interceptor

Library for intercept Node.js requests

> Node.js 8+ support.

# Quick Start

### Installation

```bash
npm install --save nock-interceptor
```


### How does it Works?

`nock-interceptor` works by overriding Node's `http.request` function. It also overrides `http.ClientRequest` that created internally and returned from `http.request`.

### Usage

You can simply intercept all requests:

```js
const interceptor = require('nock-interceptor');

interceptor.activate((request, reply, passthrough) => {
  // do something
})
```

Information about current request is in `request` object. And you can:
1. reply to request with your data by means of `reply`
2. or pass through request by means of `passthrough`.

### Api

### `interceptor: Object`
```js
const interceptor = require('nock-interceptor');
```

This object has two methods:

1. `activate(callback)`. `callback` has 3 arguments: `callback: (request, reply, passthrough) => void`. 
2. `destroy()` Stop intercepting Node.js http requests.

#### Activate callback arguments:

### `request: Object` 

It is object which has information about current intercepted request.

```js
const interceptor = require('nock-interceptor');

interceptor.activate((request, reply, passthrough) => {
  const { method, headers, body, url, interceptedRequest } = request;
  
  // do something, e.g. reply or passthrough depending on the request params
})
```

- `method: string` — request method.
- `headers: Object` — request headers.
- `body: Buffer` — request body.
- `url: string` — request url.
- `interceptedRequest: InterceptedRequest` — request object. The `InterceptedRequest` class extends original [`http.ClientRequest`](https://nodejs.org/dist/latest-v10.x/docs/api/http.html#http_class_http_clientrequest).

### `reply: ({ status, headers, body }) => void` 

It is function for replying to intercepted request. It is provided 3 arguments for response:

- `status: number` — response status _(default 200)_.
- `headers: Object` — response headers.
- `body: string | Buffer` — response body.

```js
const interceptor = require('nock-interceptor');

interceptor.activate((request, reply, passthrough) => {
  // intercepted all requests and replied with a same response
  reply({body: 'This request has been intercepted'})
})
```

### `passthrough: async () => response` 

It is function for passthrough intercepted request. It returned `response` of request:
- `status: number` — response status.
- `headers: Object` — response headers.
- `body: Buffer` — response body.

```javascript
const interceptor = require('nock-interceptor');

interceptor.activate(async (request, reply, passthrough) => {
  const response = await passthrough();

  // e.g. logging response and request
})
```

# License

MIT