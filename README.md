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
const ServerlessRouter = require('@everestate/serverless-router');
const ServerlessRouterWebPlugin = require('@everestate/serverless-router-plugin-web');

const router = new ServerlessRouter([ServerlessRouterWebPlugin]);

router.web
  .get('/users/:userId/appointments', (event, context, callback) => {
    const appointments = findAppointmentsByUserId(event.pathParameters.userId);
    return callback(null, {
      statusCode: '200',
      body: JSON.stringify({ appointments }),
    });
  })
  .post('/users/:userId/appointments', (event, context, callback) => {
    const { userId } = event.pathParameters;
    const appointment = createAppointment({ ...event.body, userId });
    return callback(null, {
      statusCode: '201',
      body: JSON.stringify({ appointment }),
    });
  })
  .delete('/users/:userId/appointments/:appointmentId', (event, context, callback) => {
    const { appointmentId } = event.pathParameters;
    deleteAppointmentById(appointmentId);
    return callback(null, {
      statusCode: '204',
      body: '',
    });
  });
router.dispatch(event, context, callback);
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

MIT
