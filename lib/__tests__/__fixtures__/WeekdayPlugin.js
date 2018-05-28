const BasePlugin = require('../../BasePlugin');


class WeekdayPlugin extends BasePlugin {
  monday(callback) {
    return this.appendRoute(1, callback);
  }

  tuesday(callback) {
    return this.appendRoute(2, callback);
  }

  wednesday(callback) {
    return this.appendRoute(3, callback);
  }

  thursday(callback) {
    return this.appendRoute(4, callback);
  }

  friday(callback) {
    return this.appendRoute(5, callback);
  }

  saturday(callback) {
    return this.appendRoute(6, callback);
  }

  sunday(callback) {
    return this.appendRoute(7, callback);
  }

  static match(dayIndex, callback) {
    return (date) => {
      if (date.getDay() !== dayIndex) { return null; }
      return { callback, context: {} };
    };
  }

  static get pluginName() { return 'weekday'; }
}

module.exports = WeekdayPlugin;
