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
    test('resolves on match', () => {
      const router = subj();
      router.weekday.saturday((...args) => ({ saturday: true, args }));
      return expect(router.dispatch(new Date('2014-08-16'))).resolves.toEqual({
        saturday: true,
        args: [
          { day: 6, month: 8, year: 2014 },
          new Date('2014-08-16'),
        ],
      });
    });

    test('rejects on mismatch', () => {
      const router = subj();
      router.weekday.saturday((...args) => ({ saturday: true, args }));
      router.mismatch(() => Promise.reject(new Error('My Error on mismatch')));
      return expect(router.dispatch(new Date('2017-09-05'))).rejects.toEqual(new Error('My Error on mismatch'));
    });

    test('respects the order of the routes #1', () => {
      const router = subj();
      router.evenodd.even(() => ({ even: true }));
      router.type.number(() => ({ type: 'number' }));
      return expect(router.dispatch(42)).resolves.toEqual({ even: true }, 42);
    });

    test('respects the order of the routes #2', () => {
      const router = subj();
      router.type.date(() => ({ type: 'date' }));
      router.type.number(() => ({ type: 'number' }));
      router.evenodd.even(() => ({ even: true }));
      return expect(router.dispatch(42)).resolves.toEqual({ type: 'number' }, 42);
    });

    test('rejects with "route not found" error when there are no routes', () =>
      expect(subj().dispatch('42')).rejects.toEqual(new Error('ServerlessRouter can\'t find the route')));

    test('rejects with "route not found" when route is not found', () => {
      const router = subj();
      router.evenodd.even((event, context, callback) => callback(null, { even: true }));
      router.type.number((event, context, callback) => callback(null, { type: 'number' }));
      return expect(subj().dispatch('42')).rejects.toEqual(new Error('ServerlessRouter can\'t find the route'));
    });

    test('resolves when there are no rejecting middleware', () => {
      const router = subj();
      router.use(date => Promise.resolve({ foo: 'bar', dateFoo: date }));
      router.weekday.use(date => Promise.resolve({ baz: 'qux', dateBaz: date }));
      router.weekday.friday((ctx, date) => ({ friday: true, date, ctx }));
      return expect(router.dispatch(new Date('1909-01-01'))).resolves.toEqual({
        friday: true,
        date: new Date('1909-01-01'),
        ctx: {
          foo: 'bar',
          dateFoo: new Date('1909-01-01'),
          baz: 'qux',
          dateBaz: new Date('1909-01-01'),
          day: 5,
          month: 1,
          year: 1909,
        },
      });
    });

    test('rejects when there are rejecting middleware', () => {
      const router = subj();
      router.use(date => Promise.resolve({ foo: 'bar', dateFoo: date }));
      router.weekday.use(() => Promise.reject(new Error('Ooops')));
      router.weekday.friday((ctx, date) => ({ friday: true, date, ctx }));
      return expect(router.dispatch(new Date('1909-01-01'))).rejects.toEqual(new Error('Ooops'));
    });
  });

  describe('mismatch(handler): callback', () => {
    test('sets custom handler to invoke callback when dispatcher can\'t match the route', done =>
      subj()
        .mismatch((event, context, callback) =>
          callback(null, {
            statusCode: '418',
            body: JSON.stringify({ message: 'My custom mismatch handler' }),
          }))
        .dispatch('42', {}, (error, payload) => {
          expect(error).toEqual(null);
          expect(payload).toEqual({
            statusCode: '418',
            body: '{"message":"My custom mismatch handler"}',
          });
          done();
        }));
  });

  describe('mismatch(handler): promise', () => {
    test('sets custom handler to return rejected promise when dispatcher can\'t match the route', () => {
      const router = subj()
        .mismatch(() => Promise.reject(new Error('Error from my custom mismatch handler')));
      return expect(router.dispatch('42')).rejects.toEqual(new Error('Error from my custom mismatch handler'));
    });
  });
});
