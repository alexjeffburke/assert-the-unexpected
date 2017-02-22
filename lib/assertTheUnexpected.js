function isString(x) {
  return typeof x === 'string';
}

function assertTheUnexpected(expect) {
  function AssertionError(err) {
    Error.call(this, err.message);

    this.stack = err.stack;
  }

  AssertionError.prototype = Object.create(Error.prototype);

  function wrappedExpect() {
    var args = Array.prototype.slice.apply(arguments);
    // convert UnexpectedError to AssertionError
    try {
      expect.apply(expect, args);
    } catch (err) {
      throw new AssertionError(err);
    }
  }

  function checkTruthy(value) {
    wrappedExpect(value, 'to be truthy');
  }

  return Object.assign(function (value) {
    checkTruthy(value);
  }, {
    AssertionError: AssertionError,
    deepEqual: function deepEqual(actual, expected) {
      wrappedExpect(actual, 'to equal', expected);
    },
    deepStrictEqual: function deepStrictEqual(actual, expected) {
      wrappedExpect(actual, 'to equal', expected);
    },
    equal: function equal(actual, expected) {
      var a = !actual;
      var b = !expected;

      // undo the null and undefined evaluate equal
      if (!(a && b)) {
        a = actual;
        b = expected;
      }

      if ((Number(a) || Number(b)) && (isString(a) || isString(b))) {
        a = String(a);
        b = String(b);
      }

      wrappedExpect(a, 'to equal', b);
    },
    ifError: function ifError(value) {
      wrappedExpect(value, 'to be falsy').then(function () {
        throw value;
      });
    },
    notEqual: function notEqual(actual, expected) {
      wrappedExpect(actual, 'not to equal', expected);
    },
    notDeepEqual: function notEqual(actual, expected) {
      wrappedExpect(actual, 'not to equal', expected);
    },
    notStrictEqual: function strictEqual(actual, expected) {
      wrappedExpect(actual, 'not to equal', expected);
    },
    ok: function (value) {
      checkTruthy(value);
    },
    strictEqual: function strictEqual(actual, expected) {
      wrappedExpect(actual, 'to equal', expected);
    },
  });
}

module.exports = assertTheUnexpected(require('unexpected'));
