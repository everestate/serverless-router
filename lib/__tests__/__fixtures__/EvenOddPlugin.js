const BasePlugin = require('../../BasePlugin');


class EvenOddPlugin extends BasePlugin {
  even(callback) {
    return this.appendRoute(0, callback);
  }

  odd(callback) {
    return this.appendRoute(1, callback);
  }

  static match(reminder, callback) {
    return (number) => {
      if (!Number.isInteger(number)) { return null; }
      if (number % 2 !== reminder) { return null; }
      return { callback, context: { reminder } };
    };
  }
}

module.exports = EvenOddPlugin;
