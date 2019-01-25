class ServerlessRouter {
  constructor(plugins) {
    this.routes = [];
    this.middlewares = [];
    this.mismatchHandler = undefined;

    this.initializePlugins(plugins);
  }

  initializePlugins(plugins) {
    if (!plugins) { return; }

    if (!Array.isArray(plugins)) {
      throw new Error('`plugins` argument should be of type Array');
    }

    plugins.forEach(this.registerPlugin, this);
  }

  registerPlugin(Plugin) {
    const { pluginName } = Plugin;

    if (this[pluginName]) {
      throw new Error(`Plugin "${pluginName}" already registered`);
    }
    this[pluginName] = new Plugin(this.routes);
  }

  use(...middlewares) {
    this.middlewares.push(...middlewares);
    return this;
  }

  mismatch(handler) {
    this.mismatchHandler = handler;
    return this;
  }

  dispatch(...args) {
    const matchingRoute = this.routes.find(r => r.match(...args));

    if (matchingRoute) {
      return this
        .middlewares.concat(this[matchingRoute.pluginName].middlewares)
        .reduce((p, fn) => p.then(res => fn(...args).then(([]).concat.bind(res))), Promise.resolve([]))
        .then((results) => {
          const ctx = results.reduce((acc, obj) => ({ ...acc, ...obj }), {});
          return matchingRoute.respond(ctx, ...args);
        });
    }

    if (this.mismatchHandler) {
      return this.mismatchHandler(...args);
    }
    return Promise.reject(new Error('ServerlessRouter can\'t find the route'));
  }
}

module.exports = ServerlessRouter;
