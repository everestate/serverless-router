const Route = require('../Route');

describe('Route', () => {
  describe('countructor', () =>
    test('initializes it\'s attributes', () => {
      const route = new Route('callback', 'matcher', 'pluginName');
      expect(route.callback).toEqual('callback');
      expect(route.matcher).toEqual('matcher');
      expect(route.pluginName).toEqual('pluginName');
      expect(route.ctx).toEqual(undefined);
    }));

  describe('.match', () => {
    describe('on match', () =>
      test('sets context and responds with matching result', () => {
        const matcher = jest.fn(() => ({ foo: 'bar' }));
        const route = new Route('callback', matcher, 'pluginName');
        const matchingResult = route.match('baz', 'qux');
        expect(matchingResult).toBe(true);
        expect(route.ctx).toEqual({ foo: 'bar' });
        expect(matcher).toHaveBeenCalledTimes(1);
        expect(matcher).toHaveBeenCalledWith('baz', 'qux');
      }));

    describe('on mismatch', () =>
      test('sets context and responds with matching result', () => {
        const matcher = jest.fn(() => undefined);
        const route = new Route('callback', matcher, 'pluginName');
        const matchingResult = route.match('baz', 'qux');
        expect(matchingResult).toBe(false);
        expect(route.ctx).toEqual(undefined);
        expect(matcher).toHaveBeenCalledTimes(1);
        expect(matcher).toHaveBeenCalledWith('baz', 'qux');
      }));
  });
});
