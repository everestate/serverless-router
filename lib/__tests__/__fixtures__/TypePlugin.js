const BasePlugin = require('../../BasePlugin');


function getType(target) {
  return Object.prototype.toString.call(target);
}

class TypePlugin extends BasePlugin {
  array(callback) {
    return this.appendRoute(Array.isArray, callback);
  }

  string(callback) {
    return this.appendRoute('[object String]', callback);
  }

  number(callback) {
    return this.appendRoute(Number.isFinite, callback);
  }

  integer(callback) {
    return this.appendRoute(Number.isInteger, callback);
  }

  float(callback) {
    return this.appendRoute(arg => Number.isFinite(arg) && !Number.isInteger(arg), callback);
  }

  function(callback) {
    return this.appendRoute('[object Function]', callback);
  }

  date(callback) {
    return this.appendRoute('[object Date]', callback);
  }

  static match(subject) {
    let matcher = () => null;
    const subjectType = getType(subject);
    if (subjectType === '[object String]') {
      matcher = target => (getType(target) === subject ? {} : null);
    }
    if (subjectType === '[object Function]') {
      matcher = subject;
    }

    return target => matcher(target);
  }

  static get pluginName() { return 'type'; }
}

module.exports = TypePlugin;
