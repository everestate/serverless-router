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

  dispatch(event, context, callback) {
    const numOfRoutes = this.routes.length;
    let route;
    for (let i = 0; i < numOfRoutes; i++) {
      route = this.routes[i](event);
      if (route) {
        return route.callback(event, context, callback, route.context || {});
      }
    }

    if (this.mismatchHandler) {
      return this.mismatchHandler(event, context, callback);
    }
    return this.constructor.defaultMismatchHandler(event, context, callback);
  }

  static defaultMismatchHandler(_event, _context, callback) {
    return callback(null, {
      statusCode: '404',
      body: JSON.stringify({ message: 'ServerlessRouter can\'t find this route' }),
    });
  }
}

module.exports = ServerlessRouter;
