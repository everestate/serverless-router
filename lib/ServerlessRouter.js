class ServerlessRouter {
  constructor(plugins) {
    this.routes = [];
    this.registeredPlugins = {};
    this.mismatchHandler = null;

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

    if (this.registeredPlugins[pluginName]) {
      throw new Error(`Plugin "${pluginName}" already registered`);
    }
    this.registeredPlugins[pluginName] = Plugin;
    this[pluginName] = new Plugin(this.routes);
  }

  mismatch(handler) {
    this.mismatchHandler = handler;
  }

  dispatch(...args) {
    const numOfRoutes = this.routes.length;
    let route;
    for (let i = 0; i < numOfRoutes; i++) {
      route = this.routes[i](...args);
      if (route) {
        return route.callback.apply(null, [...args, route.context || {}]);
      }
    }

    if (this.mismatchHandler) {
      return this.mismatchHandler(...args);
    }
    throw new Error('ServerlessRouter can\'t find the route');
  }
}

module.exports = ServerlessRouter;
