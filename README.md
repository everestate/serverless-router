# @everestate/serverless-router

> Fast, minimalist, pluggable, universal router.

## Installation

```
npm install @everestate/serverless-router --save
```

## Usage

To use `serverless-router` you will need at least one of its plugins.

* [serverless-router-plugin-web](https://github.com/everestate/serverless-router-plugin-web)
* [serverless-router-plugin-dynamodb ](https://github.com/everestate/serverless-router-plugin-dynamodb)
* [serverless-router-plugin-dynamics](https://github.com/everestate/serverless-router-plugin-dynamics)
* and others


```javascript
const Router = require('@everestate/serverless-router');
const Web = require('@everestate/serverless-router-plugin-web');

cosnt userService = require('../services/userService');

function dispatch(event) {
  const router = new Router([Web]);

  router.web
    .get('/users/:id', () =>
      userService.getUserById(event.pathParameters.id)) // returns promise
    .delete('/users/:id', () =>
      userService.deleteUserById(event.pathParameters.id)); // returns promise

  router.mismatch(() => {
    const { path, httpMethod } = event;
    return Promise.reject(new Error(`Unknown route: ${httpMethod} ${path}`));
  });

  return router.dispatch(event);
}

function myLambdaHandler(event, context, callback) {
  return dispatch(event)
    .then(result =>
      callback(null, { statusCode: result.code, body: JSON.stringify({ payload: result.payload }) }))
    .catch(error =>
      callback(null, { statusCode: '500', body: JSON.stringify({ message: error.message }) }));
}
```

### When route is mismatched

By default `serverless-router` will throw `error` on route mismatch.

It's possible to define custom mismatch handler, and it would be called with same arguments `dispatch` was called:

```javascript
router.mismatch((event, context, callback) => {
  const { path, httpMethod } = event;
  return callback(null, {
    statusCode: '404',
    body: JSON.stringify({ message: `ServerlessRouter can't find the route ${httpMethod} ${path}` }),
  });
});
```

## Plugins

There are few implementations for testing purposes you might be interesting in:
  * [`lib/__tests__/__fixtures__/EvenOddPlugin.js`](https://github.com/everestate/serverless-router/blob/master/lib/__tests__/__fixtures__/EvenOddPlugin.js)
  * [`lib/__tests__/__fixtures__/TypePlugin.js`](https://github.com/everestate/serverless-router/blob/master/lib/__tests__/__fixtures__/TypePlugin.js)
  * [`lib/__tests__/__fixtures__/WeekdayPlugin.js`](https://github.com/everestate/serverless-router/blob/master/lib/__tests__/__fixtures__/WeekdayPlugin.js)

@TODO: describe plugin implementation principles

## License

[MIT](./LICENSE)
