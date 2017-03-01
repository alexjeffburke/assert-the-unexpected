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

  describe('doesNotThrow', function () {
    it('should throw on an unwanted exception', function () {
      expect(function () {
        assert.doesNotThrow(function () { throw new Error('boo'); });
      }, 'to error', 'Got unwanted exception..');
    });

    it('should include a string constaint on an unwanted exception', function () {
      expect(function () {
        assert.doesNotThrow(function () { throw new Error('boo'); }, 'hoo');
      }, 'to error', 'Got unwanted exception. hoo');
    });

    it('should throw the original error on regex mismatch', function () {
      expect(function () {
        assert.doesNotThrow(function () { throw new Error('boo'); }, /hoo/);
      }, 'to error', 'boo');
    });
  });

  describe('ifError', function () {
    it('should pass on no error', function () {
      expect(function () {
        assert.ifError(null);
      }, 'not to error');
    });

    it('should throw on an error', function () {
      var theError = new Error();

      expect(function () {
        assert.ifError(theError);
      }, 'to error', theError);
    });
  });

  describe('throws', function () {
    it('should pass on seeing an exception', function () {
      expect(function () {
        assert.throws(function () { throw new Error('boo'); });
      }, 'not to error');
    });

    it('should throw on a missing expection', function () {
      expect(function () {
        assert.throws(function () {});
      }, 'to error', 'Missing expected exception..');
    });

    it('should throw and include the string constraint', function () {
      expect(function () {
        assert.throws(function () {}, 'hoo');
      }, 'to error', 'Missing expected exception. hoo');
    });

    it('should throw the string constraint on string mismatch', function () {
      expect(function () {
        assert.throws(function () { new Error('boo'); }, 'hoo');
      }, 'to error', 'Missing expected exception. hoo');
    });

    it('should throw the original error on regex mismatch', function () {
      expect(function () {
        assert.throws(function () { throw new Error('boo'); }, /hoo/);
      }, 'to error', 'boo');
    });
  });
});
