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

    it('should compare date and array', function () {
      expect(function () {
        assert.deepEqual(new Date(), []);
      }, 'not to error');
    });

    it('should compare date and object', function () {
      expect(function () {
        assert.deepEqual(new Date(), {});
      }, 'not to error');
    });

    it('should loosely compare deep objects', function () {
      var now = Date.now();
      var lhs = {
        a: 1,
        b: {
          foo: ['bar', 'baz'],
          quuz: new Date(now),
        },
        c: '3'
      };
      var rhs =  {
        a: '1',
        b: {
          foo: ['bar', 'baz'],
          quuz: new Date(now)
        },
        c: 3
      };

      expect(function () {
        assert.deepEqual(lhs, rhs);
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

  describe('equal', function () {
    it('should compare 0 and "0"', function () {
      expect(function () {
        assert.equal(0, '0');
      }, 'not to error');
    });

    it('should compare 0 and false', function () {
      expect(function () {
        assert.equal(1, true);
      }, 'not to error');
    });

    it('should compare 1 and true', function () {
      expect(function () {
        assert.equal(1, true);
      }, 'not to error');
    });

    it('should compare null with itself', function () {
      expect(function () {
        assert.equal(null, null);
      }, 'not to error');
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

  describe('notEqual', function () {
    it('should throw on matching number and string comparison', function () {
      expect(function () {
        assert.notEqual(0, '0');
      }, 'to error');
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
