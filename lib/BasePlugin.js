class BasePlugin {
  constructor(routes) {
    this.routes = routes;
  }

  appendRoute(...args) {
    this.routes.push({
      callback: args.pop(),
      match: this.constructor.match(...args),
      pluginName: this.constructor.pluginName,
    });
    return this;
  }

  static get pluginName() {
    return this.name.toLowerCase();
  }

  static match() {
    throw new Error('Not implemented');
  }

  static ctx() {
    return {};
  }
}

module.exports = BasePlugin;
