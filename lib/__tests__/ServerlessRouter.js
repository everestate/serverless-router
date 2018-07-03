const ServerlessRouter = require('../ServerlessRouter');
const EvenOddPlugin = require('./__fixtures__/EvenOddPlugin');
const WeekdayPlugin = require('./__fixtures__/WeekdayPlugin');
const TypePlugin = require('./__fixtures__/TypePlugin');


const subj = (plugins = [EvenOddPlugin, TypePlugin, WeekdayPlugin]) => new ServerlessRouter(plugins);

describe('ServerlessRouter', () => {
  describe('constructor(plugins)', () => {
    test('initializes .routes property', () =>
      expect(subj().routes).toEqual([]));

    test('initializes plugin instances', () =>
      expect(subj()).toMatchObject({
        evenodd: expect.objectContaining({ routes: [] }),
        type: expect.objectContaining({ routes: [] }),
        weekday: expect.objectContaining({ routes: [] }),
      }));

    test('throws error on plugin duplicates', () =>
      expect(() => subj([TypePlugin, WeekdayPlugin, TypePlugin])).toThrowErrorMatchingSnapshot());
  });

  describe('registerPlugin(Plugin)', () => {
    test('registers Plugin\'s instance initialized with .rotues', () => {
      const router = subj([]);
      router.routes.push('foo', 'bar');
      router.registerPlugin(WeekdayPlugin);
      expect(router.weekday).toBeInstanceOf(WeekdayPlugin);
      expect(router.weekday.routes).toEqual(['foo', 'bar']);
    });

    test('throws error when plugin already registered', () =>
      expect(() => subj().registerPlugin(EvenOddPlugin)).toThrowErrorMatchingSnapshot());
  });

  describe('dispatch', () => {
    test('returns callback value', () => {
      const router = subj();
      router.weekday.saturday((...args) => ({ saturday: true, args }));
      router.mismatch(() => ({ mismatched: true }));
      expect(router.dispatch(new Date('2014-08-16'))).toEqual({
        saturday: true,
        args: [
          {},
          new Date('2014-08-16'),
        ],
      });
      expect(router.dispatch(new Date('2017-09-05'))).toEqual({ mismatched: true });
    });

    test('respects the order of the routes #1', () => {
      const router = subj();
      router.evenodd.even(() => ({ even: true }));
      router.type.number(() => ({ type: 'number' }));
      expect(router.dispatch(42)).toEqual({ even: true });
    });

    test('respects the order of the routes #2', () => {
      const router = subj();
      router.type.date(() => ({ type: 'date' }));
      router.type.number(() => ({ type: 'number' }));
      router.evenodd.even(() => ({ even: true }));
      expect(router.dispatch(42)).toEqual({ type: 'number' });
    });

    test('throws error when there are no routes', () =>
      expect(() => subj().dispatch('42')).toThrowErrorMatchingSnapshot());

    test('throws error when route is not found', () => {
      const router = subj();
      router.evenodd.even((event, context, callback) => callback(null, { even: true }));
      router.type.number((event, context, callback) => callback(null, { type: 'number' }));
      expect(() => subj().dispatch('42')).toThrowErrorMatchingSnapshot();
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
