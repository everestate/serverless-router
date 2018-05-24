const ServerlessRouter = require('../ServerlessRouter');
const EvenOddPlugin = require('./__fixtures__/EvenOddPlugin');
const WeekdayPlugin = require('./__fixtures__/WeekdayPlugin');
const TypePlugin = require('./__fixtures__/TypePlugin');


const subj = (plugins = [EvenOddPlugin, TypePlugin, WeekdayPlugin]) => new ServerlessRouter(plugins);

describe('ServerlessRouter', () => {
  describe('constructor(plugins)', () => {
    test('initializes .routes property', () =>
      expect(subj().routes).toEqual([]));

    test('initializes .registeredPlugins property', () =>
      expect(subj().registeredPlugins).toMatchObject({
        evenoddplugin: EvenOddPlugin,
        typeplugin: TypePlugin,
        weekdayplugin: WeekdayPlugin,
      }));

    test('initializes plugin instances', () =>
      expect(subj()).toMatchObject({
        evenoddplugin: expect.objectContaining({ routes: [] }),
        typeplugin: expect.objectContaining({ routes: [] }),
        weekdayplugin: expect.objectContaining({ routes: [] }),
      }));

    test('throws error on plugin duplicates', () =>
      expect(() => subj([TypePlugin, WeekdayPlugin, TypePlugin])).toThrowErrorMatchingSnapshot());
  });

  describe('registerPlugin(Plugin)', () => {
    test('registers Plugin\'s instance initialized with .rotues', () => {
      const router = subj([]);
      router.routes.push('foo', 'bar');
      router.registerPlugin(WeekdayPlugin);
      expect(router.registeredPlugins).toMatchObject({ weekdayplugin: WeekdayPlugin });
      expect(router.weekdayplugin.routes).toEqual(['foo', 'bar']);
    });

    test('throws error when plugin already registered', () =>
      expect(() => subj().registerPlugin(EvenOddPlugin)).toThrowErrorMatchingSnapshot());
  });

  describe('dispatch', () => {
    test('respects the order of the routes #1', (done) => {
      const router = subj();
      router.evenoddplugin.even((event, context, callback) => callback(null, { even: true }));
      router.typeplugin.number((event, context, callback) => callback(null, { type: 'number' }));
      router.dispatch(42, {}, (error, payload) => {
        expect(error).toEqual(null);
        expect(payload).toEqual({ even: true });
        done();
      });
    });

    test('respects the order of the routes #2', (done) => {
      const router = subj();
      router.typeplugin.number((event, context, callback) => callback(null, { type: 'number' }));
      router.evenoddplugin.even((event, context, callback) => callback(null, { even: true }));
      router.dispatch(42, {}, (error, payload) => {
        expect(error).toEqual(null);
        expect(payload).toEqual({ type: 'number' });
        done();
      });
    });

    test('invokes mismatching callback when there are no routes', done =>
      subj().dispatch('42', {}, (error, payload) => {
        expect(error).toEqual(null);
        expect(payload).toEqual({
          statusCode: '404',
          body: '{"message":"ServerlessRouter can\'t find this route"}',
        });
        done();
      }));

    test('invokes mismatching callback when route is not found', (done) => {
      const router = subj();
      router.evenoddplugin.even((event, context, callback) => callback(null, { even: true }));
      router.typeplugin.number((event, context, callback) => callback(null, { type: 'number' }));
      router.dispatch('42', {}, (error, payload) => {
        expect(error).toEqual(null);
        expect(payload).toEqual({
          statusCode: '404',
          body: '{"message":"ServerlessRouter can\'t find this route"}',
        });
        done();
      });
    });
  });

  describe('mismatch(handler)', () => {
    test('sets custom handler to call when dispatcher can\'t match the route', (done) => {
      const router = subj();
      router.mismatch((event, context, callback) =>
        callback(null, {
          statusCode: '418',
          body: JSON.stringify({ message: 'My custom mismatch handler' }),
        }));
      router.dispatch('42', {}, (error, payload) => {
        expect(error).toEqual(null);
        expect(payload).toEqual({
          statusCode: '418',
          body: '{"message":"My custom mismatch handler"}',
        });
        done();
      });
    });
  });
});
