class ServerlessRouter {
  constructor(plugins) {
    this.routes = [];
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

    if (this[pluginName]) {
      throw new Error(`Plugin "${pluginName}" already registered`);
    }
    this[pluginName] = new Plugin(this.routes);
  }

  mismatch(handler) {
    this.mismatchHandler = handler;
  }

  dispatch(...args) {
    const matchingRoute = this.routes.find(r => r.match(...args));

    if (matchingRoute) {
      const ctx = this[matchingRoute.pluginName].constructor.ctx(...args);
      return matchingRoute.callback.apply(null, [ctx, ...args]);
    }

    if (this.mismatchHandler) {
      return this.mismatchHandler(...args);
    }
    throw new Error('ServerlessRouter can\'t find the route');
  }
}

module.exports = ServerlessRouter;
