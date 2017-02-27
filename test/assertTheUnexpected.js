var assert = require('../lib/assertTheUnexpected');
var expect = require('unexpected');

describe('assertTheUnexpected', function () {
  describe('deepEqual', function () {
    it('should compare objects with loosely equal property (lhs)', function () {
      expect(function () {
        assert.deepEqual({ a: 1 }, { a: '1' });
      }, 'not to error');
    });

    it('should compare objects with loosely equal property (rhs)', function () {
      expect(function () {
        assert.deepEqual({ a: '1' }, { a: 1 });
      }, 'not to error');
    });

    it('should compare objects with loosely equal array (lhs)', function () {
      expect(function () {
        assert.deepEqual({ a: [1] }, { a: ['1'] });
      }, 'not to error');
    });

    it('should compare objects with loosely equal array (rhs)', function () {
      expect(function () {
        assert.deepEqual({ a: ['1'] }, { a: [1] });
      }, 'not to error');
    });
  });
});
