const BasePlugin = require('../../BasePlugin');


class EvenOddPlugin extends BasePlugin {
  even(callback) {
    return this.appendRoute(0, callback);
  }

  odd(callback) {
    return this.appendRoute(1, callback);
  }

  static match(reminder) {
    return (number) => {
      if (!Number.isInteger(number) || number === 0) { return null; }
      if (number % 2 !== reminder) { return null; }
      return { reminder };
    };
  }

  static get pluginName() { return 'evenodd'; }
}

module.exports = EvenOddPlugin;
