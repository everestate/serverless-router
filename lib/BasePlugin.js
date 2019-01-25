const Route = require('./Route');

class BasePlugin {
  constructor(routes) {
    this.routes = routes;
    this.middlewares = [];
  }

  appendRoute(...args) {
    this.routes.push(new Route(
      args.pop(), // callback
      this.constructor.match(...args), // matcher
      this.constructor.pluginName, // plugin name
    ));
    return this;
  }

  use(...middlewares) {
    this.middlewares.push(...middlewares);
    return this;
  }

  static get pluginName() {
    return this.name.toLowerCase();
  }

  static match() {
    throw new Error('Not implemented');
  }
}

module.exports = BasePlugin;
