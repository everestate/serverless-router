The router delegates route matching to its plugins. So, routing subject could be represented with anything: object, string or even number. The plugin is responsible to provide the matching machanism.

Let's implement the simple plugin to route numbers as either even or odd ones.

1. We need to declare a new class which is extended from "`BasePlugin`":

    ```javascript
    const BasePlugin = require('@everestate/serverless-router/BasePlugin');

    class EvenOdd extends BasePlugin {
    }
    ```

2. Router expects the plugin to provide one or more public interfaces available to plugin users.

    ```javascript
    class EvenOdd extends BasePlugin {
      even(callback) {
        return this.appendRoute(0, callback);
      }

      odd(callback) {
        return this.appendRoute(1, callback);
      }
    }
    ```

    Each public interface function accepts the user callback and registers the route withing the routing table.

    **`appendRoute`** accepts the routing context (which passed to matching function on dispatch) and user callback.

    **`callback`** is the user callback which is called when router matches the route. The router takes cake of it, so just pass it down.

3. Router expects the plugin to implement "match" function.

    ```javascript
    class EvenOdd extends BasePlugin {
      even(callback) {
        return this.appendRoute(0, callback);
      }

      odd(callback) {
        return this.appendRoute(1, callback);
      }

      static match(remainder) {
        return (number) => {
          if (!Number.isInteger(number) || number === 0) { return null; }
          if (number % 2 !== remainder) { return null; }
          return { remainder };
        };
      }
    }
    ```

    **`match`** expects routing context and returns matching function. Matching function is invoked during dispatch process.
    When all conditions are met (successfull "match"), matching function returns context object. So, it could be an empty object or a class instance.
    When any of the conditions are not met, matching function returns null.

The plugin would be accessible on router's instance by lower-cased class name as

  ```javascript
  const router = new Router([EvenOdd]);
  router.evenodd.even();
  ```

The accessibility alias could be customized with

  ```javascript
  class EvenOdd extends BasePlugin {
    static get pluginName() { return 'foobar'; }
  }
  ```

That's basically it, let's try it out now:

  ```javascript
  const Router = require('./lib/ServerlessRouter');
  const EvenOdd = require('./lib/__tests__/__fixtures__/EvenOddPlugin');

  const router = new Router([EvenOdd]);

  router.evenodd
    .even(() =>
      Promise.resolve('The number is even!'))
    .odd(() =>
      Promise.resolve('The number is odd!'));

  router
    .mismatch(() => Promise.reject(new Error('The number is neither even nor odd.')));

  const test = subj => router
    .dispatch(subj)
    .then(console.log)
    .catch(console.error);

  test(0); // => The number is odd!
  test(1); // => The number is even!
  test(2); // => Error: The number is neither even nor odd.
  ```

There are few more plugin examples you might be interesting in:
  * [`lib/__tests__/__fixtures__/EvenOddPlugin.js`](../lib/__tests__/__fixtures__/EvenOddPlugin.js)
  * [`lib/__tests__/__fixtures__/TypePlugin.js`](../lib/__tests__/__fixtures__/TypePlugin.js)
  * [`lib/__tests__/__fixtures__/WeekdayPlugin.js`](../lib/__tests__/__fixtures__/WeekdayPlugin.js)

Also some real plugin packages:
  * [serverless-router-aws](https://github.com/everestate/serverless-router-aws)
  * [serverless-router-dynamics](https://github.com/everestate/serverless-router-dynamics)
