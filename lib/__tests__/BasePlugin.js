const BasePlugin = require('../BasePlugin');


describe('BasePlugin', () => {
  describe('countructor(routes)', () =>
    test('initializes .routes property', () => {
      const routes = ['foo', 'bar'];
      const plugin = new BasePlugin(routes);
      expect(plugin.routes).toEqual(routes);
    }));

  describe('appendRoute(...args)', () => {
    const origMatchFn = BasePlugin.match;
    beforeEach(() => { BasePlugin.match = jest.fn(() => 42); });
    afterEach(() => { BasePlugin.match = origMatchFn; });

    test('appends matching route', () => {
      const plugin = new BasePlugin([]);
      plugin.appendRoute('a', 'b', 'c', 'd', 'e', 'f');
      expect(plugin.routes).toEqual([{
        callback: 'f',
        match: 42,
        pluginName: 'baseplugin',
      }]);
      expect(BasePlugin.match).toHaveBeenCalledTimes(1);
      expect(BasePlugin.match).toHaveBeenCalledWith('a', 'b', 'c', 'd', 'e');
    });

    test('responds with instance of the plugin', () => {
      const plugin = new BasePlugin([]);
      expect(plugin.appendRoute()).toEqual(plugin);
    });
  });

  describe('.pluginName', () =>
    test('responds with normalized plugin name', () =>
      expect((class MyPlugin extends BasePlugin {}).pluginName).toEqual('myplugin')));

  describe('static match(subject, callback)', () =>
    test('throws "Not implemented" exception', () =>
      expect(BasePlugin.match).toThrowErrorMatchingSnapshot()));
});
