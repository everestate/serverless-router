class BasePlugin {
  constructor(routes) {
    this.routes = routes;
  }

  appendRoute(...args) {
    this.routes.push(this.constructor.match(...args));
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
