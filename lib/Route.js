class Route {
  constructor(callback, matcher, pluginName) {
    this.callback = callback;
    this.matcher = matcher;
    this.pluginName = pluginName;
    this.ctx = undefined;
  }

  match(...args) {
    this.ctx = this.matcher(...args);
    return !!this.ctx;
  }

  respond(...args) {
    return this.callback.apply(null, [this.ctx || {}, ...args]);
  }
}

module.exports = Route;
